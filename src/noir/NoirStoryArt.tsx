import { useEffect, useState } from 'react';
import { sfx } from '../game/sound';
import { sparkle, type GemKind } from './geometry';
import { HERO_RIG } from './rig/heroRig';
import { VILLAIN_RIG } from './rig/villainRig';
import { Rig } from './rig/Rig';
import { BUSTS, type Pose } from './mentors';
import { NoirBust } from './NoirFace';
import { NoirStoryScene, ScriptSky } from './NoirStoryScenes';
import { NIGHT, NOIR_ISLAND, NOIR_SKY, NoirGem } from './scene';
import { GRAIN_SVG, svgUrl } from './scenes/kit';

/*
  Сценки сюжета в «Сумраке». Кадр 16:9 вырезан из сцены 800 × 360 по центру.
  Здесь — пролог островов (королевство, кристаллы рухнули, Лорд Дефолт, наставник, корона победы);
  кадры остальных земель — в NoirStoryScenes. Лорд Дефолт и наставники Скриптории стоят под её бирюзовым небом.
*/

/** Плёнка поверх кадра: зерно и виньетка */
const FILM = `${svgUrl(GRAIN_SVG)}, radial-gradient(ellipse 80% 75% at 50% 45%, transparent 55%, rgba(0, 0, 0, 0.55) 100%)`;

/** Наставники Скриптории: их кадр — под небом Скриптории */
const SCRIPT_MENTORS = new Set(['oracle', 'typeof', 'if', 'for', 'return', 'push', 'key', 'query', 'click', 'tick']);

/** Кадры, которые рисует этот файл; остальные — NoirStoryScene */
const OWN = new Set(['kingdom', 'fallen', 'villain', 'villain-script', 'mentor', 'crown']);

const ROW: GemKind[] = ['amethyst', 'emerald', 'ruby'];
const CROWN: GemKind[] = ['amethyst', 'emerald', 'sapphire', 'ruby', 'topaz'];

/** Остров сцены: центр 400, трава около y = 256 */
const island = <g transform="translate(190 232)">{NOIR_ISLAND}</g>;

