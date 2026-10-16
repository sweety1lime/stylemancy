interface Part {
  code: boolean;
  text: string;
}

/**
 * Делит текст на обычные куски и код. Код — между одинаковыми сериями обратных кавычек, как в Markdown:
 * `let` — одинарными, а код с обратной кавычкой внутри — двойными: `` `${price} монет` ``.
 * Пробел у краёв двойных кавычек отбрасывается — так можно показать и саму кавычку: `` ` ``.
 */
function splitCode(text: string): Part[] {
  const parts: Part[] = [];
  let plain = '';
  let i = 0;
  const runAt = (at: number) => {
    let n = 0;
    while (text[at + n] === '`') n++;
    return n;
  };
  while (i < text.length) {
    if (text[i] !== '`') {
      plain += text[i++];
      continue;
    }
    const fence = runAt(i);
    // Закрывает серия ровно из стольких же кавычек
    let close = -1;
    for (let j = i + fence; j < text.length; ) {
      const run = runAt(j);
      if (run === fence) {
        close = j;
        break;
      }
      j += run || 1;
    }
    if (close === -1) {
      plain += text.slice(i, i + fence);
      i += fence;
      continue;
    }
    if (plain) parts.push({ code: false, text: plain });
    plain = '';
    let code = text.slice(i + fence, close);
    if (fence > 1 && code.length > 2 && code.startsWith(' ') && code.endsWith(' ')) code = code.slice(1, -1);
    parts.push({ code: true, text: code });
    i = close + fence;
  }
  if (plain) parts.push({ code: false, text: plain });
  return parts;
}

/** Текст, в котором `обратные кавычки` превращаются в код. */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {splitCode(text).map((part, i) =>
        part.code ? (
          <code key={i} className="inline-code">
            {part.text}
          </code>
        ) : (
          part.text
        ),
      )}
    </>
  );
}
