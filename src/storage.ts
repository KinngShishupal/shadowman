import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LevelRecord {
  stars: number;
  bestTime: number;
}

export interface Progress {
  unlocked: number;
  records: Record<number, LevelRecord>;
}

const KEY = 'shadowman.progress.v1';

export const EMPTY_PROGRESS: Progress = { unlocked: 0, records: {} };

export async function loadProgress(): Promise<Progress> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Progress;
      return { ...EMPTY_PROGRESS, ...parsed };
    }
  } catch {
    // Storage unavailable: play without saved progress.
  }
  return EMPTY_PROGRESS;
}

export async function saveProgress(p: Progress) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // Ignore write failures; progress lives in memory for this session.
  }
}

export function recordResult(
  p: Progress,
  level: number,
  stars: number,
  time: number,
  levelCount: number,
): Progress {
  const prev = p.records[level];
  return {
    unlocked: Math.min(levelCount - 1, Math.max(p.unlocked, level + 1)),
    records: {
      ...p.records,
      [level]: {
        stars: Math.max(prev?.stars ?? 0, stars),
        bestTime: prev ? Math.min(prev.bestTime, time) : time,
      },
    },
  };
}

/**
 * Saves from older builds capped 'unlocked' at their last chapter, so derive it
 * again from the chapters actually finished.
 */
export function normalizeProgress(p: Progress, levelCount: number): Progress {
  const finished = Object.keys(p.records).map(k => Number(k) + 1);
  return {
    ...p,
    unlocked: Math.min(levelCount - 1, Math.max(p.unlocked, ...finished)),
  };
}
