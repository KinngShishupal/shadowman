import { initScarf, neckOf, stepRagdoll, stepScarf } from './body';
import { COLORS, ENEMY, FIXED_DT, PHYS, PLAYER, TOOLS } from './constants';
import {
  approach,
  burst,
  circleRect,
  clamp,
  clearGroup,
  cue,
  damage,
  isSolid,
  isWall,
  kill,
  overlap,
  spawnProjectile,
  tileAt,
  wallNear,
} from './core';
import { abilitiesFor } from './story';
import {
  bossContact,
  enemyHit,
  fanLift,
  hazardContacts,
  hitBoss,
  nearestRing,
  shieldBlocks,
  updateArcher,
  updateBoss,
  updateBrute,
  updateCrushers,
  updateDroppers,
  updateMoth,
  updateTurret,
} from './systems';
import { Enemy, InputState, LevelData, Player, World } from './types';

export { isCrumbleBroken, tileAt } from './core';

export function createInput(): InputState {
  return {
    left: false,
    right: false,
    jump: false,
    dash: false,
    throw: false,
    jumpPressed: 0,
    dashPressed: 0,
    throwPressed: 0,
  };
}

function makeEnemy(
  id: number,
  kind: Enemy['kind'],
  x: number,
  y: number,
  w: number,
  h: number,
  hp = 1,
  range = 0,
): Enemy {
  return {
    id,
    kind,
    x,
    y,
    w,
    h,
    dir: -1,
    state: kind === 'wisp' || kind === 'moth' ? 'float' : 'patrol',
    timer: Math.random(),
    homeX: x,
    homeY: y,
    alive: true,
    t: Math.random() * 3,
    hp,
    range,
    hitT: 0,
    aimX: -1,
    aimY: 0,
  };
}

function makePlayer(x: number, y: number): Player {
  const p: Player = {
    x,
    y,
    w: PLAYER.w,
    h: PLAYER.h,
    vx: 0,
    vy: 0,
    facing: 1,
    onGround: false,
    jumpsLeft: 1,
    coyote: 0,
    jumpBuffer: 0,
    jumpHeld: false,
    noJumpCut: false,
    wallDir: 0,
    wallLock: 0,
    climbDir: 0,
    climbT: 0,
    dashTime: 0,
    dashCd: 0,
    dashDir: 1,
    airDash: true,
    throwCd: 0,
    ammo: PLAYER.maxAmmo,
    ammoTimer: 0,
    hp: PLAYER.maxHp,
    invuln: 0,
    dead: false,
    deadTimer: 0,
    riding: -1,
    anim: 'idle',
    animT: 0,
    scarf: [],
    squash: 0,
    squashV: 0,
    tilt: 0,
    prevVx: 0,
    landT: 0,
    skidding: false,
    ragdoll: null,
    gliding: false,
    hook: null,
    hookCd: 0,
    riftCd: 0,
    surface: ' ',
  };
  p.scarf = initScarf(p);
  return p;
}

