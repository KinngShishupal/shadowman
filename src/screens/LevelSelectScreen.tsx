import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { COLORS } from '../game/constants';
import { LEVELS } from '../game/levels';
import { ACTS, CHAPTERS } from '../game/story';
import { Backdrop } from '../render/Backdrop';
import { Progress } from '../storage';
import { playMusic } from '../audio/audio';
import { formatTime, MenuButton, Stars } from '../ui/common';

interface Props {
  progress: Progress;
  onPick: (level: number) => void;
  onBack: () => void;
}

export function LevelSelectScreen({ progress, onPick, onBack }: Props) {
  const dims = useWindowDimensions();
  const width = Math.max(dims.width, dims.height);
  const height = Math.min(dims.width, dims.height);
  const total = Object.values(progress.records).reduce(
    (s, r) => s + r.stars,
    0,
  );
  const [act, setAct] = useState(
    CHAPTERS[Math.min(progress.unlocked, LEVELS.length - 1)].act,
  );
  useEffect(() => {
    playMusic(ACTS[act].theme);
  }, [act]);
  const chapters = LEVELS.map((lvl, i) => ({ lvl, i })).filter(
    c => CHAPTERS[c.i].act === act,
  );

  return (
    <View style={styles.root}>
      <Backdrop
        width={width}
        height={height}
        camX={120}
        theme={ACTS[act].theme}
      />
      <View style={styles.header}>
        <Text style={styles.title}>CHAPTERS</Text>
        <Text style={styles.total}>
          ◆ {total}/{LEVELS.length * 3}
        </Text>
      </View>
      <View style={styles.tabs}>
        {ACTS.map((a, i) => {
          const first = CHAPTERS.findIndex(c => c.act === i);
          const open = __DEV__ || first <= progress.unlocked;
          return (
            <Pressable
              key={a.title}
              disabled={!open}
              onPress={() => setAct(i)}
              style={[
                styles.tab,
                i === act && styles.tabOn,
                !open && styles.locked,
              ]}
            >
              <Text style={styles.tabKicker}>{a.title}</Text>
              <Text style={styles.tabName}>{open ? a.name : '???'}</Text>
            </Pressable>
          );
        })}
      </View>
      <ScrollView
        horizontal
        contentContainerStyle={styles.list}
        showsHorizontalScrollIndicator={false}
      >
        {chapters.map(({ lvl, i }) => {
          // Debug builds open every chapter for testing.
          const locked = !__DEV__ && i > progress.unlocked;
          const rec = progress.records[i];
          return (
            <Pressable
              key={lvl.id}
              disabled={locked}
              onPress={() => onPick(i)}
              style={({ pressed }) => [
                styles.card,
                { width: Math.min(190, width * 0.17) },
                locked && styles.locked,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.num}>{String(i + 1).padStart(2, '0')}</Text>
              <Text style={styles.name}>{lvl.name}</Text>
              <Text style={styles.sub} numberOfLines={2}>
                {locked ? 'Sealed by light' : lvl.subtitle}
              </Text>
              <Stars count={rec?.stars ?? 0} size={14} />
              <Text style={styles.best}>
                {rec
                  ? `Best ${formatTime(rec.bestTime)}`
                  : locked
                  ? '🔒'
                  : 'Unplayed'}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.footer}>
        <MenuButton label="BACK" onPress={onBack} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 6,
  },
  tab: {
    marginHorizontal: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(143,107,255,0.4)',
    backgroundColor: 'rgba(10,5,22,0.6)',
    alignItems: 'center',
  },
  tabOn: {
    borderColor: COLORS.umbral,
    backgroundColor: 'rgba(62,240,208,0.14)',
  },
  tabKicker: {
    color: COLORS.umbral,
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: '700',
  },
  tabName: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },
  root: {
    flex: 1,
    backgroundColor: COLORS.skyTop,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingTop: 18,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 8,
  },
  total: {
    color: COLORS.umbral,
    fontSize: 16,
    fontWeight: '800',
  },
  list: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  card: {
    marginHorizontal: 8,
    padding: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(143,107,255,0.6)',
    backgroundColor: 'rgba(10,5,22,0.82)',
    alignItems: 'center',
  },
  locked: {
    opacity: 0.45,
  },
  pressed: {
    borderColor: COLORS.umbral,
    transform: [{ scale: 0.97 }],
  },
  num: {
    color: COLORS.umbral,
    fontSize: 30,
    fontWeight: '900',
  },
  name: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
  },
  sub: {
    color: COLORS.textDim,
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 6,
    minHeight: 30,
  },
  best: {
    color: COLORS.textDim,
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 12,
  },
});
