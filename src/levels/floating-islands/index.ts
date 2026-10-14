import { defineRegion } from '../../engine/define';
import { FLEX_PROPERTIES } from '../shared/properties';
import flex01 from './flex-01';
import flex02 from './flex-02';
import flex03 from './flex-03';
import flex04 from './flex-04';
import flex05 from './flex-05';
import flex06 from './flex-06';
import flex07 from './flex-07';
import flex08 from './flex-08';
import flex09 from './flex-09';
import flex10 from './flex-10';
import flex11 from './flex-11';
import flex12 from './flex-12';
import flex13 from './flex-13';
import sceneCss from './scene.css?raw';
import { spriteCss } from './sceneSprites';

export const floatingIslands = defineRegion({
  id: 'floating-islands',
  title: 'Парящие острова',
  topic: 'Flexbox',
  npc: { name: 'Магистр Флекс', title: 'хранитель Парящих островов', portrait: 'flex' },
  sceneCss: sceneCss + spriteCss,
  allow: FLEX_PROPERTIES,
  allowMessage: 'На Парящих островах действует только магия Flexbox',
  story: {
    intro: [
      {
        art: 'kingdom',
        text: 'Королевство Каскадия жило по законам Магии Стилей. Острова парили в небе, а кристаллы сияли — каждый на своём месте.',
      },
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        text: '«Хватит этих стилей! Пусть всё станет как в браузере по умолчанию: блоки друг под другом, Times New Roman и синие ссылки!»',
      },
      {
        art: 'fallen',
        text: 'Проклятие сбросило все стили. Кристаллы рухнули друг на друга, острова потускнели и накренились.',
      },
      {
        art: 'mentor',
        speaker: 'flex',
        name: 'Магистр Флекс',
        text: '«Нужен тот, кто освоит магию Flexbox и вернёт островам порядок. Это ты? Тогда начнём!»',
      },
    ],
    outro: [
      {
        art: 'crown',
        text: 'Звёздная корона собрана! Острова снова парят, а кристаллы сияют на своих местах.',
      },
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        text: '«Это ещё не конец! В Витражной обители мои проклятия посильнее. Посмотрим, что ты сделаешь с сеткой!»',
      },
      {
        art: 'mentor',
        speaker: 'flex',
        name: 'Магистр Флекс',
        text: '«Магия Flexbox теперь с тобой. Загляни в гримуар, отдохни — и в путь, к Витражной обители.»',
      },
    ],
  },
  levels: [
    flex01,
    flex02,
    flex03,
    flex04,
    flex05,
    flex06,
    flex07,
    flex08,
    flex09,
    flex10,
    flex11,
    flex12,
    flex13,
  ],
});
