import { defineRegion } from '../../engine/define';
import flex01 from './flex-01';
import flex02 from './flex-02';
import flex03 from './flex-03';
import sceneCss from './scene.css?raw';

/** Свойства Flexbox — единственная магия, которая действует на островах. */
export const FLEX_PROPERTIES = [
  'display',
  'flex-direction',
  'flex-wrap',
  'flex-flow',
  'justify-content',
  'align-items',
  'align-content',
  'align-self',
  'place-content',
  'order',
  'gap',
  'row-gap',
  'column-gap',
  'flex',
  'flex-grow',
  'flex-shrink',
  'flex-basis',
];

export const floatingIslands = defineRegion({
  id: 'floating-islands',
  title: 'Парящие острова',
  topic: 'Flexbox',
  npc: { name: 'Магистр Флекс', title: 'хранитель Парящих островов' },
  sceneCss,
  allow: FLEX_PROPERTIES,
  allowMessage: 'На Парящих островах действует только магия Flexbox',
  levels: [flex01, flex02, flex03],
});
