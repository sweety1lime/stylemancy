import { colorParts, spriteCssUrl, type Sprite } from '../../pixel/pixelArt';
import { AMANITA, BOLETUS, FIREFLY, FLOWER, FOREST_LANTERN, LEAF, OAK, SPRUCE, STONE_ROCK, STUMP } from '../../pixel/sprites';
import forestRules from './forest.css?raw';
import { FOREST_BANDS, skyBackground } from './sky';

/** Предмет, который красит color: маска заливки и рисунок поверх — в переменных для forest.css. */
function colorable(selector: string, sprite: Sprite): string {
  const { fill, details } = colorParts(sprite);
  return `${selector} {\n  --fill: ${spriteCssUrl(fill)};\n  --details: ${spriteCssUrl(details)};\n}`;
}

/** Общее для районов Леса Селекторов: правила из forest.css, ночное небо и спрайты предметов. */
export const forestCss = `${forestRules}
/* Под кронами луны не видно — только звёзды в просветах */
body {
  background:
    ${skyBackground(FOREST_BANDS, false)};
}

${colorable('.mushroom', BOLETUS)}
${colorable('.amanita, .poison', AMANITA)}
${colorable('.firefly', FIREFLY)}
${colorable('.lantern', FOREST_LANTERN)}
${colorable('.flower', FLOWER)}
${colorable('.leaf', LEAF)}
${colorable('.tree', OAK)}
${colorable('.spruce', SPRUCE)}

.stone {
  background: ${spriteCssUrl(STONE_ROCK)} center / 100% 100% no-repeat;
}

.stump {
  background: ${spriteCssUrl(STUMP)} center / 100% 100% no-repeat;
}
`;
