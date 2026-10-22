// Procedural silhouette art. Everything is generated in tile units from
// deterministic hashes, so a level always looks the same.
import { LevelData } from '../game/types';

export function hash(x: number, y = 0) {
  const s = Math.sin(x * 127.1 + y * 311.7 + 0.5) * 43758.5453;
  return s - Math.floor(s);
}

const f = (n: number) => Math.round(n * 1000) / 1000;

// ------------------------------------------------------------- shapes

/** Smooth closed hill silhouette that tiles seamlessly every `width`. */
export function ridgePath(
  width: number,
  height: number,
  base: number,
  amp: number,
  seed: number,
  segments: number,
  jag = 0,
) {
  const pts: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const k = i % segments;
    const h =
      base -
      amp *
        (0.55 * hash(seed, k) +
          0.3 * Math.sin((k / segments) * Math.PI * 2 * 2 + seed) * 0.5 +
          0.3);
    pts.push([(i / segments) * width, h]);
  }
  let d = `M0 ${height} L0 ${f(pts[0][1])}`;
  for (let i = 0; i < segments; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;
    if (jag > 0) {
      // Rocky ridge: a sharp peak between points.
      const px = x0 + (x1 - x0) * (0.3 + hash(seed + 7, i) * 0.4);
      const py = Math.min(y0, y1) - jag * hash(seed + 3, i);
      d += ` L${f(px)} ${f(py)} L${f(x1)} ${f(y1)}`;
    } else {
      d += ` Q${f(x0)} ${f(y0)} ${f(mx)} ${f(my)}`;
    }
  }
  d += ` L${f(width)} ${f(pts[segments][1])} L${f(width)} ${height} Z`;
  return { d, pts };
}

/** Pine tree silhouette with its base at (x, y). */
export function pine(x: number, y: number, h: number, seed: number) {
  const w = h * 0.42;
  let d = `M${f(x - h * 0.03)} ${f(y)} L${f(x - h * 0.03)} ${f(y - h * 0.15)} `;
  const tiers = 5;
  // Left side going up, right side coming down.
  const left: string[] = [];
  const right: string[] = [];
  for (let i = 0; i < tiers; i++) {
    const t = i / tiers;
    const ty = y - h * (0.12 + t * 0.85);
    const tw = w * (1 - t * 0.8) * (0.85 + hash(seed, i) * 0.3);
    left.push(
      `L${f(x - tw / 2)} ${f(ty)} L${f(x - tw * 0.18)} ${f(ty - h * 0.12)}`,
    );
    right.unshift(
      `L${f(x + tw * 0.18)} ${f(ty - h * 0.12)} L${f(x + tw / 2)} ${f(ty)}`,
    );
  }
  d += left.join(' ');
  d += ` L${f(x)} ${f(y - h)} `;
  d += right.join(' ');
  d += ` L${f(x + h * 0.03)} ${f(y - h * 0.15)} L${f(x + h * 0.03)} ${f(y)} Z`;
  return d;
}

/** Gnarled broad tree: curved trunk, a few branches and a lumpy crown. */
export function oak(x: number, y: number, h: number, seed: number) {
  const lean = (hash(seed, 1) - 0.5) * h * 0.25;
  const tw = h * 0.07;
  const topX = x + lean;
  const topY = y - h * 0.55;
  let d =
    `M${f(x - tw * 1.6)} ${f(y)} Q${f(x - tw)} ${f(y - h * 0.2)} ${f(
      topX - tw * 0.6,
    )} ${f(topY)} ` +
    `L${f(topX + tw * 0.6)} ${f(topY)} Q${f(x + tw)} ${f(y - h * 0.2)} ${f(
      x + tw * 1.8,
    )} ${f(y)} Z`;
  // Branches.
  for (let i = 0; i < 3; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const by = y - h * (0.3 + i * 0.1);
    const bx = x + lean * ((y - by) / (h * 0.55));
    const ex = bx + side * h * (0.22 + hash(seed, i + 5) * 0.15);
    const ey = by - h * (0.15 + hash(seed, i + 9) * 0.1);
    d += ` M${f(bx)} ${f(by + tw)} Q${f((bx + ex) / 2)} ${f(by)} ${f(ex)} ${f(
      ey,
    )} L${f(ex + side * tw * 0.3)} ${f(ey + tw * 0.4)} Q${f((bx + ex) / 2)} ${f(
      by + tw * 1.4,
    )} ${f(bx)} ${f(by + tw * 2.2)} Z`;
  }
  // Crown made of overlapping blobs.
  const blobs = 7;
  for (let i = 0; i < blobs; i++) {
    const a = (i / blobs) * Math.PI - Math.PI;
    const r = h * (0.13 + hash(seed, i + 20) * 0.08);
    const cx = topX + Math.cos(a) * h * 0.26;
    const cy = topY - h * 0.1 + Math.sin(a) * h * 0.2;
    d += ` M${f(cx - r)} ${f(cy)} a${f(r)} ${f(r)} 0 1 0 ${f(r * 2)} 0 a${f(
      r,
    )} ${f(r)} 0 1 0 ${f(-r * 2)} 0 Z`;
  }
  return d;
}

