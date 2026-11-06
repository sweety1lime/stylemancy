import { expect, test, type Page } from '@playwright/test';

const VALLEY_SAVED = { 'form-06': { completed: true, stars: 3, attempts: 1, hintsUsed: 0 } };

async function openedWorld(page: Page, look: 'noir' | 'pixel' = 'noir') {
  await page.addInitScript(
    ([done, view]) => {
      if (localStorage.getItem('cascadia.progress.v1')) return;
      localStorage.setItem('cascadia.settings.v1', JSON.stringify({ sound: false, effects: 'light', look: view }));
      localStorage.setItem('cascadia.stats.v1', JSON.stringify({ seen: { 'prologue:game': true } }));
      localStorage.setItem('cascadia.progress.v1', JSON.stringify(done));
    },
    [VALLEY_SAVED, look] as const,
  );
}

async function typeInto(page: Page, label: string, code: string) {
  const editor = page.locator(`.cm-content[aria-label="${label}"]`);
  await editor.click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(code);
}

interface Row {
  id: string;
  blank: string[];
  solution: string[];
  notes: string[];
}

/** Страница игрока для проверки: тот же путь, что в редакторе (санитайзер, рамка, замеры), но из самой страницы теста */
const RUN = (look: 'noir' | 'pixel') => `Promise.all([
  import('/src/land/images.ts'), import('/src/land/sanitize.ts'), import('/src/land/probe.ts'),
  import('/src/land/tasks.ts'), import('/src/land/templates.ts'),
]).then(async ([images, sanitize, probe, tasks, templates]) => {
  const library = ${look === 'noir' ? 'images.NOIR_LAND_IMAGES' : 'images.PIXEL_LAND_IMAGES'};
  const run = async (task, source) => {
    const rendered = sanitize.renderLand(source, library);
    const results = (await probe.evaluateTasks(rendered.document, source, [task]))[task.id];
    return { results, notes: rendered.notes };
  };
  const blank = templates.LAND_TEMPLATES.find((item) => item.id === 'blank');
  const rows = [];
  for (const task of tasks.LAND_TASKS) {
    const starter = await run(task, blank);
    const answer = await run(task, task.solution);
    const name = (list) => list.map((result, i) => (result.done ? '' : task.checks[i].label + (result.detail ? ' — ' + result.detail : ''))).filter(Boolean);
    rows.push({ id: task.id, blank: name(starter.results), solution: name(answer.results), notes: answer.notes });
  }
  return rows;
})`;

for (const look of ['noir', 'pixel'] as const) {
  test(`задания: эталонное решение выполняет все условия, а чистый лист нет (${look})`, async ({ page }) => {
    await page.goto('/');
    const rows = await page.evaluate<Row[]>(RUN(look));
    expect(rows.map((row) => row.id)).toEqual(['tavern', 'street', 'sky', 'potions', 'card', 'phone']);
    for (const row of rows) {
      // Решение чистое: санитайзер ничего из него не убрал, и все условия выполнены
      expect.soft(row.solution, `решение «${row.id}»`).toEqual([]);
      expect.soft(row.notes, `замечания санитайзера к решению «${row.id}»`).toEqual([]);
      // Чистый лист не выполняет задание: хотя бы одно условие горит
      expect.soft(row.blank.length, `чистый лист и «${row.id}»`).toBeGreaterThan(0);
    }
  });
}

