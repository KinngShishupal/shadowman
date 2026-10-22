import { LevelBuilder } from '../builder';

// Act III: The Sunforge. Shadow-hook, belts, crushers, updraft fans,
// turrets, maces and cracked walls. Pools here are molten light.

export function chapter11() {
  // Foundry Gate: the hook. Low ceilings keep the pools too long to glide.
  const b = new LevelBuilder(10, 150);
  b.start(2, 10).ground(0, 14, 11).shards(5, 11, 10, 3);
  b.fill(15, 0, 44, 6).acid(15, 44, 12).rings(18, 42, 7, 6);
  b.ground(45, 60, 11).check(46, 10).guard(55, 10).shards(48, 52, 10, 2);
  b.acid(61, 90, 12).rings(64, 88, 6, 6).moth(66, 9, 8).moth(78, 3, 6);
  b.shard(67, 8).shard(73, 8).shard(79, 8).shard(85, 8);
  b.ground(91, 110, 11).check(92, 10).belt(98, 104, 11, '>');
  b.fill(106, 4, 107, 10).ledge(100, 104, 2).mask(102, 1);
  b.fill(111, 0, 135, 6)
    .acid(111, 135, 12)
    .rings(114, 132, 7, 6)
    .moth(118, 9, 10);
  b.ground(136, 149, 11).shards(138, 142, 10, 2).exit(146, 10);
  return b.build();
}

export function chapter12() {
  // Conveyor Hall: belts that fight you and crushers that keep time.
  const b = new LevelBuilder(11, 150);
  b.start(2, 10).ground(0, 10, 11).shards(4, 8, 10, 2);
  b.belt(11, 30, 11, '<').fill(11, 0, 30, 3);
  b.crusher(15, 4, 6, 2.4, 0)
    .crusher(21, 4, 6, 2.4, 0.8)
    .crusher(27, 4, 6, 2.4, 1.6);
  b.ground(31, 45, 11).check(32, 10).shards(35, 43, 10, 4);
  b.belt(46, 60, 11, '>').ground(61, 63, 11).spikes(61, 62, 10);
  b.ground(64, 90, 12).spikes(64, 90, 11);
  b.beltPlatform(66, 72, 8, '<')
    .beltPlatform(75, 81, 7, '>')
    .beltPlatform(84, 89, 8, '<');
  b.shard(69, 7).shard(78, 6).shard(86, 7);
  b.ledge(77, 79, 3).mask(78, 2);
  b.ground(91, 110, 11).check(92, 10).heart(94, 10).guard(100, 10);
  b.fill(101, 0, 110, 3)
    .crusher(103, 4, 6, 2.2, 0.3)
    .crusher(107, 4, 6, 2.2, 1.4);
  b.belt(111, 130, 11, '>').fill(111, 0, 130, 3);
  b.crusher(115, 4, 6, 2, 0)
    .crusher(120, 4, 6, 2, 0.7)
    .crusher(125, 4, 6, 2, 1.4);
  b.ground(131, 149, 11).shards(133, 139, 10, 3).exit(146, 10);
  return b.build();
}

export function chapter13() {
  // Furnace Lift: updrafts up ice-faced cliffs, turrets on every landing.
  const b = new LevelBuilder(12, 135);
  b.start(2, 10).ground(0, 18, 11).shards(4, 10, 10, 3);
  b.fan(16, 10, 9);
  b.ground(19, 40, 3).iceWall(19, 3, 10);
  b.check(21, 2).turret(30, 2).shards(24, 36, 2, 4);
  b.ground(41, 60, 11).check(43, 10).moth(50, 7, 6);
  b.fan(57, 10, 9);
  b.ground(61, 80, 4).iceWall(61, 4, 10);
  b.turret(70, 3).turret(78, 3).shards(64, 76, 3, 4);
  b.ground(81, 100, 11).check(82, 10);
  b.fan(90, 10, 9).ledge(84, 88, 3).mask(86, 2);
  b.acid(101, 118, 12);
  b.fill(104, 11, 105, 13).fan(104, 10, 8);
  b.fill(112, 11, 113, 13).fan(112, 10, 8);
  b.shards(106, 114, 4, 4);
  b.ground(119, 134, 11).turret(125, 10).exit(131, 10);
  return b.build();
}

export function chapter14() {
  // Chain Works: maces, cracked walls, and one last swing to the gate.
  const b = new LevelBuilder(13, 150);
  b.start(2, 10).ground(0, 40, 11).shards(4, 10, 10, 3);
  b.fill(14, 0, 15, 4).cracked(14, 5, 15, 10);
  b.mace(22, 7, 2.6, 2.2).mace(31, 7, 2.6, -2.2).shards(18, 34, 10, 8);
  b.check(36, 10);
  b.fill(41, 0, 70, 5)
    .acid(41, 70, 12)
    .rings(44, 68, 6, 6)
    .mace(53, 9, 1.2, 2.5);
  b.shard(47, 9).shard(59, 9);
  b.ground(71, 90, 11).check(72, 10);
  b.fill(80, 0, 81, 7).cracked(80, 8, 81, 10).heart(84, 10).turret(88, 10);
  b.ground(91, 110, 11).fill(91, 0, 110, 3);
  b.crusher(94, 4, 6, 2.2, 0)
    .crusher(100, 4, 6, 2.2, 0.7)
    .crusher(106, 4, 6, 2.2, 1.4);
  b.shards(92, 108, 10, 8);
  b.acid(111, 130, 12).rings(114, 126, 7, 6).moth(120, 4, 6);
  b.ground(131, 149, 11).shards(132, 134, 10, 2);
  b.fill(135, 7, 141, 7)
    .fill(141, 8, 141, 10)
    .cracked(135, 8, 135, 10)
    .mask(138, 10);
  b.exit(146, 10);
  return b.build();
}

export function chapter15() {
  // The Sunforge Core: every machine at once, behind two sealed doors.
  const b = new LevelBuilder(14, 170);
  b.start(2, 10).ground(0, 12, 11).shards(4, 10, 10, 3);
  b.belt(13, 30, 11, '>').fill(13, 0, 30, 3);
  b.crusher(18, 4, 6, 2.2, 0).crusher(25, 4, 6, 2.2, 1.1);
  b.ground(31, 62, 11).check(32, 10).shards(33, 37, 10, 2);
  b.fill(40, 7, 44, 7).fill(44, 8, 44, 10).cracked(40, 8, 40, 10).key(42, 10);
  b.turret(52, 10).door(59, 8);
  b.fill(64, 0, 90, 5)
    .acid(63, 90, 12)
    .rings(67, 85, 6, 6)
    .shards(70, 82, 9, 6);
  b.ground(91, 118, 11).check(92, 10);
  b.fan(95, 10, 8).ledge(98, 102, 3).key(100, 2);
  b.ledge(105, 108, 1).mask(106, 0);
  b.turret(112, 10);
  b.ground(119, 169, 11).door(119, 8);
  b.check(122, 10).heart(126, 10).brute(130, 10).archer(140, 10);
  b.wisp(150, 6).shards(150, 160, 10, 5).guard(158, 10);
  b.exit(166, 10);
  return b.build();
}
