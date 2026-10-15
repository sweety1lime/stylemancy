import { settings } from './settings';

/*
  8-битные звуки, собранные прямо в коде: генератор волны и огибающая громкости.
  Никаких звуковых файлов — как и вся графика игры. Звук играет, только если включён в настройках.
*/

let context: AudioContext | null = null;

function audio(): AudioContext | null {
  if (!settings.get().sound || typeof AudioContext === 'undefined') return null;
  context ??= new AudioContext();
  if (context.state === 'suspended') void context.resume();
  return context;
}

/** Одна нота: частота (Гц), начало и длительность (с), форма волны и громкость. */
function tone(frequency: number, start: number, duration: number, type: OscillatorType = 'square', volume = 0.05) {
  const ctx = audio();
  if (!ctx) return;
  const at = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, at);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(volume, at + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(at);
  osc.stop(at + duration + 0.05);
}

/** Нота со скольжением частоты — для «вжух» и «пшик». */
function slide(from: number, to: number, start: number, duration: number, type: OscillatorType, volume: number) {
  const ctx = audio();
  if (!ctx) return;
  const at = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, at);
  osc.frequency.exponentialRampToValueAtTime(to, at + duration);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(volume, at + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(at);
  osc.stop(at + duration + 0.05);
}

// Ноты: до, ми, соль, до второй октавы и выше
const C5 = 523.25;
const E5 = 659.25;
const G5 = 783.99;
const C6 = 1046.5;
const E6 = 1318.5;
const G6 = 1568;

export const sfx = {
  /** «Сотворить»: короткий магический взлёт */
  cast() {
    slide(300, 1200, 0, 0.18, 'triangle', 0.05);
  },
  /** Предмет встал на место */
  placed() {
    tone(E6, 0, 0.07, 'square', 0.035);
    tone(G6, 0.05, 0.1, 'square', 0.035);
  },
  /** Заклинание сработало: фанфара */
  success() {
    [C5, E5, G5, C6].forEach((note, i) => tone(note, 0.12 + i * 0.09, 0.2, 'square', 0.045));
    tone(G6, 0.5, 0.45, 'triangle', 0.04);
  },
  /** Не вышло: заклинание «пшикнуло» */
  fail() {
    slide(330, 110, 0.1, 0.35, 'sawtooth', 0.03);
  },
  /** Буквы в сценке — едва слышное «бормотание» */
  blip() {
    tone(560 + Math.random() * 120, 0, 0.03, 'square', 0.012);
  },
  /** Достижение: колокольчик */
  achievement() {
    [G5, C6, E6].forEach((note, i) => tone(note, i * 0.07, 0.25, 'triangle', 0.04));
  },
  /** Щелчок переключателя */
  click() {
    tone(880, 0, 0.04, 'square', 0.03);
  },
};
