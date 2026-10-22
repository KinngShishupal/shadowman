import { LevelBuilder } from '../builder';

// Act I: The Burning Keep. Teaches running, jumping, climbing and dashing.

export function chapter1() {
  const b = new LevelBuilder(0, 112);
  b.start(2, 10).ground(0, 14, 11).shards(6, 10, 10);
  b.ground(18, 30, 11).fill(22, 9, 24, 10).shard(23, 7).spikes(27, 28, 10);
  b.ground(35, 55, 11).check(36, 10);
  b.ledge(39, 43, 8).shards(40, 42, 7);
  b.guard(50, 10);
  b.ground(56, 60, 9).fill(63, 9, 64, 9);
  b.ground(67, 111, 11).check(68, 10);
  b.fill(75, 7, 76, 10);
  b.fill(80, 5, 83, 5).mask(82, 4);
  b.spikes(79, 84, 10);
  b.shards(87, 89, 10);
  b.guard(96, 10);
  b.shard(100, 8).shard(102, 8);
  b.exit(108, 10);
  return b.build();
}

export function chapter2() {
  const b = new LevelBuilder(1, 132);
  b.start(2, 10).ground(0, 12, 11).shards(5, 9, 10);
  // Lumen pillars under a stone canopy. Dash through them: light can't hold a shadow.
  b.ground(13, 40, 11).fill(14, 0, 32, 2);
  b.beam(17, 3, 1.2, 1.4, 0)
    .beam(22, 3, 1.2, 1.4, 0.7)
    .beam(27, 3, 1.2, 1.4, 1.4);
  b.shard(19, 10).shard(24, 10).shard(29, 10);
  b.check(35, 10);
  // Crumbling bridge.
  b.crumble(41, 52, 11).shards(44, 50, 10, 3);
  b.ground(53, 76, 11).ledge(57, 60, 8).shard(58, 7);
  b.wisp(62, 7).guard(68, 10);
  b.fill(71, 9, 73, 10).fill(74, 7, 76, 10);
  // Moving slab over the pit.
  b.mover(78, 9, 3, 'x', 4, 2);
  b.ground(85, 100, 11).check(87, 10);
  b.saw(92, 10, 'x', 4, 3).spikes(98, 99, 10);
  b.ground(101, 131, 11).fill(104, 0, 112, 2);
  b.beam(106, 3, 1.0, 1.0, 0).beam(110, 3, 1.0, 1.0, 1.0);
  b.shard(108, 10).shard(114, 8);
  b.wisp(117, 6);
  b.spring(116, 10).ledge(118, 121, 6).mask(120, 5);
  b.guard(124, 10).exit(128, 10);
  return b.build();
}

export function chapter3() {
  const b = new LevelBuilder(2, 142);
  b.start(2, 10).ground(0, 24, 11).guard(12, 10).shards(5, 9, 10);
  // Shaft 1: column hanging from above on the left, mesa wall on the right.
  b.fill(18, 2, 18, 8);
  b.ground(22, 40, 3);
  b.shard(20, 6).shard(20, 3);
  b.check(24, 2).guard(32, 2).shards(27, 37, 1, 5);
  // Spike field with floating stones.
  b.ground(41, 60, 12).spikes(41, 60, 11);
  b.fill(44, 6, 45, 6).crumble(49, 51, 7).fill(55, 5, 56, 5);
  b.wisp(52, 3).shard(45, 5).shard(50, 6).shard(56, 4);
  b.ground(61, 75, 8).check(62, 7).shards(65, 69, 7).guard(71, 7);
  // Shaft 2.
  b.fill(73, 0, 73, 4);
  b.ground(76, 85, 2).mask(84, 1);
  b.ground(86, 100, 11).check(87, 10);
  b.saw(90, 7, 'y', 3, 2.5).saw(94, 10, 'x', 4, 3);
  b.shard(92, 10).shard(98, 10);
  // Light corridor.
  b.ground(101, 141, 11).fill(101, 0, 120, 3);
  b.beam(104, 4, 0.9, 1.1, 0).beam(108, 4, 0.9, 1.1, 0.5);
  b.beam(112, 4, 0.9, 1.1, 1.0).beam(116, 4, 0.9, 1.1, 1.5);
  b.wisp(119, 7).shards(106, 114, 10, 4);
  b.guard(126, 10).guard(132, 10).shard(129, 8);
  b.exit(138, 10);
  return b.build();
}

