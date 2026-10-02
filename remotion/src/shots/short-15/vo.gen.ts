// PLACEHOLDER — ELEVENLABS_API_KEY missing from .env, so this mirrors beats.json's
// ESTIMATED line windows (no per-word alignment). Once the key is set, regenerate with:
//   python tools/gen_voice.py --beats shorts/short-15-urine-color/beats.json \
//       --voice TX3LPaxmHKxFdv7VOQHJ \
//       --emit-ts remotion/src/shots/short-15/vo.gen.ts
// That overwrites this file with real per-word timings; never hand-edit after that.
import type { VoLine } from '../../lib/shorts';

export const VO: VoLine[] = [
  { text: "That color isn't random. It's a chemistry readout.", start: 0.4, end: 2.8 },
  { text: 'Urine’s yellow tint comes from a pigment called urochrome.', start: 3.6, end: 6.4 },
  { text: 'Less water diluting it means a darker shade.', start: 6.8, end: 9.4 },
  { text: "That's it — concentration, not magic.", start: 9.8, end: 12.4 },
  { text: "Guess which shade means you're well hydrated.", start: 14.8, end: 17.4 },
  { text: 'In 1994, researchers tested an eight-shade scale', start: 18.4, end: 21.0 },
  { text: 'against real lab hydration markers.', start: 21.4, end: 24.0 },
  { text: "Pale straw, shades one to three — that's well hydrated.", start: 24.4, end: 28.0 },
  { text: 'But just took a multivitamin?', start: 31.4, end: 33.2 },
  { text: "Ignore the neon yellow — that's riboflavin, not dehydration.", start: 33.6, end: 37.2 },
  { text: 'No app, no wearable. Just look before you flush.', start: 38.2, end: 39.8 },
];
