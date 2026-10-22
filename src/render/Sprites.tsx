// Sprites for Acts II to IV: new enemies, hazards, tools, and Solenne.
import React, { memo } from 'react';
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
import { TOOLS } from '../game/constants';
import { crusherWarning } from '../game/systems';
import { Enemy, World } from '../game/types';
import { Dot, GlowAt, LUMEN, Pic, Place, UMBRAL } from './prims';

const f = (n: number) => Math.round(n * 1000) / 1000;

// ---------------------------------------------------------------- enemies

const ArcherArt = memo(({ T, drawn }: { T: number; drawn: boolean }) => (
  <Pic w={1.4} h={1.6} T={T}>
    <G y={0.75}>
      {/* Hooded bowman: cloak, legs, bow arm forward. */}
      <Path
        d="M-0.08 -0.95 Q-0.32 -0.5 -0.3 -0.05 L0.12 -0.05 L0.1 -0.6 Z"
        fill="#000"
      />
      <Path
        d="M-0.06 -0.42 L-0.12 0 M0.06 -0.42 L0.1 0"
        stroke="#000"
        strokeWidth={0.1}
        strokeLinecap="round"
      />
      <Path
        d="M-0.12 -0.42 L-0.14 -0.78 Q0 -0.86 0.14 -0.78 L0.12 -0.42 Z"
        fill="#000"
      />
      <Path d="M-0.12 -0.86 Q-0.02 -1.16 0.16 -0.9 L0.14 -0.78 Z" fill="#000" />
      <Circle cx={0.03} cy={-0.88} r={0.12} fill="#000" />
      <Path d="M0.06 -0.9 L0.13 -0.89" stroke={LUMEN} strokeWidth={0.03} />
      <Path
        d={drawn ? 'M0.1 -0.72 L0.3 -0.72' : 'M0.1 -0.7 L0.26 -0.6'}
        stroke="#000"
        strokeWidth={0.07}
        strokeLinecap="round"
      />
      <Path
        d="M0.3 -1.05 Q0.52 -0.72 0.3 -0.38"
        stroke="#000"
        strokeWidth={0.05}
        fill="none"
      />
      <Path
        d={
          drawn ? 'M0.3 -1.05 L0.08 -0.72 L0.3 -0.38' : 'M0.3 -1.05 L0.3 -0.38'
        }
        stroke={LUMEN}
        strokeWidth={0.015}
        fill="none"
      />
      {drawn && (
        <Path
          d="M0.08 -0.72 L0.55 -0.72"
          stroke="#fff3c4"
          strokeWidth={0.025}
        />
      )}
    </G>
  </Pic>
));

const TurretArt = memo(({ T, hot }: { T: number; hot: boolean }) => (
  <Pic w={1} h={1} T={T}>
    <Defs>
      <RadialGradient id="eye" cx="0.5" cy="0.5" r="0.5">
        <Stop offset="0" stopColor="#ffffff" />
        <Stop offset="0.4" stopColor={hot ? '#fff3c4' : LUMEN} />
        <Stop offset="1" stopColor="#c07a1a" />
      </RadialGradient>
    </Defs>
    <Path
      d="M-0.42 0.45 L-0.3 0.05 L0.3 0.05 L0.42 0.45 Z"
      fill="#05020b"
      stroke="#6c4fd6"
      strokeWidth={0.02}
    />
    <Circle
      cx={0}
      cy={0}
      r={0.32}
      fill="#0b0614"
      stroke="#8a6a2a"
      strokeWidth={0.04}
    />
    <Circle cx={0} cy={0} r={0.18} fill="url(#eye)" />
  </Pic>
));

const TurretPupil = memo(({ T }: { T: number }) => (
  <Pic w={0.8} h={0.2} T={T}>
    <Rect
      x={0.1}
      y={-0.05}
      width={0.28}
      height={0.1}
      rx={0.05}
      fill="#05020b"
    />
  </Pic>
));

