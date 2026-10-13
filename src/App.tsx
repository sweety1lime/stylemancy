import { useState } from 'react';
import { LevelScreen } from './components/LevelScreen';
import { Stars } from './components/Stars';
import { currentLevel, progress, useProgress } from './game/progress';
import { regions } from './levels';
import './App.css';

// Пока один район; карта мира появится на этапе 2
const region = regions[0];

function initialIndex(): number {
  const saved = region.levels.findIndex((level) => level.id === currentLevel.get());
  if (saved !== -1) return saved;
  const firstUnsolved = region.levels.findIndex((level) => !progress.get(level.id).completed);
  return firstUnsolved === -1 ? 0 : firstUnsolved;
}

export default function App() {
  const progressMap = useProgress();
  const [index, setIndex] = useState(initialIndex);
  const level = region.levels[index];
  const hasNext = index + 1 < region.levels.length;

  function open(i: number) {
    setIndex(i);
    currentLevel.set(region.levels[i].id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">
            ✦
          </span>
          Каскадия
        </div>
        <nav className="levels" aria-label={`Район «${region.title}»`}>
          <span className="levels__region">{region.title}</span>
          <ol className="levels__list">
            {region.levels.map((item, i) => {
              const done = progressMap[item.id]?.completed;
              const classes = ['level-dot', i === index && 'level-dot--current', done && 'level-dot--done'];
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={classes.filter(Boolean).join(' ')}
                    aria-label={`Уровень ${i + 1}: ${item.title}`}
                    aria-current={i === index ? 'step' : undefined}
                    onClick={() => open(i)}
                  >
                    <span className="level-dot__num">{i + 1}</span>
                    {done && <Stars count={progressMap[item.id].stars} />}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </header>
      <LevelScreen
        key={level.id}
        level={level}
        number={index + 1}
        onNext={hasNext ? () => open(index + 1) : undefined}
      />
    </div>
  );
}
