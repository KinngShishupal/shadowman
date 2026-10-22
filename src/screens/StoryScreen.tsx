import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { COLORS } from '../game/constants';
import { Theme } from '../game/story';
import { Backdrop, Vignette } from '../render/Backdrop';
import { MenuButton } from '../ui/common';
import { playMusic } from '../audio/audio';

export interface StoryPage {
  kicker?: string;
  title?: string;
  lines: string[];
}

interface Props {
  pages: StoryPage[];
  theme: Theme;
  cta: string;
  onDone: () => void;
}

/** Narration between chapters: tap to reveal the next line or page. */
export function StoryScreen({ pages, theme, cta, onDone }: Props) {
  const dims = useWindowDimensions();
  const width = Math.max(dims.width, dims.height);
  const height = Math.min(dims.width, dims.height);
  const [page, setPage] = useState(0);
  const [shown, setShown] = useState(1);
  const [t, setT] = useState(0);
  const fade = useRef(new Animated.Value(0)).current;

  const current = pages[page];
  const lastLine = shown >= current.lines.length;
  const lastPage = page >= pages.length - 1;

  useEffect(() => {
    let raf = 0;
    const start = Date.now();
    let lastDraw = 0;
    const loop = () => {
      // Redraw at most ~60 times a second, even on 120 Hz screens.
      const now = Date.now();
      if (now - lastDraw >= 15) {
        lastDraw = now;
        setT((now - start) / 1000);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    playMusic(theme);
  }, [theme]);

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, [page, shown, fade]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onDone();
      return true;
    });
    return () => sub.remove();
  }, [onDone]);

  const advance = () => {
    if (!lastLine) {
      setShown(s => s + 1);
    } else if (!lastPage) {
      setPage(p => p + 1);
      setShown(1);
    } else {
      onDone();
    }
  };

  return (
    <Pressable style={styles.root} onPress={advance}>
      <Backdrop width={width} height={height} camX={t * 18} theme={theme} />
      <Vignette width={width} height={height} />
      <View style={styles.shade} pointerEvents="none" />
      <View style={styles.content} pointerEvents="box-none">
        {current.kicker && <Text style={styles.kicker}>{current.kicker}</Text>}
        {current.title && <Text style={styles.title}>{current.title}</Text>}
        <View style={styles.body}>
          {current.lines.slice(0, shown).map((line, i) => (
            <Animated.Text
              key={`${page}-${i}`}
              style={[styles.line, i === shown - 1 && { opacity: fade }]}
            >
              {line}
            </Animated.Text>
          ))}
        </View>
        <View style={styles.footer}>
          {lastLine && lastPage ? (
            <MenuButton primary label={cta} onPress={onDone} />
          ) : (
            <Text style={styles.tap}>tap to continue</Text>
          )}
        </View>
      </View>
      <Pressable style={styles.skip} onPress={onDone} hitSlop={12}>
        <Text style={styles.skipText}>SKIP ›</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  shade: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(4,2,10,0.55)',
  },
  content: {
    position: 'absolute',
    left: '12%',
    right: '12%',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kicker: {
    color: COLORS.umbral,
    fontSize: 13,
    letterSpacing: 6,
    fontWeight: '700',
  },
  title: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 6,
    marginTop: 4,
    marginBottom: 6,
    textAlign: 'center',
  },
  body: {
    minHeight: 120,
    justifyContent: 'center',
    marginVertical: 8,
  },
  line: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginVertical: 5,
    fontStyle: 'italic',
  },
  footer: {
    height: 64,
    justifyContent: 'center',
  },
  tap: {
    color: COLORS.textDim,
    fontSize: 12,
    letterSpacing: 3,
  },
  skip: {
    position: 'absolute',
    top: 18,
    right: 24,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(143,107,255,0.5)',
    backgroundColor: 'rgba(10,5,22,0.6)',
  },
  skipText: {
    color: COLORS.text,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '700',
  },
});
