import { useProgress } from '../game/progress';
import { useStats } from '../game/stats';
import { allLands } from '../levels';
import { plural } from '../lib/plural';
import { useNoir } from '../noir/look';
import { chooseStaffLight, STAFF_LIGHTS, unlockedStaffLights, useStaffLight } from '../noir/staffLights';
import { HERO_GEM } from '../pixel/sprites';

/**
 * «Свет посоха»: выбор цвета огонька на посохе героя («Сумрак») или камня на нём (пиксельный вид).
 * Цвета открываются за спасённые земли и за задания «Моей земли».
 */
export function StaffPicker() {
  const noir = useNoir();
  const progress = useProgress();
  const current = useStaffLight();
  const { landTasks } = useStats();
  const open = unlockedStaffLights(progress, landTasks.length);
  return (
    <section className="staff-picker px-panel" aria-labelledby="staff-title">
      <h2 id="staff-title" className="pixel-subtitle">
        Свет посоха
      </h2>
      <p className="staff-picker__lead">
        Каждая спасённая земля открывает свой цвет, а ещё один даёт «Моя земля» за творческие задания.{' '}
        {noir ? 'Выбранный светит на посохе героя везде, а на карте красит след от шагов.' : 'Выбранный цвет у камня на посохе героя виден везде.'}
      </p>
      <ul className="staff-picker__list">
        {STAFF_LIGHTS.map((option) => {
          const unlocked = open.has(option.id);
          const land = allLands.find((item) => item.id === option.land);
          return (
            <li key={option.id}>
              <button
                type="button"
                className="staff-swatch"
                aria-pressed={current.id === option.id}
                disabled={!unlocked}
                onClick={() => chooseStaffLight(option.id)}
                style={{ '--swatch': noir ? option.burst : (option.pixel?.g ?? HERO_GEM) } as React.CSSProperties}
              >
                <span className="staff-swatch__dot" aria-hidden="true" />
                <span className="staff-swatch__name">{option.name}</span>
                {!unlocked && land && <span className="staff-swatch__lock">спаси «{land.title}»</span>}
                {!unlocked && option.tasks !== undefined && (
                  <span className="staff-swatch__lock">
                    выполни {option.tasks} {plural(option.tasks, 'задание', 'задания', 'заданий')} в «Моей земле»
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
