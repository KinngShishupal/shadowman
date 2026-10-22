import { LevelBuilder } from '../builder';

// Act II: The Drowned Mire. Glide, liquid lumen, archers, rifts, ice,
// shieldbearers, and keys.

export function chapter6() {
  // Mire's Edge: the glide is introduced with pools too wide to jump.
  const b = new LevelBuilder(5, 140);
  b.start(2, 10).ground(0, 14, 11).shards(5, 11, 10, 3);
  b.ground(15, 22, 7).shard(18, 6);
  b.acid(23, 36).shards(26, 34, 9, 4);
  b.ground(37, 48, 11).check(38, 10).moth(42, 6, 5);
  b.fill(47, 4, 48, 10);
  b.acid(49, 68).moth(53, 6, 6).moth(61, 8, 4);
  b.shard(55, 6).shard(59, 7).shard(64, 8);
  b.ground(69, 85, 11).check(70, 10).guard(80, 10);
  b.acid(86, 90).ground(91, 93, 10).acid(94, 98).ground(99, 101, 9);
  b.acid(102, 105).ground(106, 108, 10).acid(109, 112);
  b.shard(92, 9).shard(100, 8).shard(107, 9);
  b.ground(113, 139, 11).check(115, 10);
  b.fill(120, 3, 121, 10).ledge(124, 129, 2).mask(127, 1);
  // The wisp waits over solid ground, not above the narrow islands.
  b.wisp(117, 6).guard(132, 10).exit(136, 10);
  return b.build();
}

export function chapter7() {
  // Sunken Path: archers on causeways, droppers in the hollows.
  const b = new LevelBuilder(6, 150);
  b.start(2, 10).ground(0, 12, 11).shards(4, 10, 10, 3);
  b.acid(13, 17);
  b.ground(18, 30, 8).archer(28, 7).shards(20, 24, 7, 2);
  b.ground(31, 50, 11).fill(31, 0, 50, 3).check(32, 10);
  b.dropper(35, 4).dropper(39, 4).dropper(43, 4).dropper(47, 4);
  b.shards(37, 45, 10, 4);
  b.acid(51, 58).ledge(53, 55, 9);
  b.ground(59, 80, 11).fill(70, 6, 72, 10).archer(71, 5).guard(77, 10);
  b.ledge(64, 67, 3).mask(65, 2);
  b.ground(81, 95, 11).check(82, 10).heart(84, 10);
  b.acid(96, 118).ledge(100, 102, 8).ledge(107, 109, 7).ledge(114, 116, 8);
  b.moth(103, 4, 6).shard(101, 7).shard(108, 6).shard(115, 7);
  b.ground(119, 149, 11).fill(125, 0, 140, 4);
  b.dropper(128, 5).dropper(133, 5).dropper(137, 5);
  b.archer(143, 10).exit(146, 10);
  return b.build();
}

export function chapter8() {
  // Bog Lanterns: rifts through sealed walls, light over the water.
  const b = new LevelBuilder(7, 150);
  b.start(2, 10).ground(0, 14, 11).shards(4, 10, 10, 3);
  b.ground(15, 40, 11).barrier(15, 16).rift(12, 10, 19, 10);
  b.fill(17, 0, 40, 3).check(20, 10);
  b.beam(23, 4, 1, 1, 0)
    .beam(27, 4, 1, 1, 0.5)
    .beam(31, 4, 1, 1, 1)
    .beam(35, 4, 1, 1, 1.5);
  b.shards(25, 33, 10, 4).archer(37, 10);
  b.barrier(41, 42).ground(41, 42, 11).rift(39, 10, 44, 4);
  b.ground(43, 48, 5);
  b.acid(49, 70).moth(55, 6, 8).moth(63, 3, 5).shards(53, 65, 7, 4);
  b.ground(71, 90, 11).check(72, 10);
  b.fill(84, 3, 88, 10).rift(78, 10, 86, 2).mask(87, 2);
  b.acid(91, 110).fill(91, 0, 110, 3);
  b.ledge(94, 96, 9).ledge(100, 102, 9).ledge(106, 108, 9);
  b.beam(95, 4, 1.2, 1.2, 0)
    .beam(101, 4, 1.2, 1.2, 0.8)
    .beam(107, 4, 1.2, 1.2, 1.6);
  b.shard(95, 8).shard(101, 8).shard(107, 8);
  b.ground(111, 149, 11).check(112, 10);
  b.barrier(125, 126).rift(122, 10, 129, 10);
  b.guard(135, 10).archer(140, 10).exit(146, 10);
  return b.build();
}

export function chapter9() {
  // Hag's Hollow: slick ice, icicles and the first shieldbearers.
  const b = new LevelBuilder(8, 150);
  b.start(2, 10).ground(0, 10, 11).shards(4, 8, 10, 2);
  b.ice(11, 40, 11).brute(24, 10).spikes(33, 34, 10).shards(14, 20, 10, 3);
  b.ground(41, 50, 11).check(42, 10);
  b.ground(51, 77, 12).spikes(51, 77, 11);
  b.fill(53, 9, 56, 9, 'I')
    .fill(60, 8, 63, 8, 'I')
    .fill(67, 9, 70, 9, 'I')
    .fill(73, 8, 76, 8, 'I');
  b.shard(54, 8).shard(61, 7).shard(68, 8).shard(74, 7);
  b.ground(78, 95, 11).check(79, 10).brute(88, 10);
  b.ice(96, 115, 11).fill(96, 0, 115, 3);
  b.dropper(99, 4).dropper(104, 4).dropper(109, 4).shards(101, 111, 10, 5);
  b.ground(116, 149, 11).check(117, 10).heart(118, 10).brute(124, 10);
  b.spring(128, 10).ledge(130, 133, 6).mask(131, 5);
  b.guard(138, 10).exit(146, 10);
  return b.build();
}

export function chapter10() {
  // The Drowned Shrine: three sealed doors, three moon keys.
  const b = new LevelBuilder(9, 160);
  b.start(2, 10).ground(0, 29, 11).shards(4, 10, 10, 3);
  b.ledge(18, 21, 7).key(20, 6).moth(24, 6, 4);
  b.ground(30, 62, 11).door(30, 8);
  b.check(33, 10).cloak(36, 10);
  b.acid(40, 46).ledge(42, 44, 9).ledge(46, 48, 5).key(47, 4);
  b.guard(50, 10).archer(55, 10).guard(58, 10);
  b.door(61, 8);
  b.ground(63, 90, 11).check(64, 10);
  b.fill(66, 0, 85, 3);
  b.beam(69, 4, 1, 1.2, 0).beam(74, 4, 1, 1.2, 0.6).beam(79, 4, 1, 1.2, 1.2);
  b.shards(71, 81, 10, 5);
  b.fill(91, 3, 92, 13);
  b.acid(93, 115).moth(98, 5, 6).moth(106, 8, 5).shards(97, 109, 7, 4);
  b.ground(116, 159, 11).check(117, 10).shards(119, 123, 10, 2);
  b.spring(125, 10).ledge(127, 131, 4).key(129, 3);
  b.brute(134, 10);
  b.door(140, 8);
  b.spring(146, 10).ledge(148, 152, 4).mask(150, 3);
  b.exit(155, 10);
  return b.build();
}
