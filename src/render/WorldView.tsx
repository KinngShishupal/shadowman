import React, { memo, useMemo } from 'react';
import { View } from 'react-native';
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
import { isCrumbleBroken } from '../game/engine';
import { Theme } from '../game/story';
import { Enemy, LevelData, Player, World } from '../game/types';
import { buildTerrainArt, Piece, TerrainArt } from './art';
import { THEMES } from './themes';
import { Dot, GlowAt, LUMEN, Pic, Place, radial, UMBRAL } from './prims';
import { ActEnemy, ArrowSprite, actProps, BossSprite, motes } from './Sprites';
import { exitOpen } from '../game/engine';

const f = (n: number) => Math.round(n * 1000) / 1000;
const CHUNK = 8;

// =============================================================== terrain

const ACID: Record<Theme, [string, string]> = {
  dusk: ['#fff2b0', '#ffb347'],
  marsh: ['#f4ffb0', '#9ad84a'],
  foundry: ['#fff0a0', '#ff5a1a'],
  dawn: ['#ffffff', '#ffc070'],
};

function beltPath(b: { x0: number; x1: number; y: number; dir: 1 | -1 }) {
  let d = '';
  for (let x = b.x0 + 0.2; x < b.x1 - 0.2; x += 0.5) {
    const tip = b.dir > 0 ? x + 0.18 : x;
    const tail = b.dir > 0 ? x : x + 0.18;
    d += ` M${f(tail)} ${b.y + 0.07} L${f(tip)} ${b.y + 0.14} L${f(tail)} ${
      b.y + 0.21
    }`;
  }
  return d;
}

