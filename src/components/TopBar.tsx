import { useProgress } from '../game/progress';
import { rankFor, totalXp } from '../game/ranks';
import { GEMS } from '../pixel/sprites';
import { PixelArt } from './PixelArt';

interface TopBarProps {
  /** Куда ведёт «назад»: на карту или на тропу района */
  back?: { href: string; label: string };
}

export function TopBar({ back }: TopBarProps) {
  const xp = totalXp(useProgress());
  const { rank, next, share } = rankFor(xp);
  const hint = next ? `До ранга «${next.title}» — ${next.xp - xp} XP` : 'Высший ранг';

  return (
    <header className="topbar">
      <a className="brand" href="#/">
        <PixelArt sprite={GEMS.amethyst.sprite} scale={2} />
        Каскадия
      </a>
      {back && (
        <a className="topbar__back" href={back.href}>
          ← {back.label}
        </a>
      )}
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
