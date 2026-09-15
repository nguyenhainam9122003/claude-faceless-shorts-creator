import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import {
  BigTitle,
  Captions,
  EASE_INOUT,
  Kicker,
  PauseCard,
  ProgressBar,
  ShortsBackdrop,
  StatChip,
  prog,
} from '../../lib/shorts';
import { SortBoard, bubbleSteps, passBoundaries, passOfOp, seededShuffle } from '../../lib/algo';
import { FONT_BODY } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short13Bubble',
  durationInSeconds: 40,
  fps: 30,
  width: 1080,
  height: 1920,
};

// =============================================================================
// STYLE CONSTANTS
// =============================================================================
const GOLD = '#f5d76e';
const GREEN = '#4db8a8';

// =============================================================================
// PRE-GENERATED DATA — the REAL sort (same list, same steps `raceState` would use).
// =============================================================================
const N = 6;
const INITIAL = seededShuffle(N, 1); // [5, 1, 4, 3, 6, 2]
const OPS = bubbleSteps(INITIAL); // 15 ops, always n(n-1)/2 for this classic (no early-exit) version
const BOUNDS = passBoundaries(N); // [5, 9, 12, 14, 15]
const TOTAL_PASSES = BOUNDS.length; // 5
const TOTAL_SWAPS = OPS.filter((o) => o.swap).length; // 8, for THIS shuffle

const BOARD = { x: 60, w: 960, h: 520 } as const;

// Reveal pacing: pass 1 (ops 0..4) walked slowly — 42 frames/op, so each comparison
// is readable. Ops 5..14 (passes 2-5) are a 12-frame/op time-lapse. Piecewise-linear,
// pure function of the reveal-local frame — scrub-safe, same discipline as short-3's
// `opsDone = elapsed * opsPerSec`.
const PASS1_OPS = BOUNDS[0]; // 5
const PASS1_FRAMES_PER_OP = 42;
const FAST_FRAMES_PER_OP = 12;
const PASS1_END_FRAME = PASS1_OPS * PASS1_FRAMES_PER_OP; // 210
const kFloatOf = (revealFrame: number): number => {
  if (revealFrame <= 0) return 0;
  if (revealFrame < PASS1_END_FRAME) return revealFrame / PASS1_FRAMES_PER_OP;
  const rest = revealFrame - PASS1_END_FRAME;
  return Math.min(OPS.length, PASS1_OPS + rest / FAST_FRAMES_PER_OP);
};

// Local frame boundaries inside MainScene (mounted at global 3.4s / frame 102).
// global_s = 3.4 + local_f / 30 — every cue below double-checked against beats.json.
const SETUP_END = 360; // -> global 15.4s
const QUIZ_END = 456; // -> global 18.6s (96-frame PauseCard, 3.2s)
const REVEAL_START = QUIZ_END; // detailed pass 1 begins the instant the quiz clears
// pass-1-detail ends at REVEAL_START + PASS1_END_FRAME = 666 -> global 25.6s
const SETTLE_START = 786; // -> global 29.6s (time-lapse of ops 5..14 finishes here)
const TWIST_START = 888; // -> global 33.0s
const MAIN_DURATION = 1038; // -> global 38.0s

// =============================================================================
// BUBBLE MOTIF — the metaphor made literal: a small ring drifts up and fades,
// looping softly beside the board. Local to this short (not a reusable algo shape).
// =============================================================================
const BubbleMotif: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const frame = useCurrentFrame();
  const cycle = 70;
  const t = (frame % cycle) / cycle;
  const rise = t * 110;
  const fade = t < 0.18 ? t / 0.18 : t > 0.82 ? (1 - t) / 0.18 : 1;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y - rise,
        width: 24,
        height: 24,
        borderRadius: '50%',
        border: `3px solid ${GREEN}`,
        opacity: fade * 0.8,
      }}
    />
  );
};

