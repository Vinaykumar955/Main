import { cn } from "@/lib/utils";

export interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  className?: string;
  showLastDot?: boolean;
}

export function Sparkline({
  values,
  width = 80,
  height = 22,
  stroke = "currentColor",
  fill = "transparent",
  className,
  showLastDot = true,
}: SparklineProps) {
  if (!values.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / Math.max(1, values.length - 1);
  const points = values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height - 2) - 1;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  const last = values[values.length - 1] ?? 0;
  const lastX = (values.length - 1) * stepX;
  const lastY = height - ((last - min) / range) * (height - 2) - 1;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("block", className)}
      aria-hidden="true"
    >
      {fill !== "transparent" && (
        <polygon
          points={`0,${height} ${points} ${width},${height}`}
          fill={fill}
          fillOpacity={0.15}
        />
      )}
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth={1}
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      {showLastDot && (
        <circle cx={lastX} cy={lastY} r={1.5} fill={stroke} />
      )}
    </svg>
  );
}
