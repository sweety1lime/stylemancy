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

const landPage = (page: Page) => page.frameLocator('iframe.land-frame__page');

interface Report {
  onlyPixel: string[];
  onlyNoir: string[];
  sizeMismatch: string[];
  missingLabels: string[];
  unknownInTexts: string[];
  blockProblems: string[];
  templateProblems: string[];
}

test('библиотека: в обоих видах одни и те же картинки одних и тех же размеров, а блоки и заготовки чистые', async ({ page }) => {
  await page.goto('/');
  const report = await page.evaluate<Report>(`Promise.all([
    import('/src/land/images.ts'), import('/src/land/pictures.ts'), import('/src/land/blocks.ts'),
    import('/src/land/templates.ts'), import('/src/land/sanitize.ts'), import('/src/engine/htmlLint.ts'),
    import('/src/engine/lint.ts'), import('/src/engine/htmlCheck.ts'),
  ]).then(([images, pictures, blocks, templates, sanitize, htmlLint, lint, htmlCheck]) => {
    const pixel = images.PIXEL_LAND_IMAGES;
    const noir = images.NOIR_LAND_IMAGES;
    const size = (url) => {
      const svg = decodeURIComponent(url.slice(url.indexOf(',') + 1));
      return /<svg[^>]*\\swidth="([\\d.]+)"/.exec(svg)?.[1] + 'x' + /<svg[^>]*\\sheight="([\\d.]+)"/.exec(svg)?.[1];
    };
    const names = (lib) => Object.keys(lib).sort();
    const report = {
      onlyPixel: names(pixel).filter((name) => !(name in noir)),
      onlyNoir: names(noir).filter((name) => !(name in pixel)),
      sizeMismatch: names(pixel).filter((name) => name in noir && size(pixel[name]) !== size(noir[name])).map((name) => name + ' ' + size(pixel[name]) + ' / ' + size(noir[name])),
      missingLabels: pictures.PICTURE_LABELS.map((item) => item.name).filter((name) => !(name in pixel)),
      unknownInTexts: [],
      blockProblems: [],
      templateProblems: [],
    };
    const used = (text) => [...text.matchAll(/src="([^"]+)"/g)].map((match) => match[1]).concat([...text.matchAll(/url\\(["']?([^)"']+)/g)].map((match) => match[1]));
    const errorsOf = (list) => list.filter((problem) => problem.severity === 'error').map((problem) => problem.message);

    for (const block of blocks.HTML_BLOCKS) {
      const safe = sanitize.sanitizeLand({ html: block.code, css: '' }, pixel);
      if (safe.notes.length) report.blockProblems.push(block.id + ': ' + safe.notes.join('; '));
      if (!safe.html.trim()) report.blockProblems.push(block.id + ': пусто после санитайзера');
      const errors = errorsOf(htmlLint.lintHtml(block.code, { svg: true }));
      if (errors.length) report.blockProblems.push(block.id + ': ' + errors.join('; '));
      for (const name of used(block.code)) if (!(name in pixel)) report.unknownInTexts.push(block.id + ': ' + name);
    }
    for (const block of blocks.CSS_BLOCKS) {
      const safe = sanitize.sanitizeLand({ html: '', css: block.code }, pixel);
      if (safe.notes.length) report.blockProblems.push(block.id + ': ' + safe.notes.join('; '));
      const properties = [...block.code.matchAll(/([a-z-]+)\\s*:/g)].map((match) => match[1]).filter((name) => name !== 'from' && name !== 'to');
      for (const property of properties) if (!safe.css.includes(property)) report.blockProblems.push(block.id + ': потерян ' + property);
      const errors = errorsOf(lint.lintCss(block.code).problems);
      if (errors.length) report.blockProblems.push(block.id + ': ' + errors.join('; '));
    }
    for (const template of templates.LAND_TEMPLATES) {
      const safe = sanitize.sanitizeLand({ html: template.html, css: template.css }, pixel);
      const add = (text) => report.templateProblems.push(template.id + ': ' + text);
      if (safe.notes.length) add(safe.notes.join('; '));
      if (template.html.length > 2000 || template.css.length > 2000) add('длиннее 2000 знаков: ' + template.html.length + ' и ' + template.css.length);
      const html = errorsOf(htmlLint.lintHtml(template.html, { svg: true }));
      if (html.length) add(html.join('; '));
      const doc = htmlCheck.parseMarkup(template.html);
      const css = lint.lintCss(template.css, { sceneDoc: doc }).problems;
      // Заготовка не должна подчёркиваться: ни ошибок, ни селекторов, которые ничего не находят
      if (css.length) add(css.map((problem) => problem.message).join('; '));
      for (const name of used(template.html + template.css)) if (!(name in pixel)) report.unknownInTexts.push(template.id + ': ' + name);
    }
    return report;
  })`);

  expect(report).toEqual({
    onlyPixel: [],
    onlyNoir: [],
    sizeMismatch: [],
    missingLabels: [],
    unknownInTexts: [],
    blockProblems: [],
    templateProblems: [],
  });
});

