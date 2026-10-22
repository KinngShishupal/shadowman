import { Theme } from '../game/story';

export type LayerKind =
  | 'peaks'
  | 'hills'
  | 'castle'
  | 'forest'
  | 'near'
  | 'deadwood'
  | 'willows'
  | 'reeds'
  | 'stacks'
  | 'gears'
  | 'pipes'
  | 'clouds'
  | 'spires';

export interface LayerDef {
  kind: LayerKind;
  color: string;
  fog: string;
  speed: number;
  vy: number;
  seed: number;
}

export interface ThemeDef {
  sky: [string, string, string, string, string];
  horizon: string;
  cloud: string;
  stars: number;
  orb: 'moon' | 'paleMoon' | 'forge' | 'sun';
  light: string; // windows, spire tips
  layers: LayerDef[];
  // Terrain
  body: string;
  rim: string;
  rimGlow: string;
  tree: string;
  stone: string;
  // Ambient motes
  motes: [string, string];
  moteRise: number; // embers drift upward
}

export const THEMES: Record<Theme, ThemeDef> = {
  dusk: {
    sky: ['#07041a', '#1b0f3d', '#3d1d5e', '#7a3470', '#c45a6e'],
    horizon: '#ff8a7a',
    cloud: '#6a3f8c',
    stars: 70,
    orb: 'moon',
    light: '#ffd27a',
    layers: [
      {
        kind: 'peaks',
        color: '#3a2160',
        fog: '#a45a8a',
        speed: 0.04,
        vy: 0.03,
        seed: 11,
      },
      {
        kind: 'castle',
        color: '#2a1749',
        fog: '#8a4a82',
        speed: 0.1,
        vy: 0.06,
        seed: 23,
      },
      {
        kind: 'forest',
        color: '#1b0e33',
        fog: '#5e2f6e',
        speed: 0.22,
        vy: 0.12,
        seed: 37,
      },
      {
        kind: 'near',
        color: '#100822',
        fog: '#3a1d52',
        speed: 0.4,
        vy: 0.2,
        seed: 53,
      },
    ],
    body: '#05020b',
    rim: '#b49cff',
    rimGlow: '#8f6bff',
    tree: '#150b29',
    stone: '#2b1d4d',
    motes: ['#7fffe8', '#ffd36b'],
    moteRise: 0,
  },
  marsh: {
    sky: ['#030a0a', '#0a2022', '#173a36', '#36604c', '#8aa266'],
    horizon: '#d0e890',
    cloud: '#3a6a5a',
    stars: 40,
    orb: 'paleMoon',
    light: '#d8f08a',
    layers: [
      {
        kind: 'hills',
        color: '#183a35',
        fog: '#6a9a7a',
        speed: 0.04,
        vy: 0.03,
        seed: 14,
      },
      {
        kind: 'deadwood',
        color: '#11302c',
        fog: '#4f7f66',
        speed: 0.1,
        vy: 0.06,
        seed: 26,
      },
      {
        kind: 'willows',
        color: '#0b1f1c',
        fog: '#2f5a4a',
        speed: 0.22,
        vy: 0.12,
        seed: 39,
      },
      {
        kind: 'reeds',
        color: '#051311',
        fog: '#1f3a32',
        speed: 0.4,
        vy: 0.2,
        seed: 58,
      },
    ],
    body: '#020807',
    rim: '#9ff0c0',
    rimGlow: '#4fb08a',
    tree: '#0d2420',
    stone: '#1d3d36',
    motes: ['#d8ff8a', '#7fffe8'],
    moteRise: 0,
  },
  foundry: {
    sky: ['#070202', '#1e0706', '#46120b', '#86321a', '#e2702a'],
    horizon: '#ff7a2a',
    cloud: '#4a2016',
    stars: 0,
    orb: 'forge',
    light: '#ffb04a',
    layers: [
      {
        kind: 'peaks',
        color: '#3a1510',
        fog: '#c0502a',
        speed: 0.04,
        vy: 0.03,
        seed: 17,
      },
      {
        kind: 'stacks',
        color: '#2a0e0a',
        fog: '#a8401c',
        speed: 0.1,
        vy: 0.06,
        seed: 29,
      },
      {
        kind: 'gears',
        color: '#1a0807',
        fog: '#6a2410',
        speed: 0.22,
        vy: 0.12,
        seed: 41,
      },
      {
        kind: 'pipes',
        color: '#0e0403',
        fog: '#3a1208',
        speed: 0.4,
        vy: 0.2,
        seed: 61,
      },
    ],
    body: '#070202',
    rim: '#ffa060',
    rimGlow: '#ff6a2a',
    tree: '#1a0a06',
    stone: '#3a1a10',
    motes: ['#ffb04a', '#ff6a2a'],
    moteRise: 0.9,
  },
  dawn: {
    sky: ['#1b1446', '#47306e', '#a0507e', '#f08a6a', '#ffd9a0'],
    horizon: '#fff0b0',
    cloud: '#ffd0c0',
    stars: 14,
    orb: 'sun',
    light: '#fff2b0',
    layers: [
      {
        kind: 'clouds',
        color: '#c47e9c',
        fog: '#ffc0a0',
        speed: 0.03,
        vy: 0.02,
        seed: 19,
      },
      {
        kind: 'spires',
        color: '#6a4482',
        fog: '#f0a0a0',
        speed: 0.1,
        vy: 0.06,
        seed: 31,
      },
      {
        kind: 'spires',
        color: '#3e2858',
        fog: '#b0688a',
        speed: 0.22,
        vy: 0.12,
        seed: 43,
      },
      {
        kind: 'near',
        color: '#1e1230',
        fog: '#7a4a7a',
        speed: 0.4,
        vy: 0.2,
        seed: 67,
      },
    ],
    body: '#0a0612',
    rim: '#ffe0a0',
    rimGlow: '#ffb070',
    tree: '#2a1838',
    stone: '#3a2850',
    motes: ['#fff2b0', '#ffb070'],
    moteRise: 0.3,
  },
};
