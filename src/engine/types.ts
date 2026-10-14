/** Размер сцены по умолчанию — в CSS-пикселях внутри iframe. */
export const DEFAULT_SCENE = { width: 600, height: 360 } as const;

/** Общее у всех уровней: реплики, задача, подсказки. */
interface LevelBase {
  /** Уникальный id, по нему хранится прогресс: 'flex-02' */
  id: string;
  title: string;
  /** Реплики персонажа перед задачей */
  dialog: string[];
  /** Задача простым техническим языком. `Обратные кавычки` превращаются в код */
  task: string;
  /** Подсказки — от общей идеи к почти готовому ответу */
  hints: string[];
  /** Заклинание, которое открывает уровень (ключ в SPELLS) */
  learns?: string;
  /** Испытание в конце района — на тропе отмечается особо */
  trial?: boolean;
  /** Дополнительное оформление сцены только для этого уровня */
  sceneCss?: string;
  scene?: { width: number; height: number };
}

/** CSS-уровень: студент пишет стили, предметы сцены сравниваются с эталоном по положению. */
export interface CssLevelDef extends LevelBase {
  kind?: 'css';
  /** Разметка сцены — содержимое body */
  html: string;
  /** Код, с которого студент начинает */
  starterCss: string;
  /** Эталонное решение: по нему строятся цели и идёт проверка */
  solutionCss: string;
  check: {
    /** Селектор предметов, положение которых сравнивается с эталоном */
    items: string;
    /** Подпись предмета, если у элемента нет data-name */
    itemLabel?: string;
    /** Как назвать все предметы сразу: «Все кристаллы смещены одинаково…» */
    groupName?: string;
    /** Допуск в пикселях */
    tolerance?: number;
    /** Ширины «зеркал» для адаптива: сцена проверяется на каждой */
    viewports?: number[];
  };
  /** Свойства, запрещённые именно в этом уровне */
  forbid?: string[];
  /** Приёмы, без которых уровень не засчитывается: регулярное выражение и объяснение */
  require?: { pattern: string; message: string }[];
}

/** Цель HTML-уровня: что должно найтись в разметке студента. */
export interface HtmlGoal {
  /** Что видит студент в списке целей: «Заголовок h1 „Деревня Тегов“» */
  label: string;
  /** CSS-селектор по разметке студента */
  selector?: string;
  /** Сколько элементов нужно: точно, не меньше, не больше. По умолчанию — хотя бы один */
  count?: number;
  min?: number;
  max?: number;
  /** Текст элемента — без учёта регистра, лишних пробелов и знаков препинания по краям */
  text?: string;
  /** Текст элемента содержит эту фразу */
  contains?: string;
  /** Документ начинается с <!doctype html> */
  doctype?: boolean;
  /** В разметке нет ни одной ошибки — для уровней, где разметку чинят */
  clean?: boolean;
  /** Что сказать, если цель не выполнена */
  hint?: string;
}

/** HTML-уровень: студент пишет или чинит разметку; проверяются цели и ошибки в разметке. */
export interface HtmlLevelDef extends LevelBase {
  kind: 'html';
  /** Разметка, с которой студент начинает: пустая, черновик или испорченная Лордом Дефолтом */
  starterHtml: string;
  /** Эталонная разметка — для самопроверки уровня и «своего пути» */
  solutionHtml: string;
  goals: HtmlGoal[];
  /** Студент пишет документ целиком — с <!doctype>, <head> и <body>, а не только содержимое страницы */
  document?: boolean;
}

/** Уровень в том виде, в каком его пишет автор. */
export type LevelDef = CssLevelDef | HtmlLevelDef;

export interface Npc {
  name: string;
  title: string;
  /** Ключ пиксельного портрета в PORTRAITS */
  portrait: string;
}

/** Кадр сценки: готовая пиксельная картинка и подпись. */
export interface StoryFrame {
  art: 'kingdom' | 'villain' | 'fallen' | 'mentor' | 'crown' | 'window' | 'shards' | 'mirrors' | 'citadel' | 'village' | 'scroll' | 'fair' | 'city' | 'forge';
  /** Чей портрет показать рядом с текстом (ключ в PORTRAITS) */
  speaker?: string;
  name?: string;
  text: string;
}

export interface RegionDef {
  id: string;
  title: string;
  topic: string;
  npc: Npc;
  /** Оформление сцен района. Студент его не видит и не меняет */
  sceneCss: string;
  /** Разрешённые свойства: всё остальное — «не та магия» */
  allow?: string[];
  /** Начало сообщения о неразрешённом свойстве */
  allowMessage?: string;
  /** Сценки: пролог при первом входе и победная сцена после испытания */
  story?: { intro: StoryFrame[]; outro: StoryFrame[] };
  levels: LevelDef[];
}

/** Что уровень получает от района. */
interface RegionPart {
  regionId: string;
  regionTitle: string;
  npc: Npc;
  sceneCss: string;
  allow?: string[];
  allowMessage?: string;
  scene: { width: number; height: number };
}

/** Уровни, дополненные настройками района, — с ними работает движок. */
export type CssLevel = CssLevelDef & RegionPart;
export type HtmlLevel = HtmlLevelDef & RegionPart;
export type Level = CssLevel | HtmlLevel;

export function isHtmlLevel(level: Level): level is HtmlLevel {
  return level.kind === 'html';
}

export interface Region extends Omit<RegionDef, 'levels'> {
  levels: Level[];
}
