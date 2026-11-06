import { expect, test, type Page, type Route } from '@playwright/test';
import { SESSION_STORAGE_KEY, SUPABASE_URL } from '../src/lib/config.js';

const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
const ok = (route: Route, body: unknown) => route.fulfill({ status: 200, contentType: 'application/json', headers: CORS, body: JSON.stringify(body) });
/** Так PostgREST отвечает, когда функция базы бросила исключение */
const refuse = (route: Route, message: string, code = 'P0001') =>
  route.fulfill({ status: 400, contentType: 'application/json', headers: CORS, body: JSON.stringify({ code, details: null, hint: null, message }) });

interface Teacher {
  id: string;
  nickname: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_admin: boolean;
}
interface Klass {
  id: string;
  name: string;
  code: string;
  teacher_id: string;
  students: number;
  levels_done: number;
  last_activity: string | null;
  open_lands: string[];
  created_at: string;
}

const TEACHERS: Teacher[] = [
  { id: 'admin-1', nickname: 'Главный', email: 'boss@example.com', created_at: '2026-10-01T10:00:00Z', last_sign_in_at: '2026-11-06T09:00:00Z', is_admin: true },
  { id: 't-anna', nickname: 'Анна', email: 'anna@example.com', created_at: '2026-10-05T10:00:00Z', last_sign_in_at: '2026-11-04T09:00:00Z', is_admin: false },
  { id: 't-boris', nickname: 'Борис', email: 'boris@example.com', created_at: '2026-10-09T10:00:00Z', last_sign_in_at: null, is_admin: false },
];
const CLASSES: Klass[] = [
  { id: 'c-a', name: '10А', code: 'ANNA22', teacher_id: 't-anna', students: 2, levels_done: 7, last_activity: '2026-11-05T12:00:00Z', open_lands: ['tags-valley'], created_at: '2026-10-06T10:00:00Z' },
  { id: 'c-b', name: '11Б', code: 'BORIS3', teacher_id: 't-boris', students: 1, levels_done: 0, last_activity: null, open_lands: ['tags-valley'], created_at: '2026-10-10T10:00:00Z' },
];

interface Call {
  name: string;
  body: Record<string, unknown>;
}

/**
 * База подменена целиком: вошёл учитель admin-1, а админ он или нет, решает isAdmin (null — функции is_admin в базе нет).
 * Действия админки меняют списки, как это сделала бы база, и записываются в calls: тест видит, с какими параметрами их вызвали.
 */