export function createWorld(
  level: LevelData,
  view: { w: number; h: number },
): World {
  const grid = level.tiles.map(row => row.split(''));
  const w: World = {
    level,
    grid,
    crumbles: new Map(),
    player: makePlayer(1, 1),
    enemies: [],
    saws: [],
    beams: [],
    movers: [],
    projectiles: [],
    pickups: [],
    checkpoints: [],
    springs: [],
    crushers: [],
    fans: [],
    droppers: [],
    rifts: [],
    rings: [],
    boss: null,
    particles: [],
    exit: { x: level.width - 2, y: 10 },
    respawn: { x: 1, y: 1 },
    camera: { x: 0, y: 0 },
    view,
    shake: 0,
    time: 0,
    shards: 0,
    shardsTotal: 0,
    mask: false,
    keys: 0,
    cleared: 0,
    events: [],
    cloakT: 0,
    abilities: abilitiesFor(level.id),
    deaths: 0,
    kills: 0,
    status: 'playing',
    exitTimer: 0,
    nextId: 1,
    accumulator: 0,
  };

  for (const e of level.entities) {
    const id = w.nextId++;
    switch (e.kind) {
      case 'start': {
        const px = e.x + (1 - PLAYER.w) / 2;
        const py = e.y + 1 - PLAYER.h;
        w.player = makePlayer(px, py);
        w.respawn = { x: px, y: py };
        break;
      }
      case 'exit':
        w.exit = { x: e.x, y: e.y };
        break;
      case 'shard':
      case 'mask':
        w.pickups.push({
          id,
          kind: e.kind,
          x: e.x + 0.5,
          y: e.y + 0.5,
          taken: false,
        });
        if (e.kind === 'shard') {
          w.shardsTotal++;
        }
        break;
      case 'checkpoint':
        w.checkpoints.push({ id, x: e.x, y: e.y, active: false });
        break;
      case 'guard':
        w.enemies.push(makeEnemy(id, 'guard', e.x + 0.15, e.y, 0.7, 1));
        break;
      case 'wisp':
        w.enemies.push(makeEnemy(id, 'wisp', e.x + 0.15, e.y + 0.15, 0.7, 0.7));
        break;
      case 'archer':
        w.enemies.push(makeEnemy(id, 'archer', e.x + 0.15, e.y, 0.7, 1));
        break;
      case 'turret':
        w.enemies.push(
          makeEnemy(id, 'turret', e.x + 0.1, e.y + 0.1, 0.8, 0.8, 2),
        );
        break;
      case 'brute':
        w.enemies.push(
          makeEnemy(id, 'brute', e.x + 0.05, e.y - 0.2, 0.9, 1.2, 2),
        );
        break;
      case 'moth':
        w.enemies.push(
          makeEnemy(id, 'moth', e.x + 0.2, e.y + 0.2, 0.6, 0.6, 1, e.range),
        );
        break;
      case 'boss':
        w.boss = {
          x: e.x + 0.5,
          y: e.y - 6,
          vx: 0,
          vy: 0,
          hp: ENEMY.bossHp,
          max: ENEMY.bossHp,
          phase: 1,
          state: 'intro',
          timer: 2.5,
          t: 0,
          hitT: 0,
          shots: 0,
          sweepX: 0,
          sweepDir: 1,
          arenaX0: Math.max(1, e.x - 19),
          arenaX1: Math.min(level.width - 2, e.x + 20),
          floorY: e.y + 1,
        };
        break;
      case 'heart':
        cue(w, 'heart');
      case 'key':
      case 'cloak':
        cue(w, 'cloak');
        w.pickups.push({
          id,
          kind: e.kind,
          x: e.x + 0.5,
          y: e.y + 0.5,
          taken: false,
        });
        break;
      case 'ring':
        w.rings.push({ id, x: e.x + 0.5, y: e.y + 0.5 });
        break;
      case 'dropper':
        w.droppers.push({
          id,
          x: e.x,
          y: e.y,
          oy: e.y,
          vy: 0,
          state: 'hang',
          timer: 0,
        });
        break;
      case 'fan':
        w.fans.push({ id, x: e.x, y: e.y + 0.6, h: e.h });
        break;
      case 'rift':
        w.rifts.push({ id, x: e.x, y: e.y, link: e.link });
        break;
      case 'crusher':
        w.crushers.push({
          id,
          x: e.x,
          y0: e.y,
          w: e.w,
          drop: e.drop,
          period: e.period,
          t: e.phase,
          y: e.y,
          falling: false,
        });
        break;
      case 'spring':
        w.springs.push({ id, x: e.x, y: e.y, t: 0 });
        break;
      case 'saw':
        w.saws.push({
          id,
          x: e.x + 0.5,
          y: e.y + 0.5,
          ox: e.x + 0.5,
          oy: e.y + 0.5,
          r: 0.45,
          axis: e.axis,
          range: e.range,
          speed: e.speed,
          t: 0,
        });
        break;
      case 'beam': {
        let y1 = e.y + 1;
        while (y1 < level.height && grid[y1][e.x] !== '#') {
          y1++;
        }
        w.beams.push({
          id,
          x: e.x,
          y0: e.y + 0.45,
          y1,
          on: e.on,
          off: e.off,
          t: e.phase,
          active: false,
          warning: false,
        });
        break;
      }
      case 'mover':
        w.movers.push({
          id,
          x: e.x,
          y: e.y,
          ox: e.x,
          oy: e.y,
          w: e.w,
          axis: e.axis,
          range: e.range,
          speed: e.speed,
          t: 0,
          dx: 0,
          dy: 0,
          vx: 0,
          vy: 0,
        });
        break;
    }
  }
  w.camera.x = clamp(
    w.player.x - view.w / 2,
    0,
    Math.max(0, level.width - view.w),
  );
  w.camera.y = clamp(
    w.player.y - view.h * 0.55,
    0,
    Math.max(0, level.height - view.h),
  );
  return w;
}

// ---------------------------------------------------------------- player

function respawn(w: World) {
  const fresh = makePlayer(w.respawn.x, w.respawn.y);
  fresh.invuln = 1;
  fresh.facing = w.player.facing;
  w.player = fresh;
  w.crumbles.clear();
  w.projectiles = w.projectiles.filter(pr => pr.owner === 'player');
  burst(
    w,
    fresh.x + fresh.w / 2,
    fresh.y + fresh.h / 2,
    18,
    COLORS.umbral,
    4,
    0.6,
  );
}

