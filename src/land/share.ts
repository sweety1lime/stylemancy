import { LAND_LIMITS } from './model';
import { landDocument, sanitizeLand, type LandImages } from './sanitize';

/*
  Ссылка на землю: вся земля зашита в адрес после «#», сервера нет. Хэш браузер на сервер не отправляет,
  так что страницу ссылки не видит даже хостинг игры.

  Токен: буква формата и данные. «z» — JSON, сжатый deflate и записанный base64url, «p» — тот же JSON без сжатия
  (для браузеров без CompressionStream). Новые форматы получат новые буквы, старые ссылки продолжат открываться.
*/

/** Земля в том виде, в каком она уходит в ссылку */
export interface SharedLand {
  title: string;
  html: string;
  css: string;
  /** Ник автора. Пусто, если игрок не поставил «подписать» */
  nick: string;
}

/** Длиннее этого ссылка может не влезть в сообщение мессенджера: игроку стоит об этом сказать */
export const COMFORT_LINK = 3000;
/** Принимаем токены не длиннее: больше — это уже не земля, а попытка перегрузить страницу */
const MAX_TOKEN = 14000;
/** Сколько байт может развернуться из токена. Ссылка в несколько КБ не должна стать мегабайтами в памяти */
const MAX_UNPACKED = 24000;

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): Uint8Array {
  const binary = atob(text.replaceAll('-', '+').replaceAll('_', '/'));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

/** Прогнать байты через поток сжатия или распаковки; больше limit байт на выходе — ошибка */
async function pump(bytes: Uint8Array, stream: CompressionStream | DecompressionStream, limit: number): Promise<Uint8Array> {
  const writer = stream.writable.getWriter();
  // Поток не отдаёт данные, пока его не читают, поэтому пишем и читаем одновременно
  const writing = writer.write(bytes as Uint8Array<ArrayBuffer>).then(() => writer.close());
  writing.catch(() => undefined);
  const reader = stream.readable.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > limit) {
      await reader.cancel();
      throw new Error('Слишком много данных');
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

/** Земля → токен для ссылки */
export async function encodeLand(land: SharedLand): Promise<string> {
  const payload: Record<string, string | number> = { v: 1, t: land.title, h: land.html, c: land.css };
  if (land.nick) payload.n = land.nick;
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  if (typeof CompressionStream === 'undefined') return `p${toBase64Url(bytes)}`;
  return `z${toBase64Url(await pump(bytes, new CompressionStream('deflate-raw'), MAX_UNPACKED * 2))}`;
}

function text(value: unknown, max: number): string | null {
  return typeof value === 'string' && value.length <= max ? value : null;
}

/** Токен → земля. Всё, что не похоже на землю игры (битая, подделанная, слишком большая ссылка), даёт null */
export async function decodeLand(token: string): Promise<SharedLand | null> {
  if (token.length > MAX_TOKEN || !/^[zp][A-Za-z0-9_-]+$/.test(token)) return null;
  try {
    const packed = fromBase64Url(token.slice(1));
    let bytes: Uint8Array;
    if (token[0] === 'z') {
      if (typeof DecompressionStream === 'undefined') return null;
      bytes = await pump(packed, new DecompressionStream('deflate-raw'), MAX_UNPACKED);
    } else {
      if (packed.length > MAX_UNPACKED) return null;
      bytes = packed;
    }
    const raw: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    if (!raw || typeof raw !== 'object') return null;
    const data = raw as Record<string, unknown>;
    // Чужая ссылка может быть сделана руками: размеры проверяем с запасом, а потом санитайзер всё равно пересоберёт страницу
    const html = text(data.h, LAND_LIMITS.html * 2);
    const css = text(data.c, LAND_LIMITS.css * 2);
    if (html === null || css === null || typeof data.t !== 'string') return null;
    const nick = typeof data.n === 'string' ? data.n : '';
    return {
      title: cleanLine(data.t, LAND_LIMITS.title),
      html,
      css,
      nick: cleanLine(nick, LAND_LIMITS.nick),
    };
  } catch {
    return null;
  }
}

/** Строка для подписи: без переводов строки и служебных знаков, не длиннее max */
export function cleanLine(value: string, max: number): string {
  // Cc — управляющие знаки (в том числе перевод строки), Zl и Zp — разделители строк и абзацев
  return value.replace(/[\p{Cc}\p{Zl}\p{Zp}]+/gu, ' ').trim().slice(0, max);
}

/** Земля файлом .html: запасной путь для очень длинных земель и способ унести работу из игры. Страница та же, что в игре, и такая же безопасная */
export function downloadLand(land: SharedLand, images: LandImages): void {
  const html = landDocument(sanitizeLand(land, images), images, land.title);
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${land.title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'zemlya'}.html`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Адрес страницы просмотра для токена */
export function landUrl(token: string): string {
  return `${window.location.origin}${window.location.pathname}#/shared/${token}`;
}

/** Слишком ли длинна ссылка для мессенджеров */
export function isLongLink(token: string): boolean {
  return token.length > COMFORT_LINK;
}
