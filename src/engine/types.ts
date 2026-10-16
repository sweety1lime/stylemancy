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
    /** Важно, кто кого заслоняет (z-index): сравнивается, чей предмет сверху в центре каждого */
    stacking?: boolean;
    /**
     * Уровни про селекторы: сравнивается не место предмета, а значение этого свойства (обычно color) —
     * то есть какие предметы нашёл селектор и чьё правило победило
     */
    style?: string;
    /** Уровни про :hover: во втором зеркале элементы с этим селектором считаются наведёнными мышью */
    hover?: string;
  };
  /**
   * Чары Лорда Дефолта: стили сцены, которые студент видит, но изменить не может.
   * Идут после его кода — при равной специфичности побеждают они
   */
  lockedCss?: string;
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

/**
 * Подземелье «Пути героя». Карта — строки одинаковой длины:
 * # — стена, . — пол, g — кристалл, b — баг, E — выход, 1–9 — табличка с числом,
 * > < ^ v — герой и куда он смотрит.
 */
export interface Dungeon {
  /** Подпись на вкладке: «Длинный коридор». По умолчанию — «Подземелье 2» */
  label?: string;
  map: string[];
}

/**
 * Запуск JS-уровня. Если запусков несколько, код должен сработать в каждом — как «зеркала» в адаптиве:
 * так ответ не заучить, нужно решение.
 */
export interface JsRun {
  /** Подпись запуска: «Гость Аня» */
  label?: string;
  /** Ответы на prompt по порядку */
  inputs?: string[];
  /** Подземелье, по которому идёт герой */
  dungeon?: Dungeon;
}

/** Приём в коде: регулярное выражение (комментарии в коде не считаются) и объяснение. */
export interface CodeRule {
  pattern: string;
  message: string;
}

/** JS-уровень: студент пишет скрипт; вывод Оракула и колбы-переменные сравниваются с эталоном. */
export interface JsLevelDef extends LevelBase {
  kind: 'js';
  /** Скрипт, с которого студент начинает: пустой, черновик или испорченный Лордом Дефолтом */
  starterJs: string;
  /** Эталонный скрипт: по нему строятся цели */
  solutionJs: string;
  check: {
    /** Сравнивать всё, что сказал Оракул (console.log, alert), — строки по порядку */
    output?: boolean;
    /** Колбы: переменные верхнего уровня, у которых сравниваются значение и тип */
    vars?: string[];
  };
  /** Запуски с разными ответами на prompt. По умолчанию — один запуск */
  runs?: JsRun[];
  /**
   * «Путь героя»: код ведёт героя по каждому подземелью — до выхода и со всеми кристаллами.
   * Подземелья разные, поэтому маршрут не заучить — нужен алгоритм
   */
  dungeons?: Dungeon[];
  /** Звезда за краткость: строк кода (без пустых, комментариев и одиноких скобок) — не больше */
  maxLines?: number;
  /**
   * «Алхимия функций»: вызовы-флаконы, которые после скрипта едут по конвейеру, — `double(5)`.
   * Что вернул каждый вызов, сравнивается с эталоном: значение и тип
   */
  calls?: string[];
  /** Приёмы, без которых уровень не засчитывается */
  require?: CodeRule[];
  /** Запрещённые приёмы: «12 не пиши числом — пусть посчитает Оракул» */
  reject?: CodeRule[];
}

/** Уровень в том виде, в каком его пишет автор. */
export type LevelDef = CssLevelDef | HtmlLevelDef | JsLevelDef;

export interface Npc {
  name: string;
  title: string;
  /** Ключ пиксельного портрета в PORTRAITS */
  portrait: string;
}

/**
 * Когда показывать кадр: сюжет помнит, какие земли герой уже спас.
 * Все указанные условия должны выполняться одновременно.
 */
export interface StoryCondition {
  /** Ещё ни одна земля не спасена — первая глава */
  firstChapter?: boolean;
  /** Спасена хотя бы одна земля */
  anyDone?: boolean;
  /** Эти земли уже спасены */
  done?: string[];
  /** Эти земли ещё не спасены */
  notDone?: string[];
  /** Спасены все земли королевства (или ещё нет — false) */
  allDone?: boolean;
  /** Есть открытая и ещё не спасённая земля, куда можно отправиться дальше (или нет — false) */
  next?: boolean;
}

/**
 * Кадр сценки: готовая пиксельная картинка и подпись.
 * В тексте можно писать {name} — ник героя, {next} — следующую землю, {cursed} — где ещё держится проклятие.
 */
export interface StoryFrame {
  art:
    | 'kingdom'
    | 'villain'
    | 'fallen'
    | 'mentor'
    | 'crown'
    | 'window'
    | 'shards'
    | 'mirrors'
    | 'citadel'
    | 'village'
    | 'scroll'
    | 'fair'
    | 'city'
    | 'forge'
    | 'academy'
    | 'chaos'
    | 'fortress'
    | 'forest'
    // Скриптория
    | 'gate'
    | 'clockwork'
    | 'oracle'
    | 'shop'
    | 'jester'
    | 'maze'
    | 'carousel'
    | 'villain-script'
    | 'conveyor'
    | 'ghost'
    | 'train'
    | 'archive';
  /** Чей портрет показать рядом с текстом (ключ в PORTRAITS) */
  speaker?: string;
  name?: string;
  text: string;
  when?: StoryCondition;
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
export type JsLevel = JsLevelDef & RegionPart;
export type Level = CssLevel | HtmlLevel | JsLevel;

export function isHtmlLevel(level: Level): level is HtmlLevel {
  return level.kind === 'html';
}

export function isJsLevel(level: Level): level is JsLevel {
  return level.kind === 'js';
}

export function isCssLevel(level: Level): level is CssLevel {
  return level.kind === undefined || level.kind === 'css';
}

export interface Region extends Omit<RegionDef, 'levels'> {
  levels: Level[];
}
