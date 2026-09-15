# short-14 · Health & Body — "Why Drink Water In The Morning"

Format: 1080×1920 @ 30fps, 40s. 100% TSX. Voice: ElevenLabs (English, Liam) via
tools/gen_voice.py — **not yet generated, ELEVENLABS_API_KEY missing from .env**;
beats.json currently holds ESTIMATED line windows. New niche lib `lib/health.tsx`
(a hydration-level gauge) + reuses `lib/chart.tsx`'s generic `Curve`/`EndDot`/
`makeScale` for the metabolism spike graph (not money-specific despite the name —
no new chart engine needed).

## The facts (verified before scripting, both peer-reviewed)

1. **Overnight water loss is real and is insensible loss, not sweat-from-heat.**
   Adults lose roughly 800 mL/day to insensible loss — ~400 mL from the skin
   (evaporation, present even at rest) and ~400 mL from the respiratory tract
   (water vapor in every exhaled breath). Sleep is ~1/3 of the day, so an 8-hour
   night accounts for **roughly 300 mL** of that (order-of-magnitude estimate,
   not a clinical measurement — stated as such on screen). Source: insensible
   water loss physiology (e.g. Adolph's classic estimates, summarized in
   *Advances in Physiology Education* 29:213, 2005 and standard fluid-balance
   references).
2. **Water-induced thermogenesis is a real, peer-reviewed effect — and it's small.**
   Boschmann et al., *J Clin Endocrinol Metab* 88(12):6015-6019, 2003: 14 healthy
   adults drank 500 mL of water; resting metabolic rate rose within 10 minutes and
   **peaked at +30% around 30–40 minutes**. Total thermogenic response ≈ 100 kJ
   (**≈ 24 kcal**) — small in absolute terms, and **~40% of that is just the cost
   of warming the water from room temp to body temp**, not a metabolic "boost" in
   the popular sense. The video states the verified rise (+30%, 30–40 min) and
   the honest scale (~24 kcal) and does NOT claim it lasts all day or drives
   weight loss — the paper doesn't show that, and neither does the video.

## Beat sheet

| Beat | Time | On screen | VO |
|------|------|-----------|-----|
| HOOK | 0–3.4s | Frame 0 fully composed: hydration gauge LOW, sun rising icon, title "WHY DRINK WATER IN THE MORNING". | "Eight hours. No food. No water." |
| SETUP | 3.4–14.4s | Gauge rewinds to FULL at "bedtime" (moon icon), then drains continuously through a sped-up night as breath/sweat icons cross-fade beside it. | "Every night, your body keeps losing water —" / "just breathing, just sweating, even at rest." / "No food or drink to replace it, for eight straight hours." |
| QUIZ | 14.4–18.0s | PauseCard: "Guess: how much water, just sleeping?" | "Guess how much water you lose, just sleeping." |
| REVEAL | 18.0–30.0s | Answer stat chip "~300 mL" with two icon-chips (breathing / skin); gauge settles at its LOW morning level. | "About three hundred milliliters —" / "humid air breathed out, sweat off your skin." / "That's the mild dehydration you wake up with." |
| TWIST | 30.0–38.0s | Small spike chart (verified rise only, solid) climbing to +30% at ~30–40min, then an unlabeled dashed fade (qualitative, not asserted as data); stat chip "500 mL → +30% RMR (~24 kcal)". | "Drink about a glass first thing," / "and resting metabolism can spike up to thirty percent —" / "peaking within the hour, then fading." |
| LOOP | 38.0–40.0s | Dissolves back into the hook composition (gauge full → sun), no CTA. | "Not a wellness trend. Just replacing what you lost." |

## Production notes

- `lib/health.tsx` (new, generic for a future health/body series): `HydrationTank`
  (rounded-capsule level gauge, continuous fill prop 0–1, no wavy-SVG risk — flat
  fill rect, matches the kit's minimalist style) + `LossBadge` (a small icon+label
  chip for "breathing" / "skin" style facts).
- The metabolism graph reuses `lib/chart.tsx`'s `makeScale`/`Curve`/`EndDot`
  UNCHANGED — those are generic (x/y data → pixels), not money-specific despite
  living in the money-math short's file. No new chart engine needed.
- **Honesty guard baked into the visual, not just the script**: the metabolism
  curve is SOLID only where the paper's numbers back it (0 → peak at 30–40 min,
  landing exactly on +30%), then continues as a faded DASHED line with no axis
  value attached — so the "then fading" claim in the VO is never backed by a
  fabricated number on screen. Same discipline as short-12's sagitta fix: don't
  let the picture assert more than the source does.
- Frame-0 rule: `HookScene` renders the gauge at its LOW morning level (the
  payoff), `mode="grow"` closes the loop by reversing to the same state — same
  pattern as short-3/short-13's reusable hook/loop scene.
- **Blocked on voice**: `ELEVENLABS_API_KEY` is not set in `.env`. `vo.gen.ts`
  mirrors beats.json's estimated windows until it's generated for real.
