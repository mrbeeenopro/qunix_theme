import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrochip, faMemory, faHardDrive } from '@fortawesome/free-solid-svg-icons';
import { GaugeChart, MatrixChart, DonutChart } from '@mantine/charts';
import { bytesToString, mbToBytes } from '@/lib/format/size.ts';
import QunixNetworkAreaChart from './QunixNetworkAreaChart.tsx';

export interface QunixResourceChartsProps {
  cpuAbsolute?: number;
  cpuLimit?: number;
  memoryBytes?: number;
  memoryLimitMb?: number;
  diskBytes?: number;
  diskLimitMb?: number;
  rxBytes?: number;
  txBytes?: number;
  serverUuid?: string;
  previewMode?: boolean;
}

export const QunixResourceCharts: React.FC<QunixResourceChartsProps> = ({
  cpuAbsolute,
  cpuLimit,
  memoryBytes,
  memoryLimitMb,
  diskBytes,
  diskLimitMb,
  rxBytes,
  txBytes,
  serverUuid,
  previewMode = false,
}) => {
  // If previewMode is true or values are undefined, provide sample values matching Image 2
  const isPreview = previewMode || (cpuAbsolute === undefined && memoryBytes === undefined && diskBytes === undefined);

  // Read theme colors dynamically from Qunix settings / CSS variables (no hardcoded colors!)
  const [themeColors, setThemeColors] = useState(() => {
    const s = (typeof window !== 'undefined' ? (window as any).qunixThemeSettings : null) || {};
    const rootStyle = typeof window !== 'undefined' ? getComputedStyle(document.documentElement) : null;
    const cpu = s.chart_series_1_border || rootStyle?.getPropertyValue('--chart-series-1-border')?.trim() || '#22d3ee';
    const mem = s.chart_series_2_border || rootStyle?.getPropertyValue('--chart-series-2-border')?.trim() || '#a855f7';
    const disk = s.chart_series_1_fill || s.button_color || rootStyle?.getPropertyValue('--chart-series-1-fill')?.trim() || '#38bdf8';
    const netIn = s.network_in_color || s.chart_series_1_border || rootStyle?.getPropertyValue('--chart-series-1-border')?.trim() || '#38bdf8';
    const netOut = s.network_out_color || s.chart_series_2_border || rootStyle?.getPropertyValue('--chart-series-2-border')?.trim() || '#a855f7';
    return { cpu, mem, disk, netIn, netOut };
  });

  useEffect(() => {
    const updateColors = () => {
      const s = (typeof window !== 'undefined' ? (window as any).qunixThemeSettings : null) || {};
      const rootStyle = typeof window !== 'undefined' ? getComputedStyle(document.documentElement) : null;
      const cpu = s.chart_series_1_border || rootStyle?.getPropertyValue('--chart-series-1-border')?.trim() || '#22d3ee';
      const mem = s.chart_series_2_border || rootStyle?.getPropertyValue('--chart-series-2-border')?.trim() || '#a855f7';
      const disk = s.chart_series_1_fill || s.button_color || rootStyle?.getPropertyValue('--chart-series-1-fill')?.trim() || '#38bdf8';
      const netIn = s.network_in_color || s.chart_series_1_border || rootStyle?.getPropertyValue('--chart-series-1-border')?.trim() || '#38bdf8';
      const netOut = s.network_out_color || s.chart_series_2_border || rootStyle?.getPropertyValue('--chart-series-2-border')?.trim() || '#a855f7';
      setThemeColors({ cpu, mem, disk, netIn, netOut });
    };

    window.addEventListener('qunix-theme-settings-changed', updateColors);
    window.addEventListener('storage', updateColors);
    return () => {
      window.removeEventListener('qunix-theme-settings-changed', updateColors);
      window.removeEventListener('storage', updateColors);
    };
  }, []);

  // Live / sample calculations
  const curCpu = isPreview ? 10.2 : (cpuAbsolute || 0);
  const curCpuLimit = isPreview ? 50 : (cpuLimit || 0);
  const curCores = curCpuLimit > 0 ? (curCpuLimit / 100).toFixed(1) : '1.0';

  const curMemoryBytes = isPreview ? 551 * 1024 * 1024 : (memoryBytes || 0);
  const curMemoryLimitMb = isPreview ? 1024 : (memoryLimitMb || 0);
  const curMemoryLimitBytes = curMemoryLimitMb > 0 ? mbToBytes(curMemoryLimitMb) : 0;

  const curDiskBytes = isPreview ? 239 * 1024 * 1024 : (diskBytes || 0);
  const curDiskLimitMb = isPreview ? 1024 : (diskLimitMb || 0);
  const curDiskLimitBytes = curDiskLimitMb > 0 ? mbToBytes(curDiskLimitMb) : 0;
  const freeDiskBytes = Math.max(0, curDiskLimitBytes - curDiskBytes);
  const diskPercent = curDiskLimitBytes > 0
    ? Math.min(100, Math.round((curDiskBytes / curDiskLimitBytes) * 100))
    : isPreview ? 23 : 0;

  // Buffer of last 22 readings for CPU & Memory
  const [cpuHistory, setCpuHistory] = useState<number[]>(() => {
    if (isPreview) {
      return [0, 0, 37.6, 25.0, 18.0, 12.0, 9.5, 10.5, 8.0, 7.5, 9.0, 10.2];
    }
    return [curCpu];
  });

  const [memHistory, setMemHistory] = useState<number[]>(() => {
    if (isPreview) {
      return [420, 580, 618, 550, 520, 540, 510, 530, 545, 535, 540, 551];
    }
    return [curMemoryBytes / (1024 * 1024)];
  });

  // Track live streaming readings
  const lastCpuRef = useRef(curCpu);
  const lastMemRef = useRef(curMemoryBytes);

  useEffect(() => {
    if (isPreview) return;
    if (cpuAbsolute !== undefined && cpuAbsolute !== lastCpuRef.current) {
      lastCpuRef.current = cpuAbsolute;
      setCpuHistory((prev) => {
        const next = [...prev, cpuAbsolute];
        return next.slice(-22);
      });
    }
  }, [cpuAbsolute, isPreview]);

  useEffect(() => {
    if (isPreview) return;
    if (memoryBytes !== undefined && memoryBytes !== lastMemRef.current) {
      lastMemRef.current = memoryBytes;
      const mbVal = memoryBytes / (1024 * 1024);
      setMemHistory((prev) => {
        const next = [...prev, mbVal];
        return next.slice(-22);
      });
    }
  }, [memoryBytes, isPreview]);

  // Compute Peaks
  const cpuPeak = Math.max(...cpuHistory, curCpu, 10.2);
  const memPeakMb = Math.max(...memHistory, curMemoryBytes / (1024 * 1024), 551);

  // Sparkline coordinates for CPU (22 reading points)
  const svgWidth = 260;
  const svgHeight = 72;
  // Fix maximum CPU value to ServerLimit (curCpuLimit) when set
  const cpuYAxisPeak = curCpuLimit > 0
    ? (cpuPeak > curCpuLimit ? Math.max(curCpuLimit * 1.2, cpuPeak) : curCpuLimit)
    : Math.max(cpuPeak * 1.15, 100);

  const points = cpuHistory.map((val, idx) => {
    const x = (idx / Math.max(1, cpuHistory.length - 1)) * svgWidth;
    const y = svgHeight - (Math.min(cpuYAxisPeak, Math.max(0, val)) / cpuYAxisPeak) * (svgHeight - 4);
    return { x, y };
  });

  // Smooth bezier curve for CPU
  const generateSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const cpuLine = generateSmoothPath(points);
  const cpuArea = points.length > 1
    ? `${cpuLine} L ${points[points.length - 1].x} ${svgHeight} L ${points[0].x} ${svgHeight} Z`
    : '';

  // CPU Y-Axis Ticks (top tick matches ServerLimit)
  const cpuTickStep = cpuYAxisPeak / 3;
  const cpuTicks = [
    `${Math.round(cpuYAxisPeak)}%`,
    `${Math.round(cpuTickStep * 2)}%`,
    `${Math.round(cpuTickStep)}%`,
    '0%',
  ];

  // Dynamic shades for MatrixChart from themeColors.mem (Level 1 to 4)
  const memPalette = useMemo(() => {
    const hex = themeColors.mem || '#eab308';
    const clean = hex.replace('#', '');
    let r = 234, g = 179, b = 8;
    if (clean.length === 6) {
      r = parseInt(clean.substring(0, 2), 16);
      g = parseInt(clean.substring(2, 4), 16);
      b = parseInt(clean.substring(4, 6), 16);
    }
    return [
      `rgba(${r}, ${g}, ${b}, 0.25)`,
      `rgba(${r}, ${g}, ${b}, 0.50)`,
      `rgba(${r}, ${g}, ${b}, 0.75)`,
      `rgba(${r}, ${g}, ${b}, 1.0)`,
    ];
  }, [themeColors.mem]);

  // Memory Ticks (top tick matches ServerLimit curMemoryLimitMb)
  const memYAxisPeak = curMemoryLimitMb > 0
    ? (memPeakMb > curMemoryLimitMb ? Math.max(curMemoryLimitMb * 1.2, memPeakMb) : curMemoryLimitMb)
    : Math.max(memPeakMb * 1.25, 512);
  const memTickStep = memYAxisPeak / 3;
  const formatMemTick = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1).replace('.0', '')} GB`;
    }
    return `${Math.round(mb)} MB`;
  };
  const memTicks = [
    formatMemTick(memYAxisPeak),
    formatMemTick(memTickStep * 2),
    formatMemTick(memTickStep),
    '0',
  ];

  // Format Memory Matrix data for Mantine MatrixChart (22 columns x 7 vertical level rows)
  const memRows = 7;
  const memCols = 22;
  const memYLabels = useMemo(() => ['L6', 'L5', 'L4', 'L3', 'L2', 'L1', 'L0'], []);
  const memXLabels = useMemo(() => Array.from({ length: memCols }, (_, idx) => String(idx + 1)), []);
  const memMatrixData = useMemo(() => {
    const data: Array<{ x: string; y: string; value: number | null }> = [];
    for (let r = 0; r < memRows; r++) {
      const y = `L${memRows - 1 - r}`;
      for (let c = 0; c < memCols; c++) {
        const x = String(c + 1);
        const valMb = memHistory[c] ?? 0;
        const frac = Math.min(1, Math.max(0, valMb / (memYAxisPeak || 1)));
        const filledCount = Math.round(frac * memRows);
        const levelFromBottom = memRows - 1 - r;
        const isFilled = levelFromBottom < filledCount;
        // Heat value maps to levels so Mantine interpolates into shades of themeColors.mem
        const heatVal = isFilled ? ((levelFromBottom + 1) / memRows) * memYAxisPeak : null;
        data.push({
          x,
          y,
          value: heatVal,
        });
      }
    }
    return data;
  }, [memHistory, memYAxisPeak]);

  // Disk Donut Data
  const usedMb = curDiskBytes > 0 ? Number((curDiskBytes / (1024 * 1024)).toFixed(1)) : (isPreview ? 239 : 0);
  const freeMb = freeDiskBytes > 0 ? Number((freeDiskBytes / (1024 * 1024)).toFixed(1)) : (isPreview ? 785 : 100);

  return (
    <div className='flex flex-col gap-4 w-full'>
      {/* 3 Metrics Cards: CPU, Memory, Disk */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 w-full'>
        {/* 1. CPU CARD (GaugeChart on Left, Graph on Right) */}
      <div
        className='qunix-card-flat flex flex-col justify-between'
        style={{
          background: 'var(--ds-card-bg, #0f1219)',
          border: '1px solid var(--ds-border-color, rgba(255, 255, 255, 0.08))',
          borderRadius: 'var(--ds-card-radius, 8px)',
          padding: '16px 18px',
          minHeight: '185px',
        }}
      >
        <div>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-1.5 text-xs font-semibold text-neutral-300'>
              <FontAwesomeIcon icon={faMicrochip} className='text-neutral-400 text-xs' />
              <span>CPU</span>
            </div>
            <div className='text-right'>
              <div className='text-xs font-mono font-medium text-neutral-300'>
                {curCpuLimit > 0 ? `${curCpuLimit}%` : 'Unlimited'}
              </div>
              <div className='text-[10px] text-neutral-500'>
                of {curCores} {Number(curCores) > 1 ? 'threads' : 'thread'}
              </div>
            </div>
          </div>

          {/* Main Reading */}
          <div className='flex items-center gap-2.5 mt-2 mb-2'>
            <span
              className='w-[4px] h-[18px] rounded-[2px] inline-block shrink-0'
              style={{ backgroundColor: themeColors.cpu }}
            />
            <span className='text-xl font-bold font-mono text-white tracking-tight'>
              - {curCpu.toFixed(1)}%
            </span>
          </div>

          {/* GaugeChart on left & Graph on right */}
          <div className='flex items-center gap-3 h-[76px] mt-1 w-full'>
            {/* Mantine GaugeChart on the left */}
            <div className='shrink-0 flex items-center justify-center' style={{ width: '84px', height: '76px' }}>
              <GaugeChart
                value={curCpu}
                min={0}
                max={curCpuLimit > 0 ? curCpuLimit : 100}
                size={82}
                thickness={8}
                roundCaps
                filledColor={themeColors.cpu}
                trackColor='rgba(255, 255, 255, 0.08)'
                target={cpuPeak > curCpu ? cpuPeak : undefined}
                targetColor='rgba(255, 255, 255, 0.45)'
                label={null}
                valueFormatter={() => ''}
              />
            </div>

            {/* Default Calagopus Sparkline Graph on the right */}
            <div className='flex-1 flex items-end gap-1.5 h-full relative min-w-0'>
              {/* Compact Ticks */}
              <div className='flex flex-col justify-between h-full text-[8.5px] font-mono text-neutral-500 select-none pb-0.5 shrink-0'>
                <span>{cpuTicks[0]}</span>
                <span>{cpuTicks[1]}</span>
                <span>{cpuTicks[2]}</span>
                <span>{cpuTicks[3]}</span>
              </div>

              {/* Sparkline Canvas */}
              <div className='flex-1 h-full relative overflow-hidden'>
                <svg
                  width='100%'
                  height='100%'
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  preserveAspectRatio='none'
                  style={{ overflow: 'visible' }}
                >
                  <defs>
                    <linearGradient id='qunix-cpu-sparkline-fill' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='0%' stopColor={themeColors.cpu} stopOpacity='0.35' />
                      <stop offset='100%' stopColor={themeColors.cpu} stopOpacity='0.0' />
                    </linearGradient>
                  </defs>
                  {/* Horizontal Baseline */}
                  <line
                    x1='0'
                    y1={svgHeight}
                    x2={svgWidth}
                    y2={svgHeight}
                    stroke='rgba(255, 255, 255, 0.08)'
                    strokeWidth='1'
                  />
                  {cpuArea && (
                    <path d={cpuArea} fill='url(#qunix-cpu-sparkline-fill)' />
                  )}
                  {cpuLine && (
                    <path
                      d={cpuLine}
                      fill='none'
                      stroke={themeColors.cpu}
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  )}
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='text-[10px] text-neutral-500 font-sans mt-3'>
          Last 22 readings · peak {cpuPeak.toFixed(1)}%
        </div>
      </div>

      {/* 2. MEMORY CARD (Mantine MatrixChart Full Component) */}
      <div
        className='qunix-card-flat flex flex-col justify-between'
        style={{
          background: 'var(--ds-card-bg, #0f1219)',
          border: '1px solid var(--ds-border-color, rgba(255, 255, 255, 0.08))',
          borderRadius: 'var(--ds-card-radius, 8px)',
          padding: '16px 18px',
          minHeight: '185px',
        }}
      >
        <div>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2 text-xs font-semibold text-neutral-300'>
              <FontAwesomeIcon icon={faMemory} className='text-neutral-400 text-xs' />
              <span>Memory</span>
            </div>
            <div className='text-right'>
              <div className='text-xs font-mono font-medium text-neutral-300'>
                {curMemoryLimitBytes > 0 ? bytesToString(curMemoryLimitBytes) : 'Unlimited'}
              </div>
              <div className='text-[10px] text-neutral-500'>
                of {curMemoryLimitMb > 0 ? `${(curMemoryLimitMb / 1024).toFixed(0)} GB` : 'host'}
              </div>
            </div>
          </div>

          {/* Main Reading */}
          <div className='flex items-center gap-2.5 mt-2 mb-2'>
            <span
              className='w-[4px] h-[18px] rounded-[2px] inline-block shrink-0'
              style={{ backgroundColor: themeColors.mem }}
            />
            <span className='text-xl font-bold font-mono text-white tracking-tight'>
              {bytesToString(curMemoryBytes)}
            </span>
          </div>

          {/* Full Component MatrixChart with Ticks */}
          <div className='flex items-end gap-2 h-[76px] relative mt-1 w-full'>
            {/* Y-Axis Labels */}
            <div className='flex flex-col justify-between h-full text-[8.5px] font-mono text-neutral-500 select-none pb-0.5 shrink-0'>
              <span>{memTicks[0]}</span>
              <span>{memTicks[1]}</span>
              <span>{memTicks[2]}</span>
              <span>{memTicks[3]}</span>
            </div>

            {/* Mantine MatrixChart stretched across full available component width */}
            <div className='flex-1 h-full min-w-0 overflow-hidden flex items-center'>
              <MatrixChart
                data={memMatrixData}
                xLabels={memXLabels}
                yLabels={memYLabels}
                colors={memPalette}
                domain={[0, memYAxisPeak]}
                cellSize={8}
                gap={2}
                cellRadius={2}
                emptyColor='rgba(255, 255, 255, 0.04)'
                withXLabels={false}
                withYLabels={false}
                withLegend={false}
                withTooltip={true}
                style={{ width: '100%', height: '100%', display: 'block' }}
                getTooltipLabel={(cell) => {
                  const colIdx = parseInt(cell.x, 10) - 1;
                  const mb = memHistory[colIdx];
                  return (
                    <div
                      style={{
                        background: '#121217',
                        border: '1px solid #2a2a35',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        color: '#f8fafc',
                        fontFamily: 'monospace',
                      }}
                    >
                      <span style={{ color: themeColors.mem, fontWeight: 'bold' }}>
                        {mb !== undefined && mb > 0 ? `${Math.round(mb)} MB` : '0 MB'}
                      </span>
                    </div>
                  );
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='text-[10px] text-neutral-500 font-sans mt-3'>
          Last 22 readings · peak {Math.round(memPeakMb)} MB
        </div>
      </div>

      {/* 3. DISK USAGE CARD (Mantine DonutChart) */}
      <div
        className='qunix-card-flat flex flex-col justify-between'
        style={{
          background: 'var(--ds-card-bg, #0f1219)',
          border: '1px solid var(--ds-border-color, rgba(255, 255, 255, 0.08))',
          borderRadius: 'var(--ds-card-radius, 8px)',
          padding: '16px 18px',
          minHeight: '185px',
        }}
      >
        <div>
          {/* Header */}
          <div className='flex items-center gap-2 text-xs font-semibold text-neutral-300'>
            <FontAwesomeIcon icon={faHardDrive} className='text-neutral-400 text-xs' />
            <span>Disk usage</span>
          </div>

          {/* Donut meter & breakdown table */}
          <div className='flex items-center justify-between gap-4 mt-3'>
            {/* Mantine DonutChart */}
            <div className='relative w-[96px] h-[96px] flex items-center justify-center shrink-0'>
              <DonutChart
                size={96}
                thickness={10}
                data={[
                  { name: 'Used', value: usedMb, color: themeColors.disk },
                  { name: 'Free', value: freeMb, color: 'rgba(255, 255, 255, 0.08)' },
                ]}
                chartLabel={`${diskPercent}%`}
                withTooltip
                strokeWidth={0}
                styles={{
                  label: {
                    fontSize: '14px',
                    fontWeight: 'bold',
                    fontFamily: 'monospace',
                    fill: '#f8fafc',
                  },
                }}
              />
            </div>

            {/* Breakdown Table */}
            <div className='flex-1 flex flex-col justify-center gap-2 pl-2'>
              <div className='flex items-center justify-between text-xs'>
                <span className='text-neutral-400 font-medium'>Used</span>
                <span className='font-mono font-bold text-neutral-200'>
                  {bytesToString(curDiskBytes)}
                </span>
              </div>
              <div className='flex items-center justify-between text-xs'>
                <span className='text-neutral-400 font-medium'>Free</span>
                <span className='font-mono font-bold text-neutral-200'>
                  {curDiskLimitBytes > 0 ? bytesToString(freeDiskBytes) : 'Unlimited'}
                </span>
              </div>
              <div className='flex items-center justify-between text-xs'>
                <span className='text-neutral-400 font-medium'>Limit</span>
                <span className='font-mono font-bold text-neutral-200'>
                  {curDiskLimitBytes > 0 ? bytesToString(curDiskLimitBytes) : 'Unlimited'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Empty bottom space to balance height */}
      </div>
    </div>

    {/* 4. NETWORK TRAFFIC AREA CHART (Mantine AreaChart with 24h Rolling History) */}
    <QunixNetworkAreaChart
      serverUuid={serverUuid}
      rxBytes={rxBytes}
      txBytes={txBytes}
      previewMode={isPreview}
      themeColors={themeColors}
    />
  </div>
  );
};

export default QunixResourceCharts;
