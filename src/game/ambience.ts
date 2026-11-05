import cascadia from '../assets/audio/dark_place.ogg?url';
import scriptoria from '../assets/audio/dark_cavern_ambient_002.ogg?url';
import { settings } from './settings';
import { soundContext } from './sound';

/*
  Фон в «Сумраке»: тёмная петля из файла. У Каскадии и Скриптории свои дорожки, они плавно перетекают друг в друга.
  Под картой и уроком фон совсем тихий, под сценкой громче. Файл скачивается, только когда звук включён
  и игрок пришёл на экран с этой дорожкой.
*/

export type Track = 'cascadia' | 'scriptoria';

const FILES: Record<Track, string> = { cascadia, scriptoria };

/** У файлов громкий уровень (RMS около 0,1), поэтому усиление небольшое: под уроком фон едва слышен, под сценкой слышнее */
const SCREEN = 0.1;
const SCENE = 0.25;
const FADE_IN = 1.5;
const FADE_OUT = 1;

const loading = new Map<Track, Promise<AudioBuffer | null>>();
const playing = new Map<Track, { source: AudioBufferSourceNode; gain: GainNode }>();
/** Дорожка экрана, на котором игрок сейчас, и открыта ли сценка поверх него */
let screen: Track | null = null;
let scene = false;

function load(track: Track, ctx: AudioContext): Promise<AudioBuffer | null> {
  let buffer = loading.get(track);
  if (!buffer) {
    buffer = fetch(FILES[track])
      .then((response) => response.arrayBuffer())
      .then((bytes) => ctx.decodeAudioData(bytes))
      // Фон — украшение: если файл не скачался или браузер его не знает, игра идёт и без него; скачать можно будет в следующий раз
      .catch(() => {
        loading.delete(track);
        return null;
      });
    loading.set(track, buffer);
  }
  return buffer;
}

/** Плавно довести громкость дорожки до level за seconds секунд */
function ramp(gain: GainNode, level: number, seconds: number) {
  const now = gain.context.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(level, now + seconds);
}

function fadeOut(track: Track) {
  const item = playing.get(track);
  if (!item) return;
  ramp(item.gain, 0, FADE_OUT);
  item.source.stop(item.gain.context.currentTime + FADE_OUT + 0.05);
  playing.delete(track);
}

/** Привести звук в соответствие с тем, где игрок и что открыто: нужная дорожка играет, остальные затихают */
async function apply() {
  const ctx = soundContext();
  // Сценка на экране без дорожки (например, летопись) идёт под дорожкой Каскадии
  const track = ctx && settings.get().look === 'noir' ? (screen ?? (scene ? 'cascadia' : null)) : null;
  for (const other of [...playing.keys()]) if (other !== track) fadeOut(other);
  if (!ctx || !track) return;

  const current = playing.get(track);
  if (current) {
    ramp(current.gain, scene ? SCENE : SCREEN, FADE_OUT);
    return;
  }
  const buffer = await load(track, ctx);
  // Пока файл грузился, игрок мог уйти на другой экран, а звук — выключиться
  if (!buffer || playing.has(track) || screen !== track || !soundContext()) return;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(scene ? SCENE : SCREEN, ctx.currentTime + FADE_IN);
  source.connect(gain).connect(ctx.destination);
  source.start();
  playing.set(track, { source, gain });
  // Браузер не пускает звук, пока игрок ничего не коснулся; на первом касании или клавише контекст просыпается
  if (ctx.state === 'suspended') {
    const wake = () => void soundContext();
    addEventListener('pointerdown', wake, { once: true });
    addEventListener('keydown', wake, { once: true });
  }
}

/** Игрок перешёл на экран с дорожкой (или с него ушёл, null): фон перетекает на неё */
export function setScreenTrack(track: Track | null) {
  screen = track;
  void apply();
}

/** Сценка открылась: если звук включён, фон становится громче */
export function startAmbience() {
  scene = true;
  void apply();
}

/** Сценка закрылась: фон снова тихий */
export function stopAmbience() {
  scene = false;
  void apply();
}

// Звук включили или выключили, вид сменили
settings.subscribe(() => void apply());
