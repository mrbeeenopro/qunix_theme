import React, { useEffect, useState, useRef } from 'react';
import {
  Stack,
  Group,
  NumberInput,
  TextInput,
  Switch,
  Tabs,
  useComputedColorScheme,
  FileButton,
  Select,
} from '@mantine/core';

// Helper to parse Hex, RGB, or HSL strings to HSV
function parseToHsv(colorStr: string): { h: number; s: number; v: number; a: number } {
  const str = (colorStr || '').trim().toLowerCase();

  // Default fallback (violet/purple default)
  let r = 108,
    g = 92,
    b = 231,
    a = 1;

  if (str.startsWith('#')) {
    const hex = str.slice(1);
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 4) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
      a = parseInt(hex[3] + hex[3], 16) / 255;
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else if (hex.length === 8) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
      a = parseInt(hex.substring(6, 8), 16) / 255;
    }
  } else if (str.startsWith('rgb')) {
    const match = str.match(/rgba?\(?\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)?/);
    if (match) {
      r = parseInt(match[1], 10);
      g = parseInt(match[2], 10);
      b = parseInt(match[3], 10);
      if (match[4] !== undefined) a = parseFloat(match[4]);
    }
  } else if (str.startsWith('hsl')) {
    const match = str.match(/hsla?\(?\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+)\s*)?\)?/);
    if (match) {
      const h = parseInt(match[1], 10);
      const s = parseInt(match[2], 10) / 100;
      const l = parseInt(match[3], 10) / 100;
      const alpha = match[4] !== undefined ? parseFloat(match[4]) : 1;

      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = l - c / 2;
      let r1 = 0,
        g1 = 0,
        b1 = 0;
      if (h >= 0 && h < 60) {
        r1 = c;
        g1 = x;
      } else if (h >= 60 && h < 120) {
        r1 = x;
        g1 = c;
      } else if (h >= 120 && h < 180) {
        g1 = c;
        b1 = x;
      } else if (h >= 180 && h < 240) {
        g1 = x;
        b1 = c;
      } else if (h >= 240 && h < 300) {
        r1 = x;
        b1 = c;
      } else if (h >= 300 && h <= 360) {
        r1 = c;
        b1 = x;
      }
      r = Math.round((r1 + m) * 255);
      g = Math.round((g1 + m) * 255);
      b = Math.round((b1 + m) * 255);
      a = alpha;
    }
  }

  const rNorm = r / 255,
    gNorm = g / 255,
    bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm),
    min = Math.min(rNorm, gNorm, bNorm);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100), a };
}

// Format HSV + Alpha to Hex, RGBA or HSLA string
function formatColor(h: number, s: number, v: number, a: number, originalFormat: 'hex' | 'rgba' | 'hsla'): string {
  const sNorm = s / 100;
  const vNorm = v / 100;
  const c = vNorm * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = vNorm - c;
  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
  } else if (h >= 120 && h < 180) {
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    b = c;
  } else if (h >= 300 && h <= 360) {
    r = c;
    b = x;
  }

  const r255 = Math.round((r + m) * 255);
  const g255 = Math.round((g + m) * 255);
  const b255 = Math.round((b + m) * 255);

  if (originalFormat === 'rgba' || a < 1) {
    return `rgba(${r255}, ${g255}, ${b255}, ${parseFloat(a.toFixed(2))})`;
  } else if (originalFormat === 'hsla') {
    const rNorm2 = r255 / 255,
      gNorm2 = g255 / 255,
      bNorm2 = b255 / 255;
    const max = Math.max(rNorm2, gNorm2, bNorm2),
      min = Math.min(rNorm2, gNorm2, bNorm2);
    let sL = 0,
      lL = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      sL = lL > 0.5 ? d / (2 - max - min) : d / (max + min);
    }
    return `hsla(${h}, ${Math.round(sL * 100)}%, ${Math.round(lL * 100)}%, ${parseFloat(a.toFixed(2))})`;
  } else {
    const toHexStr = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHexStr(r255)}${toHexStr(g255)}${toHexStr(b255)}`;
  }
}

interface CustomColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

function CustomColorPicker({ value, onChange }: CustomColorPickerProps) {
  const hsv = parseToHsv(value);
  const [hue, setHue] = useState(hsv.h);
  const [sat, setSat] = useState(hsv.s);
  const [val, setVal] = useState(hsv.v);
  const [alpha, setAlpha] = useState(hsv.a);

  const getFormat = (str: string): 'hex' | 'rgba' | 'hsla' => {
    const s = str.trim().toLowerCase();
    if (s.startsWith('rgb')) return 'rgba';
    if (s.startsWith('hsl')) return 'hsla';
    return 'hex';
  };
  const originalFormat = getFormat(value);

  // Sync state if value changes externally
  useEffect(() => {
    const nextHsv = parseToHsv(value);
    setHue(nextHsv.h);
    setSat(nextHsv.s);
    setVal(nextHsv.v);
    setAlpha(nextHsv.a);
  }, [value]);

  const hueRefVal = useRef(hue);
  const satRefVal = useRef(sat);
  const valRefVal = useRef(val);
  const alphaRefVal = useRef(alpha);

  useEffect(() => {
    hueRefVal.current = hue;
  }, [hue]);
  useEffect(() => {
    satRefVal.current = sat;
  }, [sat]);
  useEffect(() => {
    valRefVal.current = val;
  }, [val]);
  useEffect(() => {
    alphaRefVal.current = alpha;
  }, [alpha]);

  const updateColor = (h: number, s: number, v: number, a: number) => {
    const formatted = formatColor(h, s, v, a, originalFormat);
    onChange(formatted);
  };

  const satValRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const alphaRef = useRef<HTMLDivElement>(null);

  const handleSatValMouseDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const getCoords = (event: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
      return { clientX, clientY };
    };

    const moveHandler = (clientX: number, clientY: number) => {
      if (!satValRef.current) return;
      const rect = satValRef.current.getBoundingClientRect();
      const s = Math.min(100, Math.max(0, Math.round(((clientX - rect.left) / rect.width) * 100)));
      const v = Math.min(100, Math.max(0, Math.round((1 - (clientY - rect.top) / rect.height) * 100)));
      setSat(s);
      setVal(v);
      updateColor(hueRefVal.current, s, v, alphaRefVal.current);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = getCoords(event);
      moveHandler(clientX, clientY);
    };
    const handleTouchMove = (event: TouchEvent) => {
      const { clientX, clientY } = getCoords(event);
      moveHandler(clientX, clientY);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    if ('touches' in e) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      const { clientX, clientY } = getCoords(e.nativeEvent);
      moveHandler(clientX, clientY);
    } else {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      moveHandler(e.clientX, e.clientY);
    }
  };

  const handleHueMouseDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const getCoords = (event: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      return clientX;
    };

    const moveHandler = (clientX: number) => {
      if (!hueRef.current) return;
      const rect = hueRef.current.getBoundingClientRect();
      const h = Math.min(360, Math.max(0, Math.round(((clientX - rect.left) / rect.width) * 360)));
      setHue(h);
      updateColor(h, satRefVal.current, valRefVal.current, alphaRefVal.current);
    };

    const handleMouseMove = (event: MouseEvent) => {
      moveHandler(getCoords(event));
    };
    const handleTouchMove = (event: TouchEvent) => {
      moveHandler(getCoords(event));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    if ('touches' in e) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      moveHandler(getCoords(e.nativeEvent));
    } else {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      moveHandler(e.clientX);
    }
  };

  const handleAlphaMouseDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const getCoords = (event: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      return clientX;
    };

    const moveHandler = (clientX: number) => {
      if (!alphaRef.current) return;
      const rect = alphaRef.current.getBoundingClientRect();
      const a = Math.min(1, Math.max(0, parseFloat(((clientX - rect.left) / rect.width).toFixed(2))));
      setAlpha(a);
      updateColor(hueRefVal.current, satRefVal.current, valRefVal.current, a);
    };

    const handleMouseMove = (event: MouseEvent) => {
      moveHandler(getCoords(event));
    };
    const handleTouchMove = (event: TouchEvent) => {
      moveHandler(getCoords(event));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    if ('touches' in e) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      moveHandler(getCoords(e.nativeEvent));
    } else {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      moveHandler(e.clientX);
    }
  };

  const pureHueBg = `hsl(${hue}, 100%, 50%)`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '200px', userSelect: 'none' }}>
      {/* Saturation/Value Box */}
      <div
        ref={satValRef}
        onMouseDown={handleSatValMouseDown}
        onTouchStart={handleSatValMouseDown}
        style={{
          position: 'relative',
          height: '110px',
          borderRadius: '8px',
          backgroundColor: pureHueBg,
          backgroundImage: 'linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)',
          cursor: 'crosshair',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Pointer */}
        <div
          style={{
            position: 'absolute',
            left: `${sat}%`,
            top: `${100 - val}%`,
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            border: '2px solid #ffffff',
            boxShadow: '0 0 2px rgba(0,0,0,0.8)',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Hue Slider */}
      <div
        ref={hueRef}
        onMouseDown={handleHueMouseDown}
        onTouchStart={handleHueMouseDown}
        style={{
          position: 'relative',
          height: '10px',
          borderRadius: '5px',
          backgroundImage: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
          cursor: 'ew-resize',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Pointer */}
        <div
          style={{
            position: 'absolute',
            left: `${(hue / 360) * 100}%`,
            top: '50%',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0,0,0,0.3)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Alpha Slider */}
      <div
        ref={alphaRef}
        onMouseDown={handleAlphaMouseDown}
        onTouchStart={handleAlphaMouseDown}
        style={{
          position: 'relative',
          height: '10px',
          borderRadius: '5px',
          backgroundColor: '#333',
          backgroundImage: 'repeating-conic-gradient(rgba(255, 255, 255, 0.08) 0% 25%, transparent 0% 50%)',
          backgroundSize: '8px 8px',
          cursor: 'ew-resize',
          border: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Gradient Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(to right, transparent, ${formatColor(hue, sat, val, 1, 'hex')})`,
          }}
        />
        {/* Pointer */}
        <div
          style={{
            position: 'absolute',
            left: `${alpha * 100}%`,
            top: '50%',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0,0,0,0.3)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
}

interface ColorFieldProps {
  value?: string;
  onChange?: (v: string) => void;
  onBlur?: () => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
}

/** Custom color field with dropdown picker — no Mantine Popover, pure positioning */
function ColorField({ value, onChange, onBlur, label, description, error }: ColorFieldProps) {
  const [opened, setOpened] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const colorStr = typeof value === 'string' ? value : '';

  // Click-outside handler
  useEffect(() => {
    if (!opened) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpened(false);
        onBlur?.();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [opened, onBlur]);

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}
    >
      {label && <div style={{ fontSize: '11px', fontWeight: 500, color: '#a1a1aa' }}>{label}</div>}
      {description && <div style={{ fontSize: '11px', color: '#52525b', marginTop: '-2px' }}>{description}</div>}
      {/* Trigger */}
      <div
        onClick={() => setOpened(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#0d0d0f',
          border: `1px solid ${opened ? '#6c5ce7' : '#1a1a20'}`,
          borderRadius: '8px',
          padding: '0 10px',
          height: '36px',
          cursor: 'text',
          transition: 'border-color 0.15s',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: '22px',
            height: '22px',
            minWidth: '22px',
            borderRadius: '6px',
            background: colorStr || 'transparent',
            border: '1px solid rgba(255,255,255,0.15)',
            cursor: 'pointer',
          }}
          onClick={(e) => {
            e.stopPropagation();
            setOpened((o) => !o);
          }}
        />
        <input
          value={colorStr}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setOpened(true)}
          placeholder='—'
          style={{
            flex: 1,
            minWidth: 0,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#c4c4cf',
            fontSize: '11px',
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            padding: 0,
            height: '100%',
          }}
        />
      </div>
      {/* Dropdown */}
      {opened && (
        <div
          style={{
            position: 'absolute',
            zIndex: 9999,
            top: 'calc(100% + 4px)',
            left: 0,
            background: 'rgba(8, 8, 10, 0.92)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            borderRadius: '14px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.70)',
            padding: '12px',
            minWidth: '220px',
          }}
        >
          <CustomColorPicker value={colorStr} onChange={(v) => onChange?.(v)} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: colorStr || 'transparent',
                border: '2px solid rgba(255,255,255,0.12)',
                flexShrink: 0,
                boxShadow: colorStr ? `0 0 8px ${colorStr}60` : 'none',
              }}
            />
            <input
              value={colorStr}
              onChange={(e) => onChange?.(e.target.value)}
              onBlur={() => onBlur?.()}
              onClick={(e) => e.stopPropagation()}
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: '12px',
                fontFamily: '"JetBrains Mono", monospace',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '6px',
                color: '#e2e8f0',
                padding: '4px 8px',
                outline: 'none',
              }}
            />
          </div>
        </div>
      )}
      {error && <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '2px' }}>{String(error)}</div>}
    </div>
  );
}

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPalette,
  faUpload,
  faDownload,
  faBullhorn,
  faBell,
  faCogs,
  faMagic,
  faRuler,
  faSquare,
  faChartLine,
  faSliders,
} from '@fortawesome/free-solid-svg-icons';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';
import { httpErrorToHuman, axiosInstance } from '@/api/axios.ts';
import getAllEggs from '@/api/admin/nests/getAllEggs.ts';
import Button from '@/elements/Button.tsx';
import TitleCard from '@/elements/TitleCard.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import { qunixThemeSettingsSchema } from './lib/schemas.ts';

