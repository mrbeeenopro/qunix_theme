import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faMicrochip,
  faMemory,
  faHardDrive,
  faCloudDownload,
  faCloudUpload,
  faCopy,
  faNetworkWired,
  faGlobe,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { useServerStore } from '@/stores/server.ts';
import { axiosInstance } from '@/api/axios.ts';
import { formatMilliseconds } from '@/lib/format/time.ts';
import { bytesToString, mbToBytes } from '@/lib/format/size.ts';
import { formatAllocation } from '@/lib/domain/server.ts';
import { copyToClipboard } from '@/lib/clipboard/copy.ts';

const StatsOverlay: React.FC = () => {
  const { server, stats, state } = useServerStore();

  if (!server || !stats) return null;

  const isServerInactive =
    state === 'offline' ||
    Boolean(server.isSuspended) ||
    Boolean(server.isTransferring) ||
    Boolean(server.nodeMaintenanceEnabled) ||
    Boolean(server.status && server.status !== 'installing');

  const uptimeStr = isServerInactive ? 'Offline' : formatMilliseconds(stats.uptime || 0);

  const cpuStr = `${(stats.cpuAbsolute || 0).toFixed(2)}% / ${server.limits.cpu !== 0 ? `${server.limits.cpu}%` : 'Unlimited'}`;
  const memoryStr = `${bytesToString(stats.memoryBytes || 0)} / ${server.limits.memory !== 0 ? bytesToString(mbToBytes(server.limits.memory)) : 'Unlimited'}`;
  const diskStr = `${bytesToString(stats.diskBytes || 0)} / ${server.limits.disk !== 0 ? bytesToString(mbToBytes(server.limits.disk)) : 'Unlimited'}`;
  const netInStr = isServerInactive ? 'Offline' : bytesToString(stats.network?.rxBytes || 0);
  const netOutStr = isServerInactive ? 'Offline' : bytesToString(stats.network?.txBytes || 0);

  return (
    <div className='qunix-banner-stats'>
      <div className='qunix-banner-stat-item' title='Uptime'>
        <FontAwesomeIcon icon={faClock} />
        <span>{uptimeStr}</span>
      </div>
      <div className='qunix-banner-stat-item' title='CPU Usage'>
        <FontAwesomeIcon icon={faMicrochip} />
        <span>{cpuStr}</span>
      </div>
      <div className='qunix-banner-stat-item' title='Memory Usage'>
        <FontAwesomeIcon icon={faMemory} />
        <span>{memoryStr}</span>
      </div>
      <div className='qunix-banner-stat-item' title='Disk Usage'>
        <FontAwesomeIcon icon={faHardDrive} />
        <span>{diskStr}</span>
      </div>
      <div className='qunix-banner-stat-item' title='Network In'>
        <FontAwesomeIcon icon={faCloudDownload} />
        <span>{netInStr}</span>
      </div>
      <div className='qunix-banner-stat-item' title='Network Out'>
        <FontAwesomeIcon icon={faCloudUpload} />
        <span>{netOutStr}</span>
      </div>
    </div>
  );
};

const AllocationPill: React.FC = () => {
  const { server } = useServerStore();
  const [copied, setCopied] = useState(false);

  if (!server || !server.allocation) return null;

  const allocationStr = formatAllocation(server.allocation, server.egg.separatePort);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    copyToClipboard(allocationStr)
      ?.then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };

  return (
    <button onClick={handleCopy} className='qunix-banner-allocation-pill qunix-privacy-blur' data-privacy-sensitive='true' title='Click to copy IP Address'>
      <span className='allocation-text'>{allocationStr}</span>
      <span className='icon-wrap'>
        {copied ? <span className='copied-text'>Copied!</span> : <FontAwesomeIcon icon={faCopy} />}
      </span>
    </button>
  );
};

// Cubic Bezier helper for silky smooth live chart curves
function getBezierPath(points: { x: number; y: number }[]) {
  if (!points || points.length < 2) return '';
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const cp1x = curr.x + (next.x - curr.x) / 2;
    const cp1y = curr.y;
    const cp2x = curr.x + (next.x - curr.x) / 2;
    const cp2y = next.y;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
  }
  return d;
}

