/**
 * Level sanity checks. A best-first search bot drives the real engine with
 * coarse inputs to prove every chapter can be finished. Enemies, blades,
 * crushers, droppers and light beams are removed (they are timing challenges,
 * not geometry), but spikes, pits, liquid lumen, ice, belts, crumbling blocks,
 * springs, moving slabs, fans, rifts, hook rings, keys and doors stay in.
 * The bot can run, jump, double jump, glide, climb, dash, throw and swing.
 */
import { FIXED_DT } from '../src/game/constants';
import { createInput, createWorld, step } from '../src/game/engine';
import { BOSS_CHAPTER, LEVELS } from '../src/game/levels';
import { InputState, World } from '../src/game/types';

const VIEW = { w: 20, h: 11 };
const CHUNK = 6; // ticks per decision (0.05 s)
// Search budget per stage. Dawnward Stair needs the most room.
const BOT_BUDGET = 500000;

interface Action {
  dir: -1 | 0 | 1;
  jump: 'none' | 'press' | 'hold';
  dash: boolean;
  bolt: boolean;
}

const ACTIONS: Action[] = [];
for (const dir of [-1, 0, 1] as const) {
  for (const jump of ['none', 'press', 'hold'] as const) {
    ACTIONS.push({ dir, jump, dash: false, bolt: false });
  }
  // Bolt/hook button, with jump held so a glide or swing isn't cut short.
  ACTIONS.push({ dir, jump: 'hold', dash: false, bolt: true });
}
ACTIONS.push({ dir: 1, jump: 'none', dash: true, bolt: false });
ACTIONS.push({ dir: -1, jump: 'none', dash: true, bolt: false });
ACTIONS.push({ dir: 1, jump: 'press', dash: true, bolt: false });

function clone(w: World, mutableGrid: boolean): World {
  const p = w.player;
  return {
    ...w,
    grid: mutableGrid ? w.grid.map(r => r.slice()) : w.grid,
    player: {
      ...p,
      hook: p.hook ? { ...p.hook } : null,
      scarf: p.scarf.map(q => ({ ...q })),
    },
    crumbles: new Map([...w.crumbles].map(([k, v]) => [k, { ...v }])),
    movers: w.movers.map(m => ({ ...m })),
    springs: w.springs.map(s => ({ ...s })),
    pickups: w.pickups.map(s => ({ ...s })),
    camera: { ...w.camera },
    particles: [],
    projectiles: w.projectiles.map(s => ({ ...s })),
  };
}

function apply(w: World, a: Action) {
  const input: InputState = createInput();
  input.left = a.dir < 0;
  input.right = a.dir > 0;
  input.jump = a.jump !== 'none';
  if (a.jump === 'press') {
    input.jumpPressed = 1;
  }
  if (a.dash) {
    input.dashPressed = 1;
  }
  if (a.bolt) {
    input.throwPressed = 1;
  }
  for (let i = 0; i < CHUNK; i++) {
    step(w, input, FIXED_DT);
    if (w.player.dead || w.status !== 'playing') {
      return;
    }
  }
}

function stateKey(w: World, timed: boolean) {
  const p = w.player;
  return [
    Math.round(p.x * 4),
    Math.round(p.y * 4),
    Math.round(p.vy / 3),
    Math.round(p.vx / 3),
    p.onGround ? 1 : 0,
    p.jumpsLeft,
    p.airDash ? 1 : 0,
    p.wallDir,
    p.dashCd > 0 ? 1 : 0,
    p.hook ? p.hook.ring : -1,
    w.keys,
    w.cleared,
    w.pickups.filter(k => k.taken).length,
    timed ? Math.floor(w.time * 2) % 40 : 0,
  ].join(',');
}

type Goal = { x: number; y: number; done: (w: World) => boolean };

