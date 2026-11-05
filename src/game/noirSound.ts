/*
  Звуки «Сумрака»: мягкие синусы с медленной атакой, шум ветра и эхо зала — вместо 8-битных писков.
  Тоже без звуковых файлов: всё собирается в коде. Громкость тихая — игра идёт на уроке.
*/

/** Общая громкость: синус тише прямоугольной волны 8-битных звуков — подтягиваем до их уровня */
const LOUD = 1.6;

/** Эхо зала: импульс из затухающего шума, собирается один раз */
let hall: ConvolverNode | null = null;
let hallContext: AudioContext | null = null;

function reverb(ctx: AudioContext): ConvolverNode {
  if (hall && hallContext === ctx) return hall;
  const seconds = 2.4;
  const length = Math.floor(ctx.sampleRate * seconds);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3;
  }
  hall = ctx.createConvolver();
  hall.buffer = impulse;
  const wet = ctx.createGain();
  wet.gain.value = 0.55;
  hall.connect(wet).connect(ctx.destination);
  hallContext = ctx;
  return hall;
}

interface VoiceOptions {
  type?: OscillatorType;
  volume?: number;
  attack?: number;
  /** Сколько в эхо: 0 — сухо, 1 — далеко */
  space?: number;
  /** Куда скользит частота к концу ноты */
  glide?: number;
}

/** Нота: мягкое нарастание, долгое затухание, часть звука уходит в эхо */
function voice(ctx: AudioContext, frequency: number, start: number, duration: number, options: VoiceOptions = {}) {
  const { type = 'sine', volume = 0.04, attack = 0.04, space = 0.4, glide } = options;
  const at = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, at);
  if (glide) osc.frequency.exponentialRampToValueAtTime(glide, at + duration);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(volume * LOUD, at + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  if (space > 0) {
    const send = ctx.createGain();
    send.gain.value = space;
    gain.connect(send).connect(reverb(ctx));
  }
  osc.start(at);
  osc.stop(at + duration + 0.05);
}

/** Шум через фильтр: ветер, выдох, дымок. Частота фильтра скользит от from к to */
function breath(ctx: AudioContext, start: number, duration: number, from: number, to: number, volume = 0.05, type: BiquadFilterType = 'bandpass') {
  const at = ctx.currentTime + start;
  const length = Math.floor(ctx.sampleRate * (duration + 0.1));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.Q.value = type === 'bandpass' ? 1.2 : 0.7;
  filter.frequency.setValueAtTime(from, at);
  filter.frequency.exponentialRampToValueAtTime(to, at + duration);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(volume * LOUD, at + duration * 0.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  source.connect(filter).connect(gain);
  gain.connect(ctx.destination);
  const send = ctx.createGain();
  send.gain.value = 0.3;
  gain.connect(send).connect(reverb(ctx));
  source.start(at);
  source.stop(at + duration + 0.1);
}

// Ноты: тёплые, ниже 8-битных
const A3 = 220;
const C4 = 261.63;
const E4 = 329.63;
const G4 = 392;
const A4 = 440;
const C5 = 523.25;
const E5 = 659.25;
const G5 = 783.99;
const C6 = 1046.5;
const E6 = 1318.5;

/** Высота голоса по имени говорящего, от 0.8 до 1.3: список голосов вести не нужно, наставник всегда звучит одинаково */
function pitchOf(speaker = ''): number {
  const hash = [...speaker].reduce((h, char) => (h * 31 + char.charCodeAt(0)) >>> 0, 7);
  return 0.8 + (hash % 100) / 200;
}

export const noirSfx = {
  /** «Сотворить»: вздох ветра и тихий восходящий тон */
  cast(ctx: AudioContext) {
    breath(ctx, 0, 0.5, 400, 2400, 0.05);
    voice(ctx, A3, 0.02, 0.5, { glide: A4, volume: 0.02, attack: 0.15 });
  },
  /** Предмет встал на место: тихий колокольчик в зале */
  placed(ctx: AudioContext) {
    voice(ctx, E6, 0, 0.6, { volume: 0.022, attack: 0.005, space: 0.6 });
    voice(ctx, E6 * 2, 0, 0.3, { volume: 0.006, attack: 0.005, space: 0.6 });
  },
  /** Заклинание сработало: свет возвращается — тёплый аккорд нарастает, сверху звенит искра */
  success(ctx: AudioContext) {
    [C4, G4, C5, E5].forEach((note, i) => voice(ctx, note, 0.1 + i * 0.08, 2.2, { volume: 0.022, attack: 0.5, space: 0.6 }));
    voice(ctx, G5, 0.7, 1.6, { volume: 0.014, attack: 0.3, space: 0.8 });
    voice(ctx, C6, 0.9, 1.4, { volume: 0.01, attack: 0.2, space: 0.9 });
  },
  /** Пшик: глухой выдох и низкий тон, который оседает */
  fail(ctx: AudioContext) {
    breath(ctx, 0.05, 0.6, 900, 180, 0.06, 'lowpass');
    voice(ctx, 147, 0.05, 0.6, { glide: 98, volume: 0.025, attack: 0.03, space: 0.3 });
  },
  /** Буквы в сценке: едва слышное мягкое касание. У каждого говорящего свой тон, у Лорда Дефолта — низкий и глухой */
  blip(ctx: AudioContext, speaker?: string) {
    if (speaker === 'default') {
      voice(ctx, (400 + Math.random() * 80) * 0.45, 0, 0.09, { type: 'triangle', volume: 0.012, attack: 0.008, space: 0.3 });
      return;
    }
    voice(ctx, (400 + Math.random() * 80) * pitchOf(speaker), 0, 0.06, { volume: 0.006, attack: 0.005, space: 0 });
  },
  /** Достижение: три тихих колокольчика в зале */
  achievement(ctx: AudioContext) {
    [G5, C6, E6].forEach((note, i) => voice(ctx, note, i * 0.12, 1.1, { volume: 0.02, attack: 0.005, space: 0.7 }));
  },
  /** Щелчок переключателя: мягкий деревянный стук */
  click(ctx: AudioContext) {
    voice(ctx, 660, 0, 0.05, { volume: 0.02, attack: 0.003, space: 0 });
  },
  /** Проклятие: Лорд Дефолт появляется — низкий гул и тревожный полутон */
  curse(ctx: AudioContext) {
    voice(ctx, 73.4, 0, 2.4, { type: 'triangle', volume: 0.03, attack: 0.4, space: 0.5 });
    voice(ctx, 77.8, 0.1, 2.2, { type: 'triangle', volume: 0.02, attack: 0.5, space: 0.5 });
    breath(ctx, 0, 1.6, 300, 120, 0.03, 'lowpass');
  },
  /** Над спасённой землёй поднимается столб света: звенящий подъём */
  beacon(ctx: AudioContext) {
    [E4, A4, E5].forEach((note, i) => voice(ctx, note, 0.6 + i * 0.25, 1.8, { volume: 0.016, attack: 0.4, space: 0.8 }));
    breath(ctx, 0.6, 1.4, 1200, 5000, 0.02);
  },
};
