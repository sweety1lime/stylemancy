/** Детали стиля «Тушь и акварель». */

export const INK = '#2b2118';
export const PAPER = '#f4ead2';

interface InkProps {
  d: string;
  fill?: string;
  /** Насколько густая акварель */
  wash?: number;
  /** Толщина линии; false — без контура */
  line?: number | false;
}

/** Фигура тушью: бумажная подложка закрывает то, что позади, сверху акварель со сдвигом и контур. */
export function Ink({ d, fill, wash = 0.85, line = 1.4 }: InkProps) {
  return (
    <>
      <path d={d} fill={PAPER} />
      {fill && <path d={d} fill={fill} opacity={wash} filter="url(#ink-wash)" transform="translate(1.2 0.9)" />}
      {line !== false && (
        <path d={d} fill="none" stroke={INK} strokeWidth={line} strokeLinejoin="round" strokeLinecap="round" filter="url(#ink-line)" />
      )}
    </>
  );
}

/** Штриховка — тень в технике туши */
export function Hatch({ d, opacity = 1 }: { d: string; opacity?: number }) {
  return <path d={d} fill="url(#ink-hatch)" opacity={opacity} />;
}

export function Line({ d, width = 1.2, color = INK }: { d: string; width?: number; color?: string }) {
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" filter="url(#ink-line)" />;
}
