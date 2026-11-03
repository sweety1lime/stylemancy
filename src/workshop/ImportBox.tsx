import { useEffect, useMemo, useState, type DragEvent } from 'react';
import type { Sprite } from '../pixel/pixelArt';
import type { Rgba } from './color';
import { framesRowsCode, importImage, readImage, spriteCode } from './png';
import { SpriteView } from './SpriteView';

interface ImportBoxProps {
  /** Спрайт, который перерисовывают; без него — новый спрайт */
  base?: Sprite[];
  /** Путь спрайта в коде: из него получается имя константы */
  name?: string;
  projectColors: Rgba[];
}

/** Порог «подтягивания» нового цвета к цветам игры: меньше 4 рядом почти не отличить */
const SNAP = 4;

/**
 * Разница с исходником: прежние пиксели бледные, изменённые — в новом цвете, стёртые — красные.
 * Знаки ~ и ! не встречаются среди букв палитры, поэтому не путаются с цветами рисунка.
 */
function diffFrames(base: Sprite[], next: Sprite[]): Sprite[] {
  return next.map((frame, f) => ({
    rows: frame.rows.map((row, y) =>
      [...row]
        .map((ch, x) => {
          const before = base[f]?.rows[y]?.[x] ?? '.';
          if (before === ch) return ch === '.' ? '.' : '~';
          return ch === '.' ? '!' : ch;
        })
        .join(''),
    ),
    palette: { ...frame.palette, '~': 'rgba(233, 228, 255, 0.16)', '!': '#ff3b6b' },
  }));
}

function constNameOf(path: string | undefined): string {
  if (!path) return 'NEW_SPRITE';
  return path.split('.')[0];
}

