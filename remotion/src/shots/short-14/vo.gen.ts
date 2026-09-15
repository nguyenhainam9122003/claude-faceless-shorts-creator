// PLACEHOLDER — ELEVENLABS_API_KEY missing from .env, so this mirrors beats.json's
// ESTIMATED line windows (no per-word alignment). Once the key is set, regenerate with:
//   python tools/gen_voice.py --beats shorts/short-14-hydration/beats.json \
//       --voice TX3LPaxmHKxFdv7VOQHJ \
//       --emit-ts remotion/src/shots/short-14/vo.gen.ts
// That overwrites this file with real per-word timings; never hand-edit after that.
import type { VoLine } from '../../lib/shorts';

export const VO: VoLine[] = [
  { text: 'Eight hours. No food. No water.', start: 0.4, end: 2.8 },
  { text: 'Every night, your body keeps losing water —', start: 3.6, end: 6.0 },
  { text: 'just breathing, just sweating, even at rest.', start: 6.4, end: 9.4 },
  { text: 'No food or drink to replace it, for eight straight hours.', start: 9.8, end: 13.8 },
  { text: 'Guess how much water you lose, just sleeping.', start: 14.8, end: 17.6 },
  { text: 'About three hundred milliliters —', start: 18.4, end: 20.6 },
  { text: 'humid air breathed out, sweat off your skin.', start: 21.0, end: 24.0 },
  { text: "That's the mild dehydration you wake up with.", start: 24.4, end: 27.4 },
  { text: 'Drink about a glass first thing,', start: 30.4, end: 32.6 },
  { text: 'and resting metabolism can spike up to thirty percent —', start: 33.0, end: 36.0 },
  { text: 'peaking within the hour, then fading.', start: 36.4, end: 37.8 },
  { text: 'Not a wellness trend. Just replacing what you lost.', start: 38.2, end: 39.8 },
];
