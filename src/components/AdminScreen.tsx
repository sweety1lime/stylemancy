import { useEffect, useState, type FormEvent } from 'react';
import {
  deleteClass,
  deleteTeacher,
  loadOverview,
  moveClass,
  resetPassword,
  type AdminClass,
  type AdminOverview,
  type AdminTeacher,
} from '../game/admin';
import { useAuth } from '../game/auth';
import { plural } from '../lib/plural';
import { Modal } from './Modal';
import { ClassView } from './TeacherScreen';

/** О чём сейчас спрашивает окно: передать класс, удалить класс или учителя, сменить учителю пароль */
type Dialog =
  | { kind: 'move'; klass: AdminClass }
  | { kind: 'delete-class'; klass: AdminClass }
  | { kind: 'delete-teacher'; teacher: AdminTeacher }
  | { kind: 'password'; teacher: AdminTeacher };

function shortDate(value: string | null): string {
  return value ? new Date(value).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
}

function studentsText(count: number): string {
  return `${count} ${plural(count, 'студент', 'студента', 'студентов')}`;
}

/** Админка суперадмина: все учителя, классы и студенты. Права проверяет база: экран лишь не показывается остальным */
export function AdminScreen() {
  const { account, ready } = useAuth();
  if (!ready) return <main className="teacher">Загружаем…</main>;
  if (!account?.isAdmin) {
    return (
      <main className="teacher">
        <section className="px-panel teacher__note">
          <h1 className="pixel-title">Админка</h1>
          <p>
            Эта страница только для админа.
            {!account && (
              <>
                {' '}
                <a href="#/login">Войти</a>
              </>
            )}
          </p>
        </section>
      </main>
    );
  }
  return <AdminPanel />;
}

