import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'alch-08',
  title: 'Испытание: Большой заказ',
  trial: true,
  dialog: [
    'Последнее испытание лавки — касса, и Лорд Дефолт с неё глаз не сводит. Гость называет имя и сколько зелий берёт, а ты считаешь, сколько с него.',
    'Зелье стоит 12 монет, и цена не меняется. К каждому заказу я дарю ещё одно зелье — в корзине на одно больше, чем куплено. И помни: `prompt` отвечает строкой.',
  ],
  task: 'Запечатай цену: `const price = 12`. Спроси имя гостя в `guest` и сколько зелий он берёт — в `count`, это должно быть число. В `potions` — на одно больше (подарок), в `total` — `count * price`. Скажи гостю окном `alert`: `Лира: зелий 4, с тебя 36 монет`.',
  starterJs: `// Касса лавки: имя гостя, сколько зелий берёт и сколько платит

`,
  solutionJs: `// Касса лавки: имя гостя, сколько зелий берёт и сколько платит
const price = 12;
let guest = prompt('Как тебя зовут?');
let count = Number(prompt('Сколько зелий берёшь?'));
let potions = count + 1;
let total = count * price;
alert(\`\${guest}: зелий \${potions}, с тебя \${total} монет\`);
`,
  check: { output: true, vars: ['count', 'potions', 'total'] },
  runs: [
    { label: 'Фея Лира', inputs: ['Лира', '3'] },
    { label: 'Гном Бурр', inputs: ['Бурр', '5'] },
  ],
  require: [{ pattern: '\\bconst\\s+price\\b', message: 'Цена не меняется — запечатай её: const price = 12;' }],
  hints: [
    'Сначала `const price = 12;`, потом два вопроса: имя — в `guest`, количество — в `count`.',
    '`prompt` отвечает строкой, и `\'3\' + 1` даёт `\'31\'`. Преврати ответ в число: `Number(prompt(\'Сколько зелий берёшь?\'))`.',
    '`let potions = count + 1;`, `let total = count * price;` и `` alert(`${guest}: зелий ${potions}, с тебя ${total} монет`); ``',
  ],
});
