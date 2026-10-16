import { expect, test } from '@playwright/test';

interface Case {
  code: string;
  /** Ожидаемые сообщения (кусок текста); пустой список — ошибок и предупреждений нет */
  expect: string[];
  /** Что подчёркнуто в редакторе у первого ожидаемого сообщения */
  mark?: string;
}

const CASES: Case[] = [
  { code: "console.log('Привет, Скриптория!');", expect: [] },
  { code: 'let name = "Аня";\nconsole.log(`Привет, ${name}!`);', expect: [] },
  { code: 'console.log("Привет)', expect: ['Строка не закрыта: не хватает кавычки "'] },
  { code: 'console.log(«Привет»)', expect: ['Кавычки «ёлочки» JavaScript не понимает'], mark: '«' },
  { code: "Console.log('x')", expect: ['Console пишется с маленькой буквы: console'], mark: 'Console' },
  { code: "consle.log('x')", expect: ['consle — может, console?'], mark: 'consle' },
  { code: "cоnsole.log('x')", expect: ['В имени «cоnsole» есть русская буква «о»'] },
  { code: "console.lg('x')", expect: ['У console нет команды lg — может, log?'], mark: 'lg' },
  { code: "print('x')", expect: ['В JavaScript вместо print пишут console.log(…).'] },
  { code: 'let gems = 5;\nlet gems = 6;', expect: ['Переменная gems уже объявлена выше'] },
  { code: "let 2ndGem = 'ruby';", expect: ['Имя переменной не может начинаться с цифры'], mark: '2ndGem' },
  { code: 'let 2gems = 5;', expect: ['Имя переменной не может начинаться с цифры'], mark: '2gems' },
  { code: 'let magic power = 100;', expect: ['В имени переменной не может быть пробела: «magic power»', 'magicPower'] },
  { code: 'let magicPower = 100;\nconsole.log(magic power);', expect: ['«magic power» — может, magicPower?'] },
  { code: 'const price;', expect: ['Запечатанную колбу (const) нужно наполнить сразу'] },
  { code: 'console.log(gems);', expect: ['Переменная gems не объявлена'], mark: 'gems' },
  { code: 'let x = 5;\nconsole.log(X);', expect: ['X — может, x? В JavaScript большие и маленькие буквы различаются.'] },
  { code: 'console.log(1', expect: ['Не закрыта скобка «(» из строки 1'] },
  { code: "console.log('x'))", expect: ['Лишняя скобка «)»'] },
  { code: 'let x = 5 console.log(x)', expect: ['Между «5» и «console» чего-то не хватает'] },
  { code: '5 = gems;', expect: ['Слева от = должно стоять имя переменной'] },
  { code: "let words = 'abc';\nconsole.log(words.lenght);", expect: ['lenght — может, length?'] },
  { code: '/* заметка\nconsole.log(1)', expect: ['Комментарий не закрыт'] },
  { code: 'gems = 5;', expect: ['Колба gems создаётся без let'] },
  { code: "let имя = 'Аня';", expect: ['Русские имена переменных JavaScript понимает, но так не принято'] },
  {
    code: 'let gems = 5;\ngems + 3;',
    expect: ['gems + 3 посчитано, но никуда не налито — колба gems не изменилась. Чтобы долить её, пиши gems = gems + 3;'],
    mark: 'gems + 3',
  },
  { code: 'let gems = 5;\ngems == 8;', expect: ['gems == 8 — это сравнение, и его ответ пропадает'] },
  { code: "'use strict';\nlet gems = 5;\ngems += 3;\nconsole.log(gems);", expect: [] },
  // Путь героя
  { code: 'while (!hero.isWall()) {\n  hero.step();\n}', expect: [] },
  { code: 'hero.stp();', expect: ['У героя нет приказа stp — может, step?'], mark: 'stp' },
  { code: 'hero.turnleft();', expect: ['может, turnLeft? Большие и маленькие буквы различаются.'] },
  { code: 'heor.step();', expect: ['heor — может, hero?'] },
  { code: 'hero.step;', expect: ['hero.step без скобок — приказ не выполнится. Пиши hero.step()'], mark: 'hero.step' },
  { code: 'if (hero.isWall) {\n  hero.turnLeft();\n}', expect: ['hero.isWall без скобок — это сам вопрос, а не ответ на него'] },
];

test('проверка JS объясняет типичные ошибки до запуска', async ({ page }) => {
  await page.goto('/');
  const results = await page.evaluate(
    `import('/src/engine/jsLint.ts').then((m) => ${JSON.stringify(CASES)}.map((c) => m.lintJs(c.code).problems.map((p) => ({ message: p.message, mark: c.code.slice(p.from, p.to) }))))`,
  );
  CASES.forEach((item, i) => {
    const problems = (results as { message: string; mark: string }[][])[i];
    const messages = problems.map((problem) => problem.message);
    if (!item.expect.length) {
      expect.soft(messages, `«${item.code}» — без замечаний`).toEqual([]);
      return;
    }
    for (const part of item.expect) {
      expect.soft(messages.some((message) => message.includes(part)), `«${item.code}»: ждём «${part}», есть: ${messages.join(' | ')}`).toBe(true);
    }
    if (item.mark !== undefined) {
      const first = problems.find((problem) => problem.message.includes(item.expect[0]));
      expect.soft(first?.mark, `«${item.code}»: подчёркнуто`).toBe(item.mark);
    }
  });
});

interface RuntimeCase {
  code: string;
  expect: string;
  /** На какой строке код остановился */
  line?: number;
}

