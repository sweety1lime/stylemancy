import { useSettings } from '../game/settings';

/** Включён ли вид «Сумрак» (переключатель с луной в верхней панели) */
export function useNoir(): boolean {
  return useSettings().look === 'noir';
}

/** Сценки сюжета, нарисованные в «Сумраке»: все кадры игры */
export const NOIR_ARTS = new Set([
  'kingdom', 'fallen', 'villain', 'villain-script', 'mentor', 'crown', 'maze',
  'village', 'scroll', 'fair', 'city', 'forge', 'academy', 'chaos', 'forest', 'fortress', 'gate',
  'clockwork', 'oracle', 'shop', 'jester', 'carousel', 'conveyor', 'ghost', 'train', 'archive',
  'mech-city', 'lamps', 'levers', 'arcade', 'lair', 'runes', 'worlds', 'citadel', 'window', 'shards', 'mirrors',
]);