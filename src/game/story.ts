export type Theme = 'dusk' | 'marsh' | 'foundry' | 'dawn';

export interface Act {
  title: string;
  name: string;
  theme: Theme;
}

export interface ChapterInfo {
  name: string;
  subtitle: string;
  act: number;
  /** Narration shown before the chapter starts. */
  story: string[];
  /** Short tutorial hint for something introduced in this chapter. */
  hint?: string;
}

export const PROLOGUE = [
  'Once, the world kept two keepers. The Lumen tended the day. The Umbral tended the night, and every dream and quiet hour inside it.',
  'Then High Lumenarch Solenne swore that no shadow would ever fall again. Her Order burned the Umbral villages one by one.',
  'From the ashes of the last one, a single shadow stood up.',
];

export const EPILOGUE = [
  'The Sunforge cracks. The false dawn bleeds out of the sky, and for the first time in a hundred days, true night falls.',
  'Solenne’s lantern gutters in the dark. Without the Order’s fire she is only a frightened woman, and Shadowman lets her go.',
  'Day will come again, as it should. But it will share the world now. And somewhere in the quiet, the Umbral are waking.',
];

export const ACTS: Act[] = [
  { title: 'ACT I', name: 'The Burning Keep', theme: 'dusk' },
  { title: 'ACT II', name: 'The Drowned Mire', theme: 'marsh' },
  { title: 'ACT III', name: 'The Sunforge', theme: 'foundry' },
  { title: 'ACT IV', name: 'The Dawn Spire', theme: 'dawn' },
];

