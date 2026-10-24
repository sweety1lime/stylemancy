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
        text: 'Над Каскадией парят острова, и на каждом сияют кристаллы — каждый на своём месте. Так было до Великого Сброса.',
      },
      {
        art: 'fallen',
        text: 'Проклятие обрушило кристаллы друг на друга, а острова потускнели и накренились.',
      },
      // Лорд Дефолт помнит героя: первая встреча — или «опять ты»
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        when: { firstChapter: true },
        text: '«Ученик Академии? Ха! Попробуй-ка расставить кристаллы, когда вокруг ни одного стиля!»',
      },
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        when: { done: ['tags-valley'] },
        text: '«Опять ты, {name}! Долину Тегов у меня уже отняли. Но теги — это только слова. А расставить их по местам ты не сможешь!»',
      },
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        when: { anyDone: true, notDone: ['tags-valley'] },
        text: '«Опять ты, {name}! Острова мои, и кристаллы так и останутся грудой!»',
      },
      {
        art: 'mentor',
        speaker: 'flex',
        name: 'Магистр Флекс',
        when: { firstChapter: true },
        text: '«Нужен тот, кто освоит магию Flexbox и вернёт островам порядок. Это ты? Тогда начнём!»',
      },
      {
        art: 'mentor',
        speaker: 'flex',
        name: 'Магистр Флекс',
        when: { anyDone: true },
        text: '«Мы ждали тебя, {name}! Я Магистр Флекс — научу расставлять всё по местам. Начнём с Flexbox!»',
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