const Chunk = memo(
  ({
    art,
    index,
    T,
    height,
    theme,
  }: {
    art: TerrainArt;
    index: number;
    T: number;
    height: number;
    theme: Theme;
  }) => {
    const x0 = index * CHUNK;
    const x1 = x0 + CHUNK;
    const t = THEMES[theme];
    const pick = (list: Piece[]) =>
      list
        .filter(p => p.x1 > x0 - 0.5 && p.x0 < x1 + 0.5)
        .map(p => p.d)
        .join(' ');
    const d = useMemo(
      () => ({
        trees: pick(art.trees),
        body: pick(art.body),
        stones: pick(art.stones),
        rimGlow: art.rimGlow.filter(p => p.x1 > x0 && p.x0 < x1),
        sideGlow: pick(art.sideGlow),
        rimLine: pick(art.rimLine),
        grass: pick(art.grass),
        roots: pick(art.roots),
        spikes: pick(art.spikes),
        bridges: pick(art.bridges),
        ropes: pick(art.ropes),
        ice: pick(art.ice),
        acid: art.acid.filter(p => p.x1 > x0 && p.x0 < x1),
        beltBands: art.belts
          .filter(p => p.x1 > x0 && p.x0 < x1)
          .map(b => `M${b.x0} ${b.y} H${b.x1} V${b.y + 0.28} H${b.x0} Z`)
          .join(' '),
        beltMarks: art.belts
          .filter(p => p.x1 > x0 && p.x0 < x1)
          .map(beltPath)
          .join(' '),
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [art, x0],
    );
    const acid = ACID[theme];
    return (
      <Svg
        width={CHUNK * T}
        height={height * T}
        viewBox={`${x0} 0 ${CHUNK} ${height}`}
        style={{ position: 'absolute', left: x0 * T, top: 0 }}
      >
        <Defs>
          <LinearGradient id="rim" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={t.rimGlow} stopOpacity="0.42" />
            <Stop offset="0.25" stopColor={t.rimGlow} stopOpacity="0.14" />
            <Stop offset="1" stopColor={t.rimGlow} stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="acid" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={acid[0]} stopOpacity="0.95" />
            <Stop offset="0.25" stopColor={acid[1]} stopOpacity="0.85" />
            <Stop offset="1" stopColor={acid[1]} stopOpacity="0.25" />
          </LinearGradient>
          <LinearGradient id="ice" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#e8f8ff" stopOpacity="0.9" />
            <Stop offset="1" stopColor="#7ab8e8" stopOpacity="0.15" />
          </LinearGradient>
        </Defs>
        {d.trees ? <Path d={d.trees} fill={t.tree} /> : null}
        {d.body ? <Path d={d.body} fill={t.body} /> : null}
        {d.stones ? (
          <Path
            d={d.stones}
            fill="none"
            stroke={t.stone}
            strokeWidth={0.035}
            opacity={0.55}
          />
        ) : null}
        {d.rimGlow.map((p, i) => (
          <Path key={i} d={p.d} fill="url(#rim)" />
        ))}
        {d.sideGlow ? (
          <Path
            d={d.sideGlow}
            stroke={t.rimGlow}
            strokeWidth={0.04}
            opacity={0.35}
          />
        ) : null}
        {d.rimLine ? (
          <Path d={d.rimLine} stroke={t.rim} strokeWidth={0.05} />
        ) : null}
        {d.ice ? <Path d={d.ice} fill="url(#ice)" /> : null}
        {d.beltBands ? (
          <Path
            d={d.beltBands}
            fill="#1c1410"
            stroke="#5a4030"
            strokeWidth={0.02}
          />
        ) : null}
        {d.beltMarks ? (
          <Path
            d={d.beltMarks}
            stroke="#ffb04a"
            strokeWidth={0.045}
            fill="none"
            opacity={0.75}
          />
        ) : null}
        {d.acid.map((p, i) => (
          <Path key={`a${i}`} d={p.d} fill="url(#acid)" />
        ))}
        {d.grass ? <Path d={d.grass} fill={t.body} /> : null}
        {d.roots ? (
          <Path
            d={d.roots}
            stroke={theme === 'foundry' ? '#3a2a20' : t.body}
            strokeWidth={0.06}
            strokeLinecap="round"
            strokeDasharray={theme === 'foundry' ? '0.08 0.05' : undefined}
            fill="none"
          />
        ) : null}
        {d.ropes ? (
          <Path d={d.ropes} stroke="#2c1f45" strokeWidth={0.035} fill="none" />
        ) : null}
        {d.bridges ? (
          <Path
            d={d.bridges}
            fill="#120a20"
            stroke="#4a3478"
            strokeWidth={0.02}
          />
        ) : null}
        {d.spikes ? (
          <Path
            d={d.spikes}
            fill="#14060e"
            stroke="#ff5577"
            strokeWidth={0.03}
          />
        ) : null}
      </Svg>
    );
  },
);

export const TerrainLayer = memo(
  ({
    level,
    T,
    from,
    to,
  }: {
    level: LevelData;
    T: number;
    from: number;
    to: number;
  }) => {
    const art = useMemo(() => buildTerrainArt(level), [level]);
    const chunks = [];
    for (
      let i = Math.max(0, from);
      i <= Math.min(to, Math.ceil(level.width / CHUNK));
      i++
    ) {
      chunks.push(
        <Chunk
          key={i}
          art={art}
          index={i}
          T={T}
          height={level.height}
          theme={level.theme}
        />,
      );
    }
    return <>{chunks}</>;
  },
);

export function visibleChunks(camX: number, viewW: number) {
  return {
    from: Math.floor((camX - 2) / CHUNK),
    to: Math.floor((camX + viewW + 2) / CHUNK),
  };
}

// =============================================================== characters

type Pose = {
  lean: number;
  crouch: number;
  legs: [number, number][];
  arms: [number, number][];
};

function pose(anim: Player['anim'], t: number): Pose {
  const s = Math.sin(t * 12);
  const c = Math.cos(t * 12);
  switch (anim) {
    case 'run':
      return {
        lean: 4,
        crouch: Math.abs(c) * 0.03,
        legs: [
          [s * 42, s * 42 - 25 - Math.max(0, -c) * 70],
          [-s * 42, -s * 42 - 25 - Math.max(0, c) * 70],
        ],
        arms: [
          [-s * 50, -s * 50 + 70],
          [s * 50, s * 50 + 70],
        ],
      };
    case 'jump':
      return {
        lean: 6,
        crouch: 0,
        legs: [
          [60, -10],
          [-15, -75],
        ],
        arms: [
          [150, 175],
          [-40, 20],
        ],
      };
    case 'fall':
      return {
        lean: 0,
        crouch: 0,
        legs: [
          [25, -20],
          [-10, -40],
        ],
        arms: [
          [120, 150],
          [-110, -80],
        ],
      };
    case 'wall':
      return {
        lean: -5,
        crouch: 0.04,
        legs: [
          [70, 0],
          [30, -40],
        ],
        arms: [
          [165, 185],
          [130, 160],
        ],
      };
    case 'glide':
      // Arms flung wide, the umbral cloak open like wings.
      return {
        lean: 10,
        crouch: 0,
        legs: [
          [20, 5],
          [-10, -15],
        ],
        arms: [
          [110, 100],
          [-110, -100],
        ],
      };
    case 'hook':
      return {
        lean: 0,
        crouch: 0,
        legs: [
          [25, -10],
          [-15, -30],
        ],
        arms: [
          [175, 180],
          [-40, -10],
        ],
      };
    case 'skid':
      // Heels dug in, body thrown back against the momentum.
      return {
        lean: -22,
        crouch: 0.07,
        legs: [
          [45, 25],
          [15, -30],
        ],
        arms: [
          [-70, -40],
          [-110, -80],
        ],
      };
    case 'land':
      // Absorbing a heavy landing.
      return {
        lean: 28,
        crouch: 0.16,
        legs: [
          [70, -60],
          [35, -95],
        ],
        arms: [
          [55, 95],
          [-35, 10],
        ],
      };
    case 'dash':
      return {
        lean: 50,
        crouch: 0.06,
        legs: [
          [-50, -110],
          [20, -60],
        ],
        arms: [
          [-80, -70],
          [-60, -40],
        ],
      };
    default: {
      const b = Math.sin(t * 3) * 3;
      return {
        lean: 2,
        crouch: 0.015 + Math.sin(t * 3) * 0.008,
        legs: [
          [8, 2],
          [-6, -8],
        ],
        arms: [
          [10 + b, 30 + b],
          [-6 - b, 15 - b],
        ],
      };
    }
  }
}

const rad = (a: number) => (a * Math.PI) / 180;
function limb(
  x: number,
  y: number,
  a1: number,
  l1: number,
  a2: number,
  l2: number,
) {
  const kx = x + Math.sin(rad(a1)) * l1;
  const ky = y + Math.cos(rad(a1)) * l1;
  const ex = kx + Math.sin(rad(a2)) * l2;
  const ey = ky + Math.cos(rad(a2)) * l2;
  return `M${f(x)} ${f(y)} L${f(kx)} ${f(ky)} L${f(ex)} ${f(ey)}`;
}

/** Tapered ribbon along simulated scarf points; `sag` offsets a second tail. */
function rope(pts: { x: number; y: number }[], width: number, sag: number) {
  const top: string[] = [];
  const bottom: string[] = [];
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const w = width * (1 - (0.85 * i) / (n - 1));
    const x = pts[i].x;
    const y = pts[i].y + sag * (i / (n - 1));
    top.push(`${f(x + nx * w)} ${f(y + ny * w)}`);
    bottom.unshift(`${f(x - nx * w)} ${f(y - ny * w)}`);
  }
  return `M${top.join(' L')} L${bottom.join(' L')} Z`;
}

/** Shadowman in tile units, origin at the feet, facing +x. */
export function ShadowmanShape({
  anim,
  animT,
  vx,
  vy,
  time,
  rimDx,
  tilt = 0,
  scarf,
}: {
  anim: Player['anim'];
  animT: number;
  vx: number;
  vy: number;
  time: number;
  rimDx: number;
  tilt?: number;
  scarf?: { x: number; y: number }[];
}) {
  const p = pose(anim, animT);
  const hipX = 0;
  const hipY = -0.42 + p.crouch;
  const lean = rad(p.lean + tilt);
  const shX = hipX + Math.sin(lean) * 0.27;
  const shY = hipY - Math.cos(lean) * 0.27;
  const hx = shX + Math.sin(lean) * 0.15 + 0.02;
  const hy = shY - Math.cos(lean) * 0.15;

  const speed = Math.min(1, Math.abs(vx) / 7.5 + (anim === 'dash' ? 1 : 0));
  // Scarf: a tapered ribbon streaming back from the neck.
  const ribbon = (phase: number, len: number, width: number) => {
    const top: string[] = [];
    const bottom: string[] = [];
    const n = 8;
    for (let i = 0; i <= n; i++) {
      const k = i / n;
      const x = hx - 0.1 - k * len * (0.6 + speed * 0.5);
      const wave =
        Math.sin(time * 11 - i * 0.9 + phase) * 0.06 * k * (0.4 + speed);
      const droop =
        (1 - speed) * k * k * 0.35 +
        Math.max(-0.2, Math.min(0.2, vy * 0.015)) * k;
      const y = hy + 0.04 + wave + droop;
      const w = width * (1 - k * 0.85);
      top.push(`${f(x)} ${f(y - w)}`);
      bottom.unshift(`${f(x)} ${f(y + w)}`);
    }
    return `M${top.join(' L')} L${bottom.join(' L')} Z`;
  };

  const body = (color: string, back: string) => (
    <>
      <Path
        d={limb(hipX - 0.02, hipY, p.legs[1][0], 0.22, p.legs[1][1], 0.22)}
        stroke={back}
        strokeWidth={0.1}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d={limb(shX - 0.03, shY + 0.02, p.arms[1][0], 0.17, p.arms[1][1], 0.16)}
        stroke={back}
        strokeWidth={0.075}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d={`M${f(hipX)} ${f(hipY)} L${f(shX)} ${f(shY)}`}
        stroke={color}
        strokeWidth={0.2}
        strokeLinecap="round"
      />
      <Path
        d={limb(hipX + 0.02, hipY, p.legs[0][0], 0.22, p.legs[0][1], 0.22)}
        stroke={color}
        strokeWidth={0.105}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d={limb(shX + 0.02, shY + 0.02, p.arms[0][0], 0.17, p.arms[0][1], 0.16)}
        stroke={color}
        strokeWidth={0.08}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Circle cx={hx} cy={hy} r={0.15} fill={color} />
      <Path
        d={`M${f(hx - 0.13)} ${f(hy - 0.04)} L${f(hx - 0.24)} ${f(
          hy - 0.02,
        )} L${f(hx - 0.12)} ${f(hy + 0.06)} Z`}
        fill={color}
      />
    </>
  );

  return (
    <>
      <Circle
        cx={0}
        cy={-0.45}
        r={0.75}
        fill="url(#umbralGlow)"
        opacity={0.5}
      />
      {scarf ? (
        <>
          <Path d={rope(scarf, 0.03, 0.05)} fill="#1b8f7f" />
          <Path d={rope(scarf, 0.05, 0)} fill="#3ef0d0" />
        </>
      ) : (
        <>
          <Path d={ribbon(1.3, 0.55, 0.035)} fill="#1b8f7f" />
          <Path d={ribbon(0, 0.7, 0.05)} fill="url(#scarf)" />
        </>
      )}
      {anim === 'glide' && (
        // The umbral cloak spread between the arms like wings.
        <Path
          d={`M${f(shX - 0.62)} ${f(shY + 0.05)} Q${f(shX)} ${f(shY - 0.2)} ${f(
            shX + 0.62,
          )} ${f(shY + 0.05)} Q${f(shX + 0.3)} ${f(shY + 0.12)} ${f(
            hipX + 0.14,
          )} ${f(hipY + 0.05)} L${f(hipX - 0.14)} ${f(hipY + 0.05)} Q${f(
            shX - 0.3,
          )} ${f(shY + 0.12)} ${f(shX - 0.62)} ${f(shY + 0.05)} Z`}
          fill="#0c0a18"
          stroke="#3ef0d0"
          strokeWidth={0.02}
          opacity={0.92}
        />
      )}
      <G x={rimDx} y={-0.015} opacity={0.55}>
        {body('#9b85ff', '#9b85ff')}
      </G>
      {body('#000000', '#0c0a18')}
      <Circle cx={hx + 0.09} cy={hy - 0.01} r={0.2} fill="url(#eyeGlow)" />
      <Path
        d={`M${f(hx + 0.01)} ${f(hy - 0.035)} L${f(hx + 0.15)} ${f(
          hy - 0.025,
        )} L${f(hx + 0.14)} ${f(hy + 0.005)} L${f(hx + 0.02)} ${f(hy + 0.0)} Z`}
        fill="#a6fff0"
      />
    </>
  );
}

// =============================================================== characters

function PlayerDefs() {
  return (
    <Defs>
      {radial('umbralGlow', UMBRAL, 0.45)}
      {radial('eyeGlow', '#b8fff3', 0.9)}
      <LinearGradient id="scarf" x1="1" y1="0" x2="0" y2="0">
        <Stop offset="0" stopColor="#5bffe2" />
        <Stop offset="0.6" stopColor="#25c9ad" stopOpacity="0.9" />
        <Stop offset="1" stopColor="#1a8f7e" stopOpacity="0.2" />
      </LinearGradient>
    </Defs>
  );
}

function RagdollSprite({ p, T }: { p: Player; T: number }) {
  const r = p.ragdoll!;
  const o = r.pts[2];
  const L = (i: number) => ({ x: r.pts[i].x - o.x, y: r.pts[i].y - o.y });
  const seg = (a: number, b: number) =>
    `M${f(L(a).x)} ${f(L(a).y)} L${f(L(b).x)} ${f(L(b).y)}`;
  const scarf = p.scarf.map(q => ({ x: q.x - o.x, y: q.y - o.y }));
  const fade = Math.max(0, Math.min(1, p.deadTimer / 0.5));
  const head = L(0);
  return (
    <Place x={o.x} y={o.y} w={4} h={4} T={T} style={{ opacity: fade }}>
      <Svg width={4 * T} height={4 * T} viewBox="-2 -2 4 4">
        <Path d={rope(scarf, 0.05, 0)} fill="#3ef0d0" opacity={0.8} />
        <Path
          d={seg(2, 6) + seg(1, 4)}
          stroke="#0c0a18"
          strokeWidth={0.09}
          strokeLinecap="round"
        />
        <Path
          d={seg(1, 2)}
          stroke="#000"
          strokeWidth={0.2}
          strokeLinecap="round"
        />
        <Path
          d={seg(2, 5) + seg(1, 3)}
          stroke="#000"
          strokeWidth={0.1}
          strokeLinecap="round"
        />
        <Circle cx={head.x} cy={head.y} r={0.15} fill="#000" />
        <Circle
          cx={head.x}
          cy={head.y}
          r={0.04}
          fill="#3ef0d0"
          opacity={fade * 0.8}
        />
      </Svg>
    </Place>
  );
}

function PlayerSprite({
  p,
  time,
  T,
  cloaked,
}: {
  p: Player;
  time: number;
  T: number;
  cloaked: boolean;
}) {
  if (p.dead) {
    return p.ragdoll ? <RagdollSprite p={p} T={T} /> : null;
  }
  const sq = p.squash;
  const scarf = p.scarf.map(q => ({
    x: (q.x - (p.x + p.w / 2)) * p.facing,
    y: q.y - (p.y + p.h),
  }));
  const blink = p.invuln > 0 && Math.floor(time * 18) % 2 === 0;
  const fx = p.x + p.w / 2;
  const fy = p.y + p.h;
  return (
    <>
      {p.anim === 'dash' &&
        [1, 2, 3].map(k => (
          <GlowAt
            key={k}
            x={fx - p.dashDir * 0.4 * k}
            y={fy - 0.45}
            r={0.5}
            T={T}
            color={UMBRAL}
            strength={0.5 / k}
          />
        ))}
      <Place
        x={fx}
        y={fy - 0.55}
        w={2.4}
        h={2}
        T={T}
        style={{
          opacity: blink ? 0.35 : cloaked ? 0.4 + Math.sin(time * 8) * 0.1 : 1,
          // Squash/stretch about the feet, not the box centre.
          transform: [
            { translateY: -0.55 * T * sq },
            { scaleX: p.facing * (1 - sq * 0.5) },
            { scaleY: 1 + sq },
          ],
        }}
      >
        <Svg width={2.4 * T} height={2 * T} viewBox="-1.2 -1.55 2.4 2">
          <PlayerDefs />
          <ShadowmanShape
            anim={p.anim}
            animT={p.animT}
            vx={p.vx}
            vy={p.vy}
            time={time}
            rimDx={0.015}
            tilt={p.tilt * p.facing}
            scarf={scarf}
          />
        </Svg>
      </Place>
    </>
  );
}

function GuardShape({
  walk,
  aiming,
  color,
}: {
  walk: number;
  aiming: boolean;
  color: string;
}) {
  return (
    <>
      <Path
        d={`M-0.08 -0.78 Q-0.38 ${f(-0.45 + walk * 0.03)} ${f(
          -0.36 - walk * 0.04,
        )} -0.08 L-0.1 -0.12 Z`}
        fill={color}
      />
      <Path
        d={limb(-0.05, -0.42, walk * 25, 0.21, walk * 25 - 10, 0.21)}
        stroke={color}
        strokeWidth={0.11}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d={limb(0.05, -0.42, -walk * 25, 0.21, -walk * 25 - 10, 0.21)}
        stroke={color}
        strokeWidth={0.11}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M-0.15 -0.4 L-0.19 -0.78 Q0 -0.88 0.19 -0.78 L0.15 -0.4 Z"
        fill={color}
      />
      <Circle cx={0.14} cy={-0.77} r={0.08} fill={color} />
      <Circle cx={0.02} cy={-0.92} r={0.15} fill={color} />
      <Path d="M-0.06 -1.02 L-0.03 -1.22 L0.06 -1.03 Z" fill={color} />
      <Path
        d={limb(
          0.14,
          -0.74,
          aiming ? -100 : -60,
          0.17,
          aiming ? -95 : -110,
          0.15,
        )}
        stroke={color}
        strokeWidth={0.08}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d={aiming ? 'M0.42 -0.68 L0.42 -0.98' : 'M0.38 -0.6 L0.42 -0.98'}
        stroke={color}
        strokeWidth={0.035}
      />
    </>
  );
}

const GuardBody = memo(
  ({ T, walk, aiming }: { T: number; walk: number; aiming: boolean }) => (
    <Svg width={1.6 * T} height={1.7 * T} viewBox="-0.8 -1.55 1.6 1.7">
      <G x={0.015} y={-0.015}>
        <GuardShape walk={walk} aiming={aiming} color="#8a7240" />
      </G>
      <GuardShape walk={walk} aiming={aiming} color="#000000" />
      <Path
        d="M0.05 -0.94 L0.17 -0.93 L0.16 -0.9 L0.05 -0.905 Z"
        fill="#ffe08a"
      />
      <Path d="M0.42 -0.98 L0.58 -0.98 L0.6 -0.78 L0.4 -0.78 Z" fill="#000" />
      <Rect
        x={0.44}
        y={-0.95}
        width={0.12}
        height={0.14}
        rx={0.03}
        fill={aiming ? '#fffbe8' : LUMEN}
      />
      {aiming && (
        <Path
          d="M-0.04 -1.52 L0.07 -1.52 L0.04 -1.3 L-0.01 -1.3 Z"
          fill={LUMEN}
        />
      )}
    </Svg>
  ),
);

const Cone = memo(({ T }: { T: number }) => (
  <Svg width={3.2 * T} height={1.4 * T} viewBox="0 -0.7 3.2 1.4">
    <Defs>
      <LinearGradient id="cone" x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0" stopColor="#ffe08a" stopOpacity="0.8" />
        <Stop offset="1" stopColor="#ffe08a" stopOpacity="0" />
      </LinearGradient>
    </Defs>
    <Path d="M0 0 L3.2 -0.7 L3.2 0.7 Z" fill="url(#cone)" />
  </Svg>
));

function GuardSprite({ e, T, time }: { e: Enemy; T: number; time: number }) {
  // Quantise the walk cycle so the body SVG only redraws a few times per step.
  const walk = e.state === 'patrol' ? Math.round(Math.sin(e.t * 9) * 4) / 4 : 0;
  const aiming = e.state === 'aim';
  const charge = aiming ? 1 - e.timer / 0.55 : 0;
  const fx = e.x + e.w / 2;
  const fy = e.y + e.h;
  const lx = fx + e.dir * 0.5;
  const ly = fy - 0.87;
  const flick = 0.92 + Math.sin(time * 23 + e.id) * 0.08;
  return (
    <>
      {aiming && (
        <Place
          x={lx + e.dir * 1.6}
          y={ly}
          w={3.2}
          h={1.4}
          T={T}
          style={{
            opacity: 0.3 + charge * 0.5,
            transform: [{ scaleX: e.dir }, { scaleY: 0.3 + charge }],
          }}
        >
          <Cone T={T} />
        </Place>
      )}
      <GlowAt
        x={lx}
        y={ly}
        r={1.1}
        T={T}
        color={LUMEN}
        strength={0.75}
        style={{
          transform: [{ scale: (aiming ? 0.7 + charge * 0.6 : 0.6) * flick }],
        }}
      />
      <Place
        x={fx}
        y={fy - 0.7}
        w={1.6}
        h={1.7}
        T={T}
        style={{ transform: [{ scaleX: e.dir }] }}
      >
        <GuardBody T={T} walk={walk} aiming={aiming} />
      </Place>
    </>
  );
}

const WispArt = memo(({ T, dir }: { T: number; dir: number }) => (
  <Pic w={0.6} h={0.9} T={T}>
    <Defs>
      <RadialGradient id="core" cx="0.5" cy="0.7" r="0.6">
        <Stop offset="0" stopColor="#ffffff" />
        <Stop offset="0.5" stopColor="#ffe9a8" />
        <Stop offset="1" stopColor="#ffb347" />
      </RadialGradient>
    </Defs>
    <Path
      d="M-0.22 0.15 Q-0.24 -0.1 -0.05 -0.42 Q0.05 -0.15 0.12 -0.22 Q0.26 0 0.22 0.15 Q0.2 0.34 0 0.35 Q-0.2 0.34 -0.22 0.15 Z"
      fill="url(#core)"
    />
    <Circle cx={0.05 * dir} cy={0.12} r={0.04} fill="#3a2400" />
    <Circle cx={0.13 * dir} cy={0.12} r={0.04} fill="#3a2400" />
  </Pic>
));

function WispSprite({ e, T, time }: { e: Enemy; T: number; time: number }) {
  const cx = e.x + e.w / 2;
  const cy = e.y + e.h / 2 + Math.sin(e.t * 3) * 0.12;
  const fl = Math.sin(time * 17 + e.id) * 0.06;
  return (
    <>
      <GlowAt
        x={cx}
        y={cy}
        r={0.9}
        T={T}
        color={LUMEN}
        strength={0.7}
        style={{ transform: [{ scale: 1 + fl }] }}
      />
      <Place
        x={cx}
        y={cy - 0.05}
        w={0.6}
        h={0.9}
        T={T}
        style={{ transform: [{ scaleY: 1 + fl * 1.5 }] }}
      >
        <WispArt T={T} dir={e.dir} />
      </Place>
    </>
  );
}

// =============================================================== props

const GEAR = (() => {
  const n = 12;
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? 1 : 0.76;
    const a2 = a + Math.PI / (n * 2);
    d += `${i === 0 ? 'M' : 'L'}${f(Math.cos(a) * r)} ${f(
      Math.sin(a) * r,
    )} L${f(Math.cos(a2) * r)} ${f(Math.sin(a2) * r)} `;
  }
  return d + 'Z';
})();

