import type { Level, Region } from '../engine/types';
import { floatingIslands } from './floating-islands';

/** Земля на карте королевства — одна тема курса. Внутри — районы с уровнями. */
export interface Land {
  id: string;
  title: string;
  topic: string;
  blurb: string;
  /** Ключ эмблемы и скалы в EMBLEMS / LAND_ROCKS */
  emblem: 'tags' | 'forest' | 'fortress' | 'crystal';
  regions: Region[];
  /** Районы, которые ещё в работе: показываются в тумане */
  upcoming: string[];
}

/** Земли в порядке курса. */
export const lands: Land[] = [
  {
    id: 'tags-valley',
    title: 'Долина Тегов',
    topic: 'HTML',
    blurb: 'Теги, вложенность и семантика страницы',
    emblem: 'tags',
    regions: [],
    upcoming: ['Теги и вложенность', 'Семантика', 'Формы'],
  },
  {
    id: 'selector-forest',
    title: 'Лес Селекторов',
    topic: 'CSS: селекторы',
    blurb: 'Селекторы, каскад и специфичность',
    emblem: 'forest',
    regions: [],
    upcoming: ['Селекторы', 'Каскад и специфичность'],
  },
  {
    id: 'block-fortress',
    title: 'Крепость Блоков',
    topic: 'CSS: блочная модель',
    blurb: 'margin, padding, border и позиционирование',
    emblem: 'fortress',
    regions: [],
    upcoming: ['Блочная модель', 'Позиционирование'],
  },
  {
    id: 'floating-lands',
    title: 'Парящие земли',
    topic: 'Flexbox · Grid · адаптив',
    blurb: 'Раскладки, которые подчиняются магии',
    emblem: 'crystal',
    regions: [floatingIslands],
    upcoming: ['Рунные сады · Grid', 'Зеркальная башня · адаптив', 'Цитадель Лорда Дефолта · финал'],
  },
];

export const regions = lands.flatMap((land) => land.regions);

export const allLevels = regions.flatMap((region) => region.levels);

export interface LevelPlace {
  level: Level;
  region: Region;
  land: Land;
  /** Номер уровня в районе, с нуля */
  index: number;
}

export function findLevel(id: string): LevelPlace | undefined {
  for (const land of lands) {
    for (const region of land.regions) {
      const index = region.levels.findIndex((level) => level.id === id);
      if (index !== -1) return { level: region.levels[index], region, land, index };
    }
  }
  return undefined;
}

export function findLand(id: string): Land | undefined {
  return lands.find((land) => land.id === id);
}
