import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { CrashScreen, ErrorBoundary } from './components/ErrorBoundary';
import { LoginScreen } from './components/LoginScreen';
import { LandTrail } from './components/LandTrail';
import type { RegionStats } from './components/ResultPanel';
import { Toasts } from './components/Toasts';
import { TopBar } from './components/TopBar';
import { WorldMap } from './components/WorldMap';
import { isHtmlLevel, isJsLevel } from './engine/types';
import { canEnterLand, isScriptoriaOpen } from './game/access';
import { useAuth } from './game/auth';
import { useProgress } from './game/progress';
import { isRegionOpen } from './game/unlock';
import { hrefFor, navigate, parseHash, useHash } from './game/router';
import { findLand, findLevel, isScriptLand, type Land } from './levels';
import './App.css';

// Уровни с редактором кода и редкие экраны грузятся, когда до них дошли: так карта открывается быстрее
const loadLevelScreen = () => import('./components/LevelScreen');
const loadHtmlLevelScreen = () => import('./components/HtmlLevelScreen');
const loadJsLevelScreen = () => import('./components/JsLevelScreen');
const LevelScreen = lazy(() => loadLevelScreen().then((m) => ({ default: m.LevelScreen })));
const HtmlLevelScreen = lazy(() => loadHtmlLevelScreen().then((m) => ({ default: m.HtmlLevelScreen })));
const JsLevelScreen = lazy(() => loadJsLevelScreen().then((m) => ({ default: m.JsLevelScreen })));
const GrimoireScreen = lazy(() => import('./components/GrimoireScreen').then((m) => ({ default: m.GrimoireScreen })));
const AchievementsScreen = lazy(() => import('./components/AchievementsScreen').then((m) => ({ default: m.AchievementsScreen })));
const ChronicleScreen = lazy(() => import('./components/ChronicleScreen').then((m) => ({ default: m.ChronicleScreen })));
const CertificateScreen = lazy(() => import('./components/CertificateScreen').then((m) => ({ default: m.CertificateScreen })));
const TeacherScreen = lazy(() => import('./components/TeacherScreen').then((m) => ({ default: m.TeacherScreen })));

/** Пока подгружается код экрана: на медленной сети это заметно, на быстрой надпись не успевает появиться. */
function Loading() {
  return (
    <p className="loading" role="status">
      Загрузка…
    </p>
  );
}

/** Каркас экрана: верхняя панель, содержимое и уведомления о достижениях. */
function Screen({ back, children }: { back?: { href: string; label: string }; children: ReactNode }) {
  return (
    <div className="app">
      <TopBar back={back} />
      {/* На новом адресе сломанный экран рисуется заново. Адрес без своей подписки: иначе ключ
          сменится раньше, чем App передаст новый экран, и старый экран сломается ещё раз */}
      <ErrorBoundary key={window.location.hash} fallback={(error, reset) => <CrashScreen error={error} onRetry={reset} />}>
        <Suspense fallback={<Loading />}>{children}</Suspense>
      </ErrorBoundary>
      <Toasts />
    </div>
  );
}

/** Куда ведёт «назад» с тропы земли: на карту её мира. */
function mapOf(land: Land): { href: string; label: string } {
  return isScriptLand(land) ? { href: hrefFor({ name: 'scriptoria' }), label: 'Скриптория' } : { href: hrefFor({ name: 'map' }), label: 'Карта' };
}

export default function App() {
  const hash = useHash();
  const route = parseHash(hash);
  const progress = useProgress();
  const { account } = useAuth();

  // Каждый экран открывается с начала страницы
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [hash]);

  // Уровни открывают чаще всего: их код подгружаем заранее, когда первый экран уже нарисован
  useEffect(() => {
    const timer = setTimeout(() => {
      Promise.all([loadLevelScreen(), loadHtmlLevelScreen(), loadJsLevelScreen()]).catch(() => {
        // Нет связи: код подгрузится, когда студент откроет уровень
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (route.name === 'level') {
    const place = findLevel(route.id);
    if (place && canEnterLand(account, place.land, progress)) {
      const { level, region, land, index, regionIndex } = place;
      // Район ещё закрыт — показываем тропу: там видно, какое испытание его откроет
      if (!isRegionOpen(account, land, regionIndex, progress)) {
        return (
          <Screen back={mapOf(land)}>
            <LandTrail land={land} />
          </Screen>
        );
      }
      const next = region.levels[index + 1];
      const nextRegion = index === region.levels.length - 1 ? land.regions[regionIndex + 1] : undefined;
      const stats: RegionStats = {
        title: region.title,
        completed: region.levels.filter((item) => progress[item.id]?.completed).length,
        total: region.levels.length,
        stars: region.levels.reduce((sum, item) => sum + (progress[item.id]?.stars ?? 0), 0),
        maxStars: region.levels.length * 3,
        unlocks: nextRegion?.title,
      };
      const trailHref = hrefFor({ name: 'land', id: land.id });
      const screenProps = {
        number: index + 1,
        region: stats,
        trailHref,
        onNext: next ? () => navigate({ name: 'level', id: next.id }) : undefined,
      };
      return (
        <Screen back={{ href: trailHref, label: land.title }}>
          {isHtmlLevel(level) ? (
            <HtmlLevelScreen key={level.id} level={level} {...screenProps} />
          ) : isJsLevel(level) ? (
            <JsLevelScreen key={level.id} level={level} {...screenProps} />
          ) : (
            <LevelScreen key={level.id} level={level} {...screenProps} />
          )}
        </Screen>
      );
    }
  }

  if (route.name === 'land') {
    const land = findLand(route.id);
    if (land && land.regions.length > 0 && canEnterLand(account, land, progress)) {
      return (
        <Screen back={mapOf(land)}>
          <LandTrail land={land} />
        </Screen>
      );
    }
  }

  if (route.name === 'grimoire') {
    return (
      <Screen back={{ href: hrefFor({ name: 'map' }), label: 'Карта' }}>
        <GrimoireScreen />
      </Screen>
    );
  }

  if (route.name === 'login') {
    return (
      <Screen back={{ href: hrefFor({ name: 'map' }), label: 'Карта' }}>
        <LoginScreen />
      </Screen>
    );
  }

  if (route.name === 'teacher') {
    return (
      <Screen back={{ href: hrefFor({ name: 'map' }), label: 'Карта' }}>
        <TeacherScreen />
      </Screen>
    );
  }

  if (route.name === 'chronicle') {
    return (
      <Screen back={{ href: hrefFor({ name: 'map' }), label: 'Карта' }}>
        <ChronicleScreen />
      </Screen>
    );
  }

  if (route.name === 'certificate') {
    return (
      <Screen back={{ href: hrefFor({ name: 'chronicle' }), label: 'Летопись' }}>
        <CertificateScreen key={route.id} id={route.id} />
      </Screen>
    );
  }

  if (route.name === 'achievements') {
    return (
      <Screen back={{ href: hrefFor({ name: 'map' }), label: 'Карта' }}>
        <AchievementsScreen />
      </Screen>
    );
  }

  if (route.name === 'scriptoria' && isScriptoriaOpen(account, progress)) {
    return (
      <Screen back={{ href: hrefFor({ name: 'map' }), label: 'Каскадия' }}>
        <WorldMap key="scriptoria" world="scriptoria" />
      </Screen>
    );
  }

  return (
    <Screen>
      <WorldMap key="cascadia" world="cascadia" />
    </Screen>
  );
}
