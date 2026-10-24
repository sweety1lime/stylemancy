import { defineRegion } from '../../engine/define';
import js01 from './js-01';
import js02 from './js-02';
import js03 from './js-03';
import js04 from './js-04';
import js05 from './js-05';
import js06 from './js-06';
import js07 from './js-07';
import js08 from './js-08';

/** Первый район Скриптории: вывод, переменные-колбы, const, имена и арифметика. */
export const oracleHall = defineRegion({
  id: 'oracle-hall',
  title: 'Зал Оракула',
  topic: 'console.log, переменные и арифметика',
  npc: { name: 'Оракул Консоль', title: 'голос Скриптории', portrait: 'oracle' },
  story: {
    intro: [
      {
        art: 'oracle',
        text: 'Сразу за Вратами Скриптории — Зал Оракула. Под сводами висит свиток, а на полках стоят колбы. Пустые: Лорд Дефолт вылил из них всё до капли.',
      },
      {
        art: 'villain-script',
        speaker: 'default',
        name: 'Лорд Дефолт',
        text: '«Здесь всё будет по умолчанию: в колбах — undefined, а Оракул будет молчать. Ни слова, ни числа!»',
      },
      {
        art: 'mentor',
        speaker: 'oracle',
        name: 'Оракул Консоль',
        text: '«Я — Оракул Консоль. Я повторяю всё, что мне прикажут, но приказывать умеет лишь тот, кто знает JavaScript. Научу тебя, {name}. Первый приказ — сказать слово.»',
      },
    ],
    outro: [
      {
        art: 'oracle',
        text: 'Свиток исписан, колбы полны: числа синеют, строки зеленеют, а запечатанные колбы не откроет никакой Дефолт.',
      },
      {
        art: 'mentor',
        speaker: 'oracle',
        name: 'Оракул Консоль',
        text: '«Теперь ты говоришь со Скрипторией, {name}: console.log, let, const и арифметика — твои. Дальше по улице — Лавка Алхимика, где строки смешивают с числами. Загляни к Алхимику Тайпофу!»',
      },
      {
        art: 'jester',
        speaker: 'default',
        name: 'Лорд Дефолт',
        text: '«Наполнил колбы? Ха! Посмотрим, как ты их смешаешь, {name}. В Лавке Алхимика хозяйничает мой шут NaN!»',
      },
    ],
  },
  levels: [js01, js02, js03, js04, js05, js06, js07, js08],
});
