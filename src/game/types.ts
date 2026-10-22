import { Theme } from './story';

// 'c' moves in a circle (a mace on a chain): range is the radius.
export type Axis = 'x' | 'y' | 'c';

export type EntitySpec =
  | { kind: 'start'; x: number; y: number }
  | { kind: 'exit'; x: number; y: number }
  | { kind: 'shard'; x: number; y: number }
  | { kind: 'mask'; x: number; y: number }
  | { kind: 'checkpoint'; x: number; y: number }
  | { kind: 'guard'; x: number; y: number }
  | { kind: 'wisp'; x: number; y: number }
  | { kind: 'spring'; x: number; y: number }
  | { kind: 'archer'; x: number; y: number }
  | { kind: 'turret'; x: number; y: number }
  | { kind: 'brute'; x: number; y: number }
  | { kind: 'moth'; x: number; y: number; range: number }
  | { kind: 'boss'; x: number; y: number }
  | { kind: 'heart'; x: number; y: number }
  | { kind: 'key'; x: number; y: number }
  | { kind: 'cloak'; x: number; y: number }
  | { kind: 'ring'; x: number; y: number }
  | { kind: 'dropper'; x: number; y: number }
  | { kind: 'fan'; x: number; y: number; h: number }
  | { kind: 'rift'; x: number; y: number; link: number }
  | {
      kind: 'crusher';
      x: number;
      y: number;
      w: number;
      drop: number;
      period: number;
      phase: number;
    }
  | {
      kind: 'saw';
      x: number;
      y: number;
      axis: Axis;
      range: number;
      speed: number;
    }
  | {
      kind: 'beam';
      x: number;
      y: number;
      on: number;
      off: number;
      phase: number;
    }
  | {
      kind: 'mover';
      x: number;
      y: number;
      w: number;
      axis: Axis;
      range: number;
      speed: number;
    };

export interface LevelData {
  id: number;
  name: string;
  subtitle: string;
  theme: Theme;
  width: number;
  height: number;
  tiles: string[];
  entities: EntitySpec[];
}

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  dash: boolean;
  throw: boolean;
  // Rising-edge counters, consumed by the engine.
  jumpPressed: number;
  dashPressed: number;
  throwPressed: number;
}

export type PlayerAnim =
  | 'idle'
  | 'run'
  | 'jump'
  | 'fall'
  | 'wall'
  | 'dash'
  | 'skid'
  | 'land'
  | 'glide'
  | 'hook';

/** A Verlet point: current and previous position. */
export interface Pt {
  x: number;
  y: number;
  px: number;
  py: number;
}

export interface Ragdoll {
  // head, neck, hip, front hand, back hand, front foot, back foot
  pts: Pt[];
  sticks: [number, number, number][];
}

export interface Player {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  onGround: boolean;
  jumpsLeft: number;
  coyote: number;
  jumpBuffer: number;
  jumpHeld: boolean;
  noJumpCut: boolean;
  wallDir: -1 | 0 | 1;
  wallLock: number;
  // Wall we are climbing: after each hop the player drifts back onto it.
  climbDir: -1 | 0 | 1;
  climbT: number;
  dashTime: number;
  dashCd: number;
  dashDir: 1 | -1;
  airDash: boolean;
  throwCd: number;
  ammo: number;
  ammoTimer: number;
  hp: number;
  invuln: number;
  dead: boolean;
  deadTimer: number;
  riding: number;
  anim: PlayerAnim;
  animT: number;
  // Body physics (mostly visual).
  scarf: Pt[];
  squash: number; // >0 stretched tall, <0 squashed flat
  squashV: number;
  tilt: number; // degrees, world space, positive leans right
  prevVx: number;
  landT: number; // recovering from a hard landing
  skidding: boolean;
  ragdoll: Ragdoll | null;
  // Tools.
  gliding: boolean;
  hook: { ring: number; len: number } | null;
  hookCd: number;
  riftCd: number;
  surface: string; // tile under the feet: ' ', 'I' (ice), '>' or '<' (belts)
}

