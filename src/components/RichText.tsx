/** Текст, в котором `обратные кавычки` превращаются в код. */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split('`').map((part, i) =>
        i % 2 ? (
          <code key={i} className="inline-code">
            {part}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}
