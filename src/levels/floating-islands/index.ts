import { defineRegion } from '../../engine/define';
import flex01 from './flex-01';
import flex02 from './flex-02';
import flex03 from './flex-03';
import flex04 from './flex-04';
import flex05 from './flex-05';
import flex06 from './flex-06';
import flex07 from './flex-07';
import flex08 from './flex-08';
import flex09 from './flex-09';
import flex10 from './flex-10';
import flex11 from './flex-11';
import flex12 from './flex-12';
import flex13 from './flex-13';
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
  levels: [
    flex01,
    flex02,
    flex03,
    flex04,
    flex05,
    flex06,
    flex07,
    flex08,
    flex09,
    flex10,
    flex11,
    flex12,
    flex13,
  ],
});