const SawArt = memo(({ T, r }: { T: number; r: number }) => (
  <Pic w={r * 2.1} h={r * 2.1} T={T}>
    <Defs>
      <RadialGradient id="metal" cx="0.4" cy="0.35" r="0.7">
        <Stop offset="0" stopColor="#fff0c0" />
        <Stop offset="0.5" stopColor="#c9a24a" />
        <Stop offset="1" stopColor="#5a3f14" />
      </RadialGradient>
    </Defs>
    <G scale={r}>
      <Path d={GEAR} fill="url(#metal)" stroke="#3a2810" strokeWidth={0.05} />
      <Circle cx={0} cy={0} r={0.42} fill="#2a1a08" />
      <Circle cx={0} cy={0} r={0.16} fill="#e8c46a" />
      <Path
        d="M-0.42 0 H0.42 M0 -0.42 V0.42"
        stroke="#e8c46a"
        strokeWidth={0.08}
      />
    </G>
  </Pic>
));

const ShardArt = memo(({ T }: { T: number }) => (
  <Pic w={0.4} h={0.7} T={T}>
    <Defs>
      <LinearGradient id="crystal" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#e2fffa" />
        <Stop offset="0.5" stopColor={UMBRAL} />
        <Stop offset="1" stopColor="#127a6c" />
      </LinearGradient>
    </Defs>
    <Path
      d="M0 -0.3 L0.14 -0.05 L0 0.3 L-0.14 -0.05 Z"
      fill="url(#crystal)"
      stroke="#e2fffa"
      strokeWidth={0.02}
    />
    <Path
      d="M-0.14 -0.05 H0.14 M0 -0.3 V0.3"
      stroke="#e2fffa"
      strokeWidth={0.015}
      opacity={0.6}
    />
  </Pic>
));

