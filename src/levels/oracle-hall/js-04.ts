import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'js-04',
  title: 'Доливаем колбу',
  learns: 'assignment',
  dialog: [
    'Колба — не камень: в неё можно долить. Только `let` второй раз не пиши — колба уже есть. Новое значение наливают знаком `=`.',
    '`gems = gems + 3;` — возьми то, что в колбе, прибавь 3 и налей обратно. Справа от `=` — что налить, слева — куда.',
  ],
  task: 'В колбе `gems` уже 5 кристаллов, и Оракул это сказал. Долей ещё 3 и покажи колбу снова: на свитке должно быть `5`, потом `8`. Не наливай 8 готовым числом.',
  starterJs: `let gems = 5;
console.log(gems);
// Долей 3 кристалла и покажи колбу снова

`,
  solutionJs: `let gems = 5;
console.log(gems);
// Долей 3 кристалла и покажи колбу снова
gems = gems + 3;
console.log(gems);
`,
  check: { output: true, vars: ['gems'] },
  reject: [{ pattern: '\\b8\\b', message: 'Не наливай 8 готовым числом — прибавь 3 к тому, что уже в колбе: gems = gems + 3.' }],
  hints: [
    'Новое значение наливают через `=`, без `let`.',
    'Справа от `=` можно взять старое значение: `gems + 3`.',
    '`gems = gems + 3;` и снова `console.log(gems);`',
  ],
});