async function openWorld(page: Page, isAdmin: boolean | null) {
  const calls: Call[] = [];
  const state = { teachers: structuredClone(TEACHERS), classes: structuredClone(CLASSES), refuse: null as { name: string; message: string } | null };
  await page.addInitScript(
    ([key]) => {
      localStorage.setItem('cascadia.settings.v1', JSON.stringify({ sound: false, effects: 'light', look: 'noir' }));
      // У вошедшего свои ключи хранения: пролог уже виден именно ему
      localStorage.setItem('cascadia.u.admin-1.stats.v1', JSON.stringify({ seen: { 'prologue:game': true } }));
      localStorage.setItem(
        key,
        JSON.stringify({
          access_token: 'test.token.value',
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: 4102444800,
          refresh_token: 'refresh',
          user: { id: 'admin-1', aud: 'authenticated', role: 'authenticated', email: 'boss@example.com', app_metadata: {}, user_metadata: { role: 'teacher', nickname: 'Главный' }, created_at: '2026-10-01T00:00:00Z' },
        }),
      );
    },
    [SESSION_STORAGE_KEY],
  );
  await page.route(`${SUPABASE_URL}/**`, (route) => {
    const request = route.request();
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
    const url = new URL(request.url());
    if (!url.pathname.startsWith('/rest/v1/')) return ok(route, {});
    const name = url.pathname.replace('/rest/v1/', '');

    if (name === 'rpc/is_admin') {
      if (isAdmin === null) return refuse(route, 'Could not find the function public.is_admin without parameters in the schema cache', 'PGRST202');
      return ok(route, isAdmin);
    }
    if (name.startsWith('rpc/admin_')) {
      const rpc = name.replace('rpc/', '');
      const body = (request.postDataJSON() ?? {}) as Record<string, unknown>;
      if (rpc !== 'admin_overview') calls.push({ name: rpc, body });
      if (state.refuse?.name === rpc) return refuse(route, state.refuse.message);
      if (rpc === 'admin_overview') {
        return ok(route, {
          teachers: state.teachers.map((teacher) => ({
            ...teacher,
            classes: state.classes.filter((klass) => klass.teacher_id === teacher.id).length,
            students: state.classes.filter((klass) => klass.teacher_id === teacher.id).reduce((sum, klass) => sum + klass.students, 0),
          })),
          classes: state.classes,
          feedback_open: 4,
        });
      }
      if (rpc === 'admin_move_class') {
        const klass = state.classes.find((item) => item.id === body.target_class);
        if (klass) klass.teacher_id = String(body.target_teacher);
      }
      if (rpc === 'admin_delete_class') state.classes = state.classes.filter((klass) => klass.id !== body.target_class);
      if (rpc === 'admin_delete_user') {
        state.teachers = state.teachers.filter((teacher) => teacher.id !== body.target_user);
        state.classes = state.classes.filter((klass) => klass.teacher_id !== body.target_user);
      }
      return ok(route, null);
    }
    // Состав открытого класса: два студента без прогресса
    if (name === 'profiles' && url.searchParams.get('class_id')) {
      return ok(route, ['Маша', 'Петя'].map((nickname, i) => ({ id: `s${i + 1}`, nickname, created_at: '2026-11-01T00:00:00Z' })));
    }
    if (name === 'profiles') return ok(route, { role: 'teacher', nickname: 'Главный', classes: null });
    return ok(route, []);
  });
  return { calls, state };
}

test('админ: в шапке есть «Админка», а на экране сводка, учителя с почтой и классы с учителями', async ({ page }) => {
  await openWorld(page, true);
  await page.goto('/');
  await page.getByRole('link', { name: 'Админка' }).click();
  await expect(page).toHaveURL(/#\/admin$/);
  await expect(page.getByRole('heading', { name: 'Админка', level: 1 })).toBeVisible();

  // Сводка: три учителя (с самим админом), два класса, три студента и четыре сообщения без ответа
  const totals = page.getByRole('region', { name: 'Всего' });
  await expect(totals).toContainText('3учителя');
  await expect(totals).toContainText('2класса');
  await expect(totals).toContainText('3студента');
  await expect(totals).toContainText('4сообщений о проблемах без ответа');

  const teachers = page.getByRole('region', { name: 'Учителя' });
  await expect(teachers.getByRole('row')).toHaveCount(4); // шапка и три учителя
  const anna = teachers.getByRole('row', { name: /Анна/ });
  await expect(anna).toContainText('anna@example.com');
  await expect(anna.getByRole('cell').nth(1)).toHaveText('1'); // классов
  await expect(anna.getByRole('cell').nth(2)).toHaveText('2'); // студентов
  await expect(teachers.getByRole('row', { name: /Борис/ })).toContainText('—'); // ещё не входил
  // Админ помечен, и у него нет кнопок: удалить админа или сменить ему пароль из игры нельзя
  const boss = teachers.getByRole('row', { name: /Главный/ });
  await expect(boss).toContainText('админ');
  await expect(boss.getByRole('button')).toHaveCount(0);

  const classes = page.getByRole('region', { name: 'Классы' });
  const classA = classes.getByRole('row', { name: /10А/ });
  await expect(classA).toContainText('ANNA22');
  await expect(classA).toContainText('Анна');
  await expect(classA.getByRole('cell').nth(3)).toHaveText('7'); // пройдено уровней (название класса — заголовок строки, а не ячейка)

  // Поиск: по имени учителя остаётся и он, и его класс
  await page.getByLabel('Найти учителя или класс').fill('борис');
  await expect(teachers.getByRole('row')).toHaveCount(2);
  await expect(classes.getByRole('row', { name: /11Б/ })).toBeVisible();
  await expect(classes.getByRole('row', { name: /10А/ })).toHaveCount(0);
  await page.getByLabel('Найти учителя или класс').fill('нет такого');
  await expect(page.getByText('Никого не нашлось.')).toBeVisible();
  await expect(page.getByText('Ничего не нашлось.')).toBeVisible();
});

test('не админ: ссылки нет, а на странице админки сказано, что она не для него', async ({ page }) => {
  await openWorld(page, false);
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Панель учителя' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Админка' })).toHaveCount(0);
  await page.goto('/#/admin');
  await expect(page.getByText('Эта страница только для админа.')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Учителя' })).toHaveCount(0);
});

