import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { NoirMapHero } from './NoirLandArt';
import { useStaffLight } from './staffLights';
import { dist, type Journey } from './walkPlan';

/* Герой идёт по тропе карты в «Сумраке»: световой след (NoirTrail) и сам ходок (NoirWalker). Маршрут считает walkPlan.ts */

/** Световой след по тропе: рисуется за героем и потом гаснет */
export function NoirTrail({ journey }: { journey: Journey }) {
  const staff = useStaffLight();
  // След светится цветом, который игрок выбрал для посоха
  const style = {
    '--walk-ms': `${journey.duration}ms`,
    '--walk-delay': `${journey.delay}ms`,
    '--staff-trail': staff.trail,
    '--staff-trail-glow': staff.trailGlow,
  } as CSSProperties;
  return (
    <svg className="world-map__trail" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <polyline
        className={journey.over ? 'path path--trail path--trail-out' : 'path path--trail'}
        points={journey.trail.map(([x, y]) => `${x},${y}`).join(' ')}
        pathLength={1}
        style={style}
      />
    </svg>
  );
}

/** Герой в пути: идёт по точкам маршрута, на поворотах разворачивается лицом по ходу */
export function NoirWalker({ journey }: { journey: Journey }) {
  const body = useRef<HTMLSpanElement>(null);
  const face = useRef<HTMLSpanElement>(null);
  const { points, duration, delay, done } = journey;
  const origin = points[points.length - 1];

  useLayoutEffect(() => {
    const move = body.current;
    const turn = face.current;
    if (!move || !turn) return;
    const total = points.slice(1).reduce((sum, point, i) => sum + dist(points[i], point), 0);
    let walked = 0;
    const offsets = points.map((point, i) => {
      if (i > 0) walked += dist(points[i - 1], point);
      return i === points.length - 1 ? 1 : walked / total;
    });
    // Лицом по ходу: вправо — как нарисован, влево — зеркально. На стоянке остаётся прежний поворот
    let facing = 1;
    const faces = points.map((point, i) => {
      const next = points[i + 1];
      if (next && Math.abs(next[0] - point[0]) > 1) facing = next[0] < point[0] ? -1 : 1;
      return facing;
    });
    const timing: KeyframeAnimationOptions = { duration, delay, easing: 'ease-in-out', fill: 'backwards' };
    const walk = move.animate(
      points.map((point, i) => ({ offset: offsets[i], easing: 'linear', transform: `translate(${point[0] - origin[0]}px, ${point[1] - origin[1]}px)` })),
      timing,
    );
    const flip = turn.animate(
      faces.map((side, i) => ({ offset: offsets[i], easing: 'steps(1, end)', transform: `scaleX(${side})` })),
      timing,
    );
    walk.onfinish = done;
    return () => {
      walk.cancel();
      flip.cancel();
    };
  }, [points, duration, delay, done, origin]);

  return (
    <span ref={body} className="land__walker land__walker--noir" style={{ left: origin[0], top: origin[1] }} aria-hidden="true">
      <span ref={face} className="land__walker-face">
        <NoirMapHero move="walk" />
      </span>
    </span>
  );
}
