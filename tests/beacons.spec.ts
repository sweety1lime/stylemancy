import { expect, test, type Route } from '@playwright/test';
import { SESSION_STORAGE_KEY, SUPABASE_URL } from '../src/lib/config.js';

test('маяки класса: уровень горит, когда его прошла хотя бы половина класса', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(`Promise.all([import('/src/game/beacons.ts'), import('/src/levels/index.ts')]).then(([beacons, levels]) => {
    const done = (level_id, count) => Array.from({ length: count }, () => ({ level_id, completed: true }));
    const progress = [...done('tag-01', 2), ...done('tag-02', 1), { level_id: 'tag-03', completed: false }, ...done('нет-такого-уровня', 4)];
    const pick = (result, id) => result.lands.flatMap((land) => land.regions.flatMap((region) => region.levels)).find((beacon) => beacon.level.id === id);
    const four = beacons.beaconsOf(4, progress, levels.allLands);
    const empty = beacons.beaconsOf(0, progress, levels.allLands);
    return {
      need: four.need,
      lit: pick(four, 'tag-01').lit,
      spark: { done: pick(four, 'tag-02').done, lit: pick(four, 'tag-02').lit },
      tried: { done: pick(four, 'tag-03').done, lit: pick(four, 'tag-03').lit },
      total: four.lit,
      noStudents: empty.lit,
    };
  })`);
  // Из четырёх студентов нужно двое: первый уровень прошли двое — горит, второй один — только тлеет, у третьего лишь попытки
  expect(result).toEqual({ need: 2, lit: true, spark: { done: 1, lit: false }, tried: { done: 0, lit: false }, total: 1, noStudents: 0 });
});

const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
const json = (route: Route, body: unknown) => route.fulfill({ status: 200, contentType: 'application/json', headers: CORS, body: JSON.stringify(body) });

test('маяки класса в панели учителя: общая полоса, огни уровней и проектор без имён', async ({ page }) => {
  const done = (student: string, level: string) => ({ student_id: student, level_id: level, completed: true, stars: 3, attempts: 1, hints_used: 0, best_code: null, updated_at: '2026-11-06T10:00:00Z' });
  const rows = [done('s1', 'tag-01'), done('s2', 'tag-01'), done('s3', 'tag-01'), done('s1', 'tag-02')];
  await page.addInitScript(
    ([key]) => {
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
  // База подменена: учитель с одним классом из четырёх студентов
  await page.route(`${SUPABASE_URL}/**`, (route) => {
    const request = route.request();
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
    const url = new URL(request.url());
    const table = url.pathname.replace('/rest/v1/', '');
    if (!url.pathname.startsWith('/rest/v1/')) return json(route, {});
    if (table === 'classes') return json(route, [{ id: 'c1', name: '10Б', code: 'ABC123', open_lands: ['tags-valley'], created_at: '2026-11-01T00:00:00Z' }]);
    if (table === 'profiles' && url.searchParams.get('class_id')) {
      return json(route, ['s1', 's2', 's3', 's4'].map((id, i) => ({ id, nickname: `Студент${i + 1}`, created_at: '2026-11-01T00:00:00Z' })));
    }
    if (table === 'profiles') return json(route, { role: 'teacher', nickname: 'Учитель', classes: null });
    if (table === 'level_progress' && (url.searchParams.get('student_id') ?? '').startsWith('in.')) return json(route, rows);
    return json(route, []);
  });

  await page.goto('/#/teacher');
  const beacons = page.getByRole('region', { name: 'Маяки класса' });
  await expect(beacons).toBeVisible();
  await expect(beacons.getByText('Маяк уровня горит, когда его прошли хотя бы 2 студента из 4.')).toBeVisible();

  // Первый уровень прошли трое из четырёх — горит; второй один — нет
  await expect(beacons.getByRole('progressbar', { name: 'Сколько маяков класса горит' })).toHaveAttribute('aria-valuenow', '1');
  await expect(beacons.getByLabel('Первый абзац: прошли 3 из 4, маяк горит')).toBeVisible();
  await expect(beacons.getByLabel('Вывеска над воротами: прошли 1 из 4, не горит')).toBeVisible();
  // Имён студентов на карте нет
  await expect(beacons).not.toContainText('Студент1');

  // Проектор: та же карта на весь экран, закрывается по Esc
  await beacons.getByRole('button', { name: 'На проектор' }).click();
  const projector = page.getByRole('dialog', { name: 'Маяки класса на проекторе' });
  await expect(projector.getByLabel('Первый абзац: прошли 3 из 4, маяк горит')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(projector).toHaveCount(0);
});
