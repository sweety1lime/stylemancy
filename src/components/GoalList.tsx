import type { GoalStatus } from '../engine/htmlCheck';
import { RichText } from './RichText';

/** Цели HTML-уровня: загораются, как только разметка их выполняет. */
export function GoalList({ goals }: { goals: GoalStatus[] }) {
  const done = goals.filter((goal) => goal.done).length;
  return (
    <section className="goals px-panel" aria-label="Цели">
      <p className="goals__head">
        <span>Цели</span>
        <span>
          {done} из {goals.length}
        </span>
      </p>
      <ul className="goals__list">
        {/* Одинаковые цели бывают: Оракул может сказать «Помешиваю!» трижды */}
        {goals.map((goal, i) => (
          <li key={`${i}:${goal.label}`} className={goal.done ? 'goal goal--done' : 'goal'}>
            <span className="goal__mark" aria-hidden="true">
              {goal.done ? '✦' : '○'}
            </span>
            <span>
              <RichText text={goal.label} />
              {!goal.done && goal.detail && <span className="goal__detail"> — {goal.detail}</span>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