test('в базе ещё нет админской миграции: сайт работает как прежде, без ссылки и без ошибок', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await openWorld(page, null);
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Панель учителя' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Админка' })).toHaveCount(0);
  await page.goto('/#/teacher');
  await expect(page.getByRole('heading', { name: 'Панель учителя' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('админ открывает чужой класс: тот же вид, что у учителя, с кодом и составом', async ({ page }) => {
  await openWorld(page, true);
  await page.goto('/#/admin');
  const classes = page.getByRole('region', { name: 'Классы' });
  await classes.getByRole('button', { name: 'Открыть класс 10А' }).click();
  await expect(page.getByRole('heading', { name: '10А', level: 2 })).toBeVisible();
  await expect(page.locator('.class-code')).toHaveText('ANNA22');
  await expect(page.getByText('Студентов: 2')).toBeVisible();
  await expect(classes.getByRole('button', { name: 'Закрыть класс 10А' })).toHaveAttribute('aria-pressed', 'true');
  // Закрыл — класс убрался
  await classes.getByRole('button', { name: 'Закрыть класс 10А' }).click();
  await expect(page.locator('.class-code')).toHaveCount(0);
});

test('админ меняет учителю пароль, передаёт класс другому учителю: вызовы с верными параметрами, списки обновляются', async ({ page }) => {
  const { calls } = await openWorld(page, true);
  await page.goto('/#/admin');
  const teachers = page.getByRole('region', { name: 'Учителя' });
  const classes = page.getByRole('region', { name: 'Классы' });

  // Пароль: короткий не отправляется, нормальный уходит, и админ видит, что передать учителю
  await teachers.getByRole('button', { name: 'Новый пароль для Анна' }).click();
  const password = page.getByRole('dialog', { name: 'Новый пароль для «Анна»' });
  await password.getByRole('textbox').fill('123');
  await password.getByRole('button', { name: 'Сменить пароль' }).click();
  expect(calls).toEqual([]);
  await password.getByRole('textbox').fill('novyj-parol');
  await password.getByRole('button', { name: 'Сменить пароль' }).click();
  await expect(password).toContainText('Новый пароль: novyj-parol');
  expect(calls).toEqual([{ name: 'admin_reset_password', body: { target_user: 't-anna', new_password: 'novyj-parol' } }]);
  await page.keyboard.press('Escape');

  // Передача: Анне нельзя передать её же класс, выбор начинается с другого учителя
  await classes.getByRole('button', { name: 'Передать класс 10А' }).click();
  const move = page.getByRole('dialog', { name: 'Передать класс «10А»' });
  const options = move.getByLabel('Новый учитель').locator('option');
  await expect(options).toHaveText(['Главный · boss@example.com', 'Борис · boris@example.com']);
  await move.getByLabel('Новый учитель').selectOption({ label: 'Борис · boris@example.com' });
  await move.getByRole('button', { name: 'Передать' }).click();
  await expect(move).toHaveCount(0);
  expect(calls.at(-1)).toEqual({ name: 'admin_move_class', body: { target_class: 'c-a', target_teacher: 't-boris' } });
  // Список обновился по ответу базы: у класса 10А новый учитель, а у Бориса теперь два класса
  await expect(classes.getByRole('row', { name: /10А/ })).toContainText('Борис');
  await expect(teachers.getByRole('row', { name: /Борис/ }).getByRole('cell').nth(1)).toHaveText('2');
  await expect(teachers.getByRole('row', { name: /Анна/ }).getByRole('cell').nth(1)).toHaveText('0');
});

test('админ удаляет класс и учителя: окно говорит, что пропадёт; «Нет» ничего не делает; ошибка базы показана в окне', async ({ page }) => {
  const { calls, state } = await openWorld(page, true);
  await page.goto('/#/admin');
  const teachers = page.getByRole('region', { name: 'Учителя' });
  const classes = page.getByRole('region', { name: 'Классы' });

  // Класс: сколько студентов уйдёт, «Нет» закрывает окно без вызова
  await classes.getByRole('button', { name: 'Удалить класс 10А' }).click();
  const askClass = page.getByRole('dialog', { name: 'Удалить класс «10А»?' });
  await expect(askClass).toContainText('удалятся 2 студента, их аккаунты и весь прогресс');
  await askClass.getByRole('button', { name: 'Нет' }).click();
  await expect(askClass).toHaveCount(0);
  expect(calls).toEqual([]);
  await classes.getByRole('button', { name: 'Удалить класс 10А' }).click();
  await askClass.getByRole('button', { name: 'Да, удалить' }).click();
  await expect(askClass).toHaveCount(0);
  expect(calls).toEqual([{ name: 'admin_delete_class', body: { target_class: 'c-a' } }]);
  await expect(classes.getByRole('row', { name: /10А/ })).toHaveCount(0);

  // Учитель: сначала база отказывает (его уже нет), и ошибка видна в окне, а список не меняется
  state.refuse = { name: 'admin_delete_user', message: 'USER_NOT_FOUND' };
  await teachers.getByRole('button', { name: 'Удалить учителя Борис' }).click();
  const askTeacher = page.getByRole('dialog', { name: 'Удалить учителя «Борис»?' });
  await expect(askTeacher).toContainText('удалятся его классы (1), 1 студент, их аккаунты и весь прогресс');
  await askTeacher.getByRole('button', { name: 'Да, удалить' }).click();
  await expect(askTeacher.getByRole('alert')).toContainText('Такого аккаунта уже нет: обновите страницу.');
  await expect(teachers.getByRole('row', { name: /Борис/ })).toBeVisible();

  // Потом удалось: учитель и его класс исчезли
  state.refuse = null;
  await askTeacher.getByRole('button', { name: 'Да, удалить' }).click();
  await expect(askTeacher).toHaveCount(0);
  expect(calls.at(-1)).toEqual({ name: 'admin_delete_user', body: { target_user: 't-boris' } });
  await expect(teachers.getByRole('row', { name: /Борис/ })).toHaveCount(0);
  await expect(classes.getByRole('row', { name: /11Б/ })).toHaveCount(0);
});

test('админка на телефоне: страница не шире экрана, таблицы листаются внутри', async ({ page }) => {
  await openWorld(page, true);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/admin');
  await expect(page.getByRole('region', { name: 'Классы' })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const offenders = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('body *'))
      // Таблицы внутри своих листаемых рамок выходят за экран по замыслу: страницу они не растягивают
      .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1 && !el.parentElement?.closest('.admin-table__wrap') && !el.matches('.admin-table'))
      .slice(0, 6)
      .map((el) => `${el.tagName.toLowerCase()}.${el.className} → ${Math.round(el.getBoundingClientRect().right)}px`),
  );
  expect(overflow, `за край экрана выходят: ${offenders.join('; ')}`).toBeLessThanOrEqual(0);
});
