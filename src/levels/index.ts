import { floatingIslands } from './floating-islands';

export const regions = [floatingIslands];

export const allLevels = regions.flatMap((region) => region.levels);
