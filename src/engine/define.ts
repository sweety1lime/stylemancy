import { DEFAULT_SCENE, type CssLevelDef, type HtmlLevelDef, type Region, type RegionDef } from './types';

/** Описывает CSS-уровень. Обёртка нужна ради подсказок редактора по полям. */
export function defineLevel(level: CssLevelDef): CssLevelDef {
  return level;
}

/** Описывает HTML-уровень: студент пишет или чинит разметку. */
export function defineHtmlLevel(level: Omit<HtmlLevelDef, 'kind'>): HtmlLevelDef {
  return { ...level, kind: 'html' };
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
