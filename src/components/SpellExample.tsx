import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { withImages } from '../engine/htmlCheck';
import { runtimeProblem } from '../engine/jsLint';
import { runScript, type RunResult } from '../engine/jsRun';
import { recordExperiment } from '../game/achievements';
import type { SpellExample as Example, MarkupExample, ScriptExample, ValueExample, VariantsExample, WidthExample } from '../game/spells';
import { IMAGE_LIBRARY } from '../levels/shared/images';
import { OracleLine } from './JsScene';

/** Оформление мини-сцены примера: пиксельный контейнер и цветные пронумерованные блоки. */
const BASE_CSS = `
html, body { margin: 0; height: 100%; }
body { display: grid; place-items: center; background: #120b2e; }
.box {
  width: 280px; height: 132px; padding: 8px;
  background-color: rgba(124, 77, 255, 0.12);
  background-image: repeating-conic-gradient(rgba(255, 255, 255, 0.05) 0 25%, transparent 0 50%);
  background-size: 8px 8px;
  box-shadow: 0 0 0 3px #4c2aa8, 0 0 0 6px #1a1030;
}
.item {
  width: 40px; height: 40px;
  display: grid; place-items: center;
  font: bold 16px/1 monospace; color: #1a1030;
  box-shadow: inset -3px -3px 0 rgba(0, 0, 0, 0.25), inset 3px 3px 0 rgba(255, 255, 255, 0.35);
}
.item:nth-child(5n + 1) { background: #a78bfa; }
.item:nth-child(5n + 2) { background: #34d399; }
.item:nth-child(5n + 3) { background: #fb7185; }
.item:nth-child(5n + 4) { background: #60a5fa; }
.item:nth-child(5n + 5) { background: #fbbf24; }
`;

/** В примерах с медиазапросами контейнер занимает весь «экран», а блоки крупнее. */
const SCREEN_CSS = `
body { place-items: stretch; }
.box { width: auto; height: auto; margin: 24px; padding: 16px; }
.item { width: 72px; height: 72px; font-size: 28px; }
`;

/** Высота «экрана» в примерах с медиазапросами — внутри, до уменьшения */
const SCREEN_HEIGHT = 360;

const THREE_ITEMS = '<div class="box"><div class="item">1</div><div class="item">2</div><div class="item">3</div></div>';

function exampleDocument(css: string, live: string, html: string | undefined): string {
  return (
    `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}${css}</style>` +
    `<style id="live">${live}</style></head><body>${html ?? THREE_ITEMS}</body></html>`
  );
}

function declarations(option: string): string[] {
  return option
    .split(';')
    .map((decl) => decl.trim())
    .filter(Boolean);
}

function ruleText(selector: string, option: string): string {
  return `${selector} {\n${declarations(option)
    .map((decl) => `  ${decl};`)
    .join('\n')}\n}`;
}

/** На кнопке — только значение, если объявление одно; иначе всё целиком. */
function chipLabel(option: string): string {
  const decls = declarations(option);
  return decls.length === 1 ? decls[0].slice(decls[0].indexOf(':') + 1).trim() : decls.join('; ');
}

/** Живой пример заклинания: нажимаешь на значение или ширину экрана — мини-сцена сразу меняется. */
export function SpellExample({ spell, example }: { spell: string; example: Example }) {
  if ('scripts' in example) return <ScriptDemo spell={spell} example={example} />;
  if ('markup' in example) return <MarkupDemo spell={spell} example={example} />;
  if ('variants' in example) return <VariantsDemo spell={spell} example={example} />;
  return 'widths' in example ? <WidthDemo spell={spell} example={example} /> : <ValueDemo spell={spell} example={example} />;
}