/** A thin dead tree, all twigs. */
export function deadTree(x: number, y: number, h: number, seed: number) {
  const tw = h * 0.045;
  let d = `M${f(x - tw * 1.5)} ${f(y)} L${f(x - tw * 0.4)} ${f(y - h)} L${f(
    x + tw * 0.4,
  )} ${f(y - h)} L${f(x + tw * 1.5)} ${f(y)} Z`;
  for (let i = 0; i < 5; i++) {
    const side = hash(seed, i) > 0.5 ? 1 : -1;
    const by = y - h * (0.35 + i * 0.12);
    const len = h * (0.3 - i * 0.04);
    const ex = x + side * len;
    const ey = by - len * 0.6;
    d += ` M${f(x)} ${f(by)} L${f(ex)} ${f(ey)} L${f(ex + side * tw * 0.2)} ${f(
      ey + tw * 0.8,
    )} L${f(x)} ${f(by + tw * 1.6)} Z`;
  }
  return d;
}

/** Castle keep for the distant skyline. Returns body path and window rects. */
export function keep(x: number, base: number, h: number, seed: number) {
  const towers = 3 + Math.floor(hash(seed) * 3);
  let d = '';
  const windows: { x: number; y: number; w: number; h: number }[] = [];
  let cx = x;
  for (let i = 0; i < towers; i++) {
    const tw = h * (0.12 + hash(seed, i) * 0.1);
    const th = h * (0.45 + hash(seed, i + 10) * 0.55);
    const top = base - th;
    d += ` M${f(cx)} ${f(base)} L${f(cx)} ${f(top)} L${f(cx - tw * 0.1)} ${f(
      top,
    )} L${f(cx + tw / 2)} ${f(top - tw * 1.3)} L${f(cx + tw * 1.1)} ${f(
      top,
    )} L${f(cx + tw)} ${f(top)} L${f(cx + tw)} ${f(base)} Z`;
    if (hash(seed, i + 30) > 0.3) {
      windows.push({
        x: cx + tw * 0.38,
        y: top + th * 0.2,
        w: tw * 0.24,
        h: tw * 0.4,
      });
    }
    if (hash(seed, i + 40) > 0.55) {
      windows.push({
        x: cx + tw * 0.38,
        y: top + th * 0.5,
        w: tw * 0.24,
        h: tw * 0.4,
      });
    }
    cx += tw * (0.9 + hash(seed, i + 50) * 0.5);
    // Curtain wall with crenellations between towers.
    if (i < towers - 1) {
      const ww = tw * 0.8;
      const wy = base - h * 0.28;
      d += ` M${f(cx - tw * 0.2)} ${f(base)} L${f(cx - tw * 0.2)} ${f(wy)}`;
      const n = 4;
      for (let k = 0; k < n; k++) {
        const sx = cx - tw * 0.2 + (k * ww) / n;
        d += ` L${f(sx)} ${f(wy - h * 0.04)} L${f(sx + ww / n / 2)} ${f(
          wy - h * 0.04,
        )} L${f(sx + ww / n / 2)} ${f(wy)} L${f(sx + ww / n)} ${f(wy)}`;
      }
      d += ` L${f(cx + ww)} ${f(base)} Z`;
      cx += ww * 0.6;
    }
  }
  return { d, windows };
}

