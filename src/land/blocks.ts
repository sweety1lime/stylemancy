/** Готовый кусок кода для панели «Блоки и картинки»: по клику встаёт в редактор, а дальше игрок правит его сам */
export interface LandBlock {
  id: string;
  name: string;
  /** Одной строкой: что это и что с ним делать дальше */
  hint: string;
  code: string;
}

export const HTML_BLOCKS: LandBlock[] = [
  {
    id: 'header',
    name: 'Шапка',
    hint: 'Заголовок страницы и подпись под ним',
    code: '<header>\n  <h1>Название земли</h1>\n  <p>Короткое описание</p>\n</header>',
  },
  {
    id: 'menu',
    name: 'Меню-якоря',
    hint: 'Ссылки, которые прокручивают к разделам. У раздела должен быть такой же id',
    code: '<nav>\n  <a href="#about">О земле</a>\n  <a href="#people">Жители</a>\n</nav>',
  },
  {
    id: 'section',
    name: 'Раздел',
    hint: 'Заголовок и абзац. Добавь id, чтобы на раздел вела ссылка меню',
    code: '<section id="about">\n  <h2>Заголовок раздела</h2>\n  <p>Здесь текст раздела.</p>\n</section>',
  },
  {
    id: 'list',
    name: 'Список',
    hint: 'Пункты по порядку: <ul> с маркерами, <ol> с номерами',
    code: '<ul>\n  <li>Первый</li>\n  <li>Второй</li>\n  <li>Третий</li>\n</ul>',
  },
  {
    id: 'card',
    name: 'Карточка',
    hint: 'Картинка с подписью',
    code: '<figure>\n  <img src="house.png" alt="Дом">\n  <figcaption>Подпись к картинке</figcaption>\n</figure>',
  },
  {
    id: 'cards',
    name: 'Три карточки',
    hint: 'Три карточки в общей коробке: потом выстрой их в ряд или сетку через CSS',
    code: '<div class="cards">\n  <figure>\n    <img src="tree.png" alt="Дерево">\n    <figcaption>Дерево</figcaption>\n  </figure>\n  <figure>\n    <img src="mushroom.png" alt="Гриб">\n    <figcaption>Гриб</figcaption>\n  </figure>\n  <figure>\n    <img src="lantern.png" alt="Фонарь">\n    <figcaption>Фонарь</figcaption>\n  </figure>\n</div>',
  },
  {
    id: 'quote',
    name: 'Цитата',
    hint: 'Слова жителя земли',
    code: '<blockquote>\n  <p>Слова жителя земли.</p>\n  <cite>Имя жителя</cite>\n</blockquote>',
  },
  {
    id: 'table',
    name: 'Таблица',
    hint: 'Строки <tr>, ячейки <td>, заголовки <th>',
    code: '<table>\n  <tr>\n    <th>Житель</th>\n    <th>Ремесло</th>\n  </tr>\n  <tr>\n    <td>Тимофей</td>\n    <td>Пекарь</td>\n  </tr>\n</table>',
  },
  {
    id: 'svg',
    name: 'Свой рисунок (svg)',
    hint: 'Прямоугольник, круг и треугольник: меняй числа и цвета, и картинка изменится',
    code: '<svg viewBox="0 0 100 60" width="200" height="120">\n  <rect x="0" y="0" width="100" height="60" fill="#14102b"/>\n  <circle cx="30" cy="30" r="14" fill="#ffd479"/>\n  <path d="M50 50 L70 20 L90 50 Z" fill="#4b3a9b"/>\n</svg>',
  },
  {
    id: 'footer',
    name: 'Подвал',
    hint: 'Нижняя строка страницы',
    code: '<footer>\n  <p>Построено в Стилемантии</p>\n</footer>',
  },
];

export const CSS_BLOCKS: LandBlock[] = [
  {
    id: 'night',
    name: 'Ночной фон',
    hint: 'Тёмный фон страницы и светлый текст',
    code: 'body {\n  background: #14102b;\n  color: #e9e3ff;\n  font-family: Georgia, serif;\n}',
  },
  {
    id: 'center',
    name: 'Текст по центру',
    hint: 'Выровнять заголовки и подпись по центру',
    code: 'h1,\nh2 {\n  text-align: center;\n}',
  },
  {
    id: 'frame',
    name: 'Рамка',
    hint: 'Рамка со скруглёнными углами и отступом внутри',
    code: 'section {\n  padding: 16px;\n  border: 2px solid #4b3a9b;\n  border-radius: 12px;\n}',
  },
  {
    id: 'sky',
    name: 'Градиент неба',
    hint: 'Плавный переход цвета сверху вниз. Работает для коробки с классом sky',
    code: '.sky {\n  padding: 24px;\n  background: linear-gradient(#0b0820, #3a2a78);\n}',
  },
  {
    id: 'glow',
    name: 'Свечение',
    hint: 'Мягкое сияние вокруг картинок',
    code: 'img {\n  filter: drop-shadow(0 0 8px #ffd479);\n}',
  },
  {
    id: 'row',
    name: 'Ряд (flex)',
    hint: 'Дети коробки с классом cards встают в один ряд с промежутками',
    code: '.cards {\n  display: flex;\n  justify-content: center;\n  gap: 16px;\n}',
  },
  {
    id: 'grid',
    name: 'Сетка (grid)',
    hint: 'Три одинаковые колонки у коробки с классом cards',
    code: '.cards {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 16px;\n}',
  },
  {
    id: 'hover',
    name: 'Реакция на мышь',
    hint: 'Ссылки и картинки тускнеют, когда на них наводят мышь',
    code: 'a:hover,\nimg:hover {\n  opacity: 0.7;\n}',
  },
  {
    id: 'twinkle',
    name: 'Мерцание',
    hint: 'Анимация: у элементов с классом star меняется прозрачность',
    code: '@keyframes twinkle {\n  from {\n    opacity: 0.4;\n  }\n  to {\n    opacity: 1;\n  }\n}\n\n.star {\n  animation: twinkle 1.6s ease-in-out infinite alternate;\n}',
  },
  {
    id: 'phone',
    name: 'На телефоне в столбик',
    hint: 'Адаптив: на узком экране коробка с классом cards складывается в столбик',
    code: '@media (max-width: 480px) {\n  .cards {\n    flex-direction: column;\n  }\n}',
  },
];
