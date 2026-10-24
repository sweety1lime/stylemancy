import { useState } from 'react';
import { ACHIEVEMENTS } from '../game/achievements';
import { signOut, useAuth, type Account } from '../game/auth';
import { useProgress } from '../game/progress';
import { rankFor, totalXp } from '../game/ranks';
import { settings, useSettings } from '../game/settings';
import { sfx } from '../game/sound';
import { useStats } from '../game/stats';
import { BOOK, EFFECTS_OFF, EFFECTS_ON, GEMS, MEDALS, SPEAKER_OFF, SPEAKER_ON } from '../pixel/sprites';
import { AccountDialog } from './AccountDialog';
import { PixelArt } from './PixelArt';

interface TopBarProps {
  /** Куда ведёт «назад»: на карту или на тропу района */
  back?: { href: string; label: string };
}

export function TopBar({ back }: TopBarProps) {
  const stats = useStats();
  const { account, ready } = useAuth();
  const xp = totalXp(useProgress(), stats.reviewXp);
  const { rank, next, share } = rankFor(xp);
  const hint = next ? `До ранга «${next.title}» — ${next.xp - xp} XP` : 'Высший ранг';
  const achievementsGot = ACHIEVEMENTS.filter((item) => stats.achievements[item.id]).length;
  // Окно держит аккаунт, с которым открылось: после удаления оно ещё показывает итог
  const [accountDialog, setAccountDialog] = useState<Account | null>(null);

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
      <Toggles />
      <div className="rank" title={hint}>
        <span className="rank__title">{rank.title}</span>
        <span className="rank__bar" aria-hidden="true">
          <span className="rank__fill" style={{ width: `${Math.round(share * 100)}%` }} />
        </span>
        <span className="rank__xp">{xp} XP</span>
        <span className="visually-hidden">{hint}</span>
      </div>
      <div className="account">
        {account ? (
          <>
            {account.role === 'teacher' && (
              <a className="topbar__link" href="#/teacher">
                Панель учителя
              </a>
            )}
            {account.role === 'student' ? (
              <button
                type="button"
                className="account__name account__name--button"
                title={account.classInfo ? `Класс «${account.classInfo.name}»` : undefined}
                onClick={() => setAccountDialog(account)}
              >
                {account.nickname}
              </button>
            ) : (
              <span className="account__name" title={account.email}>
                {account.nickname}
              </span>
            )}
            <button type="button" className="text-button" onClick={() => void signOut()}>
              Выйти
            </button>
          </>
        ) : (
          ready && (
            <a className="button button--small" href="#/login">
              Войти
            </a>
          )
        )}
      </div>
      {accountDialog && <AccountDialog account={accountDialog} onClose={() => setAccountDialog(null)} />}
    </header>
  );
}

/** Звук и эффекты: два значка в верхней панели. Настройки — для этого компьютера. */
function Toggles() {
  const { sound, effects } = useSettings();
  const full = effects === 'full';
  return (
    <div className="toggles">
      <button
        type="button"
        className="toggle"
        aria-pressed={sound}
        title={sound ? 'Звук включён' : 'Звук выключен'}
        onClick={() => {
          settings.update({ sound: !sound });
          sfx.click();
        }}
      >
        <PixelArt sprite={sound ? SPEAKER_ON : SPEAKER_OFF} scale={2} />
        <span className="visually-hidden">Звук</span>
      </button>
      <button
        type="button"
        className="toggle"
        aria-pressed={full}
        title={full ? 'Эффекты: полные' : 'Эффекты: лёгкие — для слабых компьютеров'}
        onClick={() => {
          settings.update({ effects: full ? 'light' : 'full' });
          sfx.click();
        }}
      >
        <PixelArt sprite={full ? EFFECTS_ON : EFFECTS_OFF} scale={2} />
        <span className="visually-hidden">Полные эффекты</span>
      </button>
    </div>
  );
}
