import { useState } from 'react';
import { SpriteAnim } from '../components/SpriteAnim';
import type { Sprite } from '../pixel/pixelArt';
import { HERO_ANIMATIONS, VILLAIN_ANIMATIONS } from '../pixel/sprites';
import { HERO_MOVES, HERO_RIG } from '../noir/rig/heroRig';
import { Rig } from '../noir/rig/Rig';
import type { Move, RigNode } from '../noir/rig/rigTypes';
import { VILLAIN_MOVES, VILLAIN_RIG } from '../noir/rig/villainRig';

/** Кадров в секунду у нынешних пиксельных анимаций — как в игре */
const PIXEL_FPS: Record<string, number> = { idle: 2, walk: 8 };

interface StageProps {
  title: string;
  note: string;
  kind: 'hero' | 'villain';
  rig: RigNode;
  moves: Move[];
  pixel: Record<string, Sprite[]>;
  box: { x: number; y: number; width: number; height: number; viewBox: string };
}

function Stage({ title, note, kind, rig, moves, pixel, box }: StageProps) {
  const [move, setMove] = useState(moves[0].id);
  return (
    <article className="panel cast-card">
      <h3 className="panel__title">{title}</h3>
      <p className="cast-card__note">{note}</p>
      <div className="cast-stage">
        <svg viewBox="0 0 400 300" role="img" aria-label={`${title}: ${moves.find((m) => m.id === move)?.label}`}>
          <rect width="400" height="300" fill="url(#noir-sky)" />
          <circle cx="318" cy="72" r="120" fill="url(#noir-halo)" />
          <circle cx="318" cy="72" r="22" fill="url(#noir-moon)" />
          <g className="a-drift" filter="url(#noir-mist)">
            <ellipse cx="200" cy="250" rx="220" ry="12" fill="#3a4560" opacity="0.35" />
          </g>
          <rect y="262" width="400" height="38" fill="#05060a" />
          <path d="M0 262 H400" stroke="#2a3550" strokeWidth="1" />
          {/* key — чтобы движение начиналось с начала при смене */}
          <Rig key={move} rig={rig} kind={kind} move={move} rim="noir-rim" {...box} />
          <rect width="400" height="300" fill="url(#noir-vignette)" />
          <rect width="400" height="300" filter="url(#noir-grain)" opacity="0.45" />
        </svg>
        <span className="cast-pixel" title="Так это движение выглядит в игре сейчас">
          <SpriteAnim key={move} frames={pixel[move]} fps={PIXEL_FPS[move] ?? 6} scale={2} />
          <small>сейчас</small>
        </span>
      </div>
      <div className="cast-moves" role="group" aria-label="Движения">
        {moves.map((item) => (
          <button key={item.id} type="button" className={`btn cast-move${item.id === move ? ' cast-move--on' : ''}`} aria-pressed={item.id === move} onClick={() => setMove(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
    </article>
  );
}

export function CastView() {
  return (
    <section className="lands kit-noir" aria-label="Персонажи">
      <header className="lands__head">
        <h2 className="board__name">Персонажи</h2>
        <p className="board__about">
          Герой и Лорд Дефолт на шарнирах: тело, голова, руки, плащ и цилиндр двигаются отдельно и плавно. Движения те же, что в игре сейчас.
        </p>
      </header>
      <div className="lands__grid">
        <Stage
          title="Ученик Академии"
          note="Покой, ходьба, заклинание, радость и «ой» — когда заклинание не вышло"
          kind="hero"
          rig={HERO_RIG}
          moves={HERO_MOVES}
          pixel={HERO_ANIMATIONS}
          box={{ x: 108, y: 51, width: 192, height: 228, viewBox: '-30 -40 160 190' }}
        />
        <Stage
          title="Лорд Дефолт"
          note="Ухмылка, хохот, злость и побег — как в сценках сюжета"
          kind="villain"
          rig={VILLAIN_RIG}
          moves={VILLAIN_MOVES}
          pixel={VILLAIN_ANIMATIONS}
          box={{ x: 104, y: 51, width: 192, height: 240, viewBox: '-30 -30 160 200' }}
        />
      </div>
    </section>
  );
}
