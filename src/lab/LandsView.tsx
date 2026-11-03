import { noirKit } from './kits/noir';
import { LANDS } from './lands';

/** Правила стиля «Сумрак»: по ним рисуется всё остальное */
const RULES: [string, string][] = [
  ['Один главный свет', 'В каждой сцене одна «лампа»: луна, рассвет, зарево. Край силуэтов подсвечен с её стороны и её цветом.'],
  ['Силуэт без деталей', 'Фигуры почти чёрные, внутри ничего не рисуется. Персонажа узнают по форме: шляпа, посох, цилиндр, трость.'],
  ['Цвет — у магии', 'Окружение приглушённое. Насыщенный цвет только у магии и у того, с чем работает игрок: кристаллы, руны, огни, цели уровня.'],
  ['Глубина планами', '3–5 планов: чем дальше, тем светлее и туманнее. Между планами — дымка.'],
  ['Медленное движение', 'Туман, облака и пыль плывут медленно. Быстро двигаются только огонь и магия.'],
  ['Взрослые пропорции', 'Голова около 1/8 роста, острые углы, лица в тени. Никаких круглых «мультяшных» форм.'],
  ['Шрифты', 'Заголовки — Cormorant Garamond заглавными с разрядкой. Текст и код — Golos Text и моноширинный.'],
  ['Лёгкий режим', 'Без зерна, лучей, тумана и частиц: остаются силуэты и свет. Для слабых компьютеров.'],
];

export function LandsView() {
  return (
    <section className="lands kit-noir" aria-label="Свет земель">
      <header className="lands__head">
        <h2 className="board__name">Свет земель</h2>
        <p className="board__about">Один стиль — пять освещений. Земля узнаётся по свету и по одному ориентиру в кадре.</p>
      </header>
      <div className="lands__grid">
        {LANDS.map((land) => (
          <figure key={land.id} className="land-card">
            <svg viewBox="0 0 800 360" role="img" aria-label={land.name}>
              {land.scene}
              {noirKit.sceneOverlay}
            </svg>
            <figcaption className="land-card__caption">
              <h3 className="panel__title">{land.name}</h3>
              <p>{land.light}</p>
              <p className="land-card__landmark">{land.landmark}</p>
              <ul className="land-card__palette" aria-label="Палитра">
                {land.palette.map((color) => (
                  <li key={color} style={{ background: color }} title={color} />
                ))}
              </ul>
            </figcaption>
          </figure>
        ))}
      </div>
      <section className="panel guide" aria-label="Правила стиля">
        <h3 className="panel__title">Правила стиля</h3>
        <dl className="guide__list">
          {RULES.map(([term, text]) => (
            <div key={term} className="guide__rule">
              <dt>{term}</dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
      </section>
    </section>
  );
}
