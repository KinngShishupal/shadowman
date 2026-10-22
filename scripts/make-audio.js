/* eslint-env node */
/**
 * Synthesizes every sound effect and music loop for Shadowman as WAV files.
 *   node scripts/make-audio.js
 * Output: src/assets/audio/*.wav (22.05 kHz, mono, 16-bit). Deterministic, so
 * re-running produces identical files.
 */
const fs = require('fs');
const path = require('path');

const SR = 22050;
const OUT = path.join(__dirname, '..', 'src', 'assets', 'audio');
fs.mkdirSync(OUT, { recursive: true });

// ------------------------------------------------------------- primitives

const TAU = Math.PI * 2;
let seed = 1;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const noise = () => rand() * 2 - 1;

const buf = secs => new Float32Array(Math.ceil(secs * SR));
const midi = n => 440 * Math.pow(2, (n - 69) / 12);

function wave(type, phase) {
  const p = phase - Math.floor(phase);
  switch (type) {
    case 'sine':
      return Math.sin(TAU * p);
    case 'tri':
      return 1 - 4 * Math.abs(p - 0.5);
    case 'saw':
      return 2 * p - 1;
    case 'square':
      return p < 0.5 ? 1 : -1;
    default:
      return noise();
  }
}

/**
 * Adds a voice into `b` starting at t0 seconds.
 * freq: number or (t) => Hz; env: attack, decay (exp time constant), hold.
 */
function voice(b, t0, dur, freq, o = {}) {
  const {
    type = 'sine',
    vol = 0.5,
    attack = 0.005,
    decay = dur / 3,
    release = 0.02,
    vibrato = 0,
    vibRate = 5,
  } = o;
  const start = Math.floor(t0 * SR);
  const n = Math.floor(dur * SR);
  let phase = rand();
  for (let i = 0; i < n && start + i < b.length; i++) {
    const t = i / SR;
    let f = typeof freq === 'function' ? freq(t) : freq;
    if (vibrato) {
      f *= 1 + vibrato * Math.sin(TAU * vibRate * t);
    }
    phase += f / SR;
    let env = t < attack ? t / attack : Math.exp(-(t - attack) / decay);
    if (t > dur - release) {
      env *= Math.max(0, (dur - t) / release);
    }
    if (start + i >= 0) {
      b[start + i] += wave(type, phase) * env * vol;
    }
  }
}

/** One-pole lowpass with optional time-varying cutoff. */
function lowpass(b, cutoff, from = 0, to = b.length) {
  let y = 0;
  for (let i = from; i < to; i++) {
    const c = typeof cutoff === 'function' ? cutoff((i - from) / SR) : cutoff;
    const a = 1 - Math.exp((-TAU * c) / SR);
    y += a * (b[i] - y);
    b[i] = y;
  }
  return b;
}

function highpass(b, cutoff) {
  const lp = Float32Array.from(b);
  lowpass(lp, cutoff);
  for (let i = 0; i < b.length; i++) {
    b[i] -= lp[i];
  }
  return b;
}

/** Filtered noise burst mixed into b. */
function noiseBurst(b, t0, dur, o = {}) {
  const {
    vol = 0.4,
    cutoff = 2000,
    decay = dur / 3,
    attack = 0.002,
    hp = 0,
  } = o;
  const tmp = buf(dur);
  for (let i = 0; i < tmp.length; i++) {
    const t = i / SR;
    tmp[i] =
      noise() * (t < attack ? t / attack : Math.exp(-(t - attack) / decay));
  }
  lowpass(tmp, cutoff);
  if (hp) {
    highpass(tmp, hp);
  }
  const start = Math.floor(t0 * SR);
  for (let i = 0; i < tmp.length && start + i < b.length; i++) {
    b[start + i] += tmp[i] * vol;
  }
}

