/** Особый лист: свои атрибуты (id, второй класс) и имя в сообщениях проверки. */
interface SpecialLeaf {
  attrs?: string;
  className?: string;
  name?: string;
}

/** Листья ветки с номерами from…to: строки разметки <li class="leaf"> с отступом. */
export function leaves(from: number, to: number, special: Record<number, SpecialLeaf> = {}): string {
  return Array.from({ length: to - from + 1 }, (_, i) => {
    const n = from + i;
    const leaf = special[n] ?? {};
    const className = leaf.className ? `leaf ${leaf.className}` : 'leaf';
    return `    <li class="${className}"${leaf.attrs ?? ''} data-name="${leaf.name ?? `Лист ${n}`}"></li>`;
  }).join('\n');
}