function hslToHex(colorStr: string | undefined | null): string {
  if (!colorStr) return '';

  // Normalize 8-digit hex (#RRGGBBAA) to 6-digit hex or rgba
  if (colorStr.startsWith('#') && colorStr.length === 9) {
    const aHex = colorStr.slice(7, 9).toLowerCase();
    if (aHex === 'ff') {
      return colorStr.slice(0, 7);
    } else {
      const r = parseInt(colorStr.slice(1, 3), 16);
      const g = parseInt(colorStr.slice(3, 5), 16);
      const b = parseInt(colorStr.slice(5, 7), 16);
      const a = parseInt(aHex, 16) / 255;
      return `rgba(${r}, ${g}, ${b}, ${parseFloat(a.toFixed(2))})`;
    }
  }

  if (!colorStr.startsWith('hsl')) return colorStr;
  const matches = colorStr.match(/hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+)\s*)?\)/i);
  if (!matches) return colorStr;
  const h = parseInt(matches[1], 10);
  const s = parseInt(matches[2], 10) / 100;
  const l = parseInt(matches[3], 10) / 100;
  const a = matches[4] !== undefined ? parseFloat(matches[4]) : 1.0;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }
  const r255 = Math.round((r + m) * 255);
  const g255 = Math.round((g + m) * 255);
  const b255 = Math.round((b + m) * 255);

  const toHex = (n: number) => n.toString(16).padStart(2, '0');

  if (a < 1.0) {
    return `rgba(${r255}, ${g255}, ${b255}, ${a})`;
  } else {
    return `#${toHex(r255)}${toHex(g255)}${toHex(b255)}`;
  }
}

const HOVER_STYLES = [
  {
    value: 'none',
    label: 'Default',
    description: 'Use the standard panel hover style without overrides.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#1e1631' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
        <rect x='5' y='5' width='20' height='50' rx='3' fill='#161025' />
        {/* Regular item */}
        <rect x='8' y='10' width='14' height='6' rx='2' fill='rgba(255,255,255,0.2)' />
        {/* Active item */}
        <rect x='8' y='20' width='14' height='6' rx='2' fill='rgba(255,255,255,0.4)' />
        {/* Regular item */}
        <rect x='8' y='30' width='14' height='6' rx='2' fill='rgba(255,255,255,0.2)' />
      </svg>
    ),
  },
  {
    value: 'style-1',
    label: 'Right Indicator',
    description: 'Subtle gradient background with a vertical indicator line on the right edge.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#1e1631' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
        <rect x='5' y='5' width='20' height='50' rx='3' fill='#161025' />
        {/* Regular item */}
        <rect x='8' y='10' width='14' height='6' rx='2' fill='rgba(255,255,255,0.2)' />
        {/* Active item */}
        <rect x='8' y='20' width='14' height='6' rx='2' fill='url(#style1-grad-config)' />
        <line x1='22' y1='20' x2='22' y2='26' stroke='#6c5ce7' strokeWidth='1.5' strokeLinecap='round' />
        {/* Regular item */}
        <rect x='8' y='30' width='14' height='6' rx='2' fill='rgba(255,255,255,0.2)' />

        <defs>
          <linearGradient id='style1-grad-config' x1='8' y1='20' x2='22' y2='20' gradientUnits='userSpaceOnUse'>
            <stop stopColor='rgba(108, 92, 231, 0.15)' />
            <stop offset='1' stopColor='rgba(108, 92, 231, 0.02)' />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    value: 'style-2',
    label: 'Left Pill Indicator',
    description: 'Rounded card style with a vertical left indicator pill.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#1e1631' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
        <rect x='5' y='5' width='20' height='50' rx='3' fill='#161025' />
        {/* Regular item */}
        <rect x='8' y='10' width='14' height='6' rx='2' fill='rgba(255,255,255,0.2)' />
        {/* Active item */}
        <rect x='8' y='20' width='14' height='6' rx='3' fill='rgba(255,255,255,0.05)' />
        <line x1='6.5' y1='21.5' x2='6.5' y2='24.5' stroke='#6c5ce7' strokeWidth='1.5' strokeLinecap='round' />
        <rect x='10' y='20' width='10' height='6' rx='1' fill='#6c5ce7' fillOpacity='0.8' />
        {/* Regular item */}
        <rect x='8' y='30' width='14' height='6' rx='2' fill='rgba(255,255,255,0.2)' />
      </svg>
    ),
  },
  {
    value: 'style-3',
    label: 'Floating Inset Pill',
    description: 'Floating rounded card with side margins, no vertical indicators.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#1e1631' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
        <rect x='5' y='5' width='20' height='50' rx='3' fill='#161025' />
        {/* Regular item */}
        <rect x='8' y='10' width='14' height='6' rx='2' fill='rgba(255,255,255,0.2)' />
        {/* Active item */}
        <rect x='9' y='20' width='12' height='6' rx='3' fill='#6c5ce7' fillOpacity='0.9' />
        {/* Regular item */}
        <rect x='8' y='30' width='14' height='6' rx='2' fill='rgba(255,255,255,0.2)' />
      </svg>
    ),
  },
  {
    value: 'style-4',
    label: 'Flat Full-width',
    description: 'Square blocks that expand completely to the edges of the sidebar.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#1e1631' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
        <rect x='5' y='5' width='20' height='50' rx='3' fill='#161025' />
        {/* Regular item */}
        <rect x='8' y='10' width='14' height='6' rx='2' fill='rgba(255,255,255,0.2)' />
        {/* Active item */}
        <rect x='5' y='20' width='20' height='6' fill='#6c5ce7' fillOpacity='0.8' />
        {/* Regular item */}
        <rect x='8' y='30' width='14' height='6' rx='2' fill='rgba(255,255,255,0.2)' />
      </svg>
    ),
  },
];

