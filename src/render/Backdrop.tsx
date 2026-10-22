import React, { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { Theme } from '../game/story';
import {
  cloudBank,
  deadTree,
  gear,
  hash,
  keep,
  oak,
  pine,
  pipes,
  reeds,
  ridgePath,
  spire,
  stack,
  willow,
} from './art';
import { LayerKind, THEMES, ThemeDef } from './themes';

/**
 * Draws an SVG at a fraction of its on-screen size and scales it up. Soft
 * background art loses nothing visible, and the native bitmap (and its GPU
 * texture) shrinks by scale squared, which keeps parallax scrolling smooth.
 */
function LowRes({
  top = 0,
  width,
  height,
  scale,
  viewBox,
  children,
}: {
  top?: number;
  width: number;
  height: number;
  scale: number;
  viewBox: string;
  children: React.ReactNode;
}) {
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', left: 0, top, width, height }}
    >
      <Svg
        width={Math.ceil(width * scale)}
        height={Math.ceil(height * scale)}
        viewBox={viewBox}
        style={{
          position: 'absolute',
          left: (width * (1 - scale)) / 2,
          top: (height * (1 - scale)) / 2,
          transform: [{ scale: 1 / scale }],
        }}
      >
        {children}
      </Svg>
    </View>
  );
}

const Sky = memo(
  ({ width, height, t }: { width: number; height: number; t: ThemeDef }) => {
    const stars = useMemo(
      () =>
        Array.from({ length: t.stars }, (_, i) => ({
          x: hash(i, 1) * width,
          y: hash(i, 2) * height * 0.6,
          r: hash(i, 3) > 0.9 ? 2 : 1 + hash(i, 4) * 0.6,
          o: 0.25 + hash(i, 5) * 0.65,
        })),
      [width, height, t],
    );
    return (
      <LowRes
        width={width}
        height={height}
        scale={0.5}
        viewBox={`0 0 ${width} ${height}`}
      >
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={t.sky[0]} />
            <Stop offset="0.35" stopColor={t.sky[1]} />
            <Stop offset="0.62" stopColor={t.sky[2]} />
            <Stop offset="0.82" stopColor={t.sky[3]} />
            <Stop offset="1" stopColor={t.sky[4]} />
          </LinearGradient>
          <RadialGradient id="horizon" cx="0.5" cy="1" rx="0.7" ry="0.45">
            <Stop offset="0" stopColor={t.horizon} stopOpacity="0.35" />
            <Stop offset="1" stopColor={t.horizon} stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id="cloud" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={t.cloud} stopOpacity="0" />
            <Stop offset="0.5" stopColor={t.cloud} stopOpacity="0.35" />
            <Stop offset="1" stopColor={t.cloud} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#sky)" />
        <Rect
          x="0"
          y={height * 0.4}
          width={width}
          height={height * 0.6}
          fill="url(#horizon)"
        />
        {stars.map((s, i) => (
          <Circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#fff4ff"
            opacity={s.o}
          />
        ))}
        {[0.18, 0.3, 0.42].map((y, i) => (
          <Ellipse
            key={`c${i}`}
            cx={width * (0.2 + hash(i, 9) * 0.6)}
            cy={height * y}
            rx={width * (0.35 + hash(i, 8) * 0.2)}
            ry={height * 0.035}
            fill="url(#cloud)"
          />
        ))}
      </LowRes>
    );
  },
);

