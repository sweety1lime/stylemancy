import { circle } from '../shapes';

/* Детали стиля «Бумажная аппликация». */

/** Деталь из бумаги: неровный край от ножниц, зерно бумаги и тень */
export function Cut({ d, fill, flat = false }: { d: string; fill: string; flat?: boolean }) {
  return <path d={d} fill={fill} filter={flat ? undefined : 'url(#paper-cut)'} />;
}

/** Заклёпка-шплинт, которой крепят руки бумажной куклы */
export function Brad({ x, y }: { x: number; y: number }) {
  return (
    <>
      <path d={circle(x, y, 1.7)} fill="#c9962e" />
      <path d={circle(x - 0.5, y - 0.5, 0.6)} fill="#fbe7a6" />
    </>
  );
}

/** Нитка, на которой висит бумажная декорация */
export function Thread({ x, to }: { x: number; to: number }) {
  return <line x1={x} y1="0" x2={x} y2={to} stroke="#e8dcc0" strokeWidth="0.8" opacity="0.55" />;
}