// Compact Smooth Sparkline SVG Generator with interactive hover timeline and tooltip
const Sparkline: React.FC<{
  data: number[];
  color: string;
  fillId: string;
  formatValue?: (v: number) => string;
  height?: number | string;
}> = ({ data, color, fillId, formatValue, height = 36 }) => {
  const containerRef = React.useRef<SVGSVGElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (!data || data.length < 2) {
    return <div className='w-full h-9' />;
  }

  const dataMin = Math.min(...data);
  const dataMax = Math.max(...data);
  const range = dataMax > dataMin ? dataMax - dataMin : 1;
  const width = 300;
  const h = 40;
  const step = width / (data.length - 1);
  const padTop = 6;
  const padBot = 6;
  const drawH = h - padTop - padBot;

  const valToY = (v: number) => {
    const raw = h - padBot - ((v - dataMin) / range) * drawH;
    return Number.isFinite(raw) ? raw : h - padBot;
  };

  const pts = data.map((val, idx) => ({
    x: idx * step,
    y: valToY(val),
    val,
  }));

  const lineD = getBezierPath(pts);
  const areaD = `${lineD} L ${width},${h} L 0,${h} Z`;
  const lastPt = pts[pts.length - 1];

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const idx = Math.round(xRatio * (data.length - 1));
    setHoverIdx(idx);
  };

  const activePt = hoverIdx !== null && pts[hoverIdx] ? pts[hoverIdx] : null;
  const timeOffset = activePt && hoverIdx !== null ? data.length - 1 - hoverIdx : 0;
  const timeLabel = timeOffset === 0 ? 'now' : `-${timeOffset}s`;
  const valueLabel = activePt && formatValue ? formatValue(activePt.val) : null;

  return (
    <div className='relative w-full flex-1 flex flex-col justify-end' style={{ minHeight: typeof height === 'number' ? `${height}px` : height }}>
      <svg
        ref={containerRef}
        viewBox={`0 0 ${width} ${h}`}
        className='w-full h-full min-h-[36px] overflow-visible cursor-crosshair flex-1'
        style={{ height: typeof height === 'number' ? `${height}px` : height, maxHeight: 60 }}
        preserveAspectRatio='none'
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id={fillId} x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor={color} style={{ stopColor: color }} stopOpacity='0.28' />
            <stop offset='100%' stopColor={color} style={{ stopColor: color }} stopOpacity='0.0' />
          </linearGradient>
        </defs>
        {/* Baseline */}
        <line
          x1='0'
          y1={h - padBot}
          x2={width}
          y2={h - padBot}
          stroke='rgba(255, 255, 255, 0.06)'
          strokeWidth='1'
          strokeDasharray='2 3'
        />
        {/* Area Fill */}
        <path d={areaD} fill={`url(#${fillId})`} />
        {/* Smooth Curve */}
        <path
          d={lineD}
          fill='none'
          stroke={color}
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        {/* Hover timeline vertical line */}
        {activePt && (
          <line
            x1={activePt.x}
            y1={0}
            x2={activePt.x}
            y2={h}
            stroke='rgba(255, 255, 255, 0.45)'
            strokeWidth='1'
            strokeDasharray='3 3'
          />
        )}
        {/* Active hover dot or last point dot */}
        {activePt ? (
          <>
            <circle cx={activePt.x} cy={activePt.y} r='5' fill={color} fillOpacity='0.35' />
            <circle cx={activePt.x} cy={activePt.y} r='2.5' fill='#ffffff' stroke={color} strokeWidth='1.5' />
          </>
        ) : lastPt ? (
          <>
            <circle cx={lastPt.x} cy={lastPt.y} r='4.5' fill={color} fillOpacity='0.25' />
            <circle cx={lastPt.x} cy={lastPt.y} r='2' fill={color} />
          </>
        ) : null}
      </svg>

      {/* Floating Tooltip during Hover */}
      {activePt && valueLabel && (
        <div
          className='pointer-events-none absolute -top-7 px-2 py-0.5 rounded text-[10px] font-mono font-medium text-white shadow-lg backdrop-blur-md flex items-center gap-1.5 z-20 transition-transform duration-75'
          style={{
            left: `${Math.max(6, Math.min(94, (activePt.x / width) * 100))}%`,
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(15, 17, 23, 0.94)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          <span className='font-semibold' style={{ color }}>{valueLabel}</span>
          <span className='text-neutral-400 text-[9px]'>({timeLabel})</span>
        </div>
      )}
    </div>
  );
};

// Dual Series Smooth Sparkline for Combined Network (Inbound & Outbound)
const DualSparkline: React.FC<{
  series1: number[];
  color1: string;
  fillId1: string;
  series2: number[];
  color2: string;
  formatValue?: (v: number) => string;
  height?: number | string;
}> = ({ series1, color1, fillId1, series2, color2, formatValue, height = 48 }) => {
  const containerRef = React.useRef<SVGSVGElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (!series1 || series1.length < 2) return <div className='w-full h-12' />;

  const width = 300;
  const h = 50;
  const max = Math.max(...series1, ...series2, 1);
  const step = width / (series1.length - 1);
  const padTop = 6;
  const padBot = 6;
  const drawH = h - padTop - padBot;

  const valToY = (v: number) => {
    const raw = h - padBot - (v / max) * drawH;
    return Number.isFinite(raw) ? raw : h - padBot;
  };

  const pts1 = series1.map((val, idx) => ({
    x: idx * step,
    y: valToY(val),
    val,
  }));

  const pts2 = series2.map((val, idx) => ({
    x: idx * step,
    y: valToY(val),
    val,
  }));

  const lineD1 = getBezierPath(pts1);
  const areaD1 = `${lineD1} L ${width},${h} L 0,${h} Z`;
  const lineD2 = getBezierPath(pts2);
  const lastPt1 = pts1[pts1.length - 1];
  const lastPt2 = pts2[pts2.length - 1];

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const idx = Math.round(xRatio * (series1.length - 1));
    setHoverIdx(idx);
  };

  const activePt1 = hoverIdx !== null && pts1[hoverIdx] ? pts1[hoverIdx] : null;
  const activePt2 = hoverIdx !== null && pts2[hoverIdx] ? pts2[hoverIdx] : null;
  const timeOffset = hoverIdx !== null ? series1.length - 1 - hoverIdx : 0;
  const timeLabel = timeOffset === 0 ? 'now' : `-${timeOffset}s`;

  return (
    <div className='relative w-full flex-1 flex flex-col justify-end' style={{ minHeight: typeof height === 'number' ? `${height}px` : height }}>
      <svg
        ref={containerRef}
        viewBox={`0 0 ${width} ${h}`}
        className='w-full h-full min-h-[44px] overflow-visible cursor-crosshair flex-1'
        style={{ minHeight: typeof height === 'number' ? `${height}px` : height, maxHeight: 80 }}
        preserveAspectRatio='none'
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id={fillId1} x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor={color1} style={{ stopColor: color1 }} stopOpacity='0.25' />
            <stop offset='100%' stopColor={color1} style={{ stopColor: color1 }} stopOpacity='0.0' />
          </linearGradient>
        </defs>
        {/* Baseline */}
        <line
          x1='0'
          y1={h - padBot}
          x2={width}
          y2={h - padBot}
          stroke='rgba(255, 255, 255, 0.06)'
          strokeWidth='1'
          strokeDasharray='2 3'
        />
        {/* Area Fill */}
        <path d={areaD1} fill={`url(#${fillId1})`} />
        {/* Series 1 Inbound */}
        <path
          d={lineD1}
          fill='none'
          stroke={color1}
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        {/* Series 2 Outbound */}
        <path
          d={lineD2}
          fill='none'
          stroke={color2}
          strokeWidth='1.75'
          strokeDasharray='4 3'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        {/* Hover timeline vertical line */}
        {activePt1 && (
          <line
            x1={activePt1.x}
            y1={0}
            x2={activePt1.x}
            y2={h}
            stroke='rgba(255, 255, 255, 0.45)'
            strokeWidth='1'
            strokeDasharray='3 3'
          />
        )}
        {/* Hover dots or last points */}
        {activePt1 && activePt2 ? (
          <>
            <circle cx={activePt1.x} cy={activePt1.y} r='5' fill={color1} fillOpacity='0.35' />
            <circle cx={activePt1.x} cy={activePt1.y} r='2.5' fill='#ffffff' stroke={color1} strokeWidth='1.5' />
            <circle cx={activePt2.x} cy={activePt2.y} r='4.5' fill={color2} fillOpacity='0.35' />
            <circle cx={activePt2.x} cy={activePt2.y} r='2' fill='#ffffff' stroke={color2} strokeWidth='1.5' />
          </>
        ) : (
          <>
            {lastPt1 && <circle cx={lastPt1.x} cy={lastPt1.y} r='2.5' fill={color1} />}
            {lastPt2 && <circle cx={lastPt2.x} cy={lastPt2.y} r='2' fill={color2} />}
          </>
        )}
      </svg>

      {/* Floating Tooltip during Hover */}
      {activePt1 && activePt2 && (
        <div
          className='pointer-events-none absolute -top-8 px-2.5 py-1 rounded text-[10px] font-mono font-medium text-white shadow-xl backdrop-blur-md flex items-center gap-2 z-20 transition-transform duration-75'
          style={{
            left: `${Math.max(8, Math.min(92, (activePt1.x / width) * 100))}%`,
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(15, 17, 23, 0.94)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          <div className='flex items-center gap-1'>
            <span className='inline-block w-1.5 h-1.5 rounded-full' style={{ backgroundColor: color1 }} />
            <span style={{ color: color1 }}>{formatValue ? formatValue(activePt1.val) : `${bytesToString(activePt1.val)}/s`}</span>
          </div>
          <div className='flex items-center gap-1'>
            <span className='inline-block w-1.5 h-1.5 rounded-full' style={{ backgroundColor: color2 }} />
            <span style={{ color: color2 }}>{formatValue ? formatValue(activePt2.val) : `${bytesToString(activePt2.val)}/s`}</span>
          </div>
          <span className='text-neutral-400 text-[9px]'>({timeLabel})</span>
        </div>
      )}
    </div>
  );
};

// Compact Console Sidebar (Design Option 3)
const CompactConsoleSidebar: React.FC = () => {
  const { server, stats, state } = useServerStore();
  const [copied, setCopied] = useState(false);
  const lastUpdateRef = React.useRef<number>(0);
  const initializedRef = React.useRef<boolean>(false);
  const networkRef = React.useRef<{
    rxBytes: number;
    txBytes: number;
    rxSpeed: number;
    txSpeed: number;
    timestamp: number;
  }>({
    rxBytes: -1,
    txBytes: -1,
    rxSpeed: 0,
    txSpeed: 0,
    timestamp: 0,
  });
  const [netSpeed, setNetSpeed] = useState<{ rx: number; tx: number }>({ rx: 0, tx: 0 });

  // History tracking for smooth live charts (30 data points)
  const [cpuHistory, setCpuHistory] = useState<number[]>(() => Array(30).fill(0));
  const [memHistory, setMemHistory] = useState<number[]>(() => Array(30).fill(0));
  const [diskHistory, setDiskHistory] = useState<number[]>(() => Array(30).fill(0));
  const [netInHistory, setNetInHistory] = useState<number[]>(() => Array(30).fill(0));
  const [netOutHistory, setNetOutHistory] = useState<number[]>(() => Array(30).fill(0));

  useEffect(() => {
    if (!stats) return;
    const now = Date.now();
    if (now - lastUpdateRef.current < 1000) return;

    const timeDelta = networkRef.current.timestamp > 0 ? (now - networkRef.current.timestamp) / 1000 : 1;
    networkRef.current.timestamp = now;
    lastUpdateRef.current = now;

    const currentRx = stats.network?.rxBytes || 0;
    const currentTx = stats.network?.txBytes || 0;

    let rxSpeed = 0;
    let txSpeed = 0;
    if (networkRef.current.rxBytes >= 0 && timeDelta > 0) {
      rxSpeed = Math.max(0, (currentRx - networkRef.current.rxBytes) / timeDelta);
      txSpeed = Math.max(0, (currentTx - networkRef.current.txBytes) / timeDelta);
    }
    networkRef.current.rxBytes = currentRx;
    networkRef.current.txBytes = currentTx;
    networkRef.current.rxSpeed = rxSpeed;
    networkRef.current.txSpeed = txSpeed;
    setNetSpeed({ rx: rxSpeed, tx: txSpeed });

    const cpu = stats.cpuAbsolute || 0;
    const mem = stats.memoryBytes || 0;
    const disk = stats.diskBytes || 0;

    if (!initializedRef.current) {
      initializedRef.current = true;
      setCpuHistory(Array(30).fill(cpu));
      setMemHistory(Array(30).fill(mem));
      setDiskHistory(Array(30).fill(disk));
      setNetInHistory(Array(30).fill(rxSpeed));
      setNetOutHistory(Array(30).fill(txSpeed));
    } else {
      setCpuHistory((prev) => [...prev.slice(1), cpu]);
      setMemHistory((prev) => [...prev.slice(1), mem]);
      setDiskHistory((prev) => [...prev.slice(1), disk]);
      setNetInHistory((prev) => [...prev.slice(1), rxSpeed]);
      setNetOutHistory((prev) => [...prev.slice(1), txSpeed]);
    }
  }, [stats]);

  if (!server) return null;

  const primaryAccent = 'var(--ds-primary-color, #7aa2f7)';
  const chart1Color = 'var(--chart-series-1-border, var(--ds-primary-color, #7aa2f7))';
  const chart2Color = 'var(--chart-series-2-border, #facc15)';

  const allocationStr = server.allocation ? formatAllocation(server.allocation, server.egg?.separatePort) : 'N/A';
  const handleCopy = () => {
    copyToClipboard(allocationStr)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        try {
          const ta = document.createElement('textarea');
          ta.value = allocationStr;
          ta.style.position = 'fixed';
          ta.style.top = '0';
          ta.style.left = '-999999px';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          document.execCommand('copy');
          ta.remove();
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {}
      });
  };

  const isOnline =
    state !== 'offline' &&
    server.status !== 'installing' &&
    !server.isSuspended &&
    !server.isTransferring &&
    !server.nodeMaintenanceEnabled;
  const uptimeStr = isOnline ? formatMilliseconds(stats?.uptime || 0) : 'Offline';
  const cpuPercent = (stats?.cpuAbsolute || 0).toFixed(2);
  const cpuMax = server.limits.cpu !== 0 ? `${server.limits.cpu}%` : 'Unlimited';
  const memUsed = bytesToString(stats?.memoryBytes || 0);
  const memMax = server.limits.memory !== 0 ? bytesToString(mbToBytes(server.limits.memory)) : 'Unlimited';
  const diskUsed = bytesToString(stats?.diskBytes || 0);
  const diskMax = server.limits.disk !== 0 ? bytesToString(mbToBytes(server.limits.disk)) : 'Unlimited';
  const diskTotalBytes = server.limits.disk !== 0 ? mbToBytes(server.limits.disk) : 0;
  const diskPercent = diskTotalBytes > 0 && stats?.diskBytes ? (stats.diskBytes / diskTotalBytes) * 100 : null;

  const netInRate = !isOnline ? '0 B/s' : `${bytesToString(Math.round(netSpeed.rx))}/s`;
  const netInTotal = bytesToString(stats?.network?.rxBytes || 0);
  const netOutRate = !isOnline ? '0 B/s' : `${bytesToString(Math.round(netSpeed.tx))}/s`;
  const netOutTotal = bytesToString(stats?.network?.txBytes || 0);

  return (
    <div className='qunix-compact-sidebar-cards flex flex-col gap-2.5 w-full select-none h-full'>
      {/* 1. ADDRESS CARD */}
      <div className='qunix-compact-card qunix-compact-info-card p-3 flex flex-col gap-1.5 shadow-md'>
        <div className='flex items-center justify-between text-xs font-medium tracking-wider uppercase' style={{ color: primaryAccent }}>
          <div className='flex items-center gap-2'>
            <FontAwesomeIcon icon={faGlobe} className='opacity-80' />
            <span className='text-[11px] font-semibold tracking-wider'>ADDRESS</span>
          </div>
        </div>
        <div
          onClick={handleCopy}
          className='flex items-center justify-between font-mono text-sm font-semibold cursor-pointer transition-colors group'
          style={{ color: 'var(--ds-gray-900, #0f172a)' }}
        >
          <span className='truncate qunix-privacy-blur' data-privacy-sensitive='true'>{allocationStr}</span>
          <div className='flex items-center gap-1.5 text-xs font-sans font-normal' style={{ color: primaryAccent }}>
            {copied && <span className='text-[11px] font-medium'>Copied!</span>}
            <FontAwesomeIcon
              icon={copied ? faCheck : faCopy}
              className='text-xs transition-transform active:scale-90'
            />
          </div>
        </div>
      </div>

      {/* 2. UPTIME CARD */}
      <div className='qunix-compact-card qunix-compact-info-card p-3 flex flex-col gap-1 shadow-md'>
        <div className='flex items-center gap-2 text-xs font-medium tracking-wider uppercase' style={{ color: primaryAccent }}>
          <FontAwesomeIcon icon={faClock} className='opacity-80' />
          <span className='text-[11px] font-semibold tracking-wider'>UPTIME</span>
        </div>
        <div className='flex items-center font-bold text-base tracking-tight' style={{ color: 'var(--ds-gray-900, #0f172a)' }}>
          <span
            className={`inline-block w-2 h-2 rounded-full mr-2 ${
              isOnline ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse' : 'bg-neutral-500'
            }`}
          />
          {uptimeStr}
        </div>
      </div>

      {/* 3. CPU LOAD CARD */}
      <div className='qunix-compact-card qunix-compact-chart-card p-3 flex flex-col gap-1.5 shadow-md'>
        <div className='flex items-center justify-between text-xs'>
          <div className='flex items-center gap-2 font-medium tracking-wider uppercase' style={{ color: primaryAccent }}>
            <FontAwesomeIcon icon={faMicrochip} className='opacity-80' />
            <span className='text-[11px] font-semibold tracking-wider'>CPU LOAD</span>
          </div>
        </div>
        <div className='font-bold text-base tracking-tight' style={{ color: 'var(--ds-gray-900, #0f172a)' }}>
          {cpuPercent}% <span className='text-xs font-normal text-neutral-400'>/ {cpuMax}</span>
        </div>
        <div className='qunix-sparkline-wrap'>
          <Sparkline data={cpuHistory} color={chart1Color} fillId='qunixCpuGrad' formatValue={(v) => `${v.toFixed(2)}%`} />
        </div>
      </div>

      {/* 4. MEMORY LOAD CARD */}
      <div className='qunix-compact-card qunix-compact-chart-card p-3 flex flex-col gap-1.5 shadow-md'>
        <div className='flex items-center justify-between text-xs'>
          <div className='flex items-center gap-2 font-medium tracking-wider uppercase' style={{ color: primaryAccent }}>
            <FontAwesomeIcon icon={faMemory} className='opacity-80' />
            <span className='text-[11px] font-semibold tracking-wider'>MEMORY LOAD</span>
          </div>
        </div>
        <div className='font-bold text-base tracking-tight' style={{ color: 'var(--ds-gray-900, #0f172a)' }}>
          {memUsed} <span className='text-xs font-normal text-neutral-400'>/ {memMax}</span>
        </div>
        <div className='qunix-sparkline-wrap'>
          <Sparkline data={memHistory} color={chart1Color} fillId='qunixMemGrad' formatValue={(v) => bytesToString(v)} />
        </div>
      </div>

      {/* 5. DISK USAGE CARD */}
      <div className='qunix-compact-card qunix-compact-chart-card p-3 flex flex-col gap-1.5 shadow-md'>
        <div className='flex items-center justify-between text-xs'>
          <div className='flex items-center gap-2 font-medium tracking-wider uppercase' style={{ color: primaryAccent }}>
            <FontAwesomeIcon icon={faHardDrive} className='opacity-80' />
            <span className='text-[11px] font-semibold tracking-wider'>DISK USAGE</span>
          </div>
          {diskPercent !== null && (
            <span className='text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 text-neutral-600 dark:text-neutral-300'>
              {diskPercent.toFixed(1)}%
            </span>
          )}
        </div>
        <div className='font-bold text-base tracking-tight' style={{ color: 'var(--ds-gray-900, #0f172a)' }}>
          {diskUsed} <span className='text-xs font-normal text-neutral-400'>/ {diskMax}</span>
        </div>
        {/* Sleek Mini Progress Track */}
        {diskPercent !== null && (
          <div className='w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden my-0.5'>
            <div
              className='h-full rounded-full transition-all duration-500'
              style={{
                width: `${Math.min(100, Math.max(0, diskPercent))}%`,
                background: `linear-gradient(90deg, ${chart1Color}, ${chart2Color})`,
              }}
            />
          </div>
        )}
        <div className='qunix-sparkline-wrap'>
          <Sparkline data={diskHistory} color={chart1Color} fillId='qunixDiskGrad' formatValue={(v) => bytesToString(v)} />
        </div>
      </div>

      {/* 6. COMBINED NETWORK CARD (IN & OUT - 2 DEDICATED ROWS) */}
      <div className='qunix-compact-card qunix-compact-chart-card qunix-network-card p-3 flex flex-col gap-2 shadow-md'>
        <div className='flex items-center justify-between text-xs font-medium tracking-wider uppercase' style={{ color: primaryAccent }}>
          <div className='flex items-center gap-2'>
            <FontAwesomeIcon icon={faNetworkWired} className='opacity-80' />
            <span className='text-[11px] font-semibold tracking-wider'>NETWORK</span>
          </div>
        </div>

        {/* 2 Clean Distinct Rows for In and Out */}
        <div className='flex flex-col gap-1 w-full'>
          {/* Row 1: Inbound (Download) */}
          <div className='flex items-center justify-between text-xs'>
            <div className='flex items-center gap-2 min-w-0'>
              <span className='inline-block w-2.5 h-0.5 rounded-full shrink-0' style={{ backgroundColor: chart1Color }} />
              <span className='text-neutral-400 text-[11px] font-medium'>In:</span>
              <span className='font-bold text-xs tracking-tight truncate' style={{ color: 'var(--ds-gray-900, #0f172a)' }}>
                {netInRate}
              </span>
            </div>
            <span className='text-[10px] font-mono text-neutral-400 shrink-0'>({netInTotal})</span>
          </div>

          {/* Row 2: Outbound (Upload) */}
          <div className='flex items-center justify-between text-xs'>
            <div className='flex items-center gap-2 min-w-0'>
              <span className='inline-block w-2.5 h-0.5 border-b border-dashed shrink-0' style={{ borderColor: chart2Color }} />
              <span className='text-neutral-400 text-[11px] font-medium'>Out:</span>
              <span className='font-bold text-xs tracking-tight truncate' style={{ color: 'var(--ds-gray-900, #0f172a)' }}>
                {netOutRate}
              </span>
            </div>
            <span className='text-[10px] font-mono text-neutral-400 shrink-0'>({netOutTotal})</span>
          </div>
        </div>

        <div className='qunix-sparkline-wrap'>
          <DualSparkline
            series1={netInHistory}
            color1={chart1Color}
            fillId1='qunixNetInGrad'
            series2={netOutHistory}
            color2={chart2Color}
            formatValue={(v) => `${bytesToString(v)}/s`}
            height='100%'
          />
        </div>
      </div>
    </div>
  );
};

export const ServerBannerComponent: React.FC = () => {
  const { server } = useServerStore();
  const [settings, setSettings] = useState<any>(() => (window as any).qunixThemeSettings || null);
  const location = useLocation();
  const [infoBarLeftCol, setInfoBarLeftCol] = useState<Element | null>(null);
  const [infoBarMain, setInfoBarMain] = useState<Element | null>(null);
  const [compactStatsSlot, setCompactStatsSlot] = useState<Element | null>(null);
  const [hasBanner, setHasBanner] = useState(false);

  useEffect(() => {
    const handleLoaded = (e: Event) => {
      setSettings((e as CustomEvent).detail);
    };
    window.addEventListener('qunix-settings-loaded', handleLoaded);

    if (!(window as any).qunixThemeSettings) {
      axiosInstance
        .get('/api/dev.qunix.theme/settings')
        .then((res) => {
          const s = res.data.settings;
          setSettings(s);
          (window as any).qunixThemeSettings = s;
          window.dispatchEvent(new CustomEvent('qunix-settings-loaded', { detail: s }));
        })
        .catch((_err) => {});
    }

    return () => {
      window.removeEventListener('qunix-settings-loaded', handleLoaded);
      const root = document.documentElement;
      root.style.setProperty('--ds-server-banner-image', 'none');
      root.classList.remove('has-server-banner', 'qunix-console-compact');
    };
  }, []);

  const isConsolePage =
    !!server &&
    (/^\/server\/[^/]+\/?$/i.test(location.pathname) ||
      (!!server.uuid && (
        location.pathname.toLowerCase() === `/server/${server.uuid.toLowerCase()}` ||
        location.pathname.toLowerCase() === `/server/${server.uuid.toLowerCase()}/`
      )) ||
      (!!server.uuidShort && (
        location.pathname.toLowerCase() === `/server/${server.uuidShort.toLowerCase()}` ||
        location.pathname.toLowerCase() === `/server/${server.uuidShort.toLowerCase()}/`
      )) ||
      (typeof document !== 'undefined' && !!document.getElementById('console-infobar')));

  const consoleStyle = settings?.console_style || settings?.consoleStyle || 'default';

  useEffect(() => {
    const root = document.documentElement;
    if (!server || !server.uuid || !server.egg || !settings || !isConsolePage) {
      root.style.setProperty('--ds-server-banner-image', 'none');
      root.classList.remove('has-server-banner', 'qunix-console-compact', 'qunix-compact-mounted');
      setHasBanner(false);
      return;
    }

    if (consoleStyle === 'compact') {
      root.classList.add('qunix-console-compact');
      root.classList.remove('has-server-banner');
      root.style.setProperty('--ds-server-banner-image', 'none');
      setHasBanner(false);
      return;
    }

    root.classList.remove('qunix-console-compact', 'qunix-compact-mounted');
    if (consoleStyle === 'mini') {
      const eggBanners: any = settings.egg_banners || settings.eggBanners || {};
      const egg: any = (server as any)?.egg;
      const nest: any = (server as any)?.nest;
      const customBannerUrl =
        eggBanners[egg?.uuid] ||
        (egg?.uuid && eggBanners[egg.uuid.toLowerCase()]) ||
        eggBanners[egg?.name] ||
        (egg?.name && eggBanners[egg.name.toLowerCase()]) ||
        (egg?.id && eggBanners[egg.id]) ||
        (nest?.uuid && eggBanners[nest.uuid]) ||
        (nest?.uuid && eggBanners[nest.uuid.toLowerCase()]) ||
        (nest?.name && eggBanners[nest.name]) ||
        (egg?.nestUuid && eggBanners[egg.nestUuid]) ||
        (egg?.nest_uuid && eggBanners[egg.nest_uuid]) ||
        null;

      const eggName = (egg?.name || '').toLowerCase();
      const nestName = (nest?.name || '').toLowerCase();
      const mcKeywords = [
        'minecraft',
        'paper',
        'spigot',
        'vanilla',
        'purpur',
        'forge',
        'fabric',
        'bedrock',
        'bungeecord',
        'velocity',
        'mohist',
        'sponge',
        'leaves',
        'folia',
      ];
      const isMinecraft = mcKeywords.some((k) => eggName.includes(k) || nestName.includes(k));
      const bannerUrl = customBannerUrl || (isMinecraft ? 'https://xgamingserver.com/img/game-images/minecraft-hero.webp' : null);
      if (bannerUrl) {
        root.style.setProperty('--ds-server-banner-image', `url("${bannerUrl}")`);
        root.classList.add('has-server-banner');
        setHasBanner(true);
      } else {
        root.style.setProperty('--ds-server-banner-image', 'none');
        root.classList.remove('has-server-banner');
        setHasBanner(false);
      }
    } else {
      root.style.setProperty('--ds-server-banner-image', 'none');
      root.classList.remove('has-server-banner');
      setHasBanner(false);
    }
  }, [server, settings, isConsolePage, consoleStyle]);

  // Inject Location Flag
  useEffect(() => {
    if (!isConsolePage || !server || !server.locationFlag) {
      const existing = document.querySelector('.qunix-location-flag');
      if (existing) existing.remove();
      return;
    }

    const injectFlag = () => {
      const titleEl = document.querySelector('#console-infobar h1, #console-infobar .mantine-Title-root');
      if (titleEl && !titleEl.querySelector('.qunix-location-flag')) {
        const flagImg = document.createElement('img');
        flagImg.src = `/flags/${server.locationFlag?.toLowerCase()}.svg`;
        flagImg.alt = server.locationFlag || '';
        flagImg.className = 'qunix-location-flag';
        flagImg.style.width = '20px';
        flagImg.style.height = '14px';
        flagImg.style.marginLeft = '10px';
        flagImg.style.display = 'inline-block';
        flagImg.style.verticalAlign = 'middle';
        flagImg.style.borderRadius = '3px';
        flagImg.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
        titleEl.appendChild(flagImg);
      }
    };

    injectFlag();
    const observer = new MutationObserver(injectFlag);
    const consoleInfoBar = document.getElementById('console-infobar');
    if (consoleInfoBar) {
      observer.observe(consoleInfoBar, { childList: true, subtree: true });
    }

    return () => {
      observer.disconnect();
      const existing = document.querySelector('.qunix-location-flag');
      if (existing) existing.remove();
    };
  }, [server, isConsolePage, location.pathname]);

  // Handle Portals for stats overlays and compact sidebar
  useEffect(() => {
    if (!isConsolePage) {
      document.documentElement.classList.remove('qunix-compact-mounted');
      setInfoBarLeftCol(null);
      setInfoBarMain(null);
      setCompactStatsSlot(null);
      return;
    }

    let observer: MutationObserver | null = null;
    let debounceTimer: any = null;
    let pollInterval: any = null;
    let pollCount = 0;

    const syncElements = () => {
      const consoleInfobar = document.getElementById('console-infobar');
      const mainEl = consoleInfobar?.querySelector(':scope > div') as HTMLElement | null;
      const leftEl = consoleInfobar?.querySelector('.flex-col') as HTMLElement | null;
      const gridEl =
        (consoleInfobar?.nextElementSibling?.classList.contains('grid')
          ? (consoleInfobar.nextElementSibling as HTMLElement)
          : null) ||
        (document.querySelector('.terminal-container')?.closest('.grid') as HTMLElement | null);

      if (mainEl && leftEl) {
        setInfoBarLeftCol((prev) => (prev !== leftEl ? leftEl : prev));
        setInfoBarMain((prev) => (prev !== mainEl ? mainEl : prev));
      }

      if (gridEl) {
        if (hasBanner && !gridEl.classList.contains('qunix-stretched-console-grid')) {
          gridEl.classList.add('qunix-stretched-console-grid');
        } else if (!hasBanner && gridEl.classList.contains('qunix-stretched-console-grid')) {
          gridEl.classList.remove('qunix-stretched-console-grid');
        }

        if (consoleStyle === 'compact') {
          const statsCol =
            (gridEl.children[1] as HTMLElement) ||
            (gridEl.querySelector(':scope > *:nth-child(2)') as HTMLElement);

          if (statsCol) {
            let slot = statsCol.querySelector('.qunix-compact-mount-slot') as HTMLElement;
            if (!slot) {
              slot = document.createElement('div');
              slot.className = 'qunix-compact-mount-slot w-full';
              statsCol.appendChild(slot);
            }
            setCompactStatsSlot((prev) => (prev !== slot ? slot : prev));
            document.documentElement.classList.add('qunix-compact-mounted');
          }
        } else {
          setCompactStatsSlot(null);
          document.documentElement.classList.remove('qunix-compact-mounted');
        }
      }
    };

    syncElements();

    const debouncedSync = () => {
      if (debounceTimer) cancelAnimationFrame(debounceTimer);
      debounceTimer = requestAnimationFrame(syncElements);
    };

    observer = new MutationObserver(debouncedSync);
    observer.observe(document.body, { childList: true, subtree: true });

    pollInterval = setInterval(() => {
      pollCount++;
      syncElements();
      if (pollCount > 15) {
        clearInterval(pollInterval);
      }
    }, 200);

    return () => {
      if (observer) observer.disconnect();
      if (pollInterval) clearInterval(pollInterval);
      if (debounceTimer) cancelAnimationFrame(debounceTimer);
      document.documentElement.classList.remove('qunix-compact-mounted');
      setInfoBarLeftCol(null);
      setInfoBarMain(null);
      setCompactStatsSlot(null);
    };
  }, [isConsolePage, hasBanner, consoleStyle, location.pathname]);

  if (consoleStyle === 'compact' && compactStatsSlot && document.body.contains(compactStatsSlot)) {
    return createPortal(<CompactConsoleSidebar />, compactStatsSlot);
  }

  if (
    hasBanner &&
    isConsolePage &&
    infoBarLeftCol &&
    infoBarMain &&
    document.body.contains(infoBarLeftCol) &&
    document.body.contains(infoBarMain)
  ) {
    return (
      <>
        {createPortal(<StatsOverlay />, infoBarLeftCol)}
        {createPortal(<AllocationPill />, infoBarMain)}
      </>
    );
  }

  return null;
};

export default ServerBannerComponent;
