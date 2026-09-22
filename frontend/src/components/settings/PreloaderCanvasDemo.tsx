import React, { useEffect, useRef } from 'react';
import { Group, Stack } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faGripLines,
  faCircleNotch,
  faEllipsis,
  faTerminal,
  faCube,
  faWaveSquare,
} from '@fortawesome/free-solid-svg-icons';
import { useExtTranslations } from '../../translations.ts';
import { drawPreloaderSpinner } from '../../lib/preloaderCanvas.ts';

export interface PreloaderCanvasDemoProps {
  style: string;
  delay: number;
  color: string;
  text?: string;
  appName?: string;
  logoUrl?: string;
  bgColor?: string;
  bgImage?: string;
  onStyleChange: (newStyle: string) => void;
  onDelayChange?: (newDelay: number) => void;
}

const DELAY_PRESETS = [500, 1000, 1500, 2500, 4000];

export const PreloaderCanvasDemo: React.FC<PreloaderCanvasDemoProps> = ({
  style,
  delay,
  color,
  text = 'INITIALIZING PANEL...',
  appName,
  logoUrl,
  bgColor = '#090a0f',
  bgImage = '',
  onStyleChange,
  onDelayChange,
}) => {
  const { t: tExt } = useExtTranslations();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const bgImgRef = useRef<HTMLImageElement | null>(null);

  const activeColor = color && color.trim() ? color : '#7aa2f7';
  const effectiveText = text && text.trim() ? text.trim() : 'INITIALIZING PANEL...';

  const STYLES = [
    {
      value: 'bar',
      label: tExt('admin.stylings.preloaderStyles.bar', { defaultValue: 'Minimal Bar' }),
      icon: faGripLines,
    },
    {
      value: 'circular',
      label: tExt('admin.stylings.preloaderStyles.circular', { defaultValue: 'Orbit Rings' }),
      icon: faCircleNotch,
    },
    {
      value: 'dots',
      label: tExt('admin.stylings.preloaderStyles.dots', { defaultValue: 'Pulse Dots' }),
      icon: faEllipsis,
    },
    {
      value: 'cyber',
      label: tExt('admin.stylings.preloaderStyles.cyber', { defaultValue: 'Cyber Scanner' }),
      icon: faTerminal,
    },
    {
      value: 'cube',
      label: tExt('admin.stylings.preloaderStyles.cube', { defaultValue: 'Quantum Cube' }),
      icon: faCube,
    },
    {
      value: 'wave',
      label: tExt('admin.stylings.preloaderStyles.wave', { defaultValue: 'Equalizer Wave' }),
      icon: faWaveSquare,
    },
  ];

  // Load logo image
  useEffect(() => {
    const src = logoUrl && logoUrl.trim() ? logoUrl.trim() : '/icon.svg';
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => {
      logoImgRef.current = img;
    };
    img.onerror = () => {
      if (src !== '/icon.svg') {
        img.src = '/icon.svg';
      }
    };
    return () => {
      logoImgRef.current = null;
    };
  }, [logoUrl]);

  // Load background image
  useEffect(() => {
    if (bgImage && bgImage.trim()) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = bgImage.trim();
      img.onload = () => {
        bgImgRef.current = img;
      };
      img.onerror = () => {
        bgImgRef.current = null;
      };
    } else {
      bgImgRef.current = null;
    }
  }, [bgImage]);

  // Handle simulation run
  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now();

    // Generate ambient background stars
    const particles: { x: number; y: number; s: number; a: number; v: number }[] = [];
    for (let i = 0; i < 28; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        s: 0.8 + Math.random() * 1.6,
        a: 0.15 + Math.random() * 0.45,
        v: 0.00015 + Math.random() * 0.0003,
      });
    }

    let lastTime = performance.now();
    let virtualTime = 0;

    const render = (now: number) => {
      const delta = Math.min(Math.max(0, (now - lastTime) / 1000), 0.033);
      lastTime = now;
      virtualTime += delta;
      const time = virtualTime;

      // Handle DPI
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || 560;
      const height = rect.height || 260;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Draw Background
      ctx.fillStyle = bgColor && bgColor.trim() ? bgColor.trim() : '#090a0f';
      ctx.fillRect(0, 0, width, height);

      // Background Image if loaded
      if (bgImgRef.current && bgImgRef.current.complete && bgImgRef.current.naturalWidth > 0) {
        ctx.save();
        ctx.globalAlpha = 0.4;
        const img = bgImgRef.current;
        const hRatio = width / img.naturalWidth;
        const vRatio = height / img.naturalHeight;
        const ratio = Math.max(hRatio, vRatio);
        const centerShiftX = (width - img.naturalWidth * ratio) / 2;
        const centerShiftY = (height - img.naturalHeight * ratio) / 2;
        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, centerShiftX, centerShiftY, img.naturalWidth * ratio, img.naturalHeight * ratio);
        ctx.restore();
      }

      // Radial Ambient Glow
      const cx = width / 2;
      const cy = height / 2 - 10;
      const radGlow = ctx.createRadialGradient(cx, cy, 5, cx, cy, width * 0.45);
      radGlow.addColorStop(0, `${activeColor}22`);
      radGlow.addColorStop(0.6, 'rgba(108, 92, 231, 0.08)');
      radGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = radGlow;
      ctx.fillRect(0, 0, width, height);

      // Ambient Drifting Dust Particles
      ctx.save();
      particles.forEach((p) => {
        p.y -= p.v;
        if (p.y < 0) p.y = 1;
        const px = p.x * width;
        const py = p.y * height;
        const pulse = p.a * (0.6 + 0.4 * Math.sin(time * 2 + p.x * 10));
        ctx.fillStyle = activeColor;
        ctx.globalAlpha = pulse;
        ctx.beginPath();
        ctx.arc(px, py, p.s, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // 2. Draw Center Logo & App Name
      const logoImg = logoImgRef.current;
      const effectiveAppName = (appName && appName.trim()) ? appName.trim() : 'Calagopus';
      const isBannerLogo = logoUrl ? (logoUrl.toLowerCase().includes('banner') || logoUrl.toLowerCase().includes('2016')) : false;

      let currentY = cy - 38;
      const logoPulse = 1 + 0.02 * Math.sin(time * 2.2);

      if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
        ctx.save();
        ctx.translate(cx, currentY);
        ctx.scale(logoPulse, logoPulse);
        const maxW = isBannerLogo ? 200 : 100;
        const maxH = isBannerLogo ? 60 : 40;
        const scale = Math.min(maxW / logoImg.naturalWidth, maxH / logoImg.naturalHeight, 1);
        const drawW = logoImg.naturalWidth * scale;
        const drawH = logoImg.naturalHeight * scale;
        ctx.shadowColor = `${activeColor}55`;
        ctx.shadowBlur = 12;
        ctx.drawImage(logoImg, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
        currentY += drawH / 2 + 10;
      }

      if (!isBannerLogo) {
        ctx.save();
        ctx.translate(cx, currentY);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = `${activeColor}66`;
        ctx.shadowBlur = 10;
        ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(effectiveAppName, 0, 0);
        ctx.restore();
        currentY += 16;
      }

      // 3. Draw Selected Preloader Style
      const loaderY = currentY + 16;
      drawPreloaderSpinner(ctx, style, activeColor, cx, loaderY, time);

      // 4. Draw Subtitle Status Text
      const textY = loaderY + 32;
      ctx.save();
      ctx.font = '500 10px monospace, "JetBrains Mono", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = '2px';

      const textPulse = 0.7 + 0.3 * Math.sin(time * 2.5);
      ctx.globalAlpha = textPulse;
      ctx.fillStyle = '#a9b1d6';
      ctx.shadowColor = activeColor;
      ctx.shadowBlur = 6;
      ctx.fillText(effectiveText, cx, textY);
      ctx.restore();

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [style, bgColor, activeColor, effectiveText, appName]);

  return (
    <Stack gap='xs'>
      {/* 1. Native Qunix Card for Canvas Preview Sandbox */}
      <div
        style={{
          background: '#090a0f',
          border: '1px solid #222228',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Live Canvas Element */}
        <div style={{ position: 'relative', width: '100%', height: '240px', background: bgColor || '#090a0f' }}>
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
            }}
          />
        </div>

        {/* Native Qunix Footer Controls Bar - Load Duration Presets */}
        <div
          style={{
            padding: '8px 12px',
            background: '#141418',
            borderTop: '1px solid #222228',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <Group gap={6} align='center'>
            <span style={{ fontSize: '11px', color: '#71717a' }}>
              {tExt('admin.stylings.preloaderLoadTime', { defaultValue: 'Load Duration:' })}
            </span>
            {DELAY_PRESETS.map((p) => (
              <button
                key={p}
                type='button'
                onClick={() => onDelayChange?.(p)}
                style={{
                  padding: '3px 10px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: delay === p ? '1px solid #6c5ce7' : '1px solid #27272a',
                  background: delay === p ? '#6c5ce7' : '#1e1e26',
                  color: delay === p ? '#ffffff' : '#a1a1aa',
                  transition: 'all 0.15s ease',
                }}
              >
                {p >= 1000 ? `${p / 1000}s` : `${p}ms`}
              </button>
            ))}
          </Group>
        </div>
      </div>

      {/* 2. Visual Style Picker Grid matching native Qunix Theme settings */}
      <div style={{ marginTop: '8px' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'block',
            color: '#a29bfe',
            marginBottom: '6px',
          }}
        >
          {tExt('admin.stylings.preloaderStyle', { defaultValue: 'Animation Style' })}
        </span>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '8px',
          }}
        >
          {STYLES.map((item) => {
            const isSelected = style === item.value;
            return (
              <div
                key={item.value}
                onClick={() => onStyleChange(item.value)}
                style={{
                  background: isSelected ? 'rgba(108, 92, 231, 0.12)' : '#0a0a0c',
                  border: isSelected ? '1.5px solid #6c5ce7' : '1px solid #222228',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 0 12px rgba(108, 92, 231, 0.2)' : 'none',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    background: isSelected ? '#6c5ce7' : '#1e1e26',
                    color: isSelected ? '#ffffff' : '#a1a1aa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '12px',
                  }}
                >
                  <FontAwesomeIcon icon={item.icon} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: isSelected ? '#a29bfe' : '#e4e4e7' }}>
                      {item.label}
                    </div>
                    {isSelected && (
                      <FontAwesomeIcon icon={faCheck} style={{ color: '#6c5ce7', fontSize: '10px' }} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Stack>
  );
};
