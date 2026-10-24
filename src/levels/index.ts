import type { Level, Region } from '../engine/types';
import { barracks } from './barracks';
import { alchemistShop } from './alchemist-shop';
import { cardIndex } from './card-index';
import { carousel } from './carousel';
import { cascadeTree } from './cascade-tree';
import { defaultCitadel } from './default-citadel';
import { defaultLair } from './default-lair';
import { floatingIslands } from './floating-islands';
import { forestEdge } from './forest-edge';
import { formForge } from './form-forge';
import { functionCauldron } from './function-cauldron';
import { forks } from './forks';
import { gameWorkshop } from './game-workshop';
import { leverWorks } from './lever-works';
import { linkFair } from './link-fair';
import { mazeHeart } from './maze-heart';
import { mirrorTower } from './mirror-tower';
import { mushroomGlades } from './mushroom-glades';
import { oracleHall } from './oracle-hall';
import { paradeGround } from './parade-ground';
import { queryWorkshop } from './query-workshop';
import { semanticCity } from './semantic-city';
import { stainedAbbey } from './stained-abbey';
import { tagVillage } from './tag-village';
import { wagonTrain } from './wagon-train';
import { watchtower } from './watchtower';

/** Земля на карте — одна тема курса. Внутри — районы с уровнями. */
export interface Land {
  id: string;
  title: string;
  topic: string;
  blurb: string;
  /** Ключ эмблемы и скалы в EMBLEMS / LAND_ROCKS */
  emblem: 'tags' | 'forest' | 'fortress' | 'crystal' | 'flask' | 'maze' | 'cauldron' | 'gear';
  /** «Где»: для сюжета — «проклятие ещё держится в Лесу Селекторов» */
  where: string;
  regions: Region[];
  /** Районы, которые ещё в работе: показываются в тумане */
  upcoming: string[];
}

/** Земли Каскадии (HTML и CSS) в порядке курса. */
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

/** Земли Скриптории (JavaScript) — за дверью <script>, в порядке курса. */
export const scriptLands: Land[] = [
  {
    id: 'script-gates',
    title: 'Врата Скриптории',
    topic: 'JS: основы',
    blurb: 'Вывод, переменные, строки, типы и ввод',
    emblem: 'flask',
    where: 'у Врат Скриптории',
    regions: [oracleHall, alchemistShop],
    upcoming: [],
  },
  {
    id: 'decision-maze',
    title: 'Лабиринт Решений',
    topic: 'JS: условия и циклы',
    blurb: 'Герой идёт по подземелью по твоему алгоритму',
    emblem: 'maze',
    where: 'в Лабиринте Решений',
    regions: [forks, carousel, mazeHeart],
    upcoming: [],
  },
  {
    id: 'recipe-workshop',
    title: 'Мастерская Рецептов',
    topic: 'JS: функции и данные',
    blurb: 'Функции, массивы и объекты',
    emblem: 'cauldron',
    where: 'в Мастерской Рецептов',
    regions: [functionCauldron, wagonTrain, cardIndex],
    upcoming: [],
  },
  {
    id: 'mechanism-city',
    title: 'Город Механизмов',
    topic: 'JS: страница и события',
    blurb: 'Оживляем страницы и собираем свои мини-игры',
    emblem: 'gear',
    where: 'в Городе Механизмов',
    regions: [queryWorkshop, leverWorks, gameWorkshop, defaultLair],
    upcoming: [],
  },
];

export const allLands = [...lands, ...scriptLands];

export function isScriptLand(land: Land): boolean {
  return scriptLands.includes(land);
}

export const regions = allLands.flatMap((land) => land.regions);

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
  for (const land of allLands) {
    for (const [regionIndex, region] of land.regions.entries()) {
      const index = region.levels.findIndex((level) => level.id === id);
      if (index !== -1) return { level: region.levels[index], region, land, index, regionIndex };
    }
  }
  return undefined;
}

export function findLand(id: string): Land | undefined {
  return allLands.find((land) => land.id === id);
}
