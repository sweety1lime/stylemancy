import { expect, test, type Page } from '@playwright/test';

const SCREENS = 'test-results/screens';

async function openLevel(page: Page, n: number) {
  await page.goto(`/#/level/flex-${String(n).padStart(2, '0')}`);
}

/** Заменить весь код в редакторе. fill() у CodeMirror иногда вставляет текст, не выделив старый. */
async function typeCode(page: Page, code: string) {
  await page.locator('.cm-content').click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(code);
}

/** Пройдены испытания районов — открыты все районы Парящих земель (для гостя они открываются по порядку). */
async function unlockDistricts(page: Page) {
  await page.addInitScript(() => {
    if (localStorage.getItem('cascadia.progress.v1')) return;
    const done = { completed: true, stars: 3, attempts: 1, hintsUsed: 0 };
    localStorage.setItem('cascadia.progress.v1', JSON.stringify({ 'flex-13': done, 'grid-09': done, 'mq-04': done, 'tag-07': done, 'fair-08': done, 'sem-07': done, 'box-08': done, 'disp-05': done, 'sel-10': done, 'ps-06': done }));
  });
}

async function cast(page: Page) {
  await page.getByRole('button', { name: /Сотворить/ }).click();
}

/** Сколько элементов вылезает за правый край экрана — для проверки на телефоне. */
async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const offenders = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('body *'))
      .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1)
      .slice(0, 5)
      .map((el) => `${el.tagName.toLowerCase()}.${el.className} → ${Math.round(el.getBoundingClientRect().right)}px`),
  );
  expect(overflow, offenders.join(', ')).toBeLessThanOrEqual(0);
}

test('путь от карты до первого уровня и победа', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Карта Каскадии' })).toBeVisible();
  // Сначала — пролог всей игры
  await page.getByRole('dialog', { name: 'Пролог: Великий Сброс' }).getByRole('button', { name: 'Пропустить' }).click();
  await page.screenshot({ path: `${SCREENS}/00-map.png`, fullPage: true });

  await page.getByRole('link', { name: /Парящие земли/ }).click();
  await expect(page.getByRole('heading', { name: 'Парящие острова' })).toBeVisible();
  // При первом входе на тропу — пролог
  await expect(page.getByRole('dialog', { name: 'Пролог: Парящие острова' })).toBeVisible();
  await page.getByRole('button', { name: 'Пропустить' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.screenshot({ path: `${SCREENS}/00-trail.png`, fullPage: true });

  await page.getByRole('link', { name: 'Уровень 1: Пробуждение' }).click();
  await expect(page.getByRole('heading', { name: 'Пробуждение' })).toBeVisible();
  // В стартовом коде на месте только первый кристалл
  await expect(page.getByText('На месте: 1 из 3')).toBeVisible();
  await page.screenshot({ path: `${SCREENS}/01-start.png`, fullPage: true });

  // Курсор уже в редакторе, а заготовка-комментарий выделена — можно сразу печатать
  await page.keyboard.type('display: flex;');
  await expect(page.getByText('На месте: 3 из 3')).toBeVisible();
  await cast(page);
  await expect(page.getByText('Заклинание сработало!')).toBeVisible();
  await expect(page.getByRole('img', { name: '3 из 3 звёзд' }).last()).toBeVisible();
  await expect(page.getByText('+25 XP')).toBeVisible();
  await expect(page.locator('.rank__xp')).toHaveText('25 XP');
  await page.screenshot({ path: `${SCREENS}/02-success.png`, fullPage: true });

  await page.getByRole('button', { name: 'Дальше →' }).click();
  await expect(page.getByRole('heading', { name: 'Попутный ветер' })).toBeVisible();

  // Пройденный уровень отмечен на тропе, а на карте появилась кнопка «Продолжить»
  await page.goto('/#/land/floating-lands');
  await expect(page.getByRole('img', { name: '3 из 3 звёзд' })).toBeVisible();
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Продолжить: Попутный ветер' })).toBeVisible();
});

test('опечатка в значении объясняется по-человечески', async ({ page }) => {
  await openLevel(page, 2);
  await typeCode(page, '.island {\n  display: flex;\n  justify-content: centre;\n}\n');
  await cast(page);
  await expect(page.getByText(/Может, center\?/)).toBeVisible();
  await page.screenshot({ path: `${SCREENS}/03-typo.png`, fullPage: true });
});

test('промах: одинаковый сдвиг всех кристаллов — одной фразой', async ({ page }) => {
  await openLevel(page, 2);
  await typeCode(page, '.island {\n  display: flex;\n  justify-content: center;\n}\n');
  await cast(page);
  await expect(page.getByText('Все кристаллы смещены одинаково — нужно на 132px правее.')).toBeVisible();
});

test('чужая магия запрещена, подсказки снимают звёзды', async ({ page }) => {
  await openLevel(page, 3);
  await typeCode(page, '.island {\n  display: flex;\n  padding-left: 100px;\n}\n');
  await cast(page);
  await expect(page.getByText(/только магия Flexbox: padding-left не подойдёт/)).toBeVisible();

  await page.getByRole('button', { name: /Подсказка 1 из 3/ }).click();
  await expect(page.getByText('Снова распределяем кристаллы', { exact: false })).toBeVisible();
  await typeCode(page, '.island {\n  display: flex;\n  justify-content: space-between;\n}\n');
  await cast(page);
  await expect(page.getByText('Заклинание сработало!')).toBeVisible();
  await expect(page.getByText('1 подсказка: −1 ★')).toBeVisible();
});

test('порядок в строю: нужен order, разворот ряда запрещён', async ({ page }) => {
  await openLevel(page, 10);
  // Разворот ряда даёт ту же картинку, но уровень учит order
  await typeCode(page, '.island {\n  display: flex;\n  flex-direction: row-reverse;\n  justify-content: center;\n  align-items: center;\n}\n');
  await expect(page.getByText('На месте: 3 из 3')).toBeVisible();
  await cast(page);
  await expect(page.getByText('В этом испытании нельзя использовать flex-direction.')).toBeVisible();

  await typeCode(
    page,
    '.island {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n\n.ruby {\n  order: -1;\n}\n\n.amethyst {\n  order: 1;\n}\n',
  );
  await cast(page);
  await expect(page.getByText('Заклинание сработало!')).toBeVisible();
});

test('сжатые кристаллы: одна понятная фраза вместо девяти', async ({ page }) => {
  await openLevel(page, 9);
  await cast(page);
  await expect(page.getByText('Все кристаллы не того размера — каждому нужно шире на 13px.')).toBeVisible();
});

test('после последнего уровня — итог района и дорога на тропу', async ({ page }) => {
  await openLevel(page, 13);
  await typeCode(
    page,
    '.island {\n  display: flex;\n  justify-content: center;\n  align-items: flex-end;\n  gap: 16px;\n}\n\n.sapphire {\n  align-self: flex-start;\n}\n',
  );
  await cast(page);
  await expect(page.getByText('Заклинание сработало!')).toBeVisible();
  await expect(page.getByText(/Пройдено уровней: 1 из 13/)).toBeVisible();
  await page.getByRole('link', { name: '← К тропе' }).click();
  await expect(page.getByRole('heading', { name: 'Парящие острова' })).toBeVisible();
});

test.describe('на телефоне', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('карта, тропа и уровень помещаются по ширине', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Карта Каскадии' })).toBeVisible();
    await expectNoHorizontalScroll(page);
    await page.getByRole('button', { name: 'Пропустить' }).click();
    await page.screenshot({ path: `${SCREENS}/04-phone-map.png`, fullPage: true });

    await page.goto('/#/land/floating-lands');
    await expect(page.getByRole('heading', { name: 'Парящие острова' })).toBeVisible();
    await expectNoHorizontalScroll(page);

    await openLevel(page, 1);
    await expect(page.getByText('На месте: 1 из 3')).toBeVisible();
    await expectNoHorizontalScroll(page);
    await page.locator('.code-editor').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${SCREENS}/04-phone-level.png`, fullPage: true });
  });

  test('HTML-уровень помещается по ширине', async ({ page }) => {
    await page.goto('/#/level/tag-02');
    await expect(page.locator('.goals')).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  test('карта Скриптории и JS-уровень помещаются по ширине', async ({ page }) => {
    await page.goto('/#/scriptoria');
    await expect(page.getByRole('heading', { name: 'Карта Скриптории' })).toBeVisible();
    await page.getByRole('button', { name: 'Пропустить' }).click();
    await expectNoHorizontalScroll(page);

    await page.goto('/#/level/js-07');
    await expect(page.locator('.flask').first()).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  test('зеркала адаптивного уровня встают друг под другом и помещаются', async ({ page }) => {
    await unlockDistricts(page);
    await page.goto('/#/level/mq-01');
    await expect(page.getByText('На месте: 4 из 6')).toBeVisible();
    await expect(page.locator('.mirrors--column')).toBeVisible();
    await expectNoHorizontalScroll(page);
    await page.locator('.code-editor').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${SCREENS}/05-phone-mirrors.png`, fullPage: true });
  });
});

test.describe('достижения', () => {
  test('своё решение и первое заклинание', async ({ page }) => {
    await openLevel(page, 2);
    // flex-end у наставника, а end — другой верный путь
    await typeCode(page, '.island {\n  display: flex;\n  justify-content: end;\n}\n');
    await cast(page);
    await expect(page.getByText('Заклинание сработало!')).toBeVisible();
    await expect(page.locator('.result__achievements')).toContainText('Свой путь');
    await expect(page.locator('.result__achievements')).toContainText('Первое заклинание');
  });

  test('секрет Лорда Дефолта и страница достижений', async ({ page }) => {
    await openLevel(page, 1);
    await typeCode(page, '.island {\n  display: flex;\n  font-family: "Times New Roman";\n}\n');
    await cast(page);
    await expect(page.locator('.toast')).toContainText('Заклинание Лорда Дефолта');

    await page.goto('/#/achievements');
    await expect(page.getByRole('heading', { name: 'Достижения' })).toBeVisible();
    await expect(page.getByText(/Получено 1 из \d+/)).toBeVisible();
    // Остальные секретные скрыты
    await expect(page.getByText('???').first()).toBeVisible();
    await page.screenshot({ path: `${SCREENS}/05-achievements.png`, fullPage: true });
  });
});

