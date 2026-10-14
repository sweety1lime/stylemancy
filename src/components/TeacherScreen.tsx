import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import type { Level } from '../engine/types';
import { useAuth } from '../game/auth';
import { levelXp } from '../game/ranks';
import {
  createClass,
  deleteFeedback,
  listClasses,
  loadRoster,
  removeStudent,
  resetStudentPassword,
  setFeedbackResolved,
  setOpenLands,
  type ClassRow,
  type FeedbackRow,
  type ProgressRow,
  type Roster,
  type StudentRow,
} from '../game/teacher';
import { allLevels, lands, regions } from '../levels';
import { ClassCard } from './ClassCard';
import { FeedbackList } from './FeedbackList';
import { Modal } from './Modal';

const REFRESH_MS = 30_000;

/** Номер уровня внутри района — как на тропе */
const NUMBER_IN_REGION = new Map(regions.flatMap((region) => region.levels.map((level, i) => [level.id, i + 1] as const)));
/** Первые уровни районов: перед ними в таблице граница */
const REGION_STARTS = new Set(regions.map((region) => region.levels[0]?.id));

export function TeacherScreen() {
  const { account, ready } = useAuth();
  if (!ready) return <main className="teacher">Загружаем…</main>;
  if (!account) {
    return (
      <main className="teacher">
        <section className="px-panel teacher__note">
          <h1 className="pixel-title">Панель учителя</h1>
          <p>
            Чтобы увидеть свои классы, <a href="#/login">войдите как преподаватель</a>.
          </p>
        </section>
      </main>
    );
  }
  if (account.role !== 'teacher') {
    return (
      <main className="teacher">
        <section className="px-panel teacher__note">
          <h1 className="pixel-title">Панель учителя</h1>
          <p>Эта страница — только для преподавателей.</p>
        </section>
      </main>
    );
  }
  return <TeacherPanel teacherId={account.id} />;
}

