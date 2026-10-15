import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'disp-03',
  title: 'Указ глашатая',
  dialog: [
    'Глашатай читает указ, а каждое слово стоит на отдельной строке. Никто ничего не понимает!',
    'Слова указа — теги div, а div по умолчанию блочный. Строчный элемент, inline, течёт в строке, как слово в предложении.',
  ],
  task: 'Сделай слова указа `.word` строчными: `display: inline`. Пусть встанут в одну строку, как обычный текст.',
  html: `<div class="parade">
  <div class="decree">
    <div class="word" data-name="Слово «Слушайте»">Слушайте</div>
    <div class="word" data-name="Слово «все:»">все:</div>
    <div class="word" data-name="Слово «смотр»">смотр</div>
    <div class="word" data-name="Слово «в полдень!»">в полдень!</div>
  </div>
</div>`,
  starterCss: `.word {
  /* слова — в одну строку */
}
`,
  solutionCss: `.word {
  display: inline;
}
`,
  check: { items: '.word', groupName: 'слова' },
  hints: [
    'Сейчас каждое слово — блок: с новой строки и во всю ширину. Нужно, чтобы слова текли в строке, как `span` или `a`.',
    'Строчный элемент — `display: inline`. Не путай с `inline-block`: тот держит свои размеры, а строчному они не нужны.',
    '`display: inline;`',
  ],
  learns: 'display-inline',
});
