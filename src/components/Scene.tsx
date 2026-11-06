import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type Ref,
  type SyntheticEvent,
} from 'react';
import { inspectElement, type Inspection } from '../engine/inspect';
import { applyOrder } from '../engine/order';
import {
  applyToView,
  compareItems,
  cssForView,
  markInPlace,
  measureTargets,
  prepareView,
  sceneDocument,
  viewsOf,
  type ItemBox,
  type ItemStatus,
} from '../engine/scene';
import type { CssLevel } from '../engine/types';
import { fullEffects, useSettings } from '../game/settings';
import { sfx } from '../game/sound';
import { attachSceneCamera } from '../noir/sceneCamera';
import { noirSceneCss } from '../noir/sceneCss';
import { burst, fizzle, glide, INHALE, isNoir, magic, snapshot } from './sceneFx';

export interface SceneHandle {
  /** Применяет код ко всем зеркалам и сразу сообщает, какие предметы на месте. */
  apply(css: string): ItemStatus[];
  /** Эффект «Сотворить»: магический круг и искры — или заклинание пшикнуло. */
  cast(passed: boolean): void;
  /** «Лупа мага» без мыши: выбрать предмет по номеру, как если бы на него нажали */
  pick(index: number): void;
  /** Как называются предметы, которые умеет выбирать лупа: те же, что проверяет сцена, по порядку разметки */
  itemNames(): string[];
}

interface SceneProps {
  level: CssLevel;
  initialCss: string;
  celebrate?: boolean;
  onStatuses?: (statuses: ItemStatus[]) => void;
  /** «Лупа мага»: пока включена, предметы сцены выбираются нажатием, а onInspect получает разбор выбранного (null — выбор снят) */
  lens?: boolean;
  onInspect?: (inspection: Inspection | null) => void;
  ref?: Ref<SceneHandle>;
}

/** Прямоугольник предмета в координатах сцены */
interface LensRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const rectStyle = ({ x, y, w, h }: LensRect): CSSProperties => ({ left: x, top: y, width: w, height: h });

/** Промежуток между зеркалами: в него помещается рамка с тенью */
const MIRROR_GAP = 36;
/** Если в ряд зеркала выходят мельче — ставим их друг под другом */
const MIN_ROW_SCALE = 0.45;

/**
 * Сцена уровня. В каждом «зеркале» (ширине экрана или «под мышкой») — видимый iframe с кодом студента
 * и скрытый с эталоном; из эталона берутся светящиеся контуры целей.
 */