const MaskArt = memo(({ T }: { T: number }) => (
  <Pic w={0.6} h={0.7} T={T}>
    <Path
      d="M0 -0.3 Q0.26 -0.3 0.24 -0.02 Q0.2 0.24 0 0.32 Q-0.2 0.24 -0.24 -0.02 Q-0.26 -0.3 0 -0.3 Z"
      fill="#f4eeff"
      stroke="#b9a8e0"
      strokeWidth={0.02}
    />
    <Path
      d="M-0.17 -0.06 Q-0.1 -0.12 -0.04 -0.05 Q-0.1 -0.01 -0.17 -0.06 Z M0.17 -0.06 Q0.1 -0.12 0.04 -0.05 Q0.1 -0.01 0.17 -0.06 Z"
      fill="#000"
    />
    <Path
      d="M0.02 -0.3 Q0.06 0 0.0 0.32"
      stroke="#ff4d6d"
      strokeWidth={0.035}
      fill="none"
    />
  </Pic>
));

// Gate art is centred on its portal; the arch base sits 1.15 below centre.
const GateArt = memo(({ T }: { T: number }) => (
  <Pic w={2.6} h={3.4} T={T}>
    <Defs>
      <RadialGradient id="portal" cx="0.5" cy="0.5" r="0.5">
        <Stop offset="0" stopColor="#000000" />
        <Stop offset="0.45" stopColor="#24104a" />
        <Stop offset="0.8" stopColor="#6a3fd0" />
        <Stop offset="1" stopColor={UMBRAL} />
      </RadialGradient>
    </Defs>
    <Ellipse cx={0} cy={0} rx={0.78} ry={1.08} fill="url(#portal)" />
    <Path
      d="M-1.15 1.15 V-0.15 Q0 -1.95 1.15 -0.15 V1.15 H0.8 V-0.1 Q0 -1.4 -0.8 -0.1 V1.15 Z"
      fill="#05020b"
      stroke="#8f6bff"
      strokeWidth={0.03}
    />
    <Path d="M-0.15 -1.3 L0 -1.1 L0.15 -1.3 L0 -1.5 Z" fill={UMBRAL} />
  </Pic>
));

