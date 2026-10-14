import { ACHIEVEMENTS } from '../game/achievements';
import { useProgress } from '../game/progress';
import { rankFor, totalXp } from '../game/ranks';
import { useStats } from '../game/stats';
import { BOOK, GEMS, MEDALS } from '../pixel/sprites';
import { PixelArt } from './PixelArt';

interface TopBarProps {
  /** Куда ведёт «назад»: на карту или на тропу района */
  back?: { href: string; label: string };
}

export function TopBar({ back }: TopBarProps) {
  const stats = useStats();
  const xp = totalXp(useProgress(), stats.reviewXp);
  const { rank, next, share } = rankFor(xp);
  const hint = next ? `До ранга «${next.title}» — ${next.xp - xp} XP` : 'Высший ранг';
  const achievementsGot = ACHIEVEMENTS.filter((item) => stats.achievements[item.id]).length;

  return (
    <header className="topbar">
      <a className="brand" href="#/">
        <PixelArt sprite={GEMS.amethyst.sprite} scale={2} />
        Стилемантия
      </a>
      {back && (
        <a className="topbar__back" href={back.href}>
          ← {back.label}
        </a>
      )}
      <nav className="topbar__nav" aria-label="Разделы">
        <a className="topbar__link" href="#/grimoire">
          <PixelArt sprite={BOOK} scale={2} />
          Гримуар
        </a>
        <a className="topbar__link" href="#/achievements" aria-label={`Достижения: ${achievementsGot} из ${ACHIEVEMENTS.length}`}>
          <PixelArt sprite={MEDALS.clean} scale={2} />
          {achievementsGot}/{ACHIEVEMENTS.length}
        </a>
      </nav>
      <div className="rank" title={hint}>
        <span className="rank__title">{rank.title}</span>
        <span className="rank__bar" aria-hidden="true">
          <span className="rank__fill" style={{ width: `${Math.round(share * 100)}%` }} />
        </span>
        <span className="rank__xp">{xp} XP</span>
        <span className="visually-hidden">{hint}</span>
      </div>
    </header>
  );
}