const RUNTIME: RuntimeCase[] = [
  { code: 'const price = 12;\nprice = 10;', expect: 'Колба price запечатана: она объявлена через const', line: 2 },
  { code: 'console.log(gems);\nlet gems = 5;', expect: 'Колба gems используется раньше, чем создана', line: 1 },
  { code: 'let hero = null;\nconsole.log(hero.length);', expect: 'Пытаешься взять «length» у пустоты — значение null', line: 2 },
  // Строку не проверяем: V8 бросает переполнение стека то на вызове, то на входе в функцию
  { code: 'function echo() {\n  echo();\n}\necho();', expect: 'Функция вызывает сама себя без конца' },
];

test('ошибки во время работы — по-русски и с местом в коде', async ({ page }) => {
  await page.goto('/');
  const results = await page.evaluate(`Promise.all([import('/src/engine/jsRun.ts'), import('/src/engine/jsLint.ts')]).then(([run, lint]) =>
    Promise.all(${JSON.stringify(RUNTIME)}.map(async (c) => {
      const result = await run.runScript(c.code);
      if (!result.error) return null;
      const problem = lint.runtimeProblem(c.code, result.error);
      return { message: problem.message, line: c.code.slice(0, problem.from).split('\\n').length };
    })))`);
  RUNTIME.forEach((item, i) => {
    const found = (results as ({ message: string; line: number } | null)[])[i];
    expect.soft(found?.message, `«${item.code}»`).toContain(item.expect);
    if (item.line !== undefined) expect.soft(found?.line, `«${item.code}»: строка`).toBe(item.line);
  });
});

test('Оракул и колбы: вывод, типы, prompt и остановка бесконечного цикла', async ({ page }) => {
  await page.goto('/');
  const results = await page.evaluate(`import('/src/engine/jsRun.ts').then((m) => Promise.all([
    m.runScript("let gems = 5;\\nlet word = '5';\\nlet sum = '7' + 5;\\nlet ok = true;\\nlet empty;\\nconsole.log('Кристаллов:', gems);", { vars: ['gems', 'word', 'sum', 'ok', 'empty', 'missing'] }),
    m.runScript("let name = prompt('Как тебя зовут?');\\nalert('Привет, ' + name);", { inputs: ['Аня'] }),
    m.runScript('while (true) {}', { timeout: 500 }),
  ]))`);
  const [shelf, guest, loop] = results as {
    output: { kind: string; text: string; answer?: string | null }[];
    flasks: Record<string, { declared: boolean; type?: string; shown?: string }>;
    timedOut?: boolean;
  }[];

  expect(shelf.output).toEqual([{ kind: 'log', text: 'Кристаллов: 5' }]);
  // Цвет колбы — тип: '5' и 5 — разные вещи, а '7' + 5 склеивается в строку
  expect(shelf.flasks.gems).toMatchObject({ declared: true, type: 'number', shown: '5' });
  expect(shelf.flasks.word).toMatchObject({ declared: true, type: 'string', shown: "'5'" });
  expect(shelf.flasks.sum).toMatchObject({ type: 'string', shown: "'75'" });
  expect(shelf.flasks.ok).toMatchObject({ type: 'boolean', shown: 'true' });
  expect(shelf.flasks.empty).toMatchObject({ declared: true, type: 'undefined' });
  expect(shelf.flasks.missing).toEqual({ declared: false });

  expect(guest.output).toEqual([
    { kind: 'prompt', text: 'Как тебя зовут?', answer: 'Аня' },
    { kind: 'alert', text: 'Привет, Аня' },
  ]);
  expect(loop.timedOut).toBe(true);
});

test('герой в подземелье: путь, кристаллы и остановки', async ({ page }) => {
  await page.goto('/');
  const results = await page.evaluate(`import('/src/engine/jsRun.ts').then((m) => Promise.all([
    m.runScript('hero.step();\\nhero.take();\\nhero.step();\\nhero.turnRight();\\nhero.step();', { world: ['#####', '#>g.#', '###E#', '#####'] }),
    m.runScript('hero.step();\\nhero.step();', { world: ['####', '#>.#', '####'] }),
    m.runScript('hero.take();', { world: ['####', '#>E#', '####'] }),
    m.runScript('hero.step();', { world: ['####', '#>b#', '####'] }),
    m.runScript("console.log(hero.look(), hero.isWall(), hero.read === undefined);\\nhero.zap();\\nhero.step();\\nhero.step();\\nconsole.log(hero.read(), hero.atExit());", { world: ['#####', '#>b3#', '#####'] }),
    m.runScript('while (true) { hero.turnLeft(); }', { world: ['###', '#>#', '###'] }),
  ]))`);
  const [walk, wall, air, bite, sensors, spin] = results as {
    output: { text: string }[];
    hero: { x: number; y: number; dir: string; gems: number; gemsLeft: number; atExit: boolean; events: { kind: string }[]; failure?: { message: string } };
  }[];

  expect(walk.hero).toMatchObject({ x: 3, y: 2, dir: 'v', gems: 1, gemsLeft: 0, atExit: true });
  expect(walk.hero.events.map((event) => event.kind)).toEqual(['step', 'take', 'step', 'turn', 'step']);
  expect(wall.hero.failure?.message).toBe('Герой врезался в стену.');
  expect(wall.hero).toMatchObject({ x: 2, y: 1 });
  expect(air.hero.failure?.message).toContain('герой схватил воздух');
  expect(bite.hero.failure?.message).toContain('Герой наступил на баг');
  expect(sensors.output.map((line) => line.text)).toEqual(['bug false false', '3 false']);
  expect(sensors.hero.failure).toBeUndefined();
  expect(spin.hero.failure?.message).toContain('Герой выбился из сил');
});