function search(start: World, goal: Goal, budget: number) {
  const timed = start.movers.length > 0;
  const mutable = start.level.tiles.some(r => /[DBC]/.test(r));
  const h = (w: World) =>
    Math.abs(goal.x - (w.player.x + w.player.w / 2)) +
    Math.abs(goal.y - (w.player.y + w.player.h / 2)) * 0.6;

  // Binary heap ordered by heuristic + a little elapsed time.
  const heap: { f: number; w: World }[] = [];
  const push = (n: { f: number; w: World }) => {
    heap.push(n);
    let i = heap.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (heap[parent].f <= heap[i].f) {
        break;
      }
      [heap[parent], heap[i]] = [heap[i], heap[parent]];
      i = parent;
    }
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop()!;
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        const l = i * 2 + 1;
        const r = l + 1;
        let m = i;
        if (l < heap.length && heap[l].f < heap[m].f) {
          m = l;
        }
        if (r < heap.length && heap[r].f < heap[m].f) {
          m = r;
        }
        if (m === i) {
          break;
        }
        [heap[m], heap[i]] = [heap[i], heap[m]];
        i = m;
      }
    }
    return top;
  };

  const seen = new Set<string>([stateKey(start, timed)]);
  push({ f: h(start), w: start });
  let expanded = 0;
  let best = Infinity;
  let bestAt = { x: 0, y: 0 };
  while (heap.length && expanded < budget) {
    const { w } = pop();
    expanded++;
    for (const a of ACTIONS) {
      const n = clone(w, mutable);
      apply(n, a);
      if (goal.done(n)) {
        return { world: n, expanded };
      }
      if (n.player.dead || n.status !== 'playing') {
        continue;
      }
      const k = stateKey(n, timed);
      if (seen.has(k)) {
        continue;
      }
      seen.add(k);
      const hv = h(n);
      if (hv < best) {
        best = hv;
        bestAt = { x: Math.round(n.player.x), y: Math.round(n.player.y) };
      }
      push({ f: hv + n.time * 0.15, w: n });
    }
  }
  return { world: null, expanded, best, bestAt };
}

function botWorld(levelIndex: number, target: 'exit' | 'mask') {
  const w = createWorld(LEVELS[levelIndex], VIEW);
  w.enemies = [];
  w.saws = [];
  w.beams = [];
  w.crushers = [];
  w.droppers = [];
  w.boss = null;
  w.checkpoints = [];
  w.pickups = w.pickups.filter(
    pk => pk.kind === 'key' || (target === 'mask' && pk.kind === 'mask'),
  );
  return w;
}

/** Solves a chapter in stages: each moon key in order, then the goal. */
function solve(levelIndex: number, target: 'exit' | 'mask' = 'exit') {
  let w = botWorld(levelIndex, target);
  const mask = w.pickups.find(pk => pk.kind === 'mask');
  const final =
    target === 'mask'
      ? { x: mask!.x, y: mask!.y, done: (n: World) => n.mask }
      : {
          x: w.exit.x + 0.5,
          y: w.exit.y + 0.5,
          done: (n: World) => n.status !== 'playing',
        };
  const keys = w.pickups
    .filter(pk => pk.kind === 'key' && pk.x < final.x)
    .sort((a, b) => a.x - b.x);
  const stages: Goal[] = keys.map((k, i) => ({
    x: k.x,
    y: k.y,
    done: (n: World) =>
      n.mask === false && target === 'mask' && final.done(n)
        ? true
        : n.pickups.filter(pk => pk.kind === 'key' && pk.taken).length > i,
  }));
  stages.push(final);
  let expanded = 0;
  for (const [i, goal] of stages.entries()) {
    const r = search(w, goal, BOT_BUDGET);
    expanded += r.expanded;
    if (!r.world) {
      return {
        solved: false,
        stage: i,
        of: stages.length,
        expanded,
        closest: r.best,
        at: r.bestAt,
      };
    }
    if (final.done(r.world)) {
      return { solved: true, expanded };
    }
    w = r.world;
  }
  return { solved: false, expanded };
}

describe('levels', () => {
  it('has 20 chapters', () => {
    expect(LEVELS).toHaveLength(20);
  });

  it.each(LEVELS.map((l, i) => [l.name, i]))(
    '%s has a start, an exit and shards',
    (_name, i) => {
      const lvl = LEVELS[i as number];
      const kinds = lvl.entities.map(e => e.kind);
      expect(kinds.filter(k => k === 'start')).toHaveLength(1);
      expect(kinds.filter(k => k === 'exit')).toHaveLength(1);
      expect(kinds.filter(k => k === 'mask')).toHaveLength(1);
      expect(kinds.filter(k => k === 'shard').length).toBeGreaterThan(5);
      lvl.tiles.forEach(row => expect(row).toHaveLength(lvl.width));
      // Every sealed door has a key somewhere in the chapter.
      const doors = new Set<number>();
      lvl.tiles.forEach(row =>
        [...row].forEach(
          (c, x) => c === 'D' && row[x - 1] !== 'D' && doors.add(x),
        ),
      );
      expect(kinds.filter(k => k === 'key').length).toBeGreaterThanOrEqual(
        doors.size,
      );
    },
  );

  it.each(
    LEVELS.map((l, i) => [l.name, i]).filter(([, i]) => i !== BOSS_CHAPTER),
  )(
    '%s can be completed',
    (_name, i) => {
      const result = solve(i as number);
      if (!result.solved) {
        throw new Error(`unsolved: ${JSON.stringify(result)}`);
      }
    },
    1200000,
  );

  it.each(LEVELS.map((l, i) => [l.name, i]))(
    '%s has a reachable hidden mask',
    (_name, i) => {
      const result = solve(i as number, 'mask');
      if (!result.solved) {
        throw new Error(`unsolved: ${JSON.stringify(result)}`);
      }
    },
    1200000,
  );
});

