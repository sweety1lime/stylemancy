import type { Level, Region } from '../engine/types';
import { barracks } from './barracks';
import { cascadeTree } from './cascade-tree';
import { defaultCitadel } from './default-citadel';
import { floatingIslands } from './floating-islands';
import { forestEdge } from './forest-edge';
import { formForge } from './form-forge';
import { linkFair } from './link-fair';
import { mirrorTower } from './mirror-tower';
import { mushroomGlades } from './mushroom-glades';
import { paradeGround } from './parade-ground';
import { semanticCity } from './semantic-city';
import { stainedAbbey } from './stained-abbey';
import { tagVillage } from './tag-village';
import { watchtower } from './watchtower';

/** Земля на карте королевства — одна тема курса. Внутри — районы с уровнями. */
export interface Land {
  id: string;
  title: string;
  topic: string;
  blurb: string;
  /** Ключ эмблемы и скалы в EMBLEMS / LAND_ROCKS */
  emblem: 'tags' | 'forest' | 'fortress' | 'crystal';
  /** «Где»: для сюжета — «проклятие ещё держится в Лесу Селекторов» */
  where: string;
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
    blurb: 'Теги, списки, ссылки, семантика и формы',
    emblem: 'tags',
    where: 'в Долине Тегов',
    regions: [tagVillage, linkFair, semanticCity, formForge],
    upcoming: [],
  },
  {
    id: 'selector-forest',
    title: 'Лес Селекторов',
    topic: 'CSS: селекторы',
    blurb: 'Селекторы, псевдоклассы, каскад и наследование',
    emblem: 'forest',
    where: 'в Лесу Селекторов',
    regions: [forestEdge, mushroomGlades, cascadeTree],
    upcoming: [],
  },
  {
    id: 'block-fortress',
    title: 'Крепость Блоков',
    topic: 'CSS: блочная модель',
    blurb: 'Размеры, отступы, рамки, display и позиционирование',
    emblem: 'fortress',
    where: 'в Крепости Блоков',
    regions: [barracks, paradeGround, watchtower],
    upcoming: [],
  },
  {
    id: 'floating-lands',
    title: 'Парящие земли',
    topic: 'Flexbox · Grid · адаптив',
    blurb: 'Раскладки, которые подчиняются магии',
    emblem: 'crystal',
    where: 'в Парящих землях',
    regions: [floatingIslands, stainedAbbey, mirrorTower, defaultCitadel],
    upcoming: [],
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
  /** Номер района в земле, с нуля */
  regionIndex: number;
}

export function findLevel(id: string): LevelPlace | undefined {
  for (const land of lands) {
    for (const [regionIndex, region] of land.regions.entries()) {
      const index = region.levels.findIndex((level) => level.id === id);
      if (index !== -1) return { level: region.levels[index], region, land, index, regionIndex };
    }
  }
  return undefined;
}

export function findLand(id: string): Land | undefined {
  return lands.find((land) => land.id === id);
}
