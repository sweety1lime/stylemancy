import { sparkle } from '../shapes';
import type { Move, RigNode } from './rigTypes';

/*
  Лорд Дефолт на шарнирах. Рамка 100 × 150, ноги на y = 146.
  Шарниры (rig.css): всё тело — у ног, ноги — у бёдер, рука за спиной — у левого плеча,
  голова — у шеи, цилиндр — у полей, рука с тростью — у правого плеча.
*/

export const VILLAIN_MOVES: Move[] = [
  { id: 'idle', label: 'Ухмылка' },
  { id: 'laugh', label: 'Хохот' },
  { id: 'angry', label: 'Злость' },
  { id: 'run', label: 'Побег' },
];

export const VILLAIN_RIG: RigNode = {
  name: 'whole',
  light: (
    <g className="rig-dust" fill="#6b7488">
      <ellipse cx="40" cy="144" rx="6" ry="2.6" />
      <ellipse cx="62" cy="144" rx="6" ry="2.6" />
    </g>
  ),
  children: [
    { name: 'legL', parts: ['M45.2 90 L48.8 90 L49 141 L45.6 141 Z M45.6 140.5 L49 140.5 L49 146 L38 146 Q39 142 45.6 140.5 Z'] },
    { name: 'legR', parts: ['M51.2 90 L54.8 90 L54.4 141 L51 141 Z M51 140.5 L54.4 140.5 Q61 142 62 146 L51 146 Z'] },
    {
      name: 'body',
      parts: [
        'M40 47 Q50 43 60 47 L61 74 L58 82 L63 124 L55 123 L51.5 92 L48.5 92 L45 123 L37 124 L42 82 L39 74 Z',
        'M44 41 L50 45 L56 41 L57.5 46 L50 50 L42.5 46 Z',
      ],
      children: [
        { name: 'backArm', parts: ['M41 48 Q35 58 37 70 L41 72 Q40 60 44 52 Z', 'M36.6 71 a2.4 2.4 0 1 0 4.8 0 a2.4 2.4 0 1 0 -4.8 0 Z'] },
        {
          name: 'head',
          parts: [
            'M44 30 Q43.5 38 46 42 Q50 45 54 42 Q56.5 38 56 30 Z',
            'M46 39 Q43 39.5 41.5 38 Q42.5 41 46 40.6 Z M54 39 Q57 39.5 58.5 38 Q57.5 41 54 40.6 Z',
          ],
          light: (
            <>
              <path className="rig-glint" d={sparkle(53.4, 35.4, 2.6)} fill="#d6e6ff" filter="url(#sil-glow)" />
              <path className="rig-glint-angry" d={sparkle(53.4, 35.4, 3.2)} fill="#ff5a4d" filter="url(#sil-glow)" />
            </>
          ),
          children: [
            {
              name: 'hat',
              parts: ['M42.5 0 H57.5 L56.8 27 H43.2 Z', 'M34 27.5 Q50 24.5 66 27.5 Q66 30.6 50 29.8 Q34 30.6 34 27.5 Z'],
            },
          ],
        },
        {
          name: 'caneArm',
          parts: [
            'M64.2 77 L66.2 76.8 L72.6 146 L70.6 146.2 Z',
            'M59 48 Q66 60 67 76 L63 77 Q62 63 56 54 Z',
            'M62.4 75.4 a2.4 2.4 0 1 0 4.8 0 a2.4 2.4 0 1 0 -4.8 0 Z',
            'M62.6 78 a2.5 2.5 0 1 0 5 0 a2.5 2.5 0 1 0 -5 0 Z',
          ],
        },
      ],
    },
  ],
};
