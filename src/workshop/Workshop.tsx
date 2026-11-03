import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { Sprite } from '../pixel/pixelArt';
import { collectEntries, collectPalette, entryUsesColor, usedLetters, type Entry, type PaletteColor } from './collect';
import { cssOf, deltaE, hueOrder, parseColor, type Rgba } from './color';
import { ImportBox } from './ImportBox';
import { downloadBlob, downloadPng, framesRowsCode, gplFile, hexFile } from './png';
import { SpriteView } from './SpriteView';

/*
  Мастерская спрайтов: все рисунки игры на одной странице, выгрузка в PNG для пиксельных редакторов
  и обратно — PNG в строки для sprites.ts. Открывается только в режиме разработки: npm run sprites.
*/

type Backdrop = 'night' | 'panel' | 'light' | 'check';

const BACKDROPS: { id: Backdrop; label: string }[] = [
  { id: 'night', label: 'Ночь' },
  { id: 'panel', label: 'Панель' },
  { id: 'light', label: 'Светлый' },
  { id: 'check', label: 'Клетка' },
];

/** Увеличение для карточки: рисунок около 72 px по большей стороне. */
function cardScale(entry: Entry): number {
  return Math.max(1, Math.min(6, Math.floor(72 / Math.max(entry.width, entry.height))));
}

/** Увеличение для крупного просмотра: до 320 px по большей стороне. */
function detailScale(entry: Entry): number {
  return Math.max(1, Math.min(16, Math.floor(320 / Math.max(entry.width, entry.height))));
}

/** Состояние страницы живёт в адресе: после перезагрузки (и правки sprites.ts) открыт тот же спрайт. */
function readHash(): { tab: 'sprites' | 'palette'; selected: string | null } {
  const value = decodeURIComponent(window.location.hash.slice(1));
  if (value === 'palette') return { tab: 'palette', selected: null };
  return { tab: 'sprites', selected: value || null };
}

