// Shared world helpers used by the engine and every subsystem.
import { makeRagdoll } from './body';
import { COLORS, FIXED_DT, PLAYER } from './constants';
import { Enemy, Player, Projectile, World } from './types';

export const MAX_PARTICLES = 160;

/** Queues a sound cue for the screen to play. The engine stays audio-free. */
export function cue(w: World, name: string) {
  if (w.events.length < 12 && !w.events.includes(name)) {
    w.events.push(name);
  }
}

export function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v;
}

export function approach(v: number, target: number, delta: number) {
  if (v < target) {
    return Math.min(v + delta, target);
  }
  return Math.max(v - delta, target);
}

export function overlap(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function circleRect(
  cx: number,
  cy: number,
  r: number,
  x: number,
  y: number,
  rw: number,
  rh: number,
) {
  const nx = clamp(cx, x, x + rw);
  const ny = clamp(cy, y, y + rh);
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy < r * r;
}

export function tileAt(w: World, tx: number, ty: number): string {
  if (tx < 0 || tx >= w.level.width) {
    return '#';
  }
  if (ty < 0) {
    // The world has a roof, so full-height walls are real barriers.
    return '#';
  }
  if (ty >= w.level.height) {
    return ' ';
  }
  return w.grid[ty][tx];
}

export function isCrumbleBroken(w: World, tx: number, ty: number) {
  const c = w.crumbles.get(ty * w.level.width + tx);
  return !!c && c.broken > 0;
}

/** Tiles you collide with. Ice and belts are rock with a special surface. */
export function isSolid(w: World, tx: number, ty: number) {
  const c = tileAt(w, tx, ty);
  switch (c) {
    case '#':
    case 'I':
    case '>':
    case '<':
    case 'D':
    case 'B':
      return true;
    case 'C':
      return !isCrumbleBroken(w, tx, ty);
    default:
      return false;
  }
}

/** Tiles you can cling to and climb. Ice is too slick to hold. */
export function isWall(c: string) {
  return c === '#' || c === '>' || c === '<' || c === 'D' || c === 'B';
}

export function burst(
  w: World,
  x: number,
  y: number,
  count: number,
  color: string,
  speed: number,
  life: number,
  size = 0.12,
  gravity = 8,
) {
  for (let i = 0; i < count; i++) {
    if (w.particles.length >= MAX_PARTICLES) {
      w.particles.shift();
    }
    const a = Math.random() * Math.PI * 2;
    const s = speed * (0.35 + Math.random() * 0.65);
    const l = life * (0.6 + Math.random() * 0.4);
    w.particles.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: l,
      max: l,
      size: size * (0.6 + Math.random() * 0.8),
      color,
      gravity,
    });
  }
}

/** Is there a climbable wall on side `dir` within `reach` tiles of the player? */
export function wallNear(w: World, p: Player, dir: -1 | 1, reach: number) {
  const tx = Math.floor(dir > 0 ? p.x + p.w + reach : p.x - reach);
  if (tx < 0 || tx >= w.level.width) {
    return false;
  }
  const t0 = Math.floor(p.y + 0.15);
  const t1 = Math.floor(p.y + p.h - 0.15);
  for (let ty = t0; ty <= t1; ty++) {
    if (isWall(tileAt(w, tx, ty))) {
      return true;
    }
  }
  return false;
}

/** Clear line of sight between two points (samples the tile grid). */
export function lineOfSight(
  w: World,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
) {
  const d = Math.hypot(x1 - x0, y1 - y0);
  const n = Math.ceil(d / 0.3);
  for (let i = 1; i < n; i++) {
    const k = i / n;
    if (
      isSolid(w, Math.floor(x0 + (x1 - x0) * k), Math.floor(y0 + (y1 - y0) * k))
    ) {
      return false;
    }
  }
  return true;
}

export function damage(w: World, fromX: number) {
  const p = w.player;
  if (p.invuln > 0 || p.dead || w.status !== 'playing') {
    return;
  }
  p.hp--;
  cue(w, 'hurt');
  p.invuln = PLAYER.invuln;
  p.dashTime = 0;
  const away = p.x + p.w / 2 < fromX ? -1 : 1;
  if (p.hook) {
    // Keep hold of the rope: a hit mid-swing shouldn't drop you into a pit.
    p.vx += away * 3;
  } else {
    p.vx = away * 7;
    p.vy = -8;
    p.wallLock = 0.2;
  }
  w.shake = Math.max(w.shake, 0.25);
  burst(w, p.x + p.w / 2, p.y + p.h / 2, 10, COLORS.danger, 5, 0.5);
  if (p.hp <= 0) {
    kill(w);
  }
}

export function kill(w: World) {
  const p = w.player;
  if (p.dead) {
    return;
  }
  p.dead = true;
  p.deadTimer = PLAYER.respawnDelay;
  p.dashTime = 0;
  p.hook = null;
  w.deaths++;
  cue(w, 'death');
  w.shake = Math.max(w.shake, 0.45);
  // The body goes limp and tumbles; shadow wisps leak out of it.
  p.ragdoll = makeRagdoll(p, (Math.random() - 0.5) * 3, -7, FIXED_DT);
  burst(w, p.x + p.w / 2, p.y + p.h / 2, 18, COLORS.umbral, 6, 0.9, 0.14, -1);
}

export function killEnemy(w: World, e: Enemy) {
  e.alive = false;
  w.kills++;
  cue(w, 'enemyDie');
  const cx = e.x + e.w / 2;
  const cy = e.y + e.h / 2;
  burst(w, cx, cy, 18, COLORS.lumen, 7, 0.7, 0.14, 6);
  burst(w, cx, cy, 8, '#ffffff', 4, 0.4, 0.1, 0);
  w.shake = Math.max(w.shake, 0.15);
}

/** Deals one hit; tougher enemies flash and survive until their hp runs out. */
export function hurtEnemy(w: World, e: Enemy, amount = 1) {
  if (e.hitT > 0) {
    return;
  }
  e.hp -= amount;
  if (e.hp <= 0) {
    killEnemy(w, e);
  } else {
    e.hitT = 0.25;
    cue(w, 'bossHit');
    burst(w, e.x + e.w / 2, e.y + e.h / 2, 8, '#ffffff', 4, 0.3, 0.08, 0);
  }
}

export function spawnProjectile(
  w: World,
  owner: Projectile['owner'],
  x: number,
  y: number,
  vx: number,
  vy = 0,
  g = 0,
) {
  w.projectiles.push({
    id: w.nextId++,
    owner,
    x,
    y,
    vx,
    vy,
    g,
    r: owner === 'player' ? 0.2 : 0.18,
    life: 3,
  });
  if (owner === 'enemy') {
    cue(w, g > 0 ? 'arrow' : 'enemyShot');
  }
}

/** Removes a tile (door or breakable) and everything of the same kind touching it. */
export function clearGroup(w: World, tx: number, ty: number, color: string) {
  const ch = tileAt(w, tx, ty);
  w.cleared++;
  cue(w, ch === 'D' ? 'door' : 'break');
  const stack: [number, number][] = [[tx, ty]];
  while (stack.length) {
    const [x, y] = stack.pop()!;
    if (tileAt(w, x, y) !== ch || x < 0 || x >= w.level.width) {
      continue;
    }
    w.grid[y][x] = ' ';
    burst(w, x + 0.5, y + 0.5, 6, color, 3, 0.6, 0.14, 10);
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
}
