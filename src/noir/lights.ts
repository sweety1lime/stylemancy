/** Цвета источников света: у каждого свой радиальный градиент sil-light-<имя> в defs.tsx */
export const LIGHTS = {
  amber: '#ffb35c',
  cyan: '#6ff3ff',
  green: '#5dff9b',
  red: '#ff4d5e',
  blue: '#7fb2ff',
  gold: '#ffd27a',
  amethyst: '#c9a2ff',
  emerald: '#5dffb0',
  ruby: '#ff7b98',
  sapphire: '#8fc0ff',
  topaz: '#ffd36b',
  ice: '#bfe3ff',
  ember: '#ffb067',
  rose: '#ff9ec7',
};

export type Light = keyof typeof LIGHTS;
