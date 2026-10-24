import { defineRegion } from '../../engine/define';
import { forestCss } from '../shared/forest';
import { FOREST_PROPERTIES } from '../shared/properties';
import ps01 from './ps-01';
import ps02 from './ps-02';
import ps03 from './ps-03';
import ps04 from './ps-04';
import ps05 from './ps-05';
import ps06 from './ps-06';

export const mushroomGlades = defineRegion({
  id: 'mushroom-glades',
  title: 'Грибные поляны',
  topic: 'Псевдоклассы',
  npc: { name: 'Ведунья Ховер', title: 'хозяйка Грибных полян', portrait: 'hover' },
  sceneCss: forestCss,
  allow: FOREST_PROPERTIES,
  allowMessage: 'В Лесу Селекторов вся сила — в селекторах, а свойство здесь одно: color',
  story: {
    intro: [
      {
        art: 'forest',
        text: 'За Опушкой — Грибные поляны. Здесь всё растёт рядами, и огоньки зажигаются не просто так: по счёту, по очереди или от прикосновения.',
      },
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        text: '«Классы-метки на полянах я стёр. Попробуй-ка теперь отличить первый гриб от второго!»',
      },
      {
        art: 'mentor',
        speaker: 'hover',
        name: 'Ведунья Ховер',
        text: '«Хи-хи, метки ему подавай! Псевдоклассы находят элементы без всяких меток: по номеру в ряду, по состоянию, даже по тому, чего у них нет. Я Ведунья Ховер — смотри и учись.»',
      },
    ],
    outro: [
      {
        art: 'forest',
        text: 'Поляны сияют. Цветы горят через один, а светлячки вспыхивают, едва их коснёшься.',
      },
      {
        art: 'mentor',
        speaker: 'hover',
        name: 'Ведунья Ховер',
        text: '«Заметил? Светлячок горит, только пока мышь рядом: :hover ничего не помнит. Запоминать и оживать страницы учит другая магия — та, что за дверью <script>. Но это потом, хи-хи.»',
      },
      {
        art: 'mentor',
        speaker: 'hover',
        name: 'Ведунья Ховер',
        text: '«Псевдоклассы теперь твои, {name}! А в самой чаще растёт Древо Каскада. Там правила спорят друг с другом, и Лорд Дефолт этим пользуется.»',
      },
    ],
  },
  levels: [ps01, ps02, ps03, ps04, ps05, ps06],
});
