import type { ReactNode } from 'react';
import type { GemKind } from './shapes';

/**
 * Набор стиля: одни и те же рисунки, нарисованные по-своему.
 * Каждый рисунок — группа SVG в своей рамке (размеры в shapes.ts), сцены собирает Board.
 */
export interface Kit {
  id: string;
  name: string;
  about: string;
  /** Что отличает стиль и чего он будет стоить */
  traits: string[];
  /** Фильтры, узоры и градиенты стиля */
  defs?: ReactNode;
  /** Небо 800 × 360 */
  sky: ReactNode;
  island: ReactNode;
  hero: ReactNode;
  villain: ReactNode;
  mentor: ReactNode;
  gem: (kind: GemKind) => ReactNode;
  /** Клетки подземелья 40 × 40 */
  wall: (x: number, y: number) => ReactNode;
  floor: (x: number, y: number) => ReactNode;
  torch: ReactNode;
  exit: ReactNode;
  bug: ReactNode;
  /** Слой поверх сцены 800 × 360: зерно плёнки, виньетка, туман на переднем плане */
  sceneOverlay?: ReactNode;
  /** Слой поверх подземелья (рамка карты): темнота по краям */
  dungeonOverlay?: (width: number, height: number) => ReactNode;
  /** Готовая иконка 512 × 512 из набора, нарисованная в этом стиле */
  icon?: (d: string, index: number) => ReactNode;
}
