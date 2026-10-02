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
import { GaugeLabel, HydrationColorScale } from '../../lib/health';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short15Urine',
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
const NEON = '#eaff4e';

// =============================================================================
// VERIFIED DATA — Armstrong LE et al., Int J Sport Nutr, 1994. 8-shade chart,
// validated against urine specific gravity (r = 0.80). Bands 1-3 = well hydrated.
// =============================================================================
const BANDS = ['#F7F4DA', '#F3EEB8', '#EEE48C', '#E8D54A', '#DCC02A', '#C99B12', '#A66A00', '#6B4423'];
const HYDRATED_MAX = 3; // bands 1-3

const SCALE = { x: 380, y: 520, w: 220, h: 380 };

// pointer position, continuous (1..8), one function of the MainScene-local frame —
// same "scrub-safe single source of truth" contract as short-14's `levelOf`.
const PALE_START = 1.6;
const DARK_TARGET = 7.2;
const HYDRATED_TARGET = 2.0;
const SWEEP_DOWN_START = 40;
const SWEEP_DOWN_END = 300;
const SWEEP_UP_START = 470;
const SWEEP_UP_END = 650;
const pointerBandOf = (f: number): number => {
  if (f < SWEEP_DOWN_START) return PALE_START;
  if (f < SWEEP_DOWN_END) return PALE_START + (DARK_TARGET - PALE_START) * EASE_INOUT(prog(f, SWEEP_DOWN_START, SWEEP_DOWN_END));
  if (f < SWEEP_UP_START) return DARK_TARGET;
  if (f < SWEEP_UP_END) return DARK_TARGET + (HYDRATED_TARGET - DARK_TARGET) * EASE_OUT(prog(f, SWEEP_UP_START, SWEEP_UP_END));
  return HYDRATED_TARGET;
};

// Local frame boundaries inside MainScene (mounted at global 3.4s / frame 102).
const SETUP_END = 330; // -> global 14.4s
const QUIZ_END = 438; // -> global 18.0s (108-frame PauseCard, 3.6s)
const REVEAL_END = 828; // -> global 31.0s (matches script.md's beat table exactly)
const TWIST_START = REVEAL_END;
const MAIN_DURATION = 1038; // -> global 38.0s

// =============================================================================
// SCENES
// =============================================================================
// Hook/loop: the SAME well-hydrated reading on both ends of the loop (frame-0 rule).
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
          { text: 'WHAT YOUR PEE', color: '#ffffff' },
          { text: 'COLOR MEANS', color: TEAL },
        ]}
        warm={mode === 'settle'}
      />
      <HydrationColorScale x={SCALE.x} y={SCALE.y} w={SCALE.w} h={SCALE.h} bands={BANDS} pointerBand={HYDRATED_TARGET} pointerColor={TEAL} />
      <GaugeLabel x={SCALE.x - 90} y={SCALE.y + SCALE.h + 20} w={SCALE.w + 180} text="a chemistry readout, not a guess" />
    </AbsoluteFill>
  );
};

// The persistent explainer: the mechanism -> quiz -> the validated chart -> the
// multivitamin confounder. One scale, one timeline — nothing cuts away from it.
const MainScene: React.FC = () => {
  const frame = useCurrentFrame();
  const pointerBand = pointerBandOf(frame);
  const setupIn = prog(frame, 0, 20);
  const hydrated = pointerBand <= HYDRATED_MAX + 0.5;
  const inTwist = frame >= TWIST_START;

  return (
    <AbsoluteFill>
      <Kicker text={frame < SETUP_END ? 'THE MECHANISM' : frame < REVEAL_END ? 'THE VALIDATED SCALE' : 'THE MULTIVITAMIN TRAP'} at={10} />

      <div style={{ opacity: setupIn }}>
        <HydrationColorScale x={SCALE.x} y={SCALE.y} w={SCALE.w} h={SCALE.h} bands={BANDS} pointerBand={pointerBand} pointerColor={hydrated ? TEAL : GOLD} />
      </div>

      {/* quiz, parked below the scale so it never collides with the bands */}
      <Sequence from={SETUP_END} durationInFrames={QUIZ_END - SETUP_END}>
        <PauseCard durSec={(QUIZ_END - SETUP_END) / 30} title="GUESS" subtitle="which shade means hydrated?" y={1120} accent={GOLD} />
      </Sequence>

      {/* the validated answer, off the 1994 chart */}
      {frame >= SWEEP_UP_END && frame < TWIST_START ? (
        <>
          <GaugeLabel x={SCALE.x - 90} y={SCALE.y - 50} w={SCALE.w + 180} text="well hydrated" color={TEAL} />
          <StatChip
            label="VALIDATED, 1994"
            value="r = 0.80 vs lab hydration tests (Armstrong et al.)"
            color={TEAL}
            x={140}
            y={1000}
            w={800}
            at={SWEEP_UP_END + 10}
          />
        </>
      ) : null}

      {/* the confounder — drawn OFF the scale; the pointer itself never moves for this,
          because riboflavin changes nothing the 1994 chart was validated against */}
      {inTwist ? (
        <StatChip
          label="RIBOFLAVIN (VITAMIN B2)"
          value="bright, neon yellow — not a hydration signal"
          color={NEON}
          x={140}
          y={1000}
          w={800}
          at={TWIST_START + 10}
        />
      ) : null}
    </AbsoluteFill>
  );
};

// =============================================================================
// ROOT
// =============================================================================
const Short15Urine: React.FC = () => {
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

export default Short15Urine;