test.describe('гримуар', () => {
  test('запись, живой пример, заметка и шпаргалка для печати', async ({ page }) => {
    await openLevel(page, 1);
    await typeCode(page, '.island {\n  display: flex;\n}\n');
    await cast(page);
    await expect(page.getByText('Заклинание сработало!')).toBeVisible();

    await page.goto('/#/grimoire');
    await expect(page.getByRole('heading', { name: 'Гримуар' })).toBeVisible();
    await expect(page.getByText(/Изучено 1 из \d+ заклинаний/)).toBeVisible();
    await expect(page.getByRole('heading', { name: '???' }).first()).toBeVisible();

    // Живой пример: кнопка значения меняет мини-сцену и код
    await page.getByRole('button', { name: 'block', exact: true }).click();
    await expect(page.locator('.example__code').first()).toContainText('display: block;');
    // При display: block блоки встают друг под другом — проверяем саму мини-сцену
    const stacked = await page
      .locator('.example__preview')
      .first()
      .evaluate((frame: HTMLIFrameElement) => {
        const items = frame.contentDocument?.querySelectorAll('.item') ?? [];
        return items.length > 1 && items[1].getBoundingClientRect().top > items[0].getBoundingClientRect().top;
      });
    expect(stacked).toBe(true);

    await page.getByRole('textbox').first().fill('Флекс выстраивает детей в ряд');
    await page.reload();
    await expect(page.getByRole('textbox').first()).toHaveValue('Флекс выстраивает детей в ряд');
    await page.screenshot({ path: `${SCREENS}/06-grimoire.png`, fullPage: true });

    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.example__chips').first()).toBeHidden();
    await expect(page.getByText('Мои заметки: Флекс выстраивает детей в ряд')).toBeVisible();
    await page.screenshot({ path: `${SCREENS}/07-grimoire-print.png`, fullPage: true });
  });

  test('вопрос на повторение после второго нового уровня', async ({ page }) => {
    await openLevel(page, 1);
    await typeCode(page, '.island {\n  display: flex;\n}\n');
    await cast(page);
    await expect(page.getByText('Заклинание сработало!')).toBeVisible();
    await expect(page.getByText('Вопрос на повторение', { exact: false })).toHaveCount(0);

    await page.getByRole('button', { name: 'Дальше →' }).click();
    await typeCode(page, '.island {\n  display: flex;\n  justify-content: flex-end;\n}\n');
    await cast(page);
    await expect(page.getByText(/Вопрос на повторение/)).toBeVisible();
    await page.getByRole('button', { name: 'Выстраивает их вдоль главной оси — по умолчанию в ряд' }).click();
    await expect(page.getByText(/Верно! \+5 XP/)).toBeVisible();
    await expect(page.locator('.rank__xp')).toHaveText('55 XP');
    await page.screenshot({ path: `${SCREENS}/08-review.png`, fullPage: true });
  });
});

