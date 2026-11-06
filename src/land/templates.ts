/** С чего начать новую землю. Заготовки короткие: в пределе 3000 знаков остаётся место для своего */
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
    html: '<!-- Здесь страница твоей земли. Начни с заголовка, а блоки и картинки возьми в панели под редактором: -->\n<h1>Моя земля</h1>\n',
    css: '/* Здесь стили: цвет, шрифт, рамки. Начни с body: */\nbody {\n}\n',
  },
  {
    id: 'village',
    name: 'Деревня',
    title: 'Деревня Лунного Света',
    html: `<!-- Деревня: поменяй названия, добавь жителей и картинки из панели -->
<header>
  <h1>Деревня Лунного Света</h1>
  <p>Тихое место, где грибы светятся по ночам.</p>
</header>
<main>
  <section class="street">
    <figure>
      <img src="house.png" alt="Дом пекаря">
      <figcaption>Дом пекаря</figcaption>
    </figure>
    <figure>
      <img src="house.png" alt="Дом звездочёта">
      <figcaption>Дом звездочёта</figcaption>
    </figure>
    <figure>
      <img src="tree.png" alt="Старый дуб">
      <figcaption>Старый дуб</figcaption>
    </figure>
  </section>
  <section>
    <h2>Жители</h2>
    <ul>
      <li>Пекарь Тимофей</li>
      <li>Звездочёт Анна</li>
      <li>Кот Ворчун</li>
    </ul>
  </section>
</main>
<footer>Построено в Стилемантии</footer>
`,
    css: `body {
  margin: 0;
  background: #14102b;
  color: #e9e3ff;
  font-family: Georgia, serif;
}

header {
  padding: 20px;
  text-align: center;
  background: linear-gradient(#2a1f5c, #14102b);
}

h1 {
  margin: 0 0 8px;
  color: #ffd479;
}

h2 {
  color: #ffb8d9;
}

main {
  display: grid;
  gap: 16px;
  padding: 20px;
}

section {
  padding: 16px;
  border: 2px solid #4b3a9b;
  border-radius: 12px;
}

.street {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: center;
  gap: 24px;
}

figure {
  margin: 0;
  text-align: center;
}

img {
  display: block;
  margin: 0 auto 6px;
}

footer {
  padding: 12px;
  text-align: center;
  color: #8d82c9;
}
`,
  },
  {
    id: 'sky',
    name: 'Ночное небо',
    title: 'Ночное небо',
    html: `<!-- Ночное небо: двигай звёзды и облака, меняй цвета -->
<h1>Ночное небо</h1>
<div class="sky">
  <img class="star" src="star.png" alt="Звезда">
  <img src="moon.png" alt="Луна">
  <img class="star" src="star.png" alt="Звезда">
  <img src="cloud.png" alt="Облако">
  <img class="star" src="star.png" alt="Звезда">
</div>
<p>Здесь можно написать, что видно с твоей земли.</p>
`,
    css: `body {
  margin: 0;
  background: #0b0820;
  color: #e9e3ff;
  font-family: Georgia, serif;
  text-align: center;
}

h1 {
  padding-top: 20px;
  color: #ffd479;
}

.sky {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-around;
  gap: 24px;
  min-height: 260px;
  padding: 24px;
  background: linear-gradient(#0b0820, #3a2a78);
}

@keyframes twinkle {
  from {
    opacity: 0.4;
  }
  to {
    opacity: 1;
  }
}

.star {
  animation: twinkle 1.6s ease-in-out infinite alternate;
}

p {
  padding: 16px;
}
`,
  },
  {
    id: 'island',
    name: 'Мой остров',
    title: 'Мой остров',
    html: `<!-- Мой остров: что растёт и стоит на твоём острове? -->
<h1>Мой остров</h1>
<div class="island">
  <img src="tower.png" alt="Башня">
  <img src="tree.png" alt="Дерево">
  <img src="mushroom.png" alt="Гриб">
  <img src="lantern.png" alt="Фонарь">
</div>
<img class="cloud" src="cloud.png" alt="Облако">
<p>Остров парит высоко над землёй.</p>
`,
    css: `body {
  margin: 0;
  padding: 20px;
  background: linear-gradient(#14234d, #5b6fb5);
  color: #eef2ff;
  font-family: Georgia, serif;
  text-align: center;
}

h1 {
  color: #ffd479;
}

.island {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 16px;
  width: 80%;
  max-width: 420px;
  margin: 24px auto 0;
  padding: 24px 24px 40px;
  background: #2e6b45;
  border-radius: 24px 24px 50% 50%;
}

.cloud {
  display: block;
  margin: 24px auto;
}
`,
  },
];

/** Земля, в которой после заготовки ничего не поменяли. За такую награду не даём, иначе опыт собирался бы одним щелчком */
export function isUntouchedTemplate(source: { html: string; css: string }): boolean {
  return LAND_TEMPLATES.some((template) => template.html === source.html && template.css === source.css);
}
