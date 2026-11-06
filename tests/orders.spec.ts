import { expect, test, type Page } from '@playwright/test';

async function typeCode(page: Page, code: string) {
  await page.locator('.cm-content').click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(code);
}

interface RuleResult {
  ok: boolean;
  message?: string;
}

/** Условия на искусственной сцене из абсолютно позиционированных коробок: у каждого правила — верный и неверный случай */
test('заказы: правила проверяются по настоящим размерам предметов', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate<{ good: boolean[]; bad: RuleResult[] }>(`import('/src/engine/order.ts').then(async ({ evaluateOrder }) => {
    const build = async (boxes) => {
      const frame = document.createElement('iframe');
      frame.width = '400';
      frame.height = '200';
      frame.style.cssText = 'position:fixed;left:-9999px';
      document.body.append(frame);
      const items = boxes.map(([cls, name, l, t, w, h]) => '<div class="' + cls + '" data-name="' + name + '" style="left:' + l + 'px;top:' + t + 'px;width:' + w + 'px;height:' + h + 'px"></div>').join('');
      frame.srcdoc = '<style>body{margin:0}.c,.i,.m{position:absolute;box-sizing:border-box}</style><div class="c" style="left:0;top:0;width:400px;height:200px">' + items + '</div>';
      await new Promise((resolve) => (frame.onload = resolve));
      return frame.contentDocument;
    };
    const order = [
      { label: 'row', rule: { rule: 'row', items: '.i' } },
      { label: 'gap', rule: { rule: 'gap', items: '.i' } },
      { label: 'gap50', rule: { rule: 'gap', items: '.i', px: 50 } },
      { label: 'center', rule: { rule: 'center', item: '.m', axis: 'x' } },
      { label: 'side', rule: { rule: 'side', item: '.i:first-child', side: 'left', offset: 20 } },
      { label: 'leftOf', rule: { rule: 'leftOf', a: '.i:nth-child(1)', b: '.i:nth-child(2)' } },
      { label: 'above', rule: { rule: 'above', a: '.i:first-child', b: '.m' } },
      { label: 'sameSize', rule: { rule: 'sameSize', items: '.i' } },
      { label: 'size', rule: { rule: 'size', item: '.m', w: 100, h: 50 } },
      { label: 'inside', rule: { rule: 'inside', item: '.m', in: '.c' } },
      { label: 'noOverlap', rule: { rule: 'noOverlap', items: '.i, .m' } },
    ];
    const level = { check: { items: '.i', order } };
    const good = await build([
      ['i', 'Первый', 20, 20, 50, 50],
      ['i', 'Второй', 120, 20, 50, 50],
      ['i', 'Третий', 220, 20, 50, 50],
      ['m', 'Меню', 150, 120, 100, 50],
    ]);
    const bad = await build([
      ['i', 'Первый', 20, 20, 50, 50],
      ['i', 'Второй', 120, 100, 60, 50],
      ['i', 'Третий', 240, 20, 50, 50],
      ['m', 'Меню', 160, 120, 100, 50],
    ]);
    return {
      good: evaluateOrder(good, level).map((status) => status.inPlace),
      bad: evaluateOrder(bad, level).map((status) => ({ ok: status.inPlace, message: status.message })),
    };
  })`);

  // Верная сцена выполняет все одиннадцать условий
  expect(result.good).toEqual(Array(11).fill(true));
  // Неверная: второй ушёл вниз и потолстел, третий дальше, меню сдвинуто
  const [row, gap, gap50, center, side, leftOf, above, sameSize, size, inside, noOverlap] = result.bad;
  expect(row.ok).toBe(false);
  expect(row.message).toContain('не в один ряд');
  expect(gap.ok).toBe(false);
  expect(gap50.message).toContain('промежутки должны быть 50px');
  expect(center.message).toContain('по горизонтали сдвиг 10px вправо');
  expect(sameSize.message).toContain('размеры разные: 50×50, 60×50, 50×50');
  // Опустившийся второй предмет налез на меню
  expect(noOverlap.ok).toBe(false);
  expect(noOverlap.message).toContain('«Второй» и «Меню» налезают друг на друга');
  // А то, что в неверной сцене осталось на месте, по-прежнему выполняется
  for (const kept of [side, leftOf, above, size, inside]) expect(kept.ok).toBe(true);
});