/** Пример-скрипт: кнопки переключают варианты кода, код выполняется по-настоящему, и Оракул говорит, что вышло. */
function ScriptDemo({ spell, example }: { spell: string; example: ScriptExample }) {
  const [selected, setSelected] = useState(example.initial ?? 0);
  const [result, setResult] = useState<RunResult | null>(null);
  const { code, inputs } = example.scripts[selected];

  useEffect(() => {
    let cancelled = false;
    void runScript(code, { inputs }).then((next) => !cancelled && setResult(next));
    return () => {
      cancelled = true;
    };
  }, [code, inputs]);

  function choose(index: number) {
    setSelected(index);
    setResult(null);
    recordExperiment(spell);
  }

  const failure = result?.error && runtimeProblem(code, result.error);
  return (
    <div className="example example--script">
      <div className="example__chips" role="group" aria-label="Варианты">
        {example.scripts.map((script, i) => (
          <button
            key={script.label}
            type="button"
            className={i === selected ? 'chip chip--on' : 'chip'}
            aria-pressed={i === selected}
            onClick={() => choose(i)}
          >
            {script.label}
          </button>
        ))}
      </div>
      <pre className="example__code">
        <code>{code}</code>
      </pre>
      <ol className="example__oracle oracle-scroll__lines" aria-label="Что сказал Оракул">
        {result?.output.map((line, i) => (
          <OracleLine key={i} line={line} />
        ))}
        {failure && <li className="oracle-line oracle-line--error">✖ {failure.message}</li>}
        {result && !failure && result.output.length === 0 && <li className="oracle-line oracle-line--empty">Оракул молчит</li>}
      </ol>
    </div>
  );
}

/** Пример с вариантами CSS: кнопки меняют правила целиком — селектор, порядок или силу правил. */
function VariantsDemo({ spell, example }: { spell: string; example: VariantsExample }) {
  const initial = example.initial ?? 0;
  const [selected, setSelected] = useState(initial);
  const selectedRef = useRef(initial);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const srcDoc = useMemo(() => exampleDocument(example.css ?? '', example.variants[initial].css, example.html), [example, initial]);

  function show(index: number) {
    const style = frameRef.current?.contentDocument?.getElementById('live');
    if (style) style.textContent = example.variants[index].css;
  }

  function choose(index: number) {
    selectedRef.current = index;
    setSelected(index);
    show(index);
    recordExperiment(spell);
  }

  return (
    <div className="example">
      <div className="example__chips" role="group" aria-label="Варианты">
        {example.variants.map((variant, i) => (
          <button
            key={variant.label}
            type="button"
            className={i === selected ? 'chip chip--on' : 'chip'}
            aria-pressed={i === selected}
            onClick={() => choose(i)}
          >
            {variant.label}
          </button>
        ))}
      </div>
      <iframe
        ref={frameRef}
        className="example__preview"
        title={`Живой пример: ${spell}`}
        sandbox="allow-same-origin"
        srcDoc={srcDoc}
        onLoad={() => show(selectedRef.current)}
      />
      <pre className="example__code">
        <code>{example.variants[selected].css}</code>
      </pre>
    </div>
  );
}

/** Мини-страница для примеров с разметкой — с оформлением браузера по умолчанию. */
const MARKUP_PAGE_CSS = `
html { background: #e8e6df; }
body { margin: 10px 14px; color: #1c1c24; font: 15px/1.4 "Times New Roman", Times, serif; }
table { border-collapse: collapse; }
th, td { padding: 2px 8px; border: 1px solid #8a8a8a; }
`;

