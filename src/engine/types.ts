/** Размер сцены по умолчанию — в CSS-пикселях внутри iframe. */
export const DEFAULT_SCENE = { width: 600, height: 360 } as const;

/** Уровень в том виде, в каком его пишет автор. */
export interface LevelDef {
  /** Уникальный id, по нему хранится прогресс: 'flex-02' */
  id: string;
  title: string;
  /** Реплики персонажа перед задачей */
  dialog: string[];
  /** Задача простым техническим языком. `Обратные кавычки` превращаются в код */
  task: string;
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
  };
  /** Подсказки — от общей идеи к почти готовому ответу */
  hints: string[];
  /** Заклинание, которое открывает уровень (ключ в SPELLS) */
  learns?: string;
  /** Испытание в конце района — на тропе отмечается особо */
  trial?: boolean;
  /** Свойства, запрещённые именно в этом уровне */
  forbid?: string[];
  /** Дополнительное оформление сцены только для этого уровня */
  sceneCss?: string;
  scene?: { width: number; height: number };
}

export interface Npc {
  name: string;
  title: string;
  /** Ключ пиксельного портрета в PORTRAITS */
  portrait: string;
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
  levels: LevelDef[];
}

/** Уровень, дополненный настройками района, — с ним работает движок. */
export interface Level extends LevelDef {
  regionId: string;
  regionTitle: string;
  npc: Npc;
  sceneCss: string;
  allow?: string[];
  allowMessage?: string;
  scene: { width: number; height: number };
}

export interface Region extends Omit<RegionDef, 'levels'> {
  levels: Level[];
}