const Orb = memo(({ size, kind }: { size: number; kind: ThemeDef['orb'] }) => {
  const s = size * 4;
  const c = s / 2;
  const palette = {
    moon: {
      glow: '#f2dcff',
      face: ['#fffaff', '#ecdcff', '#c8b0ee'],
      crater: '#cdb6ec',
    },
    paleMoon: {
      glow: '#e0ffd8',
      face: ['#f6fff0', '#d8ecd0', '#a8c8a8'],
      crater: '#b8d0b0',
    },
    sun: {
      glow: '#fff0b0',
      face: ['#ffffff', '#fff2c0', '#ffc070'],
      crater: '#ffe0a0',
    },
    forge: {
      glow: '#ff8a3a',
      face: ['#ffe0a0', '#ff9a4a', '#c0401a'],
      crater: '#ff7a2a',
    },
  }[kind];
  return (
    <Svg
      width={s}
      height={s}
      style={{ position: 'absolute', left: -c, top: -c }}
    >
      <Defs>
        <RadialGradient id="orbGlow" cx="0.5" cy="0.5" r="0.5">
          <Stop
            offset="0.2"
            stopColor={palette.glow}
            stopOpacity={kind === 'sun' ? 0.7 : 0.45}
          />
          <Stop offset="0.45" stopColor={palette.glow} stopOpacity="0.14" />
          <Stop offset="1" stopColor={palette.glow} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="orbFace" cx="0.4" cy="0.35" r="0.7">
          <Stop offset="0" stopColor={palette.face[0]} />
          <Stop offset="0.7" stopColor={palette.face[1]} />
          <Stop offset="1" stopColor={palette.face[2]} />
        </RadialGradient>
      </Defs>
      <Circle cx={c} cy={c} r={c} fill="url(#orbGlow)" />
      {kind !== 'forge' && (
        <Circle cx={c} cy={c} r={size} fill="url(#orbFace)" />
      )}
      {(kind === 'moon' || kind === 'paleMoon') && (
        <>
          <Circle
            cx={c + size * 0.3}
            cy={c - size * 0.25}
            r={size * 0.16}
            fill={palette.crater}
            opacity={0.5}
          />
          <Circle
            cx={c - size * 0.3}
            cy={c + size * 0.3}
            r={size * 0.11}
            fill={palette.crater}
            opacity={0.45}
          />
          <Circle
            cx={c + size * 0.1}
            cy={c + size * 0.45}
            r={size * 0.07}
            fill={palette.crater}
            opacity={0.4}
          />
        </>
      )}
      {kind === 'moon' && (
        // Shadow eating the moon: the Umbral's crescent.
        <Circle
          cx={c - size * 0.5}
          cy={c - size * 0.12}
          r={size * 0.95}
          fill="#1b0f3d"
          opacity={0.78}
        />
      )}
    </Svg>
  );
});

// Highest point each layer's art reaches, as a fraction of screen height.
const TOP: Record<LayerKind, number> = {
  peaks: 0.15,
  hills: 0.4,
  castle: 0.2,
  forest: 0.38,
  near: 0.36,
  deadwood: 0.3,
  willows: 0.32,
  reeds: 0.45,
  stacks: 0.12,
  gears: 0.3,
  pipes: 0.4,
  clouds: 0.45,
  spires: 0.05,
};

/** Interpolates the ridge height at x so scenery sits on it. */
function ridgeAt(pts: [number, number][], width: number, x: number) {
  const seg = pts.length - 1;
  const i = Math.min(seg - 1, Math.floor((x / width) * seg));
  const t = (x - pts[i][0]) / (pts[i + 1][0] - pts[i][0]);
  return pts[i][1] * (1 - t) + pts[i + 1][1] * t;
}

