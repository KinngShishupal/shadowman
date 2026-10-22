// Hazards, enemies, tools and the final boss added in Acts II to IV.
import { COLORS, ENEMY, PHYS, TOOLS } from './constants';
import {
  burst,
  circleRect,
  cue,
  damage,
  hurtEnemy,
  isSolid,
  kill,
  lineOfSight,
  overlap,
  spawnProjectile,
  tileAt,
} from './core';
import { Enemy, World } from './types';

// ---------------------------------------------------------------- hazards

/** Crusher timeline: rest up, shiver, slam, hold, grind back up. */
function crusherOffset(u: number) {
  if (u < 0.45) {
    return 0;
  }
  if (u < 0.52) {
    const k = (u - 0.45) / 0.07;
    return k * k;
  }
  if (u < 0.7) {
    return 1;
  }
  return 1 - (u - 0.7) / 0.3;
}

export function updateCrushers(w: World, dt: number) {
  for (const c of w.crushers) {
    c.t += dt;
    const u = (c.t % c.period) / c.period;
    const prev = c.y;
    c.y = c.y0 + c.drop * crusherOffset(u);
    const landed = c.falling && u >= 0.52;
    c.falling = u >= 0.45 && u < 0.52;
    if (landed && prev < c.y0 + c.drop) {
      w.shake = Math.max(w.shake, 0.08);
      // Only crushers near the player are worth hearing.
      if (Math.abs(c.x - w.player.x) < 12) {
        cue(w, 'crush');
      }
    }
    if (landed) {
      burst(w, c.x + c.w / 2, c.y + 1, 8, '#a08070', 4, 0.4, 0.1, 6);
    }
  }
}

/** True while the crusher is shivering, about to fall. */
export function crusherWarning(c: World['crushers'][number]) {
  const u = (c.t % c.period) / c.period;
  return u > 0.36 && u < 0.45;
}

export function updateDroppers(w: World, dt: number) {
  const p = w.player;
  const pcx = p.x + p.w / 2;
  for (const d of w.droppers) {
    switch (d.state) {
      case 'hang':
        if (
          !p.dead &&
          Math.abs(pcx - (d.x + 0.5)) < 1.1 &&
          p.y > d.y &&
          p.y - d.y < 9 &&
          lineOfSight(w, d.x + 0.5, d.y + 0.9, pcx, p.y)
        ) {
          d.state = 'shake';
          d.timer = 0.35;
        }
        break;
      case 'shake':
        d.timer -= dt;
        if (d.timer <= 0) {
          d.state = 'fall';
          d.vy = 0;
        }
        break;
      case 'fall':
        d.vy += 30 * dt;
        d.y += d.vy * dt;
        if (
          isSolid(w, Math.floor(d.x + 0.5), Math.floor(d.y + 0.9)) ||
          d.y > w.level.height
        ) {
          burst(w, d.x + 0.5, d.y + 0.8, 10, '#9a8ab8', 4, 0.5, 0.12, 12);
          d.state = 'gone';
          d.timer = 3;
        }
        break;
      case 'gone':
        d.timer -= dt;
        if (d.timer <= 0) {
          d.state = 'hang';
          d.y = d.oy;
        }
        break;
    }
  }
}

/** Contact with crushers, droppers, acid and rifts. Returns true if the player died. */
export function hazardContacts(
  w: World,
  px: number,
  py: number,
  pw: number,
  ph: number,
) {
  const p = w.player;
  for (const c of w.crushers) {
    if (overlap(px, py, pw, ph, c.x + 0.05, c.y, c.w - 0.1, 1)) {
      kill(w);
      return true;
    }
  }
  for (const d of w.droppers) {
    if (
      d.state === 'fall' &&
      circleRect(d.x + 0.5, d.y + 0.55, 0.3, px, py, pw, ph)
    ) {
      kill(w);
      return true;
    }
  }
  // Liquid lumen: deadly once you sink into it.
  for (let ty = Math.floor(py); ty <= Math.floor(py + ph); ty++) {
    for (let tx = Math.floor(px); tx <= Math.floor(px + pw); tx++) {
      if (
        tileAt(w, tx, ty) === '~' &&
        overlap(px, py, pw, ph, tx, ty + 0.35, 1, 0.65)
      ) {
        burst(w, p.x + p.w / 2, ty + 0.4, 14, COLORS.lumen, 5, 0.6, 0.12, 4);
        kill(w);
        return true;
      }
    }
  }
  if (p.riftCd <= 0) {
    for (const r of w.rifts) {
      if (circleRect(r.x + 0.5, r.y + 0.5, 0.4, px, py, pw, ph)) {
        const twin = w.rifts.find(o => o.link === r.link && o.id !== r.id);
        if (twin) {
          burst(w, r.x + 0.5, r.y + 0.5, 14, '#b48cff', 4, 0.5, 0.12, 0);
          p.x = twin.x + 0.5 - p.w / 2;
          p.y = twin.y + 1 - p.h;
          p.riftCd = TOOLS.riftCooldown;
          cue(w, 'rift');
          p.hook = null;
          burst(w, twin.x + 0.5, twin.y + 0.5, 14, '#b48cff', 4, 0.5, 0.12, 0);
        }
        break;
      }
    }
  }
  return false;
}

