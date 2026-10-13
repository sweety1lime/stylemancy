import { DEFAULT_SCENE, type LevelDef, type Region, type RegionDef } from './types';

/** Описывает уровень. Обёртка нужна ради подсказок редактора по полям. */
export function defineLevel(level: LevelDef): LevelDef {
  return level;
}

/** Собирает район: каждому уровню достаются оформление, персонаж и правила района. */
export function defineRegion({ levels, ...region }: RegionDef): Region {
  return {
    ...region,
    levels: levels.map((level) => ({
      ...level,
      regionId: region.id,
      regionTitle: region.title,
      npc: region.npc,
      sceneCss: level.sceneCss ? `${region.sceneCss}\n${level.sceneCss}` : region.sceneCss,
      allow: region.allow,
      allowMessage: region.allowMessage,
      scene: level.scene ?? DEFAULT_SCENE,
    })),
  };
}
