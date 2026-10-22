# Shadowman

A silhouette action platformer for Android and iOS, built with bare React Native and react-native-svg, with no game engine.

Once, the Lumen kept the day and the Umbral kept the night. Then High Lumenarch Solenne swore no shadow would ever fall again. Play as the last shadow across **20 chapters in four acts**, and stop her from burning an endless dawn into the sky.

## Story

| Act | Chapters | Setting | Introduces |
|---|---|---|---|
| **I · The Burning Keep** | 1–5 | Moonlit violet ruins | Run, double jump, wall climb, Shadow Dash, light pillars, guards, wisps, blades, crumbling stone, springs, moving slabs |
| **II · The Drowned Mire** | 6–10 | Green misty swamp | **Glide** (Mother Mire's cloak), liquid-lumen pools, archers, falling icicles, **rifts**, ice, shieldbearers, moon keys and sealed doors, the stealth cloak |
| **III · The Sunforge** | 11–15 | Ember-red foundry | **Shadow-hook** (Kestrel's gift), conveyor belts, crushers, updraft fans, turrets, swinging maces, cracked walls |
| **IV · The Dawn Spire** | 16–20 | Golden sunrise towers | Every trial mixed, ending in the duel with **Solenne** |

Narration plays before every chapter, with a prologue before Act I and an epilogue after the final fight. You can skip it.

## Mechanics

| | |
|---|---|
| **Shadow Dash** | Melt into shadow: light beams and bolts pass through you and enemies you touch are destroyed. Dashing smashes cracked walls. Shieldbearers' shields throw you back. |
| **Glide** (from Ch. 6) | Hold jump while falling to open the cloak. Gliding into an updraft fan carries you higher. |
| **Shadow-hook** (from Ch. 11) | Near a ring, the bolt button fires the hook. Steer to pump the swing, and jump to let go and keep the momentum. |
| **Climb** | Keep pressing jump against any wall to climb it. Ice walls are too slick to hold. |
| **Body physics** | Rope-simulated scarf, squash and stretch, skids, heavy landings, momentum carried off moving platforms, and a ragdoll on death. |
| **Hazards** | Spikes, pits, liquid lumen, crushers, falling icicles, light pillars, blades, maces, conveyor belts, ice. |
| **Enemies** | Lantern Guards, Wisps, Sunbow Archers (lobbed arrows), Lumen Turrets (aimed bolts), Shieldbearers (block from the front, charge), Lumen Moths, and Solenne (volleys, sweeping light, dive attacks). |
| **Pickups** | Shards, the hidden mask, hearts, moon keys, and the stealth cloak (enemies can't see you for 8 seconds). |
| **Marks** | Up to 3 per chapter: finish it, collect every shard, find the hidden mask. 60 in all. |

## Sound, music and icon

- **Music**: a looping track for each act (moonlit D minor, misty A dorian, a forge rhythm in E phrygian with anvils, bright C lydian bells at dawn) and a driving 140 bpm boss theme for Solenne.
- **Sound effects**: 26 cues covering jumps, dashes, landings, bolts, hits, pickups, checkpoints, springs, the hook, rifts, crushers, doors, cracked walls, enemies, Solenne, and the win jingle.
- All audio is synthesized from scratch by `scripts/make-audio.js` (`npm run audio`), so there are no third-party samples. The engine raises sound cues and the game screen plays them through `src/audio/audio.ts` (react-native-sound).
- **Music** and **Sound** switches are on the title screen and in the pause menu, and they're remembered.
- Audio plays in release builds only. Debug builds load assets over HTTP from Metro, which is too slow for dozens of sound players.
- **App icon**: drawn as SVG in `scripts/make-icons.js` (`npm run icons <node_modules with @resvg/resvg-js>`). It generates the Android adaptive and legacy icons, the iOS icon set, and a 512 px Play Store image in `assets/icon/`.

## Controls (landscape)

- Left thumb: ◀ ▶ to run.
- Right thumb: ▲ to jump (press again in the air to double jump, hold while falling to glide), **DASH**, and the bolt/hook button.
- Android back button: pause.

## Run

```bash
npm install
npm start
npm run android   # or: npm run ios (run `bundle exec pod install` in ios/ first)
```

The debug build runs React Native unoptimised and plays at roughly 15–30 fps. Debug builds also unlock every chapter for testing. To judge how the game really feels, play the release build, which holds 60 fps and uses normal progression:

```bash
npm run android:release
```

## Project layout

```
src/game/
  story.ts       acts, chapter names, narration, ability unlocks
  builder.ts     level builder (tiles + entities)
  levels/        act1.ts … act4.ts: the 20 chapter maps
  engine.ts      fixed-step player physics, guards/wisps, interactions, main tick
  systems.ts     crushers, droppers, rifts, fans, hook rings, new enemies, the Solenne fight
  core.ts        shared helpers: collision, damage, particles, projectiles
  body.ts        Verlet scarf and ragdoll
src/render/
  themes.ts      per-act palettes and backdrop layers
  art.ts         procedural scenery (trees, castles, stacks, gears, spires, terrain)
  Backdrop.tsx   sky, sun/moon, parallax layers
  WorldView.tsx  terrain chunks, Shadowman, Act I sprites
  Sprites.tsx    Acts II–IV sprites and the boss
src/screens/     Menu, Chapters (by act), Story, Game
src/audio/       sound effects and music playback
src/assets/audio synthesized WAV files
scripts/         make-audio.js (synth), make-icons.js (icon renderer)
src/storage.ts   saves progress with AsyncStorage
```

## Tests

`npm test` runs a best-first search bot on the real engine. It can run, jump, glide, climb, dash, throw and swing, and collects keys in order. The tests check that every chapter can be finished, every hidden mask can be reached, and Solenne can be defeated. They also cover climbing and body physics.
