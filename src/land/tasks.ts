import { evaluateOrder } from '../engine/order';
import type { OrderRule } from '../engine/types';

/*
  Творческие задания «Моей земли». Необязательные: они не закрывают дорогу и ничего не требуют, а за выполненное
  приходит опыт (один раз за задание) и, за три задания, новый свет посоха.

  Задание проверяет не имена, а результат: игрок сам называет свои классы, поэтому проверка смотрит на теги,
  на настоящее положение предметов и на вычисленные стили страницы. Решений у задания много; у каждого есть
  своё эталонное, по которому проверяется само задание.
*/

/** Страница игрока, на которой идёт проверка: настоящая, отрисованная, но невидимая */
export interface LandProbe {
  doc: Document;
  /** Код игрока как он есть: для условий вроде «в CSS есть @media» */
  html: string;
  css: string;
  /** Выполнить проверку при другой ширине страницы: медиазапросы срабатывают по ширине рамки */
  at<T>(width: number, run: () => T): T;
}

export interface CheckResult {
  done: boolean;
  /** Что не так, если не выполнено */
  detail?: string;
}

export interface LandCheck {
  label: string;
  /** Подсказка, что сделать, если условие не выполнено */
  hint?: string;
  run(probe: LandProbe): CheckResult;
}

export interface LandTask {
  id: string;
  title: string;
  brief: string;
  xp: number;
  checks: LandCheck[];
  /** Эталонное решение: оно обязано выполнять все условия, а чистый лист — нет */
  solution: { html: string; css: string };
}

/* ——— Кирпичики условий ——— */

function all(doc: Document, selector: string): HTMLElement[] {
  try {
    return Array.from(doc.querySelectorAll<HTMLElement>(selector));
  } catch {
    return [];
  }
}

const styleOf = (el: Element) => el.ownerDocument.defaultView!.getComputedStyle(el);

const shown = (el: Element) => {
  const box = el.getBoundingClientRect();
  return box.width > 0 && box.height > 0;
};

/** Нужное число элементов по селектору */
function has(label: string, selector: string, options: { min?: number; exactly?: number; hint?: string } = {}): LandCheck {
  const { min = 1, exactly } = options;
  return {
    label,
    hint: options.hint,
    run: ({ doc }) => {
      const found = all(doc, selector).length;
      if (exactly !== undefined ? found === exactly : found >= min) return { done: true };
      if (found === 0) return { done: false, detail: 'пока не найдено' };
      return { done: false, detail: exactly !== undefined && found > exactly ? `найдено ${found}, а нужно ровно ${exactly}` : `найдено ${found} из ${exactly ?? min}` };
    },
  };
}

/** Условие по раскладке: те же правила, что у заказов жителей, но на странице игрока */
function layout(label: string, rule: OrderRule, hint?: string): LandCheck {
  return {
    label,
    hint,
    run: ({ doc }) => {
      const [status] = evaluateOrder(doc, { check: { itemLabel: 'Предмет', order: [{ label, rule }] } });
      return { done: status.inPlace, detail: status.message?.replaceAll('сцене', 'странице') };
    },
  };
}

/** Дети коробки, которые видно на странице. Элементы живут в другой рамке, поэтому instanceof с ними не работает */
function shownChildren(el: Element): Element[] {
  return Array.from(el.children).filter(shown);
}

function inRow(boxes: DOMRect[]): boolean {
  return Math.max(...boxes.map((box) => box.top)) < Math.min(...boxes.map((box) => box.bottom)) && boxes.every((box, i) => i === 0 || box.left + 2 >= boxes[i - 1].left);
}

function inColumn(boxes: DOMRect[]): boolean {
  return Math.max(...boxes.map((box) => box.left)) < Math.min(...boxes.map((box) => box.right)) && boxes.every((box, i) => i === 0 || box.top + 2 >= boxes[i - 1].top);
}

