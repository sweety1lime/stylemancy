import type { Level } from '../engine/types';
import type { Land } from '../levels';

/*
  «Маяки класса»: общая карта, которую учитель выводит на проектор. У каждого уровня свой маяк, и он загорается,
  когда уровень прошла хотя бы половина класса. Имён и мест на карте нет: класс зажигает огни вместе, а не соревнуется
  (в Стилемантии рейтингов нет). Считается по тем же строкам прогресса, что и таблица учителя.
*/

/** Какая доля класса должна пройти уровень, чтобы его маяк загорелся */
export const LIGHT_SHARE = 0.5;

export interface LevelBeacon {
  level: Level;
  /** Сколько студентов прошли уровень */
  done: number;
  lit: boolean;
}

export interface RegionBeacons {
  id: string;
  title: string;
  levels: LevelBeacon[];
}

export interface LandBeacons {
  land: Land;
  regions: RegionBeacons[];
  lit: number;
  total: number;
}

export interface Beacons {
  students: number;
  /** Сколько студентов нужно, чтобы маяк загорелся */
  need: number;
  lands: LandBeacons[];
  lit: number;
  total: number;
}

/** Строка прогресса: достаточно знать уровень и пройден ли он */
export interface ProgressMark {
  level_id: string;
  completed: boolean;
}

export function beaconsOf(students: number, progress: ProgressMark[], landList: Land[]): Beacons {
  const need = Math.max(1, Math.ceil(students * LIGHT_SHARE));
  const done = new Map<string, number>();
  for (const row of progress) if (row.completed) done.set(row.level_id, (done.get(row.level_id) ?? 0) + 1);

  const lands = landList
    .filter((land) => land.regions.length > 0)
    .map((land): LandBeacons => {
      const regions = land.regions.map((region): RegionBeacons => ({
        id: region.id,
        title: region.title,
        levels: region.levels.map((level) => {
          const count = done.get(level.id) ?? 0;
          return { level, done: count, lit: students > 0 && count >= need };
        }),
      }));
      const levels = regions.flatMap((region) => region.levels);
      return { land, regions, lit: levels.filter((beacon) => beacon.lit).length, total: levels.length };
    });
  return {
    students,
    need,
    lands,
    lit: lands.reduce((sum, land) => sum + land.lit, 0),
    total: lands.reduce((sum, land) => sum + land.total, 0),
  };
}
