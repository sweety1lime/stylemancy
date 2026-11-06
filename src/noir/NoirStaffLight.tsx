import { Glow } from './light';
import { useStaffLight } from './staffLights';

/** Навершие посоха: тот же ромб, что нарисован в heroRig */
const CRYSTAL = 'M70.4 -7 L74.2 0.6 L70.4 9 L66.6 0.6 Z';

/** Огонёк на посохе героя: круг света, сердцевина, кольцо вспышки и дымок, если заклинание не вышло */
export function StaffLight() {
  const staff = useStaffLight();
  return (
    <>
      <Glow className="rig-glow" x={70.4} y={1} r={22} light={staff.light} />
      <path className="rig-core" d={CRYSTAL} fill={staff.core} filter="url(#sil-glow)" />
      <circle className="rig-burst" cx="70.4" cy="1" r="10" fill="none" stroke={staff.burst} strokeWidth="1.4" />
      <g className="rig-smoke" fill="#8a93a6">
        <circle cx="70" cy="-6" r="3" />
        <circle cx="73" cy="-10" r="2.4" />
        <circle cx="68" cy="-12" r="2" />
      </g>
    </>
  );
}
