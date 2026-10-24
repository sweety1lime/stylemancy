import { defineRegion } from '../../engine/define';
import { pixelFontCss } from '../shared/pixelFont';
import fair01 from './fair-01';
import fair02 from './fair-02';
import fair03 from './fair-03';
import fair04 from './fair-04';
import fair05 from './fair-05';
import fair06 from './fair-06';
import fair07 from './fair-07';
import fair08 from './fair-08';
import sceneCss from './scene.css?raw';

export const linkFair = defineRegion({
  id: 'link-fair',
  title: 'Ярмарка Ссылок',
  topic: 'HTML: списки, ссылки, картинки',
  npc: { name: 'Торговка Линка', title: 'хозяйка Ярмарки Ссылок', portrait: 'merchant' },
  sceneCss: pixelFontCss + sceneCss,
  story: {
    intro: [
      {
        art: 'fair',
        text: 'За Деревней Тегов шумит Ярмарка Ссылок: товары разложены по спискам, указатели ведут к лавкам, а на вывесках — картинки.',
      },
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        text: '«Списки — в кашу, указатели — в никуда, картинки — без подписей! Пусть покупатели блуждают!»',
      },
      {
        art: 'mentor',
        speaker: 'merchant',
        name: 'Торговка Линка',
        text: '«Я Торговка Линка. У хорошего торговца всё по полочкам: списки, ссылки, вывески и прайс-листы. Наведём порядок!»',
      },
    ],
    outro: [
      {
        art: 'fair',
        text: 'Покупатели больше не блуждают: указатели ведут куда надо. Ярмарка снова шумит.',
      },
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        text: '«Пусть так. Но в Городе Семантики все дома одинаковые — сплошные div! Там-то ты и заблудишься.»',
      },
      {
        art: 'mentor',
        speaker: 'merchant',
        name: 'Торговка Линка',
        text: '«Отличная торговля! Дальше — Город Семантики: там страницы строят из правильных блоков, а не из одинаковых коробок.»',
      },
    ],
  },
  levels: [fair01, fair02, fair03, fair04, fair05, fair06, fair07, fair08],
});
