import { defineRegion } from '../../engine/define';
import { spriteCssUrl } from '../../pixel/pixelArt';
import { FLAG, LANTERN, SAND_BRICKS } from '../../pixel/sprites';
import { fortressCss } from '../shared/fortress';
import { POSITION_PROPERTIES } from '../shared/properties';
import { DUSK_BANDS, skyBackground, twinkleCss } from '../shared/sky';
import pos01 from './pos-01';
import pos02 from './pos-02';
import pos03 from './pos-03';
import pos04 from './pos-04';
import pos05 from './pos-05';
import pos06 from './pos-06';
import sceneCss from './scene.css?raw';

/** Небо, кладка (наследуется всем, что её рисует) и картинки предметов */
const spritesCss = `
body {
  --bricks: ${spriteCssUrl(SAND_BRICKS)};
  background:
    ${skyBackground(DUSK_BANDS)};
}

.flag { --flag: ${spriteCssUrl(FLAG)}; }
.lantern { --lantern: ${spriteCssUrl(LANTERN)}; }
`;

export const watchtower = defineRegion({
  id: 'watchtower',
  title: 'Дозорная башня',
  topic: 'Позиционирование',
  npc: { name: 'Капитан Абсолют', title: 'комендант Крепости Блоков', portrait: 'absolute' },
  sceneCss: sceneCss + spritesCss + twinkleCss + fortressCss,
  allow: POSITION_PROPERTIES,
  allowMessage: 'В Дозорной башне действует магия position, display и блочной модели',
  story: {
    intro: [
      {
        art: 'fortress',
        text: 'Над крепостью высится Дозорная башня. Здесь блоки не обязаны стоять в общем строю: их можно сдвинуть, поднять над другими и даже прибить к окну.',
      },
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        text: '«Я сорвал с башни флаг и перепутал все слои! Посмотрим, как ты разберёшься, от чего отсчитывать.»',
      },
      {
        art: 'mentor',
        speaker: 'absolute',
        name: 'Капитан Абсолют',
        text: '«Капитан Абсолют, комендант крепости. Свойство position — это приказ блоку: стой на месте, сдвинься или займи точку на карте. Вперёд, на башню!»',
      },
    ],
    outro: [
      {
        art: 'fortress',
        text: 'Над Дозорной башней снова реет флаг, фонари горят, а каждый блок крепости знает своё место. Крепость Блоков свободна!',
      },
      {
        art: 'crown',
        speaker: 'absolute',
        name: 'Капитан Абсолют',
        text: '«Держи Руну Блоков, {name}: размеры, отступы, рамки, display и position теперь с тобой. Грамота — в Летописи героя.»',
      },
      // Пока где-то держится проклятие, Лорд Дефолт сбегает туда. Когда спасено всё — начинается общий финал
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        when: { allDone: false },
        text: '«Крепость пала… Но я ещё не побеждён: моё проклятие держится {cursed}. Встретимся там, {name}!»',
      },
      {
        art: 'mentor',
        speaker: 'absolute',
        name: 'Капитан Абсолют',
        when: { allDone: false, next: true },
        text: '«Следующая остановка — {next}. Крепость прикроет тебя с тыла, {name}!»',
      },
      {
        art: 'mentor',
        speaker: 'absolute',
        name: 'Капитан Абсолют',
        when: { allDone: false, next: false },
        text: '«Остальные земли пока в тумане. Он рассеется, когда учитель их откроет, — а пока загляни в гримуар.»',
      },
    ],
  },
  levels: [pos01, pos02, pos03, pos04, pos05, pos06],
});
