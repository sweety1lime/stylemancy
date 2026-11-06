import { expect, test, type Route } from '@playwright/test';
import { SESSION_STORAGE_KEY, SUPABASE_URL } from '../src/lib/config.js';

const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
const json = (route: Route, body: unknown) => route.fulfill({ status: 200, contentType: 'application/json', headers: CORS, body: JSON.stringify(body) });

const land = (slot: number, title: string, html: string, css = '') => ({ slot, title, html, css, signed: false, savedAt: '2026-11-06T10:00:00.000Z' });

test('панель учителя: земли студентов с миниатюрами, кодом и числом заданий; чужой код ничего не делает', async ({ page, context }) => {
  const beacons: string[] = [];
  await context.route('**/__beacon/**', (route) => {
    beacons.push(route.request().url());
    return route.fulfill({ status: 200, contentType: 'image/gif', body: '' });
  });
  await page.addInitScript(
    ([key]) => {
      localStorage.setItem('cascadia.settings.v1', JSON.stringify({ sound: false, effects: 'light', look: 'noir' }));
      localStorage.setItem('cascadia.stats.v1', JSON.stringify({ seen: { 'prologue:game': true } }));
      localStorage.setItem(
        key,
        JSON.stringify({
          access_token: 'test.token.value',
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: 4102444800,
          refresh_token: 'refresh',
          user: { id: 'teacher-1', aud: 'authenticated', role: 'authenticated', email: 'teacher@example.com', app_metadata: {}, user_metadata: { role: 'teacher', nickname: 'Учитель' }, created_at: '2026-01-01T00:00:00Z' },
        }),
      );
    },
    [SESSION_STORAGE_KEY],
  );
  const origin = 'http://127.0.0.1:5179';
  const stats = [
    {
      student_id: 's1',
      data: {
        stats: {
          reviewXp: 25,
          landTasks: ['tavern', 'sky', 'нет-такого-задания', 7],
          lands: [
            land(0, 'Деревня Маши', '<h1>Деревня Маши</h1><p>Тут тихо.</p>', 'h1 { color: red }'),
            land(1, 'Хитрая земля', `<h1>Хитрая</h1><script>document.title='взломано'</script><img src="${origin}/__beacon/pixel.gif" alt="">`),
            { slot: 2, title: '', html: '', css: '', signed: false, savedAt: '2026-11-06T11:00:00.000Z', gone: true },
          ],
        },
      },
    },
    { student_id: 's2', data: { stats: { reviewXp: 0 } } },
    { student_id: 's3', data: { stats: { lands: 'мусор', landTasks: { a: 1 } } } },
  ];
  await page.route(`${SUPABASE_URL}/**`, (route) => {
    const request = route.request();
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
    const url = new URL(request.url());
    const table = url.pathname.replace('/rest/v1/', '');
    if (!url.pathname.startsWith('/rest/v1/')) return json(route, {});
    if (table === 'classes') return json(route, [{ id: 'c1', name: '10Б', code: 'ABC123', open_lands: ['tags-valley'], created_at: '2026-11-01T00:00:00Z' }]);
    if (table === 'profiles' && url.searchParams.get('class_id')) {
      return json(route, ['Маша', 'Петя', 'Оля'].map((nickname, i) => ({ id: `s${i + 1}`, nickname, created_at: '2026-11-01T00:00:00Z' })));
    }
    if (table === 'profiles') return json(route, { role: 'teacher', nickname: 'Учитель', classes: null });
    if (table === 'student_stats' && (url.searchParams.get('student_id') ?? '').startsWith('in.')) return json(route, stats);
    return json(route, []);
  });

  await page.goto('/#/teacher');
  const lands = page.getByRole('region', { name: 'Земли студентов' });
  await expect(lands).toBeVisible();
  // Построила одна студентка: две живые земли, а удалённая и мусор не в счёт
  await expect(lands.getByText('Построили 1 из 3: 2 земли')).toBeVisible();
  await expect(lands.locator('.class-lands__name')).toHaveCount(1);
  await expect(lands.locator('.class-lands__name')).toContainText('Маша');
  await expect(lands.getByText('заданий выполнено: 2 из 6')).toBeVisible();
  await expect(lands.getByText('Петя')).toHaveCount(0);
  await expect(lands.getByText('Оля')).toHaveCount(0);
  await expect(lands.getByRole('button', { name: /Открыть землю/ })).toHaveCount(2);

  // Земля открывается страницей и кодом
  await lands.getByRole('button', { name: 'Открыть землю «Деревня Маши»' }).click();
  const dialog = page.getByRole('dialog', { name: 'Маша · Деревня Маши' });
  await expect(dialog.frameLocator('iframe.land-frame__page').getByRole('heading', { name: 'Деревня Маши' })).toBeVisible();
  await dialog.getByText('Код земли').click();
  await expect(dialog).toContainText('<p>Тут тихо.</p>');
  await expect(dialog).toContainText('h1 { color: red }');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);

  // Чужая земля с вредным кодом: на странице учителя она не выполняется и в сеть не ходит
  await lands.getByRole('button', { name: 'Открыть землю «Хитрая земля»' }).click();
  const tricky = page.getByRole('dialog', { name: 'Маша · Хитрая земля' });
  await expect(tricky.frameLocator('iframe.land-frame__page').getByRole('heading', { name: 'Хитрая' })).toBeVisible();
  await page.waitForTimeout(600);
  expect(await page.title()).not.toBe('взломано');
  expect(beacons).toEqual([]);
});
