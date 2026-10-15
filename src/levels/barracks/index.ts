import { defineRegion } from '../../engine/define';
import { spriteCssUrl } from '../../pixel/pixelArt';
import { PORTRAITS, SHIELD, SWORD } from '../../pixel/sprites';
import { fortressCss, SAND_WALL } from '../shared/fortress';
import { BOX_PROPERTIES } from '../shared/properties';
import box01 from './box-01';
import box02 from './box-02';
import box03 from './box-03';
import box04 from './box-04';
import box05 from './box-05';
import box06 from './box-06';
import box07 from './box-07';
import box08 from './box-08';
import sceneCss from './scene.css?raw';

/** Песчаная кладка вокруг казармы и картинки предметов */
const spritesCss = `
body {
  background: ${SAND_WALL};
}

.shield { --shield: ${spriteCssUrl(SHIELD)}; }
.sword { --sword: ${spriteCssUrl(SWORD)}; }
.portrait { --commander: ${spriteCssUrl(PORTRAITS.absolute)}; }
`;

export const barracks = defineRegion({
  id: 'barracks',
  title: 'Казармы',
  topic: 'Блочная модель',
  npc: { name: 'Леди Паддинг', title: 'хранительница Казарм', portrait: 'padding' },
  sceneCss: sceneCss + spritesCss + fortressCss,
  allow: BOX_PROPERTIES,
  allowMessage: 'В Казармах действует магия блочной модели — размеры, отступы и рамки',
  story: {
    intro: [
      {
        art: 'fortress',
        text: 'На краю королевства стоит Крепость Блоков. Каждый её ящик, щит и часовой — это коробка: у неё есть размер, обивка, рамка и место вокруг.',
      },
      // Лорд Дефолт помнит героя: первая встреча — или «опять ты»
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        when: { firstChapter: true },
        text: '«Ученик Академии? Ха! Я сбросил в крепости все размеры и отступы. Блоки слиплись друг с другом — и никто их не разлепит!»',
      },
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        when: { done: ['tags-valley'] },
        text: '«Опять ты, {name}! Долину Тегов ты у меня отнял. Но теги без размеров и отступов слипаются в кашу — в моей крепости так и будет!»',
      },
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        when: { anyDone: true, notDone: ['tags-valley'] },
        text: '«Опять ты, {name}! Ну уж в Крепости Блоков мои стены тебе не по зубам!»',
      },
      {
        art: 'mentor',
        speaker: 'padding',
        name: 'Леди Паддинг',
        when: { firstChapter: true },
        text: '«Не слушай его! Я Леди Паддинг, хранительница Казарм. Каждый элемент на странице — коробка, и я научу тебя ею управлять.»',
      },
      {
        art: 'mentor',
        speaker: 'padding',
        name: 'Леди Паддинг',
        when: { anyDone: true },
        text: '«Слава о тебе дошла и до крепости, {name}! Я Леди Паддинг. Каждый элемент на странице — коробка, и сейчас ты узнаешь, как она устроена.»',
      },
    ],
    outro: [
      {
        art: 'fortress',
        text: 'В Казармах снова порядок: ящики по мерке, щиты в обивке, а часовые стоят на своих местах.',
      },
      {
        art: 'mentor',
        speaker: 'padding',
        name: 'Леди Паддинг',
        text: '«Теперь ты знаешь, из чего сделана коробка: содержимое, padding, border и margin. Ступай на плац — Сержант Дисплей научит блоки вставать в строй.»',
      },
    ],
  },
  levels: [box01, box02, box03, box04, box05, box06, box07, box08],
});
