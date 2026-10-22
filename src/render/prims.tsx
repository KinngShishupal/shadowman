import React, { memo } from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

// =============================================================== placement
// Every sprite is a small SVG inside an absolutely placed View. Static art is
// memoised and only its View transform changes per frame, which keeps the
// native SVG redraw cost to the few sprites that actually animate.

export function Place({
  x,
  y,
  T,
  w,
  h,
  style,
  children,
}: {
  x: number; // world position of the box centre
  y: number;
  T: number;
  w: number;
  h: number;
  style?: ViewStyle;
  children: React.ReactNode;
}) {
  return (
    <View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: (x - w / 2) * T,
          top: (y - h / 2) * T,
          width: w * T,
          height: h * T,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** SVG whose viewBox is centred on (0, 0) in tile units. */
export function Pic({
  w,
  h,
  T,
  children,
}: {
  w: number;
  h: number;
  T: number;
  children: React.ReactNode;
}) {
  return (
    <Svg width={w * T} height={h * T} viewBox={`${-w / 2} ${-h / 2} ${w} ${h}`}>
      {children}
    </Svg>
  );
}

export function radial(id: string, color: string, strength: number) {
  return (
    <RadialGradient id={id} cx="0.5" cy="0.5" r="0.5">
      <Stop offset="0" stopColor={color} stopOpacity={strength} />
      <Stop offset="0.35" stopColor={color} stopOpacity={strength * 0.45} />
      <Stop offset="1" stopColor={color} stopOpacity="0" />
    </RadialGradient>
  );
}

export const Glow = memo(
  ({
    T,
    r,
    color,
    strength = 0.6,
  }: {
    T: number;
    r: number;
    color: string;
    strength?: number;
  }) => (
    <Pic w={r * 2} h={r * 2} T={T}>
      <Defs>{radial('g', color, strength)}</Defs>
      <Circle cx={0} cy={0} r={r} fill="url(#g)" />
    </Pic>
  ),
);

export function GlowAt({
  x,
  y,
  r,
  T,
  color,
  strength,
  style,
}: {
  x: number;
  y: number;
  r: number;
  T: number;
  color: string;
  strength?: number;
  style?: ViewStyle;
}) {
  return (
    <Place x={x} y={y} w={r * 2} h={r * 2} T={T} style={style}>
      <Glow T={T} r={r} color={color} strength={strength} />
    </Place>
  );
}

export const UMBRAL = '#3ef0d0';
export const LUMEN = '#ffcf6b';

export function Dot({
  x,
  y,
  r,
  T,
  color,
  opacity,
}: {
  x: number;
  y: number;
  r: number;
  T: number;
  color: string;
  opacity: number;
}) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: (x - r) * T,
        top: (y - r) * T,
        width: r * 2 * T,
        height: r * 2 * T,
        borderRadius: r * T,
        backgroundColor: color,
        opacity,
      }}
    />
  );
}
