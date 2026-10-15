import { colorParts, spriteCssUrl, type Sprite } from '../../pixel/pixelArt';
import { colorSheet } from '../../pixel/sheet';
import { AMANITA, BOLETUS, FIREFLY_FRAMES, FLOWER, FOREST_LANTERN_FRAMES, LEAF, OAK, SPRUCE, STONE_ROCK, STUMP } from '../../pixel/sprites';
import forestRules from './forest.css?raw';
import { FOREST_BANDS, skyBackground } from './sky';

/** Предмет, который красит color: маска заливки и рисунок поверх — в переменных для forest.css. */
function colorable(selector: string, sprite: Sprite): string {
  const { fill, details } = colorParts(sprite);
  return `${selector} {\n  --fill: ${spriteCssUrl(fill)};\n  --details: ${spriteCssUrl(details)};\n}`;
}

/** Анимированный предмет: маска общая, а рисунок поверх — лента кадров. fillChars — что красит color */
function animatedColorable(selector: string, frames: Sprite[], fillChars: string): string {
  const { fill, details } = colorSheet(frames, fillChars);
  return `${selector} {
  --fill: ${spriteCssUrl(fill)};
  --details: url("${details.uri}");
}`;
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
${animatedColorable('.firefly', FIREFLY_FRAMES, 'chdv')}
${animatedColorable('.lantern', FOREST_LANTERN_FRAMES, 'chdvw')}
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
