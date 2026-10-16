import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'fn-05',
  title: 'Порядок ингредиентов',
  learns: 'arguments',
  dialog: [
    'Параметров может быть несколько — через запятую. При вызове значения встают в них по порядку: первое — в первый параметр, второе — во второй.',
    '`brewTime(3, 10)` — значит, `start` равен 3, а `end` — 10. Перепутаешь порядок — и время у зелья пойдёт назад.',
  ],
  task: 'Рецепт `brewTime(start, end)` должен вернуть, сколько минут варится зелье: от `start` до `end`. Лорд Дефолт перепутал вычитание — почини, чтобы флаконы показали 7, 5 и 8.',
  starterJs: `function brewTime(start, end) {
  return start - end;
}
`,
  solutionJs: `function brewTime(start, end) {
  return end - start;
}
`,
  check: {},
  calls: ['brewTime(3, 10)', 'brewTime(0, 5)', 'brewTime(12, 20)'],
  hints: [
    'Флаконы показывают минус: из меньшего вычитается большее.',
    'Сколько минут от начала до конца — из конца вычесть начало.',
    '`return end - start;`',
  ],
});