function updatePlayer(w: World, input: InputState, dt: number) {
  const p = w.player;
  if (p.dead) {
    if (p.ragdoll) {
      stepRagdoll(p.ragdoll, (tx, ty) => isSolid(w, tx, ty), dt);
      const n = p.ragdoll.pts[1];
      stepScarf(p.scarf, n, 4, w.time, dt);
    }
    p.deadTimer -= dt;
    if (p.deadTimer <= 0) {
      respawn(w);
    }
    return;
  }

  p.invuln -= dt;
  p.dashCd -= dt;
  p.throwCd -= dt;
  p.wallLock -= dt;
  p.jumpBuffer -= dt;
  if (p.ammo < PLAYER.maxAmmo) {
    p.ammoTimer += dt;
    if (p.ammoTimer >= PLAYER.ammoRegen) {
      p.ammoTimer = 0;
      p.ammo++;
    }
  } else {
    p.ammoTimer = 0;
  }

  p.landT -= dt;
  p.hookCd -= dt;
  p.riftCd -= dt;

  // Ride moving slabs.
  if (p.riding >= 0) {
    const m = w.movers.find(mv => mv.id === p.riding);
    if (m) {
      p.x += m.dx;
      p.y += m.dy;
    }
  }

  if (input.jumpPressed > 0) {
    p.jumpBuffer = PHYS.jumpBuffer;
    input.jumpPressed = 0;
  }
  const wantDash = input.dashPressed > 0;
  input.dashPressed = 0;
  const wantThrow = input.throwPressed > 0;
  input.throwPressed = 0;

  const move = (input.right ? 1 : 0) - (input.left ? 1 : 0);

  if (wantDash && p.dashCd <= 0 && (p.onGround || p.airDash)) {
    p.dashTime = PHYS.dashTime;
    p.dashCd = PHYS.dashCooldown;
    cue(w, 'dash');
    p.dashDir = move !== 0 ? (move as 1 | -1) : p.facing;
    p.facing = p.dashDir;
    if (!p.onGround) {
      p.airDash = false;
    }
    burst(w, p.x + p.w / 2, p.y + p.h / 2, 10, COLORS.umbral, 3, 0.35, 0.1, 0);
  }

  // The bolt button doubles as the shadow-hook when a ring is in reach.
  let hooked = false;
  if (wantThrow && w.abilities.hook) {
    if (p.hook) {
      p.hook = null;
      p.hookCd = 0.25;
      hooked = true;
    } else if (p.hookCd <= 0) {
      const ring = nearestRing(w);
      if (ring) {
        const d = Math.hypot(
          ring.x - (p.x + p.w / 2),
          ring.y - (p.y + p.h / 2),
        );
        // The rope reels in to at most 3.2 tiles so swings stay above the floor.
        p.hook = { ring: ring.id, len: Math.min(3.2, Math.max(1.3, d)) };
        p.dashTime = 0;
        hooked = true;
        cue(w, 'hook');
        burst(w, ring.x, ring.y, 8, COLORS.umbral, 2, 0.3, 0.08, 0);
      }
    }
  }
  // Near a hook ring the button belongs to the hook, so don't waste a bolt
  // when the ring is momentarily out of sight.
  const ringClose =
    w.abilities.hook &&
    w.rings.some(
      r =>
        Math.hypot(r.x - (p.x + p.w / 2), r.y - (p.y + p.h / 2)) <
        TOOLS.hookRange,
    );
  if (wantThrow && !hooked && !ringClose && p.ammo > 0 && p.throwCd <= 0) {
    p.ammo--;
    p.throwCd = PLAYER.throwCooldown;
    cue(w, 'bolt');
    spawnProjectile(
      w,
      'player',
      p.x + p.w / 2 + p.facing * 0.35,
      p.y + p.h * 0.4,
      p.facing * PLAYER.boltSpeed,
    );
  }

  if (p.dashTime > 0) {
    p.dashTime -= dt;
    p.vx = p.dashDir * PHYS.dashSpeed;
    p.vy = 0;
    if (Math.random() < 0.6) {
      burst(
        w,
        p.x + p.w / 2,
        p.y + p.h / 2,
        1,
        COLORS.umbral,
        0.5,
        0.3,
        0.14,
        0,
      );
    }
    if (p.dashTime <= 0) {
      p.vx = p.dashDir * PHYS.runSpeed;
    }
  } else {
    p.climbT -= dt;
    if (p.climbT <= 0 || p.onGround || move === -p.climbDir) {
      p.climbDir = 0;
    }
    if (p.hook) {
      // Swinging: only push along the arc; the rope does the rest.
      const ring = w.rings.find(r => r.id === p.hook!.ring)!;
      const dx = p.x + p.w / 2 - ring.x;
      const dy = p.y + p.h / 2 - ring.y;
      const d = Math.hypot(dx, dy) || 1;
      let tx = -dy / d;
      let ty = dx / d;
      if (tx < 0) {
        tx = -tx;
        ty = -ty;
      }
      p.vx += tx * move * TOOLS.hookSwing * dt;
      p.vy += ty * move * TOOLS.hookSwing * dt;
      if (move !== 0) {
        p.facing = move as 1 | -1;
      }
    } else if (p.wallLock <= 0) {
      let accel = p.onGround ? PHYS.groundAccel : PHYS.airAccel;
      p.skidding = false;
      if (p.onGround) {
        if (move === 0) {
          // Let go and the body slides to a stop instead of halting dead.
          accel = PHYS.groundFriction;
        } else if (Math.sign(p.vx) === -move && Math.abs(p.vx) > 3) {
          // Reversing at speed: plant the feet and skid.
          accel = PHYS.skidDecel;
          p.skidding = true;
          if (Math.random() < 0.5) {
            burst(
              w,
              p.x + p.w / 2 + Math.sign(p.vx) * 0.25,
              p.y + p.h,
              1,
              COLORS.rimSoft,
              1.5,
              0.35,
              0.09,
              -1,
            );
          }
        }
        if (p.landT > 0) {
          accel *= 0.35;
        }
        if (p.surface === 'I') {
          accel *= TOOLS.iceGrip;
        }
      }
      // While climbing with no input, drift back onto the wall.
      const target =
        move !== 0 ? move * PHYS.runSpeed : p.climbDir * PHYS.runSpeed * 0.6;
      p.vx = approach(p.vx, target, accel * dt);
      if (move !== 0) {
        p.facing = move as 1 | -1;
      }
    }
    p.vy += PHYS.gravity * dt;
    // Glide on the umbral cloak: hold jump while falling.
    p.gliding =
      w.abilities.glide &&
      !p.onGround &&
      input.jump &&
      p.vy > 0 &&
      !p.hook &&
      p.wallDir === 0 &&
      p.jumpBuffer <= 0;
    const lift = fanLift(w, p.gliding);
    if (lift > 0) {
      p.vy = Math.max(-TOOLS.fanMaxRise, p.vy - lift * dt);
    }
    if (p.gliding) {
      p.vy = Math.min(p.vy, TOOLS.glideFall);
    }
    const sliding =
      !p.onGround && p.wallDir !== 0 && move === p.wallDir && p.vy > 0;
    if (sliding) {
      p.vy = Math.min(p.vy, PHYS.wallSlideMax);
      if (Math.random() < 0.15) {
        burst(
          w,
          p.x + (p.wallDir > 0 ? p.w : 0),
          p.y + p.h * 0.3,
          1,
          COLORS.rimSoft,
          1,
          0.3,
          0.08,
          2,
        );
      }
    }
    p.vy = Math.min(p.vy, PHYS.maxFall);
  }

  // Wall we can climb: touching one, or just pushed off the one we're climbing.
  const climbWall: -1 | 0 | 1 =
    p.wallDir !== 0
      ? p.wallDir
      : p.climbDir !== 0 && wallNear(w, p, p.climbDir, 0.45)
      ? p.climbDir
      : 0;
  // Holding jump against a wall keeps climbing it.
  if (
    input.jump &&
    !p.onGround &&
    climbWall !== 0 &&
    move !== -climbWall &&
    p.vy > -2
  ) {
    p.jumpBuffer = Math.max(p.jumpBuffer, dt);
  }

  // Let go of the hook with a jump: keeps the swing's momentum plus a kick.
  if (p.hook && p.jumpBuffer > 0) {
    p.hook = null;
    p.hookCd = 0.25;
    p.vy = Math.min(p.vy, 0) - TOOLS.hookRelease;
    p.jumpBuffer = 0;
    p.jumpsLeft = 1;
    p.airDash = true;
    p.jumpHeld = true;
    p.squashV += 4;
    cue(w, 'jump');
  }

  // Jumping: ground/coyote, wall climb, wall kick, then the umbral double jump.
  if (p.jumpBuffer > 0) {
    let jumped = false;
    if (p.onGround || p.coyote > 0) {
      // Jumping off a moving slab carries its momentum.
      const m = p.riding >= 0 ? w.movers.find(mv => mv.id === p.riding) : null;
      p.vy = -PHYS.jumpVel + (m ? Math.min(0, m.vy) : 0);
      if (m) {
        p.vx += m.vx;
      }
      p.squashV += 5;
      cue(w, 'jump');
      p.landT = 0;
      p.coyote = 0;
      p.jumpsLeft = 1;
      jumped = true;
    } else if (climbWall !== 0 && move !== -climbWall) {
      // Climb hop: spring up the same wall instead of away from it.
      p.vy = -PHYS.climbVy;
      p.vx = -climbWall * PHYS.climbPushOff;
      p.facing = climbWall;
      p.wallLock = PHYS.climbLock;
      p.climbDir = climbWall;
      p.climbT = PHYS.climbStick;
      cue(w, 'jump');
      p.jumpsLeft = 1;
      p.airDash = true;
      jumped = true;
      burst(
        w,
        p.x + (climbWall > 0 ? p.w : 0),
        p.y + p.h * 0.8,
        5,
        COLORS.rim,
        1.5,
        0.3,
        0.08,
        2,
      );
    } else if (p.wallDir !== 0) {
      p.vy = -PHYS.wallJumpVy;
      p.vx = -p.wallDir * PHYS.wallJumpVx;
      p.facing = -p.wallDir as 1 | -1;
      p.wallLock = PHYS.wallJumpLock;
      p.climbDir = 0;
      cue(w, 'jump');
      p.jumpsLeft = 1;
      p.airDash = true;
      jumped = true;
      burst(
        w,
        p.x + (p.wallDir > 0 ? p.w : 0),
        p.y + p.h / 2,
        6,
        COLORS.rim,
        2,
        0.3,
        0.08,
        0,
      );
    } else if (p.jumpsLeft > 0) {
      p.vy = -PHYS.doubleJumpVel;
      p.squashV += 3.5;
      cue(w, 'doubleJump');
      p.jumpsLeft--;
      jumped = true;
      burst(w, p.x + p.w / 2, p.y + p.h, 12, COLORS.umbral, 3, 0.4, 0.1, -1);
    }
    if (jumped) {
      p.jumpBuffer = 0;
      p.jumpHeld = true;
      p.noJumpCut = false;
      p.dashTime = 0;
      p.onGround = false;
      p.riding = -1;
    }
  }
  if (p.jumpHeld && !input.jump) {
    p.jumpHeld = false;
    if (p.vy < 0 && !p.noJumpCut) {
      p.vy *= PHYS.jumpCut;
    }
  }

  if (p.hook) {
    const ring = w.rings.find(r => r.id === p.hook!.ring)!;
    const dx = p.x + p.w / 2 + p.vx * dt - ring.x;
    const dy = p.y + p.h / 2 + p.vy * dt - ring.y;
    const d = Math.hypot(dx, dy);
    if (d > p.hook.len) {
      // Taut rope: cancel the outward part of the velocity.
      const nx = dx / d;
      const ny = dy / d;
      const vr = p.vx * nx + p.vy * ny;
      if (vr > 0) {
        p.vx -= vr * nx;
        p.vy -= vr * ny;
      }
      p.x -= nx * (d - p.hook.len) * 0.5;
      p.y -= ny * (d - p.hook.len) * 0.5;
    }
  }

  // Belts carry whatever stands on them.
  const belt = !p.onGround
    ? 0
    : p.surface === '>'
    ? TOOLS.conveyor
    : p.surface === '<'
    ? -TOOLS.conveyor
    : 0;

  // Horizontal movement.
  p.x += (p.vx + belt) * dt;
  {
    const top = Math.floor(p.y + 0.01);
    const bottom = Math.floor(p.y + p.h - 0.01);
    const dirX = Math.sign(p.vx + belt);
    if (dirX !== 0) {
      const tx = Math.floor(dirX > 0 ? p.x + p.w : p.x);
      for (let ty = top; ty <= bottom; ty++) {
        if (!isSolid(w, tx, ty)) {
          continue;
        }
        const c = tileAt(w, tx, ty);
        if (c === 'B' && p.dashTime > 0) {
          clearGroup(w, tx, ty, '#9a8ab8');
          w.shake = Math.max(w.shake, 0.15);
          continue;
        }
        if (c === 'D' && w.keys > 0) {
          w.keys--;
          clearGroup(w, tx, ty, '#c9d4ff');
          continue;
        }
        p.x = dirX > 0 ? tx - p.w - 0.001 : tx + 1.001;
        p.vx = 0;
        break;
      }
    }
  }

  // Vertical movement.
  const prevBottom = p.y + p.h;
  const fallSpeed = p.vy;
  p.y += p.vy * dt;
  const wasGround = p.onGround;
  p.onGround = false;
  p.riding = -1;
  {
    const left = Math.floor(p.x + 0.01);
    const right = Math.floor(p.x + p.w - 0.01);
    if (p.vy >= 0) {
      const ty = Math.floor(p.y + p.h);
      for (let tx = left; tx <= right; tx++) {
        const c = tileAt(w, tx, ty);
        if (isSolid(w, tx, ty) || (c === '-' && prevBottom <= ty + 0.02)) {
          p.y = ty - p.h;
          p.vy = 0;
          p.onGround = true;
          break;
        }
      }
      if (p.onGround) {
        for (let tx = left; tx <= right; tx++) {
          if (tileAt(w, tx, ty) === 'C') {
            const key = ty * w.level.width + tx;
            if (!w.crumbles.has(key)) {
              w.crumbles.set(key, { timer: 0.45, broken: 0 });
            }
          }
        }
      } else {
        for (const m of w.movers) {
          if (
            p.x + p.w > m.x + 0.05 &&
            p.x < m.x + m.w - 0.05 &&
            prevBottom <= m.y + 0.15 &&
            p.y + p.h >= m.y
          ) {
            p.y = m.y - p.h;
            p.vy = 0;
            p.onGround = true;
            p.riding = m.id;
            break;
          }
        }
      }
    } else {
      const ty = Math.floor(p.y);
      for (let tx = left; tx <= right; tx++) {
        if (isSolid(w, tx, ty)) {
          p.y = ty + 1;
          p.vy = 0;
          break;
        }
      }
    }
  }

  if (p.onGround) {
    if (!wasGround) {
      // Impact: squash proportional to fall speed, dust, and a crouch on hard landings.
      const impact = Math.max(0, fallSpeed);
      p.squashV -= impact * 0.4;
      const dust = Math.round(2 + impact * 0.5);
      burst(
        w,
        p.x + p.w / 2,
        p.y + p.h,
        dust,
        COLORS.rimSoft,
        1 + impact * 0.15,
        0.4,
        0.09,
        -0.5,
      );
      if (impact > 8) {
        cue(w, 'land');
      }
      if (impact > PHYS.hardLanding) {
        p.landT = 0.2;
        w.shake = Math.max(w.shake, 0.12);
      }
    }
    const under = tileAt(
      w,
      Math.floor(p.x + p.w / 2),
      Math.floor(p.y + p.h + 0.05),
    );
    p.surface = under === 'I' || under === '>' || under === '<' ? under : ' ';
    p.coyote = PHYS.coyoteTime;
    p.jumpsLeft = 1;
    p.airDash = true;
    p.noJumpCut = false;
  } else {
    p.coyote -= dt;
  }

  // Wall contact.
  p.wallDir = 0;
  if (!p.onGround) {
    const t0 = Math.floor(p.y + 0.15);
    const t1 = Math.floor(p.y + p.h - 0.15);
    const lx = Math.floor(p.x - 0.06);
    const rx = Math.floor(p.x + p.w + 0.06);
    for (let ty = t0; ty <= t1; ty++) {
      if (isWall(tileAt(w, lx, ty)) && lx >= 0) {
        p.wallDir = -1;
      }
      if (isWall(tileAt(w, rx, ty)) && rx < w.level.width) {
        p.wallDir = 1;
      }
    }
  }

  // Animation state.
  const sliding =
    !p.onGround &&
    p.wallDir !== 0 &&
    (move === p.wallDir || p.climbDir === p.wallDir);
  if (p.dashTime > 0) {
    p.anim = 'dash';
  } else if (p.hook) {
    p.anim = 'hook';
  } else if (p.gliding) {
    p.anim = 'glide';
  } else if (p.onGround && p.landT > 0) {
    p.anim = 'land';
  } else if (p.onGround && p.skidding) {
    p.anim = 'skid';
  } else if (p.onGround) {
    p.anim = Math.abs(p.vx) > 0.5 ? 'run' : 'idle';
  } else if (sliding) {
    p.anim = 'wall';
  } else {
    p.anim = p.vy < 0 ? 'jump' : 'fall';
  }
  p.animT += dt * (p.anim === 'run' ? Math.abs(p.vx) / PHYS.runSpeed : 1);

  // Squash & stretch: a damped spring, stretched slightly by fast vertical motion.
  const stretch = p.onGround ? 0 : Math.min(0.1, Math.abs(p.vy) * 0.006);
  p.squashV += ((stretch - p.squash) * 320 - p.squashV * 16) * dt;
  p.squash = Math.max(-0.35, Math.min(0.3, p.squash + p.squashV * dt));

  // Lean into acceleration, like a body with mass.
  const accelX = (p.vx - p.prevVx) / dt;
  p.prevVx = p.vx;
  let tiltTarget = Math.max(-22, Math.min(22, p.vx * 1.4 + accelX * 0.05));
  if (!p.onGround) {
    tiltTarget *= 0.5;
  }
  p.tilt += (tiltTarget - p.tilt) * Math.min(1, dt * 12);

  stepScarf(p.scarf, neckOf(p), Math.hypot(p.vx, p.vy), w.time, dt);

  if (p.y > w.level.height + 1) {
    kill(w);
  }
}

