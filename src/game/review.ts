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
    id: 'ai-1',
    spell: 'align-items',
    prompt: 'В ряду (`flex-direction: row`) `align-items` двигает элементы…',
    options: ['по вертикали', 'по горизонтали', 'по диагонали', 'никуда — только меняет размер'],
    explain: 'В ряду поперечная ось вертикальная, а `align-items` работает именно поперёк главной оси.',
  },
  {
    id: 'ai-2',
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
