import { defineRegion } from '../../engine/define';
import { spriteCssUrl } from '../../pixel/pixelArt';
import { GRAY_BRICKS } from '../../pixel/sprites';
import { LAYOUT_PROPERTIES } from '../shared/properties';
import citadel01 from './citadel-01';
import citadel02 from './citadel-02';
import sceneCss from './scene.css?raw';

/** Серая кладка: в цитадели нет ни одного стиля, кроме стилей по умолчанию */
const wallCss = `
body {
  background: ${spriteCssUrl(GRAY_BRICKS)} 0 0 / 48px 24px repeat, #1c1c24;
}
`;

export const defaultCitadel = defineRegion({
  id: 'default-citadel',
  title: 'Цитадель Лорда Дефолта',
  topic: 'Финал',
  npc: { name: 'Лорд Дефолт', title: 'повелитель стилей по умолчанию', portrait: 'default' },
  sceneCss: sceneCss + wallCss,
  allow: LAYOUT_PROPERTIES,
  allowMessage: 'В цитадели действует магия Flexbox и Grid',
  story: {
    intro: [
      {
        art: 'citadel',
        text: 'На вершине Зеркальной башни открылась Цитадель Лорда Дефолта: серые стены, Times New Roman и блоки друг под другом. Это страница, у которой отняли все стили.',
      },
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        text: '«Здесь тебе никто не поможет. Только ты — и мои стили по умолчанию!»',
      },
      {
        art: 'mentor',
        speaker: 'media',
        name: 'Провидица Медиа',
        text: '«Он ошибается: всё, что нужно, ты уже знаешь. Flexbox, Grid и медиазапросы — верни цитадели стили!»',
      },
    ],
    outro: [
      {
        art: 'kingdom',
        text: 'Цитадель засияла красками: шапка, меню, тронный зал — всё на своих местах. Острова парят, витражи горят, а зеркала показывают ровные раскладки на любом экране.',
      },
      {
        art: 'crown',
        speaker: 'flex',
        name: 'Магистр Флекс',
        text: '«Парящие земли свободны! Держи Руну Раскладки, {name}: Flexbox, Grid и медиазапросы теперь с тобой. Грамота — в Летописи героя.»',
      },
      // Пока где-то держится проклятие, Лорд Дефолт сбегает туда. Когда спасено всё — начинается общий финал
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        when: { allDone: false },
        text: '«Цитадель пала… Но я ещё не побеждён: моё проклятие держится {cursed}. Встретимся там, {name}!»',
      },
      {
        art: 'mentor',
        speaker: 'flex',
        name: 'Магистр Флекс',
        when: { allDone: false, next: true },
        text: '«Следующая остановка — {next}. Удачи, {name}!»',
      },
      {
        art: 'mentor',
        speaker: 'flex',
        name: 'Магистр Флекс',
        when: { allDone: false, next: false },
        text: '«Остальные земли пока в тумане. Он рассеется, когда учитель их откроет, — а пока загляни в гримуар.»',
      },
    ],
  },
  levels: [citadel01, citadel02],
});
