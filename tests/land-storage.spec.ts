import { expect, test, type Route } from '@playwright/test';
import { SESSION_STORAGE_KEY, SUPABASE_URL } from '../src/lib/config.js';

const land = (slot: number, title: string, savedAt: string, extra: Record<string, unknown> = {}) => ({
  slot,
  title,
  html: `<p>${title}</p>`,
  css: '',
  signed: false,
  savedAt,
  ...extra,
});

test('земли: в каждой ячейке побеждает запись, сохранённая позже, а мусор отбрасывается', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(`Promise.all([import('/src/land/model.ts'), import('/src/game/stats.ts')]).then(([model, game]) => {
    const land = (slot, title, savedAt, extra = {}) => ({ slot, title, html: '<p>' + title + '</p>', css: '', signed: false, savedAt, ...extra });
    const gone = (slot, savedAt) => ({ slot, title: '', html: '', css: '', signed: false, savedAt, gone: true });
    const titles = (lands) => lands.map((item) => item.slot + ':' + (item.gone ? 'gone' : item.title));
    return {
      newer: titles(model.mergeLands([land(0, 'старая', '2026-11-01T10:00:00.000Z')], [land(0, 'новая', '2026-11-02T10:00:00.000Z')])),
      both: titles(model.mergeLands([land(1, 'один', '2026-11-01T10:00:00.000Z')], [land(2, 'два', '2026-11-01T10:00:00.000Z')])),
      deletedLater: titles(model.mergeLands([land(0, 'жива', '2026-11-01T10:00:00.000Z')], [gone(0, '2026-11-02T10:00:00.000Z')])),
      recreatedLater: titles(model.mergeLands([gone(0, '2026-11-01T10:00:00.000Z')], [land(0, 'снова', '2026-11-02T10:00:00.000Z')])),
      garbage: titles(model.mergeLands([5, null, 'x', { slot: 7, title: 'нет ячейки' }, { slot: 0.5 }, land(0, 'ок', 'a')], 'не список')),
      clamped: (() => {
        const [item] = model.cleanLands([{ slot: 0, title: 'я'.repeat(100), html: 'h'.repeat(9000), css: 'c'.repeat(9000), signed: 'да', savedAt: 5 }]);
        return [item.title.length, item.html.length, item.css.length, item.signed, item.savedAt];
      })(),
      stats: (() => {
        const merged = game.mergeStats({ lands: [land(0, 'тут', '2026-11-01T10:00:00.000Z')], landTasks: ['a'] }, { lands: [land(1, 'там', '2026-11-01T10:00:00.000Z')], landTasks: ['a', 'b'] });
        return [titles(merged.lands), merged.landTasks];
      })(),
    };
  })`);
  expect(result).toEqual({
    newer: ['0:новая'],
    both: ['1:один', '2:два'],
    deletedLater: ['0:gone'],
    recreatedLater: ['0:снова'],
    garbage: ['0:ок'],
    clamped: [40, 3000, 3000, false, ''],
    stats: [['0:тут', '1:там'], ['a', 'b']],
  });
});

test('земли: сохранить, удалить, не переполнить документ аккаунта', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(`Promise.all([import('/src/land/lands.ts'), import('/src/game/stats.ts'), import('/src/game/notes.ts')]).then(([lands, game, notes]) => {
    const draft = (slot, html = '<p>привет</p>') => ({ slot, title: 'Земля ' + slot, html, css: 'p { color: red }', signed: false });
    const out = {};
    out.saved = lands.saveLand(draft(0)).ok;
    out.second = lands.saveLand(draft(2)).ok;
    out.badSlot = lands.saveLand(draft(3));
    out.tooLong = lands.saveLand(draft(1, 'x'.repeat(3001)));
    out.stored = JSON.parse(localStorage.getItem('cascadia.stats.v1')).lands.map((item) => item.slot);
    lands.deleteLand(0);
    out.afterDelete = lands.getLands().map((item) => item.slot);
    out.tombstone = game.stats.get().lands.filter((item) => item.gone).map((item) => item.slot);
    // Документ аккаунта почти полон заметками: землю уже некуда положить
    notes.notesStore.set('big', 'а'.repeat(30000));
    out.noSpace = lands.saveLand(draft(1));
    out.stillThere = lands.getLands().map((item) => item.slot);
    return out;
  })`);
  expect(result).toMatchObject({
    saved: true,
    second: true,
    badSlot: { ok: false, reason: 'slot' },
    tooLong: { ok: false, reason: 'long' },
    stored: [0, 2],
    afterDelete: [2],
    tombstone: [0],
    noSpace: { ok: false, reason: 'space' },
    stillThere: [2],
  });
});