test.describe('сценки', () => {
  test('пролог: один раз сам, потом по кнопке', async ({ page }) => {
    await page.goto('/#/land/floating-lands');
    const dialog = page.getByRole('dialog', { name: 'Пролог: Парящие острова' });
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${SCREENS}/09-intro-1.png` });
    for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Дальше →' }).click();
    await expect(dialog).toContainText('Магистр Флекс');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENS}/09-intro-4.png` });
    await page.getByRole('button', { name: 'В путь!' }).click();
    await expect(dialog).toHaveCount(0);

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Парящие острова' })).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    const islands = page.locator('.district', { has: page.getByRole('heading', { name: 'Парящие острова' }) });
    await islands.getByRole('button', { name: 'Пролог' }).click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  });

  test('пролог следующего района — только когда до него дошли', async ({ page }) => {
    await page.addInitScript(() => {
      if (localStorage.getItem('cascadia.progress.v1')) return;
      // Пролог островов уже видели, а сами острова пройдены не до конца
      localStorage.setItem('cascadia.stats.v1', JSON.stringify({ seen: { 'intro:floating-islands': true } }));
      localStorage.setItem('cascadia.progress.v1', JSON.stringify({ 'flex-01': { completed: true, stars: 3, attempts: 1, hintsUsed: 0 } }));
    });
    await page.goto('/#/land/floating-lands');
    await expect(page.getByRole('heading', { name: 'Витражная обитель' })).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    // Все острова пройдены — на тропе встречает пролог Витражной обители
    await page.evaluate(() => {
      const progress: Record<string, object> = {};
      for (let i = 1; i <= 13; i++) {
        progress[`flex-${String(i).padStart(2, '0')}`] = { completed: true, stars: 3, attempts: 1, hintsUsed: 0 };
      }
      localStorage.setItem('cascadia.progress.v1', JSON.stringify(progress));
    });
    await page.reload();
    await expect(page.getByRole('dialog', { name: 'Пролог: Витражная обитель' })).toBeVisible();
  });

  test('победная сцена после последнего уровня района', async ({ page }) => {
    // Первые 12 уровней уже пройдены
    await page.addInitScript(() => {
      if (localStorage.getItem('cascadia.progress.v1')) return;
      const progress: Record<string, object> = {};
      for (let i = 1; i <= 12; i++) {
        progress[`flex-${String(i).padStart(2, '0')}`] = { completed: true, stars: 3, attempts: 1, hintsUsed: 0 };
      }
      localStorage.setItem('cascadia.progress.v1', JSON.stringify(progress));
    });
    await openLevel(page, 13);
    await typeCode(
      page,
      `.island {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 16px;
}

.sapphire {
  align-self: flex-start;
}
`,
    );
    await cast(page);
    const finale = page.getByRole('dialog', { name: 'Эпилог: Парящие острова' });
    await expect(finale).toBeVisible();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENS}/10-outro.png` });
    await page.keyboard.press('Escape');
    await expect(finale).toHaveCount(0);
    await expect(page.getByText(/Район «Парящие острова» пройден!/)).toBeVisible();
    await expect(page.locator('.result__achievements')).toContainText('Сияние: Парящие острова');
    await page.getByRole('button', { name: 'Смотреть финал' }).click();
    await expect(finale).toBeVisible();
  });
});

test('районы открываются по порядку: следующий — после испытания предыдущего', async ({ page }) => {
  // Гость сразу в Витражной обители — его встречает тропа с замком
  await page.goto('/#/level/grid-01');
  await expect(page.getByRole('heading', { name: 'Парящие земли' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByText('Откроется после испытания «Звёздная корона» в районе «Парящие острова».')).toBeVisible();
  await expect(page.getByText('Откроется после уровня «Бесконечная галерея» в районе «Зеркальная башня».')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Уровень 1: Первые створки' })).toHaveCount(0);

  // Испытание пройдено — район открыт, о нём говорят сразу после победы
  await openLevel(page, 13);
  await typeCode(
    page,
    '.island {\n  display: flex;\n  justify-content: center;\n  align-items: flex-end;\n  gap: 16px;\n}\n\n.sapphire {\n  align-self: flex-start;\n}\n',
  );
  await cast(page);
  await expect(page.getByText('Открыт новый район: «Витражная обитель» — он ждёт на тропе.')).toBeVisible();
  await page.goto('/#/level/grid-01');
  await expect(page.getByRole('heading', { name: 'Первые створки' })).toBeVisible();
});

test.describe('Grid и адаптив', () => {
  test.beforeEach(async ({ page }) => {
    await unlockDistricts(page);
  });

  test('уровень про fr не засчитывается в пикселях, даже если стёкла на месте', async ({ page }) => {
    await page.goto('/#/level/grid-02');
    await typeCode(page, '.window {\n  display: grid;\n  grid-template-columns: 120px 240px 120px;\n}\n');
    await expect(page.getByText('На месте: 3 из 3')).toBeVisible();
    // Пока код пишется, обязательный приём не подсвечивается как ошибка
    await expect(page.locator('.cm-lintRange-error')).toHaveCount(0);
    await cast(page);
    await expect(page.getByText(/Здесь нужна единица fr/)).toBeVisible();

    await typeCode(page, '.window {\n  display: grid;\n  grid-template-columns: 1fr 2fr 1fr;\n}\n');
    await cast(page);
    await expect(page.getByText('Заклинание сработало!')).toBeVisible();
  });

  test('два зеркала: промахи по каждому, ошибка в медиазапросе объясняется', async ({ page }) => {
    const base = '.hall {\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  align-items: center;\n  gap: 12px;\n}\n\n';
    await page.goto('/#/level/mq-01');
    await expect(page.getByText('Узкое зеркало · 360px')).toBeVisible();
    await expect(page.getByText('Широкое зеркало · 720px')).toBeVisible();
    // В узком зеркале всё уже верно, в широком на месте только средний кристалл
    await expect(page.getByText('На месте: 4 из 6')).toBeVisible();
    await cast(page);
    await expect(page.getByText(/^Зеркало 720px: /).first()).toBeVisible();
    await expect(page.getByText(/^Зеркало 360px: /)).toHaveCount(0);

    await typeCode(page, `${base}@media (min-width 600px) {\n  .hall {\n    flex-direction: row;\n  }\n}\n`);
    await cast(page);
    await expect(page.getByText(/Внутри скобок не хватает двоеточия/)).toBeVisible();

    await typeCode(page, `${base}@media (min-width: 600px) {\n  .hall {\n    flex-direction: row;\n  }\n}\n`);
    await expect(page.getByText('На месте: 6 из 6')).toBeVisible();
    await cast(page);
    await expect(page.getByText('Заклинание сработало!')).toBeVisible();
    await page.screenshot({ path: `${SCREENS}/11-mirrors.png`, fullPage: true });
  });

  test('спрятанный кристалл: сначала просим спрятать, а не двигать соседей', async ({ page }) => {
    await page.goto('/#/level/mq-03');
    await cast(page);
    await expect(page.locator('.result__list li').first()).toHaveText('Зеркало 360px: Тайный топаз: здесь нужно спрятать.');
  });

  test('живой пример с медиазапросом переключает ширину экрана', async ({ page }) => {
    await page.addInitScript(() => {
      const progress = JSON.parse(localStorage.getItem('cascadia.progress.v1') ?? '{}');
      progress['mq-01'] = { completed: true, stars: 3, attempts: 1, hintsUsed: 0 };
      localStorage.setItem('cascadia.progress.v1', JSON.stringify(progress));
    });
    await page.goto('/#/grimoire');
    const card = page.locator('.spell-card', { has: page.getByRole('heading', { name: '@media (min-width: …)' }) });
    await expect(card.getByText('не срабатывает на 360px')).toBeVisible();

    await card.getByRole('button', { name: 'экран 720px' }).click();
    await expect(card.getByText('— срабатывает на 720px')).toBeVisible();
    // На широком «экране» блоки мини-сцены встали в ряд
    const inRow = await card.locator('iframe').evaluate((frame: HTMLIFrameElement) => {
      const items = Array.from(frame.contentDocument?.querySelectorAll('.item') ?? []);
      return items.length === 3 && items.every((item) => item.getBoundingClientRect().top === items[0].getBoundingClientRect().top);
    });
    expect(inRow).toBe(true);
  });
});

test.describe('Долина Тегов', () => {
  test('первый абзац: цель загорается, страница оживает', async ({ page }) => {
    await page.goto('/#/level/tag-01');
    await expect(page.getByRole('heading', { name: 'Первый абзац' })).toBeVisible();
    await expect(page.locator('.goals__head')).toHaveText(/0 из 1/);
    await typeCode(page, '<p>Добро пожаловать в Деревню Тегов! Здесь у каждого слова есть свой тег.</p>\n');
    await expect(page.locator('.goals__head')).toHaveText(/1 из 1/);
    await expect(page.frameLocator('.browser__page').locator('p')).toContainText('Добро пожаловать');
    await page.screenshot({ path: `${SCREENS}/13-html-level.png`, fullPage: true });
    await cast(page);
    await expect(page.getByText('Заклинание сработало!')).toBeVisible();
    await expect(page.getByText('Новое заклинание')).toBeVisible();
  });

  test('перепутанные теги: объяснение по-русски', async ({ page }) => {
    await page.goto('/#/level/tag-04');
    await expect(page.locator('.goals__head')).toHaveText(/из 3/);
    await cast(page);
    await expect(page.locator('.result__list')).toContainText('Теги перепутаны: сначала закрой </strong>, потом </p>');
  });

  test('скелет документа: <title> попадает на вкладку браузера', async ({ page }) => {
    await page.goto('/#/level/tag-06');
    await expect(page.locator('.browser__tab')).toHaveText('Без названия');
    await typeCode(
      page,
      '<!doctype html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n<title>Деревня Тегов</title>\n</head>\n<body>\n<h1>Привет</h1>\n</body>\n</html>\n',
    );
    await expect(page.locator('.browser__tab')).toHaveText('Деревня Тегов');
    await expect(page.locator('.goals__head')).toHaveText(/5 из 5/);
  });

  test.describe('Ярмарка Ссылок', () => {
    test.beforeEach(async ({ page }) => {
      await unlockDistricts(page);
    });

    test('ссылка: строка состояния показывает адрес, переход отключён', async ({ page }) => {
      await page.goto('/#/level/fair-04');
      await typeCode(page, '<h2>Соседи</h2>\n<p>Загляни к соседям: <a href="https://kaskadia.example">Деревня Тегов</a>.</p>\n');
      await expect(page.locator('.goals__head')).toHaveText(/2 из 2/);
      const link = page.frameLocator('.browser__page').getByRole('link', { name: 'Деревня Тегов' });
      await link.hover();
      await expect(page.locator('.browser__status')).toHaveText('Ссылка → https://kaskadia.example');
      await link.click();
      await expect(page.locator('.browser__status')).toContainText('в тренажёре переходы отключены');
      await expect(page.locator('.browser__page')).toBeVisible();
    });

    test('якорь прокручивает страницу к метке', async ({ page }) => {
      await page.goto('/#/level/fair-05');
      const level = await page.evaluate<string>("import('/src/levels/link-fair/fair-05.ts').then((m) => m.default.solutionHtml)");
      await typeCode(page, level);
      await expect(page.locator('.goals__head')).toHaveText(/2 из 2/);
      await page.frameLocator('.browser__page').getByRole('link', { name: 'К площади' }).click();
      await expect(page.locator('.browser__status')).toContainText('Якорь #square');
    });

    test('картинка из библиотеки загружается, а с ошибкой в имени — показывает alt', async ({ page }) => {
      await page.goto('/#/level/fair-06');
      await typeCode(page, '<h2>Лавка</h2>\n<img src="potion.png" alt="Красное зелье">\n');
      const image = page.frameLocator('.browser__page').getByRole('img', { name: 'Красное зелье' });
      await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
      await typeCode(page, '<h2>Лавка</h2>\n<img src="potion-oops.png" alt="Красное зелье">\n');
      await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(0);
    });
  });

  test.describe('Кузница Форм', () => {
    test.beforeEach(async ({ page }) => {
      await unlockDistricts(page);
    });

    test('подпись ставит курсор в своё поле', async ({ page }) => {
      await page.goto('/#/level/form-01');
      await typeCode(page, '<form>\n  <label for="hero">Имя героя</label>\n  <input id="hero" name="hero">\n</form>\n');
      await expect(page.locator('.goals__head')).toHaveText(/3 из 3/);
      const frame = page.frameLocator('.browser__page');
      await frame.getByText('Имя героя').click();
      await expect(frame.locator('#hero')).toBeFocused();
    });

    test('обязательное поле: пустую форму браузер не отправит', async ({ page }) => {
      await page.goto('/#/level/form-05');
      await typeCode(
        page,
        '<form>\n  <label for="hero">Имя героя</label>\n  <input id="hero" name="hero" required>\n  <button type="submit">Отправить</button>\n</form>\n',
      );
      await expect(page.locator('.goals__head')).toHaveText(/3 из 3/);
      const frame = page.frameLocator('.browser__page');
      await frame.getByRole('button', { name: 'Отправить' }).click();
      await expect(frame.locator('#hero')).toBeFocused();
      await expect(page.locator('.browser__status')).not.toContainText('Форма отправила бы');
      await frame.getByLabel('Имя героя').fill('Ариэль');
      await frame.getByRole('button', { name: 'Отправить' }).click();
      await expect(page.locator('.browser__status')).toHaveText('Форма отправила бы: hero=Ариэль');
    });
  });
});

test.describe('Крепость Блоков', () => {
  test.beforeEach(async ({ page }) => {
    await unlockDistricts(page);
  });

  test('рамку не заменить обивкой, хоть размер и совпал', async ({ page }) => {
    await page.goto('/#/level/box-04');
    await cast(page);
    await expect(page.locator('.result__list li').first()).toHaveText('Портрет: нужно шире на 24px и выше ростом на 24px.');

    await typeCode(page, '.portrait {\n  padding: 12px;\n}\n');
    await expect(page.getByText('На месте: 1 из 1')).toBeVisible();
    await cast(page);
    await expect(page.getByText(/Портрету нужна каменная рамка/)).toBeVisible();

    await typeCode(page, '.portrait {\n  border: 12px solid #78716c;\n}\n');
    await cast(page);
    await expect(page.getByText('Заклинание сработало!')).toBeVisible();
  });

  test('шпион в строю: display: none убирает и место, visibility — только прячет', async ({ page }) => {
    const soldiers = '.soldier {\n  display: inline-block;\n}\n\n';
    await page.goto('/#/level/disp-04');
    await cast(page);
    await expect(page.locator('.result__list li').first()).toHaveText('Шпион: спрячь, но так, чтобы место осталось пустым.');

    await typeCode(page, `${soldiers}.spy {\n  display: none;\n}\n`);
    await cast(page);
    await expect(page.locator('.result__list li').first()).toHaveText('Шпион: убран вместе со своим местом, а место должно остаться пустым.');

    await typeCode(page, `${soldiers}.spy {\n  visibility: hidden;\n}\n`);
    await cast(page);
    await expect(page.getByText('Заклинание сработало!')).toBeVisible();
  });

  test('на параде шпиона убирают совсем', async ({ page }) => {
    await page.goto('/#/level/disp-05');
    await typeCode(page, '.banner {\n  display: block;\n}\n\n.soldier {\n  display: inline-block;\n}\n\n.spy {\n  visibility: hidden;\n}\n');
    await cast(page);
    await expect(page.locator('.result__list li').first()).toHaveText('Шпион: не виден, но всё ещё занимает место — убери его совсем.');
  });

  test('z-index: проверка видит, кто кого заслоняет', async ({ page }) => {
    await page.goto('/#/level/pos-04');
    await expect(page.getByText('На месте: 0 из 3')).toBeVisible();
    await cast(page);
    await expect(page.locator('.result__list li').first()).toHaveText('Королевское знамя: сверху лежит «Знамя Востока» — подними через z-index.');

    await typeCode(page, '.standard {\n  position: absolute;\n}\n\n.royal {\n  z-index: 9999;\n}\n');
    await expect(page.getByText('На месте: 3 из 3')).toBeVisible();
    await cast(page);
    await expect(page.getByText('Заклинание сработало!')).toBeVisible();
    // Вместе с ним всплывают и другие достижения — ищем своё
    await expect(page.locator('.toast', { hasText: 'Война слоёв' })).toBeVisible();
  });

  test('испытание башни: слои проверяются, когда флаг уже на месте', async ({ page }) => {
    await page.goto('/#/level/pos-06');
    // Луну не в чем упрекнуть, пока флаг не долетел
    await expect(page.getByText('На месте: 1 из 4')).toBeVisible();
    await typeCode(page, '.tower {\n  position: relative;\n}\n\n.flag {\n  position: absolute;\n  top: -48px;\n  right: 16px;\n}\n');
    await cast(page);
    await expect(page.getByText('Флаг: сверху лежит «Луна» — подними через z-index.')).toBeVisible();
  });
});

test.describe('Лес Селекторов', () => {
  test.beforeEach(async ({ page }) => {
    await unlockDistricts(page);
  });

  test('селектор по тегу: лишние и не найденные — каждая причина одной строкой', async ({ page }) => {
    await page.goto('/#/level/sel-01');
    // Разметка в уровнях про селекторы открыта сразу
    await expect(page.locator('.markup', { hasText: 'HTML сцены' }).locator('pre')).toBeVisible();
    await cast(page);
    await expect(page.locator('.result__list li')).toHaveText([
      'Селектор не нашёл: Заголовок 1 и Заголовок 2.',
      'Выбраны лишние: Строка 1 и Строка 2.',
    ]);

    await typeCode(page, 'h2 {\n  color: gold;\n}\n');
    await expect(page.getByText('На месте: 4 из 4')).toBeVisible();
    await cast(page);
    await expect(page.getByText('Заклинание сработало!')).toBeVisible();
  });

  test(':hover проверяется во втором зеркале — «под мышкой»', async ({ page }) => {
    await page.goto('/#/level/ps-01');
    await expect(page.getByText('Под мышкой', { exact: true })).toBeVisible();
    await cast(page);
    await expect(page.locator('.result__list li').first()).toHaveText(
      'Обычно: Выбраны лишние: Светлячок 1, Светлячок 2 и Светлячок 3.',
    );

    await typeCode(page, '.firefly:hover {\n  color: gold;\n}\n');
    await expect(page.getByText('На месте: 8 из 8')).toBeVisible();
    await cast(page);
    await expect(page.getByText('Заклинание сработало!')).toBeVisible();
  });

  test('чары Лорда Дефолта видны, а проигравшее правило объясняется', async ({ page }) => {
    await page.goto('/#/level/cas-02');
    const locked = page.locator('.markup--locked');
    await expect(locked).toContainText('Чары Лорда Дефолта');
    await expect(locked.locator('pre')).toContainText('li {');
    await cast(page);
    await expect(page.locator('.result__list li').first()).toHaveText(
      /^Твоё правило их нашло, но победило другое — проверь специфичность и порядок правил: Лист 1, Лист 2, Лист 3, Лист 4 и ещё 5\.$/,
    );

    await typeCode(page, '.leaf {\n  color: lime;\n}\n');
    await cast(page);
    await expect(page.getByText('Заклинание сработало!')).toBeVisible();
  });

  test('!important на !important не засчитывается', async ({ page }) => {
    await page.goto('/#/level/cas-05');
    await typeCode(page, '.leaf {\n  color: gray !important;\n}\n\n.leaf.spring {\n  color: lime !important;\n}\n');
    await expect(page.getByText('На месте: 6 из 6')).toBeVisible();
    await cast(page);
    await expect(page.getByText(/Не отвечай !important на !important/)).toBeVisible();
  });
});

test.describe('эффекты и звук', () => {
  test('переключатели звука и эффектов запоминаются на этом компьютере', async ({ page }) => {
    await openLevel(page, 1);
    const sound = page.getByRole('button', { name: 'Звук' });
    const effects = page.getByRole('button', { name: 'Полные эффекты' });
    // На уроке тихо: звук по умолчанию выключен
    await expect(sound).toHaveAttribute('aria-pressed', 'false');
    await expect(effects).toHaveAttribute('aria-pressed', 'true');
    await sound.click();
    await effects.click();
    await expect(page.locator('html')).toHaveClass(/effects-light/);
    await page.reload();
    await expect(page.getByRole('button', { name: 'Звук' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Полные эффекты' })).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('html')).toHaveClass(/effects-light/);
  });

  test('заклинание сработало: магический круг над сценой, в лёгком режиме — без него', async ({ page }) => {
    await openLevel(page, 1);
    await typeCode(page, '.island {\n  display: flex;\n}\n');
    await expect(page.getByText('На месте: 3 из 3')).toBeVisible();
    await cast(page);
    await expect(page.locator('.scene__fx .magic-circle')).toHaveCount(1);

    await page.getByRole('button', { name: 'Полные эффекты' }).click();
    await openLevel(page, 2);
    await typeCode(page, '.island {\n  display: flex;\n  justify-content: flex-end;\n}\n');
    await cast(page);
    await expect(page.getByText('Заклинание сработало!')).toBeVisible();
    await expect(page.locator('.scene__fx .magic-circle')).toHaveCount(0);
    await expect(page.locator('.spark')).toHaveCount(0);
  });

  test('герой у кнопки взмахивает посохом: при ошибке оглядывается, при успехе подпрыгивает', async ({ page }) => {
    await openLevel(page, 1);
    const hero = page.locator('.actions .hero');
    await expect(hero).toHaveClass(/hero--idle/);
    await cast(page);
    await expect(hero).toHaveClass(/hero--oops/);
    await expect(hero).toHaveClass(/hero--idle/);

    await typeCode(page, '.island {\n  display: flex;\n}\n');
    await cast(page);
    await expect(hero).toHaveClass(/hero--joy/);
    await expect(hero).toHaveClass(/hero--idle/);
  });

  test('наставник задумывается над промахом и радуется успеху', async ({ page }) => {
    await openLevel(page, 1);
    const portrait = page.locator('.dialog .portrait');
    await cast(page);
    await expect(portrait).toHaveClass(/portrait--think/);
    await expect(portrait).not.toHaveClass(/portrait--think/);

    await typeCode(page, '.island {\n  display: flex;\n}\n');
    await cast(page);
    await expect(portrait).toHaveClass(/portrait--joy/);
  });

  test('персонаж говорит, пока печатается его реплика', async ({ page }) => {
    await page.clock.install();
    await page.goto('/#/land/floating-lands');
    const dialog = page.getByRole('dialog', { name: 'Пролог: Парящие острова' });
    await expect(dialog).toBeVisible();
    // Часы на паузе: реплика печатается около секунды, и на занятой машине успела бы допечататься до проверки
    await page.clock.pauseAt(Date.now() + 1000);
    await dialog.getByRole('button', { name: 'Дальше →' }).click();
    await dialog.getByRole('button', { name: 'Дальше →' }).click();
    // Кадр Лорда Дефолта: портрет в подписи шевелится, пока идёт текст, а потом замолкает
    await expect(dialog.locator('.story__caption .face--talking')).toHaveCount(1);
    await page.clock.resume();
    await expect(dialog.locator('.story__caption .face--talking')).toHaveCount(0);
  });
});

test.describe('общий сюжет', () => {
  test('пролог игры на карте: один раз и с обращением к герою', async ({ page }) => {
    await page.goto('/');
    const dialog = page.getByRole('dialog', { name: 'Пролог: Великий Сброс' });
    await expect(dialog).toBeVisible();
    for (let i = 0; i < 3; i++) await dialog.getByRole('button', { name: 'Дальше →' }).click();
    await expect(dialog).toContainText('Это ты, странник!');
    await dialog.getByRole('button', { name: 'К карте' }).click();
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Карта Каскадии' })).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('Лорд Дефолт помнит героя из другой земли', async ({ page }) => {
    await page.addInitScript(() => {
      if (localStorage.getItem('cascadia.progress.v1')) return;
      const done = { completed: true, stars: 3, attempts: 1, hintsUsed: 0 };
      localStorage.setItem('cascadia.progress.v1', JSON.stringify({ 'citadel-02': done }));
    });
    await page.goto('/#/land/tags-valley');
    const dialog = page.getByRole('dialog', { name: 'Пролог: Деревня Тегов' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Дальше →' }).click();
    await expect(dialog).toContainText('Опять ты, странник! Парящие земли у меня уже отняли');
    await dialog.getByRole('button', { name: 'Дальше →' }).click();
    await expect(dialog).toContainText('Слава о тебе дошла и до нас, странник!');
  });

  test('финал цитадели: злодей сбегает туда, где проклятие держится, грамота — в летописи', async ({ page }) => {
    await page.addInitScript(() => {
      if (localStorage.getItem('cascadia.progress.v1')) return;
      const done = { completed: true, stars: 3, attempts: 1, hintsUsed: 0 };
      const ids = ['flex-13', 'grid-09', 'mq-04', 'citadel-01'];
      localStorage.setItem('cascadia.progress.v1', JSON.stringify(Object.fromEntries(ids.map((id) => [id, done]))));
    });
    await page.goto('/#/level/citadel-02');
    const solution = await page.evaluate<string>("import('/src/levels/default-citadel/citadel-02.ts').then((m) => m.default.solutionCss)");
    await typeCode(page, solution);
    await expect(page.getByText(/На месте: (\d+) из \1$/)).toBeVisible();
    await cast(page);

    const outro = page.getByRole('dialog', { name: 'Эпилог: Цитадель Лорда Дефолта' });
    await expect(outro).toBeVisible();
    await outro.getByRole('button', { name: 'Дальше →' }).click();
    await expect(outro).toContainText('Держи Руну Раскладки, странник');
    await outro.getByRole('button', { name: 'Дальше →' }).click();
    await expect(outro).toContainText('моё проклятие держится в Долине Тегов, в Лесу Селекторов и в Крепости Блоков');
    await outro.getByRole('button', { name: 'Дальше →' }).click();
    await expect(outro).toContainText('Следующая остановка — Долина Тегов');
    await outro.getByRole('button', { name: 'Закрыть' }).click();

    await page.goto('/#/chronicle');
    await expect(page.getByRole('heading', { name: 'Летопись героя' })).toBeVisible();
    await expect(page.locator('.chronicle__chapter', { hasText: 'Глава 4. Парящие земли' })).toContainText('спасена');
    await page.getByRole('link', { name: 'Грамота: Парящие земли' }).click();
    await expect(page.locator('.certificate')).toContainText('за спасение земли «Парящие земли»');
    await page.getByLabel('Имя на грамоте').fill('Ариэль');
    await expect(page.locator('.certificate__name')).toHaveText('Ариэль');
    await page.screenshot({ path: `${SCREENS}/14-certificate.png`, fullPage: true });
  });

  test('пролог леса: Лорд Дефолт помнит Долину Тегов', async ({ page }) => {
    await page.addInitScript(() => {
      if (localStorage.getItem('cascadia.progress.v1')) return;
      const done = { completed: true, stars: 3, attempts: 1, hintsUsed: 0 };
      localStorage.setItem('cascadia.progress.v1', JSON.stringify({ 'form-06': done }));
    });
    await page.goto('/#/land/selector-forest');
    const dialog = page.getByRole('dialog', { name: 'Пролог: Опушка' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Дальше →' }).click();
    await expect(dialog).toContainText('Опять ты, странник! Теги ты расставил');
    await dialog.getByRole('button', { name: 'Дальше →' }).click();
    await expect(dialog).toContainText('Слава о тебе долетела и до леса, странник');
  });

  test('все земли спасены: Лорд Дефолт сбегает за дверь <script>, впереди JavaScript', async ({ page }) => {
    await page.addInitScript(() => {
      if (localStorage.getItem('cascadia.progress.v1')) return;
      const done = { completed: true, stars: 3, attempts: 1, hintsUsed: 0 };
      const ids = ['form-06', 'pos-06', 'citadel-02', 'sel-10', 'ps-06', 'cas-01', 'cas-02', 'cas-03', 'cas-04', 'cas-05'];
      localStorage.setItem('cascadia.progress.v1', JSON.stringify(Object.fromEntries(ids.map((id) => [id, done]))));
    });
    await page.goto('/#/level/cas-06');
    const solution = await page.evaluate<string>("import('/src/levels/cascade-tree/cas-06.ts').then((m) => m.default.solutionCss)");
    await typeCode(page, solution);
    await expect(page.getByText(/На месте: (\d+) из \1$/)).toBeVisible();
    await cast(page);

    // Все земли спасены — в эпилоге леса злодею бежать уже некуда
    const outro = page.getByRole('dialog', { name: 'Эпилог: Древо Каскада' });
    await expect(outro).toBeVisible();
    await outro.getByRole('button', { name: 'Дальше →' }).click();
    await expect(outro).toContainText('Держи Руну Селекторов, странник');
    await outro.getByRole('button', { name: 'Закрыть' }).click();

    const finale = page.getByRole('dialog', { name: 'Финал: Магистр Стилемантии' });
    await expect(finale).toBeVisible();
    await finale.getByRole('button', { name: 'Дальше →' }).click();
    await expect(finale).toContainText('дверь с надписью <script>');
    for (let i = 0; i < 3; i++) await finale.getByRole('button', { name: 'Дальше →' }).click();
    await expect(finale).toContainText('нужна новая магия — JavaScript');
  });

  test('пролог крепости: Лорд Дефолт помнит Долину Тегов', async ({ page }) => {
    await page.addInitScript(() => {
      if (localStorage.getItem('cascadia.progress.v1')) return;
      const done = { completed: true, stars: 3, attempts: 1, hintsUsed: 0 };
      localStorage.setItem('cascadia.progress.v1', JSON.stringify({ 'form-06': done }));
    });
    await page.goto('/#/land/block-fortress');
    const dialog = page.getByRole('dialog', { name: 'Пролог: Казармы' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Дальше →' }).click();
    await expect(dialog).toContainText('Опять ты, странник! Долину Тегов ты у меня отнял');
    await dialog.getByRole('button', { name: 'Дальше →' }).click();
    await expect(dialog).toContainText('Так это ты, странник, гроза Лорда Дефолта?');
  });

  test('финал крепости: Руна Блоков, а злодей сбегает в оставшиеся земли', async ({ page }) => {
    await page.addInitScript(() => {
      if (localStorage.getItem('cascadia.progress.v1')) return;
      const done = { completed: true, stars: 3, attempts: 1, hintsUsed: 0 };
      const ids = ['form-06', 'box-08', 'disp-05', 'pos-01', 'pos-02', 'pos-03', 'pos-04', 'pos-05'];
      localStorage.setItem('cascadia.progress.v1', JSON.stringify(Object.fromEntries(ids.map((id) => [id, done]))));
    });
    await page.goto('/#/level/pos-06');
    const solution = await page.evaluate<string>("import('/src/levels/watchtower/pos-06.ts').then((m) => m.default.solutionCss)");
    await typeCode(page, solution);
    await expect(page.getByText(/На месте: (\d+) из \1$/)).toBeVisible();
    await cast(page);

    const outro = page.getByRole('dialog', { name: 'Эпилог: Дозорная башня' });
    await expect(outro).toBeVisible();
    await outro.getByRole('button', { name: 'Дальше →' }).click();
    await expect(outro).toContainText('Держи Руну Блоков, странник');
    await outro.getByRole('button', { name: 'Дальше →' }).click();
    await expect(outro).toContainText('моё проклятие держится в Лесу Селекторов и в Парящих землях');
    await outro.getByRole('button', { name: 'Дальше →' }).click();
    // Лес Селекторов раньше по курсу, чем Парящие земли, — дорога ведёт туда
    await expect(outro).toContainText('Следующая остановка — Лес Селекторов');
    await outro.getByRole('button', { name: 'Закрыть' }).click();

    await page.goto('/#/chronicle');
    await expect(page.locator('.chronicle__chapter', { hasText: 'Глава 3. Крепость Блоков' })).toContainText('спасена');
  });
});

test.describe('Скриптория', () => {
  test('дверь <script>: из Каскадии в Скрипторию и обратно, пролог — один раз', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('dialog', { name: 'Пролог: Великий Сброс' }).getByRole('button', { name: 'Пропустить' }).click();
    // Гостю дверь открыта сразу
    const door = page.getByRole('link', { name: /Дверь <script>/ });
    await expect(door).toContainText('Открыта — шагни за порог!');
    await door.click();

    // Общий финал герой не видел — сюжет объясняет, почему он здесь раньше
    const prologue = page.getByRole('dialog', { name: 'Пролог: За дверью <script>' });
    await expect(prologue).toContainText('тревожная весть');
    await prologue.getByRole('button', { name: 'Пропустить' }).click();
    await expect(page.getByRole('heading', { name: 'Карта Скриптории' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Врата Скриптории/ })).toContainText('Пройдено 0 из 16');
    await expect(page.locator('[data-land="mechanism-city"]')).toContainText('Пройдено 0 из 19');
    await page.screenshot({ path: `${SCREENS}/30-scriptoria-map.png`, fullPage: true });

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Карта Скриптории' })).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    // Дверь на карте Скриптории ведёт обратно, а дверь Каскадии помнит, что герой заходил
    await page.getByRole('link', { name: /Дверь в Каскадию/ }).click();
    await expect(page.getByRole('heading', { name: 'Карта Каскадии' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Дверь <script>/ })).toContainText('Скриптория · пройдено 0 из 74');
  });

  test('Зал Оракула: свиток повторяет вывод, колба показывает тип', async ({ page }) => {
    await page.goto('/#/level/js-03');
    await expect(page.getByRole('heading', { name: 'Первая колба' })).toBeVisible();
    await expect(page.locator('.goals__head')).toHaveText(/0 из 2/);

    // Строка '5' на свитке выглядит как число, но колба зелёная — и проверка это объясняет
    await typeCode(page, "let gems = '5';\nconsole.log(gems);\n");
    await expect(page.locator('.flask', { hasText: 'gems' })).toContainText("'5'");
    await expect(page.locator('.goals__head')).toHaveText(/1 из 2/);
    await cast(page);
    await expect(page.locator('.result__list')).toContainText("В колбе gems — '5' (строка), а нужно 5 (число).");

    await typeCode(page, 'let gems = 5;\nconsole.log(gems);\n');
    await expect(page.locator('.goals__head')).toHaveText(/2 из 2/);
    await page.screenshot({ path: `${SCREENS}/31-oracle-level.png`, fullPage: true });
    await cast(page);
    await expect(page.getByText('Заклинание сработало!')).toBeVisible();
    await expect(page.getByText('Новое заклинание')).toBeVisible();
  });

  test('ошибки по-русски: Лорд Дефолт запечатал колбу и перепутал этикетки', async ({ page }) => {
    await page.goto('/#/level/js-05');
    await expect(page.locator('.oracle-line--error')).toContainText('Код остановился: строка 5 — Колба lives запечатана');

    await page.goto('/#/level/js-06');
    await expect(page.locator('.oracle-line--error')).toContainText('В имени переменной не может быть пробела: «magic power»');
    await cast(page);
    await expect(page.locator('.result__list')).toContainText('Склей слова, вторую часть — с большой буквы: magicPower');
  });

  test('ответ не написать готовым числом — пусть посчитает Оракул', async ({ page }) => {
    await page.goto('/#/level/js-02');
    await typeCode(page, "console.log('7 + 5');\nconsole.log(12);\n");
    // Свиток совпал, но приём уровня проверяется по «Сотворить»
    await expect(page.locator('.goals__head')).toHaveText(/2 из 2/);
    await cast(page);
    await expect(page.locator('.result__list')).toContainText('Не пиши 12 готовым числом');

    await typeCode(page, "console.log('7 + 5');\nconsole.log(7 + 5);\n");
    await cast(page);
    await expect(page.getByText('Заклинание сработало!')).toBeVisible();
  });

  test('посчитал, но не налил: подсказка про gems + 3', async ({ page }) => {
    await page.goto('/#/level/js-04');
    await typeCode(page, 'let gems = 5;\nconsole.log(gems);\ngems + 3;\nconsole.log(gems);\n');
    await cast(page);
    await expect(page.locator('.result__list li').first()).toContainText('Строка 3: gems + 3 посчитано, но никуда не налито');
    await expect(page.locator('.result__list')).toContainText('Строка 2: Оракул сказал «5», а нужно «8»');
  });

  test('бесконечный цикл останавливается, а игра не зависает', async ({ page }) => {
    await page.goto('/#/level/js-01');
    await typeCode(page, 'while (true) {}\n');
    await expect(page.locator('.oracle-line--error')).toContainText('Код работал слишком долго');
    await cast(page);
    await expect(page.locator('.result__list')).toContainText('похоже, где-то бесконечный цикл');

    await typeCode(page, "console.log('Привет, Скриптория!');\n");
    await cast(page);
    await expect(page.getByText('Заклинание сработало!')).toBeVisible();
  });

  test('секрет: первые слова любого программиста', async ({ page }) => {
    await page.goto('/#/level/js-01');
    await typeCode(page, "console.log('Hello, World!');\n");
    await cast(page);
    await expect(page.locator('.toast')).toContainText('Hello, World!');
  });

  test('Лавка Алхимика открывается после испытания Зала Оракула', async ({ page }) => {
    await page.goto('/#/land/script-gates');
    await page.getByRole('dialog', { name: 'Пролог: Зал Оракула' }).getByRole('button', { name: 'Пропустить' }).click();
    const shop = page.locator('.district', { hasText: 'Лавка Алхимика' });
    await expect(shop).toContainText('Откроется после испытания «Кошелёк героя» в районе «Зал Оракула».');
    await expect(shop.getByRole('link')).toHaveCount(0);
  });

  test.describe('Лавка Алхимика', () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() => {
        if (localStorage.getItem('cascadia.progress.v1')) return;
        const done = { completed: true, stars: 3, attempts: 1, hintsUsed: 0 };
        localStorage.setItem('cascadia.progress.v1', JSON.stringify({ 'js-08': done }));
      });
    });

    test('гости лавки: код проверяют два гостя, у каждого — своя вкладка', async ({ page }) => {
      await page.goto('/#/level/alch-07');
      await expect(page.getByRole('tab', { name: /Фея Лира/ })).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByRole('tab', { name: /Гном Бурр/ })).toBeVisible();

      await typeCode(page, "let guest = prompt('Как тебя зовут?');\nalert(`Добро пожаловать, ${guest}!`);\nconsole.log(`Гость: ${guest}`);\n");
      await expect(page.locator('.goals__head')).toHaveText(/8 из 8/);
      // У второго гостя свой ответ на prompt — и своё приветствие
      await page.getByRole('tab', { name: /Гном Бурр/ }).click();
      await expect(page.locator('.oracle-line--prompt')).toContainText('→ Бурр');
      await expect(page.locator('.oracle-line--alert')).toContainText('Добро пожаловать, Бурр!');
      await page.screenshot({ path: `${SCREENS}/32-shop-guests.png`, fullPage: true });
      await cast(page);
      await expect(page.getByText('Заклинание сработало!')).toBeVisible();
    });

    test('шаблон в обычных кавычках: проверка объясняет, где ошибка', async ({ page }) => {
      await page.goto('/#/level/alch-02');
      await typeCode(page, "let potion = 'Зелье силы';\nlet price = 12;\nlet tag = '${potion}: ${price} монет';\nconsole.log(tag);\n");
      await cast(page);
      const result = page.locator('.result__list');
      await expect(result).toContainText('подставляет значение только в шаблоне, в обратных кавычках');
      // Сама обратная кавычка видна — как код
      await expect(result.locator('code', { hasText: '`' })).toBeVisible();
    });

    test('испытание лавки: prompt отвечает строкой, и подарок склеивается', async ({ page }) => {
      await page.goto('/#/level/alch-08');
      await typeCode(
        page,
        "const price = 12;\nlet guest = prompt('Как тебя зовут?');\nlet count = prompt('Сколько зелий берёшь?');\nlet potions = count + 1;\nlet total = count * price;\nalert(`${guest}: зелий ${potions}, с тебя ${total} монет`);\n",
      );
      await cast(page);
      await expect(page.locator('.result__list')).toContainText("Фея Лира: В колбе count — '3' (строка), а нужно 3 (число).");
    });

    test('Врата Скриптории спасены: Руна Типов, злодей бежит в Лабиринт, грамота в летописи', async ({ page }) => {
      await page.addInitScript(() => {
        const done = { completed: true, stars: 3, attempts: 1, hintsUsed: 0 };
        const ids = ['js-01', 'js-02', 'js-03', 'js-04', 'js-05', 'js-06', 'js-07', 'js-08', 'alch-01', 'alch-02', 'alch-03', 'alch-04', 'alch-05', 'alch-06', 'alch-07'];
        if (!localStorage.getItem('cascadia.progress.v1')?.includes('alch-01')) {
          localStorage.setItem('cascadia.progress.v1', JSON.stringify(Object.fromEntries(ids.map((id) => [id, done]))));
        }
      });
      await page.goto('/#/level/alch-08');
      const solution = await page.evaluate<string>("import('/src/levels/alchemist-shop/alch-08.ts').then((m) => m.default.solutionJs)");
      await typeCode(page, solution);
      await expect(page.locator('.goals__head')).toHaveText(/12 из 12/);
      await cast(page);

      const outro = page.getByRole('dialog', { name: 'Эпилог: Лавка Алхимика' });
      await expect(outro).toBeVisible();
      await outro.getByRole('button', { name: 'Дальше →' }).click();
      await expect(outro).toContainText('Держи Руну Типов');
      await outro.getByRole('button', { name: 'Дальше →' }).click();
      await expect(outro).toContainText('Дальше — Лабиринт Решений');
      await outro.getByRole('button', { name: 'Дальше →' }).click();
      await outro.getByRole('button', { name: 'Закрыть' }).click();

      await page.goto('/#/chronicle');
      const chapter = page.locator('.chronicle__chapter', { hasText: 'Врата Скриптории' });
      await expect(chapter).toContainText('спасена');
      await expect(chapter.getByRole('link', { name: 'Грамота: Врата Скриптории' })).toBeVisible();
    });

    test('гримуар: пример prompt отвечает за гостя', async ({ page }) => {
      await page.addInitScript(() => {
        const done = { completed: true, stars: 3, attempts: 1, hintsUsed: 0 };
        if (!localStorage.getItem('cascadia.progress.v1')?.includes('alch-07')) {
          localStorage.setItem('cascadia.progress.v1', JSON.stringify({ 'js-08': done, 'alch-07': done }));
        }
      });
      await page.goto('/#/grimoire');
      const card = page.locator('.spell-card', { has: page.getByRole('heading', { name: 'prompt()' }) });
      await card.getByRole('button', { name: 'ответ «3»' }).click();
      await expect(card.locator('.oracle-line--prompt')).toContainText('→ 3');
      await expect(card.locator('.example__oracle')).toContainText('31');
      await card.getByRole('button', { name: 'Number', exact: true }).click();
      await expect(card.locator('.example__oracle')).toContainText('4');
    });

    test('секрет: банан из NaN', async ({ page }) => {
      await page.goto('/#/level/alch-05');
      await typeCode(page, "console.log(('b' + 'a' + + 'a' + 'a').toLowerCase());\n");
      await cast(page);
      await expect(page.locator('.toast')).toContainText('Банан');
    });
  });
});