// ------------------------------------------------------------- terrain

export interface Piece {
  x0: number;
  x1: number;
  d: string;
}

export interface TerrainArt {
  trees: Piece[];
  body: Piece[];
  stones: Piece[];
  rimGlow: Piece[]; // soft light on top surfaces
  rimLine: Piece[];
  sideGlow: Piece[];
  grass: Piece[];
  roots: Piece[];
  spikes: Piece[];
  bridges: Piece[];
  ropes: Piece[];
  ice: Piece[];
  belts: (Piece & { y: number; dir: 1 | -1 })[];
  acid: Piece[];
}

/** Rock-like tiles: plain rock, ice and belts all draw as solid ground. */
const rock = (c: string) => c === '#' || c === 'I' || c === '>' || c === '<';

export function buildTerrainArt(level: LevelData): TerrainArt {
  const { tiles, width, height } = level;
  const at = (x: number, y: number) =>
    x < 0 || x >= width || y < 0 || y >= height ? ' ' : tiles[y][x];
  const solid = (x: number, y: number) =>
    x < 0 || x >= width
      ? y >= 0 && y < height && rock(tiles[y][x < 0 ? 0 : width - 1])
      : rock(at(x, y));

  const art: TerrainArt = {
    trees: [],
    body: [],
    stones: [],
    rimGlow: [],
    rimLine: [],
    sideGlow: [],
    grass: [],
    roots: [],
    spikes: [],
    bridges: [],
    ropes: [],
    ice: [],
    belts: [],
    acid: [],
  };

  // Body: one rect per horizontal run (merging rows keeps paths small).
  for (let y = 0; y < height; y++) {
    let s = -1;
    for (let x = 0; x <= width; x++) {
      const on = x < width && rock(at(x, y));
      if (on && s < 0) {
        s = x;
      } else if (!on && s >= 0) {
        art.body.push({
          x0: s,
          x1: x,
          d: `M${s - 0.01} ${y - 0.01} H${x + 0.01} V${y + 1.01} H${
            s - 0.01
          } Z`,
        });
        s = -1;
      }
    }
  }

  // Top surfaces: rim light, grass, decorations.
  for (let y = 0; y < height; y++) {
    let s = -1;
    for (let x = 0; x <= width; x++) {
      const top = x < width && solid(x, y) && !solid(x, y - 1);
      if (top && s < 0) {
        s = x;
      } else if (!top && s >= 0) {
        surface(art, s, x, y, at, level.theme);
        s = -1;
      }
    }
  }

  // Exposed sides: faint light and chipped rock edges.
  for (let x = 0; x < width; x++) {
    for (const side of [-1, 1]) {
      let s = -1;
      for (let y = 0; y <= height; y++) {
        const exposed =
          y < height &&
          solid(x, y) &&
          !solid(x + side, y) &&
          at(x + side, y) !== 'C';
        if (exposed && s < 0) {
          s = y;
        } else if (!exposed && s >= 0) {
          const ex = side > 0 ? x + 1 : x;
          let d = `M${ex} ${s}`;
          for (let yy = s; yy < y; yy += 0.5) {
            const out = 0.03 + hash(x * 3 + side, yy * 7) * 0.09;
            d += ` L${f(ex + side * out)} ${f(yy + 0.25)} L${ex} ${f(
              yy + 0.5,
            )}`;
          }
          d += ' Z';
          art.body.push({ x0: x - 1, x1: x + 2, d });
          art.sideGlow.push({
            x0: x - 1,
            x1: x + 2,
            d: `M${ex} ${s + 0.1} V${y}`,
          });
          s = -1;
        }
      }
    }
  }

  // Undersides: hanging roots and drips.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!solid(x, y) || solid(x, y + 1) || y + 1 >= height) {
        continue;
      }
      if (at(x, y + 1) !== ' ') {
        continue;
      }
      const r = hash(x, y + 50);
      if (r > 0.45) {
        const len = 0.25 + hash(x + 9, y) * 0.75;
        const rx = x + 0.2 + hash(x, y + 3) * 0.6;
        const sway = (hash(x + 1, y + 1) - 0.5) * 0.4;
        art.roots.push({
          x0: x - 1,
          x1: x + 2,
          d: `M${f(rx)} ${y + 1} Q${f(rx + sway)} ${f(y + 1 + len * 0.6)} ${f(
            rx - sway * 0.5,
          )} ${f(y + 1 + len)}`,
        });
      }
      // Stalactite drip.
      if (hash(x + 77, y) > 0.6) {
        const dx = x + 0.15 + hash(x, y + 9) * 0.6;
        const dl = 0.15 + hash(x + 4, y + 2) * 0.3;
        art.body.push({
          x0: x,
          x1: x + 1,
          d: `M${f(dx - 0.08)} ${y + 1} L${f(dx)} ${f(y + 1 + dl)} L${f(
            dx + 0.08,
          )} ${y + 1} Z`,
        });
      }
    }
  }

  // Stone texture deep inside the rock.
  for (let y = 1; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!solid(x, y) || !solid(x, y - 1) || hash(x + 13, y + 29) < 0.72) {
        continue;
      }
      const cx = x + 0.2 + hash(x, y) * 0.6;
      const cy = y + 0.2 + hash(y, x) * 0.6;
      const rw = 0.18 + hash(x + 2, y) * 0.25;
      const rh = 0.1 + hash(x, y + 2) * 0.14;
      art.stones.push({
        x0: x - 1,
        x1: x + 2,
        d: `M${f(cx - rw)} ${f(cy)} Q${f(cx - rw)} ${f(cy - rh)} ${f(cx)} ${f(
          cy - rh,
        )} Q${f(cx + rw)} ${f(cy - rh)} ${f(cx + rw)} ${f(cy)} Q${f(
          cx + rw,
        )} ${f(cy + rh)} ${f(cx)} ${f(cy + rh)} Q${f(cx - rw)} ${f(
          cy + rh,
        )} ${f(cx - rw)} ${f(cy)} Z`,
      });
    }
  }

  // Spikes: clusters of thin iron thorns.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const c = at(x, y);
      if (c !== '^' && c !== 'v') {
        continue;
      }
      const up = c === '^';
      let d = '';
      const n = 4;
      for (let i = 0; i < n; i++) {
        const sx = x + 0.06 + (i * 0.88) / n;
        const sw = 0.88 / n;
        const sh = 0.45 + hash(x * 5 + i, y) * 0.18;
        if (up) {
          d += ` M${f(sx)} ${y + 1} L${f(sx + sw / 2)} ${f(y + 1 - sh)} L${f(
            sx + sw,
          )} ${y + 1} Z`;
        } else {
          d += ` M${f(sx)} ${y} L${f(sx + sw / 2)} ${f(y + sh)} L${f(
            sx + sw,
          )} ${y} Z`;
        }
      }
      art.spikes.push({ x0: x, x1: x + 1, d });
    }
  }

  // One-way ledges: rope bridges / plank shelves.
  for (let y = 0; y < height; y++) {
    let s = -1;
    for (let x = 0; x <= width; x++) {
      const on = x < width && at(x, y) === '-';
      if (on && s < 0) {
        s = x;
      } else if (!on && s >= 0) {
        let d = '';
        for (let px = s; px < x; px += 0.34) {
          const pw = Math.min(0.3, x - px);
          const tilt = (hash(px * 9, y) - 0.5) * 0.03;
          d += ` M${f(px)} ${f(y + tilt)} H${f(px + pw)} V${f(
            y + 0.16 - tilt,
          )} H${f(px)} Z`;
        }
        // Support posts.
        d += ` M${s + 0.08} ${y} h0.1 v0.9 h-0.1 Z M${
          x - 0.18
        } ${y} h0.1 v0.9 h-0.1 Z`;
        art.bridges.push({ x0: s, x1: x, d });
        art.ropes.push({
          x0: s,
          x1: x,
          d: `M${s + 0.13} ${y - 0.35} Q${(s + x) / 2} ${y + 0.05} ${
            x - 0.13
          } ${y - 0.35}`,
        });
        s = -1;
      }
    }
  }

  for (let y = 0; y < height; y++) {
    let s = -1;
    let kind = '';
    for (let x = 0; x <= width; x++) {
      const c = x < width ? at(x, y) : '';
      const k = c === 'I' || c === '>' || c === '<' || c === '~' ? c : '';
      if (k !== kind) {
        if (kind && s >= 0) {
          if (kind === 'I') {
            art.ice.push({
              x0: s,
              x1: x,
              d: `M${s} ${y} H${x} V${y + 0.22} H${s} Z`,
            });
          } else if (kind === '~') {
            art.acid.push({
              x0: s,
              x1: x,
              d: `M${s} ${y + 0.3} H${x} V${y + 1.02} H${s} Z`,
            });
          } else {
            art.belts.push({
              x0: s,
              x1: x,
              y,
              dir: kind === '>' ? 1 : -1,
              d: '',
            });
          }
        }
        kind = k;
        s = x;
      }
    }
  }

  return art;
}