const BruteArt = memo(
  ({ T, walk, charging }: { T: number; walk: number; charging: boolean }) => (
    <Pic w={1.8} h={1.8} T={T}>
      <G y={0.85} x={charging ? 0.08 : 0}>
        <Path
          d={`M-0.1 -0.55 L${f(-0.18 + walk * 0.08)} 0 M0.12 -0.55 L${f(
            0.18 - walk * 0.08,
          )} 0`}
          stroke="#000"
          strokeWidth={0.16}
          strokeLinecap="round"
        />
        <Path
          d="M-0.3 -0.55 L-0.34 -1.05 Q0 -1.2 0.3 -1.05 L0.28 -0.55 Z"
          fill="#000"
        />
        <Circle cx={0} cy={-1.18} r={0.19} fill="#000" />
        <Path
          d="M-0.2 -1.22 L-0.36 -1.42 L-0.12 -1.3 Z M0.2 -1.22 L0.36 -1.42 L0.12 -1.3 Z"
          fill="#000"
        />
        <Path d="M0.02 -1.2 L0.17 -1.19" stroke="#ff8a3a" strokeWidth={0.04} />
        {/* Tower shield, rim-lit in gold. */}
        <Path
          d="M0.32 -1.15 L0.62 -1.05 L0.62 -0.25 Q0.47 0 0.32 -0.15 Z"
          fill="#0b0614"
          stroke="#d8a84a"
          strokeWidth={0.04}
        />
        <Path
          d="M0.47 -0.95 V-0.35 M0.37 -0.7 H0.57"
          stroke="#d8a84a"
          strokeWidth={0.03}
        />
      </G>
    </Pic>
  ),
);

const MothArt = memo(({ T }: { T: number }) => (
  <Pic w={1.2} h={0.8} T={T}>
    <Defs>
      <RadialGradient id="wing" cx="0.5" cy="0.5" r="0.5">
        <Stop offset="0" stopColor="#fff6d8" stopOpacity="0.95" />
        <Stop offset="1" stopColor={LUMEN} stopOpacity="0.25" />
      </RadialGradient>
    </Defs>
    <Path
      d="M0 0 Q-0.5 -0.45 -0.55 -0.05 Q-0.45 0.3 0 0.05 Z M0 0 Q0.5 -0.45 0.55 -0.05 Q0.45 0.3 0 0.05 Z"
      fill="url(#wing)"
    />
    <Ellipse cx={0} cy={0.02} rx={0.06} ry={0.18} fill="#2a1a08" />
    <Path
      d="M-0.02 -0.15 Q-0.1 -0.3 -0.18 -0.32 M0.02 -0.15 Q0.1 -0.3 0.18 -0.32"
      stroke="#2a1a08"
      strokeWidth={0.02}
      fill="none"
    />
  </Pic>
));

export function ActEnemy({
  e,
  T,
  time,
}: {
  e: Enemy;
  T: number;
  time: number;
}) {
  const cx = e.x + e.w / 2;
  const flash = e.hitT > 0 ? 0.4 : 1;
  switch (e.kind) {
    case 'archer': {
      const drawn = e.state === 'aim';
      return (
        <>
          {drawn && (
            <GlowAt
              x={cx + e.dir * 0.4}
              y={e.y + 0.3}
              r={0.5}
              T={T}
              color={LUMEN}
              strength={0.6}
            />
          )}
          <Place
            x={cx}
            y={e.y + e.h - 0.75}
            w={1.4}
            h={1.6}
            T={T}
            style={{ transform: [{ scaleX: e.dir }] }}
          >
            <ArcherArt T={T} drawn={drawn} />
          </Place>
        </>
      );
    }
    case 'turret': {
      const cy = e.y + e.h / 2;
      const ang = (Math.atan2(e.aimY, e.aimX) * 180) / Math.PI;
      const hot = e.state === 'aim' && e.timer < 0.4;
      return (
        <>
          <GlowAt
            x={cx}
            y={cy}
            r={hot ? 1.1 : 0.8}
            T={T}
            color={LUMEN}
            strength={hot ? 0.7 : 0.35}
          />
          <Place x={cx} y={cy} w={1} h={1} T={T} style={{ opacity: flash }}>
            <TurretArt T={T} hot={hot} />
          </Place>
          <Place
            x={cx}
            y={cy}
            w={0.8}
            h={0.2}
            T={T}
            style={{ transform: [{ rotate: `${ang}deg` }] }}
          >
            <TurretPupil T={T} />
          </Place>
        </>
      );
    }
    case 'brute': {
      const charging = e.state === 'charge';
      const walk = Math.round(Math.sin(e.t * (charging ? 16 : 7)) * 3) / 3;
      return (
        <>
          {charging && (
            <GlowAt
              x={cx - e.dir * 0.5}
              y={e.y + e.h - 0.1}
              r={0.6}
              T={T}
              color="#ff8a3a"
              strength={0.35}
            />
          )}
          <Place
            x={cx}
            y={e.y + e.h - 0.85}
            w={1.8}
            h={1.8}
            T={T}
            style={{ opacity: flash, transform: [{ scaleX: e.dir }] }}
          >
            <BruteArt T={T} walk={walk} charging={charging} />
          </Place>
        </>
      );
    }
    case 'moth': {
      const flap = 0.35 + Math.abs(Math.sin(time * 14 + e.id)) * 0.65;
      return (
        <>
          <GlowAt
            x={cx}
            y={e.y + e.h / 2}
            r={0.8}
            T={T}
            color={LUMEN}
            strength={0.5}
          />
          <Place
            x={cx}
            y={e.y + e.h / 2}
            w={1.2}
            h={0.8}
            T={T}
            style={{ transform: [{ scaleX: flap }] }}
          >
            <MothArt T={T} />
          </Place>
        </>
      );
    }
    default:
      return null;
  }
}

