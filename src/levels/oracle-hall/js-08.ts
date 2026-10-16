import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'js-08',
  title: 'Испытание: Кошелёк героя',
  trial: true,
  dialog: [
    'Лорд Дефолт уверен, что Скриптория онемела. Докажи, что нет: наполни колбы сам — без моих заготовок.',
    'Герой заходит в лавку зелий. Цена зелья не меняется никогда, а монеты в кошельке — меняются.',
  ],
  task: 'Запечатай цену: `const price = 12`. Монеты героя — `let coins = 50`. Герой берёт `potions = 3` зелья. Покажи монеты до покупки, вычти из `coins` стоимость покупки (`price * potions`) и покажи монеты после: Оракул скажет `50`, потом `14`.',
  starterJs: `// Лавка зелий: цена, монеты, покупка

`,
  solutionJs: `// Лавка зелий: цена, монеты, покупка
const price = 12;
let coins = 50;
let potions = 3;
console.log(coins);
coins = coins - price * potions;
console.log(coins);
`,
  check: { output: true, vars: ['price', 'coins', 'potions'] },
  require: [{ pattern: '\\bconst\\s+price\\b', message: 'Цена не меняется — запечатай её: const price = 12;' }],
  reject: [{ pattern: '\\b(14|36)\\b', message: 'Не пиши готовые числа — пусть Оракул посчитает: coins - price * potions.' }],
  hints: [
    'Сначала три колбы: `const price`, `let coins`, `let potions`. Потом покажи `coins` Оракулу.',
    'Вычесть стоимость: `coins = coins - price * potions;` — умножение выполняется раньше вычитания, как в математике.',
    '`const price = 12;` `let coins = 50;` `let potions = 3;` `console.log(coins);` `coins = coins - price * potions;` `console.log(coins);`',
  ],
});