test('земли: основа чужой земли помнится, пока своего мало, и забывается, когда земля стала своей', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(`Promise.all([import('/src/land/model.ts'), import('/src/land/lands.ts'), import('/src/land/templates.ts')]).then(([model, lands, templates]) => {
    const nl = String.fromCharCode(10);
    const base = { html: ['<h1>Чужая земля</h1>', '<p>Первая строка.</p>', '<p>Вторая строка.</p>'].join(nl), css: 'h1 { color: red; }' };
    const draft = (html) => ({ slot: 0, title: 'Копия', html, css: base.css, signed: false });
    const stored = () => lands.getLands()[0].base !== undefined;
    const out = {};
    out.adopted = lands.saveLand({ ...draft(base.html), base }).ok;
    out.keptAtStart = stored();
    // Обычная правка записи (без основы в черновике): коротенькая приписка основу не стирает
    lands.saveLand(draft(base.html + nl + '<p>Мало.</p>'));
    out.keptAfterTinyEdit = stored();
    lands.saveLand(draft(base.html + nl + '<p>Здесь гораздо больше своего текста, чем сорок знаков.</p>'));
    out.droppedAfterBigEdit = !stored();
    // Вернул всё как было, а основа не воскресает: земля уже стала своей
    lands.saveLand(draft(base.html));
    out.stayedGone = !stored();
    out.near = [
      templates.nearStart(base, base),
      templates.nearStart(base),
      templates.nearStart({ html: base.html + nl + '<p>Здесь гораздо больше своего текста, чем сорок знаков.</p>', css: base.css }, base),
    ];
    // Основа из недоверенного места: типы и размеры проверяются, у удалённой земли основы нет
    const raw = (slot, extra) => ({ slot, title: 'x', html: '', css: '', signed: false, savedAt: 'a', ...extra });
    const cleaned = model.cleanLands([
      raw(0, { base: { html: 'h'.repeat(9000), css: 'c' } }),
      raw(1, { base: { html: 'a', css: 5 } }),
      raw(2, { base: 'не объект', gone: true }),
    ]);
    out.cleaned = cleaned.map((item) => (item.base ? item.base.html.length + ':' + item.base.css.length : 'без основы'));
    out.goneHasNoBase = !cleaned[2].base;
    return out;
  })`);
  expect(result).toEqual({
    adopted: true,
    keptAtStart: true,
    keptAfterTinyEdit: true,
    droppedAfterBigEdit: true,
    stayedGone: true,
    near: ['base', null, null],
    cleaned: ['3000:1', 'без основы', 'без основы'],
    goneHasNoBase: true,
  });
});

const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: 'application/json', headers: CORS, body: JSON.stringify(body) });

test('земли: ходят за аккаунтом на сервер и приходят с другого компьютера', async ({ page }) => {
  const writes: { lands: { slot: number; title: string; gone?: boolean }[]; tasks: string[] }[] = [];
  await page.addInitScript(
    ([key]) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          access_token: 'test.token.value',
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: 4102444800,
          refresh_token: 'refresh',
          user: { id: 'st-1', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: { role: 'student', nickname: 'Маша' }, created_at: '2026-01-01T00:00:00Z' },
        }),
      );
    },
    [SESSION_STORAGE_KEY],
  );
  // База подменена: студентка, у которой на сервере уже есть земля из ячейки 0 (сохранена на другом компьютере)
  await page.route(`${SUPABASE_URL}/**`, async (route) => {
    const request = route.request();
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
    const url = new URL(request.url());
    if (!url.pathname.startsWith('/rest/v1/')) return json(route, {});
    const table = url.pathname.replace('/rest/v1/', '');
    if (table === 'profiles') {
      return json(route, { role: 'student', nickname: 'Маша', classes: { id: 'c1', name: '10Б', code: 'ABC123', open_lands: ['tags-valley'] } });
    }
    if (table === 'student_stats' && request.method() === 'GET') {
      return json(route, { data: { stats: { lands: [land(0, 'С другого компьютера', '2026-11-05T10:00:00.000Z')] } } });
    }
    if (table === 'student_stats') {
      const body = request.postDataJSON() as { data: { stats: { lands: { slot: number; title: string; gone?: boolean }[]; landTasks: string[] } } };
      writes.push({ lands: body.data.stats.lands, tasks: body.data.stats.landTasks });
      return route.fulfill({ status: 201, headers: CORS, body: '' });
    }
    return json(route, []);
  });

  await page.goto('/');
  const titles = () => page.evaluate(`import('/src/land/lands.ts').then((lands) => lands.getLands().map((item) => item.slot + ':' + item.title))`);
  // Земля с сервера сливается с локальными данными
  await expect.poll(titles).toEqual(['0:С другого компьютера']);

  // Новая земля уходит на сервер вместе со старой
  await page.evaluate(`import('/src/land/lands.ts').then((lands) => lands.saveLand({ slot: 1, title: 'Новая', html: '<p>тут</p>', css: '', signed: false }))`);
  await expect.poll(() => writes.at(-1)?.lands.map((item) => item.slot)).toEqual([0, 1]);

  // Удаление уходит надгробием, чтобы другой компьютер не вернул землю обратно
  await page.evaluate(`import('/src/land/lands.ts').then((lands) => lands.deleteLand(0))`);
  await expect.poll(() => writes.at(-1)?.lands.map((item) => `${item.slot}:${item.gone ? 'gone' : 'live'}`)).toEqual(['0:gone', '1:live']);
  expect(await titles()).toEqual(['1:Новая']);
});
