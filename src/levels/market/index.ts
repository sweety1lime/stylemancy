import { defineRegion } from '../../engine/define';
import { LAYOUT_PROPERTIES } from '../shared/properties';
import order01 from './order-01';
import order02 from './order-02';
import order03 from './order-03';
import order04 from './order-04';
import sceneCss from './scene.css?raw';

/**
 * Лавка заказов: бонусный район Парящих земель «по желанию». Жители заказывают раскладку словами, без контуров целей,
 * и заказ принимается по списку условий, а не по эталонной картинке: решений бывает много.
 */
export const market = defineRegion({
  id: 'market',
  title: 'Лавка заказов',
  topic: 'заказы жителей',
  optional: true,
  npc: { name: 'Торговка Линка', title: 'принимает заказы', portrait: 'merchant' },
  sceneCss,
  allow: LAYOUT_PROPERTIES,
  allowMessage: 'В Лавке заказов действует магия Flexbox и Grid',
  story: {
    intro: [
      {
        art: 'fair',
        text: 'Над парящими землями раскинулась Лавка заказов. Жители несут работу, и каждый точно знает, чего хочет, но не знает, как это записать на языке стилей.',
      },
      {
        art: 'mentor',
        speaker: 'merchant',
        name: 'Торговка Линка',
        text: '«Контуров я не рисую и образцов не показываю. Я говорю, что мне нужно, а ты сам решай, как. Приму любую работу, если выполнено всё из списка, {name}!»',
      },
    ],
    outro: [
      {
        art: 'mentor',
        speaker: 'merchant',
        name: 'Торговка Линка',
        text: '«Все заказы приняты, лавка сияет! Ты научился слушать заказчика, а не просто повторять картинку. Так и работают настоящие вёрстщики, {name}.»',
      },
    ],
  },
  levels: [order01, order02, order03, order04],
});
