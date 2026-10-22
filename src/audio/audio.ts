// Sound effects and music. Files are synthesized by scripts/make-audio.js and
// bundled as Metro assets, so they work in debug (served by Metro) and release
// (packaged into the app) without any native project changes.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Image, Platform } from 'react-native';
import Sound from 'react-native-sound';

const SFX = {
  jump: require('../assets/audio/jump.wav'),
  doubleJump: require('../assets/audio/doubleJump.wav'),
  land: require('../assets/audio/land.wav'),
  dash: require('../assets/audio/dash.wav'),
  bolt: require('../assets/audio/bolt.wav'),
  hurt: require('../assets/audio/hurt.wav'),
  death: require('../assets/audio/death.wav'),
  shard: require('../assets/audio/shard.wav'),
  mask: require('../assets/audio/mask.wav'),
  checkpoint: require('../assets/audio/checkpoint.wav'),
  enemyDie: require('../assets/audio/enemyDie.wav'),
  spring: require('../assets/audio/spring.wav'),
  hook: require('../assets/audio/hook.wav'),
  key: require('../assets/audio/key.wav'),
  door: require('../assets/audio/door.wav'),
  crush: require('../assets/audio/crush.wav'),
  rift: require('../assets/audio/rift.wav'),
  enemyShot: require('../assets/audio/enemyShot.wav'),
  arrow: require('../assets/audio/arrow.wav'),
  break: require('../assets/audio/break.wav'),
  heart: require('../assets/audio/heart.wav'),
  cloak: require('../assets/audio/cloak.wav'),
  bossHit: require('../assets/audio/bossHit.wav'),
  bossDie: require('../assets/audio/bossDie.wav'),
  win: require('../assets/audio/win.wav'),
  uiTap: require('../assets/audio/uiTap.wav'),
};

const MUSIC = {
  dusk: require('../assets/audio/music_dusk.wav'),
  marsh: require('../assets/audio/music_marsh.wav'),
  foundry: require('../assets/audio/music_foundry.wav'),
  dawn: require('../assets/audio/music_dawn.wav'),
  boss: require('../assets/audio/music_boss.wav'),
};

export type SfxName = keyof typeof SFX;
export type MusicName = keyof typeof MUSIC;

// Sounds that can fire in quick succession get several players so they overlap.
const POOL: Partial<Record<SfxName, number>> = {
  jump: 2,
  land: 2,
  shard: 3,
  bolt: 3,
  enemyShot: 3,
  arrow: 3,
  enemyDie: 2,
  bossHit: 2,
  uiTap: 2,
};
const VOLUME: Partial<Record<SfxName, number>> = {
  land: 0.45,
  jump: 0.6,
  enemyShot: 0.45,
  arrow: 0.55,
  uiTap: 0.5,
  crush: 0.7,
  dash: 0.7,
};
const MUSIC_VOLUME = 0.5;
const SETTINGS_KEY = 'shadowman.audio.v1';

let ready = false;
let sfxOn = true;
let musicOn = true;
const pools = new Map<SfxName, { sounds: Sound[]; next: number }>();
let current: { name: MusicName; sound: Sound } | null = null;
let wanted: MusicName | null = null;
const listeners = new Set<() => void>();

function uriOf(asset: number) {
  return Image.resolveAssetSource(asset)?.uri ?? '';
}

function load(asset: number, onReady?: (s: Sound) => void) {
  // The load callback may fire before the constructor returns, so remember it
  // and run onReady once both have happened.
  let sound: Sound | null = null;
  let loadedEarly = false;
  sound = new Sound(uriOf(asset), '', (err: unknown) => {
    if (err) {
      return;
    }
    if (sound) {
      onReady?.(sound);
    } else {
      loadedEarly = true;
    }
  });
  if (loadedEarly) {
    onReady?.(sound);
  }
  return sound;
}

export async function initAudio() {
  // Debug builds would stream every file from Metro over HTTP, and preparing
  // dozens of players that way stalls the JS thread. Audio is release-only.
  if (ready || __DEV__) {
    return;
  }
  ready = true;
  // iOS: respect the silent switch and let the player's own music keep going.
  Sound.setCategory(Platform.OS === 'ios' ? 'Ambient' : 'Playback', true);
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as { sfx?: boolean; music?: boolean };
      sfxOn = saved.sfx ?? true;
      musicOn = saved.music ?? true;
    }
  } catch {
    // Defaults are fine.
  }
  for (const name of Object.keys(SFX) as SfxName[]) {
    const sounds = Array.from({ length: POOL[name] ?? 1 }, () =>
      load(SFX[name]),
    );
    pools.set(name, { sounds, next: 0 });
  }
  AppState.addEventListener('change', state => {
    if (state === 'active') {
      current?.sound.play();
    } else {
      current?.sound.pause();
    }
  });
  notify();
  if (wanted) {
    const w = wanted;
    wanted = null;
    playMusic(w);
  }
}

export function play(name: SfxName, volume = 1) {
  if (!sfxOn) {
    return;
  }
  const pool = pools.get(name);
  if (!pool) {
    return;
  }
  const s = pool.sounds[pool.next];
  pool.next = (pool.next + 1) % pool.sounds.length;
  if (!s.isLoaded()) {
    return;
  }
  s.stop(() => {
    s.setVolume((VOLUME[name] ?? 0.8) * volume);
    s.play();
  });
}

export function playMusic(name: MusicName) {
  if (wanted === name && (current?.name === name || !musicOn)) {
    return;
  }
  wanted = name;
  if (!ready || !musicOn || current?.name === name) {
    return;
  }
  stopMusic();
  const sound = load(MUSIC[name], s => {
    if (wanted !== name || !musicOn) {
      s.release();
      return;
    }
    s.setNumberOfLoops(-1);
    s.setVolume(MUSIC_VOLUME);
    s.play();
  });
  current = { name, sound };
}

function stopMusic() {
  if (current) {
    current.sound.stop();
    current.sound.release();
    current = null;
  }
}

// ------------------------------------------------------------- settings

function persist() {
  AsyncStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({ sfx: sfxOn, music: musicOn }),
  ).catch(() => {});
  notify();
}

function notify() {
  listeners.forEach(l => l());
}

export function audioSettings() {
  return { sfx: sfxOn, music: musicOn };
}

export function setSfxEnabled(on: boolean) {
  sfxOn = on;
  persist();
}

export function setMusicEnabled(on: boolean) {
  musicOn = on;
  if (!on) {
    stopMusic();
  } else if (wanted) {
    const w = wanted;
    wanted = null;
    playMusic(w);
  }
  persist();
}

export function onAudioSettings(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
