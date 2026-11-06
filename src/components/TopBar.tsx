import { useState } from 'react';
import { ACHIEVEMENTS } from '../game/achievements';
import { signOut, useAuth, type Account } from '../game/auth';
import { activeStreak, dayKey } from '../game/daily';
import { useProgress } from '../game/progress';
import { rankFor, totalXp } from '../game/ranks';
import { PIXEL_LOOK_AVAILABLE, settings, useSettings } from '../game/settings';
import { sfx } from '../game/sound';
import { useStats } from '../game/stats';
import { useCountUp } from '../game/useCountUp';
import { BOOK, EFFECTS_OFF, EFFECTS_ON, GEMS, MEDALS, MOON, SPEAKER_OFF, SPEAKER_ON } from '../pixel/sprites';
import { AccountDialog } from './AccountDialog';
import { FlameIcon } from './FlameIcon';
import { NoirIcon, NoirMedal } from '../noir/icons';
import { useNoir } from '../noir/look';
import { PixelArt } from './PixelArt';

interface TopBarProps {
  /** Куда ведёт «назад»: на карту или на тропу района */
  back?: { href: string; label: string };
}

export function TopBar({ back }: TopBarProps) {
  const stats = useStats();
  const noir = useNoir();
  const { account, ready } = useAuth();
  const xp = totalXp(useProgress(), stats.reviewXp);
  const { effects } = useSettings();
  // Опыт «набегает»: число, название ранга и полоска считаются от показанного значения, подсказка — от настоящего
  const shown = useCountUp(xp, noir && effects === 'full');
  const { rank, share } = rankFor(shown);
  const { next } = rankFor(xp);
  const hint = next ? `До ранга «${next.title}» — ${next.xp - xp} XP` : 'Высший ранг';
  const achievementsGot = ACHIEVEMENTS.filter((item) => stats.achievements[item.id]).length;
  // Огонёк «Свитка дня»: серия дней подряд; тускнеет, пока сегодняшний свиток не прочитан
  const today = dayKey();
  const streak = activeStreak(stats.daily, today);
  const scrollDue = stats.daily.last !== today;
  // Окно держит аккаунт, с которым открылось: после удаления оно ещё показывает итог
  const [accountDialog, setAccountDialog] = useState<Account | null>(null);

  return (
    <header className="topbar">
      <a className="brand" href="#/">
        {noir ? <NoirIcon name="gem" size={24} /> : <PixelArt sprite={GEMS.amethyst.sprite} scale={2} />}
        Стилемантия
      </a>
      {back && (
        <a className="topbar__back" href={back.href}>
          ← {back.label}
        </a>
      )}
      <nav className="topbar__nav" aria-label="Разделы">
        <a className="topbar__link" href="#/grimoire">
          {noir ? <NoirIcon name="book" /> : <PixelArt sprite={BOOK} scale={2} />}
          Гримуар
        </a>
        <a className="topbar__link" href="#/achievements" aria-label={`Достижения: ${achievementsGot} из ${ACHIEVEMENTS.length}`}>
          {noir ? <NoirMedal category="clean" size={24} /> : <PixelArt sprite={MEDALS.clean} scale={2} />}
          {achievementsGot}/{ACHIEVEMENTS.length}
        </a>
        <a
          className={scrollDue ? 'topbar__link topbar__flame topbar__flame--due' : 'topbar__link topbar__flame'}
          href="#/daily"
          aria-label={`Свиток дня: серия ${streak} дн., ${scrollDue ? 'сегодняшний свиток ждёт' : 'сегодня прочитан'}`}
          title={scrollDue ? 'Свиток дня ждёт: три вопроса из выученного' : 'Свиток дня прочитан'}
        >
          <FlameIcon size={24} />
          {streak > 0 && streak}
        </a>
      </nav>
      <Toggles />
      <div className="rank" title={hint}>
        <span className="rank__title">{rank.title}</span>
        <span className="rank__bar" aria-hidden="true">
          <span className="rank__fill" style={{ width: `${Math.round(share * 100)}%` }} />
        </span>
        <span className="rank__xp">{shown} XP</span>
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
            <>
              {noir && <span className="topbar__guest">Ты играешь как гость</span>}
              <a className="button button--small" href="#/login">
                Войти
              </a>
            </>
          )
        )}
      </div>
      {accountDialog && <AccountDialog account={accountDialog} onClose={() => setAccountDialog(null)} />}
    </header>
  );
}

/** Звук, эффекты и вид игры: три значка в верхней панели. Настройки — для этого компьютера. */
function Toggles() {
  const { sound, effects, look } = useSettings();
  const full = effects === 'full';
  const noir = look === 'noir';
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
        {noir ? <NoirIcon name={sound ? 'sound' : 'mute'} /> : <PixelArt sprite={sound ? SPEAKER_ON : SPEAKER_OFF} scale={2} />}
        <span className="visually-hidden">Звук</span>
      </button>
      <button
        type="button"
        className="toggle"
        aria-pressed={full}
        title={full ? 'Эффекты: полные' : 'Эффекты: лёгкие — для слабых компьютеров'}
        onClick={() => {
          settings.update({ effects: full ? 'light' : 'full', effectsChosen: true });
          sfx.click();
        }}
      >
        {noir ? <NoirIcon name={full ? 'effects' : 'effects-off'} /> : <PixelArt sprite={full ? EFFECTS_ON : EFFECTS_OFF} scale={2} />}
        <span className="visually-hidden">Полные эффекты</span>
      </button>
      {PIXEL_LOOK_AVAILABLE && (
        <button
          type="button"
          className="toggle"
          aria-pressed={noir}
          title={noir ? 'Вид: «Сумрак» — силуэты в лунном свете' : 'Вид: пиксель-арт'}
          onClick={() => {
            settings.update({ look: noir ? 'pixel' : 'noir' });
            sfx.click();
          }}
        >
          {noir ? <NoirIcon name="moon" /> : <PixelArt sprite={MOON} scale={2} />}
          <span className="visually-hidden">Вид «Сумрак»</span>
        </button>
      )}
    </div>
  );
}
