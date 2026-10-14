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
        art: 'villain',
        speaker: 'default',
        name: 'Лорд Дефолт',
        text: '«Вся Долина Тегов снова в порядке… Ладно. Но без стилей ваши страницы всё равно серые — это моё королевство!»',
      },
      {
        art: 'crown',
        text: 'Долина Тегов спасена! Теги, списки, ссылки, семантика и формы теперь с тобой. А стили для них — в Парящих землях.',
      },
    ],
  },
  levels: [form01, form02, form03, form04, form05, form06],
});
