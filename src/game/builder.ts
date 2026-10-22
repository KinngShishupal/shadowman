import { CHAPTERS, themeOf } from './story';
import { Axis, EntitySpec, LevelData } from './types';

/*
 * Tiles:
 *   '#' rock         '-' one-way ledge   'C' crumbling block
 *   '^' floor spikes 'v' ceiling spikes  ' ' empty
 *   'I' ice (slick, can't be climbed)    '>' '<' conveyor belts
 *   '~' liquid lumen (deadly)            'D' sealed door (needs a key)
 *   'B' cracked block (dash or bolt it)
 * Coordinates are tile cells, y grows downward, height is 14 rows.
 * Something "standing" on ground whose top is row 11 sits in row 10.
 */
export class LevelBuilder {
  private grid: string[][];
  private ents: EntitySpec[] = [];
  private links = 0;

  constructor(private id: number, private width: number, private height = 14) {
    this.grid = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => ' '),
    );
  }

  fill(x0: number, y0: number, x1: number, y1: number, ch = '#') {
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        if (x >= 0 && y >= 0 && x < this.width && y < this.height) {
          this.grid[y][x] = ch;
        }
      }
    }
    return this;
  }
  ground(x0: number, x1: number, top: number) {
    return this.fill(x0, top, x1, this.height - 1);
  }
  ledge(x0: number, x1: number, y: number) {
    return this.fill(x0, y, x1, y, '-');
  }
  spikes(x0: number, x1: number, y: number) {
    return this.fill(x0, y, x1, y, '^');
  }
  ceilSpikes(x0: number, x1: number, y: number) {
    return this.fill(x0, y, x1, y, 'v');
  }
  crumble(x0: number, x1: number, y: number) {
    return this.fill(x0, y, x1, y, 'C');
  }
  /** Ground whose surface is ice. */
  ice(x0: number, x1: number, top: number) {
    this.ground(x0, x1, top);
    return this.fill(x0, top, x1, top, 'I');
  }
  /** A slick ice wall: the one surface you can't climb. */
  iceWall(x: number, y0: number, y1: number) {
    return this.fill(x, y0, x, y1, 'I');
  }
  belt(x0: number, x1: number, top: number, dir: '>' | '<') {
    this.ground(x0, x1, top);
    return this.fill(x0, top, x1, top, dir);
  }
  /** Floating belt platform one tile thick. */
  beltPlatform(x0: number, x1: number, y: number, dir: '>' | '<') {
    return this.fill(x0, y, x1, y, dir);
  }
  /** A pool of liquid lumen with rock beneath it. */
  acid(x0: number, x1: number, surface = 11) {
    this.fill(x0, surface, x1, surface, '~');
    return this.fill(x0, surface + 1, x1, this.height - 1);
  }
  /** A sealed doorway: door tiles from y0 to the floor, rock above. */
  door(x: number, y0: number, floor = 11, w = 2) {
    this.fill(x, 0, x + w - 1, y0 - 1);
    return this.fill(x, y0, x + w - 1, floor - 1, 'D');
  }
  cracked(x0: number, y0: number, x1: number, y1: number) {
    return this.fill(x0, y0, x1, y1, 'B');
  }
  /** Full-height wall nothing can climb over (the world has a roof). */
  barrier(x0: number, x1: number, floor = 11) {
    return this.fill(x0, 0, x1, floor - 1);
  }

  private add(e: EntitySpec) {
    this.ents.push(e);
    return this;
  }
  start(x: number, y: number) {
    return this.add({ kind: 'start', x, y });
  }
  exit(x: number, y: number) {
    return this.add({ kind: 'exit', x, y });
  }
  shard(x: number, y: number) {
    return this.add({ kind: 'shard', x, y });
  }
  shards(x0: number, x1: number, y: number, step = 2) {
    for (let x = x0; x <= x1; x += step) {
      this.shard(x, y);
    }
    return this;
  }
  mask(x: number, y: number) {
    return this.add({ kind: 'mask', x, y });
  }
  check(x: number, y: number) {
    return this.add({ kind: 'checkpoint', x, y });
  }
  guard(x: number, y: number) {
    return this.add({ kind: 'guard', x, y });
  }
  wisp(x: number, y: number) {
    return this.add({ kind: 'wisp', x, y });
  }
  archer(x: number, y: number) {
    return this.add({ kind: 'archer', x, y });
  }
  turret(x: number, y: number) {
    return this.add({ kind: 'turret', x, y });
  }
  brute(x: number, y: number) {
    return this.add({ kind: 'brute', x, y });
  }
  moth(x: number, y: number, range: number) {
    return this.add({ kind: 'moth', x, y, range });
  }
  boss(x: number, y: number) {
    return this.add({ kind: 'boss', x, y });
  }
  heart(x: number, y: number) {
    return this.add({ kind: 'heart', x, y });
  }
  key(x: number, y: number) {
    return this.add({ kind: 'key', x, y });
  }
  cloak(x: number, y: number) {
    return this.add({ kind: 'cloak', x, y });
  }
  ring(x: number, y: number) {
    return this.add({ kind: 'ring', x, y });
  }
  rings(x0: number, x1: number, y: number, step: number) {
    for (let x = x0; x <= x1; x += step) {
      this.ring(x, y);
    }
    return this;
  }
  dropper(x: number, y: number) {
    return this.add({ kind: 'dropper', x, y });
  }
  /** Updraft fan two tiles wide; `h` is how high the wind reaches. */
  fan(x: number, y: number, h: number) {
    return this.add({ kind: 'fan', x, y, h });
  }
  /** Two linked rifts. */
  rift(x0: number, y0: number, x1: number, y1: number) {
    const link = ++this.links;
    this.add({ kind: 'rift', x: x0, y: y0, link });
    return this.add({ kind: 'rift', x: x1, y: y1, link });
  }
  crusher(x: number, y: number, drop: number, period = 2.4, phase = 0, w = 2) {
    return this.add({ kind: 'crusher', x, y, w, drop, period, phase });
  }
  spring(x: number, y: number) {
    return this.add({ kind: 'spring', x, y });
  }
  saw(x: number, y: number, axis: Axis, range: number, speed: number) {
    return this.add({ kind: 'saw', x, y, axis, range, speed });
  }
  /** Spiked mace circling a pivot; negative speed turns the other way. */
  mace(x: number, y: number, radius: number, speed: number) {
    return this.add({ kind: 'saw', x, y, axis: 'c', range: radius, speed });
  }
  beam(x: number, y: number, on: number, off: number, phase = 0) {
    return this.add({ kind: 'beam', x, y, on, off, phase });
  }
  mover(
    x: number,
    y: number,
    w: number,
    axis: Axis,
    range: number,
    speed: number,
  ) {
    return this.add({ kind: 'mover', x, y, w, axis, range, speed });
  }

  build(): LevelData {
    const info = CHAPTERS[this.id];
    return {
      id: this.id,
      name: info.name,
      subtitle: info.subtitle,
      theme: themeOf(this.id),
      width: this.width,
      height: this.height,
      tiles: this.grid.map(r => r.join('')),
      entities: this.ents,
    };
  }
}