const GateRing = memo(({ T }: { T: number }) => (
  <Pic w={1.3} h={1.3} T={T}>
    <Circle
      cx={0}
      cy={0}
      r={0.55}
      fill="none"
      stroke="#7fffe8"
      strokeWidth={0.04}
      strokeDasharray="0.3 0.25"
      opacity={0.7}
    />
    <Circle
      cx={0}
      cy={0}
      r={0.35}
      fill="none"
      stroke="#b49cff"
      strokeWidth={0.03}
      strokeDasharray="0.15 0.2"
      opacity={0.6}
    />
  </Pic>
));

// Totem art is centred 0.9 above the ground.
const TotemArt = memo(({ T, active }: { T: number; active: boolean }) => (
  <Pic w={0.6} h={1.8} T={T}>
    <Path
      d="M-0.24 0.9 L-0.17 -0.45 L0 -0.7 L0.17 -0.45 L0.24 0.9 Z"
      fill="#05020b"
      stroke="#6c4fd6"
      strokeWidth={0.025}
    />
    <Path
      d="M0 0.55 L-0.07 0.25 L0 -0.05 L0.07 0.25 Z M0 -0.15 V-0.4"
      stroke={active ? '#7fffe8' : '#3a2c5c'}
      strokeWidth={0.03}
      fill="none"
    />
  </Pic>
));