export function Workshop() {
  // При правке sprites.ts модуль перезагружается, а Fast Refresh пересчитывает useMemo без оглядки на зависимости
  const entries = useMemo(() => collectEntries(), []);
  const palette = useMemo(() => collectPalette(entries), [entries]);
  const [{ tab, selected }, setView] = useState(readHash);
  const [query, setQuery] = useState('');
  const [backdrop, setBackdrop] = useState<Backdrop>('night');
  const [colorFilter, setColorFilter] = useState<string | null>(null);

  useEffect(() => {
    const onHash = () => setView(readHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = (next: { tab: 'sprites' | 'palette'; selected: string | null }) => {
    const hash = next.tab === 'palette' ? '#palette' : next.selected ? `#${encodeURIComponent(next.selected)}` : '';
    history.replaceState(null, '', hash || window.location.pathname);
    setView(next);
  };

  const visible = entries.filter(
    (entry) =>
      entry.id.toLowerCase().includes(query.trim().toLowerCase()) && (!colorFilter || entryUsesColor(entry, colorFilter)),
  );
  const current = selected === 'new' ? null : entries.find((entry) => entry.id === selected);
  const projectColors = useMemo(() => palette.map((color) => color.rgba), [palette]);

  return (
    <div className={`ws ws--${backdrop}`}>
      <header className="ws-head">
        <h1 className="ws-head__title">Мастерская спрайтов</h1>
        <p className="ws-head__meta">
          {entries.length} спрайтов · {palette.length} цветов
        </p>
        <nav className="ws-tabs" aria-label="Разделы">
          <button type="button" className={`chip${tab === 'sprites' ? ' chip--on' : ''}`} onClick={() => go({ tab: 'sprites', selected })}>
            Спрайты
          </button>
          <button type="button" className={`chip${tab === 'palette' ? ' chip--on' : ''}`} onClick={() => go({ tab: 'palette', selected: null })}>
            Палитра
          </button>
        </nav>
        <div className="ws-head__tools">
          <span className="ws-label">Фон</span>
          {BACKDROPS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`chip${backdrop === item.id ? ' chip--on' : ''}`}
              onClick={() => setBackdrop(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {tab === 'palette' ? (
        <PaletteView
          palette={palette}
          onPick={(key) => {
            setColorFilter(key);
            go({ tab: 'sprites', selected: null });
          }}
        />
      ) : (
        <div className={selected ? 'ws-body ws-body--open' : 'ws-body'}>
          <section className="ws-list" aria-label="Спрайты">
            <div className="ws-list__bar">
              <input
                className="ws-input"
                type="search"
                placeholder="Поиск: HERO, GEMS.ruby…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              {colorFilter && (
                <button type="button" className="chip chip--on ws-color-chip" onClick={() => setColorFilter(null)}>
                  <span className="ws-swatch" style={{ background: colorFilter }} />
                  {colorFilter} ✕
                </button>
              )}
              <button type="button" className="button button--cast button--small" onClick={() => go({ tab: 'sprites', selected: 'new' })}>
                Новый из PNG
              </button>
            </div>
            <div className="ws-grid">
              {visible.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className={`ws-card${entry.id === selected ? ' ws-card--on' : ''}`}
                  onClick={() => go({ tab: 'sprites', selected: entry.id })}
                >
                  <span className="ws-card__art ws-stage">
                    <SpriteView frames={entry.frames} scale={cardScale(entry)} />
                  </span>
                  <span className="ws-card__name">{entry.id}</span>
                  <span className="ws-card__meta">
                    {entry.width}×{entry.height}
                    {entry.frames.length > 1 && ` · ${entry.frames.length} кадр.`}
                  </span>
                </button>
              ))}
              {!visible.length && <p className="ws-empty">Ничего не нашлось</p>}
            </div>
          </section>

          {selected === 'new' && (
            <aside className="ws-panel" aria-label="Новый спрайт">
              <PanelHead title="Новый спрайт из PNG" onClose={() => go({ tab: 'sprites', selected: null })} />
              <ImportBox key="new" projectColors={projectColors} />
            </aside>
          )}
          {current && (
            <aside className="ws-panel" aria-label={current.id}>
              <SpriteDetail key={current.id} entry={current} projectColors={projectColors} onClose={() => go({ tab: 'sprites', selected: null })} />
            </aside>
          )}
        </div>
      )}
    </div>
  );
}

function PanelHead({ title, meta, onClose }: { title: string; meta?: string; onClose: () => void }) {
  return (
    <div className="ws-panel__head">
      <div>
        <h2 className="ws-panel__title">{title}</h2>
        {meta && <p className="ws-panel__meta">{meta}</p>}
      </div>
      <button type="button" className="chip" onClick={onClose} aria-label="Закрыть">
        ✕
      </button>
    </div>
  );
}

/** Приглушить все цвета, кроме выбранной буквы: видно, где она стоит в рисунке. */
function highlight(frames: Sprite[], letter: string | null): Sprite[] {
  if (!letter) return frames;
  const palette = Object.fromEntries(
    Object.entries(frames[0].palette).map(([ch, css]) => {
      if (ch === letter) return [ch, css];
      const [r, g, b, a] = parseColor(css);
      return [ch, cssOf([r, g, b, Math.round(a * 0.18)])];
    }),
  );
  return frames.map((frame) => ({ rows: frame.rows, palette }));
}

function SpriteDetail({ entry, projectColors, onClose }: { entry: Entry; projectColors: Rgba[]; onClose: () => void }) {
  const [scale, setScale] = useState(() => detailScale(entry));
  const [fps, setFps] = useState(6);
  const [still, setStill] = useState(false);
  const [letter, setLetter] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const shown = useMemo(() => highlight(entry.frames, letter), [entry, letter]);
  const counts = useMemo(() => usedLetters(entry.frames), [entry]);
  const palette = entry.frames[0].palette;
  const fileName = entry.id.replace(/\W+/g, '_').toLowerCase();
  const animated = entry.frames.length > 1;

  const copyRows = async () => {
    await navigator.clipboard.writeText(framesRowsCode(entry.frames));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <PanelHead
        title={entry.id}
        meta={`${entry.width}×${entry.height}${animated ? ` · ${entry.frames.length} кадр.` : ''} · ${counts.size} цв.`}
        onClose={onClose}
      />

      <div className="ws-preview ws-stage">
        <SpriteView frames={shown} scale={scale} fps={fps} still={still} />
      </div>

      <div className="ws-controls">
        <label className="ws-field">
          <span className="ws-label">Увеличение ×{scale}</span>
          <input type="range" min={1} max={16} value={scale} onChange={(event) => setScale(Number(event.target.value))} />
        </label>
        {animated && (
          <>
            <label className="ws-field">
              <span className="ws-label">Кадров в секунду: {fps}</span>
              <input type="range" min={1} max={16} value={fps} onChange={(event) => setFps(Number(event.target.value))} />
            </label>
            <label className="ws-check">
              <input type="checkbox" checked={still} onChange={(event) => setStill(event.target.checked)} />
              Все кадры рядом
            </label>
          </>
        )}
      </div>

      <h3 className="ws-subtitle">Палитра</h3>
      <p className="ws-hint">Нажми на букву: остальные цвета притухнут, и видно, где она в рисунке.</p>
      <div className="ws-letters">
        {Object.entries(palette).map(([ch, css]) => (
          <button
            key={ch}
            type="button"
            className={`ws-letter${letter === ch ? ' ws-letter--on' : ''}${counts.has(ch) ? '' : ' ws-letter--unused'}`}
            onClick={() => setLetter(letter === ch ? null : ch)}
            title={counts.has(ch) ? `${counts.get(ch)} пикс.` : 'В рисунке не встречается'}
          >
            <span className="ws-swatch" style={{ background: css }} />
            <b>{ch}</b>
            <span>{css}</span>
          </button>
        ))}
      </div>

      <h3 className="ws-subtitle">В редактор</h3>
      <p className="ws-hint">
        {animated ? 'Кадры лентой слева направо. ' : ''}PNG 1× — для Piskel и Aseprite, крупный — посмотреть или показать.
      </p>
      <div className="button-row">
        <button type="button" className="button button--ghost button--small" onClick={() => downloadPng(entry.frames, 1, `${fileName}.png`)}>
          PNG 1×
        </button>
        <button type="button" className="button button--ghost button--small" onClick={() => downloadPng(entry.frames, 8, `${fileName}@8x.png`)}>
          PNG 8×
        </button>
        <button type="button" className="button button--ghost button--small" onClick={copyRows}>
          {copied ? 'Скопировано' : 'Строки в буфер'}
        </button>
      </div>

      <h3 className="ws-subtitle">Из редактора</h3>
      <ImportBox base={entry.frames} name={entry.id} projectColors={projectColors} />
    </>
  );
}

const PAIR_LIMIT = 60;

function PaletteView({ palette, onPick }: { palette: PaletteColor[]; onPick: (key: string) => void }) {
  const [threshold, setThreshold] = useState(3);
  const sorted = useMemo(
    () =>
      [...palette].sort((a, b) => {
        const [ga, ha, la] = hueOrder(a.rgba);
        const [gb, hb, lb] = hueOrder(b.rgba);
        return ga - gb || ha - hb || la - lb;
      }),
    [palette],
  );
  const pairs = useMemo(() => {
    const out: { a: PaletteColor; b: PaletteColor; delta: number }[] = [];
    for (let i = 0; i < palette.length; i++) {
      for (let j = i + 1; j < palette.length; j++) {
        const delta = deltaE(palette[i].rgba, palette[j].rgba);
        if (delta < threshold) out.push({ a: palette[i], b: palette[j], delta });
      }
    }
    return out.sort((x, y) => x.delta - y.delta);
  }, [palette, threshold]);
  const opaque = useMemo(() => {
    const seen = new Set<string>();
    return sorted
      .map((color): Rgba => [color.rgba[0], color.rgba[1], color.rgba[2], 255])
      .filter((rgba) => {
        const key = rgba.join(',');
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [sorted]);

  return (
    <section className="ws-palette">
      <div className="ws-palette__bar">
        <p className="ws-hint">
          {palette.length} цветов во всех спрайтах. Нажми на цвет — откроются спрайты, где он есть. Палитру можно открыть в редакторе
          и рисовать ровно этими цветами.
        </p>
        <div className="button-row">
          <button
            type="button"
            className="button button--ghost button--small"
            onClick={() => downloadBlob(new Blob([gplFile('Стилемантия', opaque)], { type: 'text/plain' }), 'stylemancy.gpl')}
          >
            Палитра .gpl
          </button>
          <button
            type="button"
            className="button button--ghost button--small"
            onClick={() => downloadBlob(new Blob([hexFile(opaque)], { type: 'text/plain' }), 'stylemancy.hex')}
          >
            Палитра .hex
          </button>
        </div>
      </div>

      <div className="ws-swatches">
        {sorted.map((color) => (
          <button key={color.key} type="button" className="ws-color" onClick={() => onPick(color.key)} title={`${color.pixels} пикс.`}>
            <span className="ws-color__box" style={{ background: color.key }} />
            <span className="ws-color__css">{color.key}</span>
            <span className="ws-color__count">{color.entries.size} спр.</span>
          </button>
        ))}
      </div>

      <div className="ws-palette__pairs">
        <h3 className="ws-subtitle">Почти одинаковые цвета</h3>
        <label className="ws-field">
          <span className="ws-label">
            Разница меньше {threshold}: {pairs.length} пар
          </span>
          <input type="range" min={1} max={10} step={0.5} value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} />
        </label>
        <p className="ws-hint">Меньше 2 глаз почти не отличает, около 5 — разница заметна рядом. Такие пары обычно можно слить в один цвет.</p>
        <ul className="ws-pairs">
          {pairs.slice(0, PAIR_LIMIT).map(({ a, b, delta }) => (
            <li key={`${a.key}|${b.key}`} className="ws-pair">
              <PairColor color={a} onPick={onPick} />
              <span className="ws-pair__delta">{delta.toFixed(1)}</span>
              <PairColor color={b} onPick={onPick} />
            </li>
          ))}
        </ul>
        {pairs.length > PAIR_LIMIT && <p className="ws-hint">Показаны первые {PAIR_LIMIT}.</p>}
      </div>
    </section>
  );
}

function PairColor({ color, onPick }: { color: PaletteColor; onPick: (key: string) => void }) {
  const names = [...color.entries];
  return (
    <button type="button" className="ws-pair__color" onClick={() => onPick(color.key)}>
      <span className="ws-swatch ws-swatch--big" style={{ background: color.key } as CSSProperties} />
      <span>
        <code>{color.key}</code>
        <span className="ws-pair__where">
          {names.slice(0, 3).join(', ')}
          {names.length > 3 && ` и ещё ${names.length - 3}`}
        </span>
      </span>
    </button>
  );
}

