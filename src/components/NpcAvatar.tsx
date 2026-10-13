/** Временный портрет наставника — колпак со звездой. Настоящие портреты появятся на этапе 2. */
export function NpcAvatar() {
  return (
    <svg className="npc-avatar" viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="npc-hat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d8ccff" />
          <stop offset="1" stopColor="#6d3fe0" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="#221a49" stroke="#f4c76b" strokeOpacity="0.55" strokeWidth="2" />
      <path d="M33 9 C 30 18, 24 30, 19 44 L 47 44 C 43 33, 40 22, 33 9 Z" fill="url(#npc-hat)" />
      <ellipse cx="33" cy="45" rx="20" ry="5" fill="#4c2aa8" />
      <path
        d="M33 22 l1.8 4.2 4.5 .4 -3.4 3 1 4.4 -3.9 -2.4 -3.9 2.4 1 -4.4 -3.4 -3 4.5 -.4 z"
        fill="#f4c76b"
      />
    </svg>
  );
}