// ---------------------------------------------------------------- world

function clearLine(w: World, x0: number, x1: number, ty: number) {
  const a = Math.floor(Math.min(x0, x1));
  const b = Math.floor(Math.max(x0, x1));
  for (let tx = a + 1; tx < b; tx++) {
    if (isSolid(w, tx, ty)) {
      return false;
    }
  }
  return true;
}

function updateGuard(w: World, e: Enemy, dt: number) {
  const p = w.player;
  const ecx = e.x + e.w / 2;
  const dx = p.x + p.w / 2 - ecx;
  const dy = p.y + p.h / 2 - (e.y + e.h / 2);
  const hidden = p.dead || w.cloakT > 0;
  const row = Math.floor(e.y + 0.5);
  const canSee =
    !hidden &&
    Math.abs(dy) < 1.2 &&
    Math.abs(dx) < ENEMY.guardSight &&
    Math.sign(dx) === e.dir &&
    clearLine(w, ecx, p.x + p.w / 2, row);
  if (e.state === 'patrol') {
    if (
      !hidden &&
      Math.abs(dx) < 2.2 &&
      Math.abs(dy) < 1.2 &&
      Math.sign(dx) === -e.dir
    ) {
      e.dir = -e.dir as 1 | -1;
    }
    if (canSee) {
      e.state = 'aim';
      e.timer = ENEMY.guardAim;
    } else {
      e.x += e.dir * ENEMY.guardSpeed * dt;
      const ahead = e.dir > 0 ? e.x + e.w + 0.05 : e.x - 0.05;
      const tx = Math.floor(ahead);
      const footRow = Math.floor(e.y + e.h + 0.01);
      const floor = tileAt(w, tx, footRow);
      if (isSolid(w, tx, row) || !(isSolid(w, tx, footRow) || floor === '-')) {
        e.x -= e.dir * ENEMY.guardSpeed * dt;
        e.dir = -e.dir as 1 | -1;
      }
    }
  } else if (e.state === 'aim') {
    e.timer -= dt;
    if (e.timer <= 0) {
      spawnProjectile(
        w,
        'enemy',
        ecx + e.dir * 0.45,
        e.y + 0.4,
        e.dir * ENEMY.lightBoltSpeed,
      );
      e.state = 'cool';
      e.timer = ENEMY.guardCool;
    }
  } else {
    e.timer -= dt;
    if (e.timer <= 0) {
      e.state = 'patrol';
    }
  }
}

