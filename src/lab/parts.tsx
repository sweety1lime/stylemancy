import type { CSSProperties, ReactNode } from 'react';
import type { BoardProps } from './Board';
import { READY_ICONS } from './icons';
import { DUNGEON_MAP, type GemKind } from './shapes';
import type { Kit } from './types';

const SCENE_GEMS: [GemKind, number][] = [
  ['amethyst', 335],
  ['emerald', 380],
  ['ruby', 425],
];

const delay = (i: number) => ({ animationDelay: `${i * -0.7}s` }) as CSSProperties;

/** Сцена, портрет и подземелье из набора векторного стиля. */
export function kitParts(kit: Kit): Pick<BoardProps, 'scene' | 'portrait' | 'dungeon' | 'ready'> {
  const scene = (
    <svg viewBox="0 0 800 360" role="img" aria-label="Герой и Лорд Дефолт на парящем острове">
      {kit.sky}
      <g transform="translate(190 232)">{kit.island}</g>
      <g transform="translate(220 121)">
        <g className="a-bob">{kit.hero}</g>
      </g>
      <g transform="translate(480 111)">
        <g className="a-sway">{kit.villain}</g>
      </g>
      {SCENE_GEMS.map(([kind, x], i) => (
        <g key={kind} transform={`translate(${x} 150)`}>
          <g className="a-float" style={delay(i)}>
            {kit.gem(kind)}
          </g>
        </g>
      ))}
      {kit.sceneOverlay}
    </svg>
  );

  const portrait = (
    <svg viewBox="0 0 120 120" role="img" aria-label="Магистр Флекс">
      {kit.mentor}
    </svg>
  );

  const width = DUNGEON_MAP[0].length * 40;
  const height = DUNGEON_MAP.length * 40;
  const cells: ReactNode[] = [];
  const things: ReactNode[] = [];
  DUNGEON_MAP.forEach((row, y) =>
    [...row].forEach((cell, x) => {
      const wall = cell === '#' || cell === 'T';
      cells.push(
        <g key={`${x},${y}`} transform={`translate(${x * 40} ${y * 40})`}>
          {wall ? kit.wall(x, y) : kit.floor(x, y)}
        </g>,
      );
      const at = `translate(${x * 40} ${y * 40})`;
      if (cell === 'T') things.push(<g key={`t${x},${y}`} transform={at}>{kit.torch}</g>);
      if (cell === 'E') things.push(<g key="exit" transform={at}>{kit.exit}</g>);
      if (cell === 'b') {
        things.push(
          <g key="bug" transform={at}>
            <g className="a-scuttle">{kit.bug}</g>
          </g>,
        );
      }
      if (cell === 'g') {
        things.push(
          <g key="gem" transform={`translate(${x * 40 + 11} ${y * 40 + 6}) scale(0.45)`}>
            <g className="a-float">{kit.gem('emerald')}</g>
          </g>,
        );
      }
      if (cell === 'H') {
        things.push(
          <g key="hero" transform={`translate(${x * 40 + 4} ${y * 40 - 4}) scale(0.32)`}>
            <g className="a-bob">{kit.hero}</g>
          </g>,
        );
      }
    }),
  );
  const dungeon = (
    <svg className="dungeon-map" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Подземелье">
      {cells}
      {things}
      {kit.dungeonOverlay?.(width, height)}
    </svg>
  );

  const { icon } = kit;
  const ready = icon && (
    <ul className="ready__list">
      {READY_ICONS.map((item, i) => (
        <li key={item.id} className="ready__item">
          <svg className="ready__icon" viewBox="0 0 512 512" role="img" aria-label={item.title}>
            {icon(item.d, i)}
          </svg>
          <span className="ready__title">{item.title}</span>
        </li>
      ))}
    </ul>
  );

  return { scene, portrait, dungeon, ready };
}
