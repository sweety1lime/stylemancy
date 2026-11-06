import type { CSSProperties } from 'react';
import type { GoalStatus } from '../engine/htmlCheck';
import { RichText } from './RichText';

/** Цели HTML-уровня: загораются, как только разметка их выполняет. У заказа жителя тот же список зовётся «Заказчик хочет». */
export function GoalList({ goals, title = 'Цели' }: { goals: GoalStatus[]; title?: string }) {
  const done = goals.filter((goal) => goal.done).length;
  return (
    <section className="goals px-panel" aria-label={title}>
      <p className="goals__head">
        <span>{title}</span>
        <span>
          {done} из {goals.length}
        </span>
      </p>
      <ul className="goals__list">
        {/* Одинаковые цели бывают: Оракул может сказать «Помешиваю!» трижды */}
        {goals.map((goal, i) => (
          // Номер цели: когда одним набором зажигаются сразу несколько, отметки вспыхивают по очереди
          <li key={`${i}:${goal.label}`} className={goal.done ? 'goal goal--done' : 'goal'} style={{ '--i': i } as CSSProperties}>
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
