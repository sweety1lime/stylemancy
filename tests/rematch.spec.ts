import { expect, test, type Page } from '@playwright/test';

async function typeCode(page: Page, code: string) {
  await page.locator('.cm-content').click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(code);
}

const cast = (page: Page) => page.getByRole('button', { name: /Сотворить/ }).click();

test('реванш Лорда Дефолта: после испытания башни он трижды ломает сцену, код остаётся, победа даёт опыт один раз', async ({ page }) => {
  await page.addInitScript(() => {
    // Только при первой загрузке: после перезагрузки прогресс и победа в реванше должны помниться
    if (localStorage.getItem('cascadia.progress.v1')) return;
    localStorage.setItem('cascadia.settings.v1', JSON.stringify({ sound: false, effects: 'light', look: 'noir' }));
    // Победную сценку района отдельно смотреть не нужно: она закрыла бы экран
    localStorage.setItem('cascadia.stats.v1', JSON.stringify({ seen: { 'prologue:game': true, 'outro:watchtower': true } }));
    const done = { completed: true, stars: 3, attempts: 1, hintsUsed: 0 };
    const ids = ['flex-13', 'grid-09', 'mq-04', 'tag-07', 'fair-08', 'sem-07', 'box-08', 'disp-05', 'sel-10', 'ps-06', 'pos-01', 'pos-02', 'pos-03', 'pos-04', 'pos-05'];
    localStorage.setItem('cascadia.progress.v1', JSON.stringify(Object.fromEntries(ids.map((id) => [id, done]))));
  });
  await page.goto('/#/level/pos-06');
  await expect(page.getByRole('heading', { name: 'Испытание: Ночной дозор' })).toBeVisible();

  // Пока испытание не пройдено, реванша нет
  await expect(page.getByRole('button', { name: /Реванш/ })).toHaveCount(0);
  const stages = await page.evaluate<string[]>("import('/src/levels/watchtower/pos-06.ts').then((m) => m.default.rematch.stages.map((stage) => stage.solutionCss))");
  const base = await page.evaluate<string>("import('/src/levels/watchtower/pos-06.ts').then((m) => m.default.solutionCss)");
  await typeCode(page, base);
  await expect(page.getByText('На месте: 4 из 4')).toBeVisible();
  await cast(page);
  await expect(page.getByText('Заклинание сработало!')).toBeVisible();

  // Принимаем бой: сцена та же, код остался прежним, а Лорд Дефолт ломает флаг и сам говорит вместо наставника
  await page.getByRole('button', { name: 'Реванш: Дефолт ломает башню' }).click();
  await expect(page.getByRole('group', { name: 'Лорд Дефолт: натиск 1 из 3' })).toBeVisible();
  await expect(page.getByText('Один `position: static`'.replace(/`/g, ''))).toBeVisible();
  await expect(page.locator('.cm-content')).toContainText('top: -48px');
  await expect(page.getByText('На месте: 4 из 4')).toHaveCount(0);

  // Пока сцена сломана, заклинание не срабатывает, но уровню попытка не засчитывается
  await cast(page);
  await expect(page.getByText('Заклинание не сработало')).toBeVisible();

  for (const [index, solution] of stages.entries()) {
    await typeCode(page, solution);
    await expect(page.getByText('На месте: 4 из 4')).toBeVisible();
    await cast(page);
    if (index < stages.length - 1) {
      await expect(page.getByRole('heading', { name: 'Натиск отбит!' })).toBeVisible();
      await page.getByRole('button', { name: 'Дальше: новый удар' }).click();
      await expect(page.getByRole('group', { name: `Лорд Дефолт: натиск ${index + 2} из 3` })).toBeVisible();
    }
  }
  await expect(page.getByRole('heading', { name: 'Лорд Дефолт повержен!' })).toBeVisible();
  await expect(page.getByText('+30 XP')).toBeVisible();

  // Опыт за победу — один раз: во второй раз бой проходится, но награды нет
  await page.reload();
  await page.getByRole('button', { name: /Сотворить/ }).waitFor();
  await typeCode(page, base);
  await cast(page);
  await page.getByRole('button', { name: 'Реванш: Дефолт ломает башню' }).click();
  for (const [index, solution] of stages.entries()) {
    await typeCode(page, solution);
    await cast(page);
    if (index < stages.length - 1) await page.getByRole('button', { name: 'Дальше: новый удар' }).click();
  }
  await expect(page.getByRole('heading', { name: 'Лорд Дефолт повержен!' })).toBeVisible();
  await expect(page.getByText('+30 XP')).toHaveCount(0);
});

test('самопроверка реванша ловит натиск, который ничего не ломает, эталон, который его не проходит, и пустые подсказки', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate<Record<string, string[]>>(`Promise.all([import('/src/engine/selfCheck.ts'), import('/src/levels/index.ts')]).then(async ([check, levels]) => {
    const level = levels.allLevels.find((item) => item.id === 'pos-06');
    const broken = (patch) => ({ ...level, rematch: { ...level.rematch, stages: level.rematch.stages.map((stage, i) => (i === 0 ? { ...stage, ...patch } : stage)) } });
    return {
      honest: await check.checkRematch(level),
      noCurse: await check.checkRematch(broken({ lockedCss: '' })),
      wrongAnswer: await check.checkRematch(broken({ solutionCss: '.tower { position: relative; }' })),
      fewHints: await check.checkRematch(broken({ hints: ['одна'] })),
    };
  })`);
  expect(result.honest).toEqual([]);
  expect(result.noCurse.join('|')).toContain('Натиск 1 реванша: решение прошлого шага его уже проходит, натиск ничего не ломает');
  // Эталон всегда совпадает со своей сценой, поэтому подводит его только проверка кода: здесь пропал обязательный приём уровня
  expect(result.wrongAnswer.join('|')).toContain('Натиск 1 реванша: Фонарь должен держаться за окно');
  expect(result.fewHints.join('|')).toContain('Натиск 1 реванша: меньше двух подсказок');
});
