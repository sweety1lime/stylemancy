import { useEffect } from 'react';
import { LandTrail } from './components/LandTrail';
import { LevelScreen } from './components/LevelScreen';
import type { RegionStats } from './components/ResultPanel';
import { TopBar } from './components/TopBar';
import { WorldMap } from './components/WorldMap';
import { useProgress } from './game/progress';
import { hrefFor, navigate, parseHash, useHash } from './game/router';
import { findLand, findLevel } from './levels';
import './App.css';

export default function App() {
  const hash = useHash();
  const route = parseHash(hash);
  const progress = useProgress();

  // Каждый экран открывается с начала страницы
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [hash]);

  if (route.name === 'level') {
    const place = findLevel(route.id);
    if (place) {
      const { level, region, land, index } = place;
      const next = region.levels[index + 1];
      const stats: RegionStats = {
        title: region.title,
        completed: region.levels.filter((item) => progress[item.id]?.completed).length,
        total: region.levels.length,
        stars: region.levels.reduce((sum, item) => sum + (progress[item.id]?.stars ?? 0), 0),
        maxStars: region.levels.length * 3,
      };
      const trailHref = hrefFor({ name: 'land', id: land.id });
      return (
        <div className="app">
          <TopBar back={{ href: trailHref, label: land.title }} />
          <LevelScreen
            key={level.id}
            level={level}
            number={index + 1}
            region={stats}
            trailHref={trailHref}
            onNext={next ? () => navigate({ name: 'level', id: next.id }) : undefined}
          />
        </div>
      );
    }
  }

  if (route.name === 'land') {
    const land = findLand(route.id);
    if (land && land.regions.length > 0) {
      return (
        <div className="app">
          <TopBar back={{ href: hrefFor({ name: 'map' }), label: 'Карта' }} />
          <LandTrail land={land} />
        </div>
      );
    }
  }

  return (
    <div className="app">
      <TopBar />
      <WorldMap />
    </div>
  );
}
