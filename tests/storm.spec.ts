import { expect, test, type Page } from '@playwright/test';

async function typeCode(page: Page, code: string) {
  await page.locator('.cm-content').click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(code);
}

test('хаос-тест: раскладка «на глаз» держит основную сцену, но не шторм; настоящая — держит обе', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cascadia.settings.v1', JSON.stringify({ sound: false, effects: 'light', look: 'noir' }));
    localStorage.setItem('cascadia.stats.v1', JSON.stringify({ seen: { 'prologue:game': true } }));
  });
  await page.goto('/#/level/flex-03');
  await expect(page.getByRole('heading', { name: 'Равновесие' })).toBeVisible();

  // Под основной сценой — шторм с другим числом кристаллов, и Лорд Дефолт предупреждает о нём
  await expect(page.getByText('Обычная сцена')).toBeVisible();
  await expect(page.getByText('Шторм · кристаллов стало пять')).toBeVisible();
  await expect(page.getByText(/Лорд Дефолт грозит штормом/)).toBeVisible();
  await expect(page.locator('.scene__frame')).toHaveCount(2);

  // «Промежуток на глаз» под три кристалла даёт те же места, что и space-between, но при пяти кристаллах они сожмутся и сдвинутся
  const sizes = await page
    .frameLocator('.scene__frame')
    .first()
    .locator('.island')
    .evaluate((island) => ({ island: island.getBoundingClientRect().width, crystal: (island.querySelector('.crystal') as HTMLElement).getBoundingClientRect().width }));
  const gap = (sizes.island - 3 * sizes.crystal) / 2;
  await typeCode(page, `.island {
  display: flex;
  gap: ${gap}px;
}
`);
  await page.getByRole('button', { name: /Сотворить/ }).click();
  await expect(page.getByText('Заклинание не сработало')).toBeVisible();
  await expect(page.locator('.result__list')).toContainText('Шторм «кристаллов стало пять»');

  // space-between растягивает любое число кристаллов поровну
  await typeCode(page, '.island {\n  display: flex;\n  justify-content: space-between;\n}\n');
  await expect(page.getByText(/На месте: (\d+) из \1$/)).toBeVisible();
  await page.getByRole('button', { name: /Сотворить/ }).click();
  await expect(page.getByText('Заклинание сработало!')).toBeVisible();
});

/** Решение, подогнанное под обычную сцену, шторм ломает; настоящее решение держит обе сцены */
test('хаос-тест на новых уровнях: подгонка под три предмета проходит обычную сцену и проваливает шторм', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate<Record<string, { scene: boolean; storm: boolean }>>(`Promise.all([import('/src/engine/evaluate.ts'), import('/src/levels/index.ts')]).then(async ([evaluate, levels]) => {
    const level = (id) => levels.allLevels.find((item) => item.id === id);
    const run = async (id, css) => {
      const outcome = await evaluate.checkLevelCss(level(id), css);
      const inPlace = (storm) => outcome.items.filter((item) => (item.view?.tag === 'шторм') === storm).every((item) => item.inPlace);
      return { scene: inPlace(false), storm: inPlace(true) };
    };
    return {
      // «К правому краю» отступом: на всё свободное место, что остаётся от трёх кристаллов (456 минус три по 64)
      marginRight: await run('flex-02', '.island { display: flex; } .amethyst { margin-left: 264px; }'),
      rightReference: await run('flex-02', level('flex-02').solutionCss),
      // Порядок «по номерам»: у остальных кристаллов order остаётся нулевым, и они встают впереди Рубина
      orderByNumbers: await run('flex-10', '.island { display: flex; justify-content: center; align-items: center; } .ruby { order: 1; } .emerald { order: 2; } .amethyst { order: 3; }'),
      orderReference: await run('flex-10', level('flex-10').solutionCss),
      // Строки в пикселях под шесть стёкол (216 в долях 2 : 1): третьей строке не остаётся места
      rowsInPixels: await run('grid-03', '.window { display: grid; grid-template-columns: 1fr 1fr 1fr; grid-template-rows: 144px 72px; }'),
      rowsReference: await run('grid-03', level('grid-03').solutionCss),
    };
  })`);
  for (const naive of ['marginRight', 'orderByNumbers', 'rowsInPixels']) {
    expect.soft(result[naive], `${naive}: обычную сцену держит`).toMatchObject({ scene: true });
    expect.soft(result[naive], `${naive}: шторм ломает`).toMatchObject({ storm: false });
  }
  for (const honest of ['rightReference', 'orderReference', 'rowsReference']) {
    expect.soft(result[honest], `${honest}: держит обе сцены`).toEqual({ scene: true, storm: true });
  }
});
