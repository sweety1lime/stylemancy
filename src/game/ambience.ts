import dark from '../assets/audio/dark_place.ogg?url';
import { settings } from './settings';
import { soundContext } from './sound';

/*
  Фон под сценками в «Сумраке»: тёмная петля из файла, она плавно появляется и затихает.
  Файл скачивается, только когда звук включён и открыта сценка. Громкость тихая: игра идёт на уроке.
*/

const VOLUME = 0.12;
const FADE_IN = 1.5;
const FADE_OUT = 1;

let loading: Promise<AudioBuffer | null> | undefined;
let playing: { source: AudioBufferSourceNode; gain: GainNode } | undefined;
/** Открыта ли сейчас сценка, которой нужен фон */
let wanted = false;

function load(ctx: AudioContext): Promise<AudioBuffer | null> {
  loading ??= fetch(dark)
    .then((response) => response.arrayBuffer())
    .then((bytes) => ctx.decodeAudioData(bytes))
    // Фон — украшение: если файл не скачался или браузер его не знает, сценка идёт и без него; скачать можно будет в следующий раз
    .catch(() => {
      loading = undefined;
      return null;
    });
  return loading;
}

function fadeOut() {
  if (!playing) return;
  const { source, gain } = playing;
  const ctx = gain.context;
  gain.gain.cancelScheduledValues(ctx.currentTime);
  gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + FADE_OUT);
  source.stop(ctx.currentTime + FADE_OUT + 0.05);
  playing = undefined;
}

async function play() {
  const ctx = soundContext();
  if (!ctx || playing || settings.get().look !== 'noir') return;
  const buffer = await load(ctx);
  // Пока файл грузился, сценку могли закрыть, а звук выключить
  if (!buffer || !wanted || playing || !soundContext()) return;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(VOLUME, ctx.currentTime + FADE_IN);
  source.connect(gain).connect(ctx.destination);
  source.start();
  playing = { source, gain };
}

/** Сценка открылась: если звук включён, начинает играть фон */
export function startAmbience() {
  wanted = true;
  void play();
}

/** Сценка закрылась: фон затихает */
export function stopAmbience() {
  wanted = false;
  fadeOut();
}

// Звук включили или выключили, пока идёт сценка
settings.subscribe(() => {
  if (!wanted) return;
  if (soundContext() && settings.get().look === 'noir') void play();
  else fadeOut();
});
