import { defineRegion } from '../../engine/define';
import { pixelFontCss } from '../shared/pixelFont';
import sceneCss from './scene.css?raw';
import tag01 from './tag-01';
import tag02 from './tag-02';
import tag03 from './tag-03';
import tag04 from './tag-04';
import tag05 from './tag-05';
import tag06 from './tag-06';
import tag07 from './tag-07';

export const tagVillage = defineRegion({
  id: 'tag-village',
  title: 'Деревня Тегов',
  topic: 'HTML: теги',
  npc: { name: 'Писарь Тег', title: 'хранитель Деревни Тегов', portrait: 'scribe' },
  sceneCss: pixelFontCss + sceneCss,
  story: {
    intro: [
      {
        art: 'village',
        text: 'В Долине Тегов стоит деревня, где у каждого слова есть свой тег: заголовки висят над воротами, абзацы живут в домиках, а важные слова светятся.',
      },
      // Лорд Дефолт помнит героя: первая встреча — или «опять ты»
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        when: { firstChapter: true },
        text: '«Ученик Академии? Ха! Теги долой: пусть будет сплошной текст шрифтом по умолчанию — и пусть браузер сам гадает, где тут заголовок!»',
      },
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        when: { done: ['floating-lands'] },
        text: '«Опять ты, {name}! Парящие земли у меня уже отняли — но здесь тебе не победить: без тегов стилям не за что зацепиться!»',
      },
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        when: { anyDone: true, notDone: ['floating-lands'] },
        text: '«Опять ты, {name}! Не надейся, что и здесь всё получится: теги я стёр начисто!»',
      },
      {
        art: 'mentor',
        speaker: 'scribe',
        name: 'Писарь Тег',
        when: { firstChapter: true },
        text: '«Я Писарь Тег. Для браузера слово без тега ничего не значит. Бери перо — вернём тексту смысл!»',
      },
      {
        art: 'mentor',
        speaker: 'scribe',
        name: 'Писарь Тег',
        when: { anyDone: true },
        text: '«Слава о тебе дошла и до нас, {name}! Я Писарь Тег. Для браузера слово без тега ничего не значит — бери перо, вернём тексту смысл!»',
      },
    ],
    outro: [
      {
        art: 'scroll',
        text: 'Указ старосты снова в порядке: заголовок над текстом, абзацы на своих местах, важное выделено — и ни одного незакрытого тега.',
      },
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        text: '«Подумаешь, пара закрытых тегов! На Ярмарке Ссылок мои проклятия похитрее!»',
      },
      {
        art: 'mentor',
        speaker: 'scribe',
        name: 'Писарь Тег',
        text: '«Теперь ты умеешь собрать страницу с нуля. Загляни в гримуар — там всё записано. А впереди Ярмарка Ссылок: списки, ссылки и картинки.»',
      },
    ],
  },
  levels: [tag01, tag02, tag03, tag04, tag05, tag06, tag07],
});