test('задания: почти верные решения не проходят, и игрок узнаёт, чего не хватает', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate<Record<string, string[]>>(`Promise.all([
    import('/src/land/images.ts'), import('/src/land/sanitize.ts'), import('/src/land/probe.ts'), import('/src/land/tasks.ts'),
  ]).then(async ([images, sanitize, probe, tasks]) => {
    const failures = async (id, source) => {
      const task = tasks.LAND_TASKS.find((item) => item.id === id);
      const rendered = sanitize.renderLand(source, images.NOIR_LAND_IMAGES);
      const results = (await probe.evaluateTasks(rendered.document, source, [task]))[id];
      return task.checks.map((check, i) => (results[i].done ? '' : check.label + ' — ' + (results[i].detail ?? ''))).filter(Boolean);
    };
    const three = '<img src="house.png" alt="Дом"><img src="tree.png" alt="Дерево"><img src="lantern.png" alt="Фонарь">';
    const cards = () => '<div class="cards">' + ['tree', 'mushroom', 'lantern'].map((name) => '<figure><img src="' + name + '.png" alt="' + name + '"><figcaption>' + name + '</figcaption></figure>').join('') + '</div>';
    return {
      // Три картинки просто идут подряд: ряд есть, а коробки с flex нет
      inline: await failures('street', { html: three, css: '' }),
      // Карточки разной ширины: у картинок разные размеры, а width не задан
      uneven: await failures('potions', { html: cards(), css: '.cards { display: flex; gap: 8px } figure { margin: 0; border: 2px solid red }' }),
      // Ряд есть, а на телефоне он остаётся рядом: @media нет
      noMedia: await failures('phone', { html: cards(), css: '.cards { display: flex; gap: 8px }' }),
      // @media написан, но ничего не меняет
      emptyMedia: await failures('phone', { html: cards(), css: '.cards { display: flex; gap: 8px } @media (max-width: 480px) { .cards { gap: 4px } }' }),
      // Меню-якоря ведут в никуда
      brokenAnchors: await failures('card', { html: '<header></header><nav><a href="#a">а</a><a href="#b">б</a></nav><main></main><footer></footer>', css: 'main { display: grid; grid-template-columns: 1fr 1fr }' }),
      // Не grid и не две колонки
      oneColumn: await failures('card', { html: '<header></header><main id="a"><a href="#a">а</a><a href="#a">б</a></main><footer></footer>', css: 'main { display: grid }' }),
    };
  })`);
  expect(result.inline.join('|')).toContain('Картинки лежат в одной коробке с display: flex или grid');
  expect(result.uneven.join('|')).toContain('Карточки одного размера');
  expect(result.noMedia.join('|')).toContain('на телефоне они не складываются в столбик');
  expect(result.noMedia.join('|')).toContain('медиазапрос');
  expect(result.emptyMedia.join('|')).toContain('на телефоне они не складываются в столбик');
  expect(result.brokenAnchors.join('|')).toContain('рабочих ссылок пока нет');
  expect(result.oneColumn.join('|')).toContain('пока одна колонка');
});

test('задание выполнено: условия загораются, опыт приходит один раз, заготовка без правок не считается', async ({ page }) => {
  await openedWorld(page);
  await page.goto('/#/my-land');
  // Чистый лист: h1 уже есть, остальное предстоит
  await page.getByLabel('Ячейка 1: пусто').getByRole('button', { name: 'Чистый лист' }).click();
  const tasks = page.getByRole('region', { name: 'Творческие задания' });
  await expect(tasks).toBeVisible();
  await expect(tasks.getByRole('button')).toHaveCount(6);
  await expect(tasks.getByText('1 из 3')).toBeVisible();
  await expect(tasks.getByText('Подсказка: Абзац — тег <p>.')).toBeVisible();

  // Игрок пишет вывеску: пункты загораются, приходит награда
  await typeInto(page, 'Редактор HTML', '<h1>Таверна</h1>\n<p>Горячий суп.</p>\n<ul><li>Суп</li><li>Пирог</li><li>Эль</li></ul>');
  await expect(tasks.getByText('3 из 3')).toBeVisible();
  await expect(tasks.getByText('Задание выполнено, опыт получен.')).toBeVisible();
  await expect(page.locator('.toast--notice').filter({ hasText: 'Вывеска таверны' })).toContainText('+10 XP');
  // Прогресс за уровни: 3 звезды дают 25 XP, и 10 пришли от задания
  await expect(page.getByText('35 XP')).toBeVisible();

  // Второй раз за то же задание ничего не приходит: перепишем и вернём то же самое
  await typeInto(page, 'Редактор HTML', '<h1>Таверна</h1>');
  await expect(tasks.getByText('1 из 3')).toBeVisible();
  await typeInto(page, 'Редактор HTML', '<h1>Таверна</h1>\n<p>Горячий суп.</p>\n<ul><li>Суп</li><li>Пирог</li><li>Эль</li></ul>');
  await expect(tasks.getByText('3 из 3')).toBeVisible();
  await page.waitForTimeout(600);
  expect(await page.evaluate(`import('/src/game/stats.ts').then((m) => [m.stats.get().reviewXp, m.stats.get().landTasks])`)).toEqual([10, ['tavern']]);

  // Заготовка «Ночное небо» сама выполняет третье задание, но пока она заготовка, оно не засчитывается
  await page.getByRole('link', { name: '← Мои земли' }).click();
  await page.getByLabel('Ячейка 2: пусто').getByRole('button', { name: 'Ночное небо' }).click();
  await tasks.getByRole('button', { name: 'Ночное небо' }).click();
  await expect(tasks.getByText('4 из 4')).toBeVisible();
  await expect(tasks.getByText('Это почти заготовка')).toBeVisible();
  await page.waitForTimeout(600);
  expect(await page.evaluate(`import('/src/game/stats.ts').then((m) => m.stats.get().landTasks)`)).toEqual(['tavern']);

  // Одна короткая строка поверх заготовки не в счёт: подсказка остаётся, награды нет
  const html = page.locator('.cm-content[aria-label="Редактор HTML"]');
  await html.click();
  await page.keyboard.press('ControlOrMeta+End');
  await page.keyboard.insertText('\n<p>Моя приписка.</p>');
  await expect(tasks.getByText('Это почти заготовка')).toBeVisible();
  await page.waitForTimeout(600);
  expect(await page.evaluate(`import('/src/game/stats.ts').then((m) => m.stats.get().landTasks)`)).toEqual(['tavern']);

  // Своего набралось на пару строк, и задание засчитано. Заодно страница законно выполняет «Деревню в ряд»: три картинки в ряду
  await page.keyboard.insertText('\n<p>А здесь живёт мой друг, звездочёт.</p>');
  await expect(tasks.getByText('Задание выполнено, опыт получен.')).toBeVisible();
  expect(await page.evaluate(`import('/src/game/stats.ts').then((m) => [m.stats.get().reviewXp, m.stats.get().landTasks])`)).toEqual([40, ['tavern', 'street', 'sky']]);
});

