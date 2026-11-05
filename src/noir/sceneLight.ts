import { createContext } from 'react';
import { useSettings } from '../game/settings';

/*
  Свет сценки: у каждой земли свой главный источник, и от него зависят небо и контровой свет силуэтов.
  Кромку (id фильтра из defs.tsx) сценка кладёт в RimContext, а силуэты читают её оттуда.
*/

export type SceneLight = 'moon' | 'dawn' | 'ember' | 'crowns';

/** Фильтр кромки по свету: у луны Каскадии прежний noir-rim, у остальных — направленная кромка без erode */
const RIM: Record<SceneLight, string> = {
  moon: 'noir-rim',
  dawn: 'noir-rim-dawn',
  ember: 'noir-rim-ember',
  crowns: 'noir-rim-moon',
};

/** Сценки, у которых свой свет: остальные стоят под луной Каскадии (или в Скриптории, где кромка прежняя) */
const LIGHT_OF: Record<string, SceneLight> = {
  village: 'dawn',
  fair: 'dawn',
  city: 'dawn',
  fortress: 'ember',
  forest: 'crowns',
};

export const RimContext = createContext('noir-rim');

/** Кромка сценки; под лёгкими эффектами у зарева нет размытого ореола */
export function rimOf(art: string, light = false): string {
  const id = RIM[LIGHT_OF[art] ?? 'moon'];
  return light && id === 'noir-rim-ember' ? 'noir-rim-ember-lite' : id;
}

export function useRim(art: string): string {
  const { effects } = useSettings();
  return rimOf(art, effects === 'light');
}
