import { NoirFace } from '../noir/NoirFace';
import { BUSTS } from '../noir/mentors';

/** Все наставники «Сумрака»: крупно — чтобы рисовать, мелко — как в игре (64 и 48 пикселей) */
export function MentorsView() {
  const ids = ['default', ...Object.keys(BUSTS)];
  return (
    <section className="mentors-view">
      {ids.map((id) => (
        <figure key={id} className="mentors-view__card">
          <NoirFace id={id} size={200} />
          <div className="mentors-view__small">
            <NoirFace id={id} size={64} />
            <NoirFace id={id} size={48} />
          </div>
          <figcaption>{id}</figcaption>
        </figure>
      ))}
    </section>
  );
}