function Gem({ kind, x, y, delay = 0, cursed = false }: { kind: GemKind; x: number; y: number; delay?: number; cursed?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`} filter={cursed ? 'url(#noir-cursed)' : undefined}>
      <g className={cursed ? undefined : 'a-float'} style={{ animationDelay: `${delay}s` }}>
        <NoirGem kind={kind} />
      </g>
    </g>
  );
}

/** Лорд Дефолт во весь рост на острове: сначала хохочет или злится, потом ухмыляется */
function Villain({ mood }: { mood: 'laugh' | 'angry' }) {
  const [calm, setCalm] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setCalm(true), 2600);
    return () => clearTimeout(timer);
  }, []);
  const move = calm ? 'idle' : mood;
  return <Rig key={move} rig={VILLAIN_RIG} kind="villain" move={move} rim="noir-rim" fill={NIGHT} x={280} y={-7} width={240} height={300} viewBox="-30 -30 160 200" />;
}

/** Жест наставника по смыслу реплики: вопрос — подпирает подбородок, похвала — вскидывает руку */
function mentorPose(text = ''): Pose | null {
  if (/\?/.test(text)) return 'think';
  if (/молод|отлич|ура|получил|сработал|спас|побед|вот так|чудесн|прекрасн/i.test(text)) return 'joy';
  return null;
}

/** Окно рисунка героя: как у героя у кнопки «Сотворить» */
const HERO_BOX = '-30 -40 160 190';

/**
 * Герой в кадре сценки — отдельным слоем поверх картинки: его движение не перерисовывает всю сценку.
 * В кадре наставника и Лорда Дефолта он на переднем плане, «через плечо», размытый, как в кино;
 * в победном кадре — на острове: радуется, потом стоит спокойно.
 */
function StoryHero({ shot }: { shot: 'shoulder' | 'victory' }) {
  const [move, setMove] = useState(shot === 'victory' ? 'joy' : 'idle');
  useEffect(() => {
    if (move === 'idle') return;
    const timer = setTimeout(() => setMove('idle'), 2000);
    return () => clearTimeout(timer);
  }, [move]);
  return (
    <span className={`story-hero story-hero--${shot} noir-art`}>
      <Rig key={move} rig={HERO_RIG} kind="hero" move={move} rim="noir-rim" fill={NIGHT} x={0} y={0} width={160} height={190} viewBox={HERO_BOX} />
    </span>
  );
}

export function NoirStoryArt({
  art,
  speaker,
  mood = 'laugh',
  talking = false,
  text,
}: {
  art: string;
  speaker?: string;
  mood?: 'laugh' | 'angry';
  /** Пока печатается реплика — огоньки говорящего дышат чаще */
  talking?: boolean;
  text?: string;
}) {
  const shoulder = art === 'mentor' || art === 'villain' || art === 'villain-script';
  // Лорд Дефолт входит в кадр — низкий гул проклятия
  const cursed = art === 'villain' || art === 'villain-script' || art === 'fallen';
  useEffect(() => {
    if (cursed) sfx.curse();
  }, [cursed]);
  return (
    <div className={`story-art story-art--noir story-art--${art}`} aria-hidden="true">
      <div className="story-art__cam">
        <svg className="story-art__noir noir-art" viewBox="80 0 640 360" preserveAspectRatio="xMidYMid slice">
          {OWN.has(art) && (art === 'villain-script' || (art === 'mentor' && SCRIPT_MENTORS.has(speaker ?? '')) ? <ScriptSky /> : NOIR_SKY)}
          {!OWN.has(art) && <NoirStoryScene art={art} mood={mood} />}
          {art === 'kingdom' && (
            <>
              {island}
              {ROW.map((kind, i) => (
                <Gem key={kind} kind={kind} x={335 + i * 45} y={150} delay={i * -0.7} />
              ))}
            </>
          )}
          {/* Проклятие: кристаллы рухнули друг на друга и потухли, остров накренился */}
          {art === 'fallen' && (
            <>
              <g transform="rotate(6 400 300)">{island}</g>
              {ROW.map((kind, i) => (
                <Gem key={kind} kind={kind} x={380} y={86 + i * 52} cursed />
              ))}
            </>
          )}
          {(art === 'villain' || art === 'villain-script') && (
            <>
              {island}
              <Villain mood={mood} />
            </>
          )}
          {art === 'mentor' && (
            <>
              <g transform="translate(244 52) scale(2.6)" className={talking ? 'is-talking' : undefined}>
                <NoirBust key={text} bust={BUSTS[speaker ?? 'flex'] ?? BUSTS.flex} pose={mentorPose(text)} />
              </g>
              <path className="a-twinkle" d={`${sparkle(200, 90, 6)} ${sparkle(610, 140, 5)}`} fill="#e6eefc" filter="url(#sil-glow)" />
            </>
          )}
          {/* Победа: кристаллы снова горят — корона над островом, свет льётся вниз */}
          {art === 'crown' && (
            <>
              <circle cx="400" cy="170" r="200" fill="url(#noir-halo)" />
              {island}
              {CROWN.map((kind, i) => (
                <Gem key={kind} kind={kind} x={300 + i * 45} y={128 + Math.abs(i - 2) * 16} delay={i * -0.5} />
              ))}
            </>
          )}
        </svg>
        {art === 'crown' && <StoryHero shot="victory" />}
      </div>
      {shoulder && <StoryHero shot="shoulder" />}
      {/* Зерно плёнки и виньетка — картинкой поверх кадра: браузер рисует её один раз, а не каждый кадр вместе со сценкой */}
      <span className="story-art__film" style={{ backgroundImage: FILM }} />
      {(art === 'villain' || art === 'citadel') && (
        <>
          <span className="sa-default-text sa-default-text--1">Times New Roman</span>
          <span className="sa-default-text sa-default-text--2">синяя ссылка</span>
          {art === 'villain' && <span className="sa-default-text sa-default-text--3">&lt;div&gt;&lt;div&gt;&lt;div&gt;</span>}
        </>
      )}
      {/* В Скриптории вокруг Лорда Дефолта — значения по умолчанию из JavaScript */}
      {art === 'villain-script' && (
        <>
          <span className="sa-default-text sa-default-text--1 sa-default-text--script">undefined</span>
          <span className="sa-default-text sa-default-text--2 sa-default-text--script">NaN</span>
          <span className="sa-default-text sa-default-text--3 sa-default-text--script">null</span>
        </>
      )}
    </div>
  );
}
