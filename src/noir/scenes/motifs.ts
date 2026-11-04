import { svgUrl } from './kit';

/*
  Знаки витражей и знамён в «Сумраке»: тонкая светящаяся линия вместо пиксельной картинки.
  Рамка 24 × 24; те же имена, что у пиксельных мотивов (GLASS).
*/

export type Motif = 'sun' | 'moon' | 'star' | 'tree' | 'rose' | 'leaf' | 'crown' | 'drop';

const PATHS: Record<Motif, string> = {
  sun: 'M12 8 A4 4 0 1 0 12.01 8 Z M12 2.5 V5.5 M12 18.5 V21.5 M2.5 12 H5.5 M18.5 12 H21.5 M5.3 5.3 L7.4 7.4 M16.6 16.6 L18.7 18.7 M5.3 18.7 L7.4 16.6 M16.6 7.4 L18.7 5.3',
  moon: 'M14.5 3.5 A8.5 8.5 0 1 0 20.5 15.5 A6.8 6.8 0 1 1 14.5 3.5 Z',
  star: 'M12 2.8 L14.6 9 L21.2 9.5 L16.2 13.8 L17.8 20.4 L12 16.8 L6.2 20.4 L7.8 13.8 L2.8 9.5 L9.4 9 Z',
  tree: 'M12 2.5 L16 8 H14 L18 13.5 H15.5 L19.5 19 H4.5 L8.5 13.5 H6 L10 8 H8 Z M12 19 V22',
  rose: 'M12 6 Q16.5 6.5 16.5 11 Q16.5 15.5 12 15.5 Q7.5 15.5 7.5 11 Q7.5 7.5 11 7.6 Q13.6 8 13.4 10.6 Q13 12.6 11 12.4 M12 15.5 V22 M12 19 Q8.5 19.5 7.5 17 M12 18 Q15 18 16.5 16',
  leaf: 'M5 19 Q5 6 19 5 Q18 19 5 19 Z M5 19 L15 9',
  crown: 'M4 17.5 L5 8 L9 12 L12 5.5 L15 12 L19 8 L20 17.5 Z M4 20 H20',
  drop: 'M12 3.5 Q18.5 11.5 18.5 15 A6.5 6.5 0 0 1 5.5 15 Q5.5 11.5 12 3.5 Z',
};

/** Знак тонкой линией цвета color со свечением; fill — лёгкая заливка тем же цветом */
export function motifUrl(name: Motif, color: string, fill = 0.15): string {
  return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 28 28"><defs><filter id="g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<path d="${PATHS[name]}" fill="${color}" fill-opacity="${fill}" stroke="${color}" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round" filter="url(#g)"/></svg>`);
}
