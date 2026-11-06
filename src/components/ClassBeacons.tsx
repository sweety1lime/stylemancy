import { useEffect, useMemo, useState } from 'react';
import { beaconsOf, type Beacons, type ProgressMark } from '../game/beacons';
import { plural } from '../lib/plural';
import { allLands } from '../levels';

/** Вся карта маяков: общая полоса, а ниже по землям и районам — огни уровней */
function BeaconMap({ beacons }: { beacons: Beacons }) {
  const percent = beacons.total ? Math.round((beacons.lit / beacons.total) * 100) : 0;
  return (
    <div className="beacons__map">
      <div className="beacons__total">
        <p>
          Горит <strong>{beacons.lit}</strong> из {beacons.total}
        </p>
        <div
          className="beacons__bar"
          role="progressbar"
          aria-label="Сколько маяков класса горит"
          aria-valuemin={0}
          aria-valuemax={beacons.total}
          aria-valuenow={beacons.lit}
        >
          <span style={{ width: `${percent}%` }} />
        </div>
      </div>
      {beacons.lands.map(({ land, regions, lit, total }) => (
        <section key={land.id} className="beacons__land" aria-label={land.title}>
          <h3 className="beacons__land-title">
            {land.title} <span>{lit} из {total}</span>
          </h3>
          <div className="beacons__regions">
            {regions.map((region) => (
              <ul key={region.id} className="beacons__row" aria-label={region.title}>
                {region.levels.map(({ level, done, lit: on }) => (
                  <li
                    key={level.id}
                    className={on ? 'beacon beacon--lit' : done > 0 ? 'beacon beacon--spark' : 'beacon'}
                    title={`${level.title}: прошли ${done} из ${beacons.students}`}
                    aria-label={`${level.title}: прошли ${done} из ${beacons.students}, ${on ? 'маяк горит' : 'не горит'}`}
                  />
                ))}
              </ul>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/**
 * Маяки класса для учителя: общая карта, которую можно вывести на проектор. Без имён и мест:
 * маяк уровня горит, когда его прошла хотя бы половина класса.
 */
export function ClassBeacons({ students, progress }: { students: number; progress: ProgressMark[] }) {
  const [projector, setProjector] = useState(false);
  const beacons = useMemo(() => beaconsOf(students, progress, allLands), [students, progress]);

  // Esc закрывает проектор
  useEffect(() => {
    if (!projector) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setProjector(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [projector]);

  return (
    <section className="beacons px-panel" aria-labelledby="beacons-title">
      <div className="beacons__head">
        <div>
          <h2 id="beacons-title" className="pixel-subtitle">
            Маяки класса
          </h2>
          <p className="teacher__muted">
            Маяк уровня горит, когда его прошли хотя бы {beacons.need} {plural(beacons.need, 'студент', 'студента', 'студентов')} из {students}. Имён на карте нет: класс зажигает огни вместе.
          </p>
        </div>
        <button type="button" className="button button--ghost" onClick={() => setProjector(true)}>
          На проектор
        </button>
      </div>
      <BeaconMap beacons={beacons} />
      {projector && (
        <div className="beacons-projector" role="dialog" aria-modal="true" aria-label="Маяки класса на проекторе">
          <button type="button" className="beacons-projector__close text-button" onClick={() => setProjector(false)}>
            Закрыть (Esc)
          </button>
          <h2 className="beacons-projector__title">Маяки класса</h2>
          <BeaconMap beacons={beacons} />
        </div>
      )}
    </section>
  );
}
