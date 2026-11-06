import { useMemo, useState } from 'react';
import type { StudentRow } from '../game/teacher';
import { useLandImages } from '../land/images';
import type { Land } from '../land/model';
import { renderLand, type LandImages } from '../land/sanitize';
import { LAND_TASKS } from '../land/tasks';
import { plural } from '../lib/plural';
import { LandFrame } from './LandFrame';
import { Modal } from './Modal';
import '../land/land.css';

interface ClassLandsProps {
  students: StudentRow[];
  lands: Record<string, Land[]>;
  tasks: Record<string, string[]>;
}

/**
 * «Земли студентов» в панели учителя: все земли класса с миниатюрами, а по клику — страница и код. Учитель видит землю
 * всегда, подписана она ником или нет: поэтому студентам об этом сказано на экране «Моя земля». Править чужую землю нельзя.
 */
export function ClassLands({ students, lands, tasks }: ClassLandsProps) {
  const images = useLandImages();
  const [open, setOpen] = useState<{ student: StudentRow; land: Land } | null>(null);
  const builders = students.filter((student) => (lands[student.id] ?? []).length > 0);
  const total = builders.reduce((sum, student) => sum + lands[student.id].length, 0);

  return (
    <section className="class-lands px-panel" aria-label="Земли студентов">
      <header className="class-lands__head">
        <h3 className="pixel-subtitle">Земли студентов</h3>
        <p className="class-lands__summary">
          {builders.length === 0
            ? 'Пока никто не построил свою землю'
            : `Построили ${builders.length} из ${students.length}: ${total} ${plural(total, 'земля', 'земли', 'земель')}`}
        </p>
      </header>
      {builders.length > 0 && (
        <ul className="class-lands__list">
          {builders.map((student) => {
            const done = tasks[student.id]?.filter((id) => LAND_TASKS.some((task) => task.id === id)).length ?? 0;
            return (
              <li key={student.id} className="class-lands__student">
                <p className="class-lands__name">
                  {student.nickname}
                  <span>
                    заданий выполнено: {done} из {LAND_TASKS.length}
                  </span>
                </p>
                <div className="class-lands__cards">
                  {lands[student.id].map((land) => (
                    <LandThumb key={land.slot} land={land} images={images} onOpen={() => setOpen({ student, land })} />
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {open && <LandView student={open.student} land={open.land} images={images} onClose={() => setOpen(null)} />}
    </section>
  );
}

function LandThumb({ land, images, onOpen }: { land: Land; images: LandImages; onOpen: () => void }) {
  const page = useMemo(() => renderLand(land, images).document, [land, images]);
  return (
    <button type="button" className="class-lands__thumb" onClick={onOpen} aria-label={`Открыть землю «${land.title || 'Без названия'}»`}>
      <span className="land-card__thumb" aria-hidden="true">
        <iframe title="" sandbox="" srcDoc={page} tabIndex={-1} />
      </span>
      <span className="class-lands__title">{land.title || 'Без названия'}</span>
    </button>
  );
}

function LandView({ student, land, images, onClose }: { student: StudentRow; land: Land; images: LandImages; onClose: () => void }) {
  const rendered = useMemo(() => renderLand(land, images), [land, images]);
  return (
    <Modal title={`${student.nickname} · ${land.title || 'Без названия'}`} onClose={onClose} className="class-lands__modal">
      <LandFrame page={rendered.document} title={land.title} height={380} />
      <details className="class-lands__code">
        <summary>Код земли</summary>
        <h4>index.html</h4>
        <pre className="example__code">
          <code>{land.html || '(пусто)'}</code>
        </pre>
        <h4>style.css</h4>
        <pre className="example__code">
          <code>{land.css || '(пусто)'}</code>
        </pre>
      </details>
    </Modal>
  );
}
