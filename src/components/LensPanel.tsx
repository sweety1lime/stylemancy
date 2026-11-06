import { formatSpecificity, SOURCE_NAMES, type Inspection, type Sides } from '../engine/inspect';

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

/** Четыре числа вокруг слоя коробки: сверху, справа, снизу, слева */
function SideValues({ values }: { values: Sides }) {
  return (
    <>
      <span className="lens-box__side lens-box__side--top">{fmt(values.top)}</span>
      <span className="lens-box__side lens-box__side--right">{fmt(values.right)}</span>
      <span className="lens-box__side lens-box__side--bottom">{fmt(values.bottom)}</span>
      <span className="lens-box__side lens-box__side--left">{fmt(values.left)}</span>
    </>
  );
}

/** Коробка предмета слоями, как в инструментах разработчика: внешний отступ, рамка, внутренний отступ, содержимое */
function BoxDiagram({ inspection }: { inspection: Inspection }) {
  const { margin, border, padding, width, height } = inspection;
  // Размер из браузера — вместе с рамкой и внутренним отступом, а в серединке нужен размер содержимого
  const content = {
    w: Math.max(0, width - padding.left - padding.right - border.left - border.right),
    h: Math.max(0, height - padding.top - padding.bottom - border.top - border.bottom),
  };
  return (
    <div className="lens-box lens-box--margin" role="img" aria-label={`Коробка предмета: содержимое ${fmt(content.w)} на ${fmt(content.h)}`}>
      <span className="lens-box__name">margin</span>
      <SideValues values={margin} />
      <div className="lens-box lens-box--border">
        <span className="lens-box__name">border</span>
        <SideValues values={border} />
        <div className="lens-box lens-box--padding">
          <span className="lens-box__name">padding</span>
          <SideValues values={padding} />
          <div className="lens-box__content">
            {fmt(content.w)} × {fmt(content.h)}
          </div>
        </div>
      </div>
    </div>
  );
}

interface LensPanelProps {
  inspection: Inspection | null;
  /** Как называются предметы, которые можно выбрать кнопкой: так лупа работает и без мыши */
  items?: string[];
  onPick?: (index: number) => void;
}

/** Ряд кнопок по числу предметов сцены: выбор для тех, кто работает с клавиатуры или не попадает мышью в мелкий предмет */
function ItemButtons({ items, picked, onPick }: { items: string[]; picked?: string; onPick: (index: number) => void }) {
  if (!items.length) return null;
  return (
    <div className="lens__items" role="group" aria-label="Выбрать предмет">
      {items.map((item, i) => (
        <button key={`${item}-${i}`} type="button" className={picked === item ? 'chip chip--on' : 'chip'} aria-pressed={picked === item} onClick={() => onPick(i)}>
          {item}
        </button>
      ))}
    </div>
  );
}

/**
 * «Лупа мага»: разбор выбранного предмета сцены. Пересчитывается, пока студент печатает код.
 * Ряд кнопок стоит на одном месте и до выбора, и после: иначе при выборе он пересоздавался бы, и с нажатой кнопки пропадал бы фокус.
 */
export function LensPanel({ inspection, items = [], onPick = () => undefined }: LensPanelProps) {
  return (
    <section className="lens px-panel" aria-live="polite">
      <p className="lens__label">Лупа мага</p>
      <ItemButtons items={items} picked={inspection?.name} onPick={onPick} />
      {inspection ? (
        <Inspected inspection={inspection} />
      ) : (
        <p className="lens__hint">Нажми на предмет в сцене (или выбери его кнопкой): лупа покажет его размеры и какие правила на него действуют.</p>
      )}
    </section>
  );
}

/** Разбор предмета: название, размеры, коробка и правила, которые сработали */
function Inspected({ inspection }: { inspection: Inspection }) {
  const { name, label, width, height, display, position, verdicts } = inspection;
  return (
    <>
      <h2 className="lens__title">
        {name ?? label} {name && <code>{label}</code>}
      </h2>
      <p className="lens__facts">
        {fmt(width)} × {fmt(height)} px · display: {display}
        {position !== 'static' && ` · position: ${position}`}
      </p>
      <div className="lens__body">
        <BoxDiagram inspection={inspection} />
        <div className="lens__verdicts">
          <h3 className="lens__sub">Какие правила сработали</h3>
          {verdicts.length ? (
            <ul className="lens__rules">
              {verdicts.map(({ prop, winner, losers }) => (
                <li key={prop}>
                  <p className="lens__win">
                    <code>
                      {prop}: {winner.value}
                      {winner.important && ' !important'}
                    </code>
                    <span>
                      {' '}
                      — {winner.selector} · {SOURCE_NAMES[winner.source]} · сила {formatSpecificity(winner.specificity)}
                    </span>
                  </p>
                  {losers.map(({ declaration, reason }) => (
                    <p key={declaration.order} className="lens__lose">
                      <s>
                        <code>
                          {declaration.prop}: {declaration.value}
                          {declaration.important && ' !important'}
                        </code>
                      </s>
                      <span>
                        {' '}
                        — {declaration.selector} · {SOURCE_NAMES[declaration.source]}: {reason}
                      </span>
                    </p>
                  ))}
                </li>
              ))}
            </ul>
          ) : (
            <p className="lens__hint">Ни твой код, ни чары Лорда Дефолта пока не трогают этот предмет: он такой, каким его задумала сцена.</p>
          )}
        </div>
      </div>
    </>
  );
}
