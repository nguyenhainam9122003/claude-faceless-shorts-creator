# short-13 · Algorithms — "Sắp Xếp Nổi Bọt" (Bubble Sort)

Format: 1080×1920 @ 30fps, 40s. 100% TSX. Voice: ElevenLabs (multilingual model,
Vietnamese) via tools/gen_voice.py — **not yet generated, ELEVENLABS_API_KEY missing
from .env**; beats.json currently holds ESTIMATED line windows (~2.7 tokens/sec).
Extends the existing niche lib `remotion/src/lib/algo.tsx` (no new niche lib — this
is a solo-algorithm explainer sibling to short-3's two-algorithm race).

## The truth on screen

One persistent 6-bar array runs the SAME classic (no early-exit) bubble sort
`bubbleSteps()` already used by short-3, seeded shuffle `seededShuffle(6, 1)` →
`[5, 1, 4, 3, 6, 2]`. Every comparison/swap on screen is a real op from that step
list — nothing staged. For n=6 this implementation always performs exactly
n(n−1)/2 = **15 comparisons** (no early-exit optimization, so this holds regardless
of input order) with, for this seed, **8 real swaps**. The n=1,000,000 claim
(499,999,500,000 ≈ **nearly 500 billion** comparisons) is the same n(n−1)/2 formula,
stated as an order-of-magnitude consequence of O(n²), not a benchmark claim.

## Beat sheet

| Beat | Time | On screen | VO |
|------|------|-----------|-----|
| HOOK | 0–3.4s | Frame 0 fully composed: the FINAL sorted array (green bars, ascending 1→6) with a small bubble drifting upward beside it; title "SẮP XẾP NỔI BỌT". | "Thuật toán sắp xếp chậm nhất. Nhưng dễ hiểu nhất." |
| SETUP | 3.4–15.4s | Array resets to the shuffled `[5,1,4,3,6,2]`; kicker "LUẬT CHƠI" (the rule). | "Sáu con số, xáo trộn hoàn toàn." / "Luật chỉ có một: so sánh hai ô cạnh nhau." / "Nếu bên trái lớn hơn, đổi chỗ cho nhau." |
| QUIZ | 15.4–18.6s | PauseCard: "Đoán xem — số nào chắc chắn về đúng chỗ sau một lượt?" | "Đoán xem: số nào sẽ về đúng chỗ, sau một lượt?" |
| REVEAL (detail) | 18.6–25.6s | Pass 1 walked slowly, one comparison at a time (bracket → swap-or-not), kicker "LƯỢT 1 / 5". | "Số lớn nhất, giống một bong bóng," / "nổi dần về cuối mảng, sau mỗi lượt so sánh." |
| REVEAL (time-lapse) | 25.6–29.6s | Passes 2–5 sped up; the sorted (green) tail grows one bar per completed pass; pass kicker ticks up. | "Lặp lại lượt hai, lượt ba... cho đến khi xong." |
| REVEAL (settle) | 29.6–33.0s | Fully sorted, all green; stat chip "6 PHẦN TỬ · 15 phép so sánh · 8 đổi chỗ". | "Sáu phần tử — chỉ mười lăm phép so sánh." |
| TWIST | 33.0–38.0s | Second stat chip scales up: "1.000.000 PHẦN TỬ · ~500 tỷ phép so sánh". | "Một triệu phần tử ư? Gần năm trăm tỷ phép so sánh." |
| LOOP | 38.0–40.0s | Dissolves back into the hook composition (grow zoom) — same sorted array + bubble motif. No CTA. | "Chậm... nhưng chẳng thuật toán nào dễ hiểu hơn." |

## Production notes

- Reuses `seededShuffle`, `bubbleSteps` from `lib/algo.tsx` unchanged. Adds (additively):
  `passBoundaries(n)`, `passOfOp(bounds, k)`, `sortedTailCount(bounds, kFloor)` — pure
  helpers for the pass-counter kicker and the "locked sorted tail" green shading — and
  `SortBoard`, a single-array panel (bars + numeric labels + a comparison bracket that
  slides the two compared bars smoothly when they swap) — `BarPanel` (short-3) is
  race-oriented (instant snap, two panels, ops/sec replay) and doesn't show values or
  animate the swap motion, so this is a sibling component, not a modification.
- Continuous op position `kFloat` is a piecewise-linear function of the REVEAL local
  frame: 42 frames/op for pass 1 (ops 1–5, slow enough to read each comparison), then
  12 frames/op for ops 6–15 (time-lapse). `SortBoard` is a pure function of `kFloat` —
  scrub-safe like short-3's `raceState`.
- Frame-0 rule: `HookScene` renders the DONE state of `SortBoard` (kFloat = ops.length)
  under `warm` BigTitle timing; the same component (mode="grow") closes the loop, so the
  last frame visually rhymes with frame 0 with no extra choreography.
- Fonts: `lib/fonts.ts`'s `FONT_DISPLAY/BODY/MONO` now also load the `vietnamese` Google
  Fonts subset (additive — existing latin-only shorts unaffected) so diacritics render.
- **THREE real bugs QA caught, all from the same root cause — `kFloat` sitting still is
  not the same as nothing happening yet.**
  1. The queued-up comparison pair was pre-painted in its *post-swap* color for the
     entire idle stretch before the reveal starts (kFloat pinned at 0 through all of
     SETUP) — because the color picked on "is this op next in queue" instead of on
     actual progress. Fixed by gating color/glow on `bracketIn`/`tResolveRaw`, which
     are legitimately 0 while idle.
  2. A **non-swapping** comparison still slid the two bars toward each other, because
     the slot-interpolation formula moved on `tResolve` unconditionally instead of
     checking `activeOp.swap` — a "≤" comparison that touches nothing was visibly
     dragging bars across each other. Fixed by gating the slide on `activeOp.swap` too.
  3. Even a genuine swap crossed both bars linearly through the same midpoint, so a
     6-vs-1-height pair fully overlapped for a frame. `bubbleSteps` only ever swaps
     when `prevValues[p] > prevValues[q]`, so `p` is always the bigger value — gave it
     a `sin(π·t)` arc-hop over the smaller one, which also reads as the metaphor (the
     bigger value "bubbles" past).
  All three only showed up on hand-picked mid-animation frames, not the beat-boundary
  frames QA checks by default — worth remembering for any future `kFloat`-style
  continuous-op component.
- PauseCard parked at `y=430` (above the board) — the skill's suggested `y=1120` for a
  bottom-half quiz card collided with the persistent SortBoard underneath it.
- **Blocked on voice**: `ELEVENLABS_API_KEY` is not set in `.env` at the repo root. Stage
  4 (`tools/gen_voice.py`) and Stage 5 SFX audition need it. `vo.gen.ts` currently mirrors
  beats.json's estimated line windows (no per-word alignment) so captions render with
  `timeWords()`'s length-weighted estimate — fine for QA, not final.
