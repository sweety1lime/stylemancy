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
    localStorage.setItem('cascadia.progress.v1', JSON.stringify({ 'flex-13': done, 'grid-09': done, 'mq-04': done }));
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
});
