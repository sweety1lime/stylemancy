import { useEffect, useRef, useState } from 'react';
import type { StoryFrame } from '../engine/types';
import { Portrait } from './Portrait';
import { StoryArt } from './StoryArt';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Текст появляется по буквам, как в старых RPG. Клик — показать сразу весь. */
function Typewriter({ text }: { text: string }) {
  const [shown, setShown] = useState(() => (reducedMotion() ? text.length : 0));

  useEffect(() => {
    if (shown >= text.length) return;
    const timer = setTimeout(() => setShown((n) => Math.min(text.length, n + 2)), 22);
    return () => clearTimeout(timer);
  }, [shown, text]);

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

/** Сценка из нескольких кадров в окне поверх игры. */
export function StoryScene({ title, frames, finishLabel, onClose }: StorySceneProps) {
  const [index, setIndex] = useState(0);
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
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="story" role="dialog" aria-modal="true" aria-label={title}>
      <div className="story__window px-panel">
        <p className="story__title">
          {title} · {index + 1} из {frames.length}
        </p>
        <StoryArt art={frame.art} speaker={frame.speaker} />
        <div className="story__caption">
          {frame.speaker && <Portrait id={frame.speaker} scale={3} />}
          <div>
            {frame.name && <p className="story__name">{frame.name}</p>}
            <Typewriter key={index} text={frame.text} />
          </div>
        </div>
        <div className="story__actions">
          {!last && (
            <button type="button" className="text-button" onClick={onClose}>
              Пропустить
            </button>
          )}
          <button
            ref={nextRef}
            type="button"
            className="button button--cast"
            onClick={() => (last ? onClose() : setIndex(index + 1))}
          >
            {last ? finishLabel : 'Дальше →'}
          </button>
        </div>
      </div>
    </div>
  );
}
