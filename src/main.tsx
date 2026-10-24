import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Пиксельный шрифт с правильной русской кириллицей — для заголовков и кнопок
import '@fontsource/tiny5/400.css'
import './index.css'
import App from './App.tsx'
import { CrashScreen, ErrorBoundary } from './components/ErrorBoundary'
import { spriteCssUrl } from './pixel/pixelArt'
import { SKY_TILE } from './pixel/sprites'

document.documentElement.style.setProperty('--sky-tile', spriteCssUrl(SKY_TILE))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Последняя страховка: сломалась сама шапка или каркас игры */}
    <ErrorBoundary fallback={(error) => <CrashScreen error={error} onRetry={() => window.location.reload()} wholePage />}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