export const CHAPTERS: ChapterInfo[] = [
  // ---------------------------------------------------------------- Act I
  {
    name: 'Dusk Gate',
    subtitle: 'Learn to move like smoke',
    act: 0,
    story: [
      'Smoke still rises from the village. The Order’s soldiers sweep the ruins with lanterns, hunting for anything that casts no light.',
      'Shadowman wakes beneath the ashes. He is the last. He has to run.',
    ],
    hint: 'Jump twice for an umbral double jump. Keep pressing jump on any wall to climb it.',
  },
  {
    name: 'Lantern Walk',
    subtitle: 'The Order lights the way',
    act: 0,
    story: [
      'The road out of the valley runs beneath the Order’s lantern-towers. Their pillars of light burn any shadow they touch.',
      'Light cannot hold what moves faster than it.',
    ],
    hint: 'DASH melts you into shadow: you can pass straight through light pillars and bolts.',
  },
  {
    name: 'Hollow Spires',
    subtitle: 'Climb where walls are close',
    act: 0,
    story: [
      'A captured soldier’s map shows a fortress in the hollow spires: the Lumen Keep, where the Order keeps its prisoners.',
      'If any Umbral still live, they are there.',
    ],
  },
  {
    name: 'Moonfall Bridge',
    subtitle: 'Nothing here stays still',
    act: 0,
    story: [
      'The old moon-bridge was broken in the first war. Only its floating stones remain, drifting on old magic.',
    ],
    hint: 'Jumping off a moving slab carries its speed with you.',
  },
  {
    name: 'The Lumen Keep',
    subtitle: 'Put out the last light',
    act: 0,
    story: [
      'The Keep’s cells are empty. Every captured shadow has been taken away to a place the soldiers only whisper about: the Sunforge.',
      'An old Umbral elder once lived beyond the mire. If anyone knows the way, she does.',
    ],
  },
  // ---------------------------------------------------------------- Act II
  {
    name: 'Mire’s Edge',
    subtitle: 'Where the land forgets itself',
    act: 1,
    story: [
      'Mother Mire is waiting at the edge of the swamp, older than the trees. She wraps a cloak of night around his shoulders.',
      '“The Sunforge melts shadows into light, child. Solenne means to burn a dawn that never ends. Go, and take the wind with you.”',
    ],
    hint: 'NEW: hold jump while falling to glide on the umbral cloak.',
  },
  {
    name: 'Sunken Path',
    subtitle: 'The water remembers fire',
    act: 1,
    story: [
      'The Order poured liquid lumen into the bog to burn out the shadows that lived there. The pools still glow, and they still kill.',
      'Sunbow archers watch the causeways.',
    ],
    hint: 'Glowing pools are deadly. Archers lob arrows in arcs, so keep moving.',
  },
  {
    name: 'Bog Lanterns',
    subtitle: 'Step through the dark',
    act: 1,
    story: [
      'Mother Mire’s rifts still open in the deep marsh: tears in the night that link one shadow to another.',
    ],
    hint: 'NEW: violet rifts link to each other. Step into one to come out of its twin.',
  },
  {
    name: 'Hag’s Hollow',
    subtitle: 'Cold enough to crack',
    act: 1,
    story: [
      'Winter came early to the hollow, called down by the Order to freeze the bog shut. Shieldbearers march across the ice.',
    ],
    hint: 'Ice is slippery. Shieldbearers block attacks from the front: dash past them, then strike from behind or from above.',
  },
  {
    name: 'The Drowned Shrine',
    subtitle: 'Old doors, old keys',
    act: 1,
    story: [
      'Beneath the mire lies the Umbral shrine, sealed with keys of moonsilver. Its last gate opens onto the road to the Sunforge.',
    ],
    hint: 'Collect a moon key to open a sealed door.',
  },
  // ---------------------------------------------------------------- Act III
  {
    name: 'Foundry Gate',
    subtitle: 'Iron sings with stolen light',
    act: 2,
    story: [
      'The Sunforge rises out of the hills in a haze of embers. Chained in a cage at its gate hangs Kestrel, a young Umbral, barely flickering.',
      'He presses his shadow-hook into Shadowman’s hand. “Free the others. Break the core.”',
    ],
    hint: 'NEW: near a hook ring, press the bolt button to swing. Jump to let go.',
  },
  {
    name: 'Conveyor Hall',
    subtitle: 'Everything moves toward the fire',
    act: 2,
    story: [
      'Belts carry captured shadows toward the furnaces. The crushers never stop.',
    ],
    hint: 'Belts push you along. Crushers slam down: watch their rhythm.',
  },
  {
    name: 'Furnace Lift',
    subtitle: 'Ride the heat',
    act: 2,
    story: [
      'The only way up the furnace is the column of heat it breathes out. Lumen turrets guard every landing.',
    ],
    hint: 'Updrafts lift you, and gliding through them takes you higher. Turrets fire wherever they can see you.',
  },
  {
    name: 'Chain Works',
    subtitle: 'Swing, break, run',
    act: 2,
    story: [
      'Deep in the works, iron maces swing on their chains. Cracked walls hide the cells where the shadows are kept.',
    ],
    hint: 'Cracked blocks shatter when you dash into them or hit them with a bolt.',
  },
  {
    name: 'The Sunforge Core',
    subtitle: 'Break the heart of the fire',
    act: 2,
    story: [
      'The core is a sun in a cage. Shadowman breaks it, and the captured Umbral pour out into the night like ink into water.',
      'High above, Solenne’s spire begins to glow. If the forge cannot make her dawn, she will make it herself.',
    ],
  },
  // ---------------------------------------------------------------- Act IV
  {
    name: 'Dawnward Stair',
    subtitle: 'The sky is turning gold',
    act: 3,
    story: [
      'The Dawn Spire climbs past the clouds. At its top, Solenne gathers the light of a thousand lanterns into a single sunrise.',
      'There is one night left. Climb.',
    ],
  },
  {
    name: 'Glass Gardens',
    subtitle: 'Beautiful, and sharp',
    act: 3,
    story: [
      'The spire’s gardens are grown from glass and frozen light. Every surface is slick.',
    ],
  },
  {
    name: 'Sunlit Bridges',
    subtitle: 'Between towers, only wind',
    act: 3,
    story: [
      'The bridges between the towers burned away long ago. Only the wind and the old hook rings remain.',
    ],
  },
  {
    name: 'The Last Night',
    subtitle: 'Every trial at once',
    act: 3,
    story: [
      'Every soldier the Order has left stands between Shadowman and the summit. Behind him, the freed Umbral hold the stairs.',
    ],
  },
  {
    name: 'Solenne',
    subtitle: 'Eclipse the dawn',
    act: 3,
    story: [
      'The summit burns white. Solenne rises above her lens on wings of light.',
      '“You are the last shadow,” she says. “When you are gone, no one will ever be afraid of the dark again.”',
      '“No,” says Shadowman. “They’ll just never rest.”',
    ],
    hint: 'Hit Solenne with bolts and dashes. Dodge her volleys and the light that sweeps the floor.',
  },
];

export function themeOf(chapter: number): Theme {
  return ACTS[CHAPTERS[chapter]?.act ?? 0].theme;
}

/** Abilities unlock as the story hands them over. */
export function abilitiesFor(chapter: number) {
  return { glide: chapter >= 5, hook: chapter >= 10 };
}
