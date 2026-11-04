import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Пиксельный шрифт с правильной русской кириллицей — для заголовков и кнопок
import '@fontsource/tiny5/400.css'
// Шрифты вида «Сумрак»: файлы грузятся, только когда вид включён и текст ими набран
import '@fontsource/cormorant-garamond/600.css'
import '@fontsource/golos-text/400.css'
import '@fontsource/golos-text/500.css'
import './index.css'
import './noir/noir.css'
import './noir/rig/rig.css'
import App from './App.tsx'
import { CrashScreen, ErrorBoundary } from './components/ErrorBoundary'
import { watchFrames } from './game/frameWatch'
import { spriteCssUrl } from './pixel/pixelArt'
import { SKY_TILE } from './pixel/sprites'

document.documentElement.style.setProperty('--sky-tile', spriteCssUrl(SKY_TILE))

// После новой публикации старых файлов на сайте нет: вкладка, открытая до неё, получит новые после перезагрузки
window.addEventListener('vite:preloadError', () => {
  if (!navigator.onLine) return
  try {
    if (Date.now() - Number(sessionStorage.getItem('cascadia.reloadedAt')) < 10_000) return
    sessionStorage.setItem('cascadia.reloadedAt', String(Date.now()))
  } catch {
    return
  }
  window.location.reload()
})

// Слабый компьютер не успевает за полными эффектами — игра сама включит лёгкие
watchFrames()
// Браузером управляет автотест: фоновое движение — ступенями (см. ambient-still в index.css)
if (navigator.webdriver) document.documentElement.classList.add('ambient-still')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Последняя страховка: сломалась сама шапка или каркас игры */}
    <ErrorBoundary fallback={(error) => <CrashScreen error={error} onRetry={() => window.location.reload()} wholePage />}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