function updateWisp(w: World, e: Enemy, dt: number) {
  const p = w.player;
  const dist = Math.hypot(
    p.x + p.w / 2 - (e.x + e.w / 2),
    p.y + p.h / 2 - (e.y + e.h / 2),
  );
  let tx = e.homeX;
  let ty = e.homeY;
  let speed = ENEMY.wispSpeed * 0.6;
  if (!p.dead && w.cloakT <= 0 && dist < ENEMY.wispRange) {
    tx = p.x + p.w / 2 - e.w / 2;
    ty = p.y + p.h / 2 - e.h / 2;
    speed = ENEMY.wispSpeed;
    e.state = 'chase';
  } else {
    e.state = 'float';
  }
  const mx = tx - e.x;
  const my = ty - e.y;
  const md = Math.hypot(mx, my);
  if (md > 0.05) {
    e.x += (mx / md) * speed * dt;
    e.y += (my / md) * speed * dt;
  }
  if (Math.abs(mx) > 0.1) {
    e.dir = mx > 0 ? 1 : -1;
  }
}

function updateEnemies(w: World, dt: number) {
  for (const e of w.enemies) {
    if (!e.alive) {
      continue;
    }
    e.t += dt;
    e.hitT -= dt;
    switch (e.kind) {
      case 'guard':
        updateGuard(w, e, dt);
        break;
      case 'wisp':
        updateWisp(w, e, dt);
        break;
      case 'archer':
        updateArcher(w, e, dt);
        break;
      case 'turret':
        updateTurret(w, e, dt);
        break;
      case 'brute':
        updateBrute(w, e, dt);
        break;
      case 'moth':
        updateMoth(w, e, dt);
        break;
    }
  }
}