/** Vertical lift from fans the player is inside. */
export function fanLift(w: World, gliding: boolean) {
  const p = w.player;
  for (const f of w.fans) {
    if (overlap(p.x, p.y, p.w, p.h, f.x + 0.1, f.y - f.h, 1.8, f.h)) {
      return TOOLS.fanLift + (gliding ? TOOLS.fanGlideLift : 0);
    }
  }
  return 0;
}

export function nearestRing(w: World) {
  const p = w.player;
  const cx = p.x + p.w / 2;
  const cy = p.y + p.h / 2;
  let best = null;
  let bestD = TOOLS.hookRange;
  for (const r of w.rings) {
    const d = Math.hypot(r.x - cx, r.y - cy);
    if (d < bestD && r.y < cy + 0.5 && lineOfSight(w, cx, cy, r.x, r.y)) {
      best = r;
      bestD = d;
    }
  }
  return best;
}

// ---------------------------------------------------------------- enemies

function cloaked(w: World) {
  return w.cloakT > 0 || w.player.dead;
}

export function updateArcher(w: World, e: Enemy, dt: number) {
  const p = w.player;
  const ex = e.x + e.w / 2;
  const ey = e.y + 0.3;
  const px = p.x + p.w / 2;
  const py = p.y + p.h / 2;
  const dist = Math.hypot(px - ex, py - ey);
  if (!cloaked(w) && dist < ENEMY.archerRange) {
    e.dir = px > ex ? 1 : -1;
  }
  e.timer -= dt;
  if (e.state === 'aim') {
    if (e.timer <= 0) {
      // Ballistic shot: pick a flight time from distance and solve for launch speed.
      const T = Math.max(0.55, Math.min(1.5, dist / 8));
      const g = ENEMY.arrowGravity;
      const vx = (px + p.vx * 0.3 - ex) / T;
      const vy = (py - ey - 0.5 * g * T * T) / T;
      spawnProjectile(w, 'enemy', ex + e.dir * 0.3, ey, vx, vy, g);
      e.state = 'cool';
      e.timer = ENEMY.archerCool;
    }
  } else if (
    e.timer <= 0 &&
    !cloaked(w) &&
    dist < ENEMY.archerRange &&
    lineOfSight(w, ex, ey, px, py - 1.5)
  ) {
    e.state = 'aim';
    e.timer = ENEMY.archerAim;
  }
}

export function updateTurret(w: World, e: Enemy, dt: number) {
  const p = w.player;
  const ex = e.x + e.w / 2;
  const ey = e.y + e.h / 2;
  const px = p.x + p.w / 2;
  const py = p.y + p.h / 2;
  const dist = Math.hypot(px - ex, py - ey);
  const sees =
    !cloaked(w) && dist < ENEMY.turretRange && lineOfSight(w, ex, ey, px, py);
  if (sees) {
    // Turn smoothly toward the player.
    const want = Math.atan2(py - ey, px - ex);
    const cur = Math.atan2(e.aimY, e.aimX);
    let diff = want - cur;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    const a = cur + Math.max(-2.5 * dt, Math.min(2.5 * dt, diff));
    e.aimX = Math.cos(a);
    e.aimY = Math.sin(a);
  }
  e.timer -= dt;
  e.state = sees ? 'aim' : 'float';
  if (sees && e.timer <= 0) {
    spawnProjectile(
      w,
      'enemy',
      ex + e.aimX * 0.5,
      ey + e.aimY * 0.5,
      e.aimX * ENEMY.turretBolt,
      e.aimY * ENEMY.turretBolt,
    );
    e.timer = ENEMY.turretCool;
  }
}

