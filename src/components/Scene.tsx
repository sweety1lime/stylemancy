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

export interface SceneHandle {
  /** Применяет код ко всем зеркалам и сразу сообщает, какие предметы на месте. */
  apply(css: string): ItemStatus[];
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

  useEffect(() => {
    onStatusesRef.current = onStatuses;
  });

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
      const perMirror = views.map((view, i) => {
        const doc = docs[i] as Document;
        const result = compareItems(applyToView(doc, level, view, css), goals[i] as ItemBox[], level.check.tolerance);
        markInPlace(doc, level, result);
        return multi ? result.map((status) => ({ ...status, view })) : result;
      });
      setStatuses(perMirror);
      const all = perMirror.flat();
      onStatusesRef.current?.(all);
      return all;
    },
    [level, views, multi],
  );

  useImperativeHandle(ref, () => ({ apply }), [apply]);

  function handlePlayerLoad(index: number, doc: Document) {
    prepareView(doc, level, views[index]);
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
  onPlayerLoad: (doc: Document) => void;
  onTargetLoad: (doc: Document) => void;
}

/** Одно зеркало: сцена заданной ширины, контуры целей и скрытый эталон. */
function Mirror({ width, height, scale, srcDoc, label, targets, statuses, onPlayerLoad, onTargetLoad }: MirrorProps) {
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
