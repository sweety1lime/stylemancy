import { defineRegion } from '../../engine/define';
import { mechanismCss } from '../shared/mechanism';
import ev01 from './ev-01';
import ev02 from './ev-02';
import ev03 from './ev-03';
import ev04 from './ev-04';
import ev05 from './ev-05';
import ev06 from './ev-06';
import ev07 from './ev-07';

/** Второй район Города Механизмов: события — щелчок, ввод, событие и его цель, состояние между щелчками. */
export const leverWorks = defineRegion({
  id: 'lever-works',
  title: 'Рычаги и шестерни',
  topic: 'addEventListener и события',
  npc: { name: 'Механик Клик', title: 'мастер рычагов', portrait: 'click' },
  sceneCss: mechanismCss,
  story: {
    intro: [
      {
        art: 'levers',
        text: 'Цех Рычагов: пульты, кнопки, поля для кодов. Механизмы стоят и ждут сигнала — но провода к ним перерезаны.',
      },
      {
        art: 'mentor',
        speaker: 'click',
        name: 'Механик Клик',
        text: '«Щёлк-щёлк! Я — Механик Клик. Механизм должен не просто меняться, а отвечать: на щелчок, на ввод, на нажатие. Это и есть события, {name}!»',
      },
      {
        art: 'villain-script',
        speaker: 'default',
        name: 'Лорд Дефолт',
        text: '«Пусть щёлкают сколько хотят. По умолчанию кнопка ничего не делает — и мне это нравится!»',
      },
    ],
    outro: [
      {
        art: 'levers',
        text: 'Рычаги открывают ворота, выключатели зажигают свет, а мост встаёт над пропастью ровно из стольких досок, сколько попросили.',
      },
      {
        art: 'mentor',
        speaker: 'click',
        name: 'Механик Клик',
        text: '«Ты оживил целый цех, {name}! Колбы, условия, циклы, события — это уже игра. Мастер Игр Тик-Так давно ждёт такого ученика.»',
      },
    ],
  },
  levels: [ev01, ev02, ev03, ev04, ev05, ev06, ev07],
});