const FlameArt = memo(({ T }: { T: number }) => (
  <Pic w={0.5} h={0.8} T={T}>
    <Defs>
      <RadialGradient id="flame" cx="0.5" cy="0.75" r="0.75">
        <Stop offset="0" stopColor="#ffffff" />
        <Stop offset="0.35" stopColor="#7fffe8" />
        <Stop offset="1" stopColor="#1fae96" stopOpacity="0.1" />
      </RadialGradient>
    </Defs>
    <Path
      d="M-0.17 0.25 Q-0.19 0 0 -0.38 Q0.2 0 0.17 0.25 Q0 0.38 -0.17 0.25 Z"
      fill="url(#flame)"
    />
  </Pic>
));

const SpringArt = memo(({ T, squash }: { T: number; squash: boolean }) => {
  const sq = squash ? 0.15 : 0;
  return (
    <Pic w={1} h={1} T={T}>
      <Defs>
        <LinearGradient id="cap" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#9a7bff" />
          <Stop offset="1" stopColor="#3a1f8a" />
        </LinearGradient>
      </Defs>
      <Path
        d={`M-0.08 0.5 Q-0.12 0.25 -0.06 ${
          0.1 + sq
        } H0.06 Q0.12 0.25 0.08 0.5 Z`}
        fill="#05020b"
      />
      <Path
        d={`M-0.45 ${0.14 + sq} Q-0.45 ${-0.25 + sq * 1.5} 0 ${
          -0.28 + sq * 1.5
        } Q0.45 ${-0.25 + sq * 1.5} 0.45 ${0.14 + sq} Q0 ${0.06 + sq} -0.45 ${
          0.14 + sq
        } Z`}
        fill="url(#cap)"
      />
      <Circle cx={-0.18} cy={-0.05 + sq} r={0.05} fill="#7fffe8" />
      <Circle cx={0.12} cy={-0.12 + sq} r={0.04} fill="#7fffe8" />
      <Circle cx={0.25} cy={0.02 + sq} r={0.03} fill="#7fffe8" />
    </Pic>
  );
});

const MoverArt = memo(({ T, w }: { T: number; w: number }) => (
  <Pic w={w} h={0.6} T={T}>
    <Path
      d={`M${-w / 2} -0.3 H${w / 2} L${w / 2 - 0.12} 0.08 Q0 0.25 ${
        -w / 2 + 0.12
      } 0.08 Z`}
      fill="#0b0517"
    />
    <Path
      d={`M${-w / 2} -0.28 H${w / 2}`}
      stroke="#b49cff"
      strokeWidth={0.05}
    />
    {Array.from({ length: w }, (_, k) => (
      <Circle key={k} cx={-w / 2 + k + 0.5} cy={-0.1} r={0.05} fill="#7fffe8" />
    ))}
  </Pic>
));

const CrumbleArt = memo(({ T, hot }: { T: number; hot: boolean }) => (
  <Pic w={1} h={1} T={T}>
    <Path
      d="M-0.47 -0.48 H0.47 L0.42 0.2 L0.1 0.35 L-0.2 0.25 L-0.42 0.3 Z"
      fill="#0c0617"
      stroke={hot ? '#ff5577' : '#8f6bff'}
      strokeWidth={0.03}
    />
    <Path
      d="M-0.15 -0.45 L-0.05 -0.15 L-0.2 0.1 M-0.05 -0.15 L0.25 0"
      stroke="#3a2a60"
      strokeWidth={0.03}
      fill="none"
    />
  </Pic>
));

// Beam art is centred on the emitter lens.
const EmitterArt = memo(
  ({ T, lit }: { T: number; lit: 'on' | 'warn' | 'off' }) => (
    <Pic w={1} h={1} T={T}>
      <Path
        d="M-0.38 0 L-0.25 -0.45 H0.25 L0.38 0 Z"
        fill="#05020b"
        stroke="#6c4fd6"
        strokeWidth={0.025}
      />
      <Ellipse
        cx={0}
        cy={0}
        rx={0.3}
        ry={0.06}
        fill={lit === 'on' ? '#fffbe8' : lit === 'warn' ? LUMEN : '#4a3a20'}
      />
    </Pic>
  ),
);

const BeamArt = memo(({ T, h }: { T: number; h: number }) => (
  <Svg width={2.2 * T} height={h * T} viewBox={`0 0 2.2 ${h}`}>
    <Defs>
      <LinearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0" stopColor={LUMEN} stopOpacity="0" />
        <Stop offset="0.35" stopColor={LUMEN} stopOpacity="0.35" />
        <Stop offset="0.5" stopColor="#fff8e0" stopOpacity="0.95" />
        <Stop offset="0.65" stopColor={LUMEN} stopOpacity="0.35" />
        <Stop offset="1" stopColor={LUMEN} stopOpacity="0" />
      </LinearGradient>
    </Defs>
    <Rect x={0} y={0} width={2.2} height={h} fill="url(#beam)" opacity={0.25} />
    <Rect x={0.7} y={0} width={0.8} height={h} fill="url(#beam)" />
  </Svg>
));

const BoltArt = memo(({ T }: { T: number }) => (
  <Pic w={1.1} h={0.3} T={T}>
    <Ellipse cx={-0.2} cy={0} rx={0.35} ry={0.06} fill={UMBRAL} opacity={0.4} />
    <Ellipse cx={0.25} cy={0} rx={0.17} ry={0.08} fill="#eafffb" />
  </Pic>
));

// =============================================================== layer