function updateHazards(w: World, dt: number) {
  for (const s of w.saws) {
    s.t += dt;
    if (s.axis === 'c') {
      // A mace swinging round its pivot.
      const a = s.t * s.speed;
      s.x = s.ox + Math.cos(a) * s.range;
      s.y = s.oy + Math.sin(a) * s.range;
      continue;
    }
    const k = (1 - Math.cos((s.t * s.speed * Math.PI) / s.range)) / 2;
    if (s.axis === 'x') {
      s.x = s.ox + s.range * k;
    } else {
      s.y = s.oy + s.range * k;
    }
  }
  for (const m of w.movers) {
    m.t += dt;
    const k = (1 - Math.cos((m.t * m.speed * Math.PI) / m.range)) / 2;
    const nx = m.axis === 'x' ? m.ox + m.range * k : m.ox;
    const ny = m.axis === 'y' ? m.oy + m.range * k : m.oy;
    m.vx = (nx - m.x) / dt;
    m.vy = (ny - m.y) / dt;
    m.dx = nx - m.x;
    m.dy = ny - m.y;
    m.x = nx;
    m.y = ny;
  }
  for (const b of w.beams) {
    b.t += dt;
    const cycle = b.on + b.off;
    const m = b.t % cycle;
    b.active = m < b.on;
    b.warning = !b.active && m > cycle - 0.45;
  }
  for (const s of w.springs) {
    s.t = Math.max(0, s.t - dt);
  }
  updateCrushers(w, dt);
  updateDroppers(w, dt);
  const p = w.player;
  for (const [key, c] of w.crumbles) {
    const tx = key % w.level.width;
    const ty = Math.floor(key / w.level.width);
    if (c.timer > 0) {
      c.timer -= dt;
      if (c.timer <= 0) {
        c.broken = 4;
        burst(w, tx + 0.5, ty + 0.5, 8, COLORS.rimSoft, 2, 0.6, 0.15, 12);
      }
    } else if (c.broken > 0) {
      c.broken -= dt;
      if (c.broken <= 0) {
        if (overlap(p.x, p.y, p.w, p.h, tx, ty, 1, 1)) {
          c.broken = 0.2;
        } else {
          w.crumbles.delete(key);
        }
      }
    }
  }
}

