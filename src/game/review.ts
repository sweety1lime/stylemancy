import { allLevels } from '../levels';
import type { LevelProgress } from './progress';
import { SPELLS } from './spells';
import { stats } from './stats';

export interface ReviewQuestion {
  id: string;
  /** Ключ заклинания в SPELLS */
  spell: string;
  prompt: string;
  /** Первый вариант — правильный; на экране варианты перемешиваются */
  options: string[];
  explain: string;
}

export const QUESTIONS: ReviewQuestion[] = [
  {
    id: 'df-1',
    spell: 'display-flex',
    prompt: 'Что делает `display: flex` с дочерними элементами?',
    options: ['Выстраивает их вдоль главной оси — по умолчанию в ряд', 'Прячет их', 'Растягивает контейнер на весь экран', 'Делает их одинакового цвета'],
    explain: 'Флекс-контейнер выстраивает дочерние элементы вдоль главной оси, а по умолчанию она горизонтальная.',
  },
  {
    id: 'jc-1',
    spell: 'justify-content',
    prompt: 'Какое свойство распределяет элементы вдоль главной оси?',
    options: ['justify-content', 'align-items', 'flex-wrap', 'gap'],
    explain: '`justify-content` — вдоль главной оси, `align-items` — поперёк.',
  },
  {
    id: 'jc-2',
    spell: 'justify-content',
    prompt: 'Как прижать элементы ряда к правому краю контейнера?',
    options: ['justify-content: flex-end', 'align-items: flex-end', 'flex-wrap: wrap', 'order: 1'],
    explain: 'В ряду главная ось горизонтальная, поэтому к правому краю ведёт `justify-content: flex-end`.',
  },
  {
    id: 'sb-1',
    spell: 'space-between',
    prompt: 'При `justify-content: space-between` крайние элементы…',
    options: ['прижаты к краям контейнера', 'стоят по центру', 'отступают от краёв на половину промежутка', 'переносятся на новую строку'],
    explain: 'Свободное место делится только между элементами, поэтому крайние стоят вплотную к краям.',
  },
  {
    id: 'align-1',
    spell: 'align-items',
    prompt: 'В ряду (`flex-direction: row`) `align-items` двигает элементы…',
    options: ['по вертикали', 'по горизонтали', 'по диагонали', 'никуда — только меняет размер'],
    explain: 'В ряду поперечная ось вертикальная, а `align-items` работает именно поперёк главной оси.',
  },
  {
    id: 'align-2',
    spell: 'align-items',
    prompt: 'Какое значение `align-items` растягивает элементы на всю высоту контейнера?',
    options: ['stretch', 'center', 'flex-end', 'baseline'],
    explain: '`stretch` растягивает элементы поперёк главной оси, если у них не задан размер.',
  },
  {
    id: 'fc-1',
    spell: 'flex-centering',
    prompt: 'Как поставить элемент точно в центр флекс-контейнера?',
    options: ['justify-content: center и align-items: center', 'только justify-content: center', 'text-align: center', 'margin: center'],
    explain: 'Центр нужен по обеим осям, значит, нужны оба свойства.',
  },
  {
    id: 'fd-1',
    spell: 'flex-direction',
    prompt: 'Какое значение `flex-direction` выстроит элементы столбиком сверху вниз?',
    options: ['column', 'row', 'column-reverse', 'wrap'],
    explain: '`column` поворачивает главную ось вертикально; `column-reverse` — тоже столбик, но снизу вверх.',
  },
  {
    id: 'fa-1',
    spell: 'flex-axes',
    prompt: 'У контейнера `flex-direction: column`. Куда теперь двигает элементы `justify-content`?',
    options: ['по вертикали', 'по горизонтали', 'никуда', 'по диагонали'],
    explain: 'В столбике главная ось вертикальная, а `justify-content` всегда работает вдоль главной оси.',
  },
  {
    id: 'gap-1',
    spell: 'gap',
    prompt: 'Где `gap` создаёт пустое место?',
    options: ['только между соседними элементами', 'между элементами и у краёв контейнера', 'только у краёв контейнера', 'внутри каждого элемента'],
    explain: '`gap` — это промежутки между соседями; у краёв контейнера пустоты не появляется.',
  },
  {
    id: 'fw-1',
    spell: 'flex-wrap',
    prompt: 'Что будет с элементами, которым не хватает места в ряду, при `flex-wrap: nowrap`?',
    options: ['сожмутся, чтобы влезть в одну строку', 'перейдут на новую строку', 'исчезнут', 'выстроятся столбиком'],
    explain: '`nowrap` — значение по умолчанию: строка одна, поэтому элементы сжимаются.',
  },
  {
    id: 'or-1',
    spell: 'order',
    prompt: 'У всех элементов `order: 0`, а у одного — `order: -1`. Где он окажется?',
    options: ['первым', 'последним', 'посередине', 'там же, где в HTML'],
    explain: 'Элементы выстраиваются по возрастанию `order`, и −1 меньше 0.',
  },
  {
    id: 'as-1',
    spell: 'align-self',
    prompt: 'Чем `align-self` отличается от `align-items`?',
    options: ['действует на один элемент, а не на все', 'работает вдоль главной оси', 'задаётся контейнеру', 'ничем'],
    explain: '`align-self` пишут самому элементу — он перекрывает `align-items` контейнера только для себя.',
  },
  {
    id: 'fg-1',
    spell: 'flex-grow',
    prompt: 'Что делает `flex-grow: 1` у одного элемента ряда?',
    options: ['отдаёт ему всё свободное место', 'увеличивает шрифт', 'ставит его первым', 'переносит его на новую строку'],
    explain: 'Элемент с `flex-grow` растёт и забирает свободное место в контейнере.',
  },
  {
    id: 'gc-1',
    spell: 'grid-columns',
    prompt: 'Сколько колонок получится у сетки с `grid-template-columns: 100px 50px 100px`?',
    options: ['три', 'две', 'одна шириной 250px', 'сто'],
    explain: 'Каждое значение через пробел — отдельная колонка.',
  },
  {
    id: 'gc-2',
    spell: 'grid-columns',
    prompt: 'У контейнера только `display: grid`, без колонок. Как встанут его дети?',
    options: ['друг под другом, в одну колонку', 'в ряд', 'в сетку 3 на 3', 'исчезнут'],
    explain: 'Пока колонки не заданы, у сетки одна колонка — элементы стоят столбиком.',
  },
  {
    id: 'fr-1',
    spell: 'fr',
    prompt: 'Колонки `1fr 3fr`. Какую часть ширины займёт вторая?',
    options: ['три четверти', 'треть', 'половину', '3 пикселя'],
    explain: 'Всего долей 1 + 3 = 4, второй колонке достаются три из четырёх.',
  },
  {
    id: 'gr-1',
    spell: 'grid-rows',
    prompt: 'Какое свойство задаёт высоты строк сетки?',
    options: ['grid-template-rows', 'grid-template-columns', 'grid-row', 'line-height'],
    explain: '`grid-template-rows` перечисляет высоты строк сверху вниз, как `grid-template-columns` — ширины колонок.',
  },
  {
    id: 'rp-1',
    spell: 'repeat',
    prompt: 'Что означает `repeat(3, 1fr)`?',
    options: ['1fr 1fr 1fr', '3fr', 'одну колонку на три строки', '1fr 3fr'],
    explain: '`repeat()` повторяет значение указанное число раз.',
  },
  {
    id: 'gg-1',
    spell: 'grid-gap',
    prompt: 'В сетке `gap: 10px 30px`. Какой промежуток между колонками?',
    options: ['30px', '10px', '40px', '20px'],
    explain: 'Первое значение — между строками, второе — между колонками.',
  },
  {
    id: 'gs-1',
    spell: 'grid-span',
    prompt: 'Что делает `grid-column: span 2`?',
    options: ['растягивает элемент на две колонки', 'ставит элемент во вторую колонку', 'делит колонку пополам', 'добавляет сетке две колонки'],
    explain: '`span` — «растянуться на»: элемент занимает две колонки подряд.',
  },
  {
    id: 'gl-1',
    spell: 'grid-lines',
    prompt: 'В сетке 3 колонки. Сколько у неё вертикальных линий?',
    options: ['четыре', 'три', 'две', 'шесть'],
    explain: 'Линий всегда на одну больше, чем колонок: края сетки — тоже линии.',
  },
  {
    id: 'gl-2',
    spell: 'grid-lines',
    prompt: 'Что значит `grid-column: 1 / -1`?',
    options: ['от первой линии до последней — во всю ширину', 'одна колонка шириной −1', 'от последней линии к первой', 'элемент спрятан'],
    explain: '`-1` — это последняя линия, сколько бы колонок ни было.',
  },
  {
    id: 'ga-1',
    spell: 'grid-areas',
    prompt: 'Что происходит с одинаковыми словами, стоящими рядом в `grid-template-areas`?',
    options: ['сливаются в одну область', 'дают ошибку', 'создают две одинаковые колонки', 'ничего не значат'],
    explain: 'Одинаковые слова — это одна область; она должна складываться в прямоугольник.',
  },
  {
    id: 'mq-1',
    spell: 'media-query',
    prompt: 'Когда работают правила внутри `@media (min-width: 600px)`?',
    options: ['когда экран шириной 600px и больше', 'когда экран уже 600px', 'всегда', 'только на телефонах'],
    explain: '`min-width` — «ширина не меньше»: правило включается на экранах от 600px.',
  },
  {
    id: 'mf-1',
    spell: 'mobile-first',
    prompt: 'Подход «сначала узкий экран» — это когда…',
    options: [
      'основа написана для телефона, а медиазапросы min-width добавляют раскладку для широких экранов',
      'стили пишут только для монитора',
      'для телефонов делают отдельный сайт',
      'медиазапросы стоят в самом начале файла',
    ],
    explain: 'Узкий экран — самый простой: основу пишут для него, а более широким экранам добавляют медиазапросы.',
  },
  {
    id: 'mh-1',
    spell: 'media-hide',
    prompt: 'Как спрятать `.ad` только на экранах уже 600px?',
    options: [
      '@media (max-width: 599px) { .ad { display: none; } }',
      '@media (min-width: 600px) { .ad { display: none; } }',
      '.ad { display: none; }',
      '@media (max-width: 599px) { .ad { width: auto; } }',
    ],
    explain: '`max-width: 599px` срабатывает только на узких экранах, а `display: none` убирает элемент совсем.',
  },
  {
    id: 'af-1',
    spell: 'auto-fill',
    prompt: 'Что делает `repeat(auto-fill, minmax(120px, 1fr))`?',
    options: [
      'ставит столько колонок не уже 120px, сколько поместится',
      'всегда ставит 120 колонок',
      'делает одну колонку шириной 120px',
      'работает только внутри медиазапроса',
    ],
    explain: '`auto-fill` повторяет колонку, пока она помещается, а `minmax()` задаёт её наименьшую и наибольшую ширину.',
  },
  {
    id: 'ma-1',
    spell: 'media-areas',
    prompt: 'Как перестроить сетку с `grid-template-areas` на широком экране?',
    options: [
      'перерисовать карту grid-template-areas внутри медиазапроса',
      'переписать HTML',
      'задать каждому элементу position',
      'никак: карта задаётся один раз',
    ],
    explain: 'Области остаются теми же — в медиазапросе меняется только карта, и раскладка перестраивается целиком.',
  },
  {
    id: 'tp-1',
    spell: 'tag-pair',
    prompt: 'Как выглядит закрывающий тег абзаца?',
    options: ['</p>', '<p/>', '<p>', '<\\p>'],
    explain: 'Закрывающий тег — то же имя с косой чертой после «<».',
  },
  {
    id: 'hd-1',
    spell: 'headings',
    prompt: 'Какой заголовок самый главный на странице?',
    options: ['h1', 'h6', 'h3', 'head'],
    explain: 'Чем меньше цифра, тем важнее заголовок. `<head>` — не заголовок, а служебная часть документа.',
  },
  {
    id: 'se-1',
    spell: 'strong-em',
    prompt: 'Каким тегом отметить важные слова?',
    options: ['strong', 'em', 'p', 'bold'],
    explain: '`<strong>` — для важного. `<em>` — для смыслового ударения, а тега `<bold>` в HTML нет.',
  },
  {
    id: 'ns-1',
    spell: 'nesting',
    prompt: 'Какая запись правильная?',
    options: ['<p><em>текст</em></p>', '<p><em>текст</p></em>', '<em><p>текст</em></p>', '<p><em>текст</p>'],
    explain: 'Тег, открытый последним, закрывается первым: сначала `</em>`, потом `</p>`.',
  },
  {
    id: 'vt-1',
    spell: 'void-tags',
    prompt: 'Что не так с записью `строка</br>`?',
    options: ['у <br> нет закрывающего тега', 'не хватает </p>', 'br пишется заглавными', 'всё правильно'],
    explain: '`<br>` — одиночный тег: пишут просто `<br>`, без пары.',
  },
  {
    id: 'ds-1',
    spell: 'doc-skeleton',
    prompt: 'Где пишут тег `<title>`?',
    options: ['в <head>', 'в <body>', 'в самом начале, до <!doctype html>', 'в <h1>'],
    explain: '`<title>` — название вкладки, это служебная информация, поэтому он живёт в `<head>`.',
  },
  {
    id: 'ul-1',
    spell: 'ul-li',
    prompt: 'Что может стоять прямо внутри `<ul>`?',
    options: ['только пункты <li>', 'любой текст', 'абзацы <p>', 'заголовки <h2>'],
    explain: 'В `<ul>` сразу идут только `<li>`, а уже внутри пункта может быть что угодно.',
  },
  {
    id: 'ol-1',
    spell: 'ol',
    prompt: 'Какой список выбрать для шагов рецепта?',
    options: ['<ol> — нумерованный', '<ul> — маркированный', '<li> без списка', '<p> с номерами'],
    explain: 'Когда важен порядок, нужен `<ol>`: номера браузер расставит сам.',
  },
  {
    id: 'nl-1',
    spell: 'nested-lists',
    prompt: 'Куда ставят вложенный список?',
    options: ['внутрь <li>, до его </li>', 'сразу после </ul>', 'внутрь <ul>, между пунктами', 'в отдельный <p>'],
    explain: 'Вложенный список — часть пункта, поэтому он стоит внутри `<li>`.',
  },
  {
    id: 'ln-1',
    spell: 'links',
    prompt: 'В каком атрибуте пишут адрес ссылки?',
    options: ['href', 'src', 'link', 'url'],
    explain: '`href` — адрес ссылки. `src` — у картинок: какой файл показать.',
  },
  {
    id: 'an-1',
    spell: 'anchors',
    prompt: 'Ссылка `<a href="#map">` ведёт…',
    options: ['к элементу с id="map" на этой странице', 'на сайт map', 'к картинке map.png', 'никуда'],
    explain: 'Решётка в начале значит «на этой странице»: ссылка прокрутит к элементу с таким `id`.',
  },
  {
    id: 'im-1',
    spell: 'images',
    prompt: 'Зачем картинке `alt`?',
    options: [
      'это описание: его читает экранный диктор и показывает браузер, если картинка не загрузилась',
      'это размер картинки',
      'это адрес файла',
      'это подпись под картинкой на странице',
    ],
    explain: '`alt` описывает картинку для тех, кто её не видит. Подпись на странице — это другой тег, `<figcaption>`.',
  },
  {
    id: 'tb-1',
    spell: 'tables',
    prompt: 'Где стоят ячейки `<td>`?',
    options: ['внутри строки <tr>', 'прямо внутри <table>', 'внутри <th>', 'где угодно'],
    explain: 'Таблица состоит из строк `<tr>`, а ячейки `<td>` и `<th>` стоят внутри строк.',
  },
];

