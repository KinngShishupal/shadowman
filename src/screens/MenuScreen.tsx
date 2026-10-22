import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { COLORS } from '../game/constants';
import { Backdrop, Foreground, Vignette } from '../render/Backdrop';
import { ShadowmanPortrait } from '../render/WorldView';
import { MenuButton } from '../ui/common';
import { playMusic } from '../audio/audio';
import { AudioToggles } from '../ui/AudioToggles';

interface Props {
  hasProgress: boolean;
  onPlay: () => void;
  onLevels: () => void;
}

export function MenuScreen({ hasProgress, onPlay, onLevels }: Props) {
  const dims = useWindowDimensions();
  const width = Math.max(dims.width, dims.height);
  const height = Math.min(dims.width, dims.height);
  const [t, setT] = useState(0);
  const [help, setHelp] = useState(false);

  useEffect(() => {
    playMusic('dusk');
  }, []);

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

  const hero = Math.round(height * 0.32);
  return (
    <View style={styles.root}>
      <Backdrop width={width} height={height} camX={t * 40} />
      <View style={[styles.ground, { top: height * 0.82 }]} />
      <View style={[styles.rim, { top: height * 0.82 }]} />
      <View
        style={{
          position: 'absolute',
          left: width * 0.16 - hero * 0.9,
          top: height * 0.82 - hero * 1.2,
        }}
      >
        <ShadowmanPortrait size={hero} time={t} />
      </View>
      <Foreground width={width} height={height} camX={t * 40} />
      <Vignette width={width} height={height} />

      <View style={styles.content}>
        <Text style={styles.kicker}>A TALE OF THE UMBRAL</Text>
        <Text style={styles.title}>SHADOWMAN</Text>
        <Text style={styles.tag}>
          The Lumen Order burned every shadow but one.
        </Text>
        <MenuButton
          primary
          label={hasProgress ? 'CONTINUE' : 'PLAY'}
          onPress={onPlay}
        />
        <MenuButton label="CHAPTERS" onPress={onLevels} />
        <MenuButton label="HOW TO PLAY" onPress={() => setHelp(true)} />
        <AudioToggles />
      </View>

      {help && (
        <View style={styles.overlay}>
          <Text style={styles.helpTitle}>HOW TO PLAY</Text>
          <View style={styles.helpGrid}>
            <Help k="◀ ▶" v="Run" />
            <Help
              k="▲"
              v="Jump · tap again in the air for an umbral double jump"
            />
            <Help
              k="WALL"
              v="Keep pressing jump on any wall to climb it. Hold away + jump to kick off"
            />
            <Help
              k="DASH"
              v="Melt into shadow: pass through light beams and bolts, slay what you touch"
            />
            <Help k="BOLT" v="Throw a shadow bolt (recharges over time)" />
            <Help
              k="◆"
              v="Collect every shard and find the hidden mask for 3 marks"
            />
            <Help
              k="!"
              v="Spikes and pits are fatal. Shade totems save your place"
            />
          </View>
          <MenuButton primary label="GOT IT" onPress={() => setHelp(false)} />
        </View>
      )}
    </View>
  );
}

function Help({ k, v }: { k: string; v: string }) {
  return (
    <View style={styles.helpRow}>
      <Text style={styles.helpKey}>{k}</Text>
      <Text style={styles.helpVal}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.skyTop,
  },
  ground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.ground,
  },
  rim: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.rim,
  },
  content: {
    position: 'absolute',
    right: '8%',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kicker: {
    color: COLORS.umbral,
    fontSize: 12,
    letterSpacing: 6,
    fontWeight: '700',
  },
  title: {
    color: COLORS.text,
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: 10,
    textShadowColor: 'rgba(62,240,208,0.6)',
    textShadowRadius: 16,
    textShadowOffset: { width: 0, height: 0 },
  },
  tag: {
    color: COLORS.textDim,
    fontStyle: 'italic',
    fontSize: 13,
    marginBottom: 14,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.panel,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  helpTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 6,
    marginBottom: 10,
  },
  helpGrid: {
    maxWidth: 560,
    marginBottom: 10,
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  helpKey: {
    width: 64,
    color: COLORS.umbral,
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  helpVal: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
  },
});
