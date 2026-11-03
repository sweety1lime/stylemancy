import type { Figure, Role } from '../figures';

/* Детали стиля «Неон-код» */

export const BG = '#08060f';

/** Роли, которые в неоне не рисуются: это тени, а у трубки тени нет */
const SHADING = new Set<Role>(['cloakDark', 'hatDark', 'robeDark']);

/**
 * Фигура из неоновых трубок: каждая деталь — светящийся контур, залитый цветом фона,
 * чтобы задние линии не просвечивали сквозь передние.
 */
export function Neon({ figure, colors, width = 1.3 }: { figure: Figure; colors: Partial<Record<Role, string>>; width?: number }) {
  const face = colors.skin ?? '#ffffff';
  return (
    <g filter="url(#neon-glow)" strokeLinejoin="round" strokeLinecap="round">
      {figure.parts
        .filter((part) => !SHADING.has(part.role))
        .map((part, i) => (
          <path key={i} className={part.className} d={part.d} fill={BG} stroke={colors[part.role] ?? '#ffffff'} strokeWidth={width} />
        ))}
      {figure.lines.length > 0 && <path d={figure.lines.join(' ')} fill="none" stroke={face} strokeWidth={width * 0.8} />}
      {figure.dots.map((d) => (
        <path key={d} d={d} fill={face} />
      ))}
    </g>
  );
}