test('за три задания открывается новый свет посоха', async ({ page }) => {
  await openedWorld(page);
  await page.goto('/#/chronicle');
  const swatch = page.getByRole('button', { name: /Рассветный/ });
  await expect(swatch).toBeDisabled();
  await expect(swatch).toContainText('выполни 3 задания в «Моей земле»');

  // Задания выполнены на странице земли: уведомление приходит на третьем
  await page.goto('/#/my-land');
  await page.getByLabel('Ячейка 1: пусто').getByRole('button', { name: 'Чистый лист' }).click();
  const awarded = await page.evaluate(`Promise.all([import('/src/land/rewards.ts'), import('/src/land/tasks.ts')]).then(([rewards, tasks]) =>
    tasks.LAND_TASKS.slice(0, 3).map((task) => rewards.awardTask(task)))`);
  expect(awarded).toEqual([10, 15, 15]);
  const notice = page.locator('.toast--notice').filter({ hasText: 'Новый свет посоха' });
  await expect(notice).toContainText('Рассветный');
  // Повторно за то же награды нет
  expect(await page.evaluate(`import('/src/land/rewards.ts').then((rewards) => import('/src/land/tasks.ts').then((tasks) => rewards.awardTask(tasks.LAND_TASKS[0])))`)).toBe(0);

  await page.goto('/#/chronicle');
  await expect(swatch).toBeEnabled();
  await swatch.click();
  await expect(swatch).toHaveAttribute('aria-pressed', 'true');
});

test('на телефоне панель заданий не шире экрана', async ({ page }) => {
  await openedWorld(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/my-land');
  await page.getByLabel('Ячейка 1: пусто').getByRole('button', { name: 'Чистый лист' }).click();
  await expect(page.getByRole('region', { name: 'Творческие задания' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
});

test('«почти заготовка»: считаются знаки в новых и пропавших строках, а отступы и порядок строк не в счёт', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate<Record<string, number | boolean>>(`import('/src/land/templates.ts').then((m) => {
    const nl = String.fromCharCode(10);
    const village = m.LAND_TEMPLATES.find((item) => item.id === 'village');
    const change = (html) => m.changeFromTemplates({ html, css: village.css });
    const short = village.html + '<p>Моя приписка.</p>';
    const two = short + nl + '<p>А здесь живёт мой друг, звездочёт.</p>';
    return {
      same: change(village.html),
      reindented: change(village.html.split(nl).map((line) => line.trim()).join(nl)),
      reordered: change(village.html.split(nl).reverse().join(nl)),
      oneShortLine: change(short),
      twoLines: change(two),
      nearOne: m.isNearTemplate({ html: short, css: village.css }),
      nearTwo: m.isNearTemplate({ html: two, css: village.css }),
      fromScratch: m.isNearTemplate({ html: '<h1>Таверна</h1><p>Суп.</p>', css: '' }),
      limit: m.MIN_CHANGE,
    };
  })`);
  expect(result).toEqual({
    same: 0,
    reindented: 0,
    reordered: 0,
    oneShortLine: 20,
    twoLines: 61,
    nearOne: true,
    nearTwo: false,
    fromScratch: false,
    limit: 40,
  });
});