export function updateBrute(w: World, e: Enemy, dt: number) {
  const p = w.player;
  const ex = e.x + e.w / 2;
  const px = p.x + p.w / 2;
  const row = Math.floor(e.y + 0.5);
  const sees =
    !cloaked(w) &&
    Math.abs(p.y + p.h / 2 - (e.y + e.h / 2)) < 1.3 &&
    Math.abs(px - ex) < ENEMY.bruteSight &&
    Math.sign(px - ex) === e.dir &&
    lineOfSight(w, ex, e.y + 0.5, px, p.y + 0.4);
  const speed = e.state === 'charge' ? ENEMY.bruteCharge : ENEMY.bruteSpeed;
  if (e.state === 'cool') {
    e.timer -= dt;
    if (e.timer <= 0) {
      e.state = 'patrol';
    }
    return;
  }
  if (e.state === 'patrol' && sees) {
    e.state = 'charge';
    e.timer = 1.4;
    burst(w, ex, e.y + e.h, 6, '#c9b08a', 2, 0.3, 0.1, -1);
  }
  if (e.state === 'charge') {
    e.timer -= dt;
    if (e.timer <= 0) {
      e.state = 'cool';
      e.timer = 1;
    }
  }
  e.x += e.dir * speed * dt;
  const ahead = e.dir > 0 ? e.x + e.w + 0.05 : e.x - 0.05;
  const tx = Math.floor(ahead);
  const foot = Math.floor(e.y + e.h + 0.01);
  if (
    isSolid(w, tx, row) ||
    !(isSolid(w, tx, foot) || tileAt(w, tx, foot) === '-')
  ) {
    e.x -= e.dir * speed * dt;
    e.dir = -e.dir as 1 | -1;
    if (e.state === 'charge') {
      e.state = 'cool';
      e.timer = 1;
      w.shake = Math.max(w.shake, 0.1);
    }
  }
}

export function updateMoth(w: World, e: Enemy, dt: number) {
  e.x += e.dir * ENEMY.mothSpeed * dt;
  if (e.x > e.homeX + e.range) {
    e.dir = -1;
  } else if (e.x < e.homeX) {
    e.dir = 1;
  }
  e.y = e.homeY + Math.sin(e.t * 2.4) * 0.8;
}

/** Shieldbearers block hits from the side they face. */
export function shieldBlocks(e: Enemy, fromX: number) {
  return e.kind === 'brute' && Math.sign(fromX - (e.x + e.w / 2)) === e.dir;
}

// ---------------------------------------------------------------- boss

export function updateBoss(w: World, dt: number) {
  const b = w.boss;
  if (!b) {
    return;
  }
  const p = w.player;
  b.t += dt;
  b.hitT -= dt;
  b.timer -= dt;
  const px = p.x + p.w / 2;
  const py = p.y + p.h / 2;
  b.phase = b.hp > b.max * 0.66 ? 1 : b.hp > b.max * 0.33 ? 2 : 3;
  const hoverY = b.floorY - 4.2 + Math.sin(b.t * 1.7) * 0.4;
  const speed = 1 + b.phase * 0.25;

  switch (b.state) {
    case 'dead':
      b.vy += 6 * dt;
      b.y = Math.min(b.floorY - 0.8, b.y + b.vy * dt);
      if (Math.random() < 0.3) {
        burst(
          w,
          b.x + (Math.random() - 0.5),
          b.y,
          2,
          COLORS.lumen,
          3,
          0.8,
          0.12,
          -2,
        );
      }
      return;
    case 'intro':
      b.y += (hoverY - b.y) * Math.min(1, dt * 1.5);
      if (b.timer <= 0) {
        b.state = 'float';
        b.timer = 1.4;
      }
      return;
    case 'float': {
      const tx = Math.max(
        b.arenaX0 + 2,
        Math.min(b.arenaX1 - 2, px + Math.sin(b.t * 0.7) * 3),
      );
      b.x += (tx - b.x) * Math.min(1, dt * 1.2 * speed);
      b.y += (hoverY - b.y) * Math.min(1, dt * 3);
      if (b.timer <= 0) {
        const roll = Math.random();
        if (roll < 0.45) {
          b.state = 'volley';
          b.shots = 2 + b.phase * 2;
          b.timer = 0.5;
        } else if (roll < 0.75 || b.phase === 1) {
          b.state = 'sweep';
          b.sweepDir = px < (b.arenaX0 + b.arenaX1) / 2 ? -1 : 1;
          b.sweepX = b.sweepDir > 0 ? b.arenaX0 : b.arenaX1;
          b.sweepDir = b.sweepDir > 0 ? 1 : -1;
          b.timer = 0.8;
        } else {
          b.state = 'dive';
          b.timer = 0.7;
          b.vx = px;
          b.vy = py;
        }
      }
      return;
    }
    case 'volley':
      b.y += (hoverY - b.y) * Math.min(1, dt * 3);
      if (b.timer <= 0 && b.shots > 0) {
        const a = Math.atan2(py - b.y, px - b.x);
        const spread = (b.shots % 3) - 1;
        const s = 6.5 + b.phase;
        spawnProjectile(
          w,
          'enemy',
          b.x,
          b.y,
          Math.cos(a + spread * 0.18) * s,
          Math.sin(a + spread * 0.18) * s,
        );
        b.shots--;
        b.timer = 0.3 - b.phase * 0.04;
      } else if (b.shots <= 0 && b.timer <= 0) {
        b.state = 'float';
        b.timer = 1.6 - b.phase * 0.25;
      }
      return;
    case 'sweep':
      // A pillar of light rakes the arena floor. Dash through it or jump the gap.
      b.y += (b.floorY - 6 - b.y) * Math.min(1, dt * 2);
      if (b.timer <= 0) {
        b.sweepX += b.sweepDir * (4.5 + b.phase) * dt;
        if (
          !p.dead &&
          p.dashTime <= 0 &&
          overlap(p.x, p.y, p.w, p.h, b.sweepX - 0.35, b.y, 0.7, b.floorY - b.y)
        ) {
          damage(w, b.sweepX);
        }
        if (b.sweepX < b.arenaX0 || b.sweepX > b.arenaX1) {
          b.state = 'float';
          b.timer = 1.4;
        }
      }
      return;
    case 'dive': {
      if (b.timer > 0) {
        // Telegraph: rise and shiver before the plunge.
        b.y += (hoverY - 0.8 - b.y) * Math.min(1, dt * 4);
        return;
      }
      const dx = b.vx - b.x;
      const dy = Math.min(b.floorY - 1, b.vy) - b.y;
      const d = Math.hypot(dx, dy);
      const step = (11 + b.phase * 2) * dt;
      if (d <= step) {
        b.state = 'recover';
        b.timer = 1.3;
        w.shake = Math.max(w.shake, 0.2);
        burst(w, b.x, b.y + 0.8, 16, COLORS.lumen, 6, 0.6, 0.14, 6);
      } else {
        b.x += (dx / d) * step;
        b.y += (dy / d) * step;
      }
      return;
    }
    case 'recover':
      // Grounded and dazed: the best moment to strike.
      if (b.timer <= 0) {
        b.state = 'float';
        b.timer = 1.2;
      }
      return;
  }
}

