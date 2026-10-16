import { useEffect, useState } from 'react';
import { useAuth } from '../game/auth';
import { useProgress } from '../game/progress';
import { hrefFor } from '../game/router';
import { allLandsDone, isLandDone } from '../game/story';
import { findLand, lands, type Land } from '../levels';
import { Portrait } from './Portrait';

function formatDate(iso?: string): string {
  return (iso ? new Date(iso) : new Date()).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Наставники земли — по одному портрету на каждого. */
function mentorsOf(chosen: Land[]): string[] {
  return [...new Set(chosen.flatMap((land) => land.regions.map((region) => region.npc.portrait)).filter((id) => id !== 'default'))];
}

/**
 * Грамота Академии за спасённую землю или звание Магистра Стилемантии за все земли.
 * id — земля или 'master'. На печать уходит только сама грамота.
 */
export function CertificateScreen({ id }: { id: string }) {
  const progress = useProgress();
  const { account } = useAuth();
  const [guestName, setGuestName] = useState('');
  const master = id === 'master';
  const land = master ? undefined : findLand(id);
  const chosen = master ? lands.filter((item) => item.regions.length > 0) : land ? [land] : [];
  const earned = master ? allLandsDone(progress) : land ? isLandDone(land, progress) : false;
  const teacher = account?.role === 'teacher';

  useEffect(() => {
    document.body.classList.add('print-certificate');
    return () => document.body.classList.remove('print-certificate');
  }, []);

  if (!master && !land?.regions.length) {
    return (
      <main className="certificate-page">
        <p className="px-panel certificate-page__note">Такой грамоты нет.</p>
      </main>
    );
  }
  if (!earned && !teacher) {
    return (
      <main className="certificate-page">
        <section className="px-panel certificate-page__note">
          <p>{master ? 'Грамота Магистра откроется, когда все земли Каскадии будут спасены.' : `Грамота откроется, когда земля «${land!.title}» будет спасена.`}</p>
          <a className="text-button" href={hrefFor({ name: 'chronicle' })}>
            ← К летописи
          </a>
        </section>
      </main>
    );
  }

  const levels = chosen.flatMap((item) => item.regions.flatMap((region) => region.levels));
  const stars = levels.reduce((sum, level) => sum + (progress[level.id]?.stars ?? 0), 0);
  const finalLevel = land?.regions.at(-1)?.levels.at(-1);
  const name = account?.nickname ?? guestName;

  return (
    <main className="certificate-page">
      <article className="certificate" aria-label="Грамота">
        <p className="certificate__academy">Академия Каскада</p>
        <h1 className="certificate__title">{master ? 'Звание Магистра Стилемантии' : 'Грамота'}</h1>
        <p className="certificate__given">вручается</p>
        <p className="certificate__name">{name || ' '}</p>
        <p className="certificate__reason">
          {master ? 'за спасение всех земель королевства Каскадия' : `за спасение земли «${land!.title}»`}
        </p>
        <p className="certificate__topic">{master ? 'HTML · CSS · Flexbox · Grid · адаптив' : `${land!.topic}: ${land!.blurb}`}</p>
        <div className="certificate__mentors" aria-hidden="true">
          {mentorsOf(chosen).map((portrait) => (
            <Portrait key={portrait} id={portrait} scale={3} />
          ))}
        </div>
        <p className="certificate__stars">
          ★ {stars} из {levels.length * 3}
        </p>
        <p className="certificate__date">{formatDate(finalLevel ? progress[finalLevel.id]?.completedAt : undefined)}</p>
      </article>

      <section className="certificate-page__tools">
        {!earned && <p className="certificate-page__note-inline">Это образец: студент получит грамоту, когда спасёт землю.</p>}
        {!account && (
          <label className="field">
            <span>Имя на грамоте</span>
            <input value={guestName} maxLength={40} onChange={(event) => setGuestName(event.target.value)} placeholder="Впиши своё имя" />
          </label>
        )}
        <div className="certificate-page__buttons">
          <button type="button" className="button button--cast" onClick={() => window.print()}>
            Распечатать
          </button>
          <a className="text-button" href={hrefFor({ name: 'chronicle' })}>
            ← К летописи
          </a>
        </div>
      </section>
    </main>
  );
}