function surface(
  art: TerrainArt,
  x0: number,
  x1: number,
  y: number,
  at: (x: number, y: number) => string,
  theme: LevelData['theme'],
) {
  art.rimGlow.push({ x0, x1, d: `M${x0} ${y} H${x1} V${y + 0.9} H${x0} Z` });
  art.rimLine.push({ x0, x1, d: `M${x0} ${y + 0.02} H${x1}` });

  // Grass blades. Skip where spikes sit so they stay readable.
  let d = '';
  for (let gx = x0; gx < x1; gx += 0.07) {
    const cell = Math.floor(gx);
    if (at(cell, y - 1) === '^' || at(cell, y) !== '#') {
      continue;
    }
    const r = hash(gx * 31, y);
    const h = 0.06 + r * r * 0.32;
    const bend = (hash(gx * 17, y + 3) - 0.5) * 0.18;
    d += ` M${f(gx - 0.035)} ${f(y + 0.04)} Q${f(gx + bend * 0.3)} ${f(
      y - h * 0.5,
    )} ${f(gx + bend)} ${f(y - h)} Q${f(gx + 0.01)} ${f(y - h * 0.4)} ${f(
      gx + 0.045,
    )} ${f(y + 0.04)} Z`;
  }
  // Bushes and rocks.
  for (let cx = x0 + 0.5; cx < x1 - 0.5; cx += 1) {
    const cell = Math.floor(cx);
    if (at(cell, y - 1) !== ' ' || at(cell, y) !== '#') {
      continue;
    }
    const r = hash(cx * 3, y + 11);
    if (r > 0.82) {
      const bw = 0.25 + hash(cx, y) * 0.25;
      for (let k = 0; k < 3; k++) {
        const bx = cx - bw + k * bw;
        const br = bw * (0.7 + hash(cx + k, y) * 0.5);
        d += ` M${f(bx - br)} ${y + 0.05} a${f(br)} ${f(br)} 0 0 1 ${f(
          br * 2,
        )} 0 Z`;
      }
    } else if (r > 0.72) {
      const rw = 0.2 + hash(cx, y + 5) * 0.2;
      d += ` M${f(cx - rw)} ${y + 0.05} Q${f(cx - rw)} ${f(y - rw * 0.8)} ${f(
        cx,
      )} ${f(y - rw * 0.9)} Q${f(cx + rw * 1.2)} ${f(y - rw * 0.6)} ${f(
        cx + rw,
      )} ${y + 0.05} Z`;
    }
  }
  art.grass.push({ x0: x0 - 0.5, x1: x1 + 0.5, d });

  // Background trees where there is open sky above.
  const len = x1 - x0;
  for (let tx = x0 + 1; tx < x1 - 1; tx += 3) {
    const cell = Math.floor(tx);
    let open = true;
    for (let k = 1; k <= 4; k++) {
      if (
        at(cell, y - k) !== ' ' ||
        at(cell - 1, y - k) !== ' ' ||
        at(cell + 1, y - k) !== ' '
      ) {
        open = false;
      }
    }
    if (!open || len < 3 || hash(tx * 7, y + 19) < 0.55) {
      continue;
    }
    const kind = hash(tx, y + 23);
    const h = 2.4 + hash(tx * 2, y) * 2.2;
    const px = tx + hash(tx, y + 2) * 0.8;
    if (theme === 'foundry' && kind > 0.25) {
      continue; // the forge is mostly bare iron
    }
    let d2: string;
    if (theme === 'marsh') {
      d2 =
        kind > 0.5
          ? willow(px, y + 0.1, h, tx)
          : kind > 0.2
          ? deadTree(px, y + 0.1, h * 0.9, tx)
          : reeds(px, y + 0.1, h * 0.45, tx);
    } else if (theme === 'dawn') {
      d2 =
        kind > 0.4
          ? spire(px - h * 0.05, y + 0.1, h * 1.1, tx).d
          : oak(px, y + 0.1, h * 0.8, tx);
    } else {
      d2 =
        kind > 0.66
          ? pine(px, y + 0.1, h, tx)
          : kind > 0.3
          ? oak(px, y + 0.1, h, tx)
          : deadTree(px, y + 0.1, h * 0.8, tx);
    }
    art.trees.push({ x0: px - h * 0.6, x1: px + h * 0.6, d: d2 });
  }
}

