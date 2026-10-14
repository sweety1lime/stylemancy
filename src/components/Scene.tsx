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
  compareItems,
  markInPlace,
  measureItems,
  mirrorLabel,
  sceneDocument,
  setPlayerCss,
  viewportsOf,
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
 * Сцена уровня. В каждом «зеркале» (ширине экрана) — видимый iframe с кодом студента
 * и скрытый с эталоном; из эталона берутся светящиеся контуры целей.
 */
export function Scene({ level, initialCss, celebrate, onStatuses, ref }: SceneProps) {
  const widths = useMemo(() => viewportsOf(level), [level]);
  const multi = widths.length > 1;
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
      if (widths.some((_, i) => !docs[i] || !goals[i])) return [];
      const perMirror = widths.map((width, i) => {
        const doc = docs[i] as Document;
        setPlayerCss(doc, css);
        const result = compareItems(measureItems(doc, level), goals[i] as ItemBox[], level.check.tolerance);
        markInPlace(doc, level, result);
        return multi ? result.map((status) => ({ ...status, viewport: width })) : result;
      });
      setStatuses(perMirror);
      const all = perMirror.flat();
      onStatusesRef.current?.(all);
      return all;
    },
    [level, widths, multi],
  );

  useImperativeHandle(ref, () => ({ apply }), [apply]);

  function handlePlayerLoad(index: number, doc: Document) {
    docsRef.current[index] = doc;
    apply(cssRef.current);
  }

  function handleTargetLoad(index: number, doc: Document) {
    setPlayerCss(doc, level.solutionCss);
    const boxes = measureItems(doc, level);
    goalsRef.current[index] = boxes;
    setTargets((list) => {
      const next = [...list];
      next[index] = boxes;
      return next;
    });
    apply(cssRef.current);
  }

  // Зеркала в ряд — в одном масштабе, чтобы была видна настоящая разница ширин
  const total = widths.reduce((sum, width) => sum + width, 0);
  const rowScale = Math.min(1, (boxWidth - MIRROR_GAP * (widths.length - 1)) / total);
  const inRow = !multi || rowScale >= MIN_ROW_SCALE;
  const scaleOf = (width: number) => (inRow ? rowScale : Math.min(1, boxWidth / width));

  const mirrors = widths.map((width, i) => (
    <Mirror
      key={width}
      width={width}
      height={level.scene.height}
      scale={scaleOf(width)}
      srcDoc={srcDoc}
      label={multi ? mirrorLabel(widths, i) : undefined}
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
            // Спрятанной цели контур не нужен
            target.w === 0 && target.h === 0 ? null : (
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
