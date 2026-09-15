import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import {
  BigTitle,
  Captions,
  EASE_INOUT,
  EASE_OUT,
  Kicker,
  PauseCard,
  ProgressBar,
  ShortsBackdrop,
  StatChip,
  prog,
} from '../../lib/shorts';
import { GaugeLabel, HydrationTank, SkyIcon } from '../../lib/health';
import { Curve, EndDot, makeScale } from '../../lib/chart';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short14Water',
  durationInSeconds: 40,
  fps: 30,
  width: 1080,
  height: 1920,
};

// =============================================================================
// STYLE CONSTANTS
// =============================================================================
const GOLD = '#f5d76e';
const TEAL = '#4ecdc4';
const PINK = '#e8879f';

// =============================================================================
// VERIFIED DATA — Boschmann et al., J Clin Endocrinol Metab 88(12):6015-6019, 2003.
// Solid curve = what the paper actually measured (rise to +30% at ~35 min). The
// dashed continuation is a QUALITATIVE "then fades" gesture — deliberately unlabeled,
// so the picture never asserts a decay number the source doesn't give.
// =============================================================================
const RMR_SOLID = [
  { x: 0, y: 0 },
  { x: 10, y: 18 },
  { x: 20, y: 25 },
  { x: 35, y: 30 },
];
const RMR_DASHED = [
  { x: 35, y: 30 },
  { x: 60, y: 10 },
];
const OVERNIGHT_LOSS_ML = 300; // ~1/3 of ~800 mL/day insensible loss (skin + respiratory)

const TANK = { x: 410, y: 520, w: 260, h: 380 };

// tank fill level, continuous, one function of the MainScene-local frame — scrub-safe.
const LOW_LEVEL = 0.62;
const REFILL_LEVEL = 0.82; // one glass is a partial refill, never back to "bedtime full"
const NIGHT_START = 40;
const NIGHT_END = 300;
const REFILL_START = 812;
const REFILL_END = 900;
const levelOf = (f: number): number => {
  if (f < NIGHT_START) return 1;
  if (f < NIGHT_END) return 1 - (1 - LOW_LEVEL) * EASE_INOUT(prog(f, NIGHT_START, NIGHT_END));
  if (f < REFILL_START) return LOW_LEVEL;
  if (f < REFILL_END) return LOW_LEVEL + (REFILL_LEVEL - LOW_LEVEL) * EASE_OUT(prog(f, REFILL_START, REFILL_END));
  return REFILL_LEVEL;
};

// Local frame boundaries inside MainScene (mounted at global 3.4s / frame 102).
const SETUP_END = 330; // -> global 14.4s
const QUIZ_END = 438; // -> global 18.0s (108-frame PauseCard, 3.6s)
const REVEAL_END = 798; // -> global 30.0s
const TWIST_START = REVEAL_END; // 798 -> global 30.0s
const MAIN_DURATION = 1038; // -> global 38.0s

// =============================================================================
// SCENES
// =============================================================================
// Hook/loop: the SAME low-morning gauge on both ends of the loop (frame-0 rule).
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
          { text: 'WHY DRINK WATER', color: '#ffffff' },
          { text: 'IN THE MORNING', color: TEAL },
        ]}
        warm={mode === 'settle'}
      />
      <SkyIcon x={540} y={460} variant="sun" color={GOLD} />
      <HydrationTank x={TANK.x} y={TANK.y} w={TANK.w} h={TANK.h} level={LOW_LEVEL} color={TEAL} lowColor={PINK} />
      <GaugeLabel x={TANK.x - 70} y={TANK.y + TANK.h + 20} w={TANK.w + 140} text="mild overnight dehydration" />
    </AbsoluteFill>
  );
};

// The persistent explainer: bedtime -> night drain -> quiz -> the real number -> the
// morning-glass payoff. One gauge, one timeline — nothing cuts away from it.
const MainScene: React.FC = () => {
  const frame = useCurrentFrame();
  const level = levelOf(frame);
  const moonOpacity = 1 - EASE_OUT(prog(frame, 260, 320));
  const sunOpacity = EASE_OUT(prog(frame, 260, 320));
  const setupIn = prog(frame, 0, 20);

  const inTwist = frame >= TWIST_START;
  const chartBox = { x: 140, y: 1000, w: 800, h: 260 };
  const scale = makeScale([0, 60], [0, 32], chartBox);
  const solidP = prog(frame, TWIST_START + 20, TWIST_START + 170);
  const dashedP = prog(frame, TWIST_START + 170, TWIST_START + 220);

  return (
    <AbsoluteFill>
      <Kicker text={frame < SETUP_END ? 'THE LONG NIGHT' : frame < REVEAL_END ? 'THE REAL NUMBER' : 'THE MORNING GLASS'} at={10} />

      <div style={{ opacity: setupIn }}>
        <SkyIcon x={540} y={460} variant="moon" color="#cfd8e3" opacity={moonOpacity} />
        <SkyIcon x={540} y={460} variant="sun" color={GOLD} opacity={sunOpacity} />
        <HydrationTank x={TANK.x} y={TANK.y} w={TANK.w} h={TANK.h} level={level} color={TEAL} lowColor={PINK} />
      </div>

      {/* quiz, parked below the tank so it never collides with the gauge */}
      <Sequence from={SETUP_END} durationInFrames={QUIZ_END - SETUP_END}>
        <PauseCard durSec={(QUIZ_END - SETUP_END) / 30} title="GUESS" subtitle="how much water, just sleeping?" y={1120} accent={GOLD} />
      </Sequence>

      {/* the real number, off real physiology (insensible loss ~800 mL/day, ~1/3 overnight) */}
      {frame >= QUIZ_END && frame < TWIST_START ? (
        <StatChip
          label={`~${OVERNIGHT_LOSS_ML} ML LOST OVERNIGHT`}
          value="breathing out humid air + sweat off your skin, even at rest"
          color={PINK}
          x={140}
          y={1000}
          w={800}
          at={QUIZ_END + 6}
        />
      ) : null}

      {/* the metabolism payoff — solid line is exactly what the paper measured */}
      {inTwist ? (
        <>
          <GaugeLabel x={chartBox.x} y={chartBox.y - 46} w={chartBox.w} text="resting metabolic rate" color={GOLD} />
          <Curve scale={scale} pts={RMR_SOLID} color={GOLD} p={solidP} />
          <Curve scale={scale} pts={RMR_DASHED} color={GOLD} p={dashedP} dashed opacity={0.45} glow={0} />
          {/* label="" (not `value=`): the number rides the curve head, so it climbs to
              +30% exactly as the line draws instead of announcing the payoff up front */}
          <EndDot scale={scale} pts={RMR_SOLID} p={Math.min(1, solidP)} color={GOLD} label="" format={(v) => `+${Math.round(v)}%`} pulse={solidP >= 0.99 ? 1 : 0} />
          <GaugeLabel x={chartBox.x} y={chartBox.y + chartBox.h + 20} w={chartBox.w} text="500 mL water, one glass" color="rgba(255,255,255,0.6)" />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// =============================================================================
// ROOT
// =============================================================================
const Short14Water: React.FC = () => {
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
      <ProgressBar color={TEAL} />
    </AbsoluteFill>
  );
};

export default Short14Water;