// ------------------------------------------------------------- act scenery

/** Thin curved reeds rising from (x, y). */
export function reeds(x: number, y: number, h: number, seed: number) {
  let d = '';
  const n = 4 + Math.floor(hash(seed, 1) * 4);
  for (let i = 0; i < n; i++) {
    const bx = x + (i - n / 2) * h * 0.05;
    const bh = h * (0.6 + hash(seed, i) * 0.4);
    const bend = (hash(seed, i + 9) - 0.5) * h * 0.35;
    const w = h * 0.018;
    d += ` M${f(bx - w)} ${f(y)} Q${f(bx + bend * 0.4)} ${f(y - bh * 0.6)} ${f(
      bx + bend,
    )} ${f(y - bh)} Q${f(bx + bend * 0.4 + w)} ${f(y - bh * 0.6)} ${f(
      bx + w,
    )} ${f(y)} Z`;
    if (hash(seed, i + 20) > 0.6) {
      // Cattail head.
      const cx = bx + bend * 0.85;
      const cy = y - bh * 0.88;
      d += ` M${f(cx - w * 1.6)} ${f(cy)} h${f(w * 3.2)} v${f(bh * 0.14)} h${f(
        -w * 3.2,
      )} Z`;
    }
  }
  return d;
}

/** Weeping willow: stout trunk, crown, and hanging strands. */
export function willow(x: number, y: number, h: number, seed: number) {
  let d = oak(x, y, h * 0.85, seed);
  const crownY = y - h * 0.62;
  for (let i = 0; i < 9; i++) {
    const sx = x + (i - 4) * h * 0.07;
    const len = h * (0.3 + hash(seed, i + 30) * 0.25);
    const w = h * 0.012;
    d += ` M${f(sx - w)} ${f(crownY)} Q${f(sx + w * 4)} ${f(
      crownY + len * 0.5,
    )} ${f(sx)} ${f(crownY + len)} Q${f(sx + w * 5)} ${f(
      crownY + len * 0.5,
    )} ${f(sx + w)} ${f(crownY)} Z`;
  }
  return d;
}

