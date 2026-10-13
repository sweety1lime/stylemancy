import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Пиксельный шрифт с правильной русской кириллицей — для заголовков и кнопок
import '@fontsource/tiny5/400.css'
import './index.css'
import App from './App.tsx'
import { spriteCssUrl } from './pixel/pixelArt'
import { SKY_TILE } from './pixel/sprites'

document.documentElement.style.setProperty('--sky-tile', spriteCssUrl(SKY_TILE))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
