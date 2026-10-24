import { defineRegion } from '../../engine/define';
import fn01 from './fn-01';
import fn02 from './fn-02';
import fn03 from './fn-03';
import fn04 from './fn-04';
import fn05 from './fn-05';
import fn06 from './fn-06';
import fn07 from './fn-07';
import fn08 from './fn-08';

/** Первый район Мастерской Рецептов: функции — объявление, параметры, return, рецепты из рецептов и стрелки. */
export const functionCauldron = defineRegion({
  id: 'function-cauldron',
  title: 'Котёл Функций',
  topic: 'function, параметры и return',
  npc: { name: 'Шеф Ретёрн', title: 'хозяин Котла Функций', portrait: 'return' },
  story: {
    intro: [
      {
        art: 'conveyor',
        text: 'Посреди Мастерской Рецептов кипит Котёл Функций. По конвейеру едут флаконы: каждый зовёт рецепт и ждёт, что тот вернёт.',
      },
      {
        art: 'villain-script',
        speaker: 'default',
        name: 'Лорд Дефолт',
        text: '«Вот и рецепты, {name}! Мой Призрак Андефайнд проберётся на кухню, и твои рецепты будут возвращать пустоту. undefined — самое вкусное блюдо!»',
      },
      {
        art: 'mentor',
        speaker: 'return',
        name: 'Шеф Ретёрн',
        text: '«Не на моей кухне! Я — Шеф Ретёрн. Рецепт пишут один раз, а готовят по нему сколько угодно, и он всегда возвращает результат. Вставай к котлу, {name}.»',
      },
    ],
    outro: [
      {
        art: 'ghost',
        text: 'Призрак Андефайнд метался между флаконами, но каждый рецепт возвращал своё, и пустоты ему не досталось ни капли.',
      },
      {
        art: 'conveyor',
        text: 'Котёл кипит ровно, а флаконы на конвейере наполняются и горят золотом.',
      },
      {
        art: 'mentor',
        speaker: 'return',
        name: 'Шеф Ретёрн',
        text: '«function, параметры и return — теперь твои, {name}. Рецепты готовы, пора грузить их в обоз. Возница Пуш уже ждёт.»',
      },
    ],
  },
  levels: [fn01, fn02, fn03, fn04, fn05, fn06, fn07, fn08],
});
