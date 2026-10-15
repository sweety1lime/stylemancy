import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'sel-02',
  title: 'Мухоморы',
  dialog: [
    'Мухоморы должны гореть красным — пусть грибники обходят их стороной. А сейчас красные все грибы подряд!',
    'У каждого гриба есть метка — класс. Селектор по классу пишут с точкой: .mushroom найдёт все грибы, а у мухоморов есть ещё и свой класс.',
  ],
  task: 'Зажги красным только мухоморы: у них есть класс `amanita`. Селектор по классу начинается с точки.',
  html: `<div class="glade">
  <div class="mushroom amanita" data-name="Мухомор 1"></div>
  <div class="mushroom" data-name="Боровик 1"></div>
  <div class="mushroom amanita" data-name="Мухомор 2"></div>
  <div class="mushroom" data-name="Боровик 2"></div>
  <div class="mushroom amanita" data-name="Мухомор 3"></div>
</div>`,
  starterCss: `.mushroom {
  color: crimson;
}
`,
  solutionCss: `.amanita {
  color: crimson;
}
`,
  check: { items: '.mushroom', groupName: 'грибы', style: 'color' },
  hints: [
    'Загляни в HTML сцены: какой класс есть только у мухоморов?',
    'Селектор по классу — точка и имя класса: `.amanita`.',
    '`.amanita { color: crimson; }`',
  ],
  learns: 'selector-class',
});
