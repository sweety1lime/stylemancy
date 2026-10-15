import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type Ref,
  type SyntheticEvent,
} from 'react';
import {
  applyToView,
  compareItems,
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
import { burst, glide, magic, snapshot } from './sceneFx';

export interface SceneHandle {
  /** Применяет код ко всем зеркалам и сразу сообщает, какие предметы на месте. */
  apply(css: string): ItemStatus[];
  /** Эффект «Сотворить»: магический круг и искры — или заклинание пшикнуло. */
  cast(passed: boolean): void;
}

interface SceneProps {
  level: CssLevel;
  initialCss: string;
  celebrate?: boolean;
  onStatuses?: (statuses: ItemStatus[]) => void;
  ref?: Ref<SceneHandle>;
}

/** Промежуток между зеркалами: в него помещается рамка с тенью */
const MIRROR_GAP = 36;
/** Если в ряд зеркала выходят мельче — ставим их друг под другом */
const MIN_ROW_SCALE = 0.45;

/**
 * Сцена уровня. В каждом «зеркале» (ширине экрана или «под мышкой») — видимый iframe с кодом студента
 * и скрытый с эталоном; из эталона берутся светящиеся контуры целей.
 */
export function Scene({ level, initialCss, celebrate, onStatuses, ref }: SceneProps) {
  const views = useMemo(() => viewsOf(level), [level]);
  const multi = views.length > 1;
  const srcDoc = useMemo(() => sceneDocument(level), [level]);
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

  const apply = useCallback(
    (css: string): ItemStatus[] => {
      cssRef.current = css;
      const docs = docsRef.current;
      const goals = goalsRef.current;
      if (views.some((_, i) => !docs[i] || !goals[i])) return [];
      const effects = fullEffects();
      let placed = false;
      const perMirror = views.map((view, i) => {
        const doc = docs[i] as Document;
        const prev = prevRef.current[i];
        // Где предметы видны сейчас — с них начнётся перелёт. Прошлые перелёты останавливаем: проверка мерит без них
        const before = effects && prev ? snapshot(doc, level.check.items, level.check.style) : null;
        glidesRef.current[i]?.forEach((animation) => animation.cancel());
        const result = compareItems(applyToView(doc, level, view, css), goals[i] as ItemBox[], level.check.tolerance);
        markInPlace(doc, level, result);
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
      return all;
    },
    [level, views, multi],
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
        } else {
          // Пшик: серый дымок над теми, кто не на месте
          visible
            .filter((status) => !status.inPlace)
            .forEach(({ target }) => burst(layer, target.x + target.w / 2, target.y + target.h / 2, '#6b7280', { count: 6, spread: 22 }));
        }
      });
      if (!passed) {
        boxRef.current?.animate(
          [{ transform: 'none' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-3px)' }, { transform: 'none' }],
          { duration: 360, easing: 'steps(4, end)' },
        );
      }
    },
    [views, level],
  );

  useImperativeHandle(ref, () => ({ apply, cast }), [apply, cast]);

  function handlePlayerLoad(index: number, doc: Document) {
    prepareView(doc, level, views[index]);
    doc.documentElement.classList.toggle('effects-light', !fullEffects());
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
  const inRow = !multi || rowScale >= MIN_ROW_SCALE;
  const scaleOf = (width: number) => (inRow ? rowScale : Math.min(1, boxWidth / width));

  const mirrors = views.map((view, i) => (
    <Mirror
      key={view.label ?? 'scene'}
      width={view.width}
      height={level.scene.height}
      scale={scaleOf(view.width)}
      srcDoc={srcDoc}
      label={view.label}
      targets={targets[i] ?? []}
      statuses={statuses[i] ?? []}
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
  targets: ItemBox[];
  statuses: ItemStatus[];
  /** Слой для искр и магического круга — поверх сцены */
  fxRef: (layer: HTMLDivElement | null) => void;
  onPlayerLoad: (doc: Document) => void;
  onTargetLoad: (doc: Document) => void;
}

/** Одно зеркало: сцена заданной ширины, контуры целей и скрытый эталон. */
function Mirror({ width, height, scale, srcDoc, label, targets, statuses, fxRef, onPlayerLoad, onTargetLoad }: MirrorProps) {
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
      </div>
    </div>
  );

  const reference = (
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
    <figure className="mirror">
      {frame}
      <figcaption className="mirror__label">{label}</figcaption>
      {reference}
    </figure>
  );
}