function updateProjectiles(w: World, dt: number) {
  const p = w.player;
  for (const pr of w.projectiles) {
    pr.vy += pr.g * dt;
    pr.x += pr.vx * dt;
    pr.y += pr.vy * dt;
    pr.life -= dt;
    const tx = Math.floor(pr.x);
    const ty = Math.floor(pr.y);
    if (isSolid(w, tx, ty)) {
      pr.life = 0;
      if (pr.owner === 'player' && tileAt(w, tx, ty) === 'B') {
        clearGroup(w, tx, ty, '#9a8ab8');
      }
      burst(
        w,
        pr.x,
        pr.y,
        5,
        pr.owner === 'player' ? COLORS.umbral : COLORS.lumen,
        2.5,
        0.3,
        0.08,
        0,
      );
      continue;
    }
    if (pr.owner === 'player') {
      for (const e of w.enemies) {
        if (e.alive && circleRect(pr.x, pr.y, pr.r, e.x, e.y, e.w, e.h)) {
          enemyHit(w, e, pr.x - pr.vx);
          pr.life = 0;
          break;
        }
      }
      const b = w.boss;
      if (
        pr.life > 0 &&
        b &&
        Math.hypot(pr.x - b.x, pr.y - b.y) < 0.8 &&
        hitBoss(w, 1)
      ) {
        pr.life = 0;
      }
    } else if (!p.dead && circleRect(pr.x, pr.y, pr.r, p.x, p.y, p.w, p.h)) {
      pr.life = 0;
      if (p.dashTime > 0) {
        burst(w, pr.x, pr.y, 6, COLORS.umbral, 2, 0.3, 0.08, 0);
      } else {
        damage(w, pr.x);
      }
    }
  }
  w.projectiles = w.projectiles.filter(
    pr => pr.life > 0 && pr.y < w.level.height + 4,
  );
}

