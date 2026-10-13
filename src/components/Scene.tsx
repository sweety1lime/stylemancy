import {
  useCallback,
  useEffect,
  useImperativeHandle,
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
  sceneDocument,
  setPlayerCss,
  type ItemBox,
  type ItemStatus,
} from '../engine/scene';
import type { Level } from '../engine/types';

export interface SceneHandle {
  /** Применяет код к сцене и сразу сообщает, какие предметы на месте. */
  apply(css: string): ItemStatus[];
}

interface SceneProps {
  level: Level;
  initialCss: string;
  celebrate?: boolean;
  onStatuses?: (statuses: ItemStatus[]) => void;
  ref?: Ref<SceneHandle>;
}

/**
 * Сцена уровня: видимый iframe с кодом студента и скрытый — с эталоном.
 * Из эталона берутся светящиеся контуры целей.
 */
export function Scene({ level, initialCss, celebrate, onStatuses, ref }: SceneProps) {
  const { width, height } = level.scene;
  const srcDoc = useMemo(() => sceneDocument(level), [level]);
  const boxRef = useRef<HTMLDivElement>(null);
  const playerDocRef = useRef<Document | null>(null);
  const targetsRef = useRef<ItemBox[] | null>(null);
  const cssRef = useRef(initialCss);
  const onStatusesRef = useRef(onStatuses);
  const [targets, setTargets] = useState<ItemBox[]>([]);
  const [statuses, setStatuses] = useState<ItemStatus[]>([]);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    onStatusesRef.current = onStatuses;
  });

  const apply = useCallback(
    (css: string): ItemStatus[] => {
      cssRef.current = css;
      const doc = playerDocRef.current;
      const goals = targetsRef.current;
      if (!doc || !goals) return [];
      setPlayerCss(doc, css);
      const result = compareItems(measureItems(doc, level), goals, level.check.tolerance);
      markInPlace(doc, level, result);
      setStatuses(result);
      onStatusesRef.current?.(result);
      return result;
    },
    [level],
  );

  useImperativeHandle(ref, () => ({ apply }), [apply]);

  // Сцена всегда 600×360 внутри, а на узком экране уменьшается целиком
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const observer = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / width)));
    observer.observe(box);
    return () => observer.disconnect();
  }, [width]);

  function handlePlayerLoad(event: SyntheticEvent<HTMLIFrameElement>) {
    playerDocRef.current = event.currentTarget.contentDocument;
    apply(cssRef.current);
  }

  function handleTargetLoad(event: SyntheticEvent<HTMLIFrameElement>) {
    const doc = event.currentTarget.contentDocument;
    if (!doc) return;
    setPlayerCss(doc, level.solutionCss);
    const boxes = measureItems(doc, level);
    targetsRef.current = boxes;
    setTargets(boxes);
    apply(cssRef.current);
  }

  return (
    <div className={celebrate ? 'scene scene--celebrate' : 'scene'} ref={boxRef}>
      <div className="scene__viewport" style={{ width: width * scale, height: height * scale }}>
        <div className="scene__stage" style={{ width, height, transform: `scale(${scale})` }}>
          <iframe
            className="scene__frame"
            title="Сцена уровня"
            sandbox="allow-same-origin"
            srcDoc={srcDoc}
            width={width}
            height={height}
            onLoad={handlePlayerLoad}
          />
          <div className="scene__ghosts" aria-hidden="true">
            {targets.map((target, i) => (
              <div
                key={target.name}
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
            ))}
          </div>
        </div>
      </div>
      <iframe
        className="scene__reference"
        title="Эталон"
        aria-hidden="true"
        tabIndex={-1}
        sandbox="allow-same-origin"
        srcDoc={srcDoc}
        width={width}
        height={height}
        onLoad={handleTargetLoad}
      />
    </div>
  );
}
