import {
  chapter1,
  chapter2,
  chapter3,
  chapter4,
  chapter5,
} from './levels/act1';
import {
  chapter10,
  chapter6,
  chapter7,
  chapter8,
  chapter9,
} from './levels/act2';
import {
  chapter11,
  chapter12,
  chapter13,
  chapter14,
  chapter15,
} from './levels/act3';
import {
  chapter16,
  chapter17,
  chapter18,
  chapter19,
  chapter20,
} from './levels/act4';
import { LevelData } from './types';

export const LEVELS: LevelData[] = [
  chapter1(),
  chapter2(),
  chapter3(),
  chapter4(),
  chapter5(),
  chapter6(),
  chapter7(),
  chapter8(),
  chapter9(),
  chapter10(),
  chapter11(),
  chapter12(),
  chapter13(),
  chapter14(),
  chapter15(),
  chapter16(),
  chapter17(),
  chapter18(),
  chapter19(),
  chapter20(),
];

export const BOSS_CHAPTER = 19;
