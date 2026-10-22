/**
 * Shadowman — a silhouette action platformer.
 *
 * @format
 */

import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { initAudio } from './src/audio/audio';
import { COLORS } from './src/game/constants';
import { LEVELS } from './src/game/levels';
import { ACTS, CHAPTERS, EPILOGUE, PROLOGUE, themeOf } from './src/game/story';
import { GameScreen } from './src/screens/GameScreen';
import { LevelSelectScreen } from './src/screens/LevelSelectScreen';
import { MenuScreen } from './src/screens/MenuScreen';
import { StoryPage, StoryScreen } from './src/screens/StoryScreen';
import {
  EMPTY_PROGRESS,
  loadProgress,
  normalizeProgress,
  Progress,
  recordResult,
  saveProgress,
} from './src/storage';

type Screen =
  | { name: 'menu' }
  | { name: 'levels' }
  | { name: 'story'; level: number }
  | { name: 'ending' }
  | { name: 'game'; level: number };

/** Narration shown before a chapter: prologue, act title card, chapter story. */
function introPages(level: number): StoryPage[] {
  const info = CHAPTERS[level];
  const act = ACTS[info.act];
  const pages: StoryPage[] = [];
  if (level === 0) {
    pages.push({
      kicker: 'PROLOGUE',
      title: 'THE LAST SHADOW',
      lines: PROLOGUE,
    });
  }
  const opensAct = level === 0 || CHAPTERS[level - 1].act !== info.act;
  pages.push({
    kicker: opensAct
      ? `${act.title} · ${act.name.toUpperCase()}`
      : `CHAPTER ${level + 1}`,
    title: info.name.toUpperCase(),
    lines: info.story,
  });
  return pages;
}

function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'menu' });
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);

  useEffect(() => {
    initAudio();
    loadProgress().then(p => setProgress(normalizeProgress(p, LEVELS.length)));
  }, []);

  const onComplete = useCallback(
    (level: number, stars: number, time: number) => {
      setProgress(prev => {
        const next = recordResult(prev, level, stars, time, LEVELS.length);
        saveProgress(next);
        return next;
      });
    },
    [],
  );

  const goMenu = useCallback(() => setScreen({ name: 'menu' }), []);
  const goLevels = useCallback(() => setScreen({ name: 'levels' }), []);
  const tellStory = useCallback(
    (level: number) => setScreen({ name: 'story', level }),
    [],
  );

  let content: React.ReactNode;
  if (screen.name === 'game') {
    const level = screen.level;
    content = (
      <GameScreen
        key={level}
        levelIndex={level}
        onComplete={onComplete}
        onExit={goLevels}
        onNext={() => tellStory(Math.min(level + 1, LEVELS.length - 1))}
        onFinish={() => setScreen({ name: 'ending' })}
      />
    );
  } else if (screen.name === 'story') {
    const level = screen.level;
    content = (
      <StoryScreen
        key={level}
        pages={introPages(level)}
        theme={themeOf(level)}
        cta="BEGIN"
        onDone={() => setScreen({ name: 'game', level })}
      />
    );
  } else if (screen.name === 'ending') {
    content = (
      <StoryScreen
        pages={[
          { kicker: 'EPILOGUE', title: 'THE LONG NIGHT', lines: EPILOGUE },
          {
            kicker: 'THE END',
            title: 'SHADOWMAN',
            lines: ['Thank you for playing.'],
          },
        ]}
        theme="dusk"
        cta="CHAPTERS"
        onDone={goLevels}
      />
    );
  } else if (screen.name === 'levels') {
    content = (
      <LevelSelectScreen
        progress={progress}
        onPick={tellStory}
        onBack={goMenu}
      />
    );
  } else {
    content = (
      <MenuScreen
        hasProgress={Object.keys(progress.records).length > 0}
        onPlay={() => tellStory(progress.unlocked)}
        onLevels={goLevels}
      />
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.skyTop,
  },
});

export default App;