// ---------------------------------------------------------------- boss

const SolenneArt = memo(({ T, wings }: { T: number; wings: number }) => (
  <Pic w={4} h={3} T={T}>
    <Defs>
      <LinearGradient id="wingL" x1="1" y1="0" x2="0" y2="0">
        <Stop offset="0" stopColor="#fff6d8" stopOpacity="0.95" />
        <Stop offset="1" stopColor={LUMEN} stopOpacity="0.1" />
      </LinearGradient>
      <RadialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
        <Stop offset="0.6" stopColor="#fff6d8" stopOpacity="0" />
        <Stop offset="0.8" stopColor="#fff6d8" stopOpacity="0.9" />
        <Stop offset="1" stopColor={LUMEN} stopOpacity="0" />
      </RadialGradient>
    </Defs>
    {/* Wings of light. */}
    <G scaleY={wings}>
      <Path
        d="M-0.2 -0.3 Q-1.2 -1.3 -1.9 -0.7 Q-1.3 -0.6 -1.6 -0.1 Q-1 -0.3 -1.1 0.3 Q-0.6 -0.1 -0.2 0.1 Z"
        fill="url(#wingL)"
      />
      <G scaleX={-1}>
        <Path
          d="M-0.2 -0.3 Q-1.2 -1.3 -1.9 -0.7 Q-1.3 -0.6 -1.6 -0.1 Q-1 -0.3 -1.1 0.3 Q-0.6 -0.1 -0.2 0.1 Z"
          fill="url(#wingL)"
        />
      </G>
    </G>
    <Circle cx={0} cy={-0.72} r={0.42} fill="url(#halo)" />
    {/* Robed figure. */}
    <Path
      d="M-0.12 -0.45 Q-0.38 0.4 -0.45 1.0 Q0 1.15 0.45 1.0 Q0.38 0.4 0.12 -0.45 Z"
      fill="#fff6e8"
    />
    <Path
      d="M-0.12 -0.45 Q-0.2 0.3 -0.25 1.05 M0.12 -0.45 Q0.2 0.3 0.25 1.05"
      stroke="#e0b860"
      strokeWidth={0.03}
      fill="none"
    />
    <Circle cx={0} cy={-0.62} r={0.17} fill="#fff6e8" />
    <Path
      d="M-0.07 -0.64 H-0.02 M0.02 -0.64 H0.07"
      stroke="#8a5a1a"
      strokeWidth={0.025}
    />
    {/* Lantern staff. */}
    <Path d="M0.38 -0.9 L0.38 0.9" stroke="#c09040" strokeWidth={0.05} />
    <Rect
      x={0.28}
      y={-1.12}
      width={0.2}
      height={0.24}
      rx={0.04}
      fill="#fffbe8"
      stroke="#c09040"
      strokeWidth={0.03}
    />
  </Pic>
));

