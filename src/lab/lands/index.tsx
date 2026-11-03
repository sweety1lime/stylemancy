import type { ReactNode } from 'react';
import { noirKit } from '../kits/noir';
import { forestDefs, forestScene } from './forest';
import { fortressDefs, fortressScene } from './fortress';
import { scriptoriaDefs, scriptoriaScene } from './scriptoria';
import { tagsDefs, tagsScene } from './tags';
import { heroAt } from './common';

/* «Свет земель»: у каждой земли своё освещение в общем стиле «Сумрак» */

export interface LandLight {
  id: string;
  name: string;
  /** Главный свет сцены */
  light: string;
  /** Чем земля узнаётся в кадре */
  landmark: string;
  /** Небо сверху, у горизонта, силуэты, свет, магия */
  palette: string[];
  scene: ReactNode;
}

const islandsScene = (
  <g>
    {noirKit.sky}
    <g transform="translate(190 232)">{noirKit.island}</g>
    {(['amethyst', 'emerald', 'ruby'] as const).map((kind, i) => (
      <g key={kind} transform={`translate(${335 + i * 45} 150)`}>
        <g className="a-float" style={{ animationDelay: `${i * -0.7}s` }}>
          {noirKit.gem(kind)}
        </g>
      </g>
    ))}
    {heroAt(268, 257, 1, 'noir-rim')}
  </g>
);

export const LANDS: LandLight[] = [
  {
    id: 'tags',
    name: 'Долина Тегов',
    light: 'Туманный рассвет: солнце встаёт за холмами, в низинах тёплый туман',
    landmark: 'Древние камни в форме < и >, деревня, где уже зажгли окна',
    palette: ['#0c1322', '#f2c48c', '#0a0c13', '#ffcf96', '#ffd27a'],
    scene: tagsScene,
  },
  {
    id: 'forest',
    name: 'Лес Селекторов',
    light: 'Луна сквозь кроны: холодные лучи, туман между рядами елей',
    landmark: 'Светлячки, тлеющие грибы и Сова Селекта на ветке',
    palette: ['#04070a', '#15282a', '#030606', '#c4e8d6', '#e4ff9a'],
    scene: forestScene,
  },
  {
    id: 'fortress',
    name: 'Крепость Блоков',
    light: 'Зарево: за стенами пожар, небо багровое, тянется дым',
    landmark: 'Крепость из блоков, факелы и стражники на стенах, свет из ворот',
    palette: ['#080406', '#e0702c', '#090405', '#ffa060', '#ffd9a0'],
    scene: fortressScene,
  },
  {
    id: 'islands',
    name: 'Парящие острова',
    light: 'Холодная луна в облаках, далеко внизу туман',
    landmark: 'Академия на дальней скале, руины, кристаллы с лучами света',
    palette: ['#04060b', '#2a3244', '#06070c', '#b9cbe8', '#a78bfa'],
    scene: islandsScene,
  },
  {
    id: 'scriptoria',
    name: 'Скриптория',
    light: 'Холодные огни: бирюзовая ночь, пар над мастерскими',
    landmark: 'Шестерни города и дверь <script>, из которой всплывает код',
    palette: ['#020607', '#134040', '#030909', '#8ff0e0', '#3fd88a'],
    scene: scriptoriaScene,
  },
];

export const LAND_DEFS = [
  <g key="tags">{tagsDefs}</g>,
  <g key="forest">{forestDefs}</g>,
  <g key="fortress">{fortressDefs}</g>,
  <g key="scriptoria">{scriptoriaDefs}</g>,
];
