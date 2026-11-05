import { useEffect, useRef, useState } from 'react';
import type { StoryFrame } from '../engine/types';
import { startAmbience, stopAmbience } from '../game/ambience';
import { useSettings } from '../game/settings';
import { sfx } from '../game/sound';
import { Portrait } from './Portrait';
import { StoryArt } from './StoryArt';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Сколько кадр проявляется из черноты и сколько идёт перекрёстное затемнение (должно совпадать с noir.css) */
const FADE_MS = 700;

/** Пауза после фразы и после запятой: речь дышит. Только в «Сумраке» */
const PAUSE_END = 320;
const PAUSE_COMMA = 140;

/** Пауза после букв, напечатанных в промежутке [from, to): знак препинания считается, только если за ним пробел или конец */
function pauseAfter(text: string, from: number, to: number): number {
  let pause = 0;
  for (let i = Math.max(0, from); i < to; i++) {
    const next = text[i + 1];
    if (next !== undefined && !/[\s»”"')]/.test(next)) continue;
    if (/[.!?…]/.test(text[i])) pause = Math.max(pause, PAUSE_END);
    else if (/[,;:—]/.test(text[i])) pause = Math.max(pause, PAUSE_COMMA);
  }
  return pause;
}

interface TypewriterProps {
  text: string;
  /** Кто говорит: от него зависят голос и темп. Рассказчик — без голоса */
  speaker?: string;
  /** «Сумрак»: паузы на знаках препинания, Лорд Дефолт говорит медленнее */
  cinema: boolean;
  onTyping: (typing: boolean) => void;
}

/** Текст появляется по буквам, как в старых RPG. Клик — показать сразу весь. onTyping — печатается ли сейчас. */
function Typewriter({ text, speaker, cinema, onTyping }: TypewriterProps) {
  const [shown, setShown] = useState(() => (reducedMotion() ? text.length : 0));
  const typing = shown < text.length;

  useEffect(() => {
    onTyping(typing);
  }, [typing, onTyping]);

  useEffect(() => {
    if (shown >= text.length) return;
    // Персонаж «бормочет», пока печатается его реплика; рассказчик в «Сумраке» молчит
    if (shown % 6 === 0 && (speaker || !cinema)) sfx.blip(speaker);
    const base = cinema && speaker === 'default' ? 44 : 22;
    const wait = base + (cinema ? pauseAfter(text, shown - 2, shown) : 0);
    const timer = setTimeout(() => setShown((n) => Math.min(text.length, n + 2)), wait);
    return () => clearTimeout(timer);
  }, [shown, text, speaker, cinema]);

  return (
    <p className="story__text" onClick={() => setShown(text.length)}>
      {text.slice(0, shown)}
      {/* Скринридер сразу получает весь текст */}
      <span className="visually-hidden">{text.slice(shown)}</span>
    </p>
  );
}

interface StorySceneProps {
  title: string;
  frames: StoryFrame[];
  finishLabel: string;
  onClose: () => void;
}

/** Сценка из нескольких кадров в окне поверх игры. В «Сумраке» — кинозал: шторки, камера, кадры перетекают друг в друга. */
export function StoryScene({ title, frames, finishLabel, onClose }: StorySceneProps) {
  const { look, effects } = useSettings();
  const cinema = look === 'noir';
  // Кадры перетекают, только если движение уместно: полные эффекты и игроку оно не мешает
  const motion = cinema && effects === 'full' && !reducedMotion();
  const [index, setIndex] = useState(0);
  // Кадры на экране: при смене старый остаётся под новым, пока тот проявляется. Не пересоздаётся — значит, его звуки не повторяются
  const [shots, setShots] = useState([0]);
  // Пока печатается реплика, персонаж открывает рот
  const [typing, setTyping] = useState(true);
  const nextRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef(onClose);
  const frame = frames[index];
  const last = index === frames.length - 1;

  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    nextRef.current?.focus({ preventScroll: true });
  }, [index]);

  useEffect(() => {
    if (!cinema) return;
    startAmbience();
    return stopAmbience;
  }, [cinema]);

  useEffect(() => {
    if (shots.length < 2) return;
    const timer = setTimeout(() => setShots([index]), FADE_MS + 100);
    return () => clearTimeout(timer);
  }, [shots, index]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const advance = () => {
    if (last) return onClose();
    setShots(motion ? [index, index + 1] : [index + 1]);
    setIndex(index + 1);
  };

  return (
    <div className="story" role="dialog" aria-modal="true" aria-label={title}>
      <div className="story__window px-panel">
        <p className="story__title">
          {title} · {index + 1} из {frames.length}
        </p>
        <div className="story__stage">
          {shots.map((i) => (
            <div key={i} className={['story__shot', motion && 'story__shot--fade', i !== index && 'story__shot--out'].filter(Boolean).join(' ')}>
              <StoryArt art={frames[i].art} speaker={frames[i].speaker} talking={i === index && typing} text={frames[i].text} />
            </div>
          ))}
          {cinema && (
            <>
              <span className="story__bar story__bar--top" aria-hidden="true" />
              <span className="story__bar story__bar--bottom" aria-hidden="true" />
              {index === 0 && (
                <p className="story__titlecard" aria-hidden="true">
                  {title}
                </p>
              )}
            </>
          )}
        </div>
        <div className={['story__caption', frame.speaker === 'default' && 'story__caption--villain'].filter(Boolean).join(' ')}>
          {frame.speaker && <Portrait id={frame.speaker} scale={3} talking={typing} />}
          <div>
            {frame.name && <p className="story__name">{frame.name}</p>}
            <Typewriter key={index} text={frame.text} speaker={frame.speaker} cinema={cinema} onTyping={setTyping} />
          </div>
        </div>
        <div className="story__actions">
          {!last && (
            <button type="button" className="text-button" onClick={onClose}>
              Пропустить
            </button>
          )}
          <button ref={nextRef} type="button" className="button button--cast" onClick={advance}>
            {last ? finishLabel : 'Дальше →'}
          </button>
        </div>
      </div>
    </div>
  );
}