export function BossSprite({ w, T }: { w: World; T: number }) {
  const b = w.boss;
  if (!b) {
    return null;
  }
  const dead = b.state === 'dead';
  const flash = b.hitT > 0 && Math.floor(b.hitT * 30) % 2 === 0;
  const tele = b.state === 'dive' && b.timer > 0;
  const shiver = tele ? (Math.random() - 0.5) * 0.12 : 0;
  const wings = 0.75 + Math.sin(b.t * (b.state === 'float' ? 4 : 9)) * 0.25;
  return (
    <>
      {b.state === 'sweep' && b.timer <= 0 && (
        <>
          <Place
            x={b.sweepX}
            y={(b.y + b.floorY) / 2}
            w={1.4}
            h={b.floorY - b.y}
            T={T}
          >
            <Svg
              width={1.4 * T}
              height={(b.floorY - b.y) * T}
              viewBox={`0 0 1.4 ${b.floorY - b.y}`}
            >
              <Defs>
                <LinearGradient id="sw" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={LUMEN} stopOpacity="0" />
                  <Stop offset="0.5" stopColor="#fffbe8" stopOpacity="0.95" />
                  <Stop offset="1" stopColor={LUMEN} stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Rect
                x={0}
                y={0}
                width={1.4}
                height={b.floorY - b.y}
                fill="url(#sw)"
              />
            </Svg>
          </Place>
          <GlowAt
            x={b.sweepX}
            y={b.floorY}
            r={1.2}
            T={T}
            color={LUMEN}
            strength={0.8}
            style={{ transform: [{ scaleY: 0.4 }] }}
          />
        </>
      )}
      {b.state === 'sweep' && b.timer > 0 && (
        <View
          style={{
            position: 'absolute',
            left: (b.sweepX - 0.04) * T,
            top: b.y * T,
            width: Math.max(2, 0.08 * T),
            height: (b.floorY - b.y) * T,
            backgroundColor: 'rgba(255,211,107,0.5)',
          }}
        />
      )}
      <GlowAt
        x={b.x}
        y={b.y - 0.3}
        r={2.6}
        T={T}
        color={LUMEN}
        strength={dead ? 0.15 : tele ? 0.9 : 0.55}
      />
      <Place
        x={b.x + shiver}
        y={b.y}
        w={4}
        h={3}
        T={T}
        style={{
          opacity: dead ? 0.6 : flash ? 0.45 : 1,
          transform: [
            {
              rotate: dead
                ? '80deg'
                : b.state === 'recover'
                ? '-12deg'
                : '0deg',
            },
          ],
        }}
      >
        <SolenneArt T={T} wings={dead ? 0.3 : wings} />
      </Place>
    </>
  );
}

