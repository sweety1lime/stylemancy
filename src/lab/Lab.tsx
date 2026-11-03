import { useEffect, useState } from 'react';
import { Board } from './Board';
import { kitParts } from './parts';
import { LAND_DEFS } from './lands';
import { LandsView } from './LandsView';
import { CastView } from './CastView';
import { flatKit } from './kits/flat';
import { glassKit } from './kits/glass';
import { inkKit } from './kits/ink';
import { neonKit } from './kits/neon';
import { noirKit } from './kits/noir';
import { paperKit } from './kits/paper';
import { pixelBoard } from './kits/pixel';
import { silhouetteKit } from './kits/silhouette';
import type { Kit } from './types';

/*
  Примерочная стилей: одни и те же сцены в разных стилях, чтобы выбрать глазами.
  Только для разработки: npm run dev → /lab.html. В сборку не входит.
*/

const KITS: Kit[] = [noirKit, silhouetteKit, glassKit, neonKit, flatKit, inkKit, paperKit];

const TABS = [
  { id: 'pixel', label: 'Сейчас' },
  { id: 'noir', label: 'Сумрак' },
  { id: 'lands', label: 'Свет земель' },
  { id: 'cast', label: 'Персонажи' },
  { id: 'silhouette', label: 'Силуэты' },
  { id: 'glass', label: 'Витраж', old: true },
  { id: 'neon', label: 'Неон', old: true },
  { id: 'flat', label: 'Плоская', old: true },
  { id: 'ink', label: 'Тушь', old: true },
  { id: 'paper', label: 'Бумага', old: true },
  { id: 'all', label: 'Все подряд' },
];

function readTab(): string {
  const id = window.location.hash.slice(1);
  return TABS.some((tab) => tab.id === id) ? id : 'noir';
}

function KitBoard({ kit }: { kit: Kit }) {
  return <Board id={kit.id} name={kit.name} about={kit.about} traits={kit.traits} {...kitParts(kit)} />;
}

export function Lab() {
  const [tab, setTab] = useState(readTab);

  useEffect(() => {
    const onHash = () => setTab(readTab());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const pick = (id: string) => {
    history.replaceState(null, '', `#${id}`);
    setTab(id);
  };

  const shown = tab === 'all' ? ['pixel', ...KITS.map((kit) => kit.id)] : tab === 'lands' || tab === 'cast' ? [] : [tab];

  return (
    <div className="lab">
      {/* Фильтры и узоры всех стилей: на них ссылаются рисунки на странице */}
      <svg className="lab__defs" aria-hidden="true" focusable="false">
        <defs>
          {KITS.map((kit) => (
            <g key={kit.id}>{kit.defs}</g>
          ))}
          {LAND_DEFS}
        </defs>
      </svg>

      <header className="lab__head">
        <div>
          <h1 className="lab__title">Примерочная стилей</h1>
          <p className="lab__note">Одни и те же сцены в разных стилях. Ветка redesign-probe, только локально.</p>
        </div>
        <nav className="lab__tabs" aria-label="Стили">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`lab__tab${tab === item.id ? ' lab__tab--on' : ''}${item.old ? ' lab__tab--old' : ''}`}
              title={item.old ? 'Прошлые пробы' : undefined}
              aria-pressed={tab === item.id}
              onClick={() => pick(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="lab__boards">
        {tab === 'lands' && <LandsView />}
        {tab === 'cast' && <CastView />}
        {shown.map((id) => {
          if (id === 'pixel') return <Board key="pixel" id="pixel" {...pixelBoard} />;
          const kit = KITS.find((item) => item.id === id);
          return kit ? <KitBoard key={id} kit={kit} /> : null;
        })}
      </main>
    </div>
  );
}