function buildLayer(
  kind: LayerKind,
  width: number,
  height: number,
  full: number,
  seed: number,
) {
  const paths: string[] = [];
  const lights: { x: number; y: number; w: number; h: number }[] = [];
  let ridge;
  switch (kind) {
    case 'peaks':
      ridge = ridgePath(
        width,
        full,
        height * 0.62,
        height * 0.3,
        seed,
        9,
        height * 0.12,
      );
      break;
    case 'hills':
      ridge = ridgePath(width, full, height * 0.75, height * 0.16, seed, 6);
      break;
    case 'castle': {
      ridge = ridgePath(width, full, height * 0.78, height * 0.14, seed, 7);
      const k = keep(width * 0.55, height * 0.72, height * 0.42, seed);
      const k2 = keep(width * 0.08, height * 0.76, height * 0.22, seed + 3);
      paths.push(k.d, k2.d);
      lights.push(...k.windows, ...k2.windows);
      break;
    }
    case 'stacks': {
      ridge = ridgePath(width, full, height * 0.8, height * 0.08, seed, 6);
      for (
        let x = width * 0.05;
        x < width * 0.95;
        x += width * (0.08 + hash(x, seed) * 0.1)
      ) {
        const s = stack(
          x,
          ridgeAt(ridge.pts, width, x) + height * 0.02,
          height * (0.35 + hash(x, 3) * 0.35),
          x,
        );
        paths.push(s.d);
        lights.push(...s.windows);
      }
      break;
    }
    case 'gears': {
      ridge = ridgePath(width, full, height * 0.85, height * 0.06, seed, 6);
      for (
        let x = width * 0.1;
        x < width;
        x += width * (0.22 + hash(x, seed) * 0.15)
      ) {
        const r = height * (0.12 + hash(x, 5) * 0.12);
        paths.push(
          gear(
            x,
            ridgeAt(ridge.pts, width, x) - r * 0.2,
            r,
            10 + Math.floor(hash(x, 6) * 6),
          ),
        );
      }
      break;
    }
    case 'pipes': {
      ridge = ridgePath(width, full, height * 0.9, height * 0.04, seed, 6);
      for (let x = 0; x < width; x += width * 0.25) {
        paths.push(
          pipes(
            x,
            height * (0.8 + hash(x, 2) * 0.06),
            width * 0.18,
            height * 0.025,
            x,
          ),
        );
      }
      break;
    }
    case 'clouds':
      ridge = {
        d: cloudBank(width, height * 0.72, full, seed),
        pts: [] as [number, number][],
      };
      paths.push(cloudBank(width, height * 0.62, full, seed + 5));
      break;
    case 'spires': {
      ridge = ridgePath(width, full, height * 0.82, height * 0.1, seed, 6);
      for (
        let x = width * 0.04;
        x < width * 0.96;
        x += width * (0.07 + hash(x, seed) * 0.12)
      ) {
        const s = spire(
          x,
          ridgeAt(ridge.pts, width, x) + height * 0.02,
          height * (0.3 + hash(x, 4) * 0.45),
          x,
        );
        paths.push(s.d);
        lights.push(...s.windows);
      }
      break;
    }
    default: {
      const near = kind === 'near' || kind === 'reeds';
      const base = near ? 0.88 : 0.8;
      ridge = ridgePath(
        width,
        full,
        height * base,
        height * (near ? 0.08 : 0.12),
        seed,
        8,
      );
      const step = near ? width / 9 : width / 26;
      for (let x = step * 0.3; x < width - step * 0.3; x += step) {
        const r = hash(x, seed);
        if (kind === 'near' && r < 0.35) {
          continue;
        }
        const y = ridgeAt(ridge.pts, width, x) + height * 0.02;
        const h = height * (near ? 0.22 + r * 0.16 : 0.12 + r * 0.12);
        if (kind === 'reeds') {
          paths.push(r > 0.25 ? reeds(x, y, h * 0.6, x) : deadTree(x, y, h, x));
        } else if (kind === 'deadwood') {
          paths.push(
            r > 0.5 ? deadTree(x, y, h * 1.3, x) : reeds(x, y, h * 0.5, x),
          );
        } else if (kind === 'willows') {
          paths.push(r > 0.3 ? willow(x, y, h * 1.2, x) : deadTree(x, y, h, x));
        } else {
          paths.push(
            r > 0.4
              ? pine(x, y, h, x)
              : r > 0.15
              ? oak(x, y, h, x)
              : deadTree(x, y, h, x),
          );
        }
      }
    }
  }
  return { ridge: ridge.d, paths, lights };
}

const Layer = memo(
  ({
    width,
    height,
    kind,
    color,
    fog,
    seed,
    light,
  }: {
    width: number;
    height: number;
    kind: LayerKind;
    color: string;
    fog: string;
    seed: number;
    light: string;
  }) => {
    const full = height * 1.3;
    const art = useMemo(
      () => buildLayer(kind, width, height, full, seed),
      [kind, width, height, full, seed],
    );
    const fogId = `fog${seed}`;
    const top = TOP[kind] * height;
    return (
      <LowRes
        top={top}
        width={width}
        height={full - top}
        scale={0.5}
        viewBox={`0 ${top} ${width} ${full - top}`}
      >
        <Defs>
          <LinearGradient id={fogId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={fog} stopOpacity="0" />
            <Stop offset="1" stopColor={fog} stopOpacity="0.55" />
          </LinearGradient>
          <RadialGradient id="win" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor={light} stopOpacity="0.4" />
            <Stop offset="1" stopColor={light} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Path d={art.ridge} fill={color} />
        {art.paths.map((d, i) => (
          <Path
            key={i}
            d={d}
            fill={color}
            fillRule={kind === 'gears' ? 'evenodd' : 'nonzero'}
          />
        ))}
        {art.lights.map((l, i) => (
          <G key={`w${i}`}>
            <Circle
              cx={l.x + l.w / 2}
              cy={l.y + l.h / 2}
              r={Math.max(l.w, l.h) * 1.6}
              fill="url(#win)"
            />
            <Rect
              x={l.x}
              y={l.y}
              width={l.w}
              height={l.h}
              rx={Math.min(l.w, l.h) / 2}
              fill={light}
              opacity={0.9}
            />
          </G>
        ))}
        <Rect
          x={0}
          y={height * 0.55}
          width={width}
          height={full - height * 0.55}
          fill={`url(#${fogId})`}
        />
      </LowRes>
    );
  },
);

function Parallax({
  width,
  offset,
  dy,
  children,
}: {
  width: number;
  offset: number;
  dy: number;
  children: React.ReactNode;
}) {
  const o = -(((offset % width) + width) % width);
  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          transform: [
            { translateX: Math.round(o) },
            { translateY: Math.round(dy) },
          ],
        },
      ]}
    >
      <View style={StyleSheet.absoluteFill}>{children}</View>
      <View style={[StyleSheet.absoluteFill, { left: width, right: -width }]}>
        {children}
      </View>
    </View>
  );
}

