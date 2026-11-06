import { isLandDone } from '../game/story';
import { useProgress, type ProgressMap } from '../game/progress';
import { stats, useStats } from '../game/stats';
import { allLands } from '../levels';
import type { Light } from './lights';

/*
  Свет посоха: цвет огонька на посохе героя в «Сумраке». Один открыт сразу, остальные — по одному за спасённую землю.
  Выбранный цвет виден везде, где есть герой: у кнопки «Сотворить», в сценках, на карте, в подземелье;
  на карте он же красит световой след. Выбор лежит в статистике аккаунта и ходит за ним на другие компьютеры.
*/

export interface StaffLightOption {
  id: string;
  name: string;
  /** Круг света вокруг огонька — один из градиентов sil-light-* из defs.tsx */
  light: Light;
  /** Сердцевина огонька и кольцо вспышки при заклинании */
  core: string;
  burst: string;
  /** Световой след героя на карте: линия и её свечение */
  trail: string;
  trailGlow: string;
  /** Земля, за спасение которой открывается цвет; у цвета по умолчанию её нет */
  land?: string;
  /** Сколько творческих заданий «Моей земли» нужно выполнить, чтобы открылся цвет */
  tasks?: number;
}

export const STAFF_LIGHTS: StaffLightOption[] = [
  { id: 'ice', name: 'Лунный', light: 'ice', core: '#eef8ff', burst: '#cfe9ff', trail: '#ffd9a0', trailGlow: 'rgba(255, 200, 130, 0.9)' },
  { id: 'amber', name: 'Янтарный', light: 'amber', core: '#fff0d6', burst: '#ffd29a', trail: '#ffc880', trailGlow: 'rgba(255, 170, 80, 0.9)', land: 'tags-valley' },
  { id: 'emerald', name: 'Изумрудный', light: 'emerald', core: '#e8fff4', burst: '#9dffd0', trail: '#9dffd0', trailGlow: 'rgba(93, 255, 176, 0.85)', land: 'selector-forest' },
  { id: 'ruby', name: 'Рубиновый', light: 'ruby', core: '#fff0f3', burst: '#ffb0c0', trail: '#ffa0b4', trailGlow: 'rgba(255, 123, 152, 0.85)', land: 'block-fortress' },
  { id: 'amethyst', name: 'Аметистовый', light: 'amethyst', core: '#f6efff', burst: '#dcc4ff', trail: '#d4b8ff', trailGlow: 'rgba(201, 162, 255, 0.85)', land: 'floating-lands' },
  { id: 'cyan', name: 'Бирюзовый', light: 'cyan', core: '#effffe', burst: '#a8f8ff', trail: '#9ff3ff', trailGlow: 'rgba(111, 243, 255, 0.85)', land: 'script-gates' },
  { id: 'sapphire', name: 'Сапфировый', light: 'sapphire', core: '#eef5ff', burst: '#b5d2ff', trail: '#a8c8ff', trailGlow: 'rgba(143, 192, 255, 0.85)', land: 'decision-maze' },
  { id: 'topaz', name: 'Топазовый', light: 'topaz', core: '#fffbe0', burst: '#ffe89a', trail: '#ffe07a', trailGlow: 'rgba(255, 211, 107, 0.85)', land: 'recipe-workshop' },
  { id: 'gold', name: 'Золотой', light: 'gold', core: '#fffaf0', burst: '#ffe2a0', trail: '#ffd27a', trailGlow: 'rgba(255, 210, 122, 0.9)', land: 'mechanism-city' },
  { id: 'dawn', name: 'Рассветный', light: 'rose', core: '#fff1f7', burst: '#ffc3dd', trail: '#ffb4d6', trailGlow: 'rgba(255, 150, 200, 0.85)', tasks: 3 },
];

const DEFAULT = STAFF_LIGHTS[0];

/**
 * Какие цвета открыты: цвет по умолчанию, по одному за каждую спасённую землю и один за творческие задания «Моей земли».
 * Число выполненных заданий по умолчанию берётся из статистики; хуки передают его сами, чтобы экран обновлялся.
 */
export function unlockedStaffLights(progress: ProgressMap, landTasks: number = stats.get().landTasks.length): Set<string> {
  const open = new Set<string>([DEFAULT.id]);
  for (const option of STAFF_LIGHTS) {
    const land = option.land && allLands.find((item) => item.id === option.land);
    if (land && isLandDone(land, progress)) open.add(option.id);
    if (option.tasks !== undefined && landTasks >= option.tasks) open.add(option.id);
  }
  return open;
}

/** Выбранный цвет; закрытый или неизвестный (например, из старого сохранения) заменяется цветом по умолчанию */
export function useStaffLight(): StaffLightOption {
  const { staff, landTasks } = useStats();
  const progress = useProgress();
  const option = STAFF_LIGHTS.find((item) => item.id === staff);
  return option && unlockedStaffLights(progress, landTasks.length).has(option.id) ? option : DEFAULT;
}

export function chooseStaffLight(id: string): void {
  stats.update(() => ({ staff: id }));
}