function AdminPanel() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    loadOverview()
      .then((next) => {
        if (cancelled) return;
        setOverview(next);
        setError('');
      })
      .catch((failure: Error) => !cancelled && setError(failure.message));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  /** Действие в окне удалось: окно закрывается, списки обновляются. Открытый класс, которого больше нет, исчезает сам */
  function finish() {
    setDialog(null);
    setReloadKey((n) => n + 1);
  }

  const needle = query.trim().toLowerCase();
  const teacherName = new Map((overview?.teachers ?? []).map((teacher) => [teacher.id, teacher.nickname]));
  const teachers = (overview?.teachers ?? []).filter(
    (teacher) => !needle || `${teacher.nickname} ${teacher.email ?? ''}`.toLowerCase().includes(needle),
  );
  const classes = (overview?.classes ?? []).filter(
    (klass) => !needle || `${klass.name} ${klass.code} ${teacherName.get(klass.teacher_id) ?? ''}`.toLowerCase().includes(needle),
  );
  const selected = overview?.classes.find((klass) => klass.id === selectedId);
  const totalStudents = (overview?.classes ?? []).reduce((sum, klass) => sum + klass.students, 0);

  return (
    <main className="teacher admin">
      <h1 className="pixel-title">Админка</h1>
      {error && (
        <p className="login__error" role="alert">
          {error}
        </p>
      )}

      {overview === null ? (
        !error && <p className="teacher__muted">Загружаем…</p>
      ) : (
        <>
          <section className="admin__totals" aria-label="Всего">
            <div className="admin__total px-panel">
              <strong>{overview.teachers.length}</strong>
              <span>{plural(overview.teachers.length, 'учитель', 'учителя', 'учителей')}</span>
            </div>
            <div className="admin__total px-panel">
              <strong>{overview.classes.length}</strong>
              <span>{plural(overview.classes.length, 'класс', 'класса', 'классов')}</span>
            </div>
            <div className="admin__total px-panel">
              <strong>{totalStudents}</strong>
              <span>{plural(totalStudents, 'студент', 'студента', 'студентов')}</span>
            </div>
            <div className="admin__total px-panel">
              <strong>{overview.feedback_open}</strong>
              <span>сообщений о проблемах без ответа</span>
            </div>
          </section>

          <label className="field admin__search">
            <span>Найти учителя или класс</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Имя, почта, название или код класса" />
          </label>

          <section className="admin__panel px-panel" aria-label="Учителя">
            <h2 className="pixel-subtitle">Учителя</h2>
            {teachers.length === 0 ? (
              <p className="teacher__muted">Никого не нашлось.</p>
            ) : (
              <div className="admin-table__wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th scope="col">Учитель</th>
                      <th scope="col">Почта</th>
                      <th scope="col">Классов</th>
                      <th scope="col">Студентов</th>
                      <th scope="col">Последний вход</th>
                      <th scope="col">
                        <span className="visually-hidden">Действия</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((teacher) => (
                      <tr key={teacher.id}>
                        <th scope="row">
                          {teacher.nickname}
                          {teacher.is_admin && <span className="admin__badge">админ</span>}
                        </th>
                        <td>{teacher.email ?? '—'}</td>
                        <td className="admin-table__num">{teacher.classes}</td>
                        <td className="admin-table__num">{teacher.students}</td>
                        <td>{shortDate(teacher.last_sign_in_at)}</td>
                        <td>
                          {/* Админа из игры не удалить и пароль не сменить: это закрывает и база */}
                          {!teacher.is_admin && (
                            <div className="admin-table__actions">
                              <button
                                type="button"
                                className="button button--ghost button--small"
                                aria-label={`Новый пароль для ${teacher.nickname}`}
                                onClick={() => setDialog({ kind: 'password', teacher })}
                              >
                                Пароль
                              </button>
                              <button
                                type="button"
                                className="button button--danger button--small"
                                aria-label={`Удалить учителя ${teacher.nickname}`}
                                onClick={() => setDialog({ kind: 'delete-teacher', teacher })}
                              >
                                Удалить
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="admin__panel px-panel" aria-label="Классы">
            <h2 className="pixel-subtitle">Классы</h2>
            {classes.length === 0 ? (
              <p className="teacher__muted">Ничего не нашлось.</p>
            ) : (
              <div className="admin-table__wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th scope="col">Класс</th>
                      <th scope="col">Код</th>
                      <th scope="col">Учитель</th>
                      <th scope="col">Студентов</th>
                      <th scope="col">Пройдено уровней</th>
                      <th scope="col">Последняя работа</th>
                      <th scope="col">
                        <span className="visually-hidden">Действия</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((klass) => (
                      <tr key={klass.id} className={klass.id === selectedId ? 'admin-table__row--on' : undefined}>
                        <th scope="row">{klass.name}</th>
                        <td>
                          <code>{klass.code}</code>
                        </td>
                        <td>{teacherName.get(klass.teacher_id) ?? '—'}</td>
                        <td className="admin-table__num">{klass.students}</td>
                        <td className="admin-table__num">{klass.levels_done}</td>
                        <td>{shortDate(klass.last_activity)}</td>
                        <td>
                          <div className="admin-table__actions">
                            <button
                              type="button"
                              className="button button--ghost button--small"
                              aria-label={klass.id === selectedId ? `Закрыть класс ${klass.name}` : `Открыть класс ${klass.name}`}
                              aria-pressed={klass.id === selectedId}
                              onClick={() => setSelectedId(klass.id === selectedId ? null : klass.id)}
                            >
                              {klass.id === selectedId ? 'Закрыть' : 'Открыть'}
                            </button>
                            <button
                              type="button"
                              className="button button--ghost button--small"
                              aria-label={`Передать класс ${klass.name}`}
                              onClick={() => setDialog({ kind: 'move', klass })}
                            >
                              Передать
                            </button>
                            <button
                              type="button"
                              className="button button--danger button--small"
                              aria-label={`Удалить класс ${klass.name}`}
                              onClick={() => setDialog({ kind: 'delete-class', klass })}
                            >
                              Удалить
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {selected && (
            // Тот же вид, что у учителя: прогресс, земли, решения, пароли студентов, сообщения о проблемах
            <ClassView
              key={selected.id}
              klass={{ id: selected.id, name: selected.name, code: selected.code, open_lands: selected.open_lands, created_at: selected.created_at }}
              onClassChange={(updated) =>
                setOverview((current) =>
                  current && {
                    ...current,
                    classes: current.classes.map((klass) => (klass.id === updated.id ? { ...klass, open_lands: updated.open_lands } : klass)),
                  },
                )
              }
            />
          )}
        </>
      )}

      {dialog?.kind === 'delete-class' && (
        <Confirm
          title={`Удалить класс «${dialog.klass.name}»?`}
          text={`Вместе с классом удалятся ${studentsText(dialog.klass.students)}, их аккаунты и весь прогресс. Отменить это нельзя.`}
          onConfirm={async () => {
            await deleteClass(dialog.klass.id);
            finish();
          }}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === 'delete-teacher' && (
        <Confirm
          title={`Удалить учителя «${dialog.teacher.nickname}»?`}
          text={`Вместе с учителем удалятся его классы (${dialog.teacher.classes}), ${studentsText(dialog.teacher.students)}, их аккаунты и весь прогресс. Отменить это нельзя.`}
          onConfirm={async () => {
            await deleteTeacher(dialog.teacher.id);
            finish();
          }}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === 'move' && (
        <MoveClass
          klass={dialog.klass}
          teachers={overview?.teachers ?? []}
          onDone={finish}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === 'password' && <TeacherPassword teacher={dialog.teacher} onClose={() => setDialog(null)} />}
    </main>
  );
}

/** Окно подтверждения: что именно пропадёт, и кнопка «Да, удалить» */
function Confirm({ title, text, onConfirm, onClose }: { title: string; text: string; onConfirm: () => Promise<void>; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function run() {
    setBusy(true);
    setError('');
    try {
      await onConfirm();
    } catch (failure) {
      setError((failure as Error).message);
      setBusy(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <div className="admin__confirm">
        <p>{text}</p>
        {error && (
          <p className="login__error" role="alert">
            {error}
          </p>
        )}
        <div className="admin__confirm-actions">
          <button type="button" className="button button--danger" disabled={busy} onClick={() => void run()}>
            Да, удалить
          </button>
          <button type="button" className="text-button" onClick={onClose}>
            Нет
          </button>
        </div>
      </div>
    </Modal>
  );
}

function MoveClass({ klass, teachers, onDone, onClose }: { klass: AdminClass; teachers: AdminTeacher[]; onDone: () => void; onClose: () => void }) {
  const options = teachers.filter((teacher) => teacher.id !== klass.teacher_id);
  const [target, setTarget] = useState(options[0]?.id ?? '');
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      await moveClass(klass.id, target);
      onDone();
    } catch (failure) {
      setError((failure as Error).message);
    }
  }

  return (
    <Modal title={`Передать класс «${klass.name}»`} onClose={onClose}>
      {options.length === 0 ? (
        <p>Других учителей пока нет: передать класс некому.</p>
      ) : (
        <form className="login__form" onSubmit={submit}>
          <p className="teacher__muted">Студенты и их прогресс остаются в классе, меняется только учитель.</p>
          <label className="field">
            <span>Новый учитель</span>
            <select value={target} onChange={(event) => setTarget(event.target.value)} required>
              {options.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.nickname}
                  {teacher.email ? ` · ${teacher.email}` : ''}
                </option>
              ))}
            </select>
          </label>
          {error && (
            <p className="login__error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="button button--cast" disabled={!target}>
            Передать
          </button>
        </form>
      )}
    </Modal>
  );
}

function TeacherPassword({ teacher, onClose }: { teacher: AdminTeacher; onClose: () => void }) {
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      await resetPassword(teacher.id, password);
      setDone(true);
    } catch (failure) {
      setError((failure as Error).message);
    }
  }

  return (
    <Modal title={`Новый пароль для «${teacher.nickname}»`} onClose={onClose}>
      {done ? (
        <p>
          Готово. Новый пароль: <code className="inline-code">{password}</code> — передайте его учителю.
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
            Сменить пароль
          </button>
        </form>
      )}
    </Modal>
  );
}