/** Пример с разметкой: кнопки переключают варианты HTML, мини-страница сразу показывает результат. */
function MarkupDemo({ spell, example }: { spell: string; example: MarkupExample }) {
  const [selected, setSelected] = useState(example.initial ?? 0);
  const variant = example.markup[selected];
  const srcDoc = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><style>${MARKUP_PAGE_CSS}</style></head><body>${withImages(variant.html, IMAGE_LIBRARY)}</body></html>`;

  function choose(index: number) {
    setSelected(index);
    recordExperiment(spell);
  }

  return (
    <div className="example">
      {example.markup.length > 1 && (
        <div className="example__chips" role="group" aria-label="Варианты разметки">
          {example.markup.map((option, i) => (
            <button
              key={option.label}
              type="button"
              className={i === selected ? 'chip chip--on' : 'chip'}
              aria-pressed={i === selected}
              onClick={() => choose(i)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
      <iframe className="example__preview" title={`Живой пример: ${spell}`} sandbox="" srcDoc={srcDoc} />
      <pre className="example__code">
        <code>{variant.html}</code>
      </pre>
    </div>
  );
}

function ValueDemo({ spell, example }: { spell: string; example: ValueExample }) {
  const initial = example.initial ?? 0;
  const [selected, setSelected] = useState(initial);
  const selectedRef = useRef(initial);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const srcDoc = useMemo(
    () => exampleDocument(example.css ?? '', ruleText(example.selector, example.options[example.initial ?? 0]), example.html),
    [example],
  );

  function show(index: number) {
    const style = frameRef.current?.contentDocument?.getElementById('live');
    if (style) style.textContent = ruleText(example.selector, example.options[index]);
  }

  function choose(index: number) {
    selectedRef.current = index;
    setSelected(index);
    show(index);
    recordExperiment(spell);
  }

  return (
    <div className="example">
      <div className="example__chips" role="group" aria-label="Значения">
        {example.options.map((option, i) => (
          <button
            key={option}
            type="button"
            className={i === selected ? 'chip chip--on' : 'chip'}
            aria-pressed={i === selected}
            onClick={() => choose(i)}
          >
            {chipLabel(option)}
          </button>
        ))}
      </div>
      <iframe
        ref={frameRef}
        className="example__preview"
        title={`Живой пример: ${spell}`}
        sandbox="allow-same-origin"
        srcDoc={srcDoc}
        onLoad={() => show(selectedRef.current)}
      />
      <pre className="example__code">
        <code>{ruleText(example.selector, example.options[selected])}</code>
      </pre>
    </div>
  );
}

/** Срабатывает ли медиазапрос вида (min-width: 600px) and (max-width: 900px) на такой ширине. */
function mediaMatches(query: string, width: number): boolean {
  return Array.from(query.matchAll(/\((min|max)-width:\s*(\d+)px\)/g)).every(([, kind, value]) =>
    kind === 'min' ? width >= Number(value) : width <= Number(value),
  );
}

/** Пример с медиазапросом: код не меняется, а кнопки сужают и расширяют «экран». */
function WidthDemo({ spell, example }: { spell: string; example: WidthExample }) {
  const [selected, setSelected] = useState(example.initial ?? 0);
  const boxRef = useRef<HTMLDivElement>(null);
  const [boxWidth, setBoxWidth] = useState(340);
  const srcDoc = useMemo(() => exampleDocument(SCREEN_CSS + (example.css ?? ''), example.code, example.html), [example]);
  const queries = useMemo(() => Array.from(example.code.matchAll(/@media\s*([^{]+?)\s*\{/g), (match) => match[1]), [example]);

  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    setBoxWidth(box.clientWidth);
    const observer = new ResizeObserver(([entry]) => setBoxWidth(entry.contentRect.width));
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  // Все ширины в одном масштабе: узкий экран и на странице выглядит узким
  const scale = Math.min(1, boxWidth / Math.max(...example.widths));
  const width = example.widths[selected];

  function choose(index: number) {
    setSelected(index);
    recordExperiment(spell);
  }

  return (
    <div className="example">
      <div className="example__chips" role="group" aria-label="Ширина экрана">
        {example.widths.map((option, i) => (
          <button
            key={option}
            type="button"
            className={i === selected ? 'chip chip--on' : 'chip'}
            aria-pressed={i === selected}
            onClick={() => choose(i)}
          >
            экран {option}px
          </button>
        ))}
      </div>
      <div className="example__screens" ref={boxRef} style={{ height: SCREEN_HEIGHT * scale }}>
        <div className="example__screen" style={{ width: width * scale, height: SCREEN_HEIGHT * scale }}>
          <iframe
            title={`Живой пример: ${spell}, экран ${width}px`}
            sandbox="allow-same-origin"
            srcDoc={srcDoc}
            width={width}
            height={SCREEN_HEIGHT}
            style={{ transform: `scale(${scale})` }}
          />
        </div>
      </div>
      <div className="example__side">
        <pre className="example__code">
          <code>{example.code}</code>
        </pre>
        {queries.map((query) => {
          const on = mediaMatches(query, width);
          return (
            <p key={query} className={on ? 'example__media example__media--on' : 'example__media'}>
              {on ? '✦' : '·'} @media {query} — {on ? 'срабатывает' : 'не срабатывает'} на {width}px
            </p>
          );
        })}
      </div>
    </div>
  );
}
