import { useSettings } from '../game/settings';

/** Включён ли вид «Сумрак» (переключатель с луной в верхней панели) */
export function useNoir(): boolean {
  return useSettings().look === 'noir';
}

/** Портреты, у которых уже есть силуэт «Сумрака»; остальные пока пиксельные */
export const NOIR_PORTRAITS = new Set(['flex', 'default']);

/** Сценки сюжета, нарисованные в «Сумраке»: пролог и победа Парящих островов */
export const NOIR_ARTS = new Set(['kingdom', 'fallen', 'villain', 'mentor', 'crown']);

/** Районы, чьи сцены уровней уже в «Сумраке» */
export const NOIR_REGIONS = new Set(['floating-islands']);
