import { LIGHTS } from './lights';

/*
  Фильтры и градиенты «Сумрака». Рисуются один раз на странице (NoirDefs),
  а рисунки ссылаются на них по id: url(#noir-rim), url(#sil-light-ice) и т. д.
*/
export const NOIR_DEFS = (
  <>
    <linearGradient id="noir-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#04060b" />
      <stop offset="0.45" stopColor="#0d1322" />
      <stop offset="0.78" stopColor="#1b2437" />
      <stop offset="1" stopColor="#2a3244" />
    </linearGradient>
    <radialGradient id="noir-moon" cx="0.4" cy="0.38" r="0.65">
      <stop offset="0" stopColor="#f4f7fb" />
      <stop offset="0.7" stopColor="#cfd8e6" />
      <stop offset="1" stopColor="#aab6c9" />
    </radialGradient>
    <radialGradient id="noir-halo" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#a9bcdc" stopOpacity="0.35" />
      <stop offset="0.4" stopColor="#7d90b4" stopOpacity="0.12" />
      <stop offset="1" stopColor="#7d90b4" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="noir-beam" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
      <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
    </linearGradient>
    <radialGradient id="noir-vignette" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0.55" stopColor="#000000" stopOpacity="0" />
      <stop offset="1" stopColor="#000000" stopOpacity="0.7" />
    </radialGradient>
    <radialGradient id="noir-portrait" cx="0.5" cy="0.42" r="0.6">
      <stop offset="0" stopColor="#4a5a7c" />
      <stop offset="0.45" stopColor="#1c2438" />
      <stop offset="1" stopColor="#07090f" />
    </radialGradient>
    {/* Контровой свет луны: холодный, на краях сверху и справа — луна справа вверху */}
    <filter id="noir-rim" x="-10%" y="-10%" width="120%" height="120%">
      <feMorphology in="SourceAlpha" operator="erode" radius="0.35" result="inner" />
      <feOffset in="inner" dx="-0.55" dy="0.5" result="shifted" />
      <feComposite in="SourceAlpha" in2="shifted" operator="out" result="edge" />
      <feFlood floodColor="#b9cbe8" floodOpacity="0.6" />
      <feComposite in2="edge" operator="in" result="rim" />
      <feGaussianBlur in="rim" stdDeviation="0.3" result="soft" />
      <feMerge>
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="soft" />
      </feMerge>
    </filter>
    <filter id="noir-rim-big" x="-10%" y="-10%" width="120%" height="120%">
      <feMorphology in="SourceAlpha" operator="erode" radius="6" result="inner" />
      <feOffset in="inner" dx="-7" dy="6" result="shifted" />
      <feComposite in="SourceAlpha" in2="shifted" operator="out" result="edge" />
      <feFlood floodColor="#b9cbe8" floodOpacity="0.8" />
      <feComposite in2="edge" operator="in" result="rim" />
      <feGaussianBlur in="rim" stdDeviation="2" result="soft" />
      <feMerge>
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="soft" />
      </feMerge>
    </filter>
    {/*
      Направленный контровой свет сценок: без erode, край виден только со стороны источника.
      Сдвиг dx/dy направлен от света: свет справа — dx отрицательный. Палитры — с доски «Свет земель» в примерочной.
    */}
    <filter id="noir-rim-dawn" x="-25%" y="-25%" width="150%" height="150%">
      <feOffset in="SourceAlpha" dx="-1.8" dy="0.35" result="shifted" />
      <feComposite in="SourceAlpha" in2="shifted" operator="out" result="edge" />
      <feFlood floodColor="#ffd4a0" floodOpacity="0.95" />
      <feComposite in2="edge" operator="in" result="rim" />
      <feGaussianBlur in="rim" stdDeviation="0.45" result="soft" />
      <feMerge>
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="soft" />
      </feMerge>
    </filter>
    {/* Зарево: оранжевый ореол за силуэтом и тёплая кромка. Под лёгкими эффектами — вариант без ореола */}
    <filter id="noir-rim-ember" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="7" result="haloBlur" />
      <feFlood floodColor="#ff6a2a" floodOpacity="0.45" />
      <feComposite in2="haloBlur" operator="in" result="haloFill" />
      <feComposite in="haloFill" in2="SourceAlpha" operator="out" result="halo" />
      <feOffset in="SourceAlpha" dx="0" dy="1.8" result="shifted" />
      <feComposite in="SourceAlpha" in2="shifted" operator="out" result="edge" />
      <feFlood floodColor="#ffb070" floodOpacity="0.95" />
      <feComposite in2="edge" operator="in" result="rim" />
      <feGaussianBlur in="rim" stdDeviation="0.5" result="soft" />
      <feMerge>
        <feMergeNode in="halo" />
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="soft" />
      </feMerge>
    </filter>
    <filter id="noir-rim-ember-lite" x="-25%" y="-25%" width="150%" height="150%">
      <feOffset in="SourceAlpha" dx="0" dy="1.8" result="shifted" />
      <feComposite in="SourceAlpha" in2="shifted" operator="out" result="edge" />
      <feFlood floodColor="#ffb070" floodOpacity="0.95" />
      <feComposite in2="edge" operator="in" result="rim" />
      <feGaussianBlur in="rim" stdDeviation="0.5" result="soft" />
      <feMerge>
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="soft" />
      </feMerge>
    </filter>
    <filter id="noir-rim-moon" x="-25%" y="-25%" width="150%" height="150%">
      <feOffset in="SourceAlpha" dx="-1.3" dy="1.3" result="shifted" />
      <feComposite in="SourceAlpha" in2="shifted" operator="out" result="edge" />
      <feFlood floodColor="#c9d8f0" floodOpacity="0.8" />
      <feComposite in2="edge" operator="in" result="rim" />
      <feGaussianBlur in="rim" stdDeviation="0.4" result="soft" />
      <feMerge>
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="soft" />
      </feMerge>
    </filter>
    {/* Рассвет Долины Тегов: небо, низкое солнце, его свечение и лёгкие лучи */}
    <linearGradient id="noir-sky-dawn" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#0c1322" />
      <stop offset="0.4" stopColor="#27314a" />
      <stop offset="0.66" stopColor="#6c6577" />
      <stop offset="0.84" stopColor="#c4967a" />
      <stop offset="1" stopColor="#f2c48c" />
    </linearGradient>
    <radialGradient id="noir-sun-glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#ffe2b0" stopOpacity="0.75" />
      <stop offset="0.35" stopColor="#f2a870" stopOpacity="0.28" />
      <stop offset="1" stopColor="#f2a870" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="noir-beam-dawn" x1="1" y1="1" x2="0" y2="0">
      <stop offset="0" stopColor="#ffe0b0" stopOpacity="0.5" />
      <stop offset="1" stopColor="#ffe0b0" stopOpacity="0" />
    </linearGradient>
    {/* Зарево Крепости Блоков: небо в багровом свете, пожар за стенами, дым */}
    <linearGradient id="noir-sky-ember" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#080406" />
      <stop offset="0.35" stopColor="#1d0b0c" />
      <stop offset="0.62" stopColor="#4a1712" />
      <stop offset="0.84" stopColor="#9a3416" />
      <stop offset="1" stopColor="#e0702c" />
    </linearGradient>
    <radialGradient id="noir-fire" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#ffb060" stopOpacity="0.7" />
      <stop offset="0.4" stopColor="#d0501c" stopOpacity="0.3" />
      <stop offset="1" stopColor="#d0501c" stopOpacity="0" />
    </radialGradient>
    <filter id="noir-smoke" x="-60%" y="-30%" width="220%" height="160%">
      <feGaussianBlur stdDeviation="9" />
    </filter>
    {/* Лес Селекторов: мягкие лучи луны сквозь кроны */}
    <linearGradient id="noir-ray-moon" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#dfe9fb" stopOpacity="0.8" />
      <stop offset="1" stopColor="#dfe9fb" stopOpacity="0.05" />
    </linearGradient>
    <filter id="noir-ray-soft" x="-20%" y="-10%" width="140%" height="120%">
      <feGaussianBlur stdDeviation="7" />
    </filter>
    <filter id="noir-cloud" x="-10%" y="-60%" width="120%" height="220%">
      <feGaussianBlur stdDeviation="2.2" />
    </filter>
    <filter id="noir-shaft" x="-30%" y="-10%" width="160%" height="120%">
      <feGaussianBlur stdDeviation="4" />
    </filter>
    <filter id="noir-mist" x="-20%" y="-50%" width="140%" height="200%">
      <feGaussianBlur stdDeviation="9" />
    </filter>
    {/* Зерно плёнки: мелкий шум поверх всего кадра */}
    <filter id="noir-grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="9" />
      <feColorMatrix type="matrix" values="0 0 0 0 0.85  0 0 0 0 0.85  0 0 0 0 0.9  0.7 0 0 0 -0.32" />
    </filter>
    {/* Карта Скриптории: бирюзовая ночь и луна с зеленцой */}
    <linearGradient id="noir-sky-script" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#020607" />
      <stop offset="0.5" stopColor="#061518" />
      <stop offset="0.8" stopColor="#0b2628" />
      <stop offset="1" stopColor="#123a3a" />
    </linearGradient>
    <radialGradient id="noir-moon-script" cx="0.4" cy="0.38" r="0.65">
      <stop offset="0" stopColor="#effbf8" />
      <stop offset="0.7" stopColor="#c6e6e0" />
      <stop offset="1" stopColor="#9cc4bd" />
    </radialGradient>
    {/* Лучи низкой луны вбок, через всю карту */}
    <linearGradient id="noir-beam-side" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#dfe8f5" stopOpacity="0.22" />
      <stop offset="1" stopColor="#dfe8f5" stopOpacity="0" />
    </linearGradient>
    {/* Проклятие гасит цвет: кристаллы под ним серые и тусклые */}
    <filter id="noir-cursed" x="-20%" y="-20%" width="140%" height="140%">
      <feColorMatrix type="saturate" values="0.12" />
      <feComponentTransfer>
        <feFuncR type="linear" slope="0.55" />
        <feFuncG type="linear" slope="0.55" />
        <feFuncB type="linear" slope="0.6" />
      </feComponentTransfer>
    </filter>
    {/* Круги света: у каждого цвета свой градиент — яркий центр, мягко гаснет к краю */}
    {Object.entries(LIGHTS).map(([name, color]) => (
      <radialGradient key={name} id={`sil-light-${name}`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor={color} stopOpacity="0.85" />
        <stop offset="0.35" stopColor={color} stopOpacity="0.3" />
        <stop offset="1" stopColor={color} stopOpacity="0" />
      </radialGradient>
    ))}
    {/* Свечение огоньков: размытая копия под чёткой */}
    <filter id="sil-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </>
);