export function Scene({ level, initialCss, celebrate, onStatuses, lens = false, onInspect, ref }: SceneProps) {
  const views = useMemo(() => viewsOf(level), [level]);
  const multi = views.length > 1;
  const { look } = useSettings();
  const srcDoc = useMemo(() => sceneDocument(level, look === 'noir' ? noirSceneCss(level.regionId, level.id) : ''), [level, look]);
  const boxRef = useRef<HTMLDivElement>(null);
  const docsRef = useRef<(Document | undefined)[]>([]);
  const goalsRef = useRef<(ItemBox[] | undefined)[]>([]);
  const cssRef = useRef(initialCss);
  const onStatusesRef = useRef(onStatuses);
  const [targets, setTargets] = useState<ItemBox[][]>([]);
  const [statuses, setStatuses] = useState<ItemStatus[][]>([]);
  const [boxWidth, setBoxWidth] = useState(Number.POSITIVE_INFINITY);
  // Эффекты: идущие перелёты предметов, прошлые статусы (кто только что встал на место) и слой для искр
  const glidesRef = useRef<Animation[][]>([]);
  const prevRef = useRef<(ItemStatus[] | undefined)[]>([]);
  const fxRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    onStatusesRef.current = onStatuses;
  });

  // Лупа: выбранный предмет (зеркало и сам элемент в iframe), его рамка и рамка под мышью
  const onInspectRef = useRef(onInspect);
  const pickRef = useRef<{ index: number; el: Element } | null>(null);
  const [pickRects, setPickRects] = useState<(LensRect | null)[]>([]);
  const [hoverRects, setHoverRects] = useState<(LensRect | null)[]>([]);
  useEffect(() => {
    onInspectRef.current = onInspect;
  });

  // Лёгкие эффекты — и внутри сцены: фон перестаёт двигаться
  const { effects } = useSettings();
  useEffect(() => {
    docsRef.current.forEach((doc) => doc?.documentElement.classList.toggle('effects-light', effects === 'light'));
  }, [effects]);

  // Сцена внутри всегда своего размера, а на узком экране уменьшается целиком
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    setBoxWidth(box.clientWidth);
    const observer = new ResizeObserver(([entry]) => setBoxWidth(entry.contentRect.width));
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  /** Пересчитать разбор выбранного предмета: код изменился — правила и размеры другие */
  const inspectPicked = useCallback(() => {
    const pick = pickRef.current;
    if (!pick?.el.isConnected) return;
    const css = { scene: level.sceneCss, player: cssForView(cssRef.current, views[pick.index]), locked: level.lockedCss ?? '' };
    // Проверяемое свойство лупа показывает всегда: в уровнях про селекторы это color
    onInspectRef.current?.(inspectElement(pick.el, css, level.check.style ? [level.check.style] : []));
    const box = pick.el.getBoundingClientRect();
    setPickRects((list) => {
      const next = [...list];
      next[pick.index] = { x: box.left, y: box.top, w: box.width, h: box.height };
      return next;
    });
  }, [level, views]);

  // Лупу выключили — выбор снимается: рамки сбрасываются при смене пропса, а сам выбор и разбор — в эффекте
  const [lensWas, setLensWas] = useState(lens);
  if (lensWas !== lens) {
    setLensWas(lens);
    if (!lens) {
      setPickRects([]);
      setHoverRects([]);
    }
  }
  useEffect(() => {
    if (lens) return;
    pickRef.current = null;
    onInspectRef.current?.(null);
  }, [lens]);

  /** Предмет под мышью в зеркале index: подсветка при наведении, а нажатие выбирает его для разбора */
  const lensAt = (index: number, event: MouseEvent<HTMLDivElement>, choose: boolean) => {
    const doc = docsRef.current[index];
    if (!doc) return;
    // Сцена уменьшена на узком экране: координаты экрана переводим в координаты сцены
    const area = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - area.left) * views[index].width) / area.width;
    const y = ((event.clientY - area.top) * level.scene.height) / area.height;
    const el = doc.elementFromPoint(x, y);
    if (!el) return;
    if (choose) {
      pickRef.current = { index, el };
      inspectPicked();
      return;
    }
    const box = el.getBoundingClientRect();
    setHoverRects((list) => {
      const next = [...list];
      next[index] = { x: box.left, y: box.top, w: box.width, h: box.height };
      return next;
    });
  };

  /** Предметы основной сцены, которые проверяются и которые лупа умеет выбирать */
  const lensItems = useCallback((): HTMLElement[] => {
    const doc = docsRef.current[0];
    if (!doc) return [];
    try {
      return Array.from(doc.querySelectorAll<HTMLElement>(level.check.items));
    } catch {
      return [];
    }
  }, [level]);

  const itemNames = useCallback(
    () => lensItems().map((el, i) => el.dataset.name ?? `${level.check.itemLabel ?? 'Предмет'} ${i + 1}`),
    [level, lensItems],
  );

  const pick = useCallback(
    (index: number) => {
      const el = lensItems()[index];
      if (!el) return;
      pickRef.current = { index: 0, el };
      inspectPicked();
    },
    [lensItems, inspectPicked],
  );

  const apply = useCallback(
    (css: string): ItemStatus[] => {
      cssRef.current = css;
      const docs = docsRef.current;
      const goals = goalsRef.current;
      // Заказ жителя принимается по условиям: эталонной сцены и контуров целей нет
      const order = Boolean(level.check.order);
      if (views.some((_, i) => !docs[i] || (!order && !goals[i]))) return [];
      const effects = fullEffects();
      let placed = false;
      const perMirror = views.map((view, i) => {
        const doc = docs[i] as Document;
        const prev = prevRef.current[i];
        // Где предметы видны сейчас — с них начнётся перелёт. Прошлые перелёты останавливаем: проверка мерит без них
        const before = effects && prev ? snapshot(doc, level.check.items, level.check.style) : null;
        glidesRef.current[i]?.forEach((animation) => animation.cancel());
        const result = order ? applyOrder(doc, level, view, css) : compareItems(applyToView(doc, level, view, css), goals[i] as ItemBox[], level.check.tolerance);
        if (!order) markInPlace(doc, level, result);
        glidesRef.current[i] = before ? glide(doc, level.check.items, before, level.check.style) : [];
        // Кто только что встал на место — тому искры
        const newly = prev ? result.filter((status, k) => status.inPlace && prev[k] && !prev[k].inPlace) : [];
        const layer = fxRef.current[i];
        if (newly.length) placed = true;
        if (effects && layer) {
          newly.forEach(({ target, color }) => burst(layer, target.x + target.w / 2, target.y + target.h / 2, color, { count: 10, spread: 44, delay: 250 }));
        }
        prevRef.current[i] = result;
        return multi ? result.map((status) => ({ ...status, view })) : result;
      });
      if (placed) sfx.placed();
      setStatuses(perMirror);
      const all = perMirror.flat();
      onStatusesRef.current?.(all);
      inspectPicked();
      return all;
    },
    [level, views, multi, inspectPicked],
  );

  const cast = useCallback(
    (passed: boolean) => {
      if (!fullEffects()) return;
      views.forEach((view, i) => {
        const layer = fxRef.current[i];
        const result = prevRef.current[i];
        if (!layer || !result) return;
        const visible = result.filter(({ target }) => target.w > 0 && target.h > 0 && !target.invisible);
        if (passed) {
          magic(layer, view.width, level.scene.height);
          // Предметы вспыхивают по одному
          visible.forEach(({ target, color }, k) =>
            burst(layer, target.x + target.w / 2, target.y + target.h / 2, color, { count: 14, spread: 48, delay: 250 + k * 90 }),
          );
        } else if (isNoir()) {
          // Пшик в «Сумраке»: свет гаснет, над промахом — холодный дымок
          fizzle(
            layer,
            visible.filter((status) => !status.inPlace).map(({ target }) => ({ x: target.x + target.w / 2, y: target.y + target.h / 2 })),
          );
        } else {
          // Пшик: серый дымок над теми, кто не на месте
          visible
            .filter((status) => !status.inPlace)
            .forEach(({ target }) => burst(layer, target.x + target.w / 2, target.y + target.h / 2, '#6b7280', { count: 6, spread: 22 }));
        }
      });
      if (passed && isNoir()) {
        // Камера чуть подаётся вперёд, пока свет возвращается
        boxRef.current?.animate([{ transform: 'none' }, { transform: 'scale(1.025)', offset: 0.35 }, { transform: 'none' }], {
          duration: 1600,
          delay: INHALE,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        });
      }
      if (!passed) {
        // Сцену встряхивает: в пиксельном виде — рывками, в «Сумраке» — плавно и с отдачей назад
        const smooth = isNoir();
        const recoil = smooth ? ' scale(0.985)' : '';
        boxRef.current?.animate(
          [
            { transform: 'none' },
            { transform: `translateX(-6px)${recoil}` },
            { transform: `translateX(6px)${recoil}` },
            { transform: `translateX(-3px)${recoil}` },
            { transform: 'none' },
          ],
          { duration: smooth ? 480 : 360, easing: smooth ? 'ease-in-out' : 'steps(4, end)' },
        );
      }
    },
    [views, level],
  );

  useImperativeHandle(ref, () => ({ apply, cast, pick, itemNames }), [apply, cast, pick, itemNames]);

  function handlePlayerLoad(index: number, doc: Document) {
    prepareView(doc, level, views[index]);
    doc.documentElement.classList.toggle('effects-light', !fullEffects());
    doc.documentElement.classList.toggle('ambient-still', document.documentElement.classList.contains('ambient-still'));
    // «Сумрак»: планы фона сдвигаются за мышью; предметы стоят на месте
    attachSceneCamera(doc);
    docsRef.current[index] = doc;
    apply(cssRef.current);
  }

  function handleTargetLoad(index: number, doc: Document) {
    prepareView(doc, level, views[index]);
    const boxes = measureTargets(doc, level, views[index]);
    goalsRef.current[index] = boxes;
    setTargets((list) => {
      const next = [...list];
      next[index] = boxes;
      return next;
    });
    apply(cssRef.current);
  }

  // Зеркала в ряд — в одном масштабе, чтобы была видна настоящая разница ширин
  const total = views.reduce((sum, view) => sum + view.width, 0);
  const rowScale = Math.min(1, (boxWidth - MIRROR_GAP * (views.length - 1)) / total);
  // Штормы Хаос-теста стоят под основной сценой в полный размер: рядом они были бы мельче чем в половину
  const stormy = views.some((view) => view.html !== undefined);
  const inRow = !multi || (!stormy && rowScale >= MIN_ROW_SCALE);
  const scaleOf = (width: number) => (inRow ? rowScale : Math.min(1, boxWidth / width));

  const mirrors = views.map((view, i) => (
    <Mirror
      key={view.label ?? 'scene'}
      width={view.width}
      height={level.scene.height}
      scale={scaleOf(view.width)}
      srcDoc={srcDoc}
      label={view.label}
      storm={view.html !== undefined}
      hasReference={!level.check.order}
      targets={targets[i] ?? []}
      statuses={statuses[i] ?? []}
      lens={lens}
      pick={pickRects[i] ?? null}
      hover={hoverRects[i] ?? null}
      onLens={(event, choose) => lensAt(i, event, choose)}
      onLensLeave={() => setHoverRects([])}
      fxRef={(layer) => {
        fxRef.current[i] = layer;
      }}
      onPlayerLoad={(doc) => handlePlayerLoad(i, doc)}
      onTargetLoad={(doc) => handleTargetLoad(i, doc)}
    />
  ));

  return (
    <div className={celebrate ? 'scene scene--celebrate' : 'scene'} ref={boxRef}>
      {multi ? <div className={inRow ? 'mirrors' : 'mirrors mirrors--column'}>{mirrors}</div> : mirrors}
    </div>
  );
}