function playerInteractions(w: World) {
  const p = w.player;
  if (p.dead || w.status !== 'playing') {
    return;
  }
  const px = p.x + 0.08;
  const py = p.y + 0.08;
  const pw = p.w - 0.16;
  const ph = p.h - 0.12;
  const dashing = p.dashTime > 0;

  // Spikes kill outright.
  const x0 = Math.floor(p.x);
  const x1 = Math.floor(p.x + p.w);
  const y0 = Math.floor(p.y);
  const y1 = Math.floor(p.y + p.h);
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      const c = tileAt(w, tx, ty);
      if (
        c === '^' &&
        overlap(px, py, pw, ph, tx + 0.1, ty + 0.45, 0.8, 0.55)
      ) {
        kill(w);
        return;
      }
      if (c === 'v' && overlap(px, py, pw, ph, tx + 0.1, ty, 0.8, 0.55)) {
        kill(w);
        return;
      }
    }
  }
  if (hazardContacts(w, px, py, pw, ph)) {
    return;
  }

  for (const s of w.saws) {
    if (circleRect(s.x, s.y, s.r - 0.05, px, py, pw, ph)) {
      damage(w, s.x);
    }
  }

  if (!dashing) {
    for (const b of w.beams) {
      if (
        b.active &&
        overlap(px, py, pw, ph, b.x + 0.25, b.y0, 0.5, b.y1 - b.y0)
      ) {
        damage(w, b.x + 0.5);
      }
    }
  }

  const pcx = p.x + p.w / 2;
  for (const e of w.enemies) {
    if (!e.alive || !overlap(px, py, pw, ph, e.x, e.y, e.w, e.h)) {
      continue;
    }
    if (dashing) {
      if (shieldBlocks(e, pcx)) {
        // Dashing into a raised shield throws you back.
        p.dashTime = 0;
        p.vx = -p.dashDir * 8;
        p.vy = -6;
        p.wallLock = 0.2;
        enemyHit(w, e, pcx);
      } else {
        enemyHit(w, e, pcx, 2);
      }
    } else if (p.vy > 0 && p.y + p.h <= e.y + 0.45) {
      enemyHit(w, e, e.x + e.w / 2, 2);
      p.vy = -PHYS.stompBounce;
      p.jumpsLeft = 1;
      p.airDash = true;
    } else if (e.hitT <= 0 || e.kind !== 'turret') {
      damage(w, e.x + e.w / 2);
    }
  }
  bossContact(w, px, py, pw, ph);

  for (const pk of w.pickups) {
    if (pk.taken || !circleRect(pk.x, pk.y, 0.35, p.x, p.y, p.w, p.h)) {
      continue;
    }
    pk.taken = true;
    switch (pk.kind) {
      case 'shard':
        w.shards++;
        cue(w, 'shard');
        burst(w, pk.x, pk.y, 10, COLORS.umbral, 3, 0.45, 0.09, 0);
        break;
      case 'mask':
        w.mask = true;
        cue(w, 'mask');
        burst(w, pk.x, pk.y, 24, '#ffffff', 4, 0.8, 0.12, 0);
        break;
      case 'heart':
        p.hp = Math.min(PLAYER.maxHp, p.hp + 1);
        burst(w, pk.x, pk.y, 14, COLORS.danger, 3, 0.6, 0.1, -2);
        break;
      case 'key':
        w.keys++;
        cue(w, 'key');
        burst(w, pk.x, pk.y, 16, '#c9d4ff', 3, 0.6, 0.1, -1);
        break;
      case 'cloak':
        w.cloakT = TOOLS.cloakTime;
        burst(w, pk.x, pk.y, 20, '#6b4fd6', 4, 0.8, 0.14, -1);
        break;
    }
  }

  for (const cp of w.checkpoints) {
    // A totem claims the whole column above it, so gliding or jumping
    // over one still saves your place.
    if (
      !cp.active &&
      overlap(p.x, p.y, p.w, p.h, cp.x - 0.1, cp.y - 9, 1.2, 10)
    ) {
      cp.active = true;
      cue(w, 'checkpoint');
      w.respawn = { x: cp.x + (1 - PLAYER.w) / 2, y: cp.y + 1 - PLAYER.h };
      p.hp = PLAYER.maxHp;
      burst(w, cp.x + 0.5, cp.y - 0.2, 16, COLORS.rim, 3, 0.7, 0.1, -2);
    }
  }

  for (const s of w.springs) {
    if (
      p.vy >= 0 &&
      overlap(px, py, pw, ph, s.x + 0.1, s.y + 0.55, 0.8, 0.45)
    ) {
      p.y = s.y + 0.55 - p.h;
      p.vy = -PHYS.springVel;
      p.noJumpCut = true;
      p.jumpHeld = false;
      p.jumpsLeft = 1;
      p.airDash = true;
      p.onGround = false;
      p.hook = null;
      s.t = 0.3;
      cue(w, 'spring');
      burst(w, s.x + 0.5, s.y + 0.6, 10, COLORS.rim, 3, 0.4, 0.1, 4);
    }
  }

  // The gate only opens once any boss guarding it has fallen.
  const ex = w.exit;
  if (
    exitOpen(w) &&
    overlap(px, py, pw, ph, ex.x + 0.2, ex.y - 0.6, 0.6, 1.6)
  ) {
    w.status = 'exiting';
    cue(w, 'win');
    w.exitTimer = 1.0;
    burst(w, ex.x + 0.5, ex.y + 0.2, 30, COLORS.umbral, 5, 1.0, 0.14, -3);
  }
}

export function exitOpen(w: World) {
  return !w.boss || w.boss.state === 'dead';
}

function updateParticles(w: World, dt: number) {
  for (const pa of w.particles) {
    pa.vy += pa.gravity * dt;
    pa.x += pa.vx * dt;
    pa.y += pa.vy * dt;
    pa.life -= dt;
  }
  if (w.particles.some(pa => pa.life <= 0)) {
    w.particles = w.particles.filter(pa => pa.life > 0);
  }
}

function tick(w: World, input: InputState, dt: number) {
  w.time += dt;
  w.cloakT = Math.max(0, w.cloakT - dt);
  updateHazards(w, dt);
  if (w.status === 'playing') {
    updatePlayer(w, input, dt);
    updateEnemies(w, dt);
    updateBoss(w, dt);
    playerInteractions(w);
  } else if (w.status === 'exiting') {
    w.exitTimer -= dt;
    if (w.exitTimer <= 0) {
      w.status = 'won';
    }
  }
  updateProjectiles(w, dt);
  updateParticles(w, dt);
}

function updateCamera(w: World, dt: number) {
  const p = w.player;
  const { view, camera } = w;
  const tx = p.x + p.w / 2 - view.w / 2 + p.facing * 1.2;
  const ty = p.y + p.h / 2 - view.h * 0.55;
  camera.x += (tx - camera.x) * Math.min(1, dt * 5);
  camera.y += (ty - camera.y) * Math.min(1, dt * 4);
  camera.x = clamp(camera.x, 0, Math.max(0, w.level.width - view.w));
  camera.y = clamp(camera.y, 0, Math.max(0, w.level.height - view.h));
  w.shake = Math.max(0, w.shake - dt);
}

export function step(w: World, input: InputState, frameDt: number) {
  w.accumulator += Math.min(frameDt, 0.05);
  while (w.accumulator >= FIXED_DT) {
    tick(w, input, FIXED_DT);
    w.accumulator -= FIXED_DT;
  }
  updateCamera(w, Math.min(frameDt, 0.05));
}

export function computeStars(w: World) {
  return 1 + (w.shards >= w.shardsTotal ? 1 : 0) + (w.mask ? 1 : 0);
}
