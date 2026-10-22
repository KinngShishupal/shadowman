import React, { useMemo } from 'react';
import { GestureResponderEvent, StyleSheet, Text, View } from 'react-native';
import { COLORS, PHYS, PLAYER } from '../game/constants';
import { InputState, Player } from '../game/types';
import { Tri } from './shapes';

type ButtonId = 'left' | 'right' | 'jump' | 'dash' | 'throw';

interface Btn {
  id: ButtonId;
  x: number;
  y: number;
  r: number;
}

function layout(width: number, height: number): Btn[] {
  const r = Math.min(height * 0.1, 50);
  const pad = Math.max(18, height * 0.05);
  const by = height - pad - r;
  const jr = r * 1.22;
  return [
    { id: 'left', x: pad + r, y: by, r },
    { id: 'right', x: pad + r * 3.4, y: by, r },
    { id: 'jump', x: width - pad - jr, y: height - pad - jr, r: jr },
    {
      id: 'dash',
      x: width - pad - jr * 2 - r * 1.2,
      y: height - pad - r * 0.85,
      r,
    },
    {
      id: 'throw',
      x: width - pad - jr * 0.9,
      y: height - pad - jr * 2 - r * 1.05,
      r: r * 0.9,
    },
  ];
}

export function useControls(width: number, height: number, input: InputState) {
  const buttons = useMemo(() => layout(width, height), [width, height]);

  const handle = (e: GestureResponderEvent, ended: boolean) => {
    const ne = e.nativeEvent;
    const gone = new Set<string>();
    if (ended) {
      for (const t of ne.changedTouches) {
        gone.add(String(t.identifier));
      }
    }
    const next = {
      left: false,
      right: false,
      jump: false,
      dash: false,
      throw: false,
    };
    const mid = (buttons[0].x + buttons[1].x) / 2;
    for (const t of ne.touches) {
      if (gone.has(String(t.identifier))) {
        continue;
      }
      const tx = t.pageX;
      const ty = t.pageY;
      if (tx < width * 0.42) {
        if (ty > height * 0.35) {
          if (tx < mid) {
            next.left = true;
          } else {
            next.right = true;
          }
        }
        continue;
      }
      let best: Btn | null = null;
      let bestD = Infinity;
      for (const b of buttons.slice(2)) {
        const d = Math.hypot(tx - b.x, ty - b.y) / b.r;
        if (d < bestD) {
          bestD = d;
          best = b;
        }
      }
      if (best && bestD < 1.7) {
        next[best.id] = true;
      }
    }
    if (next.jump && !input.jump) {
      input.jumpPressed++;
    }
    if (next.dash && !input.dash) {
      input.dashPressed++;
    }
    if (next.throw && !input.throw) {
      input.throwPressed++;
    }
    Object.assign(input, next);
  };

  const touchProps = {
    onStartShouldSetResponder: () => true,
    onTouchStart: (e: GestureResponderEvent) => handle(e, false),
    onTouchMove: (e: GestureResponderEvent) => handle(e, false),
    onTouchEnd: (e: GestureResponderEvent) => handle(e, true),
    onTouchCancel: (e: GestureResponderEvent) => handle(e, true),
  };

  return { buttons, touchProps };
}

function Arrow({ r, dir }: { r: number; dir: -1 | 1 }) {
  const s = r * 0.7;
  return (
    <View
      style={{
        transform: [{ rotate: dir > 0 ? '90deg' : '-90deg' }],
        width: s,
        height: s,
      }}
    >
      <Tri x={0} y={s * 0.1} w={s} h={s * 0.8} color={COLORS.text} />
    </View>
  );
}

export function ControlsView({
  buttons,
  input,
  player,
}: {
  buttons: Btn[];
  input: InputState;
  player: Player;
}) {
  return (
    <>
      {buttons.map(b => {
        const pressed = input[b.id];
        let label: React.ReactNode = null;
        let fill = 1;
        if (b.id === 'left' || b.id === 'right') {
          label = <Arrow r={b.r} dir={b.id === 'left' ? -1 : 1} />;
        } else if (b.id === 'jump') {
          label = (
            <View style={{ width: b.r * 0.7, height: b.r * 0.6 }}>
              <Tri
                x={0}
                y={0}
                w={b.r * 0.7}
                h={b.r * 0.6}
                color={COLORS.text}
              />
            </View>
          );
        } else if (b.id === 'dash') {
          fill = player.dashCd > 0 ? 1 - player.dashCd / PHYS.dashCooldown : 1;
          label = (
            <Text style={[styles.label, { fontSize: b.r * 0.42 }]}>DASH</Text>
          );
        } else {
          fill = player.ammo / PLAYER.maxAmmo;
          label = (
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  width: b.r * 0.5,
                  height: b.r * 0.16,
                  borderRadius: b.r * 0.08,
                  backgroundColor: COLORS.umbral,
                }}
              />
              <Text style={[styles.label, { fontSize: b.r * 0.42 }]}>
                {player.ammo}
              </Text>
            </View>
          );
        }
        return (
          <View
            key={b.id}
            pointerEvents="none"
            style={[
              styles.btn,
              {
                left: b.x - b.r,
                top: b.y - b.r,
                width: b.r * 2,
                height: b.r * 2,
                borderRadius: b.r,
                backgroundColor: pressed
                  ? 'rgba(62,240,208,0.28)'
                  : 'rgba(20,10,40,0.45)',
                borderColor: pressed ? COLORS.umbral : 'rgba(143,107,255,0.55)',
                opacity: 0.45 + 0.55 * Math.max(0, Math.min(1, fill)),
              },
            ]}
          >
            {label}
          </View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: 'absolute',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: COLORS.text,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
