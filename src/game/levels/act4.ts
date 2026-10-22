import { LevelBuilder } from '../builder';

// Act IV: The Dawn Spire. Everything learned so far, mixed and sharpened,
// ending in the duel with Solenne.

export function chapter16() {
  // Dawnward Stair: stairs, crumbling walkways, moving slabs, turrets.
  const b = new LevelBuilder(15, 150);
  b.start(2, 10).ground(0, 12, 11).shards(4, 10, 10, 3);
  b.fill(13, 9, 16, 13).fill(17, 7, 20, 13).fill(21, 5, 24, 13).turret(23, 4);
  b.ground(25, 36, 12).spikes(25, 36, 11);
  b.crumble(26, 29, 5).crumble(32, 35, 5).shard(27, 4).shard(34, 4);
  b.ground(37, 52, 4)
    .check(38, 3)
    .wisp(46, 1)
    .turret(51, 3)
    .shards(42, 48, 3, 3);
  b.acid(53, 70).mover(55, 7, 2, 'y', 3, 2).mover(60, 9, 3, 'x', 5, 2.5);
  b.ground(71, 149, 11).check(72, 10).guard(80, 10).shards(74, 86, 10, 4);
  b.fill(96, 7, 97, 10).turret(96, 6).fill(106, 7, 107, 10).turret(106, 6);
  b.spring(101, 10).ledge(100, 103, 4).mask(101, 3);
  b.check(112, 10).wisp(115, 6).moth(120, 6, 8).shards(118, 126, 10, 4);
  b.heart(130, 10).brute(136, 10).exit(146, 10);
  return b.build();
}

export function chapter17() {
  // Glass Gardens: ice everywhere, a rift past the wall, light to cross.
  const b = new LevelBuilder(16, 150);
  b.start(2, 10).ground(0, 10, 11).shards(4, 8, 10, 2);
  b.ice(11, 60, 11).brute(22, 10);
  b.fill(24, 0, 35, 3).beam(27, 4, 0.9, 1.1, 0).beam(32, 4, 0.9, 1.1, 0.9);
  b.barrier(36, 37).rift(34, 10, 40, 10);
  b.check(41, 10).shards(44, 52, 10, 4).brute(55, 10);
  b.ground(61, 83, 12).spikes(61, 83, 11);
  b.fill(63, 9, 66, 9, 'I').fill(70, 8, 73, 8, 'I').fill(77, 9, 80, 9, 'I');
  b.shard(64, 8).shard(71, 7).shard(78, 8);
  b.ground(84, 100, 11).check(85, 10);
  b.rift(88, 10, 96, 1).ledge(95, 98, 2).mask(97, 1);
  b.ice(101, 125, 11).fill(101, 0, 125, 3);
  b.beam(104, 4, 1, 1, 0)
    .beam(109, 4, 1, 1, 0.5)
    .beam(114, 4, 1, 1, 1)
    .beam(119, 4, 1, 1, 1.5);
  b.shards(106, 116, 10, 5).brute(122, 10);
  b.ground(126, 149, 11)
    .check(127, 10)
    .heart(128, 10)
    .guard(135, 10)
    .exit(146, 10);
  return b.build();
}

export function chapter18() {
  // Sunlit Bridges: rings, updrafts and wind between the towers.
  const b = new LevelBuilder(17, 160);
  b.start(2, 10).ground(0, 12, 11).shards(4, 10, 10, 3);
  b.acid(13, 40, 12).rings(16, 40, 6, 6).moth(25, 9, 8).shards(19, 37, 9, 6);
  b.ground(41, 55, 11).check(42, 10).turret(53, 10);
  b.acid(56, 80, 12);
  b.fill(60, 11, 61, 13).fan(60, 10, 9).fill(70, 11, 71, 13).fan(70, 10, 9);
  b.shards(62, 72, 4, 5).mask(70, 1);
  b.ground(81, 95, 11).check(82, 10);
  b.acid(96, 130, 12).ring(99, 5).ring(105, 6).ring(111, 5);
  b.fill(117, 11, 118, 13).fan(117, 10, 9).ring(123, 6).ring(129, 6);
  b.moth(100, 9, 10).moth(120, 3, 8).shards(102, 126, 8, 6);
  b.ground(131, 159, 11).check(132, 10).brute(140, 10).archer(150, 10);
  b.exit(156, 10);
  return b.build();
}

export function chapter19() {
  // The Last Night: a gauntlet of every trial in the game.
  const b = new LevelBuilder(18, 180);
  b.start(2, 10).ground(0, 12, 11).shards(4, 10, 10, 3).cloak(11, 10);
  b.ground(13, 40, 11)
    .guard(20, 10)
    .archer(28, 10)
    .guard(34, 10)
    .turret(39, 10);
  b.shards(15, 36, 10, 7);
  b.check(41, 10).belt(41, 60, 11, '>').fill(44, 0, 60, 3);
  b.crusher(47, 4, 6, 2, 0).crusher(53, 4, 6, 2, 1);
  b.ice(61, 80, 11)
    .brute(70, 10)
    .fill(64, 0, 80, 3)
    .dropper(67, 4)
    .dropper(74, 4);
  b.shards(63, 77, 10, 7);
  b.ground(81, 90, 11).check(82, 10);
  b.acid(91, 115, 12)
    .fill(91, 0, 115, 5)
    .rings(94, 112, 6, 6)
    .mace(103, 9, 1.3, 2.4);
  b.shards(97, 109, 9, 6);
  b.ground(116, 135, 11).check(117, 10);
  b.fan(126, 10, 9).ledge(129, 132, 2).key(131, 1).mask(127, 1);
  b.ground(136, 179, 11).door(136, 8).check(138, 10);
  b.fill(140, 0, 160, 3);
  b.beam(143, 4, 0.8, 0.8, 0)
    .beam(147, 4, 0.8, 0.8, 0.4)
    .beam(151, 4, 0.8, 0.8, 0.8)
    .beam(155, 4, 0.8, 0.8, 1.2);
  b.shards(145, 153, 10, 4);
  b.heart(162, 10).wisp(165, 6).brute(168, 10).exit(176, 10);
  return b.build();
}

export function chapter20() {
  // Solenne: the summit arena. The gate opens when she falls.
  const b = new LevelBuilder(19, 44);
  b.start(2, 10).ground(0, 43, 11);
  b.ledge(6, 9, 7).heart(7, 6).ledge(33, 36, 7).heart(34, 6);
  b.spring(16, 10).ledge(18, 23, 4).mask(21, 3);
  b.shards(8, 36, 10, 4);
  b.boss(21, 10);
  b.exit(40, 10);
  return b.build();
}