export function chapter4() {
  const b = new LevelBuilder(3, 150);
  b.start(2, 10).ground(0, 10, 11).shards(4, 8, 10);
  b.mover(12, 10, 3, 'x', 5, 2.5);
  b.ground(21, 44, 11).check(23, 10);
  b.spring(28, 10).ledge(29, 34, 6).shards(30, 33, 5, 1);
  b.guard(40, 10);
  // The broken bridge.
  b.crumble(47, 49, 10).mover(52, 8, 2, 'y', 3, 2);
  b.crumble(57, 59, 9).wisp(60, 5).mover(62, 9, 3, 'x', 2, 3);
  b.shard(48, 9).shard(53, 6).shard(58, 8);
  b.ground(67, 80, 11).check(68, 10);
  b.saw(72, 10, 'x', 4, 3.5);
  b.fill(78, 7, 80, 10);
  b.ground(81, 95, 11).spring(83, 10).ledge(84, 87, 5).mask(85, 4);
  b.guard(92, 10).shard(89, 10);
  // Low tunnel with teeth in the ceiling.
  b.ground(96, 110, 11).fill(96, 0, 110, 7);
  b.ceilSpikes(98, 100, 8).ceilSpikes(104, 107, 8);
  b.wisp(103, 9).shards(97, 109, 10, 3);
  b.ground(111, 118, 11).check(112, 10);
  b.mover(119, 5, 2, 'y', 5, 2);
  b.ground(122, 149, 6);
  b.guard(128, 5).guard(138, 5).shards(131, 135, 5);
  b.exit(146, 5);
  return b.build();
}

export function chapter5() {
  const b = new LevelBuilder(4, 162);
  b.start(2, 10).ground(0, 12, 11);
  b.ground(13, 40, 11).fill(13, 0, 40, 3);
  b.beam(16, 4, 0.8, 0.8, 0).beam(19, 4, 0.8, 0.8, 0.4);
  b.beam(22, 4, 0.8, 0.8, 0.8).beam(25, 4, 0.8, 0.8, 1.2);
  b.shards(17, 26, 10, 3);
  b.guard(31, 10).guard(36, 10).check(38, 10);
  // Pit of turning blades.
  b.fill(44, 9, 45, 9).fill(49, 8, 50, 8).fill(54, 9, 55, 9);
  b.saw(47, 6, 'y', 4, 2.5).saw(52, 5, 'y', 4, 3);
  b.shard(45, 8).shard(50, 7).shard(55, 8);
  b.ground(59, 75, 11).check(60, 10);
  // Shaft into the keep.
  b.fill(66, 1, 66, 8);
  b.ground(70, 90, 3);
  b.shard(68, 7).shard(68, 4);
  b.wisp(80, 1).guard(85, 2).shards(73, 77, 2);
  // Crumbling stairs over spikes.
  b.ground(91, 110, 12).spikes(91, 110, 11);
  b.crumble(93, 95, 8).crumble(98, 100, 7).crumble(103, 105, 8);
  b.wisp(101, 4).shard(99, 6).shard(104, 7);
  b.ground(111, 125, 11).check(112, 10);
  b.spring(118, 10).ledge(120, 124, 5).mask(122, 4);
  b.guard(115, 10);
  // Final gauntlet.
  b.ground(126, 161, 11).fill(130, 0, 150, 3);
  b.beam(133, 4, 0.7, 0.9, 0).beam(137, 4, 0.7, 0.9, 0.4);
  b.beam(141, 4, 0.7, 0.9, 0.8).beam(145, 4, 0.7, 0.9, 1.2);
  b.guard(139, 10).wisp(148, 7).shards(135, 147, 10, 4);
  b.exit(157, 10);
  return b.build();
}
