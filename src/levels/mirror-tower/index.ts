import { defineRegion } from '../../engine/define';
import { crystalsCss } from '../shared/crystals';
import { glassCss } from '../shared/glass';
import { LAYOUT_PROPERTIES } from '../shared/properties';
import { skyBackground, twinkleCss } from '../shared/sky';
import mq01 from './mq-01';
import mq02 from './mq-02';
import mq03 from './mq-03';
import mq04 from './mq-04';
import sceneCss from './scene.css?raw';

/** Небо за окнами башни — холоднее и синее, чем над островами */
const skyCss = `
body {
  background:
    ${skyBackground('linear-gradient(180deg, #0b1020 0 22%, #10162e 22% 44%, #151d3d 44% 64%, #1b254d 64% 82%, #222e5e 82% 100%)')};
}
`;

export const mirrorTower = defineRegion({
  id: 'mirror-tower',
  title: 'Зеркальная башня',
  topic: 'Адаптив',
  npc: { name: 'Провидица Медиа', title: 'хранительница Зеркальной башни', portrait: 'media' },
  sceneCss: sceneCss + skyCss + twinkleCss + crystalsCss + glassCss,
  allow: LAYOUT_PROPERTIES,
  allowMessage: 'В Зеркальной башне действует магия Flexbox и Grid',
  story: {
    intro: [
      {
        art: 'mirrors',
        text: 'В Зеркальной башне каждое зеркало показывает зал по-своему: узкое — как экран телефона, широкое — как большой монитор.',
      },
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        text: '«Раскладка, красивая на мониторе, на телефоне ломается. А на телефонах сидят все! Ха!»',
      },
      {
        art: 'mentor',
        speaker: 'media',
        name: 'Провидица Медиа',
        text: '«Медиазапросы — заклинания, которые срабатывают только на нужной ширине экрана. Смотри в оба зеркала сразу, и начнём.»',
      },
    ],
    outro: [
      {
        art: 'mirrors',
        text: 'Все зеркала показывают ровный зал — на любой ширине экрана.',
      },
      {
        art: 'mentor',
        speaker: 'media',
        name: 'Провидица Медиа',
        text: '«Теперь ты видишь то, что прятал Лорд Дефолт: его цитадель на вершине. Flexbox, Grid и медиазапросы с тобой — пора снять проклятие.»',
      },
    ],
  },
  levels: [mq01, mq02, mq03, mq04],
});
