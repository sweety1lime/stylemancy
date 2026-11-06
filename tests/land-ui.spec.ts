import { expect, test, type Page, type Route } from '@playwright/test';
import { SESSION_STORAGE_KEY, SUPABASE_URL } from '../src/lib/config.js';

/** Долина Тегов спасена, когда пройден последний уровень Кузницы Форм */
const VALLEY_SAVED = { 'form-06': { completed: true, stars: 3, attempts: 1, hintsUsed: 0 } };

async function openedWorld(page: Page, progress: Record<string, unknown> = VALLEY_SAVED, look: 'noir' | 'pixel' = 'noir') {
  await page.addInitScript(
    ([done, view]) => {
      // Только при первой загрузке: после перезагрузки сохранённое должно помниться
      if (localStorage.getItem('cascadia.progress.v1')) return;
      localStorage.setItem('cascadia.settings.v1', JSON.stringify({ sound: false, effects: 'light', look: view }));
      localStorage.setItem('cascadia.stats.v1', JSON.stringify({ seen: { 'prologue:game': true } }));
      localStorage.setItem('cascadia.progress.v1', JSON.stringify(done));
    },
    [progress, look] as const,
  );
}

/** Содержимое страницы земли: рамка изолирована (sandbox без allow-same-origin), Playwright заходит в неё сам */
const landPage = (page: Page) => page.frameLocator('iframe.land-frame__page');

async function typeInto(page: Page, label: string, code: string) {
  const editor = page.locator(`.cm-content[aria-label="${label}"]`);
  await editor.click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(code);
}

test('Моя земля закрыта, пока не спасена Долина Тегов, и сама говорит, что делать', async ({ page }) => {
  await openedWorld(page, {});
  await page.goto('/');
  const locked = page.locator('.button--locked');
  await expect(locked).toBeVisible();
  await expect(locked).toContainText('Моя земля');
  await expect(locked).toContainText('после «Долина Тегов»');
  await expect(locked).toHaveAttribute('aria-disabled', 'true');

  await page.goto('/#/my-land');
  await expect(page.getByRole('heading', { name: 'Пока закрыто' })).toBeVisible();
  await page.getByRole('link', { name: /К земле «Долина Тегов»/ }).click();
  await expect(page).toHaveURL(/#\/land\/tags-valley/);

  // Адрес редактора закрытой земли возвращает к списку, а не открывает редактор
  await page.goto('/#/my-land/0');
  await expect(page.getByRole('heading', { name: 'Пока закрыто' })).toBeVisible();
});

test('построить землю: страница обновляется на лету, лишнее убирается с объяснением, всё сохраняется', async ({ page }) => {
  await openedWorld(page);
  await page.goto('/');
  await page.getByRole('link', { name: 'Моя земля' }).click();
  await expect(page.getByRole('heading', { name: 'Моя земля', level: 1 })).toBeVisible();
  await expect(page.getByLabel(/Ячейка \d: пусто/)).toHaveCount(3);

  // Заготовка во второй ячейке
  await page.getByLabel('Ячейка 2: пусто').getByRole('button', { name: 'Чистый лист' }).click();
  await expect(page).toHaveURL(/#\/my-land\/1$/);
  await expect(landPage(page).getByRole('heading', { name: 'Моя земля' })).toBeVisible();

  await typeInto(page, 'Редактор HTML', '<h1>Привет, путник</h1>\n<p>Это <b>моя</b> земля.</p>\n<script>alert(1)</script>\n<a href="https://example.com">наружу</a>');
  await expect(landPage(page).getByRole('heading', { name: 'Привет, путник' })).toBeVisible();
  // Что игра убрала, она объясняет
  const notes = page.getByRole('region', { name: 'Что убрала игра' });
  await expect(notes).toContainText('Тег <script> убран');
  await expect(notes).toContainText('Ссылка href="https://example.com" отключена');

  // Стили живут в своей вкладке, а счётчик знаков идёт у каждой
  await page.getByRole('tab', { name: /style\.css/ }).click();
  await typeInto(page, 'Редактор CSS', 'h1 { color: rgb(255, 0, 0); }');
  await expect.poll(() => landPage(page).locator('h1').evaluate((el) => getComputedStyle(el).color)).toBe('rgb(255, 0, 0)');
  await expect(page.getByRole('tab', { name: /style\.css/ })).toContainText('29 / 3000');

  // Ширина телефона: страница в рамке сужается до 360 px
  await page.getByRole('button', { name: 'Телефон 360 px' }).click();
  await expect.poll(() => page.locator('iframe.land-frame__page').evaluate((el) => el.getBoundingClientRect().width)).toBe(360);

  // Сохранение само: после перезагрузки всё на месте
  await expect(page.getByRole('status').filter({ hasText: 'Сохранено' })).toBeVisible();
  await page.reload();
  await expect(landPage(page).getByRole('heading', { name: 'Привет, путник' })).toBeVisible();
  await expect.poll(() => landPage(page).locator('h1').evaluate((el) => getComputedStyle(el).color)).toBe('rgb(255, 0, 0)');

  // В списке землю видно, её можно удалить (с подтверждением), и ячейка снова пуста
  await page.getByRole('link', { name: '← Мои земли' }).click();
  const card = page.getByLabel('Ячейка 2: Моя земля');
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'Удалить' }).click();
  await card.getByRole('button', { name: 'Нет' }).click();
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'Удалить' }).click();
  await card.getByRole('button', { name: 'Да, удалить' }).click();
  await expect(page.getByLabel('Ячейка 2: пусто')).toBeVisible();
});

