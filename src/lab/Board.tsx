import type { ReactNode } from 'react';
import { COPY } from './copy';

export interface BoardProps {
  id: string;
  name: string;
  about: string;
  traits: string[];
  scene: ReactNode;
  portrait: ReactNode;
  dungeon: ReactNode;
  /** Готовые иконки из набора в этом стиле */
  ready?: ReactNode;
}

/** Макет примерочной: сцена сюжета, диалог с наставником и подземелье. */
export function Board({ id, name, about, traits, scene, portrait, dungeon, ready }: BoardProps) {
  return (
    <section className={`board kit-${id}`} aria-label={name}>
      <header className="board__head">
        <h2 className="board__name">{name}</h2>
        <p className="board__about">{about}</p>
        <ul className="board__traits">
          {traits.map((trait) => (
            <li key={trait}>{trait}</li>
          ))}
        </ul>
      </header>
      <figure className="board__scene">{scene}</figure>
      <div className="board__row">
        <article className="panel dialog">
          <div className="dialog__portrait">{portrait}</div>
          <div className="dialog__body">
            <h3 className="dialog__name">{COPY.name}</h3>
            <p className="dialog__title">{COPY.title}</p>
            <p className="dialog__text">{COPY.text}</p>
            <pre className="dialog__code">{COPY.code}</pre>
            <button type="button" className="btn">
              {COPY.button}
            </button>
          </div>
        </article>
        <article className="panel dungeon-panel">
          <h3 className="panel__title">{COPY.dungeon}</h3>
          {dungeon}
        </article>
      </div>
      {ready && (
        <div className="panel ready">
          <h3 className="panel__title">Готовые иконки в этом стиле</h3>
          {ready}
          <p className="ready__credit">Иконки: game-icons.net (Lorc, Delapouite), лицензия CC BY 3.0. Стиль наложен кодом.</p>
        </div>
      )}
    </section>
  );
}