/** Изученные заклинания в порядке уровней, где их проходят. */
export function learnedSpells(progress: Record<string, LevelProgress>): string[] {
  const learned: string[] = [];
  for (const level of allLevels) {
    if (level.learns && progress[level.id]?.completed && SPELLS[level.learns] && !learned.includes(level.learns)) {
      learned.push(level.learns);
    }
  }
  return learned;
}

/** Вопрос по заклинанию, которое дольше всех не повторяли. */
export function pickQuestion(learned: string[], exclude?: string): ReviewQuestion | undefined {
  const { reviews } = stats.get();
  const candidates = learned
    .filter((spell) => spell !== exclude && QUESTIONS.some((q) => q.spell === spell))
    .sort(
      (a, b) =>
        (reviews[a]?.lastAt ?? -1) - (reviews[b]?.lastAt ?? -1) || (reviews[a]?.correct ?? 0) - (reviews[b]?.correct ?? 0),
    );
  const spell = candidates[0];
  if (!spell) return undefined;
  const pool = QUESTIONS.filter((q) => q.spell === spell);
  return pool[(reviews[spell]?.correct ?? 0) % pool.length];
}

/** Пора ли задать вопрос после прохождения: раз в два впервые пройденных уровня. */
export function reviewIsDue(): boolean {
  const { completions, lastReviewAt } = stats.get();
  return completions - lastReviewAt >= 2;
}

/** Студент пропустил вопрос — следующий будет через два уровня. */
export function skipReview(): void {
  stats.update((s) => ({ lastReviewAt: s.completions }));
}

/** Перемешивание вариантов, одинаковое для одного и того же вопроса и «зерна». */
export function shuffledOptions(question: ReviewQuestion, seed: number): { text: string; correct: boolean }[] {
  const options = question.options.map((text, i) => ({ text, correct: i === 0 }));
  let state = [...question.id].reduce((sum, ch) => sum + ch.charCodeAt(0), seed * 31);
  for (let i = options.length - 1; i > 0; i--) {
    state = (state * 1103515245 + 12345) % 2147483648;
    const j = state % (i + 1);
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}