test.describe('Лабиринт Решений', () => {
  /** Пройдены испытания: открыты все районы Лабиринта */
  async function unlockMaze(page: Page) {
    await page.addInitScript(() => {
      if (localStorage.getItem('cascadia.progress.v1')) return;
      const done = { completed: true, stars: 3, attempts: 1, hintsUsed: 0 };
      localStorage.setItem('cascadia.progress.v1', JSON.stringify({ 'if-08': done, 'loop-07': done }));
    });
  }

  test('герой идёт по приказам, а в стену — врезается', async ({ page }) => {
    await page.goto('/#/level/if-01');
    await expect(page.getByRole('heading', { name: 'Первые шаги' })).toBeVisible();
    await expect(page.locator('.dungeon-scene__status')).toContainText('Герой не дошёл до выхода: оставалось 5 шагов.');

    await typeCode(page, 'hero.step();\nhero.step();\nhero.step();\n');
    await expect(page.locator('.dungeon-scene__status')).toHaveText('Герой врезался в стену.');
    await expect(page.locator('.dungeon__bonk')).toBeVisible();
    await cast(page);
    await expect(page.locator('.result__list')).toContainText('Герой врезался в стену.');

    const solution = await page.evaluate<string>("import('/src/levels/forks/if-01.ts').then((m) => m.default.solutionJs)");
    await typeCode(page, solution);
    await expect(page.locator('.goals__head')).toHaveText(/1 из 1/);
    await expect(page.locator('.dungeon-scene__status')).toHaveText('Герой у выхода!');
    await page.screenshot({ path: `${SCREENS}/40-dungeon.png`, fullPage: true });
    await cast(page);
    await expect(page.getByText('Заклинание сработало!')).toBeVisible();
  });

  test('код проверяют в каждом подземелье: без if герой хватает воздух', async ({ page }) => {
    await page.goto('/#/level/if-02');
    await page.getByRole('tab', { name: /Без кристалла/ }).click();
    await expect(page.locator('.dungeon-scene__status')).toContainText('Под ногами нет кристалла — герой схватил воздух');
    await typeCode(page, 'hero.step();\nif (hero.isGem()) {\n  hero.take();\n}\nhero.step();\nhero.step();\nhero.step();\n');
    await expect(page.locator('.goals__head')).toHaveText(/3 из 3/);
    await expect(page.getByRole('tab', { name: /С кристаллом ✦/ })).toBeVisible();
    await cast(page);
    await expect(page.getByText('Заклинание сработало!')).toBeVisible();
  });

  test('после hero. редактор подсказывает приказы героя', async ({ page }) => {
    await page.goto('/#/level/if-01');
    await typeCode(page, '');
    await page.keyboard.type('hero.tu');
    const options = page.locator('.cm-tooltip-autocomplete li');
    await expect(options).toHaveCount(2);
    await expect(options.first()).toContainText('turnLeft');
    await expect(options.last()).toContainText('поворот направо');
    // Сразу после появления списка CodeMirror не принимает Enter — чтобы быстрый набор не вставил подсказку случайно
    await page.waitForTimeout(150);
    await page.keyboard.press('Enter');
    await expect(page.locator('.cm-content')).toContainText('hero.turnLeft()');
  });

  test('один знак = вместо === объясняется по-русски', async ({ page }) => {
    await page.goto('/#/level/if-04');
    await expect(page.locator('.dungeon-scene__status')).toContainText('Чтобы сравнить два значения, нужно ===');
  });

  test('приказ без скобок: условие с ним выполняется всегда', async ({ page }) => {
    await page.goto('/#/level/if-03');
    await typeCode(page, 'hero.step();\nif (hero.isWall) {\n  hero.turnLeft();\n  hero.step();\n} else {\n  hero.step();\n  hero.step();\n}\n');
    await cast(page);
    await expect(page.locator('.result__list li').first()).toContainText('hero.isWall без скобок — это сам вопрос, а не ответ на него');
  });

  test.describe('Карусель и Сердце', () => {
    test.beforeEach(async ({ page }) => {
      await unlockMaze(page);
    });

    test('звезда за краткость: лестницу можно пройти и без цикла, но с одной звездой меньше', async ({ page }) => {
      await page.goto('/#/level/loop-03');
      const step = 'hero.step();\nhero.turnLeft();\nhero.step();\nhero.turnRight();\n';
      await typeCode(page, step.repeat(4));
      await expect(page.locator('.dungeon-scene__lines')).toContainText('16 строк кода · для трёх звёзд уложись в 6');
      await cast(page);
      await expect(page.getByText('Заклинание сработало!')).toBeVisible();
      await expect(page.locator('.result__notes')).toContainText('16 строк кода, а можно уложиться в 6: −1 ★');

      await typeCode(page, `for (let i = 0; i < 4; i++) {\n${step}}\n`);
      await cast(page);
      await expect(page.getByRole('img', { name: '3 из 3 звёзд' }).last()).toBeVisible();
    });

    test('правило правой руки проходит все лабиринты, а финал земли дарит Руну Решений', async ({ page }) => {
      await page.addInitScript(() => {
        const done = { completed: true, stars: 3, attempts: 1, hintsUsed: 0 };
        const ids = ['if-01', 'if-02', 'if-03', 'if-04', 'if-05', 'if-06', 'if-07', 'if-08', 'loop-01', 'loop-02', 'loop-03', 'loop-04', 'loop-05', 'loop-06', 'loop-07', 'heart-01'];
        if (!localStorage.getItem('cascadia.progress.v1')?.includes('heart-01')) {
          localStorage.setItem('cascadia.progress.v1', JSON.stringify(Object.fromEntries(ids.map((id) => [id, done]))));
        }
      });
      await page.goto('/#/level/heart-02');
      const solution = await page.evaluate<string>("import('/src/levels/maze-heart/heart-02.ts').then((m) => m.default.solutionJs)");
      await typeCode(page, solution);
      await expect(page.locator('.goals__head')).toHaveText(/6 из 6/);
      await page.getByRole('tab', { name: /Большой/ }).click();
      await page.screenshot({ path: `${SCREENS}/41-maze-heart.png`, fullPage: true });
      await cast(page);

      const outro = page.getByRole('dialog', { name: 'Эпилог: Сердце лабиринта' });
      await expect(outro).toBeVisible();
      await outro.getByRole('button', { name: 'Дальше →' }).click();
      await expect(outro).toContainText('Держи Руну Решений');
      await outro.getByRole('button', { name: 'Дальше →' }).click();
      await expect(outro).toContainText('Я спрячусь в Мастерской Рецептов');
    });
  });

  test.describe('на телефоне', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('подземелье помещается по ширине', async ({ page }) => {
      await unlockMaze(page);
      await page.goto('/#/level/heart-01');
      await expect(page.locator('.dungeon')).toBeVisible();
      await expectNoHorizontalScroll(page);
    });
  });
});

