import { svgUrl } from './kit';

/*
  Тайлы подземелья Лабиринта Решений в «Сумраке»: плиты пола светлее кладки, чтобы коридор читался с первого взгляда.
  Яркость по WCAG: пол к стене не меньше 1,15 (раньше пол был темнее кладки, и коридор почти не читался).
*/

const TILE = (body: string) => svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" preserveAspectRatio="none">${body}</svg>`);

const FLOOR = '<rect width="48" height="48" fill="#1a1e27"/><path d="M0 0.5 H48 M0.5 0 V48 M24 0 V24 M0 24 H48" stroke="#0f1218" stroke-width="1.2"/><rect x="2" y="2" width="20" height="1" fill="#272c37"/><rect x="26" y="26" width="20" height="1" fill="#272c37"/>';

/** Тайлы клеток: те же переменные, что у пиксельного подземелья */
export const NOIR_TILES = {
  '--wall': TILE(
    '<rect width="48" height="48" fill="#040508"/><rect x="1" y="1" width="46" height="14" fill="#0c0e14"/><rect x="1" y="17" width="22" height="14" fill="#0a0b10"/><rect x="25" y="17" width="22" height="14" fill="#0c0e14"/><rect x="1" y="33" width="46" height="14" fill="#0a0b10"/><g fill="#b9cbe8" opacity="0.08"><rect x="1" y="1" width="46" height="1"/><rect x="1" y="17" width="22" height="1"/><rect x="25" y="17" width="22" height="1"/><rect x="1" y="33" width="46" height="1"/></g>',
  ),
  '--floor': TILE(FLOOR),
  '--floor-crack': TILE(`${FLOOR}<path d="M8 6 L14 15 L12 22 L19 31 L17 40" fill="none" stroke="#020203" stroke-width="1.2"/>`),
  '--floor-moss': TILE(`${FLOOR}<g fill="#2f5a44" opacity="0.45"><ellipse cx="12" cy="38" rx="8" ry="4"/><ellipse cx="34" cy="10" rx="6" ry="3"/><ellipse cx="19" cy="41" rx="4" ry="2.4"/></g>`),
};