export function EntityLayer({ w, T }: { w: World; T: number }) {
  const { camera: cam, view, time } = w;
  const minX = cam.x - 3;
  const maxX = cam.x + view.w + 3;
  const vis = (x0: number, x1: number) => x1 > minX && x0 < maxX;
  const n: React.ReactNode[] = [];

  const theme = THEMES[w.level.theme];
  n.push(...motes(w, T, theme.motes, theme.moteRise));

  const ex = w.exit;
  if (vis(ex.x - 2, ex.x + 3)) {
    const gx = ex.x + 0.5;
    const gy = ex.y + 1 - 1.15;
    n.push(
      <React.Fragment key="exit">
        <GlowAt
          x={gx}
          y={gy}
          r={2.2}
          T={T}
          color={UMBRAL}
          strength={0.35}
          style={{ transform: [{ scale: 1 + Math.sin(time * 3) * 0.06 }] }}
        />
        <Place x={gx} y={gy} w={2.6} h={3.4} T={T}>
          <GateArt T={T} />
        </Place>
        <Place
          x={gx}
          y={gy}
          w={1.3}
          h={1.3}
          T={T}
          style={{
            opacity: exitOpen(w) ? 1 : 0.15,
            transform: [{ rotate: `${(time * 60) % 360}deg` }, { scaleY: 1.4 }],
          }}
        >
          <GateRing T={T} />
        </Place>
      </React.Fragment>,
    );
  }

  for (const cp of w.checkpoints) {
    if (!vis(cp.x, cp.x + 1)) {
      continue;
    }
    const bx = cp.x + 0.5;
    const by = cp.y + 1;
    const fl = Math.sin(time * 14 + cp.id) * 0.08;
    n.push(
      <React.Fragment key={`cp${cp.id}`}>
        {cp.active && (
          <GlowAt
            x={bx}
            y={by - 1.8}
            r={1.2}
            T={T}
            color={UMBRAL}
            strength={0.5}
          />
        )}
        <Place x={bx} y={by - 0.9} w={0.6} h={1.8} T={T}>
          <TotemArt T={T} active={cp.active} />
        </Place>
        {cp.active && (
          <Place
            x={bx}
            y={by - 1.9}
            w={0.5}
            h={0.8}
            T={T}
            style={{
              transform: [{ scaleY: 1 + fl }, { scaleX: 1 - fl * 0.5 }],
            }}
          >
            <FlameArt T={T} />
          </Place>
        )}
      </React.Fragment>,
    );
  }

  const tx0 = Math.max(0, Math.floor(minX));
  const tx1 = Math.min(w.level.width - 1, Math.ceil(maxX));
  for (let ty = 0; ty < w.level.height; ty++) {
    const row = w.grid[ty];
    for (let tx = tx0; tx <= tx1; tx++) {
      if (row[tx] !== 'C' || isCrumbleBroken(w, tx, ty)) {
        continue;
      }
      const c = w.crumbles.get(ty * w.level.width + tx);
      const j = c && c.timer > 0 ? (Math.random() - 0.5) * 0.08 : 0;
      n.push(
        <Place
          key={`c${tx}-${ty}`}
          x={tx + 0.5 + j}
          y={ty + 0.5}
          w={1}
          h={1}
          T={T}
        >
          <CrumbleArt T={T} hot={!!c} />
        </Place>,
      );
    }
  }

  for (const m of w.movers) {
    if (!vis(m.x, m.x + m.w)) {
      continue;
    }
    n.push(
      <React.Fragment key={`m${m.id}`}>
        <GlowAt
          x={m.x + m.w / 2}
          y={m.y + 0.45}
          r={m.w * 0.5}
          T={T}
          color={UMBRAL}
          strength={0.35}
          style={{ transform: [{ scaleY: 0.35 }] }}
        />
        <Place x={m.x + m.w / 2} y={m.y + 0.3} w={m.w} h={0.6} T={T}>
          <MoverArt T={T} w={m.w} />
        </Place>
      </React.Fragment>,
    );
  }

  for (const s of w.springs) {
    if (!vis(s.x, s.x + 1)) {
      continue;
    }
    n.push(
      <React.Fragment key={`sp${s.id}`}>
        <GlowAt
          x={s.x + 0.5}
          y={s.y + 0.6}
          r={0.7}
          T={T}
          color="#8f6bff"
          strength={0.35}
        />
        <Place x={s.x + 0.5} y={s.y + 0.5} w={1} h={1} T={T}>
          <SpringArt T={T} squash={s.t > 0} />
        </Place>
      </React.Fragment>,
    );
  }

  for (const b of w.beams) {
    if (!vis(b.x - 1, b.x + 2)) {
      continue;
    }
    const h = b.y1 - b.y0;
    const lit = b.active ? 'on' : b.warning ? 'warn' : 'off';
    n.push(
      <React.Fragment key={`b${b.id}`}>
        {b.active && (
          <>
            <Place
              x={b.x + 0.5}
              y={b.y0 + h / 2}
              w={2.2}
              h={h}
              T={T}
              style={{ opacity: 0.85 + Math.random() * 0.15 }}
            >
              <BeamArt T={T} h={h} />
            </Place>
            <GlowAt
              x={b.x + 0.5}
              y={b.y1}
              r={1.2}
              T={T}
              color={LUMEN}
              strength={0.7}
              style={{ transform: [{ scaleY: 0.35 }] }}
            />
          </>
        )}
        {b.warning && Math.floor(time * 16) % 2 === 0 && (
          <View
            style={{
              position: 'absolute',
              left: (b.x + 0.47) * T,
              top: b.y0 * T,
              width: Math.max(2, 0.06 * T),
              height: h * T,
              backgroundColor: 'rgba(255,211,107,0.55)',
            }}
          />
        )}
        <GlowAt
          x={b.x + 0.5}
          y={b.y0}
          r={0.7}
          T={T}
          color={LUMEN}
          strength={lit === 'on' ? 0.85 : lit === 'warn' ? 0.5 : 0.2}
        />
        <Place x={b.x + 0.5} y={b.y0} w={1} h={1} T={T}>
          <EmitterArt T={T} lit={lit} />
        </Place>
      </React.Fragment>,
    );
  }

  for (const s of w.saws) {
    if (!vis(s.x - 1, s.x + 1)) {
      continue;
    }
    const horiz = s.axis === 'x';
    const mace = s.axis === 'c';
    const chainLen = Math.hypot(s.x - s.ox, s.y - s.oy);
    n.push(
      <React.Fragment key={`saw${s.id}`}>
        {mace ? (
          <View
            style={{
              position: 'absolute',
              left: ((s.ox + s.x) / 2 - chainLen / 2) * T,
              top: ((s.oy + s.y) / 2) * T - 2,
              width: chainLen * T,
              height: 4,
              backgroundColor: '#4a3a2a',
              transform: [
                {
                  rotate: `${
                    (Math.atan2(s.y - s.oy, s.x - s.ox) * 180) / Math.PI
                  }deg`,
                },
              ],
            }}
          />
        ) : (
          <View
            style={{
              position: 'absolute',
              left: (s.ox - (horiz ? 0 : 0.03)) * T,
              top: (s.oy - (horiz ? 0.03 : 0)) * T,
              width: (horiz ? s.range : 0.06) * T,
              height: (horiz ? 0.06 : s.range) * T,
              borderRadius: 0.03 * T,
              backgroundColor: '#3a2a14',
            }}
          />
        )}
        {mace && (
          <Dot x={s.ox} y={s.oy} r={0.12} T={T} color="#6a5a4a" opacity={1} />
        )}
        <GlowAt
          x={s.x}
          y={s.y}
          r={s.r * 2.2}
          T={T}
          color={LUMEN}
          strength={0.4}
        />
        <Place
          x={s.x}
          y={s.y}
          w={s.r * 2.1}
          h={s.r * 2.1}
          T={T}
          style={{ transform: [{ rotate: `${(time * 720) % 360}deg` }] }}
        >
          <SawArt T={T} r={s.r} />
        </Place>
      </React.Fragment>,
    );
  }

  n.push(...actProps(w, T, vis));

  for (const pk of w.pickups) {
    if (pk.taken || !vis(pk.x - 1, pk.x + 1)) {
      continue;
    }
    const y = pk.y + Math.sin(time * 3 + pk.id) * 0.08;
    if (pk.kind !== 'shard' && pk.kind !== 'mask') {
      continue;
    }
    if (pk.kind === 'shard') {
      n.push(
        <React.Fragment key={`pk${pk.id}`}>
          <GlowAt
            x={pk.x}
            y={y}
            r={0.45}
            T={T}
            color={UMBRAL}
            strength={0.55}
          />
          <Place
            x={pk.x}
            y={y}
            w={0.4}
            h={0.7}
            T={T}
            style={{
              transform: [
                {
                  scaleX: 0.35 + Math.abs(Math.cos(time * 2.5 + pk.id)) * 0.65,
                },
              ],
            }}
          >
            <ShardArt T={T} />
          </Place>
        </React.Fragment>,
      );
    } else {
      n.push(
        <React.Fragment key={`pk${pk.id}`}>
          <GlowAt
            x={pk.x}
            y={y}
            r={0.7}
            T={T}
            color="#ffffff"
            strength={0.45}
          />
          <Place x={pk.x} y={y} w={0.6} h={0.7} T={T}>
            <MaskArt T={T} />
          </Place>
        </React.Fragment>,
      );
    }
  }

  for (const e of w.enemies) {
    if (!e.alive || !vis(e.x - 2, e.x + 3)) {
      continue;
    }
    n.push(
      e.kind === 'guard' ? (
        <GuardSprite key={`e${e.id}`} e={e} T={T} time={time} />
      ) : e.kind === 'wisp' ? (
        <WispSprite key={`e${e.id}`} e={e} T={T} time={time} />
      ) : (
        <ActEnemy key={`e${e.id}`} e={e} T={T} time={time} />
      ),
    );
  }
  if (w.boss) {
    n.push(<BossSprite key="boss" w={w} T={T} />);
  }

  if (w.status === 'playing') {
    n.push(
      <PlayerSprite
        key="player"
        p={w.player}
        time={time}
        T={T}
        cloaked={w.cloakT > 0}
      />,
    );
  } else if (w.status === 'exiting') {
    const k = Math.max(0, w.exitTimer);
    const p = w.player;
    n.push(
      <Place
        key="player"
        x={p.x + p.w / 2}
        y={p.y + p.h - 0.55}
        w={2.4}
        h={2}
        T={T}
        style={{
          opacity: k,
          transform: [
            { scale: 0.3 + k * 0.7 },
            { rotate: `${(1 - k) * 360}deg` },
          ],
        }}
      >
        <Svg width={2.4 * T} height={2 * T} viewBox="-1.2 -1.55 2.4 2">
          <PlayerDefs />
          <ShadowmanShape
            anim="idle"
            animT={0}
            vx={0}
            vy={0}
            time={time}
            rimDx={0}
          />
        </Svg>
      </Place>,
    );
  }

  for (const pr of w.projectiles) {
    if (!vis(pr.x - 1, pr.x + 1)) {
      continue;
    }
    if (pr.owner === 'player') {
      n.push(
        <React.Fragment key={`pr${pr.id}`}>
          <GlowAt
            x={pr.x}
            y={pr.y}
            r={0.4}
            T={T}
            color={UMBRAL}
            strength={0.7}
          />
          <Place
            x={pr.x - Math.sign(pr.vx) * 0.25}
            y={pr.y}
            w={1.1}
            h={0.3}
            T={T}
            style={{ transform: [{ scaleX: Math.sign(pr.vx) }] }}
          >
            <BoltArt T={T} />
          </Place>
        </React.Fragment>,
      );
    } else if (pr.g > 0) {
      n.push(
        <ArrowSprite
          key={`pr${pr.id}`}
          x={pr.x}
          y={pr.y}
          vx={pr.vx}
          vy={pr.vy}
          T={T}
        />,
      );
    } else {
      n.push(
        <React.Fragment key={`pr${pr.id}`}>
          <GlowAt
            x={pr.x}
            y={pr.y}
            r={0.55}
            T={T}
            color={LUMEN}
            strength={0.85}
          />
          <Dot x={pr.x} y={pr.y} r={0.11} T={T} color="#fffbe8" opacity={1} />
        </React.Fragment>,
      );
    }
  }

  w.particles.forEach((pa, i) => {
    n.push(
      <Dot
        key={`pa${i}`}
        x={pa.x}
        y={pa.y}
        r={pa.size * 0.6}
        T={T}
        color={pa.color}
        opacity={Math.max(0, pa.life / pa.max)}
      />,
    );
  });

  return <>{n}</>;
}

/** Standalone Shadowman for menus. */
export function ShadowmanPortrait({
  size,
  time,
}: {
  size: number;
  time: number;
}) {
  return (
    <Svg width={size * 1.6} height={size * 1.3} viewBox="-0.9 -1.2 1.6 1.3">
      <PlayerDefs />
      <ShadowmanShape
        anim="idle"
        animT={time}
        vx={0}
        vy={0}
        time={time}
        rimDx={0.012}
      />
    </Svg>
  );
}