const PROGRESS = ['flex-13', 'grid-09', 'mq-04'];

test.describe('Лавка заказов', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((ids) => {
      // Только при первой загрузке: после перезагрузки прогресс должен помниться
      if (localStorage.getItem('cascadia.progress.v1')) return;
      localStorage.setItem('cascadia.settings.v1', JSON.stringify({ sound: false, effects: 'light', look: 'noir' }));
      localStorage.setItem('cascadia.stats.v1', JSON.stringify({ seen: { 'prologue:game': true, 'intro:market': true, 'outro:market': true } }));
      const done = { completed: true, stars: 3, attempts: 1, hintsUsed: 0 };
      localStorage.setItem('cascadia.progress.v1', JSON.stringify(Object.fromEntries(ids.map((id) => [id, done]))));
    }, PROGRESS);
  });

  test('шапка лавки: без контуров, по списку условий, и меню посередине требует настоящего решения', async ({ page }) => {
    await page.goto('/#/level/order-04');
    await expect(page.getByRole('heading', { name: 'Заказ: Шапка лавки' })).toBeVisible();
    const wants = page.getByRole('region', { name: 'Заказчик хочет' });
    await expect(wants).toBeVisible();
    // Контуров целей нет: заказ принимается по условиям
    await expect(page.locator('.ghost')).toHaveCount(0);
    // Со стартовым кодом выполняется только одно условие: логотип и так стоит у левого края
    await expect(wants.getByText('1 из 5')).toBeVisible();

    // «Раздвинуть по краям» ставит почти всё на место, но меню уезжает: у соседей разная ширина
    await typeCode(page, '.header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n');
    await expect(wants.getByText('4 из 5')).toBeVisible();
    await expect(wants.getByText('«Меню» не по центру: по горизонтали сдвиг 16px вправо')).toBeVisible();
    await page.getByRole('button', { name: /Сотворить/ }).click();
    await expect(page.getByText('Заклинание не сработало')).toBeVisible();
    await expect(page.locator('.result__list')).toContainText('Меню — ровно посередине шапки по ширине');

    // Две одинаковые гибкие колонки по бокам держат меню по центру
    await typeCode(page, '.header {\n  display: grid;\n  grid-template-columns: 1fr auto 1fr;\n  align-items: center;\n}\n\n.cart {\n  justify-self: end;\n}\n');
    await expect(wants.getByText('5 из 5')).toBeVisible();
    await page.getByRole('button', { name: /Сотворить/ }).click();
    await expect(page.getByText('Заклинание сработало!')).toBeVisible();
  });

  test('любое решение, которое выполняет заказ, принимается: у витрины их несколько', async ({ page }) => {
    await page.goto('/#/level/order-01');
    const wants = page.getByRole('region', { name: 'Заказчик хочет' });
    // space-evenly оставляет места по краям: ряд и промежутки верные, а края доски нет
    await typeCode(page, '.board {\n  display: flex;\n  justify-content: space-evenly;\n  align-items: center;\n}\n');
    await expect(wants.getByText('3 из 5')).toBeVisible();
    // Сетка из трёх колонок по размеру карточки с теми же краями — другое заклинание, но все условия выполнены
    await typeCode(page, '.board {\n  display: grid;\n  grid-template-columns: repeat(3, 120px);\n  justify-content: space-between;\n  align-items: center;\n}\n');
    await expect(wants.getByText('5 из 5')).toBeVisible();
    await page.getByRole('button', { name: /Сотворить/ }).click();
    await expect(page.getByText('Заклинание сработало!')).toBeVisible();
  });

  test('лавка заказов необязательна: она не закрывает дорогу дальше и не нужна, чтобы спасти землю', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(`Promise.all([import('/src/game/unlock.ts'), import('/src/game/story.ts'), import('/src/levels/index.ts')]).then(([unlock, story, levels]) => {
      const land = levels.allLands.find((item) => item.id === 'floating-lands');
      const done = (...ids) => Object.fromEntries(ids.map((id) => [id, { completed: true, stars: 3, attempts: 1, hintsUsed: 0 }]));
      const index = (id) => land.regions.findIndex((region) => region.id === id);
      return {
        optional: land.regions[index('market')].optional,
        marketOpensAfterMirrorTower: unlock.isRegionReached(land, index('market'), done('mq-04')),
        marketClosedBefore: unlock.isRegionReached(land, index('market'), {}),
        citadelNeedsMirrorTower: unlock.isRegionReached(land, index('default-citadel'), {}),
        citadelOpensWithoutOrders: unlock.isRegionReached(land, index('default-citadel'), done('mq-04')),
        landSavedWithoutOrders: story.isLandDone(land, done('citadel-02')),
      };
    })`);
    expect(result).toEqual({
      optional: true,
      marketOpensAfterMirrorTower: true,
      marketClosedBefore: false,
      citadelNeedsMirrorTower: false,
      citadelOpensWithoutOrders: true,
      landSavedWithoutOrders: true,
    });

    // На тропе земли район помечен «по желанию»
    await page.goto('/#/land/floating-lands');
    await expect(page.getByText(/по желанию/)).toBeVisible();
  });
});

