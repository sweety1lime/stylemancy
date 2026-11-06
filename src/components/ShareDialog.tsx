import { useEffect, useRef, useState } from 'react';
import { downloadLand, encodeLand, isLongLink, landUrl, type SharedLand } from '../land/share';
import type { LandImages } from '../land/sanitize';
import { Modal } from './Modal';

/**
 * Окно «Поделиться»: ссылка, в которой лежит вся земля. Сервера нет, поэтому отозвать ссылку нельзя —
 * об этом сказано прямо, до того как игрок её отправит.
 */
export function ShareDialog({ land, images, onClose }: { land: SharedLand; images: LandImages; onClose: () => void }) {
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState<'yes' | 'manual' | null>(null);
  const field = useRef<HTMLInputElement>(null);
  const { title, html, css, nick } = land;

  useEffect(() => {
    let current = true;
    void encodeLand({ title, html, css, nick }).then((value) => {
      if (current) setToken(value);
    });
    return () => {
      current = false;
    };
  }, [title, html, css, nick]);

  const url = token ? landUrl(token) : '';

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied('yes');
    } catch {
      // Буфер обмена закрыт (старый браузер, нет разрешения): выделяем ссылку, остаётся нажать Ctrl+C
      field.current?.select();
      setCopied('manual');
    }
  }

  return (
    <Modal title="Поделиться землёй" onClose={onClose} className="land-share">
      <div className="land-share__body">
        <p>
          В этой ссылке лежит вся твоя земля целиком, никуда на сервер она не загружается. Открыть землю сможет любой, у кого
          есть ссылка.
        </p>
        <p className="land-share__warning">
          Отозвать ссылку нельзя. Если передумаешь, ты можешь удалить землю у себя, но у тех, кому ссылка уже отправлена, она
          останется.
        </p>
        <p className="land-share__sign">
          {nick ? `Под землёй будет стоять твой ник: ${nick}.` : 'Земля без подписи: никто не узнает, чья она.'}
        </p>

        <label className="field">
          Ссылка
          <input ref={field} readOnly value={url} onFocus={(event) => event.currentTarget.select()} aria-label="Ссылка на землю" />
        </label>
        <div className="land-share__actions">
          <button type="button" className="button button--cast" onClick={() => void copy()} disabled={!token}>
            Скопировать ссылку
          </button>
          <button type="button" className="button button--ghost" onClick={() => downloadLand(land, images)}>
            Скачать файл .html
          </button>
        </div>
        <p className="land-share__status" role="status">
          {copied === 'yes' && 'Ссылка скопирована.'}
          {copied === 'manual' && 'Браузер не дал скопировать сам: ссылка выделена, нажми Ctrl+C.'}
        </p>
        {token && isLongLink(token) && (
          <p className="land-share__long">
            Ссылка длинная ({token.length} знаков): в некоторых мессенджерах она обрежется. Скачай файл .html и отправь его
            или сократи землю.
          </p>
        )}
      </div>
    </Modal>
  );
}