export function hitBoss(w: World, amount: number) {
  const b = w.boss;
  if (!b || b.state === 'dead' || b.state === 'intro' || b.hitT > 0) {
    return false;
  }
  b.hp -= b.state === 'recover' ? amount * 2 : amount;
  b.hitT = 0.3;
  cue(w, 'bossHit');
  burst(w, b.x, b.y, 12, '#ffffff', 5, 0.4, 0.1, 0);
  if (b.hp <= 0) {
    b.hp = 0;
    b.state = 'dead';
    cue(w, 'bossDie');
    b.vy = 0;
    w.shake = 0.8;
    w.projectiles = w.projectiles.filter(pr => pr.owner === 'player');
    burst(w, b.x, b.y, 40, COLORS.lumen, 9, 1.2, 0.16, 2);
    burst(w, b.x, b.y, 30, COLORS.umbral, 7, 1.4, 0.14, -2);
  }
  return true;
}

export function bossContact(
  w: World,
  px: number,
  py: number,
  pw: number,
  ph: number,
) {
  const b = w.boss;
  const p = w.player;
  if (!b || b.state === 'dead' || b.state === 'intro') {
    return;
  }
  if (!overlap(px, py, pw, ph, b.x - 0.55, b.y - 0.8, 1.1, 1.6)) {
    return;
  }
  if (p.dashTime > 0 || (p.vy > 0 && p.y + p.h < b.y - 0.2)) {
    hitBoss(w, 2);
    p.vy = -PHYS.stompBounce;
    p.vx = (p.x + p.w / 2 < b.x ? -1 : 1) * 6;
    p.dashTime = 0;
    p.jumpsLeft = 1;
    p.airDash = true;
  } else if (b.state !== 'recover') {
    damage(w, b.x);
  }
}

export function enemyHit(w: World, e: Enemy, fromX: number, amount = 1) {
  if (shieldBlocks(e, fromX)) {
    cue(w, 'bossHit');
    burst(
      w,
      e.x + e.w / 2 + e.dir * 0.4,
      e.y + 0.5,
      8,
      '#ffe8a8',
      4,
      0.25,
      0.08,
      0,
    );
    return false;
  }
  hurtEnemy(w, e, amount);
  return true;
}
