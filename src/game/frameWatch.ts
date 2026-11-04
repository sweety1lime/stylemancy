import { notify } from './notices';
import { settings } from './settings';

/*
  Следит, успевает ли компьютер рисовать полные эффекты. Если кадры идут реже 24 в секунду,
  включает лёгкие эффекты и говорит об этом. Только пока игрок сам не выбирал эффекты, и не в автотестах:
  там браузер рисует без видеокарты, и замер был бы нечестным.
*/

/** Медленный кадр: дольше этого — меньше 24 кадров в секунду */
const SLOW_FRAME = 1000 / 24;
/** Сколько смотреть на кадры и сколько подождать, пока экран загрузится */
const SAMPLE = 3000;
const SETTLE = 2500;
/** Сколько экранов проверить: карта, тропа, первый уровень — дальше хватит */
const CHECKS = 3;

let checks = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
let frame = 0;

function eligible(): boolean {
  const { effects, effectsChosen } = settings.get();
  return effects === 'full' && !effectsChosen && !navigator.webdriver && checks < CHECKS;
}

/** Медиана промежутков между кадрами за SAMPLE мс; скрытая вкладка — замер не в счёт */
function sample(done: (median: number | null) => void) {
  const gaps: number[] = [];
  let last = 0;
  const start = performance.now();
  const tick = (now: number) => {
    if (document.hidden) return done(null);
    if (last) gaps.push(now - last);
    last = now;
    if (now - start < SAMPLE) {
      frame = requestAnimationFrame(tick);
      return;
    }
    gaps.sort((a, b) => a - b);
    // Кадров почти не было — значит, каждый рисовался очень долго
    done(gaps.length > 10 ? gaps[Math.floor(gaps.length / 2)] : Number.POSITIVE_INFINITY);
  };
  frame = requestAnimationFrame(tick);
}

function check() {
  if (!eligible()) return;
  clearTimeout(timer);
  cancelAnimationFrame(frame);
  timer = setTimeout(() => {
    sample((median) => {
      if (median === null || !eligible()) return;
      checks++;
      if (median <= SLOW_FRAME) return;
      settings.update({ effects: 'light' });
      notify({
        title: 'Включены лёгкие эффекты',
        text: 'Компьютер не успевал рисовать фон и частицы. Вернуть полные — кнопка со звёздочкой вверху.',
      });
    });
  }, SETTLE);
}

/** Запустить слежку: замер на старте и после перехода на новый экран */
export function watchFrames() {
  check();
  window.addEventListener('hashchange', check);
}