test.describe('Мастерская Рецептов', () => {
  test('конвейер: рецепт без return отдаёт пустые флаконы, а с return — полные', async ({ page }) => {
    await page.goto('/#/level/fn-04');
    await expect(page.getByRole('heading', { name: 'Призрак Андефайнд' })).toBeVisible();
    await expect(page.locator('.call').first()).toContainText('triple(2)');
    await cast(page);
    await expect(page.locator('.result__list')).toContainText('triple(2) вернул пустоту (undefined), а ждали 6. Не забыл return?');
    await expect(page.locator('.call--wrong')).toHaveCount(3);

    await typeCode(page, 'function triple(n) {\n  return n * 3;\n}\n');
    await expect(page.locator('.call--ok')).toHaveCount(3);
    await expect(page.locator('.goals__head')).toHaveText(/3 из 3/);
    await page.screenshot({ path: `${SCREENS}/50-conveyor.png`, fullPage: true });
    await cast(page);
    await expect(page.getByText('Заклинание сработало!')).toBeVisible();
  });

  test('рецепта нет — флакон так и говорит', async ({ page }) => {
    await page.goto('/#/level/fn-03');
    await typeCode(page, '// пока пусто\n');
    await cast(page);
    await expect(page.locator('.result__list')).toContainText('Рецепта double нет: объяви функцию — function double(…) { … }');
  });

  test('массив на полке — обоз с номерами, объект — карточка', async ({ page }) => {
    await page.addInitScript(() => {
      if (localStorage.getItem('cascadia.progress.v1')) return;
      const done = { completed: true, stars: 3, attempts: 1, hintsUsed: 0 };
      localStorage.setItem('cascadia.progress.v1', JSON.stringify({ 'fn-08': done, 'arr-08': done }));
    });
    await page.goto('/#/level/arr-03');
    await typeCode(page, "let train = ['уголь', 'руда', 'шпион'];\ntrain.pop();\ntrain.push('кристаллы');\nconsole.log(train);\n");
    const wagons = page.locator('.flask', { hasText: 'train' }).locator('.wagon');
    await expect(wagons).toHaveCount(3);
    await expect(wagons.last()).toContainText("'кристаллы'2");

    await page.goto('/#/level/obj-02');
    await typeCode(page, "let potion = { name: 'Зелье силы', price: 12 };\npotion.price = 15;\npotion.stock = 3;\nconsole.log(potion);\n");
    const card = page.locator('.flask', { hasText: 'potion' }).locator('.card-value');
    await expect(card).toContainText('stock:3');
    await expect(page.locator('.goals__head')).toHaveText(/2 из 2/);
  });

  test('финал Мастерской: Руна Рецептов, а злодей бежит в Город Механизмов', async ({ page }) => {
    await page.addInitScript(() => {
      const done = { completed: true, stars: 3, attempts: 1, hintsUsed: 0 };
      const ids = [
        ...['fn-01', 'fn-02', 'fn-03', 'fn-04', 'fn-05', 'fn-06', 'fn-07', 'fn-08'],
        ...['arr-01', 'arr-02', 'arr-03', 'arr-04', 'arr-05', 'arr-06', 'arr-07', 'arr-08'],
        ...['obj-01', 'obj-02', 'obj-03', 'obj-04', 'obj-05'],
      ];
      if (!localStorage.getItem('cascadia.progress.v1')?.includes('obj-05')) {
        localStorage.setItem('cascadia.progress.v1', JSON.stringify(Object.fromEntries(ids.map((id) => [id, done]))));
      }
    });
    await page.goto('/#/level/obj-06');
    const solution = await page.evaluate<string>("import('/src/levels/card-index/obj-06.ts').then((m) => m.default.solutionJs)");
    await typeCode(page, solution);
    await expect(page.locator('.goals__head')).toHaveText(/3 из 3/);
    await cast(page);

    const outro = page.getByRole('dialog', { name: 'Эпилог: Картотека' });
    await expect(outro).toBeVisible();
    await outro.getByRole('button', { name: 'Дальше →' }).click();
    await expect(outro).toContainText('Держи Руну Рецептов');
    await outro.getByRole('button', { name: 'Дальше →' }).click();
    await expect(outro).toContainText('Город Механизмов — моё логово');
  });

  test.describe('на телефоне', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('конвейер с длинными вызовами помещается по ширине', async ({ page }) => {
      await page.addInitScript(() => {
        if (localStorage.getItem('cascadia.progress.v1')) return;
        const done = { completed: true, stars: 3, attempts: 1, hintsUsed: 0 };
        localStorage.setItem('cascadia.progress.v1', JSON.stringify({ 'fn-08': done, 'arr-08': done }));
      });
      await page.goto('/#/level/obj-06');
      await expect(page.locator('.call')).toHaveCount(3);
      await expectNoHorizontalScroll(page);
    });
  });
});