/** Factory smokestack with a lit window band; returns path and windows. */
export function stack(x: number, base: number, h: number, seed: number) {
  const w = h * (0.1 + hash(seed, 2) * 0.05);
  const top = base - h;
  let d = `M${f(x)} ${f(base)} L${f(x + w * 0.12)} ${f(top)} H${f(
    x + w * 0.88,
  )} L${f(x + w)} ${f(base)} Z`;
  // Lip and bands.
  d += ` M${f(x - w * 0.08)} ${f(top)} h${f(w * 1.16)} v${f(h * 0.04)} h${f(
    -w * 1.16,
  )} Z`;
  d += ` M${f(x - w * 0.05)} ${f(top + h * 0.35)} h${f(w * 1.1)} v${f(
    h * 0.03,
  )} h${f(-w * 1.1)} Z`;
  const windows = [
    { x: x + w * 0.3, y: top + h * 0.5, w: w * 0.4, h: h * 0.05 },
  ];
  return { d, windows, smoke: { x: x + w / 2, y: top } };
}

/** Gear silhouette with `n` teeth and a hollow hub. */
export function gear(cx: number, cy: number, r: number, n: number) {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2;
    const rr = i % 2 === 0 ? r : r * 0.82;
    const a2 = a + Math.PI / (n * 2);
    d += `${i === 0 ? 'M' : 'L'}${f(cx + Math.cos(a) * rr)} ${f(
      cy + Math.sin(a) * rr,
    )} L${f(cx + Math.cos(a2) * rr)} ${f(cy + Math.sin(a2) * rr)} `;
  }
  d += 'Z';
  // Hub hole (drawn counter-clockwise so the even-odd fill leaves it empty).
  const hr = r * 0.25;
  d += ` M${f(cx + hr)} ${f(cy)} A${f(hr)} ${f(hr)} 0 1 0 ${f(cx - hr)} ${f(
    cy,
  )} A${f(hr)} ${f(hr)} 0 1 0 ${f(cx + hr)} ${f(cy)} Z`;
  return d;
}

