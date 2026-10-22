import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { COLORS, PLAYER, TOOLS, VIEW_ROWS } from '../game/constants';
import { computeStars, createInput, createWorld, step } from '../game/engine';
import { BOSS_CHAPTER, LEVELS } from '../game/levels';
import { play, playMusic, SfxName } from '../audio/audio';
import { AudioToggles } from '../ui/AudioToggles';
import { ACTS, CHAPTERS } from '../game/story';
import { World } from '../game/types';
import { Backdrop, Foreground, Vignette } from '../render/Backdrop';
import { ControlsView, useControls } from '../render/Controls';
import { BossBar } from '../render/Sprites';
import { EntityLayer, TerrainLayer, visibleChunks } from '../render/WorldView';
import { formatTime, MenuButton, Stars } from '../ui/common';

interface Props {
  levelIndex: number;
  onExit: () => void;
  onNext: () => void;
  onFinish: () => void;
  onComplete: (level: number, stars: number, time: number) => void;
}

export function GameScreen({
  levelIndex,
  onExit,
  onNext,
  onFinish,
  onComplete,
}: Props) {
  const dims = useWindowDimensions();
  // Always lay out in landscape even if the first frame still reports portrait.
  const width = Math.max(dims.width, dims.height);
  const height = Math.min(dims.width, dims.height);
  const T = Math.floor(height / VIEW_ROWS);
  const level = LEVELS[levelIndex];

  const [attempt, setAttempt] = useState(0);
  const [paused, setPaused] = useState(false);
  const [, setFrame] = useState(0);
  const pausedRef = useRef(false);
  pausedRef.current = paused;

  const input = useMemo(() => createInput(), []);
  const world = useMemo<World>(
    () => createWorld(level, { w: width / T, h: height / T }),
    // A new attempt rebuilds the world; size changes only update the view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [level, attempt],
  );
  world.view.w = width / T;
  world.view.h = height / T;
  const { buttons, touchProps } = useControls(width, height, input);

  const reported = useRef(false);
  useEffect(() => {
    reported.current = false;
  }, [world]);

  useEffect(() => {
    let raf = 0;
    let last = 0;
    let lastDraw = 0;
    const loop = (now: number) => {
      const dt = last ? (now - last) / 1000 : 0;
      last = now;
      if (!pausedRef.current) {
        if (world.status !== 'won') {
          step(world, input, dt);
          for (const name of world.events) {
            play(name as SfxName);
          }
          world.events.length = 0;
        } else if (!reported.current) {
          reported.current = true;
          onComplete(levelIndex, computeStars(world), world.time);
        }
        // Simulate every frame but draw at most ~60 times a second: on 120 Hz
        // screens drawing every frame doubles the native work and drops frames.
        if (now - lastDraw >= 15) {
          lastDraw = now;
          setFrame(f => (f + 1) % 1000000);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [world, input, levelIndex, onComplete]);

  useEffect(() => {
    playMusic(levelIndex === BOSS_CHAPTER ? 'boss' : level.theme);
  }, [levelIndex, level.theme]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setPaused(p => !p);
      return true;
    });
    return () => sub.remove();
  }, []);

  const restart = () => {
    Object.assign(input, createInput());
    setPaused(false);
    setAttempt(a => a + 1);
  };

  const shakeX =
    world.shake > 0 ? (Math.random() - 0.5) * world.shake * T * 0.6 : 0;
  const shakeY =
    world.shake > 0 ? (Math.random() - 0.5) * world.shake * T * 0.6 : 0;
  const camX = world.camera.x * T;
  const camY = world.camera.y * T;
  const p = world.player;
  const won = world.status === 'won';
  const introOpacity = Math.max(0, Math.min(1, 2.5 - world.time));
  const stars = computeStars(world);
  const chunks = visibleChunks(world.camera.x, world.view.w);
  const info = CHAPTERS[levelIndex];
  const hasKeys = useMemo(
    () => level.entities.some(e => e.kind === 'key'),
    [level],
  );
  // Tutorial hint fades in after the title card and lingers a few seconds.
  const hintOpacity = Math.max(
    0,
    Math.min(1, world.time - 2.2, 9 - world.time),
  );

  return (
    <View style={styles.root}>
      <Backdrop
        width={width}
        height={height}
        camX={camX}
        camY={camY}
        theme={level.theme}
      />
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: level.width * T,
          height: level.height * T,
          transform: [
            { translateX: Math.round(-camX + shakeX) },
            { translateY: Math.round(-camY + shakeY) },
          ],
        }}
      >
        <TerrainLayer level={level} T={T} from={chunks.from} to={chunks.to} />
        <EntityLayer w={world} T={T} />
      </View>
      <Foreground width={width} height={height} camX={camX} />
      <Vignette width={width} height={height} />

      {/* Low shade so the controls read on any background. */}
      <View pointerEvents="none" style={styles.vignette} />

      <View style={StyleSheet.absoluteFill} {...touchProps}>
        <ControlsView buttons={buttons} input={input} player={p} />
      </View>

      <View pointerEvents="none" style={styles.hud}>
        <View style={styles.row}>
          {Array.from({ length: PLAYER.maxHp }, (_, i) => (
            <View
              key={i}
              style={[
                styles.hp,
                {
                  backgroundColor:
                    i < p.hp && !p.dead
                      ? COLORS.umbral
                      : 'rgba(62,240,208,0.12)',
                },
              ]}
            />
          ))}
        </View>
        <View style={[styles.row, { marginTop: 8 }]}>
          <View style={styles.shardIcon} />
          <Text style={styles.hudText}>
            {world.shards}/{world.shardsTotal}
          </Text>
          <View style={[styles.maskIcon, { opacity: world.mask ? 1 : 0.25 }]} />
          <Text style={[styles.hudText, styles.dim]}>
            {formatTime(world.time)}
          </Text>
        </View>
        {hasKeys && (
          <View style={[styles.row, { marginTop: 8 }]}>
            <View style={styles.keyIcon} />
            <Text style={styles.hudText}>× {world.keys}</Text>
          </View>
        )}
        {world.cloakT > 0 && (
          <View style={[styles.row, { marginTop: 8 }]}>
            <Text style={[styles.hudText, styles.cloakText]}>CLOAKED</Text>
            <View style={styles.cloakTrack}>
              <View
                style={[
                  styles.cloakFill,
                  { width: `${(world.cloakT / TOOLS.cloakTime) * 100}%` },
                ]}
              />
            </View>
          </View>
        )}
      </View>

      <BossBar w={world} width={width} />

      {hintOpacity > 0 && info.hint && (
        <View
          pointerEvents="none"
          style={[styles.hint, { opacity: hintOpacity }]}
        >
          <Text style={styles.hintText}>{info.hint}</Text>
        </View>
      )}

      {introOpacity > 0 && (
        <View
          pointerEvents="none"
          style={[styles.intro, { opacity: introOpacity }]}
        >
          <Text style={styles.introSmall}>
            {ACTS[info.act].title} · CHAPTER {levelIndex + 1}
          </Text>
          <Text style={styles.introTitle}>{level.name.toUpperCase()}</Text>
          <Text style={styles.introSub}>{level.subtitle}</Text>
        </View>
      )}

      {!won && (
        <Pressable
          style={styles.pauseBtn}
          onPress={() => setPaused(true)}
          hitSlop={12}
        >
          <View style={styles.pauseBar} />
          <View style={styles.pauseBar} />
        </Pressable>
      )}

      {paused && !won && (
        <View style={styles.overlay}>
          <Text style={styles.overlayTitle}>PAUSED</Text>
          <Text style={styles.overlaySub}>{level.name}</Text>
          <MenuButton primary label="RESUME" onPress={() => setPaused(false)} />
          <MenuButton label="RESTART" onPress={restart} />
          <MenuButton label="QUIT" onPress={onExit} />
          <AudioToggles />
        </View>
      )}

      {won && (
        <View style={styles.overlay}>
          <Text style={styles.overlaySmall}>THE SHADOW PASSES</Text>
          <Text style={styles.overlayTitle}>{level.name.toUpperCase()}</Text>
          <Stars count={stars} size={26} />
          <View style={styles.stats}>
            <Stat
              label="SHARDS"
              value={`${world.shards}/${world.shardsTotal}`}
            />
            <Stat label="MASK" value={world.mask ? 'FOUND' : '—'} />
            <Stat label="TIME" value={formatTime(world.time)} />
            <Stat label="FALLS" value={`${world.deaths}`} />
          </View>
          <View style={styles.row}>
            <MenuButton
              label="RETRY"
              onPress={restart}
              style={styles.smallBtn}
            />
            <MenuButton
              label="LEVELS"
              onPress={onExit}
              style={styles.smallBtn}
            />
            {levelIndex < LEVELS.length - 1 ? (
              <MenuButton
                primary
                label="NEXT"
                onPress={onNext}
                style={styles.smallBtn}
              />
            ) : (
              <MenuButton
                primary
                label="FINISH"
                onPress={onFinish}
                style={styles.smallBtn}
              />
            )}
          </View>
        </View>
      )}
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  keyIcon: {
    width: 16,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#e0e8ff',
    marginRight: 8,
  },
  cloakText: {
    color: '#b48cff',
    fontSize: 12,
    letterSpacing: 2,
    marginRight: 8,
  },
  cloakTrack: {
    width: 70,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(180,140,255,0.2)',
    overflow: 'hidden',
  },
  cloakFill: {
    height: '100%',
    backgroundColor: '#b48cff',
  },
  hint: {
    position: 'absolute',
    top: 64,
    left: '22%',
    right: '22%',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(10,5,22,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(62,240,208,0.45)',
  },
  hintText: {
    color: COLORS.text,
    fontSize: 13,
    textAlign: 'center',
  },
  root: {
    flex: 1,
    backgroundColor: COLORS.skyTop,
    overflow: 'hidden',
  },
  vignette: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '22%',
    backgroundColor: 'rgba(5,2,12,0.25)',
  },
  hud: {
    position: 'absolute',
    left: 22,
    top: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hp: {
    width: 16,
    height: 16,
    marginRight: 10,
    transform: [{ rotate: '45deg' }],
    borderWidth: 1.5,
    borderColor: '#d8fff6',
  },
  shardIcon: {
    width: 10,
    height: 14,
    backgroundColor: COLORS.umbral,
    transform: [{ rotate: '45deg' }],
    marginRight: 8,
  },
  maskIcon: {
    width: 12,
    height: 16,
    borderRadius: 6,
    backgroundColor: '#f2ecff',
    marginLeft: 14,
    marginRight: 14,
  },
  hudText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },
  dim: {
    color: COLORS.textDim,
  },
  intro: {
    position: 'absolute',
    top: '18%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  introSmall: {
    color: COLORS.umbral,
    fontSize: 13,
    letterSpacing: 6,
    fontWeight: '700',
  },
  introTitle: {
    color: COLORS.text,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 8,
    marginVertical: 4,
  },
  introSub: {
    color: COLORS.textDim,
    fontSize: 14,
    fontStyle: 'italic',
  },
  pauseBtn: {
    position: 'absolute',
    right: 22,
    top: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: 'rgba(143,107,255,0.6)',
    backgroundColor: 'rgba(20,10,40,0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseBar: {
    width: 5,
    height: 16,
    marginHorizontal: 3,
    borderRadius: 2,
    backgroundColor: COLORS.text,
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
  },
  overlaySmall: {
    color: COLORS.umbral,
    fontSize: 13,
    letterSpacing: 6,
    fontWeight: '700',
  },
  overlayTitle: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 8,
    marginVertical: 6,
  },
  overlaySub: {
    color: COLORS.textDim,
    fontSize: 14,
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    marginVertical: 12,
  },
  stat: {
    alignItems: 'center',
    marginHorizontal: 18,
  },
  statLabel: {
    color: COLORS.textDim,
    fontSize: 11,
    letterSpacing: 3,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
  },
  smallBtn: {
    minWidth: 130,
    marginHorizontal: 8,
  },
});
