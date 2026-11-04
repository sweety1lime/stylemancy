import type { ReactNode } from 'react';
import type { RigNode } from './rigTypes';

/** Цвет лунной кромки — как у фильтра noir-rim */
const NOIR_RIM_LIGHT = '#b9cbe8';

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
      {rim === 'noir-rim' ? (
        // Лунная кромка «Сумрака» без фильтра: под фигурой — её светлая копия, сдвинутая к луне (вверх и вправо).
        // Фильтр пересчитывался бы на каждом кадре движения, а копия рисуется так же дёшево, как сама фигура
        <>
          <g transform="translate(0.8 -0.8)" opacity="0.55">
            {shapes(rig, NOIR_RIM_LIGHT)}
          </g>
          <g>{shapes(rig, fill)}</g>
        </>
      ) : (
        <g filter={`url(#${rim})`}>{shapes(rig, fill)}</g>
      )}
      {lights(rig)}
    </svg>
  );
}