test('панель блоков: картинка, блок разметки и блок стилей встают в код, страница меняется', async ({ page }) => {
  await openedWorld(page);
  await page.goto('/#/my-land');
  await page.getByLabel('Ячейка 1: пусто').getByRole('button', { name: 'Чистый лист' }).click();
  const html = page.locator('.cm-content[aria-label="Редактор HTML"]');
  const css = page.locator('.cm-content[aria-label="Редактор CSS"]');
  await expect(html).toContainText('<h1>Моя земля</h1>');

  // Картинка: тег встаёт в код, а на странице появляется рисунок из библиотеки
  await page.getByRole('button', { name: 'Вставить картинку Дом (house.png)' }).click();
  await expect(html).toContainText('<img src="house.png" alt="Дом">');
  await expect(landPage(page).getByRole('img', { name: 'Дом' })).toBeVisible();
  expect(await landPage(page).getByRole('img', { name: 'Дом' }).evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);

  // Блок разметки
  await page.getByRole('button', { name: 'Блоки HTML' }).click();
  await page.getByRole('button', { name: /^Список/ }).click();
  await expect(html).toContainText('<li>Второй</li>');
  await expect(landPage(page).getByRole('listitem')).toHaveCount(3);

  // Блок стилей: открывается вкладка CSS, и страница темнеет
  await page.getByRole('button', { name: 'Блоки CSS' }).click();
  await page.getByRole('button', { name: /^Ночной фон/ }).click();
  await expect(page.getByRole('tab', { name: /style\.css/ })).toHaveAttribute('aria-selected', 'true');
  await expect(css).toContainText('background: #14102b;');
  await expect.poll(() => landPage(page).locator('body').evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(20, 16, 43)');
  // Фон у html не задан, поэтому фон body растекается на всю страницу, а не кончается там, где кончается текст
  expect(await landPage(page).locator('html').evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');

  // Второй блок стилей отделяется пустой строкой от первого
  await page.getByRole('button', { name: /^Текст по центру/ }).click();
  await expect(css).toContainText('text-align: center;');
  expect(await css.innerText()).toMatch(/}\n+\s*\n?h1,/);

  // Игра ничего не убирала из вставленного
  await expect(page.getByRole('region', { name: 'Что убрала игра' })).toHaveCount(0);
});

for (const [name, heading] of [
  ['Деревня', 'Деревня Лунного Света'],
  ['Ночное небо', 'Ночное небо'],
  ['Мой остров', 'Мой остров'],
] as const) {
  test(`заготовка «${name}»: открывается готовой страницей с картинками и без замечаний`, async ({ page }) => {
    await openedWorld(page);
    await page.goto('/#/my-land');
    await page.getByLabel('Ячейка 1: пусто').getByRole('button', { name }).click();
    await expect(landPage(page).getByRole('heading', { name: heading, level: 1 })).toBeVisible();
    const pictures = landPage(page).getByRole('img');
    await expect(pictures.first()).toBeVisible();
    expect(await pictures.evaluateAll((list) => list.every((img) => (img as HTMLImageElement).naturalWidth > 0))).toBe(true);
    await expect(page.getByRole('region', { name: 'Что убрала игра' })).toHaveCount(0);
    // Страница в обоих видах: те же картинки, та же раскладка
    await page.getByRole('link', { name: '← Мои земли' }).click();
    await expect(page.getByLabel(new RegExp(`Ячейка 1: ${heading}`))).toBeVisible();
  });
}

test('пиксельный вид: те же картинки из панели вставляются и рисуются', async ({ page }) => {
  await openedWorld(page, 'pixel');
  await page.goto('/#/my-land');
  await page.getByLabel('Ячейка 1: пусто').getByRole('button', { name: 'Мой остров' }).click();
  await expect(landPage(page).getByRole('img', { name: 'Башня' })).toBeVisible();
  await page.getByRole('button', { name: 'Вставить картинку Гриб (mushroom.png)' }).click();
  await expect(landPage(page).getByRole('img', { name: 'Гриб' })).toHaveCount(2);
});
