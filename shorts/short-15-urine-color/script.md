# short-15 · Health & Body — "What Urine Color Means"

Format: 1080×1920 @ 30fps, 40s. 100% TSX. Voice: ElevenLabs (English, Liam) via
tools/gen_voice.py — **not yet generated, ELEVENLABS_API_KEY missing from .env**;
beats.json currently holds ESTIMATED line windows. Extends the existing niche lib
`lib/health.tsx` (no new niche lib) with one new component: `HydrationColorScale`.

## The facts (verified before scripting, both web-searched)

1. **The 8-point urine color chart is a real, validated clinical tool**, not a
   wellness-blog invention. Armstrong LE et al., *International Journal of Sport
   Nutrition*, 1994 — an 8-shade chart (pale straw → dark greenish-brown) was
   checked against urine specific gravity (a lab hydration marker) in real
   subjects. Original validation: **r = 0.80** (strong correlation). Follow-up
   studies across different populations found r = 0.40–0.93, with reported
   accuracy in the 80–95% range against clinical markers — stated on screen as
   the original r = 0.80, not an invented single "accuracy %" that averages
   studies the video doesn't cite individually.
2. **The mechanism**: urine's yellow color comes from urochrome (urobilin), a
   pigment produced as a byproduct of red blood cell breakdown. It's excreted at
   a roughly steady rate, so the more water it's diluted in, the paler the
   color — the same "concentration" logic as short-14's hydration gauge, just
   read from a different signal.
3. **The honesty-critical confounder**: riboflavin (vitamin B2) — common in
   multivitamins and energy drinks — is itself a fluorescent yellow compound.
   Excess is excreted in urine and produces a bright/neon yellow that **has
   nothing to do with hydration** and can mask or override the normal urochrome
   signal. This is the single most common real-world source of confusion
   ("I'm drinking tons of water, why is my pee neon?") and is the video's twist.

## Beat sheet

| Beat | Time | On screen | VO |
|------|------|-----------|-----|
| HOOK | 0–3.4s | Frame 0 fully composed: the 8-band color scale, pointer resting in the pale zone, title "WHAT YOUR PEE COLOR MEANS". | "That color isn't random. It's a chemistry readout." |
| SETUP | 3.4–14.4s | Pointer slides continuously from pale to dark as the scale is introduced. | "Urine's yellow tint comes from a pigment called urochrome." / "Less water diluting it means a darker shade." / "That's it — concentration, not magic." |
| QUIZ | 14.4–18.0s | PauseCard: "Guess: which shade means you're well hydrated?" (pointer parked dark). | "Guess which shade means you're well hydrated." |
| REVEAL | 18.0–31.0s | Pointer slides back up to bands 1–3; "WELL HYDRATED" label + stat chip "r = 0.80 vs lab hydration tests (Armstrong et al., 1994)". | "In 1994, researchers tested an eight-shade scale" / "against real lab hydration markers." / "Pale straw, shades one to three — that's well hydrated." |
| TWIST | 31.0–38.0s | A separate neon-yellow swatch pops up beside the scale (NOT on the pointer's path) labeled "RIBOFLAVIN (VITAMIN B2)" — the pointer itself doesn't move, because the real reading hasn't changed. | "But just took a multivitamin?" / "Ignore the neon yellow — that's riboflavin, not dehydration." |
| LOOP | 38.0–40.0s | Dissolves back into the hook composition (grow zoom), no CTA. | "No app, no wearable. Just look before you flush." |

## Production notes

- `HydrationColorScale` (new, additive to `lib/health.tsx`): draws N horizontal
  bands top(palest)→bottom(darkest) + a continuous-position pointer (a small
  triangle), matching `HydrationTank`'s "one float prop, scrub-safe" contract.
  It does NOT render labels/stat text itself — same "lib draws, shot narrates"
  split as `lib/chart.tsx`'s `Curve`/`EndDot`.
- **The confounder is drawn OFF the scale, not on it** — the biggest honesty
  risk here was animating the pointer INTO a "fake dark/bright" position to
  sell the multivitamin twist, which would visually claim riboflavin changes
  where you'd read on the VALIDATED scale. It doesn't — it's a different
  phenomenon the chart was never validated against. Keeping it a separate
  swatch, with the pointer static, is the same discipline as short-14's
  solid-vs-dashed curve split: never let the picture assert what the source
  doesn't.
- Pointer position is one continuous function of the MainScene-local frame
  (`pointerBandOf`), same pattern as short-14's `levelOf`: slides pale→dark
  during SETUP, holds during QUIZ, slides back dark→pale during REVEAL, holds
  through TWIST (because TWIST changes nothing about the real reading).
- Frame-0 rule: `HookScene` renders the scale with the pointer already in the
  pale/hydrated zone; `mode="grow"` closes the loop by reversing to the same
  state — same reusable hook/loop pattern as short-13/14.
- **Blocked on voice**: `ELEVENLABS_API_KEY` is not set in `.env`. `vo.gen.ts`
  mirrors beats.json's estimated windows until it's generated for real.
- **QA caught a VO/visual mismatch**: the original setup3 line ("More water, and
  it fades back toward pale straw") was narrated while the pointer was still
  mid-sweep TOWARD dark — the single continuous down-sweep only ever
  demonstrates the "less water → darker" direction during SETUP (the reverse
  only happens later, in REVEAL, and doing a down-then-up sweep within SETUP
  would have left the pointer back at pale right before the QUIZ, giving away
  the answer). Fixed by rewriting the line to a direction-agnostic close
  ("That's it — concentration, not magic.") rather than adding animation
  complexity to match a claim the beat wasn't shaped to show.

Sources: [HPRC — urine color charts](https://www.hprc-online.org/nutrition/performance-nutrition/how-accurately-assess-hydration-status-using-urine-color-charts) · [MDPI — athletes' self-assessment of urine color](https://www.mdpi.com/1660-4601/18/8/4126) · [Urobilin — Wikipedia](https://en.wikipedia.org/wiki/Urobilin)
