import '../noir/noir.css';
import { NOIR_ARTS } from '../noir/look';
import { NoirStoryArt } from '../noir/NoirStoryArt';

/** Все сценки сюжета в «Сумраке» разом: чтобы сравнить кадры глазами. Лабиринт рисует подземелье — его здесь нет */
export function ScenesView() {
  const arts = [...NOIR_ARTS].filter((art) => art !== 'maze');
  return (
    <section className="scenes-view look-noir">
      {arts.map((art) => (
        <figure key={art} className="scenes-view__card">
          <NoirStoryArt art={art} speaker={art === 'mentor' ? 'oracle' : undefined} />
          <figcaption>{art}</figcaption>
        </figure>
      ))}
    </section>
  );
}
