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
        text: 'Проклятие снято! Цитадель сияет красками, острова парят, витражи горят, а зеркала показывают ровные раскладки на любом экране.',
      },
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        text: '«Ладно-ладно… Со стилями и правда красивее. Но я вернусь — как только кто-нибудь забудет подключить CSS!»',
      },
      {
        art: 'crown',
        text: 'Каскадия спасена! Магия Flexbox, Grid и адаптива теперь с тобой. Загляни в гримуар — там записаны все освоенные заклинания.',
      },
    ],
  },
  levels: [citadel01, citadel02],
});
