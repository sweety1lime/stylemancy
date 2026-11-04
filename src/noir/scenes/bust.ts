import { LIGHTS } from '../lights';
import { BUSTS } from '../mentors';
import { NIGHT } from '../scene';

/**
 * Портрет наставника для сцены уровня — картинкой SVG: тот же силуэт, что в игре (NoirBust),
 * со своими фильтрами внутри. Рамка 120 × 120, фон — лунный портретный.
 */
export function bustSvg(id: string): string {
  const bust = BUSTS[id] ?? BUSTS.flex;
  const radial = (name: string, color: string) =>
    `<radialGradient id="${name}"><stop offset="0" stop-color="${color}" stop-opacity="0.85"/><stop offset="0.35" stop-color="${color}" stop-opacity="0.3"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
  const glow = bust.glow;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
<defs>
<radialGradient id="bg" cx="0.5" cy="0.42" r="0.6"><stop offset="0" stop-color="#4a5a7c"/><stop offset="0.45" stop-color="#1c2438"/><stop offset="1" stop-color="#07090f"/></radialGradient>
${radial('h', LIGHTS[bust.halo])}${glow ? radial('l', LIGHTS[glow.light]) : ''}
<filter id="r" x="-10%" y="-10%" width="120%" height="120%"><feMorphology in="SourceAlpha" operator="erode" radius="0.35" result="i"/><feOffset in="i" dx="-0.55" dy="0.5" result="s"/><feComposite in="SourceAlpha" in2="s" operator="out" result="e"/><feFlood flood-color="#b9cbe8" flood-opacity="0.6"/><feComposite in2="e" operator="in" result="k"/><feGaussianBlur in="k" stdDeviation="0.3" result="f"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="f"/></feMerge></filter>
<filter id="g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<rect width="120" height="120" fill="url(#bg)"/>
<circle cx="60" cy="56" r="66" fill="url(#h)" opacity="0.5"/>
<g filter="url(#r)">${bust.parts.map((d) => `<path d="${d}" fill="${NIGHT}"/>`).join('')}</g>
${glow ? `<circle cx="${glow.x}" cy="${glow.y}" r="${glow.r}" fill="url(#l)"/>` : ''}
<g filter="url(#g)">${bust.lights.map((lit) => `<path d="${lit.d}" fill="${lit.color}" fill-rule="evenodd"${lit.opacity ? ` opacity="${lit.opacity}"` : ''}/>`).join('')}</g>
</svg>`;
}