/** Коробки, в которых лежат три и больше видимых элемента */
function groupsOfThree(doc: Document): HTMLElement[] {
  return all(doc, '*').filter((el) => el.localName !== 'html' && shownChildren(el).length >= 3);
}

/* ——— Задания ——— */

export const LAND_TASKS: LandTask[] = [
  {
    id: 'tavern',
    title: 'Вывеска таверны',
    brief: 'Таверне нужна вывеска: один большой заголовок, абзац про неё и список блюд.',
    xp: 10,
    checks: [
      has('Один заголовок h1', 'h1', { exactly: 1, hint: 'Заголовок первого уровня пишется тегом <h1>, и на странице он один.' }),
      has('Абзац p с описанием таверны', 'p', { hint: 'Абзац — тег <p>.' }),
      has('Список блюд: не меньше трёх пунктов li', 'ul > li, ol > li', { min: 3, hint: 'Список — <ul>, а каждое блюдо — пункт <li> внутри него.' }),
    ],
    solution: {
      html: '<h1>Таверна «Бурый медведь»</h1>\n<p>Горячий суп и тёплая постель для усталых путников.</p>\n<ul>\n  <li>Суп из грибов</li>\n  <li>Пирог с яблоками</li>\n  <li>Мёд и эль</li>\n</ul>\n',
      css: '',
    },
  },
  {
    id: 'street',
    title: 'Деревня в ряд',
    brief: 'Поставь три картинки в один ряд: домики, деревья, фонари — что захочешь.',
    xp: 15,
    checks: [
      has('Не меньше трёх картинок img', 'img', { min: 3, hint: 'Картинки берутся в панели под редактором.' }),
      {
        label: 'Картинки лежат в одной коробке с display: flex или grid',
        hint: 'Оберни картинки в <div class="street"> и задай .street { display: flex; gap: 16px; }',
        run: ({ doc }) => {
          if (all(doc, 'img').length < 3) return { done: false, detail: 'сначала нужны три картинки' };
          const boxed = all(doc, '*').some((el) => el.querySelectorAll('img').length >= 3 && /flex|grid/.test(styleOf(el).display));
          return boxed ? { done: true } : { done: false, detail: 'у коробки с картинками обычный display' };
        },
      },
      layout('Картинки стоят в один ряд', { rule: 'row', items: 'img' }, 'В flex-коробке дети встают в ряд сами; следи, чтобы не включился перенос строк.'),
    ],
    solution: {
      html: '<div class="street">\n  <img src="house.png" alt="Дом">\n  <img src="tree.png" alt="Дерево">\n  <img src="lantern.png" alt="Фонарь">\n</div>\n',
      css: '.street {\n  display: flex;\n  align-items: flex-end;\n  gap: 16px;\n}\n',
    },
  },
  {
    id: 'sky',
    title: 'Ночное небо',
    brief: 'Нарисуй небо: градиент, луна и звёзды, а звёзды ещё и мерцают.',
    xp: 15,
    checks: [
      has('Луна на небе: картинка moon.png', 'img[data-picture="moon.png"]', { hint: '<img src="moon.png" alt="Луна">' }),
      has('Не меньше трёх звёзд: картинка star.png или свой рисунок svg', 'img[data-picture="star.png"], svg', { min: 3, hint: 'Звёзды есть в панели картинок, а свою можно нарисовать тегом <svg>.' }),
      {
        label: 'Небо с градиентом: linear-gradient или radial-gradient',
        hint: 'Фон задаётся так: background: linear-gradient(#0b0820, #3a2a78);',
        run: ({ doc }) => ({ done: all(doc, '*').some((el) => styleOf(el).backgroundImage.includes('gradient')) }),
      },
      {
        label: 'Звёзды мерцают: у элемента есть animation',
        hint: 'Анимацию описывает @keyframes, а применяет свойство animation. Готовый блок «Мерцание» лежит в панели.',
        run: ({ doc }) => ({ done: all(doc, '*').some((el) => styleOf(el).animationName !== 'none') }),
      },
    ],
    solution: {
      html:
        '<h1>Ночное небо</h1>\n<div class="sky">\n  <img class="star" src="star.png" alt="Звезда">\n  <img src="moon.png" alt="Луна">\n  <img class="star" src="star.png" alt="Звезда">\n  <img class="star" src="star.png" alt="Звезда">\n</div>\n',
      css:
        '.sky {\n  display: flex;\n  align-items: center;\n  justify-content: space-around;\n  min-height: 200px;\n  background: linear-gradient(#0b0820, #3a2a78);\n}\n\n@keyframes twinkle {\n  from {\n    opacity: 0.4;\n  }\n  to {\n    opacity: 1;\n  }\n}\n\n.star {\n  animation: twinkle 1.6s ease-in-out infinite alternate;\n}\n',
    },
  },
  {
    id: 'potions',
    title: 'Карточки зелий',
    brief: 'Сделай три одинаковые карточки в рамке: у каждой картинка и подпись.',
    xp: 15,
    checks: [
      {
        label: 'Три карточки: figure с картинкой img и подписью figcaption',
        hint: '<figure><img src="potion.png" alt="Зелье"><figcaption>Зелье силы</figcaption></figure>',
        run: ({ doc }) => {
          const cards = all(doc, 'figure').filter((el) => el.querySelector('img') && el.querySelector('figcaption'));
          return cards.length >= 3 ? { done: true } : { done: false, detail: cards.length ? `найдено ${cards.length} из 3` : 'пока не найдено' };
        },
      },
      layout('Карточки одного размера', { rule: 'sameSize', items: 'figure' }, 'Размер задают width и padding: картинки разные, а карточки должны быть равны.'),
      layout('Карточки стоят в один ряд', { rule: 'row', items: 'figure' }, 'Положи карточки в коробку и сделай ей display: flex.'),
      {
        label: 'У карточек есть рамка border',
        hint: 'figure { border: 2px solid #4b3a9b; }',
        run: ({ doc }) => {
          const cards = all(doc, 'figure');
          const framed = cards.length >= 3 && cards.every((el) => styleOf(el).borderTopStyle !== 'none' && parseFloat(styleOf(el).borderTopWidth) > 0);
          return { done: framed };
        },
      },
    ],
    solution: {
      html:
        '<div class="shelf">\n  <figure>\n    <img src="potion.png" alt="Зелье">\n    <figcaption>Зелье силы</figcaption>\n  </figure>\n  <figure>\n    <img src="book.png" alt="Книга">\n    <figcaption>Книга чар</figcaption>\n  </figure>\n  <figure>\n    <img src="map.png" alt="Карта">\n    <figcaption>Карта троп</figcaption>\n  </figure>\n</div>\n',
      css: '.shelf {\n  display: flex;\n  gap: 16px;\n}\n\nfigure {\n  width: 140px;\n  margin: 0;\n  padding: 12px;\n  border: 2px solid #4b3a9b;\n  text-align: center;\n}\n',
    },
  },
  {
    id: 'card',
    title: 'Страница-визитка',
    brief: 'Собери страницу героя из трёх частей с меню-якорями. Основную часть разложи на две колонки.',
    xp: 20,
    checks: [
      {
        label: 'Три части страницы: header, main и footer',
        hint: 'Шапка — <header>, основное — <main>, подвал — <footer>.',
        run: ({ doc }) => {
          const missing = ['header', 'main', 'footer'].filter((tag) => all(doc, tag).length === 0);
          return missing.length ? { done: false, detail: `нет: ${missing.join(', ')}` } : { done: true };
        },
      },
      {
        label: 'Меню: не меньше двух ссылок-якорей, и такие id есть на странице',
        hint: '<a href="#about">…</a> ведёт к элементу <section id="about">.',
        run: ({ doc }) => {
          const working = all(doc, 'a[href^="#"]').filter((link) => doc.getElementById(decodeURIComponent((link.getAttribute('href') ?? '').slice(1))));
          return working.length >= 2 ? { done: true } : { done: false, detail: working.length ? `работает ${working.length} из 2` : 'рабочих ссылок пока нет' };
        },
      },
      {
        label: 'Основная часть main разложена сеткой grid на две колонки или больше',
        hint: 'main { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }',
        run: ({ doc }) => {
          const main = all(doc, 'main')[0];
          if (!main) return { done: false, detail: 'нет main' };
          const style = styleOf(main);
          const columns = style.display === 'grid' ? style.gridTemplateColumns.trim().split(/\s+/).filter((track) => track !== 'none').length : 0;
          return columns >= 2 ? { done: true } : { done: false, detail: columns ? 'пока одна колонка' : 'у main пока не grid' };
        },
      },
    ],
    solution: {
      html:
        '<header>\n  <h1>Анна Звездочёт</h1>\n  <nav><a href="#about">Обо мне</a> <a href="#skills">Умею</a></nav>\n</header>\n<main>\n  <section id="about">\n    <h2>Обо мне</h2>\n    <p>Смотрю на звёзды и записываю, что вижу.</p>\n  </section>\n  <section id="skills">\n    <h2>Умею</h2>\n    <ul>\n      <li>Считать звёзды</li>\n      <li>Чертить карты</li>\n    </ul>\n  </section>\n</main>\n<footer>Написано в Стилемантии</footer>\n',
      css: 'main {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 16px;\n}\n',
    },
  },
  {
    id: 'phone',
    title: 'Земля на любом экране',
    brief: 'Сделай так, чтобы карточки на компьютере стояли в ряд, а на телефоне складывались в столбик.',
    xp: 20,
    checks: [
      {
        label: 'Три или больше элемента лежат в одной коробке',
        hint: 'Например, три карточки <figure> в <div class="cards">.',
        run: ({ doc }) => (groupsOfThree(doc).length ? { done: true } : { done: false, detail: 'такой коробки пока нет' }),
      },
      {
        label: 'На компьютере (900 px) они стоят в ряд, на телефоне (360 px) складываются в столбик',
        hint: 'В ряд их ставит display: flex, а в столбик — flex-direction: column внутри @media (max-width: 480px).',
        run: (probe) => {
          const groups = groupsOfThree(probe.doc);
          if (!groups.length) return { done: false, detail: 'нужна коробка хотя бы с тремя элементами' };
          const boxes = (el: Element) => shownChildren(el).map((child) => child.getBoundingClientRect());
          const wide = probe.at(900, () => groups.filter((el) => inRow(boxes(el))));
          const narrow = probe.at(360, () => groups.filter((el) => inColumn(boxes(el))));
          if (wide.some((el) => narrow.includes(el))) return { done: true };
          return { done: false, detail: wide.length ? 'на телефоне они не складываются в столбик' : 'на компьютере они пока не стоят в ряд' };
        },
      },
      {
        label: 'В CSS есть медиазапрос @media',
        hint: '@media (max-width: 480px) { … } — правила внутри работают только на узком экране.',
        run: ({ css }) => ({ done: /@media/i.test(css) }),
      },
    ],
    solution: {
      html:
        '<div class="cards">\n  <figure>\n    <img src="tree.png" alt="Дерево">\n    <figcaption>Дерево</figcaption>\n  </figure>\n  <figure>\n    <img src="mushroom.png" alt="Гриб">\n    <figcaption>Гриб</figcaption>\n  </figure>\n  <figure>\n    <img src="lantern.png" alt="Фонарь">\n    <figcaption>Фонарь</figcaption>\n  </figure>\n</div>\n',
      css: '.cards {\n  display: flex;\n  gap: 16px;\n}\n\n@media (max-width: 480px) {\n  .cards {\n    flex-direction: column;\n  }\n}\n',
    },
  },
];
