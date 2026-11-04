import { useSettings } from '../game/settings';

/** Включён ли вид «Сумрак» (переключатель с луной в верхней панели) */
export function useNoir(): boolean {
  return useSettings().look === 'noir';
}

/** Сценки сюжета, нарисованные в «Сумраке»: пролог и победа Парящих островов */
export const NOIR_ARTS = new Set(['kingdom', 'fallen', 'villain', 'mentor', 'crown']);
