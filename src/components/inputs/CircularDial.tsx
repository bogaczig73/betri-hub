"use client";

import { useCallback, useId, useRef } from "react";

/**
 * A circular gauge slider (iPhone "bedtime"-style). The value spans a 270° arc
 * with a gap at the bottom. Drag the thumb, or use arrow keys.
 */
interface CircularDialProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  /** Big formatted value shown in the centre. */
  format: (value: number) => string;
  label?: string;
  size?: number;
}

const START_ANGLE = 135; // degrees, bottom-left
const SWEEP = 270; // degrees of travel

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, from: number, to: number) {
  const start = polar(cx, cy, r, from);
  const end = polar(cx, cy, r, to);
  const largeArc = to - from > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function snap(value: number, step: number, min: number, max: number) {
  const snapped = Math.round((value - min) / step) * step + min;
  return Math.min(max, Math.max(min, Number(snapped.toFixed(6))));
}

export function CircularDial({
  value,
  min,
  max,
  step,
  onChange,
  format,
  label,
  size = 240,
}: CircularDialProps) {
  const ref = useRef<SVGSVGElement>(null);
  const id = useId();
  const stroke = 16;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - stroke;

  const t = max > min ? (value - min) / (max - min) : 0;
  const angle = START_ANGLE + Math.min(1, Math.max(0, t)) * SWEEP;
  const thumb = polar(cx, cy, r, angle);

  const handlePoint = useCallback(
    (clientX: number, clientY: number) => {
      const svg = ref.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const px = ((clientX - rect.left) / rect.width) * size;
      const py = ((clientY - rect.top) / rect.height) * size;
      let deg = (Math.atan2(py - cy, px - cx) * 180) / Math.PI;
      if (deg < START_ANGLE) deg += 360; // wrap into [135, 495)
      const end = START_ANGLE + SWEEP; // 405
      let ratio: number;
      if (deg > end) {
        // In the bottom gap — clamp to the nearer end.
        ratio = deg < end + (360 - SWEEP) / 2 ? 1 : 0;
      } else {
        ratio = (deg - START_ANGLE) / SWEEP;
      }
      onChange(snap(min + ratio * (max - min), step, min, max));
    },
    [cx, cy, max, min, onChange, size, step],
  );

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    handlePoint(e.clientX, e.clientY);
  };
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.buttons !== 1) return;
    handlePoint(e.clientX, e.clientY);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      e.preventDefault();
      onChange(snap(value + step, step, min, max));
    } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      e.preventDefault();
      onChange(snap(value - step, step, min, max));
    }
  };

  return (
    <div className="flex flex-col items-center">
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="touch-none select-none"
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={format(value)}
        aria-describedby={id}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onKeyDown={onKeyDown}
      >
        <path
          d={arcPath(cx, cy, r, START_ANGLE, START_ANGLE + SWEEP)}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {t > 0 ? (
          <path
            d={arcPath(cx, cy, r, START_ANGLE, angle)}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
        ) : null}
        <circle
          cx={thumb.x}
          cy={thumb.y}
          r={stroke - 2}
          fill="var(--card)"
          stroke="var(--primary)"
          strokeWidth={4}
        />
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-display"
          fontSize={size * 0.2}
          fontWeight={700}
          fill="var(--foreground)"
        >
          {format(value)}
        </text>
        {label ? (
          <text
            x={cx}
            y={cy + size * 0.16}
            textAnchor="middle"
            fontSize={size * 0.06}
            fill="var(--muted-foreground)"
            style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
          >
            {label}
          </text>
        ) : null}
      </svg>
      <span id={id} className="sr-only">
        Use arrow keys to adjust {label}.
      </span>
    </div>
  );
}
