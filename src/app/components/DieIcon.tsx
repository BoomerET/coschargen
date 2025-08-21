// src/components/DieIcon.tsx
import * as React from "react";

type DieIconProps = {
  /** Number of faces, e.g. 4, 6, 8, 10, 12. Use 0 to show a slashed circle. */
  sides: number;
  /** Tailwind/utility classes to size/color the stroke. */
  className?: string;
  /** Size of the square viewBox in px (rendered width/height if no class sets it). */
  size?: number;
  /** Title for accessibility (e.g., "d8 die"). */
  title?: string;
};

export default function DieIcon({
  sides,
  className,
  size = 24,
  title,
}: DieIconProps) {
  // SVG setup
  const vb = 24;
  const cx = 12;
  const cy = 12;
  const r = 9; // radius for polygon

  // Build points for a regular polygon, pointing up (-90deg)
  const toPoints = (n: number) => {
    const pts: Array<[number, number]> = [];
    for (let i = 0; i < n; i++) {
      const angle = ((2 * Math.PI) / n) * i - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      pts.push([x, y]);
    }
    return pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${vb} ${vb}`}
      role="img"
      aria-label={title || (sides > 0 ? `d${sides} die` : "d0 die")}
      className={className}
    >
      {title ? <title>{title}</title> : null}

      {sides > 2 ? (
        <polygon
          points={toPoints(sides)}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      ) : (
        // d0 or invalid -> slashed circle
        <>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
          />
          <line
            x1={cx - r * 0.75}
            y1={cy - r * 0.75}
            x2={cx + r * 0.75}
            y2={cy + r * 0.75}
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

