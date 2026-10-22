import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  audioSettings,
  onAudioSettings,
  play,
  setMusicEnabled,
  setSfxEnabled,
} from '../audio/audio';
import { COLORS } from '../game/constants';

/** Music and sound effect switches, kept in sync with saved settings. */
export function AudioToggles() {
  const [s, setS] = useState(audioSettings());
  useEffect(() => onAudioSettings(() => setS(audioSettings())), []);
  return (
    <View style={styles.row}>
      <Toggle
        label="MUSIC"
        on={s.music}
        onPress={() => {
          setMusicEnabled(!s.music);
          play('uiTap');
        }}
      />
      <Toggle
        label="SOUND"
        on={s.sfx}
        onPress={() => {
          setSfxEnabled(!s.sfx);
          play('uiTap');
        }}
      />
    </View>
  );
}

function Toggle({
  label,
  on,
  onPress,
}: {
  label: string;
  on: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.toggle,
        on && styles.on,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.text, !on && styles.off]}>
        {label} {on ? 'ON' : 'OFF'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  toggle: {
    marginHorizontal: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(143,107,255,0.5)',
    backgroundColor: 'rgba(10,5,22,0.6)',
  },
  on: {
    borderColor: COLORS.umbral,
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
  text: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  off: {
    color: COLORS.textDim,
  },
});
