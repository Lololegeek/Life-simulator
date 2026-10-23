type Cue = 'age' | 'good' | 'bad' | 'special' | 'achievement' | 'death' | 'click' | 'money';

let tone: typeof import('tone') | null = null;
let synth: import('tone').PolySynth | null = null;
let enabled = true;
let volume = 0.6;

export function configureSound(opts: { enabled: boolean; volume: number }) {
  enabled = opts.enabled;
  volume = opts.volume;
  if (tone) tone.getDestination().volume.value = tone.gainToDb(Math.max(0.0001, volume));
}

async function ensure() {
  if (!tone) {
    tone = await import('tone');
    synth = new tone.PolySynth(tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.005, decay: 0.15, sustain: 0.2, release: 0.4 },
    }).toDestination();
    tone.getDestination().volume.value = tone.gainToDb(Math.max(0.0001, volume));
  }
  if (tone.getContext().state !== 'running') await tone.start();
  return { tone, synth: synth! };
}

const MELODIES: Record<Cue, [string, string][]> = {
  click: [['G5', '64n']],
  age: [['C5', '32n'], ['G5', '16n']],
  good: [['E5', '16n'], ['G5', '16n'], ['C6', '8n']],
  bad: [['E4', '16n'], ['C4', '8n']],
  special: [['C5', '16n'], ['E5', '16n'], ['G5', '16n'], ['C6', '8n']],
  money: [['A5', '32n'], ['E6', '16n']],
  achievement: [['G5', '16n'], ['C6', '16n'], ['E6', '16n'], ['G6', '8n']],
  death: [['A4', '8n'], ['F4', '8n'], ['D4', '8n'], ['A3', '2n']],
};

export async function play(cue: Cue) {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const { tone: T, synth: s } = await ensure();
    let t = T.now();
    for (const [note, dur] of MELODIES[cue]) {
      s.triggerAttackRelease(note, dur, t);
      t += T.Time(dur).toSeconds() * 0.9;
    }
  } catch {
    // audio is a nice-to-have
  }
}