export function BossBar({ w, width }: { w: World; width: number }) {
  const b = w.boss;
  if (!b || b.state === 'intro' || b.state === 'dead') {
    return null;
  }
  const bw = Math.min(520, width * 0.42);
  return (
    <View
      style={{
        position: 'absolute',
        top: 18,
        left: (width - bw) / 2,
        width: bw,
        alignItems: 'center',
      }}
      pointerEvents="none"
    >
      <View
        style={{
          width: bw,
          height: 10,
          borderRadius: 5,
          backgroundColor: 'rgba(0,0,0,0.5)',
          borderWidth: 1,
          borderColor: '#d8a84a',
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: (bw - 2) * (b.hp / b.max),
            height: '100%',
            backgroundColor: '#ffd36b',
          }}
        />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------- props

const CrusherArt = memo(({ T, w }: { T: number; w: number }) => (
  <Pic w={w} h={1.3} T={T}>
    <Path
      d={`M${-w / 2 + 0.04} -0.65 H${w / 2 - 0.04} V0.35 H${-w / 2 + 0.04} Z`}
      fill="#1a1210"
      stroke="#7a5a3a"
      strokeWidth={0.04}
    />
    <Path
      d={`M${-w / 2 + 0.2} -0.4 H${w / 2 - 0.2} M${-w / 2 + 0.2} 0 H${
        w / 2 - 0.2
      }`}
      stroke="#3a2a1a"
      strokeWidth={0.05}
    />
    {Array.from({ length: Math.round(w * 3) }, (_, i) => {
      const x = -w / 2 + 0.08 + (i * (w - 0.16)) / Math.round(w * 3);
      const sw = (w - 0.16) / Math.round(w * 3);
      return (
        <Path
          key={i}
          d={`M${f(x)} 0.35 L${f(x + sw / 2)} 0.62 L${f(x + sw)} 0.35 Z`}
          fill="#8a8a96"
        />
      );
    })}
  </Pic>
));

const FanArt = memo(({ T }: { T: number }) => (
  <Pic w={2} h={0.8} T={T}>
    <Path
      d="M-0.95 0.4 L-0.85 -0.05 H0.85 L0.95 0.4 Z"
      fill="#120a08"
      stroke="#8a5a2a"
      strokeWidth={0.03}
    />
    <Rect
      x={-0.8}
      y={-0.18}
      width={1.6}
      height={0.14}
      rx={0.05}
      fill="#2a1a10"
    />
  </Pic>
));

const FanBlades = memo(({ T }: { T: number }) => (
  <Pic w={1.4} h={0.3} T={T}>
    <Path d="M-0.65 -0.05 H0.65 V0.05 H-0.65 Z" fill="#c09060" />
    <Circle cx={0} cy={0} r={0.08} fill="#ffcf6b" />
  </Pic>
));

const DropperArt = memo(({ T, ice }: { T: number; ice: boolean }) => (
  <Pic w={0.6} h={1} T={T}>
    <Path
      d="M-0.25 -0.48 Q0 -0.55 0.25 -0.48 L0.04 0.42 L-0.04 0.42 Z"
      fill={ice ? '#bfe8ff' : '#3a2a4a'}
      stroke={ice ? '#ffffff' : '#7a6a9a'}
      strokeWidth={0.025}
      opacity={ice ? 0.85 : 1}
    />
  </Pic>
));

const RiftArt = memo(({ T }: { T: number }) => (
  <Pic w={1.2} h={1.6} T={T}>
    <Defs>
      <RadialGradient id="rift" cx="0.5" cy="0.5" r="0.5">
        <Stop offset="0" stopColor="#000000" />
        <Stop offset="0.55" stopColor="#3a1a7a" />
        <Stop offset="0.85" stopColor="#b48cff" />
        <Stop offset="1" stopColor="#b48cff" stopOpacity="0" />
      </RadialGradient>
    </Defs>
    <Ellipse cx={0} cy={0} rx={0.5} ry={0.75} fill="url(#rift)" />
  </Pic>
));

const RiftSwirl = memo(({ T }: { T: number }) => (
  <Pic w={1} h={1} T={T}>
    <Path
      d="M0 -0.4 Q0.4 -0.3 0.35 0.05 M0 0.4 Q-0.4 0.3 -0.35 -0.05"
      stroke="#e0d0ff"
      strokeWidth={0.05}
      fill="none"
      strokeLinecap="round"
    />
  </Pic>
));

const RingArt = memo(({ T, live }: { T: number; live: boolean }) => (
  <Pic w={0.8} h={0.8} T={T}>
    <Circle
      cx={0}
      cy={0}
      r={0.24}
      fill="none"
      stroke={live ? '#7fffe8' : '#8a7a9a'}
      strokeWidth={0.08}
    />
    <Circle
      cx={0}
      cy={0}
      r={0.24}
      fill="none"
      stroke="#05020b"
      strokeWidth={0.025}
    />
    <Path d="M0 -0.24 V-0.4" stroke="#8a7a9a" strokeWidth={0.06} />
  </Pic>
));

const DoorTile = memo(({ T, lock }: { T: number; lock: boolean }) => (
  <Pic w={1} h={1} T={T}>
    <Rect
      x={-0.5}
      y={-0.5}
      width={1}
      height={1}
      fill="#141a2e"
      stroke="#c9d4ff"
      strokeWidth={0.03}
    />
    <Path
      d="M-0.25 -0.5 V0.5 M0 -0.5 V0.5 M0.25 -0.5 V0.5"
      stroke="#5a6a9a"
      strokeWidth={0.06}
    />
    {lock && (
      <>
        <Circle cx={0} cy={0} r={0.16} fill="#c9d4ff" />
        <Path
          d="M0 -0.06 V0.1"
          stroke="#141a2e"
          strokeWidth={0.06}
          strokeLinecap="round"
        />
      </>
    )}
  </Pic>
));

const CrackedTile = memo(({ T }: { T: number }) => (
  <Pic w={1} h={1} T={T}>
    <Rect
      x={-0.48}
      y={-0.48}
      width={0.96}
      height={0.96}
      rx={0.06}
      fill="#100a18"
      stroke="#6a5a8a"
      strokeWidth={0.03}
    />
    <Path
      d="M-0.3 -0.48 L-0.1 -0.1 L-0.3 0.2 M-0.1 -0.1 L0.25 0.05 L0.35 0.48 M0.25 0.05 L0.48 -0.15"
      stroke="#9a8ab8"
      strokeWidth={0.035}
      fill="none"
    />
  </Pic>
));

const HeartArt = memo(({ T }: { T: number }) => (
  <Pic w={0.6} h={0.6} T={T}>
    <Path
      d="M0 0.22 Q-0.3 0 -0.24 -0.12 Q-0.16 -0.28 0 -0.12 Q0.16 -0.28 0.24 -0.12 Q0.3 0 0 0.22 Z"
      fill="#ff5a8a"
      stroke="#ffd0e0"
      strokeWidth={0.025}
    />
  </Pic>
));

const KeyArt = memo(({ T }: { T: number }) => (
  <Pic w={0.7} h={0.5} T={T}>
    <Circle
      cx={-0.15}
      cy={0}
      r={0.11}
      fill="none"
      stroke="#e0e8ff"
      strokeWidth={0.05}
    />
    <Path
      d="M-0.04 0 H0.28 M0.2 0 V0.1 M0.27 0 V0.08"
      stroke="#e0e8ff"
      strokeWidth={0.05}
    />
  </Pic>
));

const CloakArt = memo(({ T }: { T: number }) => (
  <Pic w={0.7} h={0.7} T={T}>
    <Path
      d="M0 -0.28 Q-0.3 -0.1 -0.26 0.28 Q0 0.2 0.26 0.28 Q0.3 -0.1 0 -0.28 Z"
      fill="#2a1a5a"
      stroke="#b48cff"
      strokeWidth={0.03}
    />
    <Circle cx={0} cy={-0.12} r={0.05} fill="#b48cff" />
  </Pic>
));

const ArrowArt = memo(({ T }: { T: number }) => (
  <Pic w={0.8} h={0.2} T={T}>
    <Path d="M-0.35 0 H0.25" stroke="#fff3c4" strokeWidth={0.04} />
    <Path d="M0.25 -0.06 L0.38 0 L0.25 0.06 Z" fill="#fff3c4" />
    <Path
      d="M-0.35 0 L-0.42 -0.06 M-0.35 0 L-0.42 0.06"
      stroke={LUMEN}
      strokeWidth={0.03}
    />
  </Pic>
));

export function ArrowSprite({
  x,
  y,
  vx,
  vy,
  T,
}: {
  x: number;
  y: number;
  vx: number;
  vy: number;
  T: number;
}) {
  const a = (Math.atan2(vy, vx) * 180) / Math.PI;
  return (
    <>
      <GlowAt x={x} y={y} r={0.4} T={T} color={LUMEN} strength={0.5} />
      <Place
        x={x}
        y={y}
        w={0.8}
        h={0.2}
        T={T}
        style={{ transform: [{ rotate: `${a}deg` }] }}
      >
        <ArrowArt T={T} />
      </Place>
    </>
  );
}

/** Everything new that isn't an enemy: hazards, tools, doors, pickups. */
export function actProps(
  w: World,
  T: number,
  vis: (x0: number, x1: number) => boolean,
) {
  const n: React.ReactNode[] = [];
  const time = w.time;
  const p = w.player;

  for (const c of w.crushers) {
    if (!vis(c.x - 1, c.x + c.w + 1)) {
      continue;
    }
    const jitter = crusherWarning(c) ? (Math.random() - 0.5) * 0.08 : 0;
    const chain = c.y - c.y0 + 0.3;
    n.push(
      <React.Fragment key={`cr${c.id}`}>
        {[0.3, c.w - 0.3].map(cx => (
          <View
            key={cx}
            style={{
              position: 'absolute',
              left: (c.x + cx - 0.04) * T,
              top: (c.y0 - 0.3) * T,
              width: Math.max(2, 0.08 * T),
              height: chain * T,
              backgroundColor: '#3a2a1a',
            }}
          />
        ))}
        <Place
          x={c.x + c.w / 2 + jitter}
          y={c.y + 0.65 - 0.15}
          w={c.w}
          h={1.3}
          T={T}
        >
          <CrusherArt T={T} w={c.w} />
        </Place>
      </React.Fragment>,
    );
  }

  for (const fan of w.fans) {
    if (!vis(fan.x - 1, fan.x + 3)) {
      continue;
    }
    const streaks = [0, 1, 2, 3, 4].map(k => {
      const y = fan.y - (((time * 7 + k * (fan.h / 5)) % fan.h) + 0.2);
      const x = fan.x + 0.3 + ((k * 0.37) % 1.4);
      const o = Math.max(0, 0.55 * Math.sin(((fan.y - y) / fan.h) * Math.PI));
      return (
        <View
          key={k}
          style={{
            position: 'absolute',
            left: x * T,
            top: y * T,
            width: Math.max(2, 0.05 * T),
            height: 0.6 * T,
            borderRadius: T * 0.03,
            backgroundColor: '#ffe0b0',
            opacity: o,
          }}
        />
      );
    });
    n.push(
      <React.Fragment key={`fan${fan.id}`}>
        {streaks}
        <Place x={fan.x + 1} y={fan.y} w={2} h={0.8} T={T}>
          <FanArt T={T} />
        </Place>
        <Place
          x={fan.x + 1}
          y={fan.y - 0.1}
          w={1.4}
          h={0.3}
          T={T}
          style={{ transform: [{ scaleX: Math.cos(time * 25) }] }}
        >
          <FanBlades T={T} />
        </Place>
      </React.Fragment>,
    );
  }

  for (const d of w.droppers) {
    if (d.state === 'gone' || !vis(d.x - 1, d.x + 2)) {
      continue;
    }
    const j = d.state === 'shake' ? (Math.random() - 0.5) * 0.1 : 0;
    n.push(
      <Place
        key={`dr${d.id}`}
        x={d.x + 0.5 + j}
        y={d.y + 0.5}
        w={0.6}
        h={1}
        T={T}
      >
        <DropperArt
          T={T}
          ice={w.level.theme === 'marsh' || w.level.theme === 'dawn'}
        />
      </Place>,
    );
  }

  for (const r of w.rifts) {
    if (!vis(r.x - 1, r.x + 2)) {
      continue;
    }
    n.push(
      <React.Fragment key={`rf${r.id}`}>
        <GlowAt
          x={r.x + 0.5}
          y={r.y + 0.5}
          r={1.1}
          T={T}
          color="#b48cff"
          strength={0.45}
        />
        <Place
          x={r.x + 0.5}
          y={r.y + 0.5}
          w={1.2}
          h={1.6}
          T={T}
          style={{
            transform: [{ scale: 1 + Math.sin(time * 3 + r.id) * 0.05 }],
          }}
        >
          <RiftArt T={T} />
        </Place>
        <Place
          x={r.x + 0.5}
          y={r.y + 0.5}
          w={1}
          h={1}
          T={T}
          style={{
            transform: [
              { rotate: `${(time * 140 + r.id * 40) % 360}deg` },
              { scaleY: 1.4 },
            ],
          }}
        >
          <RiftSwirl T={T} />
        </Place>
      </React.Fragment>,
    );
  }

  const pcx = p.x + p.w / 2;
  const pcy = p.y + p.h / 2;
  for (const r of w.rings) {
    if (!vis(r.x - 1, r.x + 1)) {
      continue;
    }
    const live =
      w.abilities.hook && Math.hypot(r.x - pcx, r.y - pcy) < TOOLS.hookRange;
    n.push(
      <React.Fragment key={`rg${r.id}`}>
        {live && (
          <GlowAt x={r.x} y={r.y} r={0.6} T={T} color={UMBRAL} strength={0.5} />
        )}
        <Place x={r.x} y={r.y} w={0.8} h={0.8} T={T}>
          <RingArt T={T} live={live} />
        </Place>
      </React.Fragment>,
    );
  }

  // Doors and cracked blocks are tiles that can vanish, so they draw here.
  const tx0 = Math.max(0, Math.floor(w.camera.x - 2));
  const tx1 = Math.min(w.level.width - 1, Math.ceil(w.camera.x + w.view.w + 2));
  for (let ty = 0; ty < w.level.height; ty++) {
    const row = w.grid[ty];
    for (let tx = tx0; tx <= tx1; tx++) {
      const c = row[tx];
      if (c === 'D') {
        n.push(
          <Place
            key={`d${tx}-${ty}`}
            x={tx + 0.5}
            y={ty + 0.5}
            w={1}
            h={1}
            T={T}
          >
            <DoorTile
              T={T}
              lock={w.grid[ty + 1]?.[tx] !== 'D' && row[tx - 1] !== 'D'}
            />
          </Place>,
        );
      } else if (c === 'B') {
        n.push(
          <Place
            key={`b${tx}-${ty}`}
            x={tx + 0.5}
            y={ty + 0.5}
            w={1}
            h={1}
            T={T}
          >
            <CrackedTile T={T} />
          </Place>,
        );
      }
    }
  }

  for (const pk of w.pickups) {
    if (pk.taken || !vis(pk.x - 1, pk.x + 1)) {
      continue;
    }
    const y = pk.y + Math.sin(time * 3 + pk.id) * 0.08;
    if (pk.kind === 'heart') {
      n.push(
        <React.Fragment key={`pk${pk.id}`}>
          <GlowAt x={pk.x} y={y} r={0.5} T={T} color="#ff5a8a" strength={0.5} />
          <Place
            x={pk.x}
            y={y}
            w={0.6}
            h={0.6}
            T={T}
            style={{ transform: [{ scale: 1 + Math.sin(time * 6) * 0.08 }] }}
          >
            <HeartArt T={T} />
          </Place>
        </React.Fragment>,
      );
    } else if (pk.kind === 'key') {
      n.push(
        <React.Fragment key={`pk${pk.id}`}>
          <GlowAt x={pk.x} y={y} r={0.6} T={T} color="#c9d4ff" strength={0.6} />
          <Place
            x={pk.x}
            y={y}
            w={0.7}
            h={0.5}
            T={T}
            style={{ transform: [{ rotate: `${Math.sin(time * 2) * 15}deg` }] }}
          >
            <KeyArt T={T} />
          </Place>
        </React.Fragment>,
      );
    } else if (pk.kind === 'cloak') {
      n.push(
        <React.Fragment key={`pk${pk.id}`}>
          <GlowAt x={pk.x} y={y} r={0.6} T={T} color="#8a5aff" strength={0.6} />
          <Place x={pk.x} y={y} w={0.7} h={0.7} T={T}>
            <CloakArt T={T} />
          </Place>
        </React.Fragment>,
      );
    }
  }

  // Shadow-hook rope from Shadowman's hand to the ring.
  if (p.hook && !p.dead) {
    const r = w.rings.find(o => o.id === p.hook!.ring);
    if (r) {
      const hx = pcx + p.facing * 0.1;
      const hy = p.y + 0.25;
      const len = Math.hypot(r.x - hx, r.y - hy);
      const ang = (Math.atan2(r.y - hy, r.x - hx) * 180) / Math.PI;
      n.push(
        <View
          key="rope"
          style={{
            position: 'absolute',
            left: ((hx + r.x) / 2 - len / 2) * T,
            top: ((hy + r.y) / 2) * T - 1.5,
            width: len * T,
            height: 3,
            backgroundColor: UMBRAL,
            opacity: 0.85,
            transform: [{ rotate: `${ang}deg` }],
          }}
        />,
      );
    }
  }

  return n;
}

/** Ambient motes tinted by the act: fireflies, embers, or dawn dust. */
export function motes(
  w: World,
  T: number,
  colors: [string, string],
  rise: number,
) {
  const { camera: cam, view, time } = w;
  const n: React.ReactNode[] = [];
  for (let i = 0; i < 16; i++) {
    const span = view.w + 4;
    const x =
      cam.x -
      2 +
      ((((((i * 7.31) % 1) * span + time * (0.15 + ((i * 3.7) % 1) * 0.35)) %
        span) +
        span) %
        span);
    const spanY = view.h + 2;
    const y0 =
      cam.y + ((i * 5.17) % 1) * spanY - time * rise * (0.5 + ((i * 1.3) % 1));
    const y =
      cam.y -
      1 +
      ((((y0 - cam.y) % spanY) + spanY) % spanY) +
      Math.sin(time * 0.8 + i * 1.7) * 0.6;
    const o = 0.35 + Math.sin(time * 2.2 + i * 2.3) * 0.3;
    n.push(
      <Dot
        key={`mote${i}`}
        x={x}
        y={y}
        r={0.04 + ((i * 2.9) % 1) * 0.05}
        T={T}
        color={i % 3 === 0 ? colors[1] : colors[0]}
        opacity={Math.max(0, o)}
      />,
    );
  }
  return n;
}