export function ImportBox({ base, name, projectColors }: ImportBoxProps) {
  const [image, setImage] = useState<ImageData | null>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [frames, setFrames] = useState(base?.length ?? 1);
  const [snap, setSnap] = useState(false);
  const [constName, setConstName] = useState(() => constNameOf(name));
  const [over, setOver] = useState(false);
  const [copied, setCopied] = useState('');

  const load = async (file: File | undefined | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError(`${file.name} — не картинка`);
      return;
    }
    try {
      setImage(await readImage(file));
      setFileName(file.name || 'из буфера');
      setError('');
    } catch (problem) {
      setError(`Не удалось прочитать ${file.name}: ${String(problem)}`);
    }
  };

  // Картинку можно вставить из буфера (Ctrl+V): так удобно из Aseprite и скриншотов
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const file = [...(event.clipboardData?.files ?? [])].find((item) => item.type.startsWith('image/'));
      if (file) void load(file);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, []);

  const result = useMemo(
    () => (image ? importImage(image, { frames, base, projectColors, snap: snap ? SNAP : 0 }) : null),
    [image, frames, base, projectColors, snap],
  );
  const diff = useMemo(() => (result && base && result.changed !== null ? diffFrames(base, result.frames) : null), [result, base]);

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setOver(false);
    void load(event.dataTransfer.files[0]);
  };

  const copy = async (label: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1500);
  };

  const width = result ? Math.max(...result.frames[0].rows.map((row) => row.length)) : 1;
  const height = result ? result.frames[0].rows.length : 1;
  const count = result?.frames.length ?? 1;
  const scale = Math.max(2, Math.min(10, Math.floor(200 / Math.max(width, height))));
  // «Разница» показывает все кадры рядом: лента целиком должна влезть в панель (между кадрами 8 px)
  const diffScale = Math.max(1, Math.min(scale, Math.floor((440 - 8 * (count - 1)) / (width * count))));
  const rows = result ? framesRowsCode(result.frames) : '';
  const full = result ? spriteCode(constName, result.frames) : '';

  return (
    <div className="ws-import">
      <label
        className={`ws-drop${over ? ' ws-drop--over' : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        <input type="file" accept="image/png,image/*" onChange={(event) => void load(event.target.files?.[0])} />
        <span>
          {fileName ? `Загружено: ${fileName}` : 'Перетащи PNG сюда, выбери файл или вставь из буфера (Ctrl+V)'}
        </span>
        <span className="ws-hint">Увеличенный PNG (×4, ×8) тоже подойдёт: масштаб определится сам.</span>
      </label>
      {error && <p className="ws-error">{error}</p>}

      <div className="ws-controls">
        <label className="ws-field ws-field--short">
          <span className="ws-label">Кадров в ленте</span>
          <input className="ws-input" type="number" min={1} max={32} value={frames} onChange={(event) => setFrames(Math.max(1, Number(event.target.value) || 1))} />
        </label>
        {!base && (
          <label className="ws-field">
            <span className="ws-label">Имя константы</span>
            <input className="ws-input" value={constName} onChange={(event) => setConstName(event.target.value)} />
          </label>
        )}
        <label className="ws-check">
          <input type="checkbox" checked={snap} onChange={(event) => setSnap(event.target.checked)} />
          Подтянуть новые цвета к цветам игры (разница меньше {SNAP})
        </label>
      </div>

      {result && (
        <>
          {result.warning && <p className="ws-error">{result.warning}</p>}
          <div className="ws-compare">
            {base && (
              <figure className="ws-compare__item">
                <span className="ws-stage">
                  <SpriteView frames={base} scale={scale} />
                </span>
                <figcaption>Было</figcaption>
              </figure>
            )}
            <figure className="ws-compare__item">
              <span className="ws-stage">
                <SpriteView frames={result.frames} scale={scale} />
              </span>
              <figcaption>{base ? 'Стало' : 'Спрайт'}</figcaption>
            </figure>
            {diff && (
              <figure className="ws-compare__item">
                <span className="ws-stage">
                  <SpriteView frames={diff} scale={diffScale} still />
                </span>
                <figcaption>Разница</figcaption>
              </figure>
            )}
          </div>
          <p className="ws-hint">
            Масштаб картинки ×{result.scale}.
            {result.changed !== null && ` Изменено пикселей: ${result.changed}.`}
            {diff && ' На «Разнице» стёртые пиксели красные.'}
          </p>

          {result.newColors.length > 0 && (
            <>
              <h4 className="ws-subtitle">Новые цвета</h4>
              <ul className="ws-new-colors">
                {result.newColors.map((color) => (
                  <li key={color.letter}>
                    <span className="ws-swatch" style={{ background: color.css }} />
                    <b>{color.letter}</b> <code>{color.css}</code>
                    {color.snapped && ' — подтянут к цвету игры'}
                    {!color.snapped && color.nearest && (
                      <>
                        {' '}
                        — ближайший в игре <span className="ws-swatch" style={{ background: color.nearest.css }} /> <code>{color.nearest.css}</code>{' '}
                        (разница {color.nearest.delta.toFixed(1)})
                      </>
                    )}
                  </li>
                ))}
              </ul>
              {base && <p className="ws-hint">Новые буквы нужно добавить в палитру спрайта — она в коде «Целиком».</p>}
            </>
          )}

          <div className="ws-code">
            <div className="ws-code__head">
              <h4 className="ws-subtitle">Строки</h4>
              <button type="button" className="chip" onClick={() => copy('rows', rows)}>
                {copied === 'rows' ? 'Скопировано' : 'Копировать'}
              </button>
            </div>
            <pre>{rows}</pre>
          </div>
          <div className="ws-code">
            <div className="ws-code__head">
              <h4 className="ws-subtitle">Целиком</h4>
              <button type="button" className="chip" onClick={() => copy('full', full)}>
                {copied === 'full' ? 'Скопировано' : 'Копировать'}
              </button>
            </div>
            <pre>{full}</pre>
          </div>
        </>
      )}
    </div>
  );
}
