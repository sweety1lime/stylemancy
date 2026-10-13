import { expect, test } from '@playwright/test';

interface LevelReport {
  id: string;
  solutionPassed: boolean;
  starterPassed: boolean;
  solutionIssues: string[];
}

test('каждый уровень: эталон проходит, стартовый код — нет', async ({ page }) => {
  await page.goto('/');
  // Строка, а не функция: модули движка подгрузит и скомпилирует сам Vite
  const reports = await page.evaluate<LevelReport[]>(
    "import('/src/engine/selfCheck.ts').then((m) => m.checkAllLevels())",
  );

  expect(reports.length).toBeGreaterThan(0);
  for (const report of reports) {
    expect.soft(report.solutionPassed, `${report.id}: эталон не проходит — ${report.solutionIssues.join('; ')}`).toBe(true);
    expect.soft(report.solutionIssues, `${report.id}: к эталону есть замечания`).toEqual([]);
    expect.soft(report.starterPassed, `${report.id}: стартовый код уже проходит уровень`).toBe(false);
  }
});
