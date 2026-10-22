import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { COLORS } from '../game/constants';
import { play } from '../audio/audio';

export function MenuButton({
  label,
  onPress,
  primary = false,
  disabled = false,
  style,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={() => {
        play('uiTap');
        onPress();
      }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        primary && styles.primary,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.buttonText, primary && styles.primaryText]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Stars({ count, size = 18 }: { count: number; size?: number }) {
  return (
    <View style={styles.stars}>
      {[0, 1, 2].map(i => (
        <View
          key={i}
          style={{
            width: size,
            height: size,
            marginHorizontal: size * 0.25,
            transform: [{ rotate: '45deg' }],
            backgroundColor: i < count ? COLORS.umbral : 'transparent',
            borderWidth: 2,
            borderColor: i < count ? '#d8fff6' : 'rgba(143,107,255,0.6)',
          }}
        />
      ))}
    </View>
  );
}

export function formatTime(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(143,107,255,0.7)',
    backgroundColor: 'rgba(20,10,40,0.75)',
    marginVertical: 6,
    minWidth: 180,
    alignItems: 'center',
  },
  primary: {
    borderColor: COLORS.umbral,
    backgroundColor: 'rgba(62,240,208,0.16)',
  },
  pressed: {
    transform: [{ scale: 0.96 }],
    backgroundColor: 'rgba(62,240,208,0.3)',
  },
  disabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 3,
  },
  primaryText: {
    color: '#d8fff6',
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
});
