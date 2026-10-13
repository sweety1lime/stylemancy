import { useMemo, useRef, useState } from 'react';
import { recordExperiment } from '../game/achievements';
import type { SpellExample as Example } from '../game/spells';

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

const THREE_ITEMS = '<div class="box"><div class="item">1</div><div class="item">2</div><div class="item">3</div></div>';

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

/** Живой пример заклинания: нажимаешь на значение — мини-сцена сразу меняется. */
export function SpellExample({ spell, example }: { spell: string; example: Example }) {
  const initial = example.initial ?? 0;
  const [selected, setSelected] = useState(initial);
  const selectedRef = useRef(initial);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const srcDoc = useMemo(
    () =>
      `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}${example.css ?? ''}</style>` +
      `<style id="live">${ruleText(example.selector, example.options[example.initial ?? 0])}</style></head>` +
      `<body>${example.html ?? THREE_ITEMS}</body></html>`,
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
