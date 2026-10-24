import { defineRegion } from '../../engine/define';
import { forestCss } from '../shared/forest';
import { FOREST_PROPERTIES } from '../shared/properties';
import cas01 from './cas-01';
import cas02 from './cas-02';
import cas03 from './cas-03';
import cas04 from './cas-04';
import cas05 from './cas-05';
import cas06 from './cas-06';
import sceneCss from './scene.css?raw';

export const cascadeTree = defineRegion({
  id: 'cascade-tree',
  title: 'Древо Каскада',
  topic: 'Каскад и специфичность',
  npc: { name: 'Древень Каскад', title: 'хранитель Древа Каскада', portrait: 'cascade' },
  sceneCss: forestCss + sceneCss,
  allow: FOREST_PROPERTIES,
  allowMessage: 'В Лесу Селекторов вся сила — в селекторах, а свойство здесь одно: color',
  story: {
    intro: [
      {
        art: 'forest',
        text: 'В самой чаще растёт Древо Каскада. Здесь правила спорят, кому красить листья. И побеждает не всегда тот, кто громче.',
      },
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        text: '«Мои чары записаны после твоих правил — значит, они всегда главнее! Так работает каскад, ха-ха!»',
      },
      {
        art: 'mentor',
        speaker: 'cascade',
        name: 'Древень Каскад',
        text: '«Ш-ш-ш… Он знает лишь половину закона. Кроме порядка, у селекторов есть сила, а у листьев — наследство. Я Древень Каскад, и я расскажу, как спорят правила.»',
      },
    ],
    outro: [
      {
        art: 'forest',
        text: 'Древо Каскада шумит живой листвой, светлячки кружат в кроне, а весь Лес Селекторов снова светится. Лес свободен!',
      },
      {
        art: 'crown',
        speaker: 'cascade',
        name: 'Древень Каскад',
        text: '«Держи Руну Селекторов, {name}: теги, классы, псевдоклассы, каскад и наследство теперь с тобой. Грамота — в Летописи героя.»',
      },
      // Пока где-то держится проклятие, Лорд Дефолт сбегает туда. Когда спасено всё — начинается общий финал
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        when: { allDone: false },
        text: '«Светлячки, листья… Тьфу! А моё проклятие держится {cursed}, туда тебе не добраться, {name}!»',
      },
      {
        art: 'mentor',
        speaker: 'cascade',
        name: 'Древень Каскад',
        when: { allDone: false, next: true },
        text: '«Следующая остановка — {next}. Лес будет шуметь тебе вслед, {name}.»',
      },
      {
        art: 'mentor',
        speaker: 'cascade',
        name: 'Древень Каскад',
        when: { allDone: false, next: false },
        text: '«Остальные земли пока в тумане. Он рассеется, когда учитель их откроет. А пока загляни в гримуар.»',
      },
    ],
  },
  levels: [cas01, cas02, cas03, cas04, cas05, cas06],
});