test('длинная земля не сохраняется, а игрок видит почему', async ({ page }) => {
  await openedWorld(page);
  await page.goto('/#/my-land');
  await page.getByLabel('Ячейка 1: пусто').getByRole('button', { name: 'Чистый лист' }).click();
  await typeInto(page, 'Редактор HTML', `<p>${'я'.repeat(3100)}</p>`);
  await expect(page.getByRole('status').filter({ hasText: 'Не сохранено: земля длиннее предела' })).toBeVisible();
  await expect(page.getByRole('tab', { name: /index\.html/ }).locator('.land-count--over')).toBeVisible();
  // Сократил, и сохранение вернулось
  await typeInto(page, 'Редактор HTML', '<p>коротко</p>');
  await expect(page.getByRole('status').filter({ hasText: 'Сохранено' })).toBeVisible();
});

test('поделиться: ссылка открывает землю без входа, а код в ней не работает', async ({ page, context }) => {
  const beacons: string[] = [];
  await context.route('**/__beacon/**', (route) => {
    beacons.push(route.request().url());
    return route.fulfill({ status: 200, contentType: 'image/gif', body: '' });
  });
  await openedWorld(page);
  await page.goto('/#/my-land');
  await page.getByLabel('Ячейка 1: пусто').getByRole('button', { name: 'Чистый лист' }).click();
  const origin = new URL(page.url()).origin;
  await typeInto(
    page,
    'Редактор HTML',
    `<h1>Дом на холме</h1><img src="${origin}/__beacon/pixel.gif" alt="тут"><script>document.title='взломано'</script><p onclick="alert(1)">Заходи</p>`,
  );
  await expect(landPage(page).getByRole('heading', { name: 'Дом на холме' })).toBeVisible();
  await page.getByLabel('Название земли').fill('Дом на холме');

  await page.getByRole('button', { name: 'Поделиться' }).click();
  const dialog = page.getByRole('dialog', { name: 'Поделиться землёй' });
  await expect(dialog).toContainText('Отозвать ссылку нельзя');
  await expect(dialog).toContainText('Земля без подписи');
  const link = await dialog.getByLabel('Ссылка на землю').inputValue();
  expect(link).toMatch(/#\/shared\/z[A-Za-z0-9_-]+$/);

  // Получатель: другая вкладка без аккаунта и прогресса
  const guest = await context.browser()!.newContext();
  await guest.route('**/__beacon/**', (route) => {
    beacons.push(route.request().url());
    return route.fulfill({ status: 200, contentType: 'image/gif', body: '' });
  });
  const reader = await guest.newPage();
  const dialogs: string[] = [];
  reader.on('dialog', (event) => {
    dialogs.push(event.message());
    void event.dismiss();
  });
  await reader.goto(link);
  await expect(reader.getByRole('heading', { name: 'Дом на холме', level: 1 })).toBeVisible();
  await expect(reader.getByText('Автор не подписался')).toBeVisible();
  await expect(reader.frameLocator('iframe.land-frame__page').getByRole('heading', { name: 'Дом на холме' })).toBeVisible();
  await expect(reader.getByText('Эту землю построил игрок, игра её не проверяла')).toBeVisible();
  await expect(reader.getByText(/Что игра убрала из этой земли/)).toBeVisible();
  // Код не выполнился: заголовок вкладки не «взломано», окон нет, к чужим адресам никто не ходил
  expect(await reader.title()).not.toBe('взломано');
  expect(dialogs).toEqual([]);
  expect(beacons).toEqual([]);

  // «Показать код» показывает исходный текст как текст
  await reader.getByRole('button', { name: 'Показать код' }).click();
  await expect(reader.getByRole('region', { name: 'Код земли' })).toContainText("<script>document.title='взломано'</script>");
  await guest.close();
});

test('битая ссылка: понятное сообщение вместо сбоя', async ({ page }) => {
  await openedWorld(page, {});
  await page.goto('/#/shared/zAAAA');
  await expect(page.getByRole('heading', { name: 'Эта ссылка не открывается' })).toBeVisible();
  await page.goto('/#/shared/not-a-token!');
  await expect(page.getByRole('heading', { name: 'Эта ссылка не открывается' })).toBeVisible();
});

/** Адрес страницы чужой земли, собранный так же, как это делает окно «Поделиться» */
const sharedAddress = (page: Page, land: { title: string; html: string; css: string; nick?: string }) =>
  page.evaluate<string>(`import('/src/land/share.ts').then(async (share) => '/#/shared/' + (await share.encodeLand(${JSON.stringify({ nick: '', ...land })})))`);

const TAVERN = '<h1>Таверна «Лунный кот»</h1>\n<p>Горячий суп и свежий хлеб.</p>\n<ul><li>Суп</li><li>Пирог</li><li>Эль</li></ul>';

test('взять за основу: копия ложится в свободную ячейку, а задание на нетронутой копии не засчитывается', async ({ page }) => {
  await openedWorld(page);
  await page.goto('/');
  const address = await sharedAddress(page, { title: 'Таверна друга', html: TAVERN, css: 'h1 { color: gold; }', nick: 'Лёша' });
  await page.goto(address);
  await expect(page.getByRole('heading', { name: 'Таверна друга', level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'Взять за основу' }).click();

  // Копия лежит в первой свободной ячейке, без подписи автора, и игрок сразу в редакторе
  await expect(page).toHaveURL(/#\/my-land\/0$/);
  await expect(page.getByLabel('Название земли')).toHaveValue('Копия: Таверна друга');
  await expect(landPage(page).getByRole('heading', { name: 'Таверна «Лунный кот»' })).toBeVisible();
  const stored = () =>
    page.evaluate<[number, boolean, string, string | null][]>(
      `import('/src/land/lands.ts').then((lands) => lands.getLands().map((item) => [item.slot, item.signed, item.html, item.base?.html ?? null]))`,
    );
  expect(await stored()).toEqual([[0, false, TAVERN, TAVERN]]);

  // Копия сама выполняет первое задание, но это чужая работа: опыта нет, и игре видно почему
  const tasks = page.getByRole('region', { name: 'Творческие задания' });
  await expect(tasks.getByText('3 из 3')).toBeVisible();
  await expect(tasks.getByText('Это почти та земля, которую ты взял за основу')).toBeVisible();
  await page.waitForTimeout(600);
  expect(await page.evaluate(`import('/src/game/stats.ts').then((m) => m.stats.get().landTasks)`)).toEqual([]);

  // Пара своих строк, и земля стала своей: задание засчитано, а основа больше не хранится
  const html = page.locator('.cm-content[aria-label="Редактор HTML"]');
  await html.click();
  await page.keyboard.press('ControlOrMeta+End');
  await page.keyboard.insertText('\n<p>А ещё у нас по вечерам поют.</p>\n<p>И пекут пирожки с грибами.</p>');
  await expect(tasks.getByText('Задание выполнено, опыт получен.')).toBeVisible();
  expect(await page.evaluate(`import('/src/game/stats.ts').then((m) => m.stats.get().landTasks)`)).toEqual(['tavern']);
  await expect.poll(async () => (await stored())[0]?.[3]).toBeNull();
});

test('взять за основу: занятые ячейки не затираются, копия ложится в первую освободившуюся', async ({ page }) => {
  await openedWorld(page);
  await page.goto('/');
  await page.evaluate(`import('/src/land/lands.ts').then((lands) => {
    for (const slot of [0, 1, 2]) lands.saveLand({ slot, title: 'Своя ' + slot, html: '<p>моя ' + slot + '</p>', css: '', signed: false });
  })`);
  const titles = () => page.evaluate(`import('/src/land/lands.ts').then((lands) => lands.getLands().map((item) => item.slot + ':' + item.title))`);
  const address = await sharedAddress(page, { title: 'Чужая', html: '<h1>Чужая</h1>', css: '' });
  await page.goto(address);
  await page.getByRole('button', { name: 'Взять за основу' }).click();

  // Три ячейки заняты: игра говорит об этом, ничего не пишет и не стирает, а ссылка на список под рукой
  await expect(page.getByRole('alert')).toContainText('Все 3 ячейки «Моей земли» заняты');
  await expect(page).toHaveURL(/#\/shared\//);
  expect(await titles()).toEqual(['0:Своя 0', '1:Своя 1', '2:Своя 2']);
  await page.getByRole('alert').getByRole('link', { name: 'списке твоих земель' }).click();
  await expect(page).toHaveURL(/#\/my-land$/);

  // Освободил среднюю и вернулся по той же ссылке: копия встала именно туда
  await page.getByLabel('Ячейка 2: Своя 1').getByRole('button', { name: 'Удалить' }).click();
  await page.getByLabel('Ячейка 2: Своя 1').getByRole('button', { name: 'Да, удалить' }).click();
  await page.goto(address);
  await page.getByRole('button', { name: 'Взять за основу' }).click();
  await expect(page).toHaveURL(/#\/my-land\/1$/);
  expect(await titles()).toEqual(['0:Своя 0', '1:Копия: Чужая', '2:Своя 2']);
});

test('взять за основу: пока Долина Тегов не спасена, кнопки нет, а причина названа', async ({ page }) => {
  await openedWorld(page, {});
  await page.goto('/');
  const address = await sharedAddress(page, { title: 'Чужая', html: '<h1>Чужая</h1>', css: '' });
  await page.goto(address);
  await expect(page.getByRole('heading', { name: 'Чужая', level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Взять за основу' })).toHaveCount(0);
  await expect(page.getByText('Взять эту землю за основу и переделать по-своему можно будет, когда ты спасёшь землю «Долина Тегов»')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Построить свою землю' })).toBeVisible();
});

test('взять за основу: земля длиннее предела не берётся, и игрок узнаёт почему', async ({ page }) => {
  await openedWorld(page);
  await page.goto('/');
  // Ссылку можно сделать руками и с запасом по длине, а в ячейку больше трёх тысяч знаков не поместится
  const address = await sharedAddress(page, { title: 'Огромная', html: `<p>${'я'.repeat(3500)}</p>`, css: '' });
  await page.goto(address);
  await page.getByRole('button', { name: 'Взять за основу' }).click();
  await expect(page.getByRole('alert')).toContainText('длиннее предела');
  await expect(page).toHaveURL(/#\/shared\//);
  expect(await page.evaluate(`import('/src/land/lands.ts').then((lands) => lands.getLands().length)`)).toBe(0);
});

test('пиксельный вид: список и редактор открываются и работают', async ({ page }) => {
  await openedWorld(page, VALLEY_SAVED, 'pixel');
  await page.goto('/#/my-land');
  await page.getByLabel('Ячейка 1: пусто').getByRole('button', { name: 'Чистый лист' }).click();
  await typeInto(page, 'Редактор HTML', '<h1>Пиксели</h1>');
  await expect(landPage(page).getByRole('heading', { name: 'Пиксели' })).toBeVisible();
});

const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
const json = (route: Route, body: unknown) => route.fulfill({ status: 200, contentType: 'application/json', headers: CORS, body: JSON.stringify(body) });

test('подпись ником: только если игрок сам поставил галочку', async ({ page, context }) => {
  await page.addInitScript(
    ([key]) => {
      localStorage.setItem('cascadia.settings.v1', JSON.stringify({ sound: false, effects: 'light', look: 'noir' }));
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
      // Ключи аккаунта отдельные: Долина Тегов спасена
      localStorage.setItem('cascadia.u.st-1.progress.v1', JSON.stringify({ 'form-06': { completed: true, stars: 3, attempts: 1, hintsUsed: 0 } }));
      localStorage.setItem('cascadia.u.st-1.stats.v1', JSON.stringify({ seen: { 'prologue:game': true } }));
    },
    [SESSION_STORAGE_KEY],
  );
  await page.route(`${SUPABASE_URL}/**`, async (route) => {
    const request = route.request();
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
    const url = new URL(request.url());
    if (!url.pathname.startsWith('/rest/v1/')) return json(route, {});
    const table = url.pathname.replace('/rest/v1/', '');
    if (table === 'profiles') return json(route, { role: 'student', nickname: 'Маша', classes: { id: 'c1', name: '10Б', code: 'ABC123', open_lands: ['tags-valley'] } });
    if (table === 'student_stats' && request.method() === 'GET') return json(route, null);
    if (table === 'student_stats') return route.fulfill({ status: 201, headers: CORS, body: '' });
    return json(route, []);
  });

  await page.goto('/#/my-land');
  // Студенту класса прямо сказано, что учитель видит его земли
  await expect(page.getByText('Учитель класса видит твои земли в своей панели, подписаны они ником или нет.')).toBeVisible();
  await page.getByLabel('Ячейка 1: пусто').getByRole('button', { name: 'Чистый лист' }).click();
  const sign = page.getByLabel('Подписать землю моим ником: Маша');
  await expect(sign).not.toBeChecked();

  await page.getByRole('button', { name: 'Поделиться' }).click();
  await expect(page.getByRole('dialog')).toContainText('Земля без подписи');
  const unsigned = await page.getByLabel('Ссылка на землю').inputValue();
  await page.getByRole('button', { name: 'Закрыть' }).click();

  await sign.check();
  await page.getByRole('button', { name: 'Поделиться' }).click();
  await expect(page.getByRole('dialog')).toContainText('Под землёй будет стоять твой ник: Маша.');
  const signed = await page.getByLabel('Ссылка на землю').inputValue();
  expect(signed).not.toBe(unsigned);

  const reader = await context.newPage();
  await reader.goto(signed);
  await expect(reader.getByText('Построил игрок Маша')).toBeVisible();
  await reader.goto(unsigned);
  await expect(reader.getByText('Автор не подписался')).toBeVisible();
});

for (const look of ['noir', 'pixel'] as const) {
  test(`на телефоне экраны земли не шире экрана (${look})`, async ({ page }) => {
    await openedWorld(page, VALLEY_SAVED, look);
    await page.setViewportSize({ width: 390, height: 844 });
    const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

    await page.goto('/');
    expect(await overflow(), 'карта').toBeLessThanOrEqual(0);

    await page.goto('/#/my-land');
    await page.getByLabel('Ячейка 1: пусто').getByRole('button', { name: 'Чистый лист' }).click();
    await expect(page.getByRole('tab', { name: /index\.html/ })).toBeVisible();
    expect(await overflow(), 'редактор').toBeLessThanOrEqual(0);

    await page.getByRole('link', { name: '← Мои земли' }).click();
    await expect(page.getByLabel('Ячейка 1: Моя земля')).toBeVisible();
    expect(await overflow(), 'список').toBeLessThanOrEqual(0);

    await page.getByLabel('Ячейка 1: Моя земля').getByRole('button', { name: 'Поделиться' }).click();
    const link = await page.getByLabel('Ссылка на землю').inputValue();
    await page.getByRole('button', { name: 'Закрыть' }).click();
    await page.goto(link);
    await expect(page.getByRole('heading', { name: 'Моя земля', level: 1 })).toBeVisible();
    expect(await overflow(), 'чужая земля').toBeLessThanOrEqual(0);
  });
}
