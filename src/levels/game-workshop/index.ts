import { defineRegion } from '../../engine/define';
import { mechanismCss } from '../shared/mechanism';
import game01 from './game-01';
import game02 from './game-02';
import game03 from './game-03';
import game04 from './game-04';

/** Третий район Города Механизмов: свои мини-игры — кликер и загадка Сфинкса. Готовую игру можно скачать. */
export const gameWorkshop = defineRegion({
  id: 'game-workshop',
  title: 'Мастерская игр',
  topic: 'мини-игры: кликер и загадка',
  npc: { name: 'Мастер Игр Тик-Так', title: 'заводной игродел', portrait: 'tick' },
  sceneCss: mechanismCss,
  story: {
    intro: [
      {
        art: 'arcade',
        text: 'Под самой большой шестернёй Города прячется Мастерская игр: автоматы с кнопками, табло и звонкими монетами. Все экраны тёмные.',
      },
      {
        art: 'mentor',
        speaker: 'tick',
        name: 'Мастер Игр Тик-Так',
        text: '«Тик-так, тик-так! Я — Мастер Игр. Ты уже знаешь всё, из чего собирают игры, {name}. Соберём парочку — и заберёшь их с собой.»',
      },
      {
        art: 'villain-script',
        speaker: 'default',
        name: 'Лорд Дефолт',
        text: '«Игры? По умолчанию страница скучна и неподвижна. Никаких монет, никаких загадок!»',
      },
    ],
    outro: [
      {
        art: 'arcade',
        text: 'Автоматы мигают, монеты звенят, Сфинкс загадывает число за числом. Твои игры теперь можно скачать и показать кому угодно.',
      },
      {
        art: 'mentor',
        speaker: 'tick',
        name: 'Мастер Игр Тик-Так',
        text: '«Ты не просто чинишь механизмы, {name}, — ты их придумываешь. Остался последний: Лорд Дефолт заперся в своём Логове. Его сила — поведение по умолчанию. Пора её отменить.»',
      },
    ],
  },
  levels: [game01, game02, game03, game04],
});
