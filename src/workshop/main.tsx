import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/tiny5/400.css';
import '../index.css';
import '../App.css';
import './workshop.css';
import { spriteCssUrl } from '../pixel/pixelArt';
import { SKY_TILE } from '../pixel/sprites';
import { Workshop } from './Workshop';

document.documentElement.style.setProperty('--sky-tile', spriteCssUrl(SKY_TILE));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Workshop />
  </StrictMode>,
);