// =============================================================================
// SCENES
// =============================================================================
// Hook/loop: the SAME finished board on both ends of the loop (frame-0 rule) —
// mode="settle" punches in and settles (warm BigTitle, already composed at f0);
// mode="grow" reverses that punch so the last frame rhymes with the first.
const HookScene: React.FC<{ mode: 'settle' | 'grow' }> = ({ mode }) => {
  const frame = useCurrentFrame();
  const scale =
    mode === 'settle'
      ? 1.06 - 0.06 * EASE_INOUT(prog(frame, 0, 28))
      : 1.0 + 0.06 * EASE_INOUT(prog(frame, 0, 60));
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})` }}>
      <BigTitle
        lines={[
          { text: 'SẮP XẾP', color: '#ffffff' },
          { text: 'NỔI BỌT', color: GOLD },
        ]}
        subtitle="chậm nhất · dễ hiểu nhất"
        warm={mode === 'settle'}
      />
      <SortBoard x={BOARD.x} y={620} w={BOARD.w} h={BOARD.h} initial={INITIAL} ops={OPS} max={N} kFloat={OPS.length} good={GREEN} color={GOLD} />
      <BubbleMotif x={BOARD.x + BOARD.w - 50} y={600} />
    </AbsoluteFill>
  );
};

// The persistent explainer: rule -> quiz -> pass 1 in detail -> time-lapse -> stats.
// One board, one timeline — nothing cuts away from it.
const MainScene: React.FC = () => {
  const frame = useCurrentFrame();
  const revealFrame = Math.max(0, frame - REVEAL_START);
  const kFloat = kFloatOf(revealFrame);
  const kFloor = Math.min(OPS.length, Math.floor(kFloat));
  const currentPass = kFloor >= OPS.length ? TOTAL_PASSES : passOfOp(BOUNDS, kFloor + 1);
  const setupIn = prog(frame, 0, 20);
  const passLabelOn = frame >= REVEAL_START && frame < TWIST_START;

  return (
    <AbsoluteFill>
      <Kicker text="LUẬT CHƠI" at={10} until={SETUP_END} />
      {passLabelOn ? (
        <div style={{ position: 'absolute', top: 180, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              fontFamily: FONT_BODY,
              fontWeight: 600,
              fontSize: 30,
              letterSpacing: 6,
              textTransform: 'uppercase',
              color: GOLD,
              border: `2px solid ${GOLD}55`,
              borderRadius: 999,
              padding: '12px 30px',
              background: 'rgba(0,0,0,0.35)',
            }}
          >
            {`LƯỢT ${currentPass} / ${TOTAL_PASSES}`}
          </div>
        </div>
      ) : null}

      <div style={{ opacity: setupIn }}>
        <SortBoard x={BOARD.x} y={640} w={BOARD.w} h={BOARD.h} initial={INITIAL} ops={OPS} max={N} kFloat={kFloat} good={GREEN} color={GOLD} />
      </div>

      {/* pause quiz, parked above the board so it never collides with the bars */}
      <Sequence from={SETUP_END} durationInFrames={QUIZ_END - SETUP_END}>
        <PauseCard durSec={(QUIZ_END - SETUP_END) / 30} title="DỪNG LẠI" subtitle="số nào về đúng chỗ trước?" y={430} accent={GOLD} />
      </Sequence>

      {/* settle stat: real counts off the actual step list, never hardcoded */}
      {frame >= SETTLE_START && frame < TWIST_START ? (
        <StatChip
          label="6 PHẦN TỬ"
          value={`${OPS.length} phép so sánh · ${TOTAL_SWAPS} lần đổi chỗ`}
          color={GREEN}
          x={90}
          y={1230}
          w={900}
          at={SETTLE_START + 4}
        />
      ) : null}

      {/* twist: same n(n-1)/2 formula, stated at real scale */}
      {frame >= TWIST_START ? (
        <StatChip label="1.000.000 PHẦN TỬ" value="~500 tỷ phép so sánh" color={GOLD} x={90} y={1230} w={900} at={TWIST_START + 6} />
      ) : null}
    </AbsoluteFill>
  );
};

// =============================================================================
// ROOT
// =============================================================================
const Short13Bubble: React.FC = () => {
  return (
    <AbsoluteFill>
      <ShortsBackdrop />
      <Sequence from={0} durationInFrames={102}>
        <HookScene mode="settle" />
      </Sequence>
      <Sequence from={102} durationInFrames={MAIN_DURATION}>
        <MainScene />
      </Sequence>
      <Sequence from={102 + MAIN_DURATION} durationInFrames={60}>
        <HookScene mode="grow" />
      </Sequence>
      <Captions lines={VO} y={1500} accent={GOLD} />
      <ProgressBar color={GOLD} />
    </AbsoluteFill>
  );
};

export default Short13Bubble;
