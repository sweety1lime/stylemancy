/*
  Штормы «Хаос-теста» для уровней витражной обители: Лорд Дефолт подменяет содержимое окна, а раскладка студента
  должна выдержать и его. Классы те же, что в основной сцене, иначе селекторы студента ничего не найдут.
*/

/**
 * Девять стёкол вместо шести: у сетки появляется третья строка, которой в коде студента нет. Строки, подогнанные
 * в пикселях под шесть стёкол, перестанут вмещаться, а доли `fr` делят место заново сами.
 */
export const NINE_PANES = {
  label: 'стёкол стало девять',
  html: `<div class="window">
  <div class="pane star" data-name="Звезда"></div>
  <div class="pane sun" data-name="Солнце"></div>
  <div class="pane moon" data-name="Луна"></div>
  <div class="pane leaf" data-name="Лист"></div>
  <div class="pane rose" data-name="Роза"></div>
  <div class="pane tree" data-name="Дерево"></div>
  <div class="pane crown" data-name="Корона"></div>
  <div class="pane drop" data-name="Капля"></div>
  <div class="pane star" data-name="Звезда 2"></div>
</div>`,
};

/** Что Лорд Дефолт говорит в уровне, где есть шторм */
export const STORM_LINE = 'Лорд Дефолт грозит штормом: под этим окном появится такое же, но с другим числом стёкол. Раскладка должна выдержать оба.';
