export function Stars({ count, max = 3 }: { count: number; max?: number }) {
  return (
    <span className="stars" role="img" aria-label={`${count} из ${max} звёзд`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < count ? 'star star--on' : 'star'}>
          ★
        </span>
      ))}
    </span>
  );
}
