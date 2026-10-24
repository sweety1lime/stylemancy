import { defineRegion } from '../../engine/define';
import { mechanismCss } from '../shared/mechanism';
import dom01 from './dom-01';
import dom02 from './dom-02';
import dom03 from './dom-03';
import dom04 from './dom-04';
import dom05 from './dom-05';
import dom06 from './dom-06';

/** Первый район Города Механизмов: найти элемент на странице, сменить текст и классы, создать новые элементы. */
export const queryWorkshop = defineRegion({
  id: 'query-workshop',
  title: 'Мастерская Квери',
  topic: 'querySelector, textContent и classList',
  npc: { name: 'Мастер Квери', title: 'смотритель Мастерской', portrait: 'query' },
  // Страницы Города — латунь и тёмная сталь; у каждого уровня своя разметка
  sceneCss: mechanismCss,
  story: {
    intro: [
      {
        art: 'mech-city',
        text: 'За Мастерской Рецептов поднимается Город Механизмов: башни, трубы и шестерни. Только всё стоит — вывески погасли, ворота заперты.',
      },
      {
        art: 'mentor',
        speaker: 'query',
        name: 'Мастер Квери',
        text: '«Наконец-то! Я — Мастер Квери. Город — это страницы, а страницы двигает JavaScript. Научу находить на странице что угодно и менять его, {name}.»',
      },
      {
        art: 'villain-script',
        speaker: 'default',
        name: 'Лорд Дефолт',
        text: '«Ищи-ищи! Страницы здесь мои: всё стоит, как стояло по умолчанию. И так будет всегда!»',
      },
    ],
    outro: [
      {
        art: 'lamps',
        text: 'Шестерни крутятся, вывеска светится. Мастерская ожила.',
      },
      {
        art: 'mentor',
        speaker: 'query',
        name: 'Мастер Квери',
        text: '«Найти, поменять, создать — теперь ты это умеешь, {name}. Но механизм пока меняется только при запуске. Загляни к Механику Клику: он научит механизмы ждать твоего сигнала.»',
      },
    ],
  },
  levels: [dom01, dom02, dom03, dom04, dom05, dom06],
});
