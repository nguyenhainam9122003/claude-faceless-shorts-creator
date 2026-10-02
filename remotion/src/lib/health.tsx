// Health & body kit — a hydration-level gauge + day/night sky icon. Seeds short-14
// (why drink water in the morning) and is built generic enough for the rest of a
// body-facts niche (electrolytes, sleep debt, caffeine half-life...): any story whose
// shape is "a level that drains or fills over time" can reuse `HydrationTank`.
// The numeric-curve half of that niche (a value rising/falling against a verified
// data point) reuses `lib/chart.tsx`'s `makeScale`/`Curve`/`EndDot` unchanged — those
// are generic x/y-to-pixel plotting, not money-specific despite the file they live in.
import React from 'react';
import { FONT_BODY } from '../fonts';

// =============================================================================
// HYDRATION TANK — a rounded-capsule level gauge. `level` is 0..1, continuous, so a
// shot can lerp it across a night/day exactly like short-13's `kFloat` drives a sort.
// =============================================================================
export const HydrationTank: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  level: number; // 0..1
  color?: string;
  lowColor?: string;
  lowThreshold?: number; // below this, the fill switches to lowColor (a dehydration tint)
  showLine?: boolean; // draw a reference dash at lowThreshold
}> = ({ x, y, w, h, level, color = '#4ecdc4', lowColor = '#e8879f', lowThreshold = 0.75, showLine = true }) => {
  const clamped = Math.max(0, Math.min(1, level));
  const fillH = clamped * h;
  const fillColor = clamped < lowThreshold ? lowColor : color;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: w / 2,
        border: '3px solid rgba(255,255,255,0.28)',
        background: 'rgba(255,255,255,0.04)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: '100%',
          height: fillH,
          background: fillColor,
          opacity: 0.85,
        }}
      />
      {showLine ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: lowThreshold * h,
            borderTop: '2px dashed rgba(255,255,255,0.35)',
          }}
        />
      ) : null}
    </div>
  );
};

// =============================================================================
// SKY ICON — sun or moon, minimal geometry (no risky SVG paths: rays are straight
// lines, the moon crescent is two overlapping circles — the classic safe technique).
// =============================================================================
export const SkyIcon: React.FC<{
  x: number;
  y: number;
  variant: 'sun' | 'moon';
  size?: number;
  color?: string;
  opacity?: number;
}> = ({ x, y, variant, size = 60, color = '#f5d76e', opacity = 1 }) => {
  if (opacity <= 0.01) return null;
  const r = size / 2;
  if (variant === 'moon') {
    return (
      <div style={{ position: 'absolute', left: x - r, top: y - r, width: size, height: size, opacity }}>
        <div style={{ position: 'absolute', width: size, height: size, borderRadius: '50%', background: color }} />
        <div
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: '50%',
            background: '#0f1216',
            left: size * 0.32,
            top: -size * 0.08,
          }}
        />
      </div>
    );
  }
  const rays = Array.from({ length: 8 }, (_, i) => (i * 360) / 8);
  return (
    <div style={{ position: 'absolute', left: x - r, top: y - r, width: size, height: size, opacity }}>
      <svg width={size} height={size} style={{ position: 'absolute', overflow: 'visible' }}>
        {rays.map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = r + Math.cos(rad) * (r * 0.85);
          const y1 = r + Math.sin(rad) * (r * 0.85);
          const x2 = r + Math.cos(rad) * (r * 1.35);
          const y2 = r + Math.sin(rad) * (r * 1.35);
          return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={4} strokeLinecap="round" />;
        })}
        <circle cx={r} cy={r} r={r * 0.62} fill={color} />
      </svg>
    </div>
  );
};

// =============================================================================
// HYDRATION COLOR SCALE — N horizontal bands (index 0 = palest, top) + a pointer
// at a continuous position (1..bands.length). Seeds short-15 (urine color chart);
// the lib only draws — the shot decides what label rides alongside the pointer,
// same "lib draws, shot narrates" split as `lib/chart.tsx`'s `Curve`/`EndDot`.
// =============================================================================
export const HydrationColorScale: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  bands: string[]; // hex colors, index 0 = palest (top)
  pointerBand: number; // continuous, 1..bands.length
  pointerColor?: string;
}> = ({ x, y, w, h, bands, pointerBand, pointerColor = '#ffffff' }) => {
  const n = bands.length;
  const bandH = h / n;
  const clamped = Math.max(1, Math.min(n, pointerBand));
  const pointerY = y + (clamped - 0.5) * bandH;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: w,
          height: h,
          borderRadius: 16,
          overflow: 'hidden',
          border: '3px solid rgba(255,255,255,0.28)',
        }}
      >
        {bands.map((c, i) => (
          <div key={i} style={{ position: 'absolute', left: 0, top: i * bandH, width: '100%', height: bandH + 1, background: c }} />
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: x + w + 16,
          top: pointerY,
          transform: 'translateY(-50%)',
          width: 0,
          height: 0,
          borderTop: '18px solid transparent',
          borderBottom: '18px solid transparent',
          borderRight: `22px solid ${pointerColor}`,
        }}
      />
    </>
  );
};

// small caption-style label under a gauge ("FULL" / "LOW" / a live percentage)
export const GaugeLabel: React.FC<{ x: number; y: number; w: number; text: string; color?: string }> = ({
  x,
  y,
  w,
  text,
  color = 'rgba(255,255,255,0.85)',
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      textAlign: 'center',
      fontFamily: FONT_BODY,
      fontWeight: 600,
      fontSize: 30,
      letterSpacing: 3,
      textTransform: 'uppercase',
      color,
    }}
  >
    {text}
  </div>
);
