// All world units are in tiles. The renderer multiplies by the tile size in pixels.

export const PHYS = {
  gravity: 38,
  maxFall: 18,
  runSpeed: 7.5,
  groundAccel: 60,
  groundFriction: 48,
  skidDecel: 75,
  hardLanding: 15.5,
  airAccel: 36,
  jumpVel: 14.5,
  doubleJumpVel: 12.5,
  jumpCut: 0.45,
  coyoteTime: 0.1,
  jumpBuffer: 0.12,
  wallSlideMax: 3,
  wallJumpVx: 8,
  wallJumpVy: 13,
  wallJumpLock: 0.16,
  climbVy: 13,
  climbPushOff: 1.5,
  climbLock: 0.06,
  climbStick: 0.4,
  dashSpeed: 22,
  dashTime: 0.16,
  dashCooldown: 0.55,
  springVel: 21,
  stompBounce: 11,
};

export const PLAYER = {
  w: 0.6,
  h: 0.9,
  maxHp: 3,
  maxAmmo: 5,
  ammoRegen: 2.5,
  throwCooldown: 0.28,
  boltSpeed: 16,
  invuln: 1.1,
  respawnDelay: 1.4,
};

export const ENEMY = {
  guardSpeed: 1.6,
  guardSight: 8,
  guardAim: 0.55,
  guardCool: 1.2,
  lightBoltSpeed: 9,
  wispSpeed: 2.2,
  wispRange: 7,
  archerRange: 12,
  archerAim: 0.7,
  archerCool: 2.2,
  arrowGravity: 14,
  turretRange: 10,
  turretCool: 1.7,
  turretBolt: 7.5,
  bruteSpeed: 1.3,
  bruteCharge: 6.5,
  bruteSight: 7,
  mothSpeed: 2.6,
  bossHp: 24,
};

export const TOOLS = {
  glideFall: 2.0,
  hookRange: 4.6,
  hookSwing: 16,
  hookRelease: 4,
  fanLift: 48,
  fanGlideLift: 24,
  fanMaxRise: 9,
  conveyor: 3.2,
  iceGrip: 0.3,
  riftCooldown: 0.7,
  cloakTime: 8,
};

export const FIXED_DT = 1 / 120;
export const VIEW_ROWS = 11;

// Palette: moonlit violet dusk with teal "umbral" glow. Deliberately different
// from the orange sunset look of other silhouette platformers.
export const COLORS = {
  skyTop: '#120a2a',
  skyMid: '#2b1650',
  skyLow: '#5a2a6e',
  horizon: '#b0487a',
  moon: '#f4e9ff',
  moonGlow: 'rgba(214, 186, 255, 0.18)',
  farHills: '#24123d',
  midHills: '#170b2b',
  ground: '#07030f',
  rim: '#8f6bff',
  rimSoft: 'rgba(143, 107, 255, 0.35)',
  umbral: '#3ef0d0',
  umbralSoft: 'rgba(62, 240, 208, 0.25)',
  lumen: '#ffd36b',
  lumenSoft: 'rgba(255, 211, 107, 0.28)',
  danger: '#ff4d6d',
  text: '#efe6ff',
  textDim: '#a898c8',
  panel: 'rgba(12, 6, 26, 0.92)',
};
