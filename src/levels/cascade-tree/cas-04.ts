import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'cas-04',
  title: 'Наследство дуба',
  dialog: [
    'Есть в лесу закон старше каскада — наследство. Некоторые свойства дети берут у родителей: покрась дерево — и всё, что внутри, станет того же цвета. color наследуется.',
    'Но свой цвет всегда сильнее наследства. Лорд Дефолт заколдовал один лист — дал ему свой серый. Расколдовать его можно словом inherit: «возьми цвет у родителя».',
  ],
  task: 'Покрась Великий дуб золотом (`gold`) одним правилом для `.tree` — светлячок, листья и гриб внутри возьмут цвет сами. А заколдованному листу `.cursed` скажи взять цвет родителя: `color: inherit`. Гриб на поляне не трогай.',
  html: `<div class="glade">
  <div class="tree" data-name="Великий дуб">
    <div class="firefly" data-name="Светлячок"></div>
    <div class="leaf" data-name="Лист"></div>
    <div class="leaf cursed" data-name="Заколдованный лист"></div>
    <div class="mushroom" data-name="Гриб под дубом"></div>
  </div>
  <div class="mushroom" data-name="Гриб на поляне"></div>
</div>`,
  lockedCss: `.cursed {
  color: gray;
}
`,
  starterCss: `.tree {
  /* одно правило — на весь дуб */
}
`,
  solutionCss: `.tree {
  color: gold;
}

/* Заколдованный лист берёт цвет у родителя */
.tree .cursed {
  color: inherit;
}
`,
  check: { items: '.tree, .firefly, .leaf, .mushroom', style: 'color' },
  require: [
    {
      pattern: 'color\\s*:\\s*inherit',
      message: 'Заколдованный лист должен взять цвет у родителя — это значение inherit.',
    },
  ],
  hints: [
    'Не пиши правило для каждого предмета: дети наследуют `color` от родителя. А у заколдованного листа свой цвет из чар — его надо перебить.',
    'Чары `.cursed` ниже твоего кода, поэтому одного класса мало: `.tree .cursed` — два класса.',
    '`.tree { color: gold; }` и `.tree .cursed { color: inherit; }`',
  ],
  learns: 'inheritance',
});
