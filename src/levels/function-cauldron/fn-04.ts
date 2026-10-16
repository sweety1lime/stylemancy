import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'fn-04',
  title: 'Призрак Андефайнд',
  dialog: [
    'Беда! На кухню пробрался Призрак Андефайнд, подручный Лорда Дефолта. Рецепт `triple` теперь говорит ответ Оракулу, а котлу не отдаёт ничего — флаконы уезжают пустыми.',
    '`console.log` только показывает значение на свитке. Отдаёт результат один `return`. Рецепт без `return` возвращает `undefined` — пустую колбу, как раз то, что Призрак и любит.',
  ],
  task: 'Почини рецепт `triple`: пусть он возвращает число втрое больше, а не говорит его Оракулу. Флаконы на конвейере должны наполниться.',
  starterJs: `function triple(n) {
  console.log(n * 3);
}
`,
  solutionJs: `function triple(n) {
  return n * 3;
}
`,
  check: {},
  calls: ['triple(2)', 'triple(7)', 'triple(10)'],
  hints: [
    'Свиток показывает числа, а флаконы пустые: рецепт говорит, но не отдаёт.',
    'Замени `console.log(…)` на `return …`.',
    '`return n * 3;`',
  ],
});
