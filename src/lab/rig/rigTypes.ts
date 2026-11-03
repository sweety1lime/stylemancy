import type { ReactNode } from 'react';

/**
 * Узел скелета персонажа: группа деталей, которая двигается целиком вокруг своего шарнира.
 * Шарнир и движения задаются в rig.css по имени узла (класс rig-<name>).
 * Дети двигаются вместе с родителем: голова — с телом, посох — с рукой.
 */
export interface RigNode {
  name: string;
  /** Контуры деталей (рисуются тёмным силуэтом) */
  parts?: string[];
  /** Свет на этом узле: огонёк, вспышка, искры — рисуется отдельным слоем поверх силуэта */
  light?: ReactNode;
  children?: RigNode[];
}

export interface Move {
  id: string;
  label: string;
}
