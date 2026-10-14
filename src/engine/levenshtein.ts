/**
 * Расстояние между словами: сколько букв нужно заменить, вставить или удалить.
 * Переставленные соседние буквы («scr» вместо «src») — одна ошибка, а не две.
 */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let beforePrevious: number[] = [];
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        current[j] = Math.min(current[j], beforePrevious[j - 2] + 1);
      }
    }
    beforePrevious = previous;
    previous = current;
  }
  return previous[b.length];
}

/** Самый похожий вариант из списка — если он достаточно близок, чтобы быть опечаткой. */
export function nearest(word: string, candidates: readonly string[]): string | undefined {
  const target = word.toLowerCase();
  const limit = target.length <= 4 ? 1 : target.length <= 8 ? 2 : 3;
  let best: string | undefined;
  let bestDistance = Infinity;
  for (const candidate of candidates) {
    const distance = editDistance(target, candidate.toLowerCase());
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best !== undefined && best !== word && bestDistance <= limit ? best : undefined;
}
