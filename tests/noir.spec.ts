import { expect, test, type Locator, type Page } from '@playwright/test';

/** Код сцены уровня: оформление вида лежит в <style id="look"> внутри iframe */
const lookCss = (frame: HTMLIFrameElement) => frame.contentDocument?.getElementById('look')?.textContent ?? '';

test('вид «Сумрак» по умолчанию: переключатель, карта и уровень Парящих островов', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('dialog', { name: 'Пролог: Великий Сброс' }).getByRole('button', { name: 'Пропустить' }).click();
  // «Сумрак» — вид по умолчанию; переключатель с луной возвращает прежний пиксель-арт и обратно
  await expect(page.locator('html')).toHaveClass(/look-noir/);
  await page.getByRole('button', { name: 'Вид «Сумрак»' }).click();
  await expect(page.locator('html')).not.toHaveClass(/look-noir/);
  await page.getByRole('button', { name: 'Вид «Сумрак»' }).click();
  await expect(page.locator('html')).toHaveClass(/look-noir/);
  // Земли на карте — силуэты скал с эмблемами, герой — силуэт на шарнирах
  await expect(page.locator('.noir-land').first()).toBeVisible();
  await expect(page.locator('.land__hero--noir')).toBeVisible();

  // Сцена уровня в «Сумраке», а проверка решения работает как обычно: оформление не двигает предметы
  await page.goto('/#/level/flex-01');
  await expect(page.getByRole('heading', { name: 'Пробуждение' })).toBeVisible();
  await expect.poll(() => page.locator('.scene__frame').first().evaluate(lookCss)).toContain('.island');
  await expect(page.getByText('На месте: 1 из 3')).toBeVisible();
  await page.keyboard.type('display: flex;');
  await expect(page.getByText('На месте: 3 из 3')).toBeVisible();
  await page.getByRole('button', { name: /Сотворить/ }).click();
  await expect(page.getByText('Заклинание сработало!')).toBeVisible();
  await expect(page.locator('.hero--noir')).toBeVisible();

  // Выбор вида хранится в настройках этого компьютера
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/look-noir/);
  await expect(page.locator('.hero--noir')).toBeVisible();
});

test('вид «Сумрак» в Крепости Блоков: свой слой оформления, проверка блочной модели не сбита', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cascadia.settings.v1', JSON.stringify({ sound: false, effects: 'light', look: 'noir' }));
    localStorage.setItem('cascadia.stats.v1', JSON.stringify({ seen: { 'prologue:game': true } }));
  });
  await page.goto('/#/level/box-01');
  await expect(page.getByRole('heading', { name: 'Ящик по мерке' })).toBeVisible();
  await expect.poll(() => page.locator('.scene__frame').first().evaluate(lookCss)).toContain('.barracks');
  await expect(page.getByText('На месте: 0 из 1')).toBeVisible();
  // Оформление меняет только картинки: ящик нужного размера встаёт на место, как в пиксельном виде
  await page.locator('.cm-content').click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText('.crate { width: 160px; height: 96px; }');
  await expect(page.getByText('На месте: 1 из 1')).toBeVisible();
});

test('слабый компьютер: игра сама включает лёгкие эффекты и говорит об этом', async ({ page }) => {
  // Как у живого игрока: без флага автотеста. Каждый кадр рисуется 60 мс — меньше 24 кадров в секунду
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    localStorage.setItem('cascadia.stats.v1', JSON.stringify({ seen: { 'prologue:game': true } }));
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (callback) =>
      raf((time) => {
        const end = performance.now() + 60;
        while (performance.now() < end) {
          // Тяжёлый кадр: компьютер не успевает
        }
        callback(time);
      });
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/effects-light/, { timeout: 20_000 });
  await expect(page.getByText('Включены лёгкие эффекты')).toBeVisible();
});

/** Настройки до загрузки страницы: вид «Сумрак» и нужные эффекты */
async function openPrologue(page: Page, effects: 'full' | 'light', sound = false) {
  await page.addInitScript(
    ([fx, snd]) => localStorage.setItem('cascadia.settings.v1', JSON.stringify({ sound: snd, effects: fx, look: 'noir' })),
    [effects, sound] as const,
  );
  await page.goto('/');
  const dialog = page.getByRole('dialog', { name: 'Пролог: Великий Сброс' });
  await expect(dialog).toBeVisible();
  return dialog;
}

const cameraAnimation = (dialog: Locator) => dialog.locator('.story-art__cam').evaluate((el) => getComputedStyle(el).animationName);

test('сценка в «Сумраке»: шторки, титр, камера, кадры перетекают друг в друга', async ({ page }) => {
  // Часы стоят: старый кадр живёт меньше секунды, и на занятой машине проверка опоздала бы
  await page.clock.install();
  const dialog = await openPrologue(page, 'full');
  await page.clock.pauseAt(Date.now() + 1000);
  await expect(dialog.locator('.story__bar')).toHaveCount(2);
  await expect(dialog.locator('.story__titlecard')).toHaveText('Пролог: Великий Сброс');
  // Камера движется: на слое с рисунком идёт медленный наезд
  expect(await cameraAnimation(dialog)).toBe('story-cam');

  await dialog.getByRole('button', { name: 'Дальше →' }).click();
  // Прошлый кадр остаётся под новым, пока тот проявляется, а потом уходит. Титр был только на первом кадре
  await expect(dialog.locator('.story__shot--out')).toHaveCount(1);
  await expect(dialog.locator('.story__titlecard')).toHaveCount(0);
  await page.clock.runFor(1000);
  await expect(dialog.locator('.story__shot')).toHaveCount(1);
  await expect(dialog.locator('.story__shot--out')).toHaveCount(0);
  await expect(dialog.locator('.story__caption--villain')).toBeVisible();
});

test('сценка в лёгком режиме: без камеры и титра, кадры сменяются склейкой', async ({ page }) => {
  const dialog = await openPrologue(page, 'light');
  await expect(dialog.locator('.story__titlecard')).toBeHidden();
  expect(await cameraAnimation(dialog)).toBe('none');

  await dialog.getByRole('button', { name: 'Дальше →' }).click();
  await expect(dialog.locator('.story__shot')).toHaveCount(1);
  await expect(dialog.locator('.story__shot--out')).toHaveCount(0);
});

test('сценка со звуком: у реплик есть голоса, ошибок нет', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const dialog = await openPrologue(page, 'full', true);
  await dialog.getByRole('button', { name: 'Дальше →' }).click();
  // Реплика Лорда Дефолта печатается медленнее остальных, но до конца доходит
  await expect(dialog.locator('.story__text')).toContainText('блоки друг под другом!', { timeout: 15_000 });
  expect(errors).toEqual([]);
});

/** Сколько раз за звуком фона сходили на сервер; модуль с адресом файла Vite отдаёт сразу, его не считаем */
function watchAmbience(page: Page): string[] {
  const requested: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'fetch' && request.url().includes('dark_place')) requested.push(request.url());
  });
  return requested;
}

test('фон под сценкой: пока звук выключен, файл не скачивается', async ({ page }) => {
  const requested = watchAmbience(page);
  const dialog = await openPrologue(page, 'full', false);
  await expect(dialog.locator('.story__titlecard')).toBeVisible();
  await page.waitForTimeout(1000);
  expect(requested).toEqual([]);
});

test('фон под сценкой: со звуком файл скачивается', async ({ page }) => {
  const requested = watchAmbience(page);
  await openPrologue(page, 'full', true);
  await expect.poll(() => requested.length, { timeout: 10_000 }).toBeGreaterThan(0);
});
