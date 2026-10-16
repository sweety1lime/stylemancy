import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'arr-02',
  title: 'Последний вагон',
  learns: 'length',
  dialog: [
    'У каждого обоза есть длина: `train.length` — сколько в нём вагонов. Обоз из трёх вагонов — длина 3.',
    'А номер последнего вагона на один меньше длины: вагоны-то считают с нуля. Значит, последний — `train[train.length - 1]`.',
  ],
  task: 'Лорд Дефолт испортил рецепт `last`: тот ищет вагон за хвостом обоза и находит пустоту. Почини — пусть возвращает груз последнего вагона в любом обозе.',
  starterJs: `function last(train) {
  return train[train.length];
}
`,
  solutionJs: `function last(train) {
  return train[train.length - 1];
}
`,
  check: {},
  calls: ["last(['уголь', 'руда', 'кристаллы'])", "last(['мёд'])", 'last([1, 2, 3, 4, 5])'],
  hints: [
    'В обозе из трёх вагонов длина 3, а вагона с номером 3 нет: номера 0, 1 и 2.',
    'Последний номер — на один меньше длины.',
    '`return train[train.length - 1];`',
  ],
});
