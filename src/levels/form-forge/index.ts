import { defineRegion } from '../../engine/define';
import { pixelFontCss } from '../shared/pixelFont';
import form01 from './form-01';
import form02 from './form-02';
import form03 from './form-03';
import form04 from './form-04';
import form05 from './form-05';
import form06 from './form-06';
import sceneCss from './scene.css?raw';

export const formForge = defineRegion({
  id: 'form-forge',
  title: 'Кузница Форм',
  topic: 'HTML: формы',
  npc: { name: 'Кузнец Инпут', title: 'мастер Кузницы Форм', portrait: 'smith' },
  sceneCss: pixelFontCss + sceneCss,
  story: {
    intro: [
      {
        art: 'forge',
        text: 'В Кузнице Форм куют всё, во что люди пишут: поля для имени, галочки, списки и кнопки. Без форм не вступить в гильдию и не отправить письмо.',
      },
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        text: '«Подписи — без полей, пароли — нараспашку, кнопки — из абзацев! Пусть никто ничего не сможет отправить!»',
      },
      {
        art: 'mentor',
        speaker: 'smith',
        name: 'Кузнец Инпут',
        text: '«Я Кузнец Инпут. Хорошая форма — как хороший молот: удобна в руке и делает своё дело. Раздувай горн!»',
      },
    ],
    outro: [
      {
        art: 'forge',
        text: 'Горн снова горит: поля подписаны, пароли спрятаны, а кнопка отправляет форму, только когда всё заполнено.',
      },
      {
        art: 'crown',
        speaker: 'smith',
        name: 'Кузнец Инпут',
        text: '«Долина Тегов свободна! Держи Руну Тегов, {name}: она напомнит, что любая страница начинается с правильных тегов. Грамота — в Летописи героя.»',
      },
      // Финал земли: злодей сбегает туда, где проклятие ещё держится, а наставник провожает дальше
      {
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        when: { allDone: false },
        text: '«Долину я потерял… Но моё проклятие ещё держится {cursed}. Посмотрим, как ты справишься там, {name}!»',
      },
      {
        art: 'mentor',
        speaker: 'scribe',
        name: 'Писарь Тег',
        when: { allDone: false, next: true },
        text: '«Ступай дальше, {name}: следующая остановка — {next}. Там тебя уже ждут!»',
      },
      {
        art: 'mentor',
        speaker: 'scribe',
        name: 'Писарь Тег',
        when: { allDone: false, next: false },
        text: '«Остальные земли пока в тумане. Он рассеется, когда учитель их откроет, — а пока загляни в гримуар.»',
      },
    ],
  },
  levels: [form01, form02, form03, form04, form05, form06],
});
