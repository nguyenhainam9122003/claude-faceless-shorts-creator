// Algorithm-race kit — instrumented sorts replayed frame-deterministically.
// Every op on screen is a REAL comparison/swap the algorithm performed on the same
// seeded shuffle; a race is honest by construction. Replay: opsDone = elapsed × opsPerSec.
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';
import { EASE_INOUT, EASE_OUT, prog } from './shorts';

// deterministic shuffle (LCG + Fisher-Yates) — Math.random is banned in renders
export const seededShuffle = (n: number, seed: number): number[] => {
  const arr = Array.from({ length: n }, (_, i) => i + 1);
  let s = (seed >>> 0) || 1;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export type SortOp = { a: number[]; hi: [number, number]; swap: boolean };

// classic bubble sort, one op per neighbor comparison (swap folded into the op)
export const bubbleSteps = (initial: number[]): SortOp[] => {
  const a = [...initial];
  const ops: SortOp[] = [];
  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - 1 - i; j++) {
      const doSwap = a[j] > a[j + 1];
      if (doSwap) [a[j], a[j + 1]] = [a[j + 1], a[j]];
      ops.push({ a: [...a], hi: [j, j + 1], swap: doSwap });
    }
  }
  return ops;
};

// quicksort (Lomuto), one op per pivot comparison + one per pivot placement
export const quickSteps = (initial: number[]): SortOp[] => {
  const a = [...initial];
  const ops: SortOp[] = [];
  const qs = (lo: number, hi: number) => {
    if (lo >= hi) return;
    const pivot = a[hi];
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      const doSwap = a[j] < pivot;
      if (doSwap) {
        i++;
        [a[i], a[j]] = [a[j], a[i]];
      }
      ops.push({ a: [...a], hi: [j, hi], swap: doSwap });
    }
    [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
    ops.push({ a: [...a], hi: [i + 1, hi], swap: true });
    qs(lo, i);
    qs(i + 2, hi);
  };
  qs(0, a.length - 1);
  return ops;
};

// state after opsDone operations (scrub-safe: pure function of the step list)
export const raceState = (initial: number[], steps: SortOp[], opsDone: number) => {
  const k = Math.max(0, Math.min(steps.length, Math.floor(opsDone)));
  if (k === 0) return { values: initial, hi: null as [number, number] | null, ops: 0, done: false };
  const op = steps[k - 1];
  return { values: op.a, hi: k >= steps.length ? null : op.hi, ops: k, done: k >= steps.length };
};

// =============================================================================
// SOLO-EXPLAINER HELPERS — one bubble-sort pass at a time (short-13), not a race.
// =============================================================================

// cumulative op-count at the END of each bubble-sort pass, e.g. n=6 -> [5,9,12,14,15].
// Each completed pass locks exactly one more element at the tail (the classic proof).
export const passBoundaries = (n: number): number[] => {
  const bounds: number[] = [];
  let acc = 0;
  for (let i = 0; i < n - 1; i++) {
    acc += n - 1 - i;
    bounds.push(acc);
  }
  return bounds;
};

// 1-indexed pass number containing op k (k counted 1..total).
export const passOfOp = (bounds: number[], k: number): number => {
  for (let i = 0; i < bounds.length; i++) if (k <= bounds[i]) return i + 1;
  return bounds.length;
};

// how many trailing elements are guaranteed in final position after kFloor ops.
export const sortedTailCount = (bounds: number[], kFloor: number): number => {
  let c = 0;
  for (const b of bounds) if (kFloor >= b) c++;
  return c;
};