function echo(b, delay, feedback, mix, wrap = false) {
  const d = Math.floor(delay * SR);
  const wet = new Float32Array(b.length);
  for (let i = 0; i < b.length; i++) {
    const j = i - d;
    const prev = j >= 0 ? wet[j] : wrap ? wet[j + b.length] || 0 : 0;
    wet[i] = (j >= 0 ? b[j] : wrap ? b[j + b.length] : 0) + prev * feedback;
  }
  for (let i = 0; i < b.length; i++) {
    b[i] += wet[i] * mix;
  }
  return b;
}

function finish(b, peak = 0.9, fade = true) {
  let m = 0;
  for (const v of b) {
    m = Math.max(m, Math.abs(v));
  }
  const g = m > 0 ? peak / m : 1;
  for (let i = 0; i < b.length; i++) {
    // Gentle soft clip keeps peaks round.
    b[i] = Math.tanh(b[i] * g * 1.1) / Math.tanh(1.1);
  }
  // Short fades so one-shots don't click. Loops wrap instead, so they skip this.
  const f = fade ? Math.min(64, b.length >> 2) : 0;
  for (let i = 0; i < f; i++) {
    b[i] *= i / f;
    b[b.length - 1 - i] *= i / f;
  }
  return b;
}

function writeWav(name, b) {
  const data = Buffer.alloc(b.length * 2);
  for (let i = 0; i < b.length; i++) {
    data.writeInt16LE(
      Math.max(-32767, Math.min(32767, Math.round(b[i] * 32767))),
      i * 2,
    );
  }
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write('WAVE', 8);
  h.write('fmt ', 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(data.length, 40);
  fs.writeFileSync(path.join(OUT, `${name}.wav`), Buffer.concat([h, data]));
  return data.length + 44;
}

// ------------------------------------------------------------- effects

const sfx = {
  jump() {
    const b = buf(0.18);
    voice(b, 0, 0.16, t => 280 + t * 2600, {
      type: 'tri',
      vol: 0.6,
      decay: 0.07,
    });
    noiseBurst(b, 0, 0.06, { vol: 0.15, cutoff: 3000, decay: 0.02 });
    return b;
  },
  doubleJump() {
    const b = buf(0.35);
    voice(b, 0, 0.16, t => 500 + t * 3600, {
      type: 'sine',
      vol: 0.45,
      decay: 0.08,
    });
    voice(b, 0.03, 0.3, 1318, { type: 'sine', vol: 0.25, decay: 0.09 });
    voice(b, 0.07, 0.28, 1975, { type: 'sine', vol: 0.18, decay: 0.08 });
    return echo(b, 0.06, 0.3, 0.3);
  },
  land() {
    const b = buf(0.14);
    noiseBurst(b, 0, 0.12, { vol: 0.7, cutoff: 400, decay: 0.03 });
    voice(b, 0, 0.12, t => 120 - t * 400, {
      type: 'sine',
      vol: 0.6,
      decay: 0.04,
    });
    return b;
  },
  dash() {
    const b = buf(0.32);
    noiseBurst(b, 0, 0.3, {
      vol: 0.9,
      cutoff: 5000,
      decay: 0.12,
      attack: 0.03,
    });
    lowpass(b, t => 4200 * Math.exp(-t * 7) + 300);
    voice(b, 0, 0.22, t => 900 - t * 2500, {
      type: 'sine',
      vol: 0.15,
      decay: 0.08,
    });
    return b;
  },
  bolt() {
    const b = buf(0.18);
    voice(b, 0, 0.16, t => 1500 * Math.exp(-t * 9) + 300, {
      type: 'saw',
      vol: 0.4,
      decay: 0.07,
    });
    lowpass(b, 2600);
    voice(b, 0, 0.12, t => 2400 - t * 8000, {
      type: 'sine',
      vol: 0.15,
      decay: 0.04,
    });
    return b;
  },
  hurt() {
    const b = buf(0.3);
    voice(b, 0, 0.26, t => 240 - t * 400, {
      type: 'square',
      vol: 0.35,
      decay: 0.12,
      vibrato: 0.06,
      vibRate: 30,
    });
    lowpass(b, 1800);
    noiseBurst(b, 0, 0.1, { vol: 0.25, cutoff: 2500, decay: 0.04 });
    return b;
  },
  death() {
    const b = buf(1.2);
    voice(b, 0, 0.8, t => 620 * Math.exp(-t * 3.2) + 60, {
      type: 'tri',
      vol: 0.55,
      decay: 0.35,
    });
    voice(b, 0.05, 0.9, t => 410 * Math.exp(-t * 3) + 45, {
      type: 'tri',
      vol: 0.3,
      decay: 0.35,
    });
    noiseBurst(b, 0, 0.6, { vol: 0.35, cutoff: 600, decay: 0.2 });
    return echo(b, 0.14, 0.35, 0.35);
  },
  shard() {
    const b = buf(0.5);
    [1318, 1975, 2637].forEach((f, i) =>
      voice(b, i * 0.045, 0.3, f, { vol: 0.3, decay: 0.08 }),
    );
    voice(b, 0, 0.4, 3951, { vol: 0.06, decay: 0.12 });
    return echo(b, 0.08, 0.35, 0.35);
  },
  mask() {
    const b = buf(1.4);
    [587, 740, 880, 1175, 1480, 1760].forEach((f, i) =>
      voice(b, i * 0.07, 0.9, f, {
        vol: 0.25,
        decay: 0.3,
        type: i % 2 ? 'sine' : 'tri',
      }),
    );
    voice(b, 0.4, 0.9, 2349, {
      vol: 0.08,
      decay: 0.3,
      vibrato: 0.01,
      vibRate: 6,
    });
    return echo(b, 0.12, 0.4, 0.4);
  },
  checkpoint() {
    const b = buf(1.6);
    for (const [f, v] of [
      [659, 0.35],
      [1318, 0.18],
      [1977, 0.1],
      [2637, 0.05],
    ]) {
      voice(b, 0, 1.5, f, { vol: v, decay: 0.5 });
    }
    voice(b, 0.12, 1.3, 988, { vol: 0.2, decay: 0.45 });
    return echo(b, 0.18, 0.35, 0.3);
  },
  enemyDie() {
    const b = buf(0.35);
    noiseBurst(b, 0, 0.18, { vol: 0.5, cutoff: 3500, decay: 0.05 });
    voice(b, 0, 0.3, t => 520 * Math.exp(-t * 8) + 90, {
      type: 'tri',
      vol: 0.5,
      decay: 0.1,
    });
    voice(b, 0.02, 0.25, 1760, { vol: 0.12, decay: 0.06 });
    return b;
  },
  spring() {
    const b = buf(0.45);
    voice(
      b,
      0,
      0.42,
      t => (200 + t * 1100) * (1 + 0.15 * Math.sin(TAU * 14 * t)),
      { type: 'sine', vol: 0.6, decay: 0.2 },
    );
    return b;
  },
  hook() {
    const b = buf(0.3);
    voice(b, 0, 0.26, t => 180 + 60 * Math.exp(-t * 20), {
      type: 'square',
      vol: 0.3,
      decay: 0.08,
    });
    lowpass(b, 1500);
    voice(b, 0, 0.1, t => 1800 - t * 6000, {
      type: 'sine',
      vol: 0.2,
      decay: 0.04,
    });
    return b;
  },
  key() {
    const b = buf(0.8);
    voice(b, 0, 0.6, 1046, { vol: 0.3, decay: 0.2 });
    voice(b, 0.08, 0.6, 1318, { vol: 0.3, decay: 0.2 });
    voice(b, 0.16, 0.6, 1568, { vol: 0.25, decay: 0.2 });
    return echo(b, 0.1, 0.3, 0.3);
  },
  door() {
    const b = buf(0.9);
    noiseBurst(b, 0, 0.8, { vol: 0.6, cutoff: 260, decay: 0.3, attack: 0.05 });
    voice(b, 0, 0.12, 110, { type: 'square', vol: 0.3, decay: 0.04 });
    voice(b, 0.6, 0.2, 90, { type: 'square', vol: 0.3, decay: 0.05 });
    lowpass(b, 900);
    return b;
  },
  crush() {
    const b = buf(0.5);
    voice(b, 0, 0.45, t => 70 * Math.exp(-t * 3) + 30, {
      type: 'sine',
      vol: 0.9,
      decay: 0.15,
    });
    noiseBurst(b, 0, 0.3, { vol: 0.5, cutoff: 500, decay: 0.08 });
    return b;
  },
  rift() {
    const b = buf(0.7);
    voice(b, 0, 0.6, t => 300 + 600 * Math.sin((Math.PI * t) / 0.6), {
      type: 'sine',
      vol: 0.4,
      decay: 0.3,
      vibrato: 0.04,
      vibRate: 18,
    });
    voice(b, 0, 0.6, t => 450 + 900 * Math.sin((Math.PI * t) / 0.6), {
      type: 'tri',
      vol: 0.15,
      decay: 0.3,
    });
    return echo(b, 0.09, 0.4, 0.4);
  },
  enemyShot() {
    const b = buf(0.16);
    voice(b, 0, 0.14, t => 950 - t * 3000, {
      type: 'sine',
      vol: 0.4,
      decay: 0.05,
    });
    return b;
  },
  arrow() {
    const b = buf(0.22);
    noiseBurst(b, 0, 0.2, {
      vol: 0.4,
      cutoff: 4000,
      hp: 1500,
      decay: 0.08,
      attack: 0.03,
    });
    voice(b, 0, 0.06, 300, { type: 'tri', vol: 0.3, decay: 0.02 });
    return b;
  },
  break() {
    const b = buf(0.4);
    for (let k = 0; k < 6; k++) {
      noiseBurst(b, k * 0.035 + rand() * 0.02, 0.08, {
        vol: 0.5 - k * 0.06,
        cutoff: 1800 - k * 150,
        decay: 0.02,
      });
    }
    voice(b, 0, 0.15, 90, { type: 'sine', vol: 0.5, decay: 0.05 });
    return b;
  },
  heart() {
    const b = buf(0.5);
    voice(b, 0, 0.3, 523, { type: 'tri', vol: 0.35, decay: 0.12 });
    voice(b, 0.1, 0.35, 784, { type: 'tri', vol: 0.35, decay: 0.14 });
    return echo(b, 0.1, 0.25, 0.25);
  },
  cloak() {
    const b = buf(0.8);
    voice(b, 0, 0.7, t => 1300 * Math.exp(-t * 2.5) + 200, {
      type: 'saw',
      vol: 0.3,
      decay: 0.3,
      vibrato: 0.05,
      vibRate: 12,
    });
    lowpass(b, 1600);
    return echo(b, 0.12, 0.4, 0.4);
  },
  bossHit() {
    const b = buf(0.3);
    voice(b, 0, 0.25, 310, { type: 'square', vol: 0.25, decay: 0.07 });
    voice(b, 0, 0.25, 467, { type: 'square', vol: 0.2, decay: 0.06 });
    voice(b, 0, 0.25, 1245, { vol: 0.15, decay: 0.08 });
    lowpass(b, 3000);
    return b;
  },
  bossDie() {
    const b = buf(2.6);
    [587, 698, 880].forEach((f, i) =>
      voice(b, i * 0.05, 2.2, t => f * Math.exp(-t * 0.6), {
        type: 'saw',
        vol: 0.18,
        decay: 0.8,
      }),
    );
    lowpass(b, 1400);
    noiseBurst(b, 0, 2.2, { vol: 0.4, cutoff: 300, decay: 0.8, attack: 0.1 });
    voice(b, 0, 1.5, t => 90 * Math.exp(-t * 1.2) + 30, {
      vol: 0.6,
      decay: 0.6,
    });
    return echo(b, 0.2, 0.4, 0.4);
  },
  win() {
    const b = buf(2.2);
    [62, 65, 69, 74].forEach((n, i) =>
      voice(b, i * 0.13, 0.35, midi(n), {
        type: 'tri',
        vol: 0.35,
        decay: 0.12,
      }),
    );
    [62, 66, 69, 74, 78].forEach(n =>
      voice(b, 0.56, 1.5, midi(n), {
        type: 'tri',
        vol: 0.18,
        decay: 0.6,
        attack: 0.02,
      }),
    );
    voice(b, 0.56, 1.5, midi(86), {
      vol: 0.08,
      decay: 0.5,
      vibrato: 0.008,
      vibRate: 5,
    });
    return echo(b, 0.16, 0.35, 0.3);
  },
  uiTap() {
    const b = buf(0.06);
    voice(b, 0, 0.05, 1400, { vol: 0.4, decay: 0.012 });
    return b;
  },
};

// ------------------------------------------------------------- music

/** Scale degree (0-based, may exceed 7) to MIDI note. */
const deg = (root, scale, d) =>
  root +
  scale[((d % scale.length) + scale.length) % scale.length] +
  12 * Math.floor(d / scale.length);

const SCALES = {
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
};

function kick(b, t, vol = 0.8) {
  voice(b, t, 0.3, x => 140 * Math.exp(-x * 25) + 45, { vol, decay: 0.09 });
}
function snare(b, t, vol = 0.35) {
  noiseBurst(b, t, 0.18, { vol, cutoff: 5000, hp: 800, decay: 0.05 });
  voice(b, t, 0.1, 190, { type: 'tri', vol: vol * 0.6, decay: 0.03 });
}
function hat(b, t, vol = 0.12) {
  noiseBurst(b, t, 0.05, { vol, cutoff: 9000, hp: 5000, decay: 0.012 });
}
function anvil(b, t, vol = 0.18) {
  for (const [f, v] of [
    [820, 1],
    [1310, 0.6],
    [1975, 0.4],
    [2690, 0.25],
  ]) {
    voice(b, t, 0.6, f, { vol: vol * v, decay: 0.12 });
  }
}

function track(o) {
  seed = o.seed;
  const beat = 60 / o.bpm;
  const bars = o.progression.length * o.barsPerChord;
  const len = bars * 4 * beat;
  const tail = 3;
  const b = buf(len + tail);
  const sc = SCALES[o.scale];
  const at = (bar, beatInBar) => (bar * 4 + beatInBar) * beat;

  o.progression.forEach((root, ci) => {
    const chord = [root, root + 2, root + 4];
    for (let k = 0; k < o.barsPerChord; k++) {
      const bar = ci * o.barsPerChord + k;
      // Pad: detuned saws, filtered soft, held through each chord.
      if (k === 0) {
        const dur = o.barsPerChord * 4 * beat + 0.4;
        for (const d of chord) {
          const f = midi(deg(o.root, sc, d) + 12 * o.padOct);
          for (const det of [-0.004, 0.004]) {
            voice(b, at(bar, 0), dur, f * (1 + det), {
              type: o.padWave || 'saw',
              vol: o.padVol,
              attack: 0.8,
              decay: 99,
              release: 0.8,
            });
          }
        }
      }
      // Bass.
      o.bassPattern.forEach(([pos, len2]) => {
        voice(
          b,
          at(bar, pos),
          len2 * beat,
          midi(deg(o.root, sc, root) - 12 + 12 * o.bassOct),
          {
            type: o.bassWave || 'tri',
            vol: o.bassVol,
            decay: len2 * beat * 0.6,
            release: 0.05,
          },
        );
      });
      // Arpeggio of chord tones.
      if (o.arpVol) {
        const steps = o.arpSteps || 8;
        for (let s = 0; s < steps; s++) {
          const d =
            chord[o.arpOrder[s % o.arpOrder.length]] +
            (s >= steps / 2 ? 7 : 0) * (o.arpOctaveJump ? 1 : 0);
          voice(
            b,
            at(bar, (s * 4) / steps),
            (4 / steps) * beat * 1.5,
            midi(deg(o.root, sc, d) + 12 * o.arpOct),
            {
              type: o.arpWave || 'tri',
              vol: o.arpVol * (s % 2 ? 0.75 : 1),
              decay: 0.18,
            },
          );
        }
      }
      // Sparse melody: chord-aware, seeded.
      if (o.leadVol) {
        for (let s = 0; s < 4; s++) {
          if (rand() < o.leadDensity) {
            const d =
              chord[Math.floor(rand() * 3)] + (rand() < 0.3 ? 1 : 0) + 7;
            const lenB = rand() < 0.5 ? 1 : 2;
            voice(
              b,
              at(bar, s),
              lenB * beat,
              midi(deg(o.root, sc, d) + 12 * o.leadOct),
              {
                type: o.leadWave || 'sine',
                vol: o.leadVol,
                attack: 0.04,
                decay: lenB * beat * 0.7,
                vibrato: 0.006,
                vibRate: 5,
              },
            );
          }
        }
      }
      // Drums.
      if (o.drums) {
        o.drums(b, pos => at(bar, pos), bar);
      }
    }
  });

  if (o.lowpass) {
    lowpass(b, o.lowpass);
  }
  if (o.echo) {
    echo(b, beat * 0.75, 0.35, o.echo);
  }
  // Wrap the tail into the start so the loop is seamless.
  const L = Math.floor(len * SR);
  const out = new Float32Array(L);
  for (let i = 0; i < b.length; i++) {
    out[i % L] += b[i];
  }
  return finish(out, 0.85, false);
}

const music = {
  // Act I: moonlit, mysterious D minor.
  music_dusk: () =>
    track({
      seed: 11,
      bpm: 84,
      root: 50,
      scale: 'minor',
      progression: [0, 5, 3, 4, 0, 5, 6, 4],
      barsPerChord: 2,
      padOct: 1,
      padVol: 0.05,
      bassOct: 0,
      bassVol: 0.22,
      bassPattern: [
        [0, 1.5],
        [2, 1.5],
      ],
      arpVol: 0.09,
      arpOct: 2,
      arpOrder: [0, 1, 2, 1],
      arpSteps: 8,
      arpOctaveJump: true,
      leadVol: 0.08,
      leadOct: 1,
      leadDensity: 0.35,
      lowpass: 5000,
      echo: 0.35,
    }),
  // Act II: misty, slow A dorian with a breathy flute.
  music_marsh: () =>
    track({
      seed: 23,
      bpm: 70,
      root: 57,
      scale: 'dorian',
      progression: [0, 3, 6, 4, 0, 3, 5, 4],
      barsPerChord: 2,
      padOct: 0,
      padVol: 0.05,
      padWave: 'tri',
      bassOct: -1,
      bassVol: 0.25,
      bassPattern: [[0, 3]],
      arpVol: 0.06,
      arpOct: 1,
      arpOrder: [0, 2, 1, 2],
      arpSteps: 4,
      leadVol: 0.1,
      leadOct: 1,
      leadDensity: 0.45,
      leadWave: 'tri',
      lowpass: 3500,
      echo: 0.45,
      drums: (b, at) => {
        hat(b, at(1), 0.05);
        hat(b, at(3), 0.05);
      },
    }),
  // Act III: forge rhythm in E phrygian, with anvils.
  music_foundry: () =>
    track({
      seed: 37,
      bpm: 100,
      root: 52,
      scale: 'phrygian',
      progression: [0, 1, 0, 6, 0, 1, 5, 6],
      barsPerChord: 2,
      padOct: 0,
      padVol: 0.04,
      bassOct: -1,
      bassVol: 0.28,
      bassWave: 'square',
      bassPattern: [
        [0, 0.5],
        [0.75, 0.5],
        [1.5, 0.5],
        [2, 0.5],
        [3, 0.5],
        [3.5, 0.5],
      ],
      arpVol: 0.05,
      arpOct: 1,
      arpOrder: [0, 1, 0, 2],
      arpSteps: 8,
      leadVol: 0.06,
      leadOct: 1,
      leadDensity: 0.3,
      leadWave: 'saw',
      lowpass: 3000,
      echo: 0.2,
      drums: (b, at, bar) => {
        kick(b, at(0));
        kick(b, at(2.5), 0.6);
        snare(b, at(1));
        snare(b, at(3));
        for (let s = 0; s < 8; s++) {
          hat(b, at(s / 2), 0.07);
        }
        if (bar % 2 === 1) {
          anvil(b, at(3.5));
        }
      },
    }),
  // Act IV: rising dawn, bright C lydian bells.
  music_dawn: () =>
    track({
      seed: 41,
      bpm: 90,
      root: 48,
      scale: 'lydian',
      progression: [0, 1, 5, 4, 0, 1, 3, 4],
      barsPerChord: 2,
      padOct: 1,
      padVol: 0.05,
      padWave: 'tri',
      bassOct: 0,
      bassVol: 0.2,
      bassPattern: [
        [0, 2],
        [2, 2],
      ],
      arpVol: 0.08,
      arpOct: 2,
      arpOrder: [0, 1, 2, 1, 2, 1],
      arpSteps: 12,
      arpWave: 'sine',
      leadVol: 0.09,
      leadOct: 2,
      leadDensity: 0.4,
      lowpass: 6500,
      echo: 0.4,
      drums: (b, at) => {
        kick(b, at(0), 0.4);
        hat(b, at(2), 0.05);
      },
    }),
  // Solenne: driving harmonic minor at 140.
  music_boss: () =>
    track({
      seed: 53,
      bpm: 140,
      root: 50,
      scale: 'harmonicMinor',
      progression: [0, 5, 3, 4, 0, 5, 1, 4],
      barsPerChord: 2,
      padOct: 1,
      padVol: 0.04,
      bassOct: -1,
      bassVol: 0.3,
      bassWave: 'saw',
      bassPattern: [
        [0, 0.5],
        [0.5, 0.5],
        [1, 0.5],
        [1.5, 0.5],
        [2, 0.5],
        [2.5, 0.5],
        [3, 0.5],
        [3.5, 0.5],
      ],
      arpVol: 0.07,
      arpOct: 1,
      arpOrder: [0, 2, 1, 2],
      arpSteps: 8,
      arpWave: 'saw',
      leadVol: 0.07,
      leadOct: 1,
      leadDensity: 0.6,
      leadWave: 'square',
      lowpass: 3800,
      echo: 0.15,
      drums: (b, at) => {
        kick(b, at(0));
        kick(b, at(1));
        kick(b, at(2));
        kick(b, at(3));
        snare(b, at(1), 0.3);
        snare(b, at(3), 0.3);
        for (let s = 0; s < 8; s++) {
          hat(b, at(s / 2 + 0.25), 0.06);
        }
      },
    }),
};

let total = 0;
for (const [name, make] of Object.entries(sfx)) {
  seed = name.length * 97 + 13;
  total += writeWav(name, finish(make(), 0.8));
}
for (const [name, make] of Object.entries(music)) {
  const b = make();
  total += writeWav(name, b);
  console.log(`${name}: ${(b.length / SR).toFixed(1)}s`);
}
console.log(
  `wrote ${Object.keys(sfx).length + Object.keys(music).length} files, ${(
    total / 1e6
  ).toFixed(1)} MB`,
);