describe('engine', () => {
  it('survives a long random run on every level', () => {
    for (const lvl of LEVELS) {
      const w = createWorld(lvl, VIEW);
      const input = createInput();
      for (let f = 0; f < 3000; f++) {
        input.right = f % 200 < 150;
        input.left = !input.right && f % 7 === 0;
        input.jump = f % 40 < 10;
        if (f % 40 === 0) {
          input.jumpPressed++;
        }
        if (f % 90 === 0) {
          input.dashPressed++;
        }
        if (f % 55 === 0) {
          input.throwPressed++;
        }
        step(w, input, 1 / 60);
        expect(Number.isFinite(w.player.x)).toBe(true);
        expect(Number.isFinite(w.player.y)).toBe(true);
      }
    }
  });

  it('Solenne can be defeated, which opens the gate', () => {
    const w = createWorld(LEVELS[BOSS_CHAPTER], VIEW);
    const input = createInput();
    // Let the intro play out, then pelt her with bolts from below.
    for (let f = 0; f < 60 * 3; f++) {
      step(w, input, 1 / 60);
    }
    const b = w.boss!;
    expect(b.state).not.toBe('intro');
    for (let f = 0; f < 60 * 120 && b.state !== 'dead'; f++) {
      w.player.hp = 3;
      w.player.invuln = 1;
      w.player.ammo = 5;
      // Stand under her and aim along the ground toward her.
      w.player.x = b.x - 3 * (b.x > 20 ? 1 : -1);
      w.player.y = 10.1;
      w.player.facing = b.x > w.player.x ? 1 : -1;
      // Bolts fly straight, so drop them in at her height.
      if (f % 20 === 0) {
        w.projectiles.push({
          id: w.nextId++,
          owner: 'player',
          x: b.x - w.player.facing * 1.5,
          y: b.y,
          vx: w.player.facing * 16,
          vy: 0,
          g: 0,
          r: 0.2,
          life: 1,
        });
      }
      step(w, input, 1 / 60);
    }
    expect(b.state).toBe('dead');
    // Walk to the gate.
    input.right = true;
    w.player.x = w.exit.x - 2;
    w.player.y = 10.1;
    for (let f = 0; f < 120 && w.status === 'playing'; f++) {
      step(w, input, 1 / 60);
    }
    expect(w.status).not.toBe('playing');
  });
});

describe('wall climbing', () => {
  // A lone 9-tile wall: far taller than any jump + double jump.
  function wallWorld() {
    const width = 14;
    const tiles = Array.from({ length: 14 }, (_, y) =>
      Array.from({ length: width }, (_, x) =>
        y >= 11 || (x >= 6 && x <= 9 && y >= 2) ? '#' : ' ',
      ).join(''),
    );
    return createWorld(
      {
        id: 99,
        name: 'wall',
        subtitle: '',
        theme: 'dusk',
        width,
        height: 14,
        tiles,
        entities: [
          { kind: 'start', x: 3, y: 10 },
          { kind: 'exit', x: 12, y: 1 },
        ],
      },
      VIEW,
    );
  }

  function run(mode: 'hold' | 'tap') {
    const w = wallWorld();
    const input = createInput();
    let topReached = Infinity;
    for (let f = 0; f < 60 * 6; f++) {
      // Walk into the wall first, then only use the jump button.
      input.right = f < 20;
      const jump = mode === 'hold' ? f >= 15 : f >= 15 && f % 12 < 4;
      if (jump && !input.jump) {
        input.jumpPressed++;
      }
      input.jump = jump;
      step(w, input, 1 / 60);
      topReached = Math.min(topReached, w.player.y + w.player.h);
    }
    return { w, topReached };
  }

  it('climbs a single tall wall by holding jump', () => {
    const { w } = run('hold');
    expect(w.player.dead).toBe(false);
    expect(w.player.y + w.player.h).toBeCloseTo(2, 1);
    expect(w.player.x).toBeGreaterThan(5.5);
  });

  it('climbs a single tall wall by tapping jump', () => {
    const { w } = run('tap');
    // Still tapping on top of the wall, so it may be mid-hop up there.
    expect(w.player.y + w.player.h).toBeLessThanOrEqual(2.01);
    expect(w.player.x).toBeGreaterThan(5.5);
  });

  it('still kicks away when pushing off the wall', () => {
    const w = wallWorld();
    const input = createInput();
    for (let f = 0; f < 40; f++) {
      input.right = f < 30;
      input.left = f >= 30;
      if (f === 10 || f === 31) {
        input.jumpPressed++;
      }
      input.jump = f >= 10;
      step(w, input, 1 / 60);
    }
    expect(w.player.vx).toBeLessThan(-3);
  });
});

