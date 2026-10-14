import { useEffect, type ReactNode } from 'react';

/** Окно поверх экрана: заголовок, крестик и Escape закрывают его. */
export function Modal({
  title,
  onClose,
  className,
  children,
}: {
  title: string;
  onClose: () => void;
  className?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="story" role="dialog" aria-modal="true" aria-label={title}>
      <div className={className ? `modal px-panel ${className}` : 'modal px-panel'}>
        <div className="modal__head">
          <h2 className="pixel-subtitle">{title}</h2>
          <button type="button" className="text-button" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