/** Industrial pipe run: a horizontal pipe with flanges and a riser. */
export function pipes(
  x: number,
  y: number,
  len: number,
  t: number,
  seed: number,
) {
  let d = `M${f(x)} ${f(y)} h${f(len)} v${f(t)} h${f(-len)} Z`;
  for (let k = 0; k <= 3; k++) {
    const fx = x + (len * k) / 3;
    d += ` M${f(fx - t * 0.2)} ${f(y - t * 0.25)} h${f(t * 0.4)} v${f(
      t * 1.5,
    )} h${f(-t * 0.4)} Z`;
  }
  const rx = x + len * (0.3 + hash(seed, 3) * 0.4);
  d += ` M${f(rx)} ${f(y)} v${f(-t * 6)} h${f(t)} v${f(t * 6)} Z`;
  return d;
}

/** Slender spire with a bulb and a needle tip; returns path and tip light. */
export function spire(x: number, base: number, h: number, seed: number) {
  const w = h * (0.07 + hash(seed, 1) * 0.04);
  const top = base - h;
  let d = `M${f(x)} ${f(base)} L${f(x + w * 0.15)} ${f(top + h * 0.25)} L${f(
    x + w * 0.85,
  )} ${f(top + h * 0.25)} L${f(x + w)} ${f(base)} Z`;
  // Bulb dome.
  const cx = x + w / 2;
  const by = top + h * 0.25;
  d += ` M${f(x - w * 0.1)} ${f(by)} Q${f(x - w * 0.15)} ${f(
    by - h * 0.12,
  )} ${f(cx)} ${f(by - h * 0.16)} Q${f(x + w * 1.15)} ${f(by - h * 0.12)} ${f(
    x + w * 1.1,
  )} ${f(by)} Z`;
  // Needle.
  d += ` M${f(cx - w * 0.08)} ${f(by - h * 0.15)} L${f(cx)} ${f(top)} L${f(
    cx + w * 0.08,
  )} ${f(by - h * 0.15)} Z`;
  const windows =
    hash(seed, 7) > 0.3
      ? [{ x: cx - w * 0.12, y: by + h * 0.12, w: w * 0.24, h: h * 0.06 }]
      : [];
  return { d, windows, tip: { x: cx, y: top } };
}

/** Billowing cloud bank across the full width (tiles seamlessly). */
export function cloudBank(
  width: number,
  base: number,
  height: number,
  seed: number,
) {
  let d = `M0 ${f(height)} L0 ${f(base)}`;
  let x = 0;
  let i = 0;
  while (x < width) {
    const r = width * (0.04 + hash(seed, i) * 0.05);
    const nx = Math.min(width, x + r * 1.6);
    d += ` A${f(r)} ${f(r * 0.8)} 0 0 1 ${f(nx)} ${f(base)}`;
    x = nx;
    i++;
  }
  d += ` L${f(width)} ${f(height)} Z`;
  return d;
}
