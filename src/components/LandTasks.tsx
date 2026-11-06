import { useState } from 'react';
import type { GoalStatus } from '../engine/htmlCheck';
import { useStats } from '../game/stats';
import { LAND_TASKS, type CheckResult } from '../land/tasks';
import { GoalList } from './GoalList';

interface LandTasksProps {
  results: Record<string, CheckResult[]> | null;
  /** Земля — заготовка без правок: задание на ней не засчитывается */
  untouched: boolean;
}

/** Творческие задания «Моей земли»: условия загораются, пока игрок строит страницу. Необязательные, награда — опыт и свет посоха */
export function LandTasks({ results, untouched }: LandTasksProps) {
  const { landTasks } = useStats();
  // Показывается первое невыполненное задание, а дальше выбор не прыгает: выполненное задание остаётся на виду вместе с отметкой «опыт получен»
  const [picked, setPicked] = useState(() => (LAND_TASKS.find((task) => !landTasks.includes(task.id)) ?? LAND_TASKS[0]).id);
  const active = LAND_TASKS.find((task) => task.id === picked) ?? LAND_TASKS[0];
  const rewarded = landTasks.includes(active.id);
  const state = results?.[active.id] ?? [];
  const goals: GoalStatus[] = active.checks.map((check, i) => ({ label: check.label, done: Boolean(state[i]?.done), detail: state[i]?.detail }));
  const next = active.checks.find((_, i) => !state[i]?.done);
  const finished = goals.every((goal) => goal.done);

  return (
    <section className="land-tasks" aria-label="Творческие задания">
      <h2 className="pixel-subtitle">Творческие задания</h2>
      <p className="land-tasks__lead">
        По желанию. Выполни задание на своей странице: придёт опыт, а за три задания открывается новый свет посоха ({landTasks.length} из {LAND_TASKS.length} выполнено).
      </p>
      <div className="land-tasks__tabs" role="group" aria-label="Задания">
        {LAND_TASKS.map((task) => (
          <button
            key={task.id}
            type="button"
            className={task.id === active.id ? 'chip chip--on' : 'chip'}
            aria-pressed={task.id === active.id}
            onClick={() => setPicked(task.id)}
          >
            {landTasks.includes(task.id) && <span aria-label="выполнено">✦ </span>}
            {task.title}
          </button>
        ))}
      </div>
      <p className="land-tasks__brief">
        {active.brief} <span className="land-tasks__xp">{active.xp} XP</span>
      </p>
      <GoalList goals={goals} title="Условия" />
      {rewarded && (
        <p className="land-tasks__done" role="status">
          Задание выполнено, опыт получен.
        </p>
      )}
      {!rewarded && finished && untouched && (
        <p className="land-tasks__hint" role="status">
          Это заготовка без единой правки. Поменяй в ней что-нибудь своё, и задание засчитается.
        </p>
      )}
      {!finished && next?.hint && <p className="land-tasks__hint">Подсказка: {next.hint}</p>}
    </section>
  );
}