describe('body physics', () => {
  function flatWorld(drop = false) {
    const width = 30;
    const tiles = Array.from({ length: 14 }, (_, y) =>
      Array.from({ length: width }, (_, x) =>
        y >= 11 || (drop && x <= 4 && y >= 1) ? '#' : ' ',
      ).join(''),
    );
    return createWorld(
      {
        id: 98,
        name: 'flat',
        subtitle: '',
        theme: 'dusk',
        width,
        height: 14,
        tiles,
        entities: [
          { kind: 'start', x: drop ? 3 : 4, y: drop ? 0 : 10 },
          { kind: 'exit', x: 28, y: 10 },
        ],
      },
      VIEW,
    );
  }

  it('skids when reversing at full speed, and slides when letting go', () => {
    const w = flatWorld();
    const input = createInput();
    input.right = true;
    for (let f = 0; f < 60; f++) {
      step(w, input, 1 / 60);
    }
    input.right = false;
    input.left = true;
    let skidded = false;
    for (let f = 0; f < 10; f++) {
      step(w, input, 1 / 60);
      skidded = skidded || w.player.anim === 'skid';
    }
    expect(skidded).toBe(true);

    input.left = false;
    input.right = true;
    for (let f = 0; f < 60; f++) {
      step(w, input, 1 / 60);
    }
    input.right = false;
    const x0 = w.player.x;
    for (let f = 0; f < 60; f++) {
      step(w, input, 1 / 60);
    }
    expect(w.player.x - x0).toBeGreaterThan(0.4);
  });

  it('squashes on a hard landing and recovers', () => {
    const w = flatWorld(true);
    const input = createInput();
    input.right = true;
    let minSquash = 0;
    let crouched = false;
    for (let f = 0; f < 120; f++) {
      step(w, input, 1 / 60);
      minSquash = Math.min(minSquash, w.player.squash);
      crouched = crouched || w.player.anim === 'land';
    }
    expect(minSquash).toBeLessThan(-0.1);
    expect(crouched).toBe(true);
    expect(Math.abs(w.player.squash)).toBeLessThan(0.02);
  });

  it('scarf trails behind while running', () => {
    const w = flatWorld();
    const input = createInput();
    input.right = true;
    for (let f = 0; f < 60; f++) {
      step(w, input, 1 / 60);
    }
    const s = w.player.scarf;
    expect(s[s.length - 1].x).toBeLessThan(s[0].x - 0.3);
  });

  it('ragdolls on death and comes to rest on the ground', () => {
    const w = flatWorld();
    const input = createInput();
    w.player.hp = 1;
    w.player.invuln = 0;
    // Drop the player into spikes.
    w.grid[10][6] = '^';
    input.right = true;
    for (let f = 0; f < 30 && !w.player.dead; f++) {
      step(w, input, 1 / 60);
    }
    expect(w.player.dead).toBe(true);
    const r = w.player.ragdoll!;
    for (let f = 0; f < 50; f++) {
      step(w, input, 1 / 60);
    }
    for (const q of w.player.ragdoll ? r.pts : []) {
      expect(Number.isFinite(q.x)).toBe(true);
      expect(q.y).toBeLessThanOrEqual(11.01);
    }
  });
});

describe('checkpoints', () => {
  it('activate when you glide over them, not only when walking past', () => {
    // Chapter 6's first totem sits where the glide over the first pool lands.
    const w = createWorld(LEVELS[5], VIEW);
    w.enemies = [];
    const input = createInput();
    input.right = true;
    for (let f = 0; f < 60 * 7; f++) {
      const jump = f >= 90;
      if (jump && !input.jump) {
        input.jumpPressed++;
      }
      input.jump = jump;
      step(w, input, 1 / 60);
    }
    expect(w.player.dead).toBe(false);
    expect(w.checkpoints[0].active).toBe(true);
  });
});
