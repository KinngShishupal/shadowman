// Secondary physics for Shadowman: a Verlet-rope scarf and a death ragdoll.
// Both are simulated in world space (tiles) on the fixed engine timestep.
import { Player, Pt, Ragdoll } from './types';

const SCARF_LINKS = 9;
const SCARF_SEG = 0.085;

type Solid = (tx: number, ty: number) => boolean;

function pt(x: number, y: number, vx = 0, vy = 0, dt = 0): Pt {
  return { x, y, px: x - vx * dt, py: y - vy * dt };
}

/** Where the scarf is tied: the back of the neck. */
export function neckOf(p: Player) {
  return {
    x: p.x + p.w / 2 - p.facing * 0.08,
    y: p.y + p.h - 0.72 + (p.squash < 0 ? -p.squash * 0.4 : 0),
  };
}

export function initScarf(p: Player): Pt[] {
  const a = neckOf(p);
  return Array.from({ length: SCARF_LINKS }, (_, i) =>
    pt(a.x - p.facing * i * SCARF_SEG, a.y + i * 0.02),
  );
}

function satisfy(a: Pt, b: Pt, len: number, pinA: boolean, stiffness = 1) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.hypot(dx, dy) || 1e-6;
  const diff = ((d - len) / d) * stiffness;
  if (pinA) {
    b.x -= dx * diff;
    b.y -= dy * diff;
  } else {
    a.x += dx * diff * 0.5;
    a.y += dy * diff * 0.5;
    b.x -= dx * diff * 0.5;
    b.y -= dy * diff * 0.5;
  }
}

/**
 * Steps the scarf. The first link is pinned to `anchor`; the rest swing under
 * gravity and drag, so it trails behind motion and flutters when moving fast.
 */
export function stepScarf(
  scarf: Pt[],
  anchor: { x: number; y: number },
  speed: number,
  time: number,
  dt: number,
) {
  const s0 = scarf[0];
  s0.x = s0.px = anchor.x;
  s0.y = s0.py = anchor.y;
  const g = 9 * dt * dt;
  const flutter = Math.min(1, speed / 8) * 0.0035 + 0.0004;
  for (let i = 1; i < scarf.length; i++) {
    const p = scarf[i];
    const vx = (p.x - p.px) * 0.93;
    const vy = (p.y - p.py) * 0.93;
    p.px = p.x;
    p.py = p.y;
    p.x += vx + Math.sin(time * 14 + i * 1.1) * flutter * i * 0.3;
    p.y += vy + g + Math.cos(time * 11 + i * 1.7) * flutter * i * 0.4;
  }
  for (let k = 0; k < 4; k++) {
    for (let i = 0; i < scarf.length - 1; i++) {
      satisfy(scarf[i], scarf[i + 1], SCARF_SEG, i === 0);
    }
  }
}

export function makeRagdoll(
  p: Player,
  kickX: number,
  kickY: number,
  dt: number,
): Ragdoll {
  const cx = p.x + p.w / 2;
  const fy = p.y + p.h;
  const f = p.facing;
  const vx = p.vx * 0.6 + kickX;
  const vy = Math.min(p.vy, 0) * 0.5 + kickY;
  // Upper body gets extra spin so the fall reads as a tumble.
  const spin = (Math.random() - 0.5) * 6;
  const pts = [
    pt(cx + 0.03 * f, fy - 0.82, vx + spin, vy - 1, dt),
    pt(cx, fy - 0.68, vx + spin * 0.6, vy - 0.5, dt),
    pt(cx, fy - 0.42, vx, vy, dt),
    pt(cx + 0.22 * f, fy - 0.5, vx + 2 * f, vy - 2, dt),
    pt(cx - 0.18 * f, fy - 0.5, vx - 2 * f, vy - 1, dt),
    pt(cx + 0.1 * f, fy, vx - spin * 0.4, vy + 1, dt),
    pt(cx - 0.1 * f, fy, vx - spin * 0.4, vy + 1, dt),
  ];
  return {
    pts,
    sticks: [
      [0, 1, 0.15],
      [1, 2, 0.27],
      [0, 2, 0.41],
      [1, 3, 0.33],
      [1, 4, 0.33],
      [2, 5, 0.43],
      [2, 6, 0.43],
      [5, 6, 0.12],
    ],
  };
}

/** Pushes a point out of solid rock along the shortest free direction. */
function collide(p: Pt, solid: Solid) {
  const tx = Math.floor(p.x);
  const ty = Math.floor(p.y);
  if (!solid(tx, ty)) {
    return;
  }
  const options: [number, number, number][] = [];
  if (!solid(tx, ty - 1)) {
    options.push([p.y - ty, 0, ty - 0.001 - p.y]);
  }
  if (!solid(tx - 1, ty)) {
    options.push([p.x - tx, tx - 0.001 - p.x, 0]);
  }
  if (!solid(tx + 1, ty)) {
    options.push([tx + 1 - p.x, tx + 1.001 - p.x, 0]);
  }
  if (!solid(tx, ty + 1)) {
    options.push([ty + 1 - p.y, 0, ty + 1.001 - p.y]);
  }
  if (!options.length) {
    options.push([0, 0, ty - 0.001 - p.y]);
  }
  options.sort((a, b) => a[0] - b[0]);
  const [, dx, dy] = options[0];
  p.x += dx;
  p.y += dy;
  // Ground friction: kill most of the sliding velocity on contact.
  if (dy < 0) {
    p.px = p.x - (p.x - p.px) * 0.6;
  }
}

export function stepRagdoll(r: Ragdoll, solid: Solid, dt: number) {
  const g = 30 * dt * dt;
  for (const p of r.pts) {
    const vx = (p.x - p.px) * 0.995;
    const vy = (p.y - p.py) * 0.995;
    p.px = p.x;
    p.py = p.y;
    p.x += vx;
    p.y += vy + g;
  }
  for (let k = 0; k < 6; k++) {
    for (const [a, b, len] of r.sticks) {
      satisfy(r.pts[a], r.pts[b], len, false);
    }
    for (const p of r.pts) {
      collide(p, solid);
    }
  }
}
