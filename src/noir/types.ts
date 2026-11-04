/* Фигуры «Сумрака»: детали с ролями. По роли стиль решает, как деталь нарисовать. */

export type Role =
  | 'hat'
  | 'hatDark'
  | 'band'
  | 'skin'
  | 'hair'
  | 'cloak'
  | 'cloakDark'
  | 'cloth'
  | 'trim'
  | 'staff'
  | 'crystal'
  | 'boot'
  | 'scarf'
  | 'coat'
  | 'coatDark'
  | 'shirt'
  | 'tie'
  | 'glove'
  | 'cane'
  | 'metal'
  | 'beard'
  | 'robe'
  | 'robeDark';

export interface Part {
  d: string;
  role: Role;
  /** Деталь шевелится отдельно (шарф на ветру) */
  className?: string;
}

export interface Figure {
  parts: Part[];
  /** Черты лица и мелкие линии: в витраже — роспись по стеклу, в неоне — тонкие трубки */
  lines: string[];
  /** Глаза — точками */
  dots: string[];
  /** Где светится: кристалл посоха, монокль */
  glow?: { x: number; y: number; r: number };
}
