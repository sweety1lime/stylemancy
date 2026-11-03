import type { CSSProperties } from 'react';
import { PixelArt } from '../../components/PixelArt';
import { SpriteAnim } from '../../components/SpriteAnim';
import { spriteCssUrl } from '../../pixel/pixelArt';
import {
  DUNGEON_BUG,
  DUNGEON_EXIT,
  DUNGEON_FLOOR,
  DUNGEON_TORCH_FRAMES,
  DUNGEON_WALL,
  GEMS,
  HERO_ANIMATIONS,
  ISLAND_ROCK,
  MOON,
  PORTRAITS,
  VILLAIN_ANIMATIONS,
} from '../../pixel/sprites';
import type { BoardProps } from '../Board';
import { DUNGEON_MAP } from '../shapes';

/* Сегодняшний пиксель-арт из настоящих спрайтов игры — для сравнения */

const TILES = { '--wall': spriteCssUrl(DUNGEON_WALL), '--floor': spriteCssUrl(DUNGEON_FLOOR) } as CSSProperties;

export const pixelBoard: Omit<BoardProps, 'id'> = {
  name: 'Сейчас: пиксель-арт',
  about: 'Как игра выглядит сегодня: спрайты из sprites.ts, шрифт Tiny5, пиксельные рамки.',
  traits: ['Есть и работает', 'Рисуется строками символов в коде', 'Мелкие спрайты: 8×8 тайлы, герой 18×22'],
  scene: (
    <div className="px-scene" role="img" aria-label="Герой и Лорд Дефолт на парящем острове">
      <PixelArt sprite={MOON} scale={4} className="px-moon" />
      <PixelArt sprite={ISLAND_ROCK} scale={4} className="px-island" />
      <span className="px-hero">
        <SpriteAnim frames={HERO_ANIMATIONS.idle} fps={2} scale={4} />
      </span>
      <span className="px-villain">
        <SpriteAnim frames={VILLAIN_ANIMATIONS.idle} fps={2} scale={4} />
      </span>
      {(['amethyst', 'emerald', 'ruby'] as const).map((kind, i) => (
        <span key={kind} className="px-gem" style={{ left: `${42 + i * 5.6}%`, animationDelay: `${i * -0.4}s` }}>
          <PixelArt sprite={GEMS[kind].sprite} scale={3} />
        </span>
      ))}
    </div>
  ),
  portrait: <PixelArt sprite={PORTRAITS.flex} scale={7} />,
  dungeon: (
    <div className="px-dungeon" style={TILES}>
      {DUNGEON_MAP.flatMap((row, y) =>
        [...row].map((cell, x) => (
          <span key={`${x},${y}`} className={cell === '#' || cell === 'T' ? 'px-cell px-cell--wall' : 'px-cell'}>
            {cell === 'T' && <SpriteAnim frames={DUNGEON_TORCH_FRAMES} fps={6} scale={5} />}
            {cell === 'E' && <PixelArt sprite={DUNGEON_EXIT} scale={3} />}
            {cell === 'b' && <PixelArt sprite={DUNGEON_BUG} scale={3} />}
            {cell === 'g' && <PixelArt sprite={GEMS.emerald.sprite} scale={2} />}
            {cell === 'H' && <SpriteAnim frames={HERO_ANIMATIONS.idle} fps={2} scale={2} />}
          </span>
        )),
      )}
    </div>
  ),
};
