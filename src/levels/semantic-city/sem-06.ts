import { defineHtmlLevel } from '../../engine/define';

export default defineHtmlLevel({
  id: 'sem-06',
  title: 'Картина в рамке',
  dialog: [
    'В ратуше висит карта города с подписью. Но подпись живёт отдельным абзацем — непонятно, к чему она относится.',
    'Картинку вместе с подписью оборачивают в <figure>, а саму подпись пишут тегом <figcaption>. Это не alt: подпись видна всем.',
  ],
  task: 'Оберни картинку и подпись в `<figure>`, а подпись сделай `<figcaption>` вместо абзаца.',
  starterHtml: `<h2>Карта города</h2>
<img src="map.png" alt="Карта Города Семантики">
<p>Красный крестик — ратуша</p>
`,
  solutionHtml: `<h2>Карта города</h2>
<figure>
  <img src="map.png" alt="Карта Города Семантики">
  <figcaption>Красный крестик — ратуша</figcaption>
</figure>
`,
  goals: [
    { label: 'Картинка внутри `<figure>`', selector: 'figure > img' },
    { label: 'Подпись `<figcaption>` «Красный крестик — ратуша»', selector: 'figure > figcaption', text: 'Красный крестик — ратуша' },
    { label: 'Отдельного абзаца с подписью не осталось', selector: 'p', count: 0 },
  ],
  hints: [
    '`<figure>` — рамка вокруг картинки и её подписи.',
    'Абзац `<p>` с подписью превращается в `<figcaption>` и переезжает внутрь `<figure>`, после картинки.',
    '`<figure><img src="map.png" alt="…"><figcaption>Красный крестик — ратуша</figcaption></figure>`',
  ],
  learns: 'figure',
});
