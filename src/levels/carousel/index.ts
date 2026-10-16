import { defineRegion } from '../../engine/define';
import loop01 from './loop-01';
import loop02 from './loop-02';
import loop03 from './loop-03';
import loop04 from './loop-04';
import loop05 from './loop-05';
import loop06 from './loop-06';
import loop07 from './loop-07';

/** Второй район Лабиринта Решений: циклы while и for, тело цикла, проверки внутри и break. */
export const carousel = defineRegion({
  id: 'carousel',
  title: 'Карусель Циклопа',
  topic: 'while, for и break',
  npc: { name: 'Циклоп Фор', title: 'хозяин Карусели', portrait: 'for' },
  // Сцена — подземелье «Пути героя», своего оформления ей не нужно
  sceneCss: '',
  story: {
    intro: [
      {
        art: 'carousel',
        text: 'Посреди лабиринта крутится Карусель Циклопа: кристаллы катаются по кругу, а коридоры вокруг повторяются, будто отражения в зеркалах.',
      },
      {
        art: 'mentor',
        speaker: 'for',
        name: 'Циклоп Фор',
        text: '«Ого, гость! Я — Циклоп Фор. Одним глазом вижу: ты пишешь одно и то же снова и снова. Хватит переписывать — научу повторять, {name}!»',
      },
      {
        art: 'villain-script',
        speaker: 'default',
        name: 'Лорд Дефолт',
        text: '«Катайся, катайся! Пока ты ходишь по кругу, я доберусь до Сердца лабиринта. Там тебе меня не найти!»',
      },
    ],
    outro: [
      {
        art: 'carousel',
        text: 'Карусель крутится ровно столько, сколько нужно, и останавливается по первому слову.',
      },
      {
        art: 'mentor',
        speaker: 'for',
        name: 'Циклоп Фор',
        text: '«while, for и break — теперь твои, {name}. Цикл повторяет, условие решает, а стоп-кран останавливает. Лорд Дефолт спрятался в Сердце лабиринта — там пригодится всё сразу.»',
      },
    ],
  },
  levels: [loop01, loop02, loop03, loop04, loop05, loop06, loop07],
});
