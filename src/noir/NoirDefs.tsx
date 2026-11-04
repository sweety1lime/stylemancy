import { NOIR_DEFS } from './defs';

/** Фильтры и градиенты «Сумрака» — один раз на странице: рисунки ссылаются на них по id. */
export function NoirDefs() {
  return (
    <svg className="noir-defs" aria-hidden="true" focusable="false">
      <defs>{NOIR_DEFS}</defs>
    </svg>
  );
}