export function Backdrop({
  width,
  height,
  camX,
  camY = 0,
  theme = 'dusk',
}: {
  width: number;
  height: number;
  camX: number;
  camY?: number;
  theme?: Theme;
}) {
  const t = THEMES[theme];
  const orbSize = Math.round(height * (t.orb === 'sun' ? 0.16 : 0.11));
  const layers = useMemo(
    () =>
      t.layers.map(l => (
        <Layer
          key={l.seed}
          width={width}
          height={height}
          kind={l.kind}
          color={l.color}
          fog={l.fog}
          seed={l.seed}
          light={t.light}
        />
      )),
    [width, height, t],
  );
  // The sun hangs low (dawn is breaking); the forge glow sits on the horizon.
  const orbPos =
    t.orb === 'sun'
      ? { x: 0.62, y: 0.58 }
      : t.orb === 'forge'
      ? { x: 0.5, y: 0.82 }
      : t.orb === 'paleMoon'
      ? { x: 0.25, y: 0.2 }
      : { x: 0.76, y: 0.22 };
  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        styles.root,
        { backgroundColor: t.sky[0] },
      ]}
    >
      <Sky width={width} height={height} t={t} />
      <View
        style={{
          position: 'absolute',
          left: width * orbPos.x - camX * 0.01,
          top: height * orbPos.y - camY * 0.01,
        }}
      >
        <Orb size={t.orb === 'forge' ? orbSize * 2.2 : orbSize} kind={t.orb} />
      </View>
      {t.layers.map((l, i) => (
        <Parallax
          key={l.seed}
          width={width}
          offset={camX * l.speed}
          dy={-camY * l.vy + height * 0.04}
        >
          {layers[i]}
        </Parallax>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  root: {
    overflow: 'hidden',
  },
});

const ForegroundArt = memo(
  ({ width, height }: { width: number; height: number }) => {
    const d = useMemo(() => {
      let p = '';
      const base = height;
      // Clumps of tall grass and reeds hugging the bottom edge.
      for (let x = 0; x < width; x += width / 60) {
        const r = hash(x, 77);
        if (r < 0.45) {
          continue;
        }
        const clump = 3 + Math.floor(r * 5);
        for (let k = 0; k < clump; k++) {
          const bx = x + k * 4;
          const h = height * (0.04 + hash(bx, 3) * 0.08);
          const bend = (hash(bx, 5) - 0.5) * h * 0.8;
          p += ` M${bx - 3} ${base} Q${bx + bend * 0.3} ${base - h * 0.6} ${
            bx + bend
          } ${base - h} Q${bx + 1} ${base - h * 0.4} ${bx + 4} ${base} Z`;
        }
      }
      return p;
    }, [width, height]);
    return (
      <Svg
        width={width}
        height={height * 0.14}
        viewBox={`0 ${height * 0.86} ${width} ${height * 0.14}`}
        style={[styles.layer, { top: height * 0.86 }]}
      >
        <Path d={d} fill="#020106" />
      </Svg>
    );
  },
);

export function Foreground({
  width,
  height,
  camX,
}: {
  width: number;
  height: number;
  camX: number;
}) {
  return (
    <Parallax width={width} offset={camX * 1.25} dy={0}>
      <ForegroundArt width={width} height={height} />
    </Parallax>
  );
}

export const Vignette = memo(
  ({ width, height }: { width: number; height: number }) => (
    <LowRes
      width={width}
      height={height}
      scale={0.125}
      viewBox={`0 0 ${width} ${height}`}
    >
      <Defs>
        <RadialGradient id="vig" cx="0.5" cy="0.45" rx="0.75" ry="0.75">
          <Stop offset="0.55" stopColor="#000000" stopOpacity="0" />
          <Stop offset="1" stopColor="#000000" stopOpacity="0.6" />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill="url(#vig)" />
    </LowRes>
  ),
);
