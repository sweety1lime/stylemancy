import { Glow } from '../kits/silParts';
import { sparkle } from '../shapes';
import type { Move, RigNode } from './rigTypes';

/*
  Ученик Академии на шарнирах. Рамка 100 × 140, ноги на y = 136.
  Шарниры (rig.css): всё тело — у ног, плащ — у левого плеча, свободная рука — у левого плеча,
  голова — у шеи, рука с посохом — у правого плеча, посох — в кисти, сапоги — у пяток.
*/

const CRYSTAL = 'M70.4 -7 L74.2 0.6 L70.4 9 L66.6 0.6 Z';

export const HERO_MOVES: Move[] = [
  { id: 'idle', label: 'Покой' },
  { id: 'walk', label: 'Ходьба' },
  { id: 'cast', label: 'Заклинание' },
  { id: 'joy', label: 'Радость' },
  { id: 'oops', label: '«Ой»' },
];

export const HERO_RIG: RigNode = {
  name: 'whole',
  children: [
    { name: 'cloak', parts: ['M37 52 Q28 70 22 92 Q16 112 7 126 Q15 128 21 125 Q19 130 13 134 Q26 132 32 124 Q30 100 34 76 Z'] },
    { name: 'bootL', parts: ['M42 127 H46 V136 H42 Z M41 133 H46.5 V136 H38.5 Q38.6 134 41 133 Z'] },
    { name: 'bootR', parts: ['M49 127 H53 V136 H49 Z M49 133 H54 Q57 134 57.2 136 H49 Z'] },
    {
      name: 'body',
      parts: [
        'M37 51 Q47 47.5 57 51 Q61 66 63 86 Q65 108 70 128 Q60 131 52 130 L48 131.5 L44 130 Q36 131 26 128 Q30 108 31.5 86 Q33 66 37 51 Z',
        'M33.5 84 H60.5 L60.8 87.4 H33.2 Z',
        'M38 44 L42 49 L47 50 L52 49 L56 44 L57 52 L47 56 L37 52 Z',
      ],
      children: [
        { name: 'freeArm', parts: ['M40 52 Q34 62 33 80 L36.6 81 Q37.4 66 43 57 Z', 'M32.3 82 a2.5 2.5 0 1 0 5 0 a2.5 2.5 0 1 0 -5 0 Z'] },
        {
          name: 'head',
          parts: [
            'M41 34 Q40.5 43 44 47 Q47 49 50 47 Q53 43 52.5 34 Z',
            'M22 33 Q46 26.5 72 32 Q60 35.5 46 35.6 Q31 35.6 22 33 Z',
            'M36 32 Q39 21 43 12 Q48 2 58 -2 Q53 6 52 14 Q51 23 56 31.6 Z',
          ],
          light: (
            <g className="rig-sparkles" fill="#ffe2a8" filter="url(#sil-glow)">
              <path d={sparkle(24, 14, 4)} />
              <path d={sparkle(66, 18, 3)} />
              <path d={sparkle(30, -4, 2.6)} />
            </g>
          ),
        },
        {
          name: 'staffArm',
          parts: ['M55 53 Q63 60 68 76 L64 79 Q59 66 52 60 Z'],
          children: [
            {
              // Посох поворачивается в кисти: рука поднимается, а навершие наклоняется вперёд
              name: 'staff',
              parts: [
                'M69.2 6 L71.6 6.4 L68.4 136 L66 135.8 Z',
                'M70.2 8 Q66 4 63.6 -2 L65 -2.8 Q67.8 2 71 5.6 Z M70.8 8 Q74.2 3 77.4 0 L78.4 1 Q75.2 5 71.8 9 Z',
                CRYSTAL,
                'M64 79.5 a2.6 2.6 0 1 0 5.2 0 a2.6 2.6 0 1 0 -5.2 0 Z',
              ],
              light: (
                <>
                  <Glow className="rig-glow" x={70.4} y={1} r={22} light="ice" />
                  <path className="rig-core" d={CRYSTAL} fill="#eef8ff" filter="url(#sil-glow)" />
                  <circle className="rig-burst" cx="70.4" cy="1" r="10" fill="none" stroke="#cfe9ff" strokeWidth="1.4" />
                  <g className="rig-smoke" fill="#8a93a6">
                    <circle cx="70" cy="-6" r="3" />
                    <circle cx="73" cy="-10" r="2.4" />
                    <circle cx="68" cy="-12" r="2" />
                  </g>
                </>
              ),
            },
          ],
        },
      ],
    },
  ],
};
