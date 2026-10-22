import React from 'react';
import { View, ViewStyle } from 'react-native';

export function Tri({
  x,
  y,
  w,
  h,
  color,
  down = false,
  style,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  down?: boolean;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        {
          position: 'absolute',
          left: x,
          top: y,
          width: 0,
          height: 0,
          borderLeftWidth: w / 2,
          borderRightWidth: w / 2,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
        },
        down
          ? { borderTopWidth: h, borderTopColor: color }
          : { borderBottomWidth: h, borderBottomColor: color },
        style,
      ]}
    />
  );
}

export function Circle({
  cx,
  cy,
  r,
  color,
  style,
}: {
  cx: number;
  cy: number;
  r: number;
  color: string;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        {
          position: 'absolute',
          left: cx - r,
          top: cy - r,
          width: r * 2,
          height: r * 2,
          borderRadius: r,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

export function Box({
  x,
  y,
  w,
  h,
  color,
  radius = 0,
  style,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  radius?: number;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        {
          position: 'absolute',
          left: x,
          top: y,
          width: w,
          height: h,
          borderRadius: radius,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

/** A limb of length `len` hanging from pivot (px, py), rotated by `deg`. */
export function Limb({
  px,
  py,
  len,
  thick,
  deg,
  color,
}: {
  px: number;
  py: number;
  len: number;
  thick: number;
  deg: number;
  color: string;
}) {
  return (
    <View
      style={{
        position: 'absolute',
        left: px - thick / 2,
        top: py - len,
        width: thick,
        height: len * 2,
        transform: [{ rotate: `${deg}deg` }],
      }}
    >
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: len,
          width: thick,
          height: len,
          borderRadius: thick / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
