import { defineRegion } from '../../engine/define';
import { pixelFontCss } from '../shared/pixelFont';
import sceneCss from './scene.css?raw';
import sem01 from './sem-01';
import sem02 from './sem-02';
import sem03 from './sem-03';
import sem04 from './sem-04';
import sem05 from './sem-05';
import sem06 from './sem-06';
import sem07 from './sem-07';

export const semanticCity = defineRegion({
  id: 'semantic-city',
  title: 'Город Семантики',
  topic: 'HTML: семантика',
  npc: { name: 'Зодчий Хедер', title: 'строитель Города Семантики', portrait: 'architect' },
  sceneCss: pixelFontCss + sceneCss,
  story: {
    intro: [
      {
        art: 'city',
        text: 'Город Семантики строили мудрые зодчие: у каждого дома своё назначение — шапка, главная площадь, сторожка, подвал.',
      },
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        text: '«Зачем столько разных домов? Пусть всё будет одинаковыми серыми коробками — div, div, div!»',
      },
      {
        art: 'mentor',
        speaker: 'architect',
        name: 'Зодчий Хедер',
        text: '«Я Зодчий Хедер. Коробки ничего не говорят ни браузеру, ни поисковику, ни тем, кто слушает страницу. Вернём домам их смысл!»',
      },
    ],
    outro: [
      {
        art: 'city',
        text: 'Город снова понятен: шапка с меню, главная площадь с разделами и летописью, сторожка сбоку и подвал внизу.',
      },
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        text: '«Город спасён, но Кузница Форм ещё моя! Ни одно поле там не знает, что в него вводить.»',
      },
      {
        art: 'mentor',
        speaker: 'architect',
        name: 'Зодчий Хедер',
        text: '«Теперь ты строишь страницы как настоящий зодчий. Осталась Кузница Форм — там учат собирать формы, в которые пишут люди.»',
      },
    ],
  },
  levels: [sem01, sem02, sem03, sem04, sem05, sem06, sem07],
});
