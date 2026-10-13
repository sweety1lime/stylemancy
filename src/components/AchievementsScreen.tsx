import { ACHIEVEMENTS, CATEGORY_TITLES, type AchievementCategory } from '../game/achievements';
import { useStats } from '../game/stats';
import { Medal } from './Medal';

const CATEGORIES: AchievementCategory[] = ['clean', 'persistence', 'explore', 'secret'];

export function AchievementsScreen() {
  const { achievements } = useStats();
  const total = ACHIEVEMENTS.length;
  const got = ACHIEVEMENTS.filter((item) => achievements[item.id]).length;

  return (
    <main className="achievements">
      <header>
        <h1 className="pixel-title">Достижения</h1>
        <p className="achievements__count">
          Получено {got} из {total}
        </p>
      </header>
      {CATEGORIES.map((category) => (
        <section key={category} className="achievements__group">
          <h2 className="pixel-subtitle">{CATEGORY_TITLES[category]}</h2>
          <ul className="achievements__list">
            {ACHIEVEMENTS.filter((item) => item.category === category).map((item) => {
              const date = achievements[item.id];
              const hidden = item.secret && !date;
              return (
                <li key={item.id} className={date ? 'badge px-panel' : 'badge badge--locked px-panel'}>
                  <Medal category={item.category} locked={!date} />
                  <div>
                    <p className="badge__title">{hidden ? '???' : item.title}</p>
                    <p className="badge__text">{hidden ? 'Секретное достижение — его нужно найти.' : item.description}</p>
                    {date && <p className="badge__date">{new Date(date).toLocaleDateString('ru-RU')}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </main>
  );
}