function TeacherPanel({ teacherId }: { teacherId: string }) {
  const [classes, setClasses] = useState<ClassRow[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    listClasses(teacherId)
      .then((list) => {
        if (cancelled) return;
        setClasses(list);
        setSelectedId((current) => current ?? list[0]?.id ?? null);
      })
      .catch((failure: Error) => !cancelled && setError(failure.message));
    return () => {
      cancelled = true;
    };
  }, [teacherId]);

  async function create(event: FormEvent) {
    event.preventDefault();
    if (!newName.trim()) return;
    setError('');
    try {
      const created = await createClass(newName.trim());
      setClasses((list) => [...(list ?? []), created]);
      setSelectedId(created.id);
      setNewName('');
    } catch (failure) {
      setError((failure as Error).message);
    }
  }

  const selected = classes?.find((item) => item.id === selectedId);

  return (
    <main className="teacher">
      <h1 className="pixel-title">Панель учителя</h1>
      {error && (
        <p className="login__error" role="alert">
          {error}
        </p>
      )}
      <div className="teacher__layout">
        <aside className="teacher__classes px-panel">
          <h2 className="pixel-subtitle">Классы</h2>
          {classes === null ? (
            <p className="teacher__muted">Загружаем…</p>
          ) : (
            <ul className="class-list">
              {classes.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={item.id === selectedId ? 'class-list__item class-list__item--on' : 'class-list__item'}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <span>{item.name}</span>
                    <code>{item.code}</code>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <form className="class-new" onSubmit={create}>
            <label className="field">
              <span>Новый класс</span>
              <input
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="Например, 10Б — вёрстка"
                maxLength={60}
              />
            </label>
            <button type="submit" className="button button--ghost">
              Создать класс
            </button>
          </form>
        </aside>

        {selected ? (
          <ClassView
            key={selected.id}
            klass={selected}
            onClassChange={(updated) => setClasses((list) => list?.map((item) => (item.id === updated.id ? updated : item)) ?? null)}
          />
        ) : (
          <section className="px-panel teacher__note">
            <p>Создайте первый класс — появится код, по которому студенты зарегистрируются.</p>
          </section>
        )}
      </div>
    </main>
  );
}

/* ——— Класс: код, земли, таблица прогресса ——— */

interface LevelStat {
  level: Level;
  attempted: number;
  completed: number;
  avgAttempts: number;
  avgHints: number;
  /** Группа здесь застревает */
  hot: boolean;
}

function levelStats(roster: Roster): LevelStat[] {
  return allLevels.map((level) => {
    const rows = roster.progress.filter((row) => row.level_id === level.id && row.attempts > 0);
    const completed = rows.filter((row) => row.completed).length;
    const avgAttempts = rows.length ? rows.reduce((sum, row) => sum + row.attempts, 0) / rows.length : 0;
    const avgHints = rows.length ? rows.reduce((sum, row) => sum + row.hints_used, 0) / rows.length : 0;
    const hot = rows.length >= 2 && (avgAttempts >= 4 || avgHints >= 1.5 || completed / rows.length < 0.5);
    return { level, attempted: rows.length, completed, avgAttempts, avgHints, hot };
  });
}

function starsText(stars: number): string {
  return '★'.repeat(stars) + '☆'.repeat(3 - stars);
}

function downloadCsv(klass: ClassRow, roster: Roster) {
  const byStudent = groupProgress(roster.progress);
  const header = [
    'Ник',
    'Пройдено',
    'Звёзды',
    'XP',
    ...allLevels.map((level) => `${level.regionTitle} ${NUMBER_IN_REGION.get(level.id)}. ${level.title}`),
  ];
  const lines = roster.students.map((student) => {
    const rows = byStudent[student.id] ?? {};
    const summary = studentSummary(rows, roster.reviewXp[student.id] ?? 0);
    return [
      student.nickname,
      String(summary.completed),
      String(summary.stars),
      String(summary.xp),
      ...allLevels.map((level) => {
        const row = rows[level.id];
        if (row?.completed) return `${row.stars}★`;
        return row?.attempts ? `попыток: ${row.attempts}` : '';
      }),
    ];
  });
  const escape = (cell: string) => (/[;"\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell);
  // BOM и «;» — чтобы Excel с русскими настройками открыл файл без кракозябр
  const csv = '﻿' + [header, ...lines].map((line) => line.map(escape).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${klass.name} — прогресс.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function groupProgress(rows: ProgressRow[]): Record<string, Record<string, ProgressRow>> {
  const result: Record<string, Record<string, ProgressRow>> = {};
  for (const row of rows) (result[row.student_id] ??= {})[row.level_id] = row;
  return result;
}

function studentSummary(rows: Record<string, ProgressRow>, reviewXp: number) {
  const list = Object.values(rows);
  return {
    completed: list.filter((row) => row.completed).length,
    stars: list.reduce((sum, row) => sum + row.stars, 0),
    xp: list.reduce((sum, row) => sum + levelXp({ completed: row.completed, stars: row.stars, attempts: 0, hintsUsed: 0 }), reviewXp),
  };
}

function ClassView({ klass, onClassChange }: { klass: ClassRow; onClassChange: (updated: ClassRow) => void }) {
  const [roster, setRoster] = useState<Roster | null>(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [detail, setDetail] = useState<{ student: StudentRow; level: Level; row: ProgressRow } | null>(null);
  const [resetFor, setResetFor] = useState<StudentRow | null>(null);
  const [feedbackCode, setFeedbackCode] = useState<FeedbackRow | null>(null);
  const [showCard, setShowCard] = useState(false);
  const joinLink = `${window.location.origin}${window.location.pathname}`;

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      loadRoster(klass.id)
        .then((next) => {
          if (cancelled) return;
          setRoster(next);
          setError('');
        })
        .catch((failure: Error) => !cancelled && setError(failure.message));
    void load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [klass.id, reload]);

  async function toggleLand(landId: string, open: boolean) {
    const next = open ? [...klass.open_lands, landId] : klass.open_lands.filter((id) => id !== landId);
    try {
      await setOpenLands(klass.id, next);
      onClassChange({ ...klass, open_lands: next });
    } catch (failure) {
      setError((failure as Error).message);
    }
  }

  async function remove(student: StudentRow) {
    if (!window.confirm(`Удалить «${student.nickname}» из класса вместе с прогрессом? Это нельзя отменить.`)) return;
    try {
      await removeStudent(student.id);
      setReload((n) => n + 1);
    } catch (failure) {
      setError((failure as Error).message);
    }
  }

  async function toggleResolved(item: FeedbackRow) {
    try {
      await setFeedbackResolved(item.id, !item.resolved);
      setReload((n) => n + 1);
    } catch (failure) {
      setError((failure as Error).message);
    }
  }

  async function removeFeedback(item: FeedbackRow) {
    if (!window.confirm('Удалить сообщение?')) return;
    try {
      await deleteFeedback(item.id);
      setReload((n) => n + 1);
    } catch (failure) {
      setError((failure as Error).message);
    }
  }

  const stats = roster ? levelStats(roster) : [];
  const hot = stats.filter((item) => item.hot);
  const byStudent = roster ? groupProgress(roster.progress) : {};

  return (
    <section className="class-view">
      <div className="class-view__head px-panel">
        <div>
          <h2 className="pixel-subtitle">{klass.name}</h2>
          <p className="teacher__muted">
            Студенты открывают <a href={joinLink}>{joinLink}</a> → «Войти» → «Создать аккаунт» и вводят код:
          </p>
        </div>
        <div className="class-view__code">
          <button
            type="button"
            className="class-code"
            title="Скопировать код"
            onClick={() => void navigator.clipboard?.writeText(klass.code)}
          >
            {klass.code}
          </button>
          <button type="button" className="text-button" onClick={() => setShowCard(true)}>
            Карточка для урока
          </button>
        </div>
      </div>

      <div className="class-view__lands px-panel">
        <span className="teacher__label">Открытые земли</span>
        {lands.map((land) => (
          <label key={land.id} className="field--check">
            <input
              type="checkbox"
              disabled={land.regions.length === 0}
              checked={klass.open_lands.includes(land.id)}
              onChange={(event) => void toggleLand(land.id, event.target.checked)}
            />
            <span>
              {land.title}
              {land.regions.length === 0 && ' — в работе'}
            </span>
          </label>
        ))}
      </div>

      {error && (
        <p className="login__error" role="alert">
          {error}
        </p>
      )}

      <div className="class-view__toolbar">
        <span className="teacher__muted">
          {roster ? `Студентов: ${roster.students.length}` : 'Загружаем прогресс…'} · обновляется каждые 30 секунд
        </span>
        <button type="button" className="text-button" onClick={() => setReload((n) => n + 1)}>
          Обновить
        </button>
        {roster && roster.students.length > 0 && (
          <button type="button" className="text-button" onClick={() => downloadCsv(klass, roster)}>
            Скачать CSV
          </button>
        )}
      </div>

      {roster === null ? null : roster.students.length === 0 ? (
        <section className="px-panel teacher__note">
          <p>В классе пока никого. Раздайте студентам код — они появятся здесь сразу после регистрации.</p>
        </section>
      ) : (
        <>
          {roster.feedback.length > 0 && (
            <FeedbackList
              feedback={roster.feedback}
              students={roster.students}
              onShowCode={setFeedbackCode}
              onToggle={(item) => void toggleResolved(item)}
              onRemove={(item) => void removeFeedback(item)}
            />
          )}

          {hot.length > 0 && (
            <p className="class-view__hot px-panel">
              Группа застревает: {hot.map((item) => `«${item.level.title}»`).join(', ')}. Возможно, тему стоит разобрать на уроке.
            </p>
          )}

          <div className="progress-table__wrap px-panel">
            <table className="progress-table">
              <thead>
                <tr>
                  <th scope="col" rowSpan={2}>
                    Студент
                  </th>
                  {regions.map((region) => (
                    <th key={region.id} scope="colgroup" colSpan={region.levels.length} className="progress-table__region">
                      {region.title}
                    </th>
                  ))}
                  <th scope="col" rowSpan={2}>
                    Пройдено
                  </th>
                  <th scope="col" rowSpan={2}>
                    ★
                  </th>
                  <th scope="col" rowSpan={2}>
                    XP
                  </th>
                  <th scope="col" rowSpan={2} aria-label="Действия" />
                </tr>
                <tr>
                  {stats.map((item) => (
                    <th
                      key={item.level.id}
                      scope="col"
                      className={[
                        'progress-table__level',
                        item.hot && 'progress-table__level--hot',
                        REGION_STARTS.has(item.level.id) && 'progress-table__start',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      title={`${item.level.title}: прошли ${item.completed} из ${item.attempted} начавших, попыток в среднем ${item.avgAttempts.toFixed(1)}, подсказок ${item.avgHints.toFixed(1)}`}
                    >
                      {item.level.trial ? '♛' : NUMBER_IN_REGION.get(item.level.id)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roster.students.map((student) => {
                  const rows = byStudent[student.id] ?? {};
                  const summary = studentSummary(rows, roster.reviewXp[student.id] ?? 0);
                  return (
                    <tr key={student.id}>
                      <th scope="row">{student.nickname}</th>
                      {allLevels.map((level) => {
                        const row = rows[level.id];
                        let content: ReactNode = '·';
                        let className = 'cell';
                        if (row?.completed) {
                          content = starsText(row.stars);
                          className = 'cell cell--done';
                        } else if (row?.attempts) {
                          content = `×${row.attempts}`;
                          className = 'cell cell--stuck';
                        }
                        return (
                          <td key={level.id} className={REGION_STARTS.has(level.id) ? 'progress-table__start' : undefined}>
                            {row ? (
                              <button
                                type="button"
                                className={className}
                                onClick={() => setDetail({ student, level, row })}
                                aria-label={`${student.nickname}, ${level.title}`}
                              >
                                {content}
                              </button>
                            ) : (
                              <span className={className}>{content}</span>
                            )}
                          </td>
                        );
                      })}
                      <td>
                        {summary.completed}/{allLevels.length}
                      </td>
                      <td>{summary.stars}</td>
                      <td>{summary.xp}</td>
                      <td className="progress-table__actions">
                        <button type="button" className="text-button" onClick={() => setResetFor(student)}>
                          Сбросить пароль
                        </button>
                        <button type="button" className="text-button" onClick={() => void remove(student)}>
                          Удалить
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {feedbackCode && (
        <Modal title="Код студента в момент сообщения" onClose={() => setFeedbackCode(null)}>
          <pre className="example__code">
            <code>{feedbackCode.code}</code>
          </pre>
        </Modal>
      )}

      {showCard && <ClassCard klass={klass} joinLink={joinLink} onClose={() => setShowCard(false)} />}

      {detail && (
        <Modal title={`${detail.student.nickname} · ${detail.level.title}`} onClose={() => setDetail(null)}>
          <p>
            {detail.row.completed ? `Пройдено: ${starsText(detail.row.stars)}` : 'Пока не пройдено'} · попыток:{' '}
            {detail.row.attempts} · подсказок: {detail.row.hints_used}
          </p>
          {detail.row.best_code ? (
            <pre className="example__code">
              <code>{detail.row.best_code}</code>
            </pre>
          ) : (
            <p className="teacher__muted">Код появится, когда уровень будет пройден.</p>
          )}
        </Modal>
      )}

      {resetFor && <ResetPassword student={resetFor} onClose={() => setResetFor(null)} />}
    </section>
  );
}

function ResetPassword({ student, onClose }: { student: StudentRow; onClose: () => void }) {
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      await resetStudentPassword(student.id, password);
      setDone(true);
    } catch (failure) {
      setError((failure as Error).message);
    }
  }

  return (
    <Modal title={`Новый пароль для «${student.nickname}»`} onClose={onClose}>
      {done ? (
        <p>
          Готово. Новый пароль: <code className="inline-code">{password}</code> — передайте его студенту.
        </p>
      ) : (
        <form className="login__form" onSubmit={submit}>
          <label className="field">
            <span>Новый пароль (минимум 6 символов)</span>
            <input value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required />
          </label>
          {error && (
            <p className="login__error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="button button--cast">
            Сбросить пароль
          </button>
        </form>
      )}
    </Modal>
  );
}

