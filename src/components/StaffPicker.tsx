import { useProgress } from '../game/progress';
import { allLands } from '../levels';
import { chooseStaffLight, STAFF_LIGHTS, unlockedStaffLights, useStaffLight } from '../noir/staffLights';

/** «Свет посоха»: выбор цвета огонька на посохе героя. Цвета открываются за спасённые земли. */
export function StaffPicker() {
  const progress = useProgress();
  const current = useStaffLight();
  const open = unlockedStaffLights(progress);
  return (
    <section className="staff-picker px-panel" aria-labelledby="staff-title">
      <h2 id="staff-title" className="pixel-subtitle">
        Свет посоха
      </h2>
      <p className="staff-picker__lead">Каждая спасённая земля открывает свой цвет. Выбранный светит на посохе героя везде, а на карте красит след от шагов.</p>
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
                style={{ '--swatch': option.burst } as React.CSSProperties}
              >
                <span className="staff-swatch__dot" aria-hidden="true" />
                <span className="staff-swatch__name">{option.name}</span>
                {!unlocked && land && <span className="staff-swatch__lock">спаси «{land.title}»</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
