import { useState } from 'react';
import { CSS_BLOCKS, HTML_BLOCKS, type LandBlock } from '../land/blocks';
import { PICTURE_LABELS } from '../land/pictures';
import type { LandImages } from '../land/sanitize';

type Section = 'pictures' | 'html' | 'css';

const SECTIONS: { id: Section; name: string; lead: string }[] = [
  {
    id: 'pictures',
    name: 'Картинки',
    lead: 'Нажми на картинку, и тег <img> встанет в код. Чужие картинки по ссылке в землю не вставить: берём только эти.',
  },
  { id: 'html', name: 'Блоки HTML', lead: 'Готовые куски разметки. Поменяй в них названия и текст под свою землю.' },
  {
    id: 'css',
    name: 'Блоки CSS',
    lead: 'Готовые куски стилей. Если в блоке есть класс (.cards, .sky, .star), добавь такой class тегу в разметке, иначе правило ничего не найдёт.',
  },
];

interface LandPaletteProps {
  images: LandImages;
  /** Вставить код в редактор нужного файла; gap — отделить пустой строкой */
  onInsert: (file: 'html' | 'css', code: string, gap?: boolean) => void;
}

/** Панель под редактором: картинки и готовые блоки кода. Клик вставляет кусок в код, дальше игрок правит его сам */
export function LandPalette({ images, onInsert }: LandPaletteProps) {
  const [section, setSection] = useState<Section>('pictures');
  const current = SECTIONS.find((item) => item.id === section) ?? SECTIONS[0];

  function blocks(list: LandBlock[], file: 'html' | 'css') {
    return (
      <ul className="land-palette__blocks">
        {list.map((block) => (
          <li key={block.id}>
            <button type="button" className="land-block" onClick={() => onInsert(file, block.code, file === 'css')}>
              <strong>{block.name}</strong>
              <span>{block.hint}</span>
            </button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="land-palette px-panel" aria-label="Блоки и картинки">
      <div className="land-palette__tabs" role="group" aria-label="Что вставить">
        {SECTIONS.map((item) => (
          <button key={item.id} type="button" className={section === item.id ? 'chip chip--on' : 'chip'} aria-pressed={section === item.id} onClick={() => setSection(item.id)}>
            {item.name}
          </button>
        ))}
      </div>
      <p className="land-palette__lead">{current.lead}</p>

      {section === 'pictures' && (
        <ul className="land-palette__pictures">
          {PICTURE_LABELS.map(({ name, label }) => (
            <li key={name}>
              <button type="button" className="land-picture" aria-label={`Вставить картинку ${label} (${name})`} onClick={() => onInsert('html', `<img src="${name}" alt="${label}">`)}>
                <img src={images[name]} alt="" />
                <span>{label}</span>
                <code>{name}</code>
              </button>
            </li>
          ))}
        </ul>
      )}
      {section === 'html' && blocks(HTML_BLOCKS, 'html')}
      {section === 'css' && blocks(CSS_BLOCKS, 'css')}
    </section>
  );
}
