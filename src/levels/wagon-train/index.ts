import { defineRegion } from '../../engine/define';
import arr01 from './arr-01';
import arr02 from './arr-02';
import arr03 from './arr-03';
import arr04 from './arr-04';
import arr05 from './arr-05';
import arr06 from './arr-06';
import arr07 from './arr-07';
import arr08 from './arr-08';

/** Второй район Мастерской Рецептов: массивы — индексы с нуля, length, push и pop, перебор, map и filter. */
export const wagonTrain = defineRegion({
  id: 'wagon-train',
  title: 'Обоз',
  topic: 'массивы, map и filter',
  npc: { name: 'Возница Пуш', title: 'хозяин Обоза', portrait: 'push' },
  story: {
    intro: [
      {
        art: 'train',
        text: 'За Котлом начинается Обоз: длинные вереницы вагонов, и на боку у каждого номер — с нуля.',
      },
      {
        art: 'mentor',
        speaker: 'push',
        name: 'Возница Пуш',
        text: '«Эй, грузчик! Я — Возница Пуш. Массив — это обоз: груз за грузом, вагон за вагоном. Научу считать вагоны с нуля, цеплять новые и перебирать весь обоз разом, {name}.»',
      },
      {
        art: 'villain-script',
        speaker: 'default',
        name: 'Лорд Дефолт',
        text: '«Считать с нуля? Ха! Перепутаешь номера, {name}, — и обоз уедет без половины груза!»',
      },
    ],
    outro: [
      {
        art: 'train',
        text: 'Обоз в пути: вагоны пересчитаны, груз перегнан через map и просеян через filter.',
      },
      {
        art: 'mentor',
        speaker: 'push',
        name: 'Возница Пуш',
        text: '«Массивы — твои, {name}! Последняя остановка Мастерской — Картотека. У Архивариуса Кея каждая вещь записана на карточку.»',
      },
    ],
  },
  levels: [arr01, arr02, arr03, arr04, arr05, arr06, arr07, arr08],
});
