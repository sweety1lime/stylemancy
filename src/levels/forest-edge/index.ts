import { defineRegion } from '../../engine/define';
import { forestCss } from '../shared/forest';
import { FOREST_PROPERTIES } from '../shared/properties';
import sel01 from './sel-01';
import sel02 from './sel-02';
import sel03 from './sel-03';
import sel04 from './sel-04';
import sel05 from './sel-05';
import sel06 from './sel-06';
import sel07 from './sel-07';
import sel08 from './sel-08';
import sel09 from './sel-09';
import sel10 from './sel-10';

export const forestEdge = defineRegion({
  id: 'forest-edge',
  title: 'Опушка',
  topic: 'Селекторы',
  npc: { name: 'Сова Селекта', title: 'хранительница Опушки', portrait: 'select' },
  sceneCss: forestCss,
  allow: FOREST_PROPERTIES,
  allowMessage: 'В Лесу Селекторов вся сила — в селекторах, а свойство здесь одно: color',
  story: {
    intro: [
      {
        art: 'forest',
        text: 'На западе королевства шумит Лес Селекторов. У каждого гриба, светлячка и листа здесь есть метка — тег, класс или имя. По меткам магия находит, кого зажечь.',
      },
      // Лорд Дефолт помнит героя: первая встреча — или «опять ты»
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        when: { firstChapter: true },
        text: '«Ученик Академии? Ха! Я погасил весь лес. Чтобы зажечь хоть один огонёк, его сначала надо найти, а здесь тысячи одинаковых грибов!»',
      },
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        when: { done: ['tags-valley'] },
        text: '«Опять ты, {name}! Теги ты расставил — а толку? Чтобы их раскрасить, нужно уметь их находить. В моём лесу ты заблудишься!»',
      },
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        when: { anyDone: true, notDone: ['tags-valley'] },
        text: '«Опять ты, {name}! Ну уж в тёмном лесу ты ничего не найдёшь!»',
      },
      {
        art: 'mentor',
        speaker: 'select',
        name: 'Сова Селекта',
        when: { firstChapter: true },
        text: '«Угу! Я Сова Селекта. Селектор — заклинание-указатель: он говорит, к кому применить чары. Научу находить кого угодно.»',
      },
      {
        art: 'mentor',
        speaker: 'select',
        name: 'Сова Селекта',
        when: { anyDone: true },
        text: '«Угу! Слава о тебе долетела и до леса, {name}. Я Сова Селекта — научу находить кого угодно, даже в темноте.»',
      },
    ],
    outro: [
      {
        art: 'forest',
        text: 'Опушка снова светится: фонари горят вдоль тропы, мухоморы предупреждают грибников, а Королева светлячков сияет над поляной.',
      },
      {
        art: 'mentor',
        speaker: 'select',
        name: 'Сова Селекта',
        text: '«Теперь ты находишь любой элемент по тегу, классу, имени и месту в разметке. Дальше — Грибные поляны: там Ведунья Ховер знает селекторы похитрее.»',
      },
    ],
  },
  levels: [sel01, sel02, sel03, sel04, sel05, sel06, sel07, sel08, sel09, sel10],
});