test.describe('Город Механизмов', () => {
  /** Испытания районов Города пройдены — гостю открыты все районы */
  async function unlockCity(page: Page, extra: string[] = []) {
    await page.addInitScript((ids) => {
      if (localStorage.getItem('cascadia.progress.v1')) return;
      const done = { completed: true, stars: 3, attempts: 1, hintsUsed: 0 };
      localStorage.setItem('cascadia.progress.v1', JSON.stringify(Object.fromEntries(ids.map((id) => [id, done]))));
    }, ['dom-06', 'ev-07', 'game-04', ...extra]);
  }

  test('Мастерская Квери: код меняет живую страницу, ошибка селектора объясняется', async ({ page }) => {
    await page.goto('/#/level/dom-01');
    await expect(page.getByRole('heading', { name: 'Вывеска' })).toBeVisible();
    const frame = page.frameLocator('.page-scene__page');
    await expect(frame.locator('.sign')).toHaveText('Закрыто навсегда');
    await expect(page.locator('.goals__head')).toHaveText(/0 из 1/);

    // Селектор без точки ничего не находит — querySelector вернул null
    await typeCode(page, "let sign = document.querySelector('sign');\nsign.textContent = 'Мастерская открыта';\n");
    await expect(page.locator('.page-scene__status')).toContainText('Если это querySelector — он ничего не нашёл');

    await typeCode(page, "let sign = document.querySelector('.sign');\nsign.textContent = 'Мастерская открыта';\n");
    await expect(frame.locator('.sign')).toHaveText('Мастерская открыта');
    await expect(page.locator('.goals__head')).toHaveText(/1 из 1/);
    await page.screenshot({ path: `${SCREENS}/60-mechanism-page.png`, fullPage: true });
    await cast(page);
    await expect(page.getByText('Заклинание сработало!')).toBeVisible();
  });

  test('рычаг: обработчик ждёт щелчка, а рецепт со скобками сработал бы сразу', async ({ page }) => {
    await unlockCity(page);
    await page.goto('/#/level/ev-01');
    const frame = page.frameLocator('.page-scene__page');
    const opener = "let lever = document.querySelector('.lever');\nlet gate = document.querySelector('.gate');\nfunction openGate() {\n  gate.classList.add('open');\n}\n";

    await typeCode(page, `${opener}lever.addEventListener('click', openGate());\n`);
    await cast(page);
    await expect(page.locator('.result__list')).toContainText('openGate() со скобками вызывает рецепт сразу');

    await typeCode(page, `${opener}lever.addEventListener('click', openGate);\n`);
    await expect(page.locator('.goals__head')).toHaveText(/2 из 2/);
    // Страница живая: ворота стоят, пока по рычагу не щёлкнули на самой сцене
    await expect(frame.locator('.gate')).not.toHaveClass(/open/);
    await frame.locator('.lever').click();
    await expect(frame.locator('.gate')).toHaveClass(/open/);
    await cast(page);
    await expect(page.getByText('Заклинание сработало!')).toBeVisible();
  });

  test('бесконечный цикл в обработчике останавливается, страница и игра живы', async ({ page }) => {
    await unlockCity(page);
    await page.goto('/#/level/ev-01');
    const frame = page.frameLocator('.page-scene__page');
    await typeCode(page, "let lever = document.querySelector('.lever');\nlever.addEventListener('click', () => {\n  while (true) {}\n});\n");
    await expect(page.locator('.goals__head')).toHaveText(/1 из 2/);
    await frame.locator('.lever').click();
    await expect(page.locator('.page-scene__status')).toContainText('Код работал слишком долго');
    await cast(page);
    await expect(page.locator('.result__list')).toContainText('похоже, где-то бесконечный цикл');
  });

  test('Логово: форма без preventDefault перезагружает страницу и всё стирает', async ({ page }) => {
    await unlockCity(page);
    await page.goto('/#/level/lair-01');
    const frame = page.frameLocator('.page-scene__page');
    await expect(page.locator('.goals')).toBeVisible();

    // Стартовый код Лорда Дефолта: письмо добавляется — и тут же пропадает вместе со страницей
    await frame.locator('.letter').fill('Сдавайся!');
    await frame.locator('.letter').press('Enter');
    await expect(page.locator('.page-scene__status')).toContainText('Форма перезагрузила страницу');
    await expect(frame.locator('.letters li')).toHaveCount(0);
    await cast(page);
    await expect(page.locator('.result__list')).toContainText('Форма перезагрузила страницу');

    const solution = await page.evaluate<string>("import('/src/levels/default-lair/lair-01.ts').then((m) => m.default.solutionJs)");
    await typeCode(page, solution);
    await expect(page.locator('.goals__head')).toHaveText(/2 из 2/);
    await frame.locator('.letter').fill('Город свободен');
    await frame.locator('.letter').press('Enter');
    await expect(frame.locator('.letters li')).toHaveText(['Город свободен']);
    await page.screenshot({ path: `${SCREENS}/61-default-lair.png`, fullPage: true });
    await cast(page);
    await expect(page.getByText('Заклинание сработало!')).toBeVisible();
  });

  test('Мастерская игр: готовую игру можно скачать — без обвязки тренажёра', async ({ page }) => {
    await unlockCity(page);
    await page.goto('/#/level/game-01');
    const solution = await page.evaluate<string>("import('/src/levels/game-workshop/game-01.ts').then((m) => m.default.solutionJs)");
    await typeCode(page, solution);
    await expect(page.locator('.goals__head')).toHaveText(/4 из 4/);

    const downloading = page.waitForEvent('download');
    await page.getByRole('button', { name: /Скачать игру/ }).click();
    const download = await downloading;
    expect(download.suggestedFilename()).toBe('clicker.html');
    const { readFile } = await import('node:fs/promises');
    const html = await readFile(await download.path(), 'utf8');
    expect(html).toContain('<button class="mine"');
    expect(html).toContain("mine.addEventListener('click'");
    expect(html).not.toContain('__harness');
    expect(html).not.toContain('__guard');
  });

  test('эпилог Логова без остальных земель: Руна Механизмов, но большого финала ещё нет', async ({ page }) => {
    await unlockCity(page, ['lair-01']);
    await page.goto('/#/level/lair-02');
    const solution = await page.evaluate<string>("import('/src/levels/default-lair/lair-02.ts').then((m) => m.default.solutionJs)");
    await typeCode(page, solution);
    await expect(page.locator('.goals__head')).toHaveText(/6 из 6/);
    await cast(page);

    const outro = page.getByRole('dialog', { name: 'Эпилог: Логово Лорда Дефолта' });
    await expect(outro).toContainText('Ты отменил… меня?!');
    for (let i = 0; i < 3; i++) await outro.getByRole('button', { name: 'Дальше →' }).click();
    await expect(outro).toContainText('Держи Руну Механизмов — последнюю руну Скриптории!');
    await outro.getByRole('button', { name: 'Закрыть' }).click();
    // Врата, Лабиринт и Мастерская не пройдены — Скриптория ещё не спасена
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('большой финал Скриптории: руны, Лорд Дефолт сдаётся, звание Магистра', async ({ page }) => {
    // Спасены все земли Скриптории, кроме последнего уровня Логова; Каскадия ещё ждёт
    await unlockCity(page, ['alch-08', 'heart-02', 'obj-06', 'lair-01']);
    await page.goto('/#/level/lair-02');
    const solution = await page.evaluate<string>("import('/src/levels/default-lair/lair-02.ts').then((m) => m.default.solutionJs)");
    await typeCode(page, solution);
    await expect(page.locator('.goals__head')).toHaveText(/6 из 6/);
    await cast(page);

    await page.getByRole('dialog', { name: 'Эпилог: Логово Лорда Дефолта' }).getByRole('button', { name: 'Пропустить' }).click();
    const finale = page.getByRole('dialog', { name: 'Финал: Магистр Скриптории' });
    await expect(finale).toContainText('Четыре руны Скриптории');
    await page.waitForTimeout(2600);
    await page.screenshot({ path: `${SCREENS}/62-scriptoria-runes.png` });
    await finale.getByRole('button', { name: 'Дальше →' }).click();
    await expect(finale).toContainText('Как же так?!');
    await finale.getByRole('button', { name: 'Дальше →' }).click();
    await expect(finale).toContainText('просто начало, с которого всё начинают');
    await finale.getByRole('button', { name: 'Дальше →' }).click();
    await expect(finale).toContainText('звание Магистра Скриптории, странник');
    await finale.getByRole('button', { name: 'Дальше →' }).click();
    // Каскадия не спасена — финал зовёт обратно за дверь
    await expect(finale).toContainText('проклятие Великого Сброса ещё держится в Долине Тегов');
    await page.screenshot({ path: `${SCREENS}/63-scriptoria-worlds.png` });
    await finale.getByRole('button', { name: 'Дальше →' }).click();
    await expect(finale).toContainText("console.log('Спасибо, странник!')");
    await finale.getByRole('button', { name: 'Закрыть' }).click();

    await page.goto('/#/chronicle');
    const chapter = page.locator('.chronicle__chapter', { hasText: 'Финал: Магистр Скриптории' });
    await expect(chapter.getByRole('button', { name: 'Смотреть финал' })).toBeVisible();
    await chapter.getByRole('link', { name: 'Грамота Магистра Скриптории' }).click();
    await expect(page.locator('.certificate__title')).toHaveText('Звание Магистра Скриптории');
    await expect(page.locator('.certificate')).toContainText('за спасение всех земель Скриптории');
    // Наставники всех земель Скриптории — без Лорда Дефолта
    await expect(page.locator('.certificate__mentors > *')).toHaveCount(10);
    await page.getByLabel('Имя на грамоте').fill('Ариэль');
    await page.screenshot({ path: `${SCREENS}/64-scriptoria-certificate.png`, fullPage: true });
  });

  test.describe('на телефоне', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('живая страница и кнопка скачивания помещаются по ширине', async ({ page }) => {
      await unlockCity(page);
      await page.goto('/#/level/game-02');
      await expect(page.frameLocator('.page-scene__page').locator('.mine')).toBeVisible();
      await expect(page.getByRole('button', { name: /Скачать игру/ })).toBeVisible();
      await expectNoHorizontalScroll(page);
    });
  });
});

test.describe('сбой страницы', () => {
  /** Подменить модуль компонента тем, что падает при отрисовке: так проверяется настоящий путь ошибки. */
  async function breakComponent(page: Page, name: string, message: string) {
    await page.route(`**/src/components/${name}.tsx*`, (route) =>
      route.fulfill({ contentType: 'text/javascript', body: `export function ${name}() { throw new Error('${message}'); }` }),
    );
  }

  test('сломанный экран не оставляет пустую страницу: шапка на месте, можно уйти на карту', async ({ page }) => {
    await breakComponent(page, 'GrimoireScreen', 'Тестовая поломка');
    await page.goto('/#/grimoire');
    await expect(page.getByRole('heading', { name: 'Здесь что-то сломалось' })).toBeVisible();
    await expect(page.locator('.crash__detail')).toContainText('Тестовая поломка');
    await expect(page.getByRole('link', { name: 'Гримуар' })).toBeVisible();
    // Гость не на уровне: сообщать некому
    await expect(page.getByRole('button', { name: 'Сообщить учителю' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Попробовать снова' }).click();
    await expect(page.getByRole('heading', { name: 'Здесь что-то сломалось' })).toBeVisible();
    await page.getByRole('link', { name: 'На карту' }).click();
    await expect(page.getByRole('heading', { name: 'Карта Каскадии' })).toBeVisible();
  });

  test('сломалась сама шапка: вся игра показывает экран сбоя и оживает после перезагрузки', async ({ page }) => {
    await breakComponent(page, 'TopBar', 'Шапка сломалась');
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Здесь что-то сломалось' })).toBeVisible();
    await expect(page.locator('.crash__detail')).toContainText('Шапка сломалась');
    await page.unroute('**/src/components/TopBar.tsx*');
    await page.getByRole('button', { name: 'Перезагрузить' }).click();
    await expect(page.getByRole('heading', { name: 'Карта Каскадии' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Гримуар' })).toBeVisible();
  });

  test.describe('на телефоне', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('экран сбоя помещается по ширине', async ({ page }) => {
      await breakComponent(page, 'GrimoireScreen', 'Очень-длинное-сообщение-об-ошибке-без-единого-пробела-которое-не-должно-распирать-страницу');
      await page.goto('/#/grimoire');
      await expect(page.getByRole('heading', { name: 'Здесь что-то сломалось' })).toBeVisible();
      await expectNoHorizontalScroll(page);
    });
  });
});
