import React, { useId } from 'react';

interface SparklineProps {
  data: number[];
  width?: number | string;
  height?: number | string;
  color?: string;
  fillId?: string;
  formatValue?: (v: number) => string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = '100%',
  height = '100%',
  color = '#7aa2f7',
  fillId,
}) => {
  const generatedId = useId().replace(/:/g, '_');
  const gradientId = fillId || `sparkline-grad-${generatedId}`;

  let values = data || [];
  if (values.length < 2) {
    values = values.length === 1 ? [values[0], values[0]] : [0, 0];
  }

  const svgWidth = 200;
  const svgHeight = 50;
  const paddingY = 4;
  const usableHeight = svgHeight - paddingY * 2;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const hasRange = max > min;
  const range = hasRange ? max - min : 1;

  const coords = values.map((val, index) => {
    const x = (index / (values.length - 1)) * svgWidth;
    const y = hasRange
      ? svgHeight - paddingY - ((val - min) / range) * usableHeight
      : svgHeight - paddingY - (val > 0 ? usableHeight / 2 : 2);
    return { x, y };
  });

  // Smooth cubic bezier path generator
  const getBezierPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = (p0.x + (p1.x - p0.x) / 2).toFixed(1);
      const cpY1 = p0.y.toFixed(1);
      const cpX2 = (p0.x + (p1.x - p0.x) / 2).toFixed(1);
      const cpY2 = p1.y.toFixed(1);
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
    }
    return d;
  };

  const linePath = getBezierPath(coords);
  const areaPath = coords.length > 0
    ? `${linePath} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`
    : '';

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      preserveAspectRatio="none"
      style={{ overflow: 'hidden', display: 'block', width: '100%', height: '100%' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {areaPath && (
        <path
          d={areaPath}
          fill={`url(#${gradientId})`}
        />
      )}
      {linePath && (
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
};

export default Sparkline;
