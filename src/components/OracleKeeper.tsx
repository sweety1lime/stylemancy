import { useEffect, useState } from 'react';
import { BUSTS, type Pose } from '../noir/mentors';
import { NoirBust } from '../noir/NoirFace';
import type { HeroCue } from './Hero';

interface OracleKeeperProps {
  /** Ключ наставника: его силуэт лежит в BUSTS */
  id: string;
  name: string;
  /** Чем закончилось заклинание: наставник радуется успеху или задумывается над промахом */
  cue?: HeroCue | null;
  /** Всё, что сейчас на свитке: когда оно меняется, наставник «говорит» */
  said: string;
}

/**
 * Наставник крупно под сценой JS-уровня, только в «Сумраке». Заполняет пустую часть колонки,
 * говорит, когда свиток пишет новые строки, радуется победе и задумывается над промахом.
 */
export function OracleKeeper({ id, name, cue, said }: OracleKeeperProps) {
  const [pose, setPose] = useState<Pose | null>(null);
  const [seenCue, setSeenCue] = useState(cue);
  const [run, setRun] = useState(0);
  const [talking, setTalking] = useState(false);
  const [seenSaid, setSeenSaid] = useState(said);
  // Реакция и речь меняются во время отрисовки, как у Portrait: без лишнего эффекта
  if (cue !== seenCue) {
    setSeenCue(cue);
    if (cue) {
      setPose(cue.kind === 'success' ? 'joy' : 'think');
      setRun((n) => n + 1);
    }
  }
  if (said !== seenSaid) {
    setSeenSaid(said);
    if (said) setTalking(true);
  }

  useEffect(() => {
    if (!pose) return;
    const timer = setTimeout(() => setPose(null), 1800);
    return () => clearTimeout(timer);
  }, [pose, run]);

  useEffect(() => {
    if (!talking) return;
    const timer = setTimeout(() => setTalking(false), 1200);
    return () => clearTimeout(timer);
  }, [talking, seenSaid]);

  return (
    <figure className="oracle-keeper" aria-hidden="true">
      <svg className={['noir-art', talking && 'is-talking'].filter(Boolean).join(' ')} viewBox="0 0 120 120">
        <NoirBust bust={BUSTS[id]} pose={pose} />
      </svg>
      <figcaption>{name}</figcaption>
    </figure>
  );
}
