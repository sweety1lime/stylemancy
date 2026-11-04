import type { ReactNode } from 'react';
import type { RigNode } from './rigTypes';

function shapes(node: RigNode, fill: string): ReactNode {
  return (
    <g key={node.name} className={`rig-${node.name}`}>
      {node.parts?.map((d, i) => (
        <path key={i} d={d} fill={fill} />
      ))}
      {node.children?.map((child) => shapes(child, fill))}
    </g>
  );
}

function lights(node: RigNode): ReactNode {
  return (
    <g key={node.name} className={`rig-${node.name}`}>
      {node.light}
      {node.children?.map(lights)}
    </g>
  );
}

interface RigProps {
  rig: RigNode;
  /** hero или villain — по нему rig.css знает шарниры */
  kind: string;
  move: string;
  /** Фильтр контрового света */
  rim: string;
  fill?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  viewBox: string;
}

/**
 * Персонаж на шарнирах. Своё SVG-окно нужно, чтобы шарниры в rig.css задавались
 * в координатах рисунка, где бы персонаж ни стоял на сцене.
 * Свет — второй копией скелета: те же узлы с теми же движениями, поэтому огонёк идёт за рукой,
 * а контровой свет обводит только силуэт, без ореолов.
 */
export function Rig({ rig, kind, move, rim, fill = '#05060a', ...box }: RigProps) {
  return (
    <svg className={`rig rig--${kind} rig--${move}`} overflow="visible" {...box}>
      <g filter={`url(#${rim})`}>{shapes(rig, fill)}</g>
      {lights(rig)}
    </svg>
  );
}
