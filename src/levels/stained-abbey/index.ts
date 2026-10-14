import { defineRegion } from '../../engine/define';
import { spriteCssUrl } from '../../pixel/pixelArt';
import { BRICKS } from '../../pixel/sprites';
import { glassCss } from '../shared/glass';
import { GRID_PROPERTIES } from '../shared/properties';
import grid01 from './grid-01';
import grid02 from './grid-02';
import grid03 from './grid-03';
import grid04 from './grid-04';
import grid05 from './grid-05';
import grid06 from './grid-06';
import grid07 from './grid-07';
import grid08 from './grid-08';
import grid09 from './grid-09';
import sceneCss from './scene.css?raw';

/** Каменная кладка вокруг окна */
const wallCss = `
body {
  background: ${spriteCssUrl(BRICKS)} 0 0 / 48px 24px repeat, #1b1430;
}
`;

export const stainedAbbey = defineRegion({
  id: 'stained-abbey',
  title: 'Витражная обитель',
  topic: 'Grid',
  npc: { name: 'Мастерица Грида', title: 'хранительница Витражной обители', portrait: 'grid' },
  sceneCss: sceneCss + wallCss + glassCss,
  allow: GRID_PROPERTIES,
  allowMessage: 'В Витражной обители действует только магия Grid',
  story: {
    intro: [
      {
        art: 'window',
        text: 'Витражная обитель славилась окнами из цветного стекла: каждое стекло — в своей ячейке, как в волшебной сетке.',
      },
      {
        art: 'shards',
        text: 'Но проклятие Лорда Дефолта добралось и сюда. Стёкла выпали из рам и сползли вниз — одно под другим, как скучные блоки.',
      },
      {
        art: 'mentor',
        speaker: 'grid',
        name: 'Мастерица Грида',
        text: '«Flexbox выстраивает в линию, а витражу нужны колонки и строки сразу. Это магия Grid — сетка. Начнём с первой рамы!»',
      },
    ],
    outro: [
      {
        art: 'window',
        text: 'Витражи снова сияют! Каждое стекло на своём месте, а Большая розетка горит ярче всех.',
      },
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        text: '«Сетки, колонки… Подумаешь! В Зеркальной башне всё зависит от ширины экрана. Там твоя магия рассыплется!»',
      },
      {
        art: 'mentor',
        speaker: 'grid',
        name: 'Мастерица Грида',
        text: '«Магия Grid теперь с тобой. В Зеркальной башне ждёт Провидица Медиа — она научит заклинаниям для экранов любой ширины.»',
      },
    ],
  },
  levels: [grid01, grid02, grid03, grid04, grid05, grid06, grid07, grid08, grid09],
});
