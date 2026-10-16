import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'if-01',
  title: 'Первые шаги',
  learns: 'hero',
  dialog: [
    'Стой! Я — Страж Иф, хранитель Развилок. Дальше идут только те, кто умеет командовать героем.',
    'Приказы героя: `hero.step()` — шаг вперёд, `hero.turnLeft()` и `hero.turnRight()` — поворот налево и направо. Поворачивается герой на месте, без шага.',
  ],
  task: 'Проведи героя по коридору к выходу — светящейся арке. Налево и направо считай от героя: куда он смотрит, показывает золотая стрелка.',
  starterJs: `// Веди героя к выходу: hero.step() — шаг, hero.turnLeft() и hero.turnRight() — повороты
hero.step();
`,
  solutionJs: `// Веди героя к выходу: hero.step() — шаг, hero.turnLeft() и hero.turnRight() — повороты
hero.step();
hero.step();
hero.turnRight();
hero.step();
hero.step();
hero.turnLeft();
hero.step();
hero.step();
`,
  check: {},
  dungeons: [{ map: ['#######', '#>..###', '###.###', '###..E#', '#######'] }],
  hints: [
    'Сначала два шага вперёд — до поворота коридора.',
    'Коридор уходит вниз. Герой смотрит вправо, значит, вниз — это направо от него: `hero.turnRight()`.',
    'Два шага, `hero.turnRight()`, два шага, `hero.turnLeft()` и ещё два шага.',
  ],
});
