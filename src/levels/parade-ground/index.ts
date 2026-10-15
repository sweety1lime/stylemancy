import { defineRegion } from '../../engine/define';
import { dustCss, fortressCss, SAND_WALL } from '../shared/fortress';
import { DISPLAY_PROPERTIES } from '../shared/properties';
import disp01 from './disp-01';
import disp02 from './disp-02';
import disp03 from './disp-03';
import disp04 from './disp-04';
import disp05 from './disp-05';
import sceneCss from './scene.css?raw';

/** Песчаная кладка вокруг плаца */
const wallCss = `
body {
  background: ${SAND_WALL};
}
`;

export const paradeGround = defineRegion({
  id: 'parade-ground',
  title: 'Плац',
  topic: 'display',
  npc: { name: 'Сержант Дисплей', title: 'командир плаца', portrait: 'display' },
  sceneCss: sceneCss + wallCss + fortressCss + dustCss,
  allow: DISPLAY_PROPERTIES,
  allowMessage: 'На плацу действует магия display, visibility и блочной модели',
  story: {
    intro: [
      {
        art: 'fortress',
        text: 'За Казармами — плац. Здесь блоки учатся вставать в строй: кто с новой строки, кто в одну строчку, а кто и вовсе в засаде.',
      },
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        text: '«Строй? Какой ещё строй! Я перемешал на плацу блочных и строчных — пусть стоят кто как хочет. И шпиона к ним подослал!»',
      },
      {
        art: 'mentor',
        speaker: 'display',
        name: 'Сержант Дисплей',
        text: '«Смирно! Я Сержант Дисплей. Свойство display решает, как блок встаёт в строй: блоком, строчкой или строчным блоком. За мной!»',
      },
    ],
    outro: [
      {
        art: 'fortress',
        text: 'Парад прошёл без единой ошибки: знамёна во всю ширину, солдаты — ровной строкой, а шпион Лорда Дефолта пойман.',
      },
      {
        art: 'mentor',
        speaker: 'display',
        name: 'Сержант Дисплей',
        text: '«Теперь ты командуешь строем, {name}! Последняя застава — Дозорная башня. Там блоки срываются с мест, и Капитан Абсолют ждёт подмоги.»',
      },
    ],
  },
  levels: [disp01, disp02, disp03, disp04, disp05],
});
