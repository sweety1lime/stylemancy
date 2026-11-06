interface LandFrameProps {
  /** Готовый документ земли (land/sanitize.ts) */
  page: string;
  /** Название земли на вкладке */
  title: string;
  height: number;
  /** Ширина страницы в рамке; без неё — на всю ширину рамки */
  width?: number;
}

/**
 * Земля в рамке «браузера». Страница лежит в iframe с пустым sandbox: ни скриптов, ни форм, ни переходов.
 * Тот же документ открывает и автор, и получатель ссылки.
 */
export function LandFrame({ page, title, height, width }: LandFrameProps) {
  return (
    <div className="browser land-frame">
      <div className="browser__bar">
        <span className="browser__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="browser__tab">{title || 'Без названия'}</span>
      </div>
      <div className="land-frame__viewport">
        <iframe
          className="browser__page land-frame__page"
          title="Страница земли"
          sandbox=""
          srcDoc={page}
          style={{ height, width: width ?? '100%' }}
        />
      </div>
    </div>
  );
}