// =============================================================================
// BAR PANEL — one racer: bars + label chip + live op counter + DONE badge.
// =============================================================================
export const BarPanel: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  color: string;
  values: number[];
  max: number;
  hi: [number, number] | null;
  ops: number;
  labelAt?: number; // local frame the label/counter pop in (negative = warm)
  doneAtFrame?: number; // local frame the DONE badge pops (omit = never)
  doneText?: string;
  good?: string;
}> = ({ x, y, w, h, label, color, values, max, hi, ops, labelAt = 0, doneAtFrame, doneText = 'DONE', good = '#4db8a8' }) => {
  const frame = useCurrentFrame();
  const labelIn = EASE_OUT(prog(frame, labelAt, labelAt + 10));
  const isDone = doneAtFrame !== undefined && frame >= doneAtFrame;
  const badgeIn = doneAtFrame === undefined ? 0 : EASE_OUT(prog(frame, doneAtFrame, doneAtFrame + 10));
  const pad = 22;
  const headH = 56;
  const n = values.length;
  const gap = 5;
  const bw = (w - pad * 2 - (n - 1) * gap) / n;
  const barArea = h - headH - pad * 2;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        background: 'rgba(255,255,255,0.035)',
        border: `2px solid ${isDone ? good + '88' : 'rgba(255,255,255,0.12)'}`,
        borderRadius: 24,
      }}
    >
      {/* label + counter */}
      <div style={{ position: 'absolute', top: 16, left: pad, right: pad, display: 'flex', justifyContent: 'space-between', opacity: labelIn }}>
        <span style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 32, letterSpacing: 4, color, textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 32, color: 'rgba(255,255,255,0.75)' }}>{ops} ops</span>
      </div>
      {/* bars */}
      {values.map((v, i) => {
        const active = !isDone && hi !== null && (i === hi[0] || i === hi[1]);
        const bh = Math.max(6, (v / max) * barArea);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: pad + i * (bw + gap),
              bottom: pad,
              width: bw,
              height: bh,
              borderRadius: 5,
              background: isDone ? good : active ? color : 'rgba(255,255,255,0.72)',
            }}
          />
        );
      })}
      {/* DONE badge */}
      {badgeIn > 0.01 ? (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) rotate(-5deg) scale(${1.5 - 0.5 * badgeIn})`,
            opacity: badgeIn,
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 58,
            letterSpacing: 4,
            color: good,
            border: `5px solid ${good}`,
            borderRadius: 14,
            padding: '6px 24px',
            background: 'rgba(10,12,14,0.8)',
            whiteSpace: 'nowrap',
          }}
        >
          {doneText}
        </div>
      ) : null}
    </div>
  );
};

// =============================================================================
// SORT BOARD — one array, one algorithm, explained (not raced). Bars carry value
// labels and the compared pair slides smoothly through its swap so the mechanism
// (not just the outcome) is legible. Pure function of `kFloat` — scrub-safe like
// `raceState`, but continuous rather than snapping instantly at each op boundary.
// =============================================================================
export const SortBoard: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  initial: number[];
  ops: SortOp[];
  max: number;
  kFloat: number; // continuous op position, 0..ops.length
  color?: string;
  good?: string;
}> = ({ x, y, w, h, initial, ops, max, kFloat, color = '#f5d76e', good = '#4db8a8' }) => {
  const n = initial.length;
  const bounds = passBoundaries(n);
  const kFloor = Math.max(0, Math.min(ops.length, Math.floor(kFloat)));
  const frac = kFloat - kFloor;
  const prevValues = kFloor === 0 ? initial : ops[kFloor - 1].a;
  const activeOp = kFloor < ops.length ? ops[kFloor] : null;
  // once every pass is done, the one element a pass boundary never explicitly locks
  // (index 0) is correct by elimination — show the whole array as sorted, not n-1 of it.
  const tailCount = activeOp === null ? n : sortedTailCount(bounds, kFloor);

  const COMPARE_PORTION = 0.4;
  const tCompareRaw = activeOp ? Math.min(1, frac / COMPARE_PORTION) : 0;
  const tResolveRaw = activeOp ? Math.max(0, (frac - COMPARE_PORTION) / (1 - COMPARE_PORTION)) : 1;
  const tResolve = EASE_INOUT(tResolveRaw);
  const bracketIn = EASE_OUT(prog(tCompareRaw, 0, 1)) * (1 - EASE_OUT(prog(tResolveRaw, 0, 0.35)));

  const pad = 30;
  const labelH = 54;
  const barArea = h - pad * 2 - labelH;
  const gap = 16;
  const bw = (w - pad * 2 - (n - 1) * gap) / n;
  const slotX = (i: number) => pad + i * (bw + gap);

  const p = activeOp ? activeOp.hi[0] : -1;
  const q = activeOp ? activeOp.hi[1] : -1;

  const bars = prevValues.map((value, i) => {
    const isActivePair = i === p || i === q;
    // only a REAL swap moves anything — a "no swap" comparison glows and settles back
    // in place; without this guard, non-swapping pairs still slid toward each other.
    const slot = isActivePair && activeOp!.swap ? i + tResolve * ((i === p ? q : p) - i) : i;
    const locked = i >= n - tailCount;
    // gate the highlight on ACTUAL progress (bracketIn / tResolveRaw), not merely on
    // being next in the op queue — otherwise the queued pair sits pre-painted in its
    // post-swap color for the entire idle stretch before kFloat starts moving.
    const glow = isActivePair ? bracketIn : 0;
    const justSwapped = isActivePair && activeOp!.swap && tResolveRaw > 0.02;
    const fillColor = locked ? good : justSwapped ? good : 'rgba(255,255,255,0.72)';
    const labelColor = justSwapped ? good : glow > 0.05 ? color : 'rgba(255,255,255,0.85)';
    // a neighbor-swap slides both bars through the SAME midpoint — without help they'd
    // overlap there. bubbleSteps only ever swaps when prevValues[p] > prevValues[q], so
    // p is always the bigger one: let it hop up and over while q slides along the floor,
    // which also reads as the metaphor (the bigger value "bubbles" past).
    const arc = isActivePair && activeOp!.swap && i === p ? Math.sin(Math.PI * Math.min(1, tResolveRaw)) * 80 : 0;
    return { value, slot, fillColor, labelColor, glow, arc };
  });

  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h }}>
      {bars.map((bar, i) => {
        const bh = Math.max(10, (bar.value / max) * barArea);
        const left = slotX(bar.slot);
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: 'absolute',
                left,
                bottom: pad,
                width: bw,
                height: bh,
                borderRadius: 8,
                background: bar.fillColor,
                transform: bar.arc > 0.5 ? `translateY(${-bar.arc}px)` : undefined,
                boxShadow: bar.glow > 0.05 ? `0 0 ${28 * bar.glow}px ${color}${Math.round(bar.glow * 160).toString(16).padStart(2, '0')}` : 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left,
                width: bw,
                bottom: pad + bh + 12 + bar.arc,
                textAlign: 'center',
                fontFamily: FONT_MONO,
                fontWeight: 700,
                fontSize: 40,
                color: bar.labelColor,
              }}
            >
              {bar.value}
            </div>
          </React.Fragment>
        );
      })}
      {/* comparison bracket: the "is left bigger?" question, before it resolves */}
      {activeOp && bracketIn > 0.01 ? (
        <div
          style={{
            position: 'absolute',
            left: (slotX(p) + slotX(q)) / 2 + bw / 2 - 30,
            bottom: pad + barArea + labelH - 6,
            width: 60,
            textAlign: 'center',
            opacity: bracketIn,
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 44,
            color: activeOp.swap ? good : color,
          }}
        >
          {activeOp.swap ? '>' : '≤'}
        </div>
      ) : null}
    </div>
  );
};