interface MirrorProps {
  width: number;
  height: number;
  scale: number;
  srcDoc: string;
  label?: string;
  /** Это шторм Хаос-теста: подпись и рамка у него свои */
  storm: boolean;
  /** Скрытая сцена с эталоном для контуров целей; у заказа жителя её нет */
  hasReference: boolean;
  targets: ItemBox[];
  statuses: ItemStatus[];
  /** Лупа включена: поверх сцены лежит слой, ловящий мышь; pick и hover — рамки выбранного предмета и предмета под мышью */
  lens: boolean;
  pick: LensRect | null;
  hover: LensRect | null;
  onLens: (event: MouseEvent<HTMLDivElement>, choose: boolean) => void;
  onLensLeave: () => void;
  /** Слой для искр и магического круга — поверх сцены */
  fxRef: (layer: HTMLDivElement | null) => void;
  onPlayerLoad: (doc: Document) => void;
  onTargetLoad: (doc: Document) => void;
}

/** Одно зеркало: сцена заданной ширины, контуры целей и скрытый эталон. */
function Mirror({ width, height, scale, srcDoc, label, storm, hasReference, targets, statuses, lens, pick, hover, onLens, onLensLeave, fxRef, onPlayerLoad, onTargetLoad }: MirrorProps) {
  const loaded = (handler: (doc: Document) => void) => (event: SyntheticEvent<HTMLIFrameElement>) => {
    const doc = event.currentTarget.contentDocument;
    if (doc) handler(doc);
  };

  const frame = (
    <div className="scene__viewport" style={{ width: width * scale, height: height * scale }}>
      <div className="scene__stage" style={{ width, height, transform: `scale(${scale})` }}>
        <iframe
          className="scene__frame"
          title={label ? `Сцена: ${label}` : 'Сцена уровня'}
          sandbox="allow-same-origin"
          srcDoc={srcDoc}
          width={width}
          height={height}
          onLoad={loaded(onPlayerLoad)}
        />
        <div className="scene__ghosts" aria-hidden="true">
          {targets.map((target, i) =>
            // Контур не нужен спрятанной цели, невидимой (visibility: hidden) и той, что должна остаться без цвета
            (target.w === 0 && target.h === 0) || target.invisible || (target.value !== undefined && target.value === target.base) ? null : (
              <div
                key={`${target.name}-${i}`}
                className={statuses[i]?.inPlace ? 'ghost ghost--in-place' : 'ghost'}
                style={
                  {
                    left: target.x,
                    top: target.y,
                    width: target.w,
                    height: target.h,
                    '--ghost': target.color,
                  } as CSSProperties
                }
              />
            ),
          )}
        </div>
        <div className="scene__fx" ref={fxRef} aria-hidden="true" />
        {lens && hover && <div className="scene__mark scene__mark--hover" style={rectStyle(hover)} aria-hidden="true" />}
        {lens && pick && <div className="scene__mark scene__mark--pick" style={rectStyle(pick)} aria-hidden="true" />}
        {lens && <div className="scene__lens" onMouseMove={(event) => onLens(event, false)} onMouseLeave={onLensLeave} onClick={(event) => onLens(event, true)} />}
      </div>
    </div>
  );

  const reference = hasReference && (
    <iframe
      className="scene__reference"
      title="Эталон"
      aria-hidden="true"
      tabIndex={-1}
      sandbox="allow-same-origin"
      srcDoc={srcDoc}
      width={width}
      height={height}
      onLoad={loaded(onTargetLoad)}
    />
  );

  if (!label) {
    return (
      <>
        {frame}
        {reference}
      </>
    );
  }
  return (
    <figure className={storm ? 'mirror mirror--storm' : 'mirror'}>
      {frame}
      <figcaption className="mirror__label">{label}</figcaption>
      {reference}
    </figure>
  );
}
