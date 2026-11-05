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

test('окно сценки не дрожит: на невысоком экране нет прокрутки, высота текста не меняется при печати', async ({ page }) => {
  // Типичный ноутбук: окно браузера низкое, и окно сценки должно уместиться без прокрутки
  await page.setViewportSize({ width: 1366, height: 768 });
  const dialog = await openPrologue(page, 'full');
  const window_ = dialog.locator('.story__window');
  const textHeight = () => dialog.locator('.story__text').evaluate((el) => el.getBoundingClientRect().height);
  const fits = () => window_.evaluate((el) => el.scrollHeight <= el.clientHeight);

  for (let i = 0; i < 4; i++) {
    expect(await fits()).toBe(true);
    // Реплика только начала печататься, и её высота уже такая же, как у целой
    const typing = await textHeight();
    await dialog.locator('.story__text').click();
    expect(await textHeight()).toBe(typing);
    expect(await fits()).toBe(true);
    await dialog.getByRole('button', { name: /Дальше →|К карте/ }).click();
  }
});

test('звук включается прямо в сценке: верхняя панель под ней закрыта', async ({ page }) => {
  const dialog = await openPrologue(page, 'full', false);
  const toggle = dialog.getByRole('button', { name: 'Звук' });
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('cascadia.settings.v1') ?? '{}').sound)).toBe(true);
});

test('карта: панорама видна на первом экране ноутбука, подробный абзац свёрнут', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.addInitScript(() => localStorage.setItem('cascadia.stats.v1', JSON.stringify({ seen: { 'prologue:game': true } })));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Карта Каскадии' })).toBeVisible();
  // Раньше карта начиналась на y≈485 и была видна на треть; гостю шапка и плашка занимают меньше трети экрана
  const top = await page.locator('.world-map').evaluate((el) => el.getBoundingClientRect().top);
  expect(top).toBeLessThan(300);
  await expect(page.getByRole('link', { name: 'Летопись героя' })).toBeVisible();
  // Длинный рассказ про Лорда Дефолта и дверь <script> лежит под спойлером
  await expect(page.getByText('загадочная дверь')).toBeHidden();
  await page.locator('.world__more summary').click();
  await expect(page.getByText('загадочная дверь')).toBeVisible();
});

/** Следим за переходами между экранами: сколько раз начались, было ли у острова имя для «влёта» и не отменил ли их браузер */
async function spyOnTransitions(page: Page, effects: 'full' | 'light') {
  await page.addInitScript((fx) => {
    // Как у живого игрока: без флага автотеста
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    localStorage.setItem('cascadia.settings.v1', JSON.stringify({ sound: false, effects: fx, look: 'noir', effectsChosen: true }));
    localStorage.setItem('cascadia.stats.v1', JSON.stringify({ seen: { 'prologue:game': true, 'intro:floating-lands': true } }));
    const spy = { started: 0, named: false, ready: null as boolean | null };
    (window as unknown as { __vt: typeof spy }).__vt = spy;
    if (!document.startViewTransition) return;
    const start = document.startViewTransition.bind(document);
    document.startViewTransition = (callback) => {
      spy.started++;
      spy.named = Boolean(document.querySelector('[style*="land-art"]'));
      const transition = start(callback);
      transition.ready.then(
        () => (spy.ready = true),
        () => (spy.ready = false),
      );
      return transition;
    };
  }, effects);
  return () => page.evaluate(() => (window as unknown as { __vt: { started: number; named: boolean; ready: boolean | null } }).__vt);
}

test('переходы: клик по земле начинает один «влёт», в лёгком режиме экраны меняются сразу', async ({ page }) => {
  const spy = await spyOnTransitions(page, 'full');
  await page.goto('/');
  await page.getByRole('link', { name: /Парящие земли/ }).click();
  await expect(page.getByRole('heading', { name: 'Парящие острова' })).toBeVisible();
  await expect.poll(async () => (await spy()).ready).toBe(true);
  // Один переход на два подписчика адреса, и остров, на который нажали, был назван для «влёта»
  expect(await spy()).toMatchObject({ started: 1, named: true, ready: true });
});

test('переходы: в лёгком режиме экраны меняются сразу, без снимков страницы', async ({ page }) => {
  const spy = await spyOnTransitions(page, 'light');
  await page.goto('/');
  await page.getByRole('link', { name: /Парящие земли/ }).click();
  await expect(page.getByRole('heading', { name: 'Парящие острова' })).toBeVisible();
  expect((await spy()).started).toBe(0);
});

/** Победа на первом уровне: решение введено, «Сотворить» нажато. Вдох живёт 340 мс, поэтому за слоем эффектов следит наблюдатель */
async function winFirstLevel(page: Page, effects: 'full' | 'light') {
  await page.addInitScript((fx) => {
    localStorage.setItem('cascadia.settings.v1', JSON.stringify({ sound: false, effects: fx, look: 'noir', effectsChosen: true }));
    localStorage.setItem('cascadia.stats.v1', JSON.stringify({ seen: { 'prologue:game': true, 'intro:floating-lands': true } }));
    const seen = { dim: false, rings: 0 };
    (window as unknown as { __fx: typeof seen }).__fx = seen;
    new MutationObserver((records) => {
      for (const node of records.flatMap((record) => [...record.addedNodes])) {
        if (!(node instanceof HTMLElement)) continue;
        if (node.classList.contains('noir-dim')) seen.dim = true;
        if (node.classList.contains('noir-ring')) seen.rings++;
      }
    }).observe(document, { childList: true, subtree: true });
  }, effects);
  await page.goto('/#/level/flex-01');
  await expect(page.getByText('На месте: 1 из 3')).toBeVisible();
  await page.keyboard.type('display: flex;');
  await expect(page.getByText('На месте: 3 из 3')).toBeVisible();
  await page.getByRole('button', { name: /Сотворить/ }).click();
  await expect(page.getByText('Заклинание сработало!')).toBeVisible();
  return () => page.evaluate(() => (window as unknown as { __fx: { dim: boolean; rings: number } }).__fx);
}

test('победа в «Сумраке»: свет сначала гаснет и возвращается, камера подаётся вперёд, панель проявляется', async ({ page }) => {
  const seen = await winFirstLevel(page, 'full');
  // Вдох перед вспышкой и ровно одно кольцо света
  expect(await seen()).toEqual({ dim: true, rings: 1 });
  // Сцена наезжает, а панель результата проявляется плавно
  await expect
    .poll(() => page.locator('.scene').evaluate((el) => el.getAnimations().some((a) => JSON.stringify((a.effect as KeyframeEffect).getKeyframes()).includes('scale(1.025)'))))
    .toBe(true);
  expect(await page.locator('.result--success').evaluate((el) => getComputedStyle(el).animationName)).toBe('noir-result-in');
});

test('победа в лёгком режиме: ни вдоха, ни кольца, панель без движения', async ({ page }) => {
  const seen = await winFirstLevel(page, 'light');
  expect(await seen()).toEqual({ dim: false, rings: 0 });
  expect(await page.locator('.scene').evaluate((el) => el.getAnimations().length)).toBe(0);
});
