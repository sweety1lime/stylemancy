/** С чего начать новую землю */
export interface LandTemplate {
  id: string;
  /** Подпись на кнопке */
  name: string;
  /** Название новой земли */
  title: string;
  html: string;
  css: string;
}

export const LAND_TEMPLATES: LandTemplate[] = [
  {
    id: 'blank',
    name: 'Чистый лист',
    title: 'Моя земля',
    html: '<!-- Здесь страница твоей земли. Начни с заголовка: -->\n<h1>Моя земля</h1>\n',
    css: '/* Здесь стили: цвет, шрифт, рамки. Начни с body: */\nbody {\n}\n',
  },
];