test('новые заказы: любое решение, выполняющее условия, принимается, а похожее на него — нет', async ({ page }) => {
  await page.goto('/');
  const r = await page.evaluate<Record<string, { passed: boolean; errors: string[]; misses: string[] }>>(`Promise.all([import('/src/engine/evaluate.ts'), import('/src/levels/index.ts')]).then(async ([evaluate, levels]) => {
    const run = async (id, css) => {
      const level = levels.allLevels.find((item) => item.id === id);
      const outcome = await evaluate.checkLevelCss(level, css);
      return { passed: outcome.passed, errors: outcome.errors.map((error) => error.message), misses: outcome.items.filter((item) => !item.inPlace).map((item) => item.name) };
    };
    return {
      // Подвал: колонки поровну или «вокруг» — одно и то же, а «поровну, считая края» — уже другое
      footerGrid: await run('order-05', levels.allLevels.find((item) => item.id === 'order-05').solutionCss),
      footerAround: await run('order-05', '.board { display: flex; justify-content: space-around; align-items: center; }'),
      footerEvenly: await run('order-05', '.board { display: flex; justify-content: space-evenly; align-items: center; }'),
      // Полка: без переноса плитки сжимаются, а нижняя полка не появляется
      shelfNoWrap: await run('order-06', '.board { display: flex; gap: 8px; }'),
      shelfWrap: await run('order-06', '.board { display: flex; flex-wrap: wrap; gap: 8px; align-content: flex-start; }'),
      // Окно: рамку можно собрать и флексом; position в Лавке не разрешён
      windowFlex: await run('order-07', '.board { display: flex; justify-content: center; align-items: center; } .card { display: flex; justify-content: flex-end; align-items: flex-start; }'),
      windowAbsolute: await run('order-07', '.board { display: grid; place-content: center; } .cart { position: absolute; top: 0; right: 0; }'),
      // Лента: пустой просвет только у растянутого меню, а раздвинутые края оставляют дыры
      menuBetween: await run('order-08', '.header { display: flex; justify-content: space-between; align-items: center; }'),
      menuFlex: await run('order-08', '.header { display: flex; align-items: center; } .menu { flex: 1; }'),
    };
  })`);
  for (const good of ['footerGrid', 'footerAround', 'shelfWrap', 'windowFlex', 'menuFlex']) {
    expect.soft(r[good], `${good}: принимается`).toMatchObject({ passed: true, misses: [] });
  }
  expect(r.footerEvenly.passed).toBe(false);
  expect(r.footerEvenly.misses).toContain('Левая плитка — в 39px от левого края доски');
  expect(r.shelfNoWrap.passed).toBe(false);
  expect(r.shelfNoWrap.misses).toContain('«Карта» стоит под «Лампой»');
  expect(r.shelfNoWrap.misses).toContain('Плитки не сжались: «Лампа» осталась 96×64');
  expect(r.windowAbsolute.passed).toBe(false);
  expect(r.windowAbsolute.errors.join(' ')).toContain('Flexbox и Grid');
  expect(r.menuBetween.passed).toBe(false);
  expect(r.menuBetween.misses).toContain('Между логотипом и меню нет просвета');
});