export default function ConfigurationPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [nests, setNests] = useState<any[]>([]);
  const computedColorScheme = useComputedColorScheme('dark');

  const rawInitialValues = {
    background_color: '#1a1b26',
    text_color: '#c0caf5',
    focus_color: '#bc9cf6',
    shadow_opacity: 0.25,
    font_family: 'JetBrains Mono',
    dark_7_color: '#0a0a0a',
    dark_6_color: '#111111',
    sidebar_color: '#16161e',
    card_color: 'rgba(36, 40, 59, 0.74)',
    border_color: 'rgba(154, 165, 233, 0.15)',
    border_radius: 8,
    navbar_color: '#1f2335',
    terminal_color: '#1a1b26',
    terminal_text_color: '#a9b1d6',
    input_color: '#24283b',
    button_radius: 8,
    input_radius: 8,
    card_radius: 8,
    navbar_height: 64,
    sidebar_item_gap: 4,
    sidebar_animation: true,
    background_image: '',
    sidebar_blur: 0,
    wallpaper_blur: 0,
    wallpaper_brightness: 1.0,
    glass_transparency: 20,
    editor_color: '#1a1b26',
    editor_text_color: '#c0caf5',
    listing_color: '#24283b',
    button_color: '#7aa2f7',
    server_action_bg: '#0a0a0a',
    power_start_bg: '#40c057',
    power_restart_bg: '#868e96',
    power_stop_bg: '#fa5252',
    sidebar_active_color: '#7aa2f7',
    sidebar_active_bg: 'rgba(255, 255, 255, 0.05)',
    sidebar_item_height: 36,
    terminal_cursor_color: '#7aa2f7',
    terminal_selection_color: 'rgba(255, 255, 255, 0.15)',
    terminal_ansi_black: '#15161e',
    terminal_ansi_red: '#f7768e',
    terminal_ansi_green: '#9ece6a',
    terminal_ansi_yellow: '#e0af68',
    terminal_ansi_blue: '#7aa2f7',
    terminal_ansi_magenta: '#bb9af7',
    terminal_ansi_cyan: '#7dcfff',
    terminal_ansi_white: '#a9b1d6',
    egg_banners: {} as Record<string, string>,
    chart_series_1_border: '#22d3ee',
    chart_series_1_fill: 'rgba(14, 116, 144, 0.5)',
    chart_series_2_border: '#facc15',
    chart_series_2_fill: 'rgba(161, 98, 7, 0.5)',

    // Light Mode Defaults
    light_background_color: '#f3effa',
    light_text_color: '#1e1631',
    light_focus_color: '#8542f0',
    light_shadow_opacity: 0.08,
    light_dark_7_color: '#ffffff',
    light_dark_6_color: '#ebebeb',
    light_sidebar_color: '#ffffff',
    light_card_color: '#ffffff',
    light_border_color: 'rgba(108, 92, 231, 0.15)',
    light_navbar_color: '#ffffff',
    light_terminal_color: '#f1f2f6',
    light_terminal_text_color: '#2f3542',
    light_input_color: '#f1f2f6',
    light_background_image: '',
    light_editor_color: '#ffffff',
    light_editor_text_color: '#2f3542',
    light_listing_color: '#ffffff',
    light_button_color: '#6c5ce7',
    light_server_action_bg: '#f1f2f6',
    light_power_start_bg: '#2ed573',
    light_power_restart_bg: '#747d8c',
    light_power_stop_bg: '#ff4757',
    light_sidebar_active_color: '#6c5ce7',
    light_sidebar_active_bg: 'rgba(108, 92, 231, 0.1)',
    light_terminal_cursor_color: '#6c5ce7',
    light_terminal_selection_color: 'rgba(108, 92, 231, 0.3)',
    light_terminal_ansi_black: '#d5d6db',
    light_terminal_ansi_red: '#f7768e',
    light_terminal_ansi_green: '#485e30',
    light_terminal_ansi_yellow: '#8f5e15',
    light_terminal_ansi_blue: '#34548a',
    light_terminal_ansi_magenta: '#5a4a78',
    light_terminal_ansi_cyan: '#0f4b6e',
    light_terminal_ansi_white: '#343b58',
    light_chart_series_1_border: '#0891b2',
    light_chart_series_1_fill: 'rgba(8, 145, 178, 0.15)',
    light_chart_series_2_border: '#d97706',
    light_chart_series_2_fill: 'rgba(217, 119, 6, 0.15)',

    // Announcement Styles Defaults
    announcement_bg: 'rgba(108, 92, 231, 0.15)',
    light_announcement_bg: 'rgba(108, 92, 231, 0.1)',
    announcement_blur: 10,
    announcement_border_color: '#6c5ce7',
    light_announcement_border_color: '#6c5ce7',
    announcement_radius: 12,
    announcement_cta_bg: '#6c5ce7',
    light_announcement_cta_bg: '#6c5ce7',
    announcement_cta_color: '#ffffff',
    light_announcement_cta_color: '#ffffff',
    announcement_cta_radius: 8,
    announcement_cta: true,
    announcement_cta_link: '',
    announcement_cta_text: 'Go to link...',
    toast_style: 'qunix',
    toast_timer: true,
    toast_radius: 8,
    toast_colored_border: true,
    toast_background_tint: true,
    listing_radius: 12,
    checkbox_radius: 4,
    sidebar_hover_style: 'style-1',
    sidebar_width: 256,
    sidebar_radius: 6,
    sidebar_active_radius: 6,
    page_title_icon: true,
  };

  const initialValues = { ...rawInitialValues };
  for (const k in initialValues) {
    if (typeof (initialValues as any)[k] === 'string') {
      (initialValues as any)[k] = hslToHex((initialValues as any)[k]);
    }
  }

  const form = useForm<z.infer<typeof qunixThemeSettingsSchema>>({
    initialValues,
    validate: zodResolver(qunixThemeSettingsSchema),
  });

  useEffect(() => {
    getAllEggs()
      .then((data) => {
        setNests(data);
      })
      .catch((err) => {
        console.error('Failed to load eggs:', err);
      });
  }, []);

  useEffect(() => {
    const styleId = 'qunix-config-page-style-override';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.innerHTML = `
        @keyframes qunix-slide-up {
          from {
            transform: translate(-50%, 100px);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }

        /* ColorInput: hide eye-dropper right section */
        .mantine-ColorInput-section[data-position="right"] {
          display: none !important;
        }

        /* Mantine Popover / Color Picker — Glass Blur Panel */
        .mantine-Popover-dropdown,
        .mantine-ColorInput-dropdown {
          background: rgba(8, 8, 10, 0.90) !important;
          backdrop-filter: blur(28px) !important;
          -webkit-backdrop-filter: blur(28px) !important;
          border: 1px solid rgba(255, 255, 255, 0.07) !important;
          border-radius: 14px !important;
          color: #e2e8f0 !important;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.70) !important;
          padding: 12px !important;
        }
        .mantine-Popover-dropdown input,
        .mantine-ColorInput-dropdown input {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          color: #e2e8f0 !important;
          border-radius: 6px !important;
        }

      `;
      document.head.appendChild(styleEl);
    }
    return () => {
      styleEl?.remove();
    };
  }, []);

  useEffect(() => {
    axiosInstance
      .get('/api/admin/extensions/dev.qunix.theme/settings')
      .then((res) => {
        const s = res.data.settings;
        for (const k in s) {
          if (typeof s[k] === 'string') {
            s[k] = hslToHex(s[k]);
          }
        }
        form.initialize({
          background_color: hslToHex(s.background_color || s.backgroundColor || '#1a1b26'),
          text_color: hslToHex(s.text_color || s.textColor || '#c0caf5'),
          focus_color: hslToHex(s.focus_color || s.focusColor || '#bc9cf6'),
          shadow_opacity:
            s.shadow_opacity !== undefined ? s.shadow_opacity : s.shadowOpacity !== undefined ? s.shadowOpacity : 0.25,
          font_family: s.font_family || s.fontFamily || 'JetBrains Mono',
          sidebar_color: hslToHex(s.sidebar_color || s.sidebarColor || '#16161e'),
          card_color: hslToHex(s.card_color || s.cardColor || 'rgba(36, 40, 59, 0.74)'),
          border_color: hslToHex(s.border_color || s.borderColor || 'rgba(154, 165, 233, 0.15)'),
          border_radius:
            s.border_radius !== undefined ? s.border_radius : s.borderRadius !== undefined ? s.borderRadius : 8,
          navbar_color: hslToHex(s.navbar_color || s.navbarColor || '#1f2335'),
          terminal_color: hslToHex(s.terminal_color || s.terminalColor || '#1a1b26'),
          terminal_text_color: hslToHex(s.terminal_text_color || s.terminalTextColor || '#a9b1d6'),
          input_color: hslToHex(s.input_color || s.inputColor || '#24283b'),
          button_radius:
            s.button_radius !== undefined ? s.button_radius : s.buttonRadius !== undefined ? s.buttonRadius : 8,
          input_radius: s.input_radius !== undefined ? s.input_radius : s.inputRadius !== undefined ? s.inputRadius : 8,
          card_radius: s.card_radius !== undefined ? s.card_radius : s.cardRadius !== undefined ? s.cardRadius : 8,
          navbar_height:
            s.navbar_height !== undefined ? s.navbar_height : s.navbarHeight !== undefined ? s.navbarHeight : 64,
          sidebar_item_gap:
            s.sidebar_item_gap !== undefined
              ? s.sidebar_item_gap
              : s.sidebarItemGap !== undefined
                ? s.sidebarItemGap
                : 4,
          sidebar_animation:
            s.sidebar_animation !== undefined
              ? s.sidebar_animation
              : s.sidebarAnimation !== undefined
                ? s.sidebarAnimation
                : true,
          background_image: s.background_image || s.backgroundImage || '',
          sidebar_blur: s.sidebar_blur !== undefined ? s.sidebar_blur : s.sidebarBlur !== undefined ? s.sidebarBlur : 0,
          wallpaper_blur:
            s.wallpaper_blur !== undefined ? s.wallpaper_blur : s.wallpaperBlur !== undefined ? s.wallpaperBlur : 0,
          wallpaper_brightness:
            s.wallpaper_brightness !== undefined
              ? s.wallpaper_brightness
              : s.wallpaperBrightness !== undefined
                ? s.wallpaperBrightness
                : 1.0,
          glass_transparency:
            s.glass_transparency !== undefined
              ? s.glass_transparency
              : s.glassTransparency !== undefined
                ? s.glassTransparency
                : 20,
          editor_color: hslToHex(s.editor_color || s.editorColor || '#000000'),
          editor_text_color: hslToHex(s.editor_text_color || s.editorTextColor || '#ffffff'),
          dark_7_color: hslToHex(s.dark_7_color || s.dark7Color || '#0a0a0a'),
          dark_6_color: hslToHex(s.dark_6_color || s.dark6Color || '#111111'),
          listing_color: hslToHex(s.listing_color || s.listingColor || '#0a0a0a'),
          button_color: hslToHex(s.button_color || s.buttonColor || '#0a72ef'),
          server_action_bg: hslToHex(
            s.server_action_bg || s.serverActionBg || s.server_action_color || s.serverActionColor || '#0a0a0a',
          ),
          power_start_bg: hslToHex(s.power_start_bg || s.powerStartBg || '#40c057'),
          power_restart_bg: hslToHex(s.power_restart_bg || s.powerRestartBg || '#868e96'),
          power_stop_bg: hslToHex(s.power_stop_bg || s.powerStopBg || '#fa5252'),
          sidebar_active_color: hslToHex(s.sidebar_active_color || s.sidebarActiveColor || '#7aa2f7'),
          sidebar_active_bg: hslToHex(s.sidebar_active_bg || s.sidebarActiveBg || 'rgba(255, 255, 255, 0.05)'),
          sidebar_item_height:
            s.sidebar_item_height !== undefined
              ? s.sidebar_item_height
              : s.sidebarItemHeight !== undefined
                ? s.sidebarItemHeight
                : 36,
          terminal_cursor_color: hslToHex(s.terminal_cursor_color || s.terminalCursorColor || '#7aa2f7'),
          terminal_selection_color: hslToHex(
            s.terminal_selection_color || s.terminalSelectionColor || 'rgba(255, 255, 255, 0.15)',
          ),
          terminal_ansi_black: hslToHex(s.terminal_ansi_black || s.terminalAnsiBlack || '#15161e'),
          terminal_ansi_red: hslToHex(s.terminal_ansi_red || s.terminalAnsiRed || '#f7768e'),
          terminal_ansi_green: hslToHex(s.terminal_ansi_green || s.terminalAnsiGreen || '#9ece6a'),
          terminal_ansi_yellow: hslToHex(s.terminal_ansi_yellow || s.terminalAnsiYellow || '#e0af68'),
          terminal_ansi_blue: hslToHex(s.terminal_ansi_blue || s.terminalAnsiBlue || '#7aa2f7'),
          terminal_ansi_magenta: hslToHex(s.terminal_ansi_magenta || s.terminalAnsiMagenta || '#bb9af7'),
          terminal_ansi_cyan: hslToHex(s.terminal_ansi_cyan || s.terminalAnsiCyan || '#7dcfff'),
          terminal_ansi_white: hslToHex(s.terminal_ansi_white || s.terminalAnsiWhite || '#a9b1d6'),
          egg_banners: s.egg_banners || s.eggBanners || {},
          chart_series_1_border: hslToHex(s.chart_series_1_border || s.chartSeries1Border || '#22d3ee'),
          chart_series_1_fill: hslToHex(s.chart_series_1_fill || s.chartSeries1Fill || 'rgba(14, 116, 144, 0.5)'),
          chart_series_2_border: hslToHex(s.chart_series_2_border || s.chartSeries2Border || '#facc15'),
          chart_series_2_fill: hslToHex(s.chart_series_2_fill || s.chartSeries2Fill || 'rgba(161, 98, 7, 0.5)'),

          // Light Mode Fields
          light_background_color: hslToHex(s.light_background_color || s.lightBackgroundColor || '#f3effa'),
          light_text_color: hslToHex(s.light_text_color || s.lightTextColor || '#1e1631'),
          light_focus_color: hslToHex(s.light_focus_color || s.lightFocusColor || '#8542f0'),
          light_dark_7_color: hslToHex(s.light_dark_7_color || s.lightDark7Color || '#ffffff'),
          light_dark_6_color: hslToHex(s.light_dark_6_color || s.lightDark6Color || '#ebebeb'),
          light_shadow_opacity:
            s.light_shadow_opacity !== undefined
              ? s.light_shadow_opacity
              : s.lightShadowOpacity !== undefined
                ? s.lightShadowOpacity
                : 0.08,
          light_sidebar_color: hslToHex(s.light_sidebar_color || s.lightSidebarColor || '#ffffff'),
          light_card_color: hslToHex(s.light_card_color || s.lightCardColor || '#ffffff'),
          light_border_color: hslToHex(s.light_border_color || s.lightBorderColor || 'rgba(108, 92, 231, 0.15)'),
          light_navbar_color: hslToHex(s.light_navbar_color || s.lightNavbarColor || '#ffffff'),
          light_terminal_color: hslToHex(s.light_terminal_color || s.lightTerminalColor || '#f1f2f6'),
          light_terminal_text_color: hslToHex(s.light_terminal_text_color || s.lightTerminalTextColor || '#2f3542'),
          light_input_color: hslToHex(s.light_input_color || s.lightInputColor || '#f1f2f6'),
          light_background_image: s.light_background_image || s.lightBackgroundImage || '',
          light_editor_color: hslToHex(s.light_editor_color || s.lightEditorColor || '#ffffff'),
          light_editor_text_color: hslToHex(s.light_editor_text_color || s.lightEditorTextColor || '#2f3542'),
          light_listing_color: hslToHex(s.light_listing_color || s.lightListingColor || '#ffffff'),
          light_button_color: hslToHex(s.light_button_color || s.lightButtonColor || '#6c5ce7'),
          light_server_action_bg: hslToHex(s.light_server_action_bg || s.lightServerActionBg || '#f1f2f6'),
          light_power_start_bg: hslToHex(s.light_power_start_bg || s.lightPowerStartBg || '#2ed573'),
          light_power_restart_bg: hslToHex(s.light_power_restart_bg || s.lightPowerRestartBg || '#747d8c'),
          light_power_stop_bg: hslToHex(s.light_power_stop_bg || s.lightPowerStopBg || '#ff4757'),
          light_sidebar_active_color: hslToHex(s.light_sidebar_active_color || s.lightSidebarActiveColor || '#6c5ce7'),
          light_sidebar_active_bg: hslToHex(
            s.light_sidebar_active_bg || s.lightSidebarActiveBg || 'rgba(108, 92, 231, 0.1)',
          ),
          light_terminal_cursor_color: hslToHex(
            s.light_terminal_cursor_color || s.lightTerminalCursorColor || '#6c5ce7',
          ),
          light_terminal_selection_color: hslToHex(
            s.light_terminal_selection_color || s.lightTerminalSelectionColor || 'rgba(108, 92, 231, 0.3)',
          ),
          light_terminal_ansi_black: hslToHex(s.light_terminal_ansi_black || s.lightTerminalAnsiBlack || '#d5d6db'),
          light_terminal_ansi_red: hslToHex(s.light_terminal_ansi_red || s.lightTerminalAnsiRed || '#f7768e'),
          light_terminal_ansi_green: hslToHex(s.light_terminal_ansi_green || s.lightTerminalAnsiGreen || '#485e30'),
          light_terminal_ansi_yellow: hslToHex(s.light_terminal_ansi_yellow || s.lightTerminalAnsiYellow || '#8f5e15'),
          light_terminal_ansi_blue: hslToHex(s.light_terminal_ansi_blue || s.lightTerminalAnsiBlue || '#34548a'),
          light_terminal_ansi_magenta: hslToHex(
            s.light_terminal_ansi_magenta || s.lightTerminalAnsiMagenta || '#5a4a78',
          ),
          light_terminal_ansi_cyan: hslToHex(s.light_terminal_ansi_cyan || s.lightTerminalAnsiCyan || '#0f4b6e'),
          light_terminal_ansi_white: hslToHex(s.light_terminal_ansi_white || s.lightTerminalAnsiWhite || '#343b58'),
          light_chart_series_1_border: hslToHex(
            s.light_chart_series_1_border || s.lightChartSeries1Border || '#0891b2',
          ),
          light_chart_series_1_fill: hslToHex(
            s.light_chart_series_1_fill || s.lightChartSeries1Fill || 'rgba(8, 145, 178, 0.15)',
          ),
          light_chart_series_2_border: hslToHex(
            s.light_chart_series_2_border || s.lightChartSeries2Border || '#d97706',
          ),
          light_chart_series_2_fill: hslToHex(
            s.light_chart_series_2_fill || s.lightChartSeries2Fill || 'rgba(217, 119, 6, 0.15)',
          ),

          // Announcement Styles
          announcement_bg: hslToHex(s.announcement_bg || s.announcementBg || 'rgba(108, 92, 231, 0.15)'),
          light_announcement_bg: hslToHex(
            s.light_announcement_bg || s.lightAnnouncementBg || 'rgba(108, 92, 231, 0.1)',
          ),
          announcement_blur:
            s.announcement_blur !== undefined
              ? s.announcement_blur
              : s.announcementBlur !== undefined
                ? s.announcementBlur
                : 10,
          announcement_border_color: hslToHex(s.announcement_border_color || s.announcementBorderColor || '#6c5ce7'),
          light_announcement_border_color: hslToHex(
            s.light_announcement_border_color || s.lightAnnouncementBorderColor || '#6c5ce7',
          ),
          announcement_radius:
            s.announcement_radius !== undefined
              ? s.announcement_radius
              : s.announcementRadius !== undefined
                ? s.announcementRadius
                : 12,
          announcement_cta:
            s.announcement_cta !== undefined
              ? s.announcement_cta
              : s.announcementCta !== undefined
                ? s.announcementCta
                : true,
          announcement_cta_bg: hslToHex(s.announcement_cta_bg || s.announcementCtaBg || '#6c5ce7'),
          light_announcement_cta_bg: hslToHex(s.light_announcement_cta_bg || s.lightAnnouncementCtaBg || '#6c5ce7'),
          announcement_cta_color: hslToHex(s.announcement_cta_color || s.announcementCtaColor || '#ffffff'),
          light_announcement_cta_color: hslToHex(
            s.light_announcement_cta_color || s.lightAnnouncementCtaColor || '#ffffff',
          ),
          announcement_cta_radius:
            s.announcement_cta_radius !== undefined
              ? s.announcement_cta_radius
              : s.announcementCtaRadius !== undefined
                ? s.announcementCtaRadius
                : 8,
          announcement_cta_link: s.announcement_cta_link || s.announcementCtaLink || '',
          announcement_cta_text: s.announcement_cta_text || s.announcementCtaText || 'Go to link...',
          toast_style: s.toast_style || s.toastStyle || 'qunix',
          toast_timer: s.toast_timer !== undefined ? s.toast_timer : s.toastTimer !== undefined ? s.toastTimer : true,
          toast_radius: s.toast_radius !== undefined ? s.toast_radius : s.toastRadius !== undefined ? s.toastRadius : 8,
          toast_colored_border:
            s.toast_colored_border !== undefined
              ? s.toast_colored_border
              : s.toastColoredBorder !== undefined
                ? s.toastColoredBorder
                : true,
          toast_background_tint:
            s.toast_background_tint !== undefined
              ? s.toast_background_tint
              : s.toastBackgroundTint !== undefined
                ? s.toastBackgroundTint
                : true,
          listing_radius:
            s.listing_radius !== undefined ? s.listing_radius : s.listingRadius !== undefined ? s.listingRadius : 12,
          checkbox_radius:
            s.checkbox_radius !== undefined ? s.checkbox_radius : s.checkboxRadius !== undefined ? s.checkboxRadius : 4,
          sidebar_hover_style: s.sidebar_hover_style || s.sidebarHoverStyle || 'style-1',
          sidebar_width:
            s.sidebar_width !== undefined ? s.sidebar_width : s.sidebarWidth !== undefined ? s.sidebarWidth : 256,
          sidebar_radius:
            s.sidebar_radius !== undefined ? s.sidebar_radius : s.sidebarRadius !== undefined ? s.sidebarRadius : 6,
          sidebar_active_radius:
            s.sidebar_active_radius !== undefined
              ? s.sidebar_active_radius
              : s.sidebarActiveRadius !== undefined
                ? s.sidebarActiveRadius
                : 6,
          page_title_icon:
            s.page_title_icon !== undefined
              ? s.page_title_icon
              : s.pageTitleIcon !== undefined
                ? s.pageTitleIcon
                : true,
        });
      })
      .catch((err) => addToast(httpErrorToHuman(err), 'error'));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const s = form.values;
    root.setAttribute('data-sidebar-hover-style', s.sidebar_hover_style || 'style-1');
    if (s.sidebar_width !== undefined) root.style.setProperty('--ds-sidebar-width', `${s.sidebar_width}px`);
    if (s.sidebar_radius !== undefined) root.style.setProperty('--ds-sidebar-radius', `${s.sidebar_radius}px`);
    if (s.sidebar_active_radius !== undefined)
      root.style.setProperty('--ds-sidebar-active-radius', `${s.sidebar_active_radius}px`);
    const isDark = computedColorScheme === 'dark';

    const getThemeVal = (darkVal: string, lightVal: string) => {
      return isDark ? darkVal : lightVal;
    };

    const getThemeValOpt = (darkVal: any, lightVal: any) => {
      return isDark ? darkVal : lightVal;
    };

    const backgroundColor = getThemeVal(s.background_color, s.light_background_color);
    const textColor = getThemeVal(s.text_color, s.light_text_color);
    const focusColor = getThemeVal(s.focus_color, s.light_focus_color);
    const sidebarColor = getThemeVal(s.sidebar_color, s.light_sidebar_color);
    const cardColor = getThemeVal(s.card_color, s.light_card_color);
    const borderColor = getThemeVal(s.border_color, s.light_border_color);
    const navbarColor = getThemeVal(s.navbar_color, s.light_navbar_color);
    const terminalColor = getThemeVal(s.terminal_color, s.light_terminal_color);
    const terminalTextColor = getThemeVal(s.terminal_text_color, s.light_terminal_text_color);
    const inputColor = getThemeVal(s.input_color, s.light_input_color);
    const editorColor = getThemeVal(s.editor_color, s.light_editor_color);
    const editorTextColor = getThemeVal(s.editor_text_color, s.light_editor_text_color);
    const listingColor = getThemeVal(s.listing_color, s.light_listing_color);
    const buttonColor = getThemeVal(s.button_color, s.light_button_color);
    const dark7Color = getThemeVal(s.dark_7_color, s.light_dark_7_color);
    const dark6Color = getThemeVal(s.dark_6_color, s.light_dark_6_color);
    const serverActionBg = getThemeVal(s.server_action_bg, s.light_server_action_bg);
    const powerStartBg = getThemeVal(s.power_start_bg, s.light_power_start_bg);
    const powerRestartBg = getThemeVal(s.power_restart_bg, s.light_power_restart_bg);
    const powerStopBg = getThemeVal(s.power_stop_bg, s.light_power_stop_bg);
    const sidebarActiveColor = getThemeVal(s.sidebar_active_color, s.light_sidebar_active_color);
    const sidebarActiveBg = getThemeVal(s.sidebar_active_bg, s.light_sidebar_active_bg);
    const backgroundImage = getThemeValOpt(s.background_image, s.light_background_image);
    const shadowOpacity = getThemeValOpt(s.shadow_opacity, s.light_shadow_opacity);
    const terminalCursor = getThemeVal(s.terminal_cursor_color, s.light_terminal_cursor_color);
    const terminalSelection = getThemeVal(s.terminal_selection_color, s.light_terminal_selection_color);
    const ansiBlack = getThemeVal(s.terminal_ansi_black, s.light_terminal_ansi_black);
    const ansiRed = getThemeVal(s.terminal_ansi_red, s.light_terminal_ansi_red);
    const ansiGreen = getThemeVal(s.terminal_ansi_green, s.light_terminal_ansi_green);
    const ansiYellow = getThemeVal(s.terminal_ansi_yellow, s.light_terminal_ansi_yellow);
    const ansiBlue = getThemeVal(s.terminal_ansi_blue, s.light_terminal_ansi_blue);
    const ansiMagenta = getThemeVal(s.terminal_ansi_magenta, s.light_terminal_ansi_magenta);
    const ansiCyan = getThemeVal(s.terminal_ansi_cyan, s.light_terminal_ansi_cyan);
    const ansiWhite = getThemeVal(s.terminal_ansi_white, s.light_terminal_ansi_white);
    const chartSeries1Border = getThemeVal(s.chart_series_1_border, s.light_chart_series_1_border);
    const chartSeries1Fill = getThemeVal(s.chart_series_1_fill, s.light_chart_series_1_fill);
    const chartSeries2Border = getThemeVal(s.chart_series_2_border, s.light_chart_series_2_border);
    const chartSeries2Fill = getThemeVal(s.chart_series_2_fill, s.light_chart_series_2_fill);

    if (backgroundColor) root.style.setProperty('--ds-background', backgroundColor);
    if (textColor) root.style.setProperty('--ds-gray-900', textColor);
    if (focusColor) root.style.setProperty('--ds-focus-color', focusColor);
    if (dark7Color) root.style.setProperty('--ds-dark-7', dark7Color);
    if (dark6Color) root.style.setProperty('--ds-dark-6', dark6Color);
    if (shadowOpacity !== undefined) {
      root.style.setProperty(
        '--ds-shadow-border',
        `0px 0px 0px 1px ${isDark ? `rgba(255, 255, 255, ${shadowOpacity})` : `rgba(0, 0, 0, ${shadowOpacity})`}`,
      );
    }
    if (sidebarColor) root.style.setProperty('--ds-sidebar-bg', sidebarColor);
    if (sidebarActiveColor) root.style.setProperty('--ds-sidebar-active-color', sidebarActiveColor);
    if (sidebarActiveBg) root.style.setProperty('--ds-sidebar-active-bg', sidebarActiveBg);
    if (s.sidebar_item_height !== undefined)
      root.style.setProperty('--ds-sidebar-item-height', `${s.sidebar_item_height}px`);
    if (cardColor) root.style.setProperty('--ds-card-bg', cardColor);
    if (borderColor) root.style.setProperty('--ds-border-color', borderColor);
    if (s.border_radius !== undefined) root.style.setProperty('--ds-border-radius', `${s.border_radius}px`);
    if (navbarColor) root.style.setProperty('--ds-navbar-bg', navbarColor);
    if (terminalColor) root.style.setProperty('--ds-terminal-bg', terminalColor);
    if (terminalTextColor) root.style.setProperty('--ds-terminal-text', terminalTextColor);
    if (inputColor) root.style.setProperty('--ds-input-bg', inputColor);
    if (terminalCursor) root.style.setProperty('--ds-terminal-cursor', terminalCursor);
    if (terminalSelection) root.style.setProperty('--ds-terminal-selection', terminalSelection);
    if (ansiBlack) root.style.setProperty('--ds-terminal-ansi-black', ansiBlack);
    if (ansiRed) root.style.setProperty('--ds-terminal-ansi-red', ansiRed);
    if (ansiGreen) root.style.setProperty('--ds-terminal-ansi-green', ansiGreen);
    if (ansiYellow) root.style.setProperty('--ds-terminal-ansi-yellow', ansiYellow);
    if (ansiBlue) root.style.setProperty('--ds-terminal-ansi-blue', ansiBlue);
    if (ansiMagenta) root.style.setProperty('--ds-terminal-ansi-magenta', ansiMagenta);
    if (ansiCyan) root.style.setProperty('--ds-terminal-ansi-cyan', ansiCyan);
    if (ansiWhite) root.style.setProperty('--ds-terminal-ansi-white', ansiWhite);
    if (chartSeries1Border) root.style.setProperty('--chart-series-1-border', chartSeries1Border);
    if (chartSeries1Fill) root.style.setProperty('--chart-series-1-fill', chartSeries1Fill);
    if (chartSeries2Border) root.style.setProperty('--chart-series-2-border', chartSeries2Border);
    if (chartSeries2Fill) root.style.setProperty('--chart-series-2-fill', chartSeries2Fill);
    if (s.button_radius !== undefined) root.style.setProperty('--ds-button-radius', `${s.button_radius}px`);
    if (s.input_radius !== undefined) root.style.setProperty('--ds-input-radius', `${s.input_radius}px`);
    if (s.card_radius !== undefined) root.style.setProperty('--ds-card-radius', `${s.card_radius}px`);
    if (s.navbar_height !== undefined) root.style.setProperty('--ds-navbar-height', `${s.navbar_height}px`);
    if (s.sidebar_item_gap !== undefined) root.style.setProperty('--ds-sidebar-item-gap', `${s.sidebar_item_gap}px`);
    if (s.sidebar_animation !== undefined)
      root.style.setProperty('--ds-sidebar-animation', s.sidebar_animation ? '1' : '0');

    if (backgroundImage !== undefined) {
      if (backgroundImage) {
        root.style.setProperty('--ds-background-image', `url(${backgroundImage})`);
        root.classList.add('has-bg-image');
        document.body.classList.add('has-bg-image');
      } else {
        root.style.setProperty('--ds-background-image', 'none');
        root.classList.remove('has-bg-image');
        document.body.classList.remove('has-bg-image');
      }
    }
    if (s.sidebar_blur !== undefined) {
      const sbNum = Number(s.sidebar_blur);
      root.style.setProperty('--ds-sidebar-blur', `${sbNum}px`);
      root.style.setProperty('--ds-sidebar-blur-active', sbNum === 0 ? 'none' : `blur(${sbNum}px)`);
    }
    if (s.wallpaper_blur !== undefined) root.style.setProperty('--ds-wallpaper-blur', `${s.wallpaper_blur}px`);
    if (s.wallpaper_brightness !== undefined)
      root.style.setProperty('--ds-wallpaper-brightness', `${s.wallpaper_brightness}`);
    if (s.glass_transparency !== undefined)
      root.style.setProperty('--ds-glass-transparency', `${s.glass_transparency}%`);
    if (editorColor) root.style.setProperty('--ds-editor-bg', editorColor);
    if (editorTextColor) root.style.setProperty('--ds-editor-text', editorTextColor);
    if (listingColor) root.style.setProperty('--ds-listing-bg', listingColor);
    if (buttonColor) root.style.setProperty('--ds-primary-color', buttonColor);
    if (serverActionBg) root.style.setProperty('--ds-server-action-bg', serverActionBg);
    if (powerStartBg) root.style.setProperty('--ds-power-start-bg', powerStartBg);
    if (powerRestartBg) root.style.setProperty('--ds-power-restart-bg', powerRestartBg);
    if (powerStopBg) root.style.setProperty('--ds-power-stop-bg', powerStopBg);
    if (s.listing_radius !== undefined) root.style.setProperty('--ds-listing-radius', `${s.listing_radius}px`);
    if (s.checkbox_radius !== undefined) root.style.setProperty('--ds-checkbox-radius', `${s.checkbox_radius}px`);

    const announcementBg = getThemeVal(s.announcement_bg, s.light_announcement_bg);
    if (announcementBg) root.style.setProperty('--ds-announcement-bg', announcementBg);
    if (s.announcement_blur !== undefined) root.style.setProperty('--ds-announcement-blur', `${s.announcement_blur}px`);
    const announcementBorder = getThemeVal(s.announcement_border_color, s.light_announcement_border_color);
    if (announcementBorder) root.style.setProperty('--ds-announcement-border', announcementBorder);
    if (s.announcement_radius !== undefined)
      root.style.setProperty('--ds-announcement-radius', `${s.announcement_radius}px`);
    const announcementCtaBg = getThemeVal(s.announcement_cta_bg, s.light_announcement_cta_bg);
    if (announcementCtaBg) root.style.setProperty('--ds-announcement-cta-bg', announcementCtaBg);
    const announcementCtaColor = getThemeVal(s.announcement_cta_color, s.light_announcement_cta_color);
    if (announcementCtaColor) root.style.setProperty('--ds-announcement-cta-color', announcementCtaColor);
    if (s.announcement_cta_radius !== undefined)
      root.style.setProperty('--ds-announcement-cta-radius', `${s.announcement_cta_radius}px`);

    (window as any).qunixThemeSettings = {
      ...((window as any).qunixThemeSettings || {}),
      toast_style: s.toast_style,
      toast_timer: s.toast_timer,
      toast_radius: s.toast_radius,
      toast_colored_border: s.toast_colored_border,
      toast_background_tint: s.toast_background_tint,
      page_title_icon: s.page_title_icon,
    };

    const fontFamily = s.font_family;
    if (fontFamily && fontFamily !== 'Inter' && fontFamily !== 'Geist') {
      const formattedFont = fontFamily
        .split(/[\s-]+/)
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      const fontId = `gfont-${formattedFont.replace(/\s+/g, '-')}`;
      if (!document.getElementById(fontId)) {
        console.log(`QUNIX_THEME: Loading Google Font: ${formattedFont}`);
        const link = document.createElement('link');
        link.id = fontId;
        link.href = `https://fonts.googleapis.com/css2?family=${formattedFont.replace(/\s+/g, '+')}:wght@400;500;600;700&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }

      root.style.setProperty('--ds-font-family', `"${formattedFont}", 'JetBrains Mono', monospace`);
    } else {
      root.style.setProperty('--ds-font-family', "'JetBrains Mono', monospace");
    }
  }, [
    computedColorScheme,
    form.values.font_family,
    form.values.background_color,
    form.values.text_color,
    form.values.focus_color,
    form.values.dark_7_color,
    form.values.dark_6_color,
    form.values.shadow_opacity,
    form.values.sidebar_color,
    form.values.card_color,
    form.values.border_color,
    form.values.border_radius,
    form.values.navbar_color,
    form.values.terminal_color,
    form.values.terminal_text_color,
    form.values.input_color,
    form.values.button_radius,
    form.values.input_radius,
    form.values.card_radius,
    form.values.navbar_height,
    form.values.sidebar_item_gap,
    form.values.sidebar_animation,
    form.values.background_image,
    form.values.sidebar_blur,
    form.values.wallpaper_blur,
    form.values.wallpaper_brightness,
    form.values.glass_transparency,
    form.values.editor_color,
    form.values.editor_text_color,
    form.values.listing_color,
    form.values.button_color,
    form.values.server_action_bg,
    form.values.power_start_bg,
    form.values.power_restart_bg,
    form.values.power_stop_bg,
    form.values.sidebar_active_color,
    form.values.sidebar_active_bg,
    form.values.sidebar_item_height,
    // Light values
    form.values.light_background_color,
    form.values.light_text_color,
    form.values.light_focus_color,
    form.values.light_dark_7_color,
    form.values.light_dark_6_color,
    form.values.light_shadow_opacity,
    form.values.light_sidebar_color,
    form.values.light_card_color,
    form.values.light_border_color,
    form.values.light_navbar_color,
    form.values.light_terminal_color,
    form.values.light_terminal_text_color,
    form.values.light_input_color,
    form.values.light_background_image,
    form.values.light_editor_color,
    form.values.light_editor_text_color,
    form.values.light_listing_color,
    form.values.light_button_color,
    form.values.light_server_action_bg,
    form.values.light_power_start_bg,
    form.values.light_power_restart_bg,
    form.values.light_power_stop_bg,
    form.values.light_sidebar_active_color,
    form.values.light_sidebar_active_bg,
    form.values.terminal_cursor_color,
    form.values.terminal_selection_color,
    form.values.terminal_ansi_black,
    form.values.terminal_ansi_red,
    form.values.terminal_ansi_green,
    form.values.terminal_ansi_yellow,
    form.values.terminal_ansi_blue,
    form.values.terminal_ansi_magenta,
    form.values.terminal_ansi_cyan,
    form.values.terminal_ansi_white,
    form.values.light_terminal_cursor_color,
    form.values.light_terminal_selection_color,
    form.values.light_terminal_ansi_black,
    form.values.light_terminal_ansi_red,
    form.values.light_terminal_ansi_green,
    form.values.light_terminal_ansi_yellow,
    form.values.light_terminal_ansi_blue,
    form.values.light_terminal_ansi_magenta,
    form.values.light_terminal_ansi_cyan,
    form.values.light_terminal_ansi_white,
    // Announcement customization
    form.values.announcement_bg,
    form.values.light_announcement_bg,
    form.values.announcement_blur,
    form.values.announcement_border_color,
    form.values.light_announcement_border_color,
    form.values.announcement_radius,
    form.values.announcement_cta_bg,
    form.values.light_announcement_cta_bg,
    form.values.announcement_cta_color,
    form.values.light_announcement_cta_color,
    form.values.announcement_cta_radius,
    form.values.announcement_cta_link,
    form.values.announcement_cta_text,
    form.values.toast_style,
    form.values.toast_timer,
    form.values.toast_radius,
    form.values.toast_colored_border,
    form.values.toast_background_tint,
    form.values.listing_radius,
    form.values.checkbox_radius,
    form.values.sidebar_hover_style,
    form.values.sidebar_width,
    form.values.sidebar_radius,
    form.values.sidebar_active_radius,
    form.values.page_title_icon,
  ]);

  const doSave = () => {
    const payload = {
      background_color: form.values.background_color,
      text_color: form.values.text_color,
      focus_color: form.values.focus_color,
      dark_7_color: form.values.dark_7_color,
      dark_6_color: form.values.dark_6_color,
      shadow_opacity: form.values.shadow_opacity,
      font_family: form.values.font_family,
      sidebar_color: form.values.sidebar_color,
      card_color: form.values.card_color,
      border_color: form.values.border_color,
      border_radius: form.values.border_radius,
      navbar_color: form.values.navbar_color,
      terminal_color: form.values.terminal_color,
      terminal_text_color: form.values.terminal_text_color,
      input_color: form.values.input_color,
      button_radius: form.values.button_radius,
      input_radius: form.values.input_radius,
      card_radius: form.values.card_radius,
      navbar_height: form.values.navbar_height,
      sidebar_item_gap: form.values.sidebar_item_gap,
      sidebar_animation: form.values.sidebar_animation,
      background_image: form.values.background_image,
      sidebar_blur: form.values.sidebar_blur,
      wallpaper_blur: form.values.wallpaper_blur,
      wallpaper_brightness: form.values.wallpaper_brightness,
      glass_transparency: form.values.glass_transparency,
      editor_color: form.values.editor_color,
      editor_text_color: form.values.editor_text_color,
      listing_color: form.values.listing_color,
      button_color: form.values.button_color,
      server_action_bg: form.values.server_action_bg,
      power_start_bg: form.values.power_start_bg,
      power_restart_bg: form.values.power_restart_bg,
      power_stop_bg: form.values.power_stop_bg,
      sidebar_active_color: form.values.sidebar_active_color,
      sidebar_active_bg: form.values.sidebar_active_bg,
      sidebar_item_height: form.values.sidebar_item_height,
      terminal_cursor_color: form.values.terminal_cursor_color,
      terminal_selection_color: form.values.terminal_selection_color,
      terminal_ansi_black: form.values.terminal_ansi_black,
      terminal_ansi_red: form.values.terminal_ansi_red,
      terminal_ansi_green: form.values.terminal_ansi_green,
      terminal_ansi_yellow: form.values.terminal_ansi_yellow,
      terminal_ansi_blue: form.values.terminal_ansi_blue,
      terminal_ansi_magenta: form.values.terminal_ansi_magenta,
      terminal_ansi_cyan: form.values.terminal_ansi_cyan,
      terminal_ansi_white: form.values.terminal_ansi_white,
      egg_banners: form.values.egg_banners,

      // Light Mode Fields
      light_background_color: form.values.light_background_color,
      light_text_color: form.values.light_text_color,
      light_focus_color: form.values.light_focus_color,
      light_dark_7_color: form.values.light_dark_7_color,
      light_dark_6_color: form.values.light_dark_6_color,
      light_shadow_opacity: form.values.light_shadow_opacity,
      light_sidebar_color: form.values.light_sidebar_color,
      light_card_color: form.values.light_card_color,
      light_border_color: form.values.light_border_color,
      light_navbar_color: form.values.light_navbar_color,
      light_terminal_color: form.values.light_terminal_color,
      light_terminal_text_color: form.values.light_terminal_text_color,
      light_input_color: form.values.light_input_color,
      light_background_image: form.values.light_background_image,
      light_editor_color: form.values.light_editor_color,
      light_editor_text_color: form.values.light_editor_text_color,
      light_listing_color: form.values.light_listing_color,
      light_button_color: form.values.light_button_color,
      light_server_action_bg: form.values.light_server_action_bg,
      light_power_start_bg: form.values.light_power_start_bg,
      light_power_restart_bg: form.values.light_power_restart_bg,
      light_power_stop_bg: form.values.light_power_stop_bg,
      light_sidebar_active_color: form.values.light_sidebar_active_color,
      light_sidebar_active_bg: form.values.light_sidebar_active_bg,
      light_terminal_cursor_color: form.values.light_terminal_cursor_color,
      light_terminal_selection_color: form.values.light_terminal_selection_color,
      light_terminal_ansi_black: form.values.light_terminal_ansi_black,
      light_terminal_ansi_red: form.values.light_terminal_ansi_red,
      light_terminal_ansi_green: form.values.light_terminal_ansi_green,
      light_terminal_ansi_yellow: form.values.light_terminal_ansi_yellow,
      light_terminal_ansi_blue: form.values.light_terminal_ansi_blue,
      light_terminal_ansi_magenta: form.values.light_terminal_ansi_magenta,
      light_terminal_ansi_cyan: form.values.light_terminal_ansi_cyan,
      light_terminal_ansi_white: form.values.light_terminal_ansi_white,

      // Console Charts
      chart_series_1_border: form.values.chart_series_1_border,
      chart_series_1_fill: form.values.chart_series_1_fill,
      chart_series_2_border: form.values.chart_series_2_border,
      chart_series_2_fill: form.values.chart_series_2_fill,
      light_chart_series_1_border: form.values.light_chart_series_1_border,
      light_chart_series_1_fill: form.values.light_chart_series_1_fill,
      light_chart_series_2_border: form.values.light_chart_series_2_border,
      light_chart_series_2_fill: form.values.light_chart_series_2_fill,

      // Announcement Styles
      announcement_bg: form.values.announcement_bg,
      light_announcement_bg: form.values.light_announcement_bg,
      announcement_blur: form.values.announcement_blur,
      announcement_border_color: form.values.announcement_border_color,
      light_announcement_border_color: form.values.light_announcement_border_color,
      announcement_radius: form.values.announcement_radius,
      announcement_cta: form.values.announcement_cta,
      announcement_cta_bg: form.values.announcement_cta_bg,
      light_announcement_cta_bg: form.values.light_announcement_cta_bg,
      announcement_cta_color: form.values.announcement_cta_color,
      light_announcement_cta_color: form.values.light_announcement_cta_color,
      announcement_cta_radius: form.values.announcement_cta_radius,
      announcement_cta_link: form.values.announcement_cta_link,
      announcement_cta_text: form.values.announcement_cta_text,
      toast_style: form.values.toast_style,
      toast_timer: form.values.toast_timer,
      toast_radius: form.values.toast_radius,
      toast_colored_border: form.values.toast_colored_border,
      toast_background_tint: form.values.toast_background_tint,
      listing_radius: form.values.listing_radius,
      checkbox_radius: form.values.checkbox_radius,
      sidebar_hover_style: form.values.sidebar_hover_style,
      sidebar_width: form.values.sidebar_width,
      sidebar_radius: form.values.sidebar_radius,
      sidebar_active_radius: form.values.sidebar_active_radius,
      page_title_icon: form.values.page_title_icon,
    };

    console.log('QUNIX_THEME: Attempting to save settings:', payload);
    setLoading(true);
    axiosInstance
      .put('/api/admin/extensions/dev.qunix.theme/settings', payload)
      .then((res) => {
        console.log('QUNIX_THEME: Save successful:', res.data);
        addToast('Theme settings saved. Refresh the page to apply.', 'success');
        form.initialize(payload);
      })
      .catch((err) => {
        console.error('QUNIX_THEME: Save failed:', err);
        addToast(httpErrorToHuman(err), 'error');
      })
      .finally(() => setLoading(false));
  };

  const handleReset = () => {
    const rawDefaultSettings = {
      background_color: '#120b1f',
      text_color: '#e2e8f0',
      focus_color: '#8542f0',
      dark_7_color: '#0a0a0a',
      dark_6_color: '#111111',
      shadow_opacity: 0.25,
      font_family: 'JetBrains Mono',
      sidebar_color: '#1a1329',
      card_color: '#1e1631',
      border_color: 'rgba(156, 136, 255, 0.15)',
      border_radius: 20,
      navbar_color: '#161025',
      terminal_color: '#1a1b26',
      terminal_text_color: '#a9b1d6',
      input_color: '#251b3a',
      button_radius: 20,
      input_radius: 8,
      card_radius: 12,
      navbar_height: 64,
      sidebar_item_gap: 6,
      sidebar_animation: true,
      background_image: '',
      sidebar_blur: 0,
      wallpaper_blur: 0,
      wallpaper_brightness: 1.0,
      glass_transparency: 20,
      editor_color: '#0f081a',
      editor_text_color: '#e2e8f0',
      listing_color: '#1e1631',
      button_color: '#6c5ce7',
      server_action_bg: '#0a0a0a',
      power_start_bg: '#40c057',
      power_restart_bg: '#868e96',
      power_stop_bg: '#fa5252',
      sidebar_active_color: '#6c5ce7',
      sidebar_active_bg: 'rgba(255, 255, 255, 0.05)',
      sidebar_item_height: 36,
      terminal_cursor_color: '#7aa2f7',
      terminal_selection_color: 'rgba(255, 255, 255, 0.15)',
      terminal_ansi_black: '#15161e',
      terminal_ansi_red: '#f7768e',
      terminal_ansi_green: '#9ece6a',
      terminal_ansi_yellow: '#e0af68',
      terminal_ansi_blue: '#7aa2f7',
      terminal_ansi_magenta: '#bb9af7',
      terminal_ansi_cyan: '#7dcfff',
      terminal_ansi_white: '#a9b1d6',
      egg_banners: {},
      chart_series_1_border: '#22d3ee',
      chart_series_1_fill: 'rgba(14, 116, 144, 0.5)',
      chart_series_2_border: '#facc15',
      chart_series_2_fill: 'rgba(161, 98, 7, 0.5)',

      // Light Mode Defaults
      light_background_color: '#f3effa',
      light_text_color: '#1e1631',
      light_focus_color: '#8542f0',
      light_shadow_opacity: 0.08,
      light_dark_7_color: '#ffffff',
      light_dark_6_color: '#ebebeb',
      light_sidebar_color: '#ffffff',
      light_card_color: '#ffffff',
      light_border_color: 'rgba(108, 92, 231, 0.15)',
      light_navbar_color: '#ffffff',
      light_terminal_color: '#f1f2f6',
      light_terminal_text_color: '#2f3542',
      light_input_color: '#f1f2f6',
      light_background_image: '',
      light_editor_color: '#ffffff',
      light_editor_text_color: '#2f3542',
      light_listing_color: '#ffffff',
      light_button_color: '#6c5ce7',
      light_server_action_bg: '#f1f2f6',
      light_power_start_bg: '#2ed573',
      light_power_restart_bg: '#747d8c',
      light_power_stop_bg: '#ff4757',
      light_sidebar_active_color: '#6c5ce7',
      light_sidebar_active_bg: 'rgba(108, 92, 231, 0.1)',
      light_terminal_cursor_color: '#6c5ce7',
      light_terminal_selection_color: 'rgba(108, 92, 231, 0.3)',
      light_terminal_ansi_black: '#d5d6db',
      light_terminal_ansi_red: '#f7768e',
      light_terminal_ansi_green: '#485e30',
      light_terminal_ansi_yellow: '#8f5e15',
      light_terminal_ansi_blue: '#34548a',
      light_terminal_ansi_magenta: '#5a4a78',
      light_terminal_ansi_cyan: '#0f4b6e',
      light_terminal_ansi_white: '#343b58',
      light_chart_series_1_border: '#0891b2',
      light_chart_series_1_fill: 'rgba(8, 145, 178, 0.15)',
      light_chart_series_2_border: '#d97706',
      light_chart_series_2_fill: 'rgba(217, 119, 6, 0.15)',

      // Announcement Styles Defaults
      announcement_bg: 'rgba(108, 92, 231, 0.15)',
      light_announcement_bg: 'rgba(108, 92, 231, 0.1)',
      announcement_blur: 10,
      announcement_border_color: '#6c5ce7',
      light_announcement_border_color: '#6c5ce7',
      announcement_radius: 12,
      announcement_cta: true,
      announcement_cta_bg: '#6c5ce7',
      light_announcement_cta_bg: '#6c5ce7',
      announcement_cta_color: '#ffffff',
      light_announcement_cta_color: '#ffffff',
      announcement_cta_radius: 8,
      announcement_cta_link: '',
      announcement_cta_text: 'Go to link...',
      toast_style: 'qunix',
      toast_timer: true,
      toast_radius: 8,
      toast_colored_border: true,
      toast_background_tint: true,
      listing_radius: 12,
      checkbox_radius: 4,
      sidebar_hover_style: 'style-1',
      sidebar_width: 256,
      sidebar_radius: 6,
      sidebar_active_radius: 6,
      page_title_icon: true,
    };

    const defaultSettings = { ...rawDefaultSettings };
    for (const k in defaultSettings) {
      if (typeof (defaultSettings as any)[k] === 'string') {
        (defaultSettings as any)[k] = hslToHex((defaultSettings as any)[k]);
      }
    }

    form.setValues(defaultSettings);
    setLoading(true);
    axiosInstance
      .put('/api/admin/extensions/dev.qunix.theme/settings', defaultSettings)
      .then((res) => {
        addToast('Theme settings reset to default. Refresh the page to apply.', 'success');
      })
      .catch((err) => {
        addToast(httpErrorToHuman(err), 'error');
      })
      .finally(() => setLoading(false));
  };

  const handleImportFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        // Merge with current values to ensure compatibility if any fields are omitted
        const merged = { ...form.values, ...parsed };

        const result = qunixThemeSettingsSchema.safeParse(merged);
        if (!result.success) {
          const firstErr = result.error.issues[0];
          addToast(`Import validation failed: ${firstErr.path.join('.') || 'root'} - ${firstErr.message}`, 'error');
          return;
        }

        form.setValues(result.data);
        addToast('Theme configuration loaded successfully. Click "Save Settings" to persist.', 'success');
      } catch (err) {
        console.error(err);
        addToast('Failed to parse theme configuration file. Ensure it is a valid JSON file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleExportFile = () => {
    try {
      const configData = JSON.stringify(form.values, null, 2);
      const blob = new Blob([configData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qunix-theme-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast('Theme configuration exported successfully.', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to export theme configuration.', 'error');
    }
  };

  return (
    <TitleCard title='Qunix Theme Settings' icon={<FontAwesomeIcon icon={faPalette} size='sm' />}>
      <form onSubmit={form.onSubmit(doSave)}>
        <Tabs defaultValue='global' variant='outline' classNames={{ panel: 'pt-4' }}>
          <Tabs.List>
            <Tabs.Tab value='global'>Global</Tabs.Tab>
            <Tabs.Tab value='menu'>Menu & Sidebar</Tabs.Tab>
            <Tabs.Tab value='card'>Cards & Inputs</Tabs.Tab>
            <Tabs.Tab value='lists'>Lists & Tables</Tabs.Tab>
            <Tabs.Tab value='terminal'>Terminal</Tabs.Tab>
            <Tabs.Tab value='editor'>Code Editor</Tabs.Tab>
            <Tabs.Tab value='banners'>Egg Banners</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value='global'>
            <Stack gap='md'>
              <Tabs variant='pills' defaultValue='dark' classNames={{ panel: 'pt-3' }}>
                <Tabs.List>
                  <Tabs.Tab value='dark'>Dark Theme Colors</Tabs.Tab>
                  <Tabs.Tab value='light'>Light Theme Colors</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value='dark'>
                  <Stack gap='md' mt='xs'>
                    <Group grow>
                      <ColorField
                        label='Background Color'
                        description='The main background color of the panel.'
                        {...form.getInputProps('background_color')}
                      />
                      <ColorField
                        label='Text Color'
                        description='The primary text color.'
                        {...form.getInputProps('text_color')}
                      />
                    </Group>
                    <Group grow>
                      <ColorField
                        label='Focus Color'
                        description='Color used for focus rings and active elements.'
                        {...form.getInputProps('focus_color')}
                      />
                      <ColorField
                        label='Card Background (Mantine dark 6)'
                        description='Overlay/card background color for dropdowns, active inputs, and lists.'
                        {...form.getInputProps('dark_6_color')}
                      />
                      <ColorField
                        label='Overlay Background (Mantine dark 7)'
                        description='Base dark background color for popups, modals, dropdowns, and select components.'
                        {...form.getInputProps('dark_7_color')}
                      />
                    </Group>
                    <Group grow>
                      <NumberInput
                        label='Shadow Opacity'
                        description='Opacity of the shadow-borders (0.0 to 1.0).'
                        min={0}
                        max={1}
                        step={0.01}
                        decimalScale={3}
                        {...form.getInputProps('shadow_opacity')}
                      />
                    </Group>

                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        display: 'block',
                        color: '#a29bfe',
                        marginTop: '6px',
                      }}
                    >
                      <FontAwesomeIcon icon={faBullhorn} style={{ marginRight: '6px' }} />
                      Announcement Styles
                    </span>
                    <Group grow>
                      <ColorField
                        label='Announcement BG'
                        description='Color used for the background of announcements.'
                        {...form.getInputProps('announcement_bg')}
                      />
                      <ColorField
                        label='Announcement Focus Accent Color'
                        description='Focus accent color on the left edge of announcements.'
                        {...form.getInputProps('announcement_border_color')}
                      />
                      <NumberInput
                        label='Announcement Blur (px)'
                        description='The backdrop-filter blur radius for announcement alerts.'
                        min={0}
                        max={100}
                        {...form.getInputProps('announcement_blur')}
                      />
                      <NumberInput
                        label='Announcement Radius (px)'
                        description='Border radius of the announcement alerts.'
                        min={0}
                        max={100}
                        {...form.getInputProps('announcement_radius')}
                      />
                    </Group>

                    <Group grow>
                      <Switch
                        label='Enable CTA Button'
                        description='Toggle the visibility of Call-To-Action buttons in announcements.'
                        checked={form.values.announcement_cta}
                        onChange={(event) => form.setFieldValue('announcement_cta', event.currentTarget.checked)}
                      />
                    </Group>

                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        display: 'block',
                        color: '#a29bfe',
                        marginTop: '6px',
                      }}
                    >
                      <FontAwesomeIcon icon={faBell} style={{ marginRight: '6px' }} />
                      Flash Message / Toast Styles
                    </span>
                    <Group grow>
                      <Select
                        label='Toast Style'
                        description='Select the style pattern for system notifications.'
                        data={[
                          { value: 'qunix', label: 'System Qunix Theme' },
                          { value: 'blur', label: 'Blur (Glassmorphism)' },
                        ]}
                        {...form.getInputProps('toast_style')}
                      />
                      <Switch
                        label='Enable Toast Timer'
                        description='Display an animated progress countdown timer bar at the bottom of toasts.'
                        checked={form.values.toast_timer}
                        onChange={(event) => form.setFieldValue('toast_timer', event.currentTarget.checked)}
                        style={{ marginTop: '24px' }}
                      />
                    </Group>
                    <Group grow>
                      <NumberInput
                        label='Toast Radius (px)'
                        description='Border radius of the toast notifications.'
                        min={0}
                        max={100}
                        {...form.getInputProps('toast_radius')}
                      />
                      <Switch
                        label='Colored Border'
                        description='Colors the entire outline border of the toast with status color.'
                        checked={form.values.toast_colored_border}
                        onChange={(event) => form.setFieldValue('toast_colored_border', event.currentTarget.checked)}
                        style={{ marginTop: '24px' }}
                      />
                      <Switch
                        label='Background Tint'
                        description='Adds a subtle background tint of status color to the toast.'
                        checked={form.values.toast_background_tint}
                        onChange={(event) => form.setFieldValue('toast_background_tint', event.currentTarget.checked)}
                        style={{ marginTop: '24px' }}
                      />
                    </Group>

                    <Group grow>
                      <ColorField
                        label='Announcement CTA Button BG'
                        description='Background color for CTA buttons in announcements.'
                        {...form.getInputProps('announcement_cta_bg')}
                      />
                      <ColorField
                        label='Announcement CTA Button Text'
                        description='Text color for CTA buttons in announcements.'
                        {...form.getInputProps('announcement_cta_color')}
                      />
                      <NumberInput
                        label='Announcement CTA Button Radius (px)'
                        description='Border radius of CTA buttons in announcements.'
                        min={0}
                        max={100}
                        {...form.getInputProps('announcement_cta_radius')}
                      />
                    </Group>
                    <Group grow>
                      <TextInput
                        label='CTA Button Link URL (Empty to hide)'
                        description='The target destination URL for the announcement CTA button.'
                        placeholder='https://discord.gg/...'
                        {...form.getInputProps('announcement_cta_link')}
                      />
                      <TextInput
                        label='CTA Button Text'
                        description='The label text displayed on the CTA button.'
                        placeholder='Go to link...'
                        {...form.getInputProps('announcement_cta_text')}
                      />
                    </Group>
                    <Group grow>
                      <ColorField
                        label='Border Color'
                        description='The color of borders throughout the panel.'
                        {...form.getInputProps('border_color')}
                      />
                      <TextInput
                        label='Background Image URL'
                        description='URL for a custom background image. This will be applied globally.'
                        placeholder='https://example.com/background.jpg'
                        {...form.getInputProps('background_image')}
                      />
                    </Group>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value='light'>
                  <Stack gap='md' mt='xs'>
                    <Group grow>
                      <ColorField
                        label='Background Color (Light)'
                        description='The main background color of the panel in light mode.'
                        {...form.getInputProps('light_background_color')}
                      />
                      <ColorField
                        label='Text Color (Light)'
                        description='The primary text color in light mode.'
                        {...form.getInputProps('light_text_color')}
                      />
                    </Group>
                    <Group grow>
                      <ColorField
                        label='Focus Color (Light)'
                        description='Color used for focus rings and active elements in light mode.'
                        {...form.getInputProps('light_focus_color')}
                      />
                      <ColorField
                        label='Card Background (Light)'
                        description='Overlay/card background color in light mode.'
                        {...form.getInputProps('light_dark_6_color')}
                      />
                      <ColorField
                        label='Overlay Background (Light)'
                        description='Base overlay background color in light mode.'
                        {...form.getInputProps('light_dark_7_color')}
                      />
                      <NumberInput
                        label='Shadow Opacity (Light)'
                        description='Opacity of the shadow-borders in light mode (0.0 to 1.0).'
                        min={0}
                        max={1}
                        step={0.01}
                        decimalScale={3}
                        {...form.getInputProps('light_shadow_opacity')}
                      />
                    </Group>

                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        display: 'block',
                        color: '#a29bfe',
                        marginTop: '6px',
                      }}
                    >
                      <FontAwesomeIcon icon={faBullhorn} style={{ marginRight: '6px' }} />
                      Announcement Styles (Light)
                    </span>
                    <Group grow>
                      <ColorField
                        label='Announcement BG (Light)'
                        description='Color used for the background of announcements in light mode.'
                        {...form.getInputProps('light_announcement_bg')}
                      />
                      <ColorField
                        label='Announcement Focus Accent Color (Light)'
                        description='Focus accent color on the left edge of announcements in light mode.'
                        {...form.getInputProps('light_announcement_border_color')}
                      />
                      <NumberInput
                        label='Announcement Blur (px)'
                        description='The backdrop-filter blur radius for announcement alerts.'
                        min={0}
                        max={100}
                        {...form.getInputProps('announcement_blur')}
                      />
                      <NumberInput
                        label='Announcement Radius (px)'
                        description='Border radius of the announcement alerts.'
                        min={0}
                        max={100}
                        {...form.getInputProps('announcement_radius')}
                      />
                    </Group>

                    <Group grow>
                      <ColorField
                        label='Announcement CTA Button BG (Light)'
                        description='Background color for CTA buttons in announcements in light mode.'
                        {...form.getInputProps('light_announcement_cta_bg')}
                      />
                      <ColorField
                        label='Announcement CTA Button Text (Light)'
                        description='Text color for CTA buttons in announcements in light mode.'
                        {...form.getInputProps('light_announcement_cta_color')}
                      />
                      <NumberInput
                        label='Announcement CTA Button Radius (px)'
                        description='Border radius of CTA buttons in announcements.'
                        min={0}
                        max={100}
                        {...form.getInputProps('announcement_cta_radius')}
                      />
                    </Group>
                    <Group grow>
                      <ColorField
                        label='Border Color (Light)'
                        description='The color of borders throughout the panel in light mode.'
                        {...form.getInputProps('light_border_color')}
                      />
                      <TextInput
                        label='Background Image URL (Light)'
                        description='URL for a custom background image in light mode.'
                        placeholder='https://example.com/background.jpg'
                        {...form.getInputProps('light_background_image')}
                      />
                    </Group>
                  </Stack>
                </Tabs.Panel>
              </Tabs>

              <div style={{ borderTop: '1px solid var(--ds-border-color)', paddingTop: '16px', marginTop: '8px' }}>
                <h4
                  style={{
                    fontSize: '13px',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    color: 'var(--ds-primary-color)',
                  }}
                >
                  <FontAwesomeIcon icon={faSliders} style={{ marginRight: '6px' }} />
                  Layout Settings (Universal)
                </h4>
                <Group grow>
                  <TextInput
                    label='Custom Font Family'
                    description='Google Font to load & apply (default: JetBrains Mono).'
                    placeholder='JetBrains Mono'
                    {...form.getInputProps('font_family')}
                  />
                  <NumberInput
                    label='Wallpaper Blur'
                    description='Background image blur intensity (0-50px).'
                    min={0}
                    max={50}
                    {...form.getInputProps('wallpaper_blur')}
                  />
                  <NumberInput
                    label='Wallpaper Brightness'
                    description='Blend background image with theme color (0.0 to 1.0).'
                    min={0}
                    max={1}
                    step={0.1}
                    decimalScale={1}
                    {...form.getInputProps('wallpaper_brightness')}
                  />
                  <NumberInput
                    label='Glass Transparency'
                    description='Card/list transparency when using background image (0-100%).'
                    min={0}
                    max={100}
                    {...form.getInputProps('glass_transparency')}
                  />
                </Group>
              </div>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='menu'>
            <Stack gap='md'>
              <Tabs variant='pills' defaultValue='dark' classNames={{ panel: 'pt-3' }}>
                <Tabs.List>
                  <Tabs.Tab value='dark'>Dark Theme Colors</Tabs.Tab>
                  <Tabs.Tab value='light'>Light Theme Colors</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value='dark'>
                  <Stack gap='md' mt='xs'>
                    <Group grow>
                      <ColorField
                        label='Menu / Navbar Color'
                        description='The background color of the top navigation bar and dropdown menus.'
                        {...form.getInputProps('navbar_color')}
                      />
                      <ColorField
                        label='Sidebar (Mobile) Color'
                        description='The background color of the sidebar.'
                        {...form.getInputProps('sidebar_color')}
                      />
                    </Group>
                    <Group grow>
                      <ColorField
                        label='Sidebar Active Tab Text/Icon Color'
                        description='Text and icon color of the active sidebar tab.'
                        {...form.getInputProps('sidebar_active_color')}
                      />
                      <ColorField
                        label='Sidebar Active Tab Background'
                        description='Background color of the active sidebar tab.'
                        {...form.getInputProps('sidebar_active_bg')}
                      />
                    </Group>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value='light'>
                  <Stack gap='md' mt='xs'>
                    <Group grow>
                      <ColorField
                        label='Menu / Navbar Color (Light)'
                        description='The background color of the top navigation bar in light mode.'
                        {...form.getInputProps('light_navbar_color')}
                      />
                      <ColorField
                        label='Sidebar Color (Light)'
                        description='The background color of the sidebar in light mode.'
                        {...form.getInputProps('light_sidebar_color')}
                      />
                    </Group>
                    <Group grow>
                      <ColorField
                        label='Sidebar Active Tab Text/Icon Color (Light)'
                        description='Text and icon color of the active sidebar tab in light mode.'
                        {...form.getInputProps('light_sidebar_active_color')}
                      />
                      <ColorField
                        label='Sidebar Active Tab Background (Light)'
                        description='Background color of the active sidebar tab in light mode.'
                        {...form.getInputProps('light_sidebar_active_bg')}
                      />
                    </Group>
                  </Stack>
                </Tabs.Panel>
              </Tabs>

              <div style={{ borderTop: '1px solid var(--ds-border-color)', paddingTop: '16px', marginTop: '8px' }}>
                <h4
                  style={{
                    fontSize: '13px',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    color: 'var(--ds-primary-color)',
                  }}
                >
                  <FontAwesomeIcon icon={faMagic} style={{ marginRight: '6px' }} />
                  Sidebar Hover Animation Style
                </h4>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '12px',
                    marginBottom: '16px',
                  }}
                >
                  {HOVER_STYLES.map((style) => {
                    const isSelected = form.values.sidebar_hover_style === style.value;
                    return (
                      <div
                        key={style.value}
                        onClick={() => form.setFieldValue('sidebar_hover_style', style.value)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: isSelected ? '2px solid var(--ds-primary-color)' : '1px solid var(--ds-border-color)',
                          borderRadius: '10px',
                          padding: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? '0 0 12px rgba(108, 92, 231, 0.2)' : 'none',
                        }}
                      >
                        {style.svg}
                        <div style={{ textAlign: 'center' }}>
                          <div
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color: isSelected ? 'var(--ds-primary-color)' : '#e2e8f0',
                            }}
                          >
                            {style.label}
                          </div>
                          <div style={{ fontSize: '9px', color: '#71717a', marginTop: '2px', lineHeight: '1.3' }}>
                            {style.description}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--ds-border-color)', paddingTop: '16px', marginTop: '8px' }}>
                <h4
                  style={{
                    fontSize: '13px',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    color: 'var(--ds-primary-color)',
                  }}
                >
                  <FontAwesomeIcon icon={faRuler} style={{ marginRight: '6px' }} />
                  Layout Settings (Universal)
                </h4>
                <Group grow>
                  <NumberInput
                    style={{ display: 'none' }}
                    label='Navbar Height'
                    description='The height of the top navigation bar (in px).'
                    min={32}
                    max={200}
                    {...form.getInputProps('navbar_height')}
                  />
                  <NumberInput
                    label='Sidebar Item Gap'
                    description='Spacing between elements in the sidebar (in px).'
                    min={0}
                    max={100}
                    {...form.getInputProps('sidebar_item_gap')}
                  />
                  <NumberInput
                    label='Sidebar Link Height'
                    description='The height of sidebar link buttons (in px).'
                    min={20}
                    max={100}
                    {...form.getInputProps('sidebar_item_height')}
                  />
                  <NumberInput
                    label='Sidebar / Menu Blur'
                    description='Glassmorphism blur intensity (0-50px).'
                    min={0}
                    max={50}
                    {...form.getInputProps('sidebar_blur')}
                  />
                </Group>
                <Group grow mt='xs'>
                  <NumberInput
                    label='Sidebar Width'
                    description='Width of the sidebar in pixels (150-400px).'
                    min={150}
                    max={400}
                    {...form.getInputProps('sidebar_width')}
                  />
                  <NumberInput
                    label='Sidebar Item Radius'
                    description='Corner radius of sidebar items (0-50px).'
                    min={0}
                    max={50}
                    {...form.getInputProps('sidebar_radius')}
                  />
                  <NumberInput
                    label='Active Item Radius'
                    description='Corner radius of active sidebar items (0-50px).'
                    min={0}
                    max={50}
                    {...form.getInputProps('sidebar_active_radius')}
                  />
                </Group>
                <Switch
                  label='Page Title Icons'
                  description='Show corresponding icons next to page titles.'
                  mt='md'
                  checked={form.values.page_title_icon}
                  onChange={(event) => form.setFieldValue('page_title_icon', event.currentTarget.checked)}
                />
              </div>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='card'>
            <Stack gap='md'>
              <Tabs variant='pills' defaultValue='dark' classNames={{ panel: 'pt-3' }}>
                <Tabs.List>
                  <Tabs.Tab value='dark'>Dark Theme Colors</Tabs.Tab>
                  <Tabs.Tab value='light'>Light Theme Colors</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value='dark'>
                  <Stack gap='md' mt='xs'>
                    <Group grow>
                      <ColorField
                        label='Card Color'
                        description='The background color of cards and segments.'
                        {...form.getInputProps('card_color')}
                      />
                      <ColorField
                        label='Input Background'
                        description='The background color for text inputs.'
                        {...form.getInputProps('input_color')}
                      />
                    </Group>
                    <Group grow>
                      <ColorField
                        label='Button Color'
                        description='The primary color for buttons.'
                        {...form.getInputProps('button_color')}
                      />
                      <ColorField
                        label='Server Action Background Color'
                        description='Default background color for the server action container when no egg banner is configured.'
                        {...form.getInputProps('server_action_bg')}
                      />
                    </Group>
                    <Group grow>
                      <ColorField
                        label='Console Start Button Color'
                        description='Background color for the Start button in the server console.'
                        {...form.getInputProps('power_start_bg')}
                      />
                      <ColorField
                        label='Console Restart Button Color'
                        description='Background color for the Restart button in the server console.'
                        {...form.getInputProps('power_restart_bg')}
                      />
                      <ColorField
                        label='Console Stop Button Color'
                        description='Background color for the Stop/Kill button in the server console.'
                        {...form.getInputProps('power_stop_bg')}
                      />
                    </Group>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value='light'>
                  <Stack gap='md' mt='xs'>
                    <Group grow>
                      <ColorField
                        label='Card Color (Light)'
                        description='The background color of cards in light mode.'
                        {...form.getInputProps('light_card_color')}
                      />
                      <ColorField
                        label='Input Background (Light)'
                        description='The background color for text inputs in light mode.'
                        {...form.getInputProps('light_input_color')}
                      />
                    </Group>
                    <Group grow>
                      <ColorField
                        label='Button Color (Light)'
                        description='The primary color for buttons in light mode.'
                        {...form.getInputProps('light_button_color')}
                      />
                      <ColorField
                        label='Server Action Background Color (Light)'
                        description='Default background color for the server action container in light mode.'
                        {...form.getInputProps('light_server_action_bg')}
                      />
                    </Group>
                    <Group grow>
                      <ColorField
                        label='Console Start Button Color (Light)'
                        description='Background color for the Start button in light mode.'
                        {...form.getInputProps('light_power_start_bg')}
                      />
                      <ColorField
                        label='Console Restart Button Color (Light)'
                        description='Background color for the Restart button in light mode.'
                        {...form.getInputProps('light_power_restart_bg')}
                      />
                      <ColorField
                        label='Console Stop Button Color (Light)'
                        description='Background color for the Stop/Kill button in light mode.'
                        {...form.getInputProps('light_power_stop_bg')}
                      />
                    </Group>
                  </Stack>
                </Tabs.Panel>
              </Tabs>

              <div style={{ borderTop: '1px solid var(--ds-border-color)', paddingTop: '16px', marginTop: '8px' }}>
                <h4
                  style={{
                    fontSize: '13px',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    color: 'var(--ds-primary-color)',
                  }}
                >
                  <FontAwesomeIcon icon={faSquare} style={{ marginRight: '6px' }} />
                  Layout Settings (Universal)
                </h4>
                <Group grow>
                  <NumberInput
                    label='Card Radius'
                    description='Corner radius for cards (in px).'
                    min={0}
                    max={100}
                    {...form.getInputProps('card_radius')}
                  />
                  <NumberInput
                    label='Input Radius'
                    description='Corner radius for text inputs (in px).'
                    min={0}
                    max={100}
                    {...form.getInputProps('input_radius')}
                  />
                  <NumberInput
                    label='Button Radius'
                    description='Corner radius for buttons (in px).'
                    min={0}
                    max={100}
                    {...form.getInputProps('button_radius')}
                  />
                </Group>
              </div>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='lists'>
            <Stack gap='md'>
              <Tabs variant='pills' defaultValue='dark' classNames={{ panel: 'pt-3' }}>
                <Tabs.List>
                  <Tabs.Tab value='dark'>Dark Theme Colors</Tabs.Tab>
                  <Tabs.Tab value='light'>Light Theme Colors</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value='dark'>
                  <Stack gap='md' mt='xs'>
                    <Group grow>
                      <ColorField
                        label='Listing Color'
                        description='The background color for lists and tables (Nodes, Users, Files, etc.).'
                        {...form.getInputProps('listing_color')}
                      />
                    </Group>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value='light'>
                  <Stack gap='md' mt='xs'>
                    <Group grow>
                      <ColorField
                        label='Listing Color (Light)'
                        description='The background color for lists and tables in light mode.'
                        {...form.getInputProps('light_listing_color')}
                      />
                    </Group>
                  </Stack>
                </Tabs.Panel>
              </Tabs>

              <div style={{ borderTop: '1px solid var(--ds-border-color)', paddingTop: '16px', marginTop: '8px' }}>
                <h4
                  style={{
                    fontSize: '13px',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    color: 'var(--ds-primary-color)',
                  }}
                >
                  <FontAwesomeIcon icon={faSquare} style={{ marginRight: '6px' }} />
                  Layout Settings (Universal)
                </h4>
                <Group grow>
                  <NumberInput
                    label='Listing Radius'
                    description='Corner radius for listings/tables (in px).'
                    min={0}
                    max={100}
                    {...form.getInputProps('listing_radius')}
                  />
                  <NumberInput
                    label='Checkbox/Tick Radius'
                    description='Corner radius for checkboxes (in px).'
                    min={0}
                    max={100}
                    {...form.getInputProps('checkbox_radius')}
                  />
                </Group>
              </div>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='terminal'>
            <Stack gap='md'>
              <Tabs variant='pills' defaultValue='dark' classNames={{ panel: 'pt-3' }}>
                <Tabs.List>
                  <Tabs.Tab value='dark'>Dark Theme Colors</Tabs.Tab>
                  <Tabs.Tab value='light'>Light Theme Colors</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value='dark'>
                  <Stack gap='md' mt='xs'>
                    <Group grow>
                      <ColorField
                        label='Terminal Background'
                        description='The background color for terminals.'
                        {...form.getInputProps('terminal_color')}
                      />
                      <ColorField
                        label='Terminal Text'
                        description='The text color for terminals.'
                        {...form.getInputProps('terminal_text_color')}
                      />
                    </Group>
                    <Group grow style={{ display: 'none' }}>
                      <ColorField
                        label='Terminal Cursor Color'
                        description='The color of the terminal cursor.'
                        {...form.getInputProps('terminal_cursor_color')}
                      />
                      <ColorField
                        label='Terminal Selection Background'
                        description='Background color for selected text in terminals.'
                        {...form.getInputProps('terminal_selection_color')}
                      />
                    </Group>
                    <Group grow style={{ display: 'none' }}>
                      <ColorField
                        label='Terminal Black'
                        description='ANSI Color: Black'
                        {...form.getInputProps('terminal_ansi_black')}
                      />
                      <ColorField
                        label='Terminal Red'
                        description='ANSI Color: Red'
                        {...form.getInputProps('terminal_ansi_red')}
                      />
                      <ColorField
                        label='Terminal Green'
                        description='ANSI Color: Green'
                        {...form.getInputProps('terminal_ansi_green')}
                      />
                      <ColorField
                        label='Terminal Yellow'
                        description='ANSI Color: Yellow'
                        {...form.getInputProps('terminal_ansi_yellow')}
                      />
                    </Group>
                    <Group grow style={{ display: 'none' }}>
                      <ColorField
                        label='Terminal Blue'
                        description='ANSI Color: Blue'
                        {...form.getInputProps('terminal_ansi_blue')}
                      />
                      <ColorField
                        label='Terminal Magenta'
                        description='ANSI Color: Magenta'
                        {...form.getInputProps('terminal_ansi_magenta')}
                      />
                      <ColorField
                        label='Terminal Cyan'
                        description='ANSI Color: Cyan'
                        {...form.getInputProps('terminal_ansi_cyan')}
                      />
                      <ColorField
                        label='Terminal White'
                        description='ANSI Color: White'
                        {...form.getInputProps('terminal_ansi_white')}
                      />
                    </Group>
                    <div
                      style={{ borderTop: '1px solid var(--ds-border-color)', paddingTop: '16px', marginTop: '8px' }}
                    >
                      <h4
                        style={{
                          fontSize: '13px',
                          fontWeight: 'bold',
                          marginBottom: '12px',
                          color: 'var(--ds-primary-color)',
                        }}
                      >
                        <FontAwesomeIcon icon={faChartLine} style={{ marginRight: '6px' }} />
                        Console Charts
                      </h4>
                      <Group grow>
                        <ColorField
                          label='Chart Series 1 Border'
                          description='Border color of first data series in charts (e.g. CPU Load).'
                          {...form.getInputProps('chart_series_1_border')}
                        />
                        <ColorField
                          label='Chart Series 1 Fill'
                          description='Fill color of first data series in charts.'
                          {...form.getInputProps('chart_series_1_fill')}
                        />
                      </Group>
                      <Group grow mt='sm'>
                        <ColorField
                          label='Chart Series 2 Border'
                          description='Border color of second data series in charts (e.g. Network outbound).'
                          {...form.getInputProps('chart_series_2_border')}
                        />
                        <ColorField
                          label='Chart Series 2 Fill'
                          description='Fill color of second data series in charts.'
                          {...form.getInputProps('chart_series_2_fill')}
                        />
                      </Group>
                    </div>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value='light'>
                  <Stack gap='md' mt='xs'>
                    <Group grow>
                      <ColorField
                        label='Terminal Background (Light)'
                        description='The background color for terminals in light mode.'
                        {...form.getInputProps('light_terminal_color')}
                      />
                      <ColorField
                        label='Terminal Text (Light)'
                        description='The text color for terminals in light mode.'
                        {...form.getInputProps('light_terminal_text_color')}
                      />
                    </Group>
                    <Group grow style={{ display: 'none' }}>
                      <ColorField
                        label='Terminal Cursor Color (Light)'
                        description='The color of the terminal cursor in light mode.'
                        {...form.getInputProps('light_terminal_cursor_color')}
                      />
                      <ColorField
                        label='Terminal Selection Background (Light)'
                        description='Background color for selected text in light mode.'
                        {...form.getInputProps('light_terminal_selection_color')}
                      />
                    </Group>
                    <Group grow style={{ display: 'none' }}>
                      <ColorField
                        label='Terminal Black (Light)'
                        description='ANSI Color: Black in light mode.'
                        {...form.getInputProps('light_terminal_ansi_black')}
                      />
                      <ColorField
                        label='Terminal Red (Light)'
                        description='ANSI Color: Red in light mode.'
                        {...form.getInputProps('light_terminal_ansi_red')}
                      />
                      <ColorField
                        label='Terminal Green (Light)'
                        description='ANSI Color: Green in light mode.'
                        {...form.getInputProps('light_terminal_ansi_green')}
                      />
                      <ColorField
                        label='Terminal Yellow (Light)'
                        description='ANSI Color: Yellow in light mode.'
                        {...form.getInputProps('light_terminal_ansi_yellow')}
                      />
                    </Group>
                    <Group grow style={{ display: 'none' }}>
                      <ColorField
                        label='Terminal Blue (Light)'
                        description='ANSI Color: Blue in light mode.'
                        {...form.getInputProps('light_terminal_ansi_blue')}
                      />
                      <ColorField
                        label='Terminal Magenta (Light)'
                        description='ANSI Color: Magenta in light mode.'
                        {...form.getInputProps('light_terminal_ansi_magenta')}
                      />
                      <ColorField
                        label='Terminal Cyan (Light)'
                        description='ANSI Color: Cyan in light mode.'
                        {...form.getInputProps('light_terminal_ansi_cyan')}
                      />
                      <ColorField
                        label='Terminal White (Light)'
                        description='ANSI Color: White in light mode.'
                        {...form.getInputProps('light_terminal_ansi_white')}
                      />
                    </Group>
                    <div
                      style={{ borderTop: '1px solid var(--ds-border-color)', paddingTop: '16px', marginTop: '8px' }}
                    >
                      <h4
                        style={{
                          fontSize: '13px',
                          fontWeight: 'bold',
                          marginBottom: '12px',
                          color: 'var(--ds-primary-color)',
                        }}
                      >
                        <FontAwesomeIcon icon={faChartLine} style={{ marginRight: '6px' }} />
                        Console Charts (Light)
                      </h4>
                      <Group grow>
                        <ColorField
                          label='Chart Series 1 Border (Light)'
                          description='Border color of first data series in light mode.'
                          {...form.getInputProps('light_chart_series_1_border')}
                        />
                        <ColorField
                          label='Chart Series 1 Fill (Light)'
                          description='Fill color of first data series in light mode.'
                          {...form.getInputProps('light_chart_series_1_fill')}
                        />
                      </Group>
                      <Group grow mt='sm'>
                        <ColorField
                          label='Chart Series 2 Border (Light)'
                          description='Border color of second data series in light mode.'
                          {...form.getInputProps('light_chart_series_2_border')}
                        />
                        <ColorField
                          label='Chart Series 2 Fill (Light)'
                          description='Fill color of second data series in light mode.'
                          {...form.getInputProps('light_chart_series_2_fill')}
                        />
                      </Group>
                    </div>
                  </Stack>
                </Tabs.Panel>
              </Tabs>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='editor'>
            <Stack gap='md'>
              <Tabs variant='pills' defaultValue='dark' classNames={{ panel: 'pt-3' }}>
                <Tabs.List>
                  <Tabs.Tab value='dark'>Dark Theme Colors</Tabs.Tab>
                  <Tabs.Tab value='light'>Light Theme Colors</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value='dark'>
                  <Stack gap='md' mt='xs'>
                    <Group grow>
                      <ColorField
                        label='Editor Background'
                        description='The background color for code editors (File Manager).'
                        {...form.getInputProps('editor_color')}
                      />
                      <ColorField
                        label='Editor Text'
                        description='The text color for code editors.'
                        {...form.getInputProps('editor_text_color')}
                      />
                    </Group>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value='light'>
                  <Stack gap='md' mt='xs'>
                    <Group grow>
                      <ColorField
                        label='Editor Background (Light)'
                        description='The background color for code editors in light mode.'
                        {...form.getInputProps('light_editor_color')}
                      />
                      <ColorField
                        label='Editor Text (Light)'
                        description='The text color for code editors in light mode.'
                        {...form.getInputProps('light_editor_text_color')}
                      />
                    </Group>
                  </Stack>
                </Tabs.Panel>
              </Tabs>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='banners'>
            <Stack gap='md'>
              {nests.map((n) => (
                <div key={n.nest.uuid}>
                  <h3
                    style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      marginBottom: '8px',
                      color: 'var(--ds-primary-color)',
                    }}
                  >
                    {n.nest.name}
                  </h3>
                  <Stack gap='xs' style={{ paddingLeft: '16px' }}>
                    {n.eggs.map((e: any) => (
                      <TextInput
                        key={e.uuid}
                        label={`${e.name} Banner URL`}
                        placeholder='https://example.com/banner.jpg'
                        value={form.values.egg_banners?.[e.uuid] || ''}
                        onChange={(event) => {
                          const val = event.currentTarget.value;
                          form.setFieldValue('egg_banners', {
                            ...form.values.egg_banners,
                            [e.uuid]: val,
                          });
                        }}
                      />
                    ))}
                  </Stack>
                </div>
              ))}
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Group mt='xl' justify='space-between'>
          <Group>
            <Button type='submit' loading={loading} className='w-fit!'>
              Save Settings
            </Button>
            <Button variant='outline' color='red' onClick={handleReset} loading={loading} className='w-fit!'>
              Reset to Default
            </Button>
          </Group>
          <Group>
            <FileButton onChange={handleImportFile} accept='application/json'>
              {(props) => (
                <Button {...props} variant='light' color='grape' leftSection={<FontAwesomeIcon icon={faUpload} />}>
                  Import Theme
                </Button>
              )}
            </FileButton>
            <Button
              variant='light'
              color='indigo'
              onClick={handleExportFile}
              leftSection={<FontAwesomeIcon icon={faDownload} />}
            >
              Export Theme
            </Button>
          </Group>
        </Group>
      </form>
      {/* Floating Unsaved Changes Warning Banner */}
      {form.isDirty() && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#111214',
            border: '1px solid #1e1f22',
            borderRadius: '12px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '32px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
            zIndex: 10000,
            minWidth: '400px',
            maxWidth: '90%',
            color: '#e2e8f0',
            animation: 'qunix-slide-up 0.2s ease-out',
            boxSizing: 'border-box',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 500, fontFamily: 'system-ui, sans-serif' }}>
            {navigator.language.startsWith('vi')
              ? 'Hãy cẩn thận – bạn chưa lưu các thay đổi!'
              : 'Careful — you have unsaved changes!'}
          </span>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              type='button'
              onClick={() => form.reset()}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#e2e8f0',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: '6px',
                transition: 'all 0.2s',
                fontFamily: 'system-ui, sans-serif',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              {navigator.language.startsWith('vi') ? 'Đặt lại' : 'Reset'}
            </button>
            <Button
              onClick={doSave}
              loading={loading}
              color='green'
              size='xs'
              styles={{
                root: {
                  fontSize: '12px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: '#23a55a',
                  fontFamily: 'system-ui, sans-serif',
                  '&:hover': {
                    backgroundColor: '#1a7f43',
                  },
                },
              }}
            >
              {navigator.language.startsWith('vi') ? 'Lưu Thay Đổi' : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}
    </TitleCard>
  );
}