export interface Enemy {
  id: number;
  kind: 'guard' | 'wisp' | 'archer' | 'turret' | 'brute' | 'moth';
  x: number;
  y: number;
  w: number;
  h: number;
  dir: 1 | -1;
  state: 'patrol' | 'aim' | 'cool' | 'float' | 'chase' | 'charge';
  hp: number;
  range: number;
  hitT: number;
  aimX: number; // where a turret is looking (unit vector)
  aimY: number;
  timer: number;
  homeX: number;
  homeY: number;
  alive: boolean;
  t: number;
}

export interface Saw {
  id: number;
  x: number;
  y: number;
  ox: number;
  oy: number;
  r: number;
  axis: Axis;
  range: number;
  speed: number;
  t: number;
}

export interface Beam {
  id: number;
  x: number;
  y0: number;
  y1: number;
  on: number;
  off: number;
  t: number;
  active: boolean;
  warning: boolean;
}

export interface Mover {
  id: number;
  x: number;
  y: number;
  ox: number;
  oy: number;
  w: number;
  axis: Axis;
  range: number;
  speed: number;
  t: number;
  dx: number;
  dy: number;
  vx: number;
  vy: number;
}

export interface Projectile {
  id: number;
  owner: 'player' | 'enemy';
  x: number;
  y: number;
  vx: number;
  vy: number;
  g: number; // gravity: arrows arc, bolts fly straight
  r: number;
  life: number;
}

export interface Pickup {
  id: number;
  kind: 'shard' | 'mask' | 'heart' | 'key' | 'cloak';
  x: number;
  y: number;
  taken: boolean;
}

export interface Checkpoint {
  id: number;
  x: number;
  y: number;
  active: boolean;
}

export interface Spring {
  id: number;
  x: number;
  y: number;
  t: number;
}

export interface Crusher {
  id: number;
  x: number;
  y0: number; // resting top
  w: number;
  drop: number;
  period: number;
  t: number;
  y: number; // current top
  falling: boolean;
}

export interface Fan {
  id: number;
  x: number;
  y: number; // base (top of the fan housing)
  h: number; // how far the wind reaches upward
}

export interface Dropper {
  id: number;
  x: number;
  y: number;
  oy: number;
  vy: number;
  state: 'hang' | 'shake' | 'fall' | 'gone';
  timer: number;
}

export interface Rift {
  id: number;
  x: number;
  y: number;
  link: number;
}

export interface Ring {
  id: number;
  x: number;
  y: number;
}

export interface Boss {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  max: number;
  phase: number;
  state: 'intro' | 'float' | 'volley' | 'sweep' | 'dive' | 'recover' | 'dead';
  timer: number;
  t: number;
  hitT: number;
  shots: number;
  sweepX: number;
  sweepDir: number;
  arenaX0: number;
  arenaX1: number;
  floorY: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  gravity: number;
}

export interface CrumbleState {
  timer: number; // >0 shaking, counting down to break
  broken: number; // >0 seconds until it reforms
}

export interface World {
  level: LevelData;
  grid: string[][];
  crumbles: Map<number, CrumbleState>;
  player: Player;
  enemies: Enemy[];
  saws: Saw[];
  beams: Beam[];
  movers: Mover[];
  projectiles: Projectile[];
  pickups: Pickup[];
  checkpoints: Checkpoint[];
  springs: Spring[];
  crushers: Crusher[];
  fans: Fan[];
  droppers: Dropper[];
  rifts: Rift[];
  rings: Ring[];
  boss: Boss | null;
  particles: Particle[];
  exit: { x: number; y: number };
  respawn: { x: number; y: number };
  camera: { x: number; y: number };
  view: { w: number; h: number };
  shake: number;
  time: number;
  shards: number;
  shardsTotal: number;
  mask: boolean;
  keys: number;
  cleared: number; // doors and cracked walls opened so far
  events: string[]; // sound cues raised this frame, drained by the screen
  cloakT: number;
  abilities: { glide: boolean; hook: boolean };
  deaths: number;
  kills: number;
  status: 'playing' | 'exiting' | 'won';
  exitTimer: number;
  nextId: number;
  accumulator: number;
}
