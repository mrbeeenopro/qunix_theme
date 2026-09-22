import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyedropper } from '@fortawesome/free-solid-svg-icons';

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

export function inferTargetSelector(label?: React.ReactNode): { selector: string; label: string } | null {
  if (typeof label !== 'string') return null;
  const l = label.toLowerCase();
  if (l.includes('sidebar active') || l.includes('active link')) {
    return { selector: '.qunix-sidebar-active, a.qunix-sidebar-link[data-active="true"], aside a[data-active="true"]', label };
  }
  if (l.includes('sidebar grow') || l.includes('sidebar width')) {
    return { selector: '#sidebar-desktop, aside, .mantine-AppShell-navbar', label };
  }
  if (l.includes('sidebar')) {
    return { selector: '#sidebar-desktop, aside, .mantine-AppShell-navbar, [class*="navbar"]', label };
  }
  if (l.includes('navbar') || l.includes('header') || l.includes('chrome toolbar')) {
    return { selector: 'header, .mantine-AppShell-header, [class*="header"]', label };
  }
  if (l.includes('card') && !l.includes('mini')) {
    return { selector: '.qunix-server-card, .mantine-Card-root, div[class*="Card"]', label };
  }
  if (l.includes('mini card')) {
    return { selector: '.qunix-server-card .mantine-Card-root, .qunix-mini-card', label };
  }
  if (l.includes('button')) {
    return { selector: 'button.mantine-Button-root, .mantine-Button-root, button', label };
  }
  if (l.includes('input')) {
    return { selector: 'input.mantine-Input-input, .mantine-Input-input, input', label };
  }
  if (l.includes('terminal') || l.includes('console')) {
    return { selector: '.xterm, [class*="terminal"], pre, code', label };
  }
  if (l.includes('toast')) {
    return { selector: '.qunix-custom-toast-container, .qunix-theme-toast-container', label };
  }
  if (l.includes('announcement')) {
    return { selector: '.mantine-Alert-root, [role="alert"]', label };
  }
  if (l.includes('power') || l.includes('start') || l.includes('stop') || l.includes('restart') || l.includes('server action')) {
    return { selector: '[data-sidebar-power-actions], .mantine-ActionIcon-root', label };
  }
  if (l.includes('quick action')) {
    return { selector: '[class*="quick-action"], button.mantine-Button-root', label };
  }
  if (l.includes('border') || l.includes('popup')) {
    return { selector: '.qunix-server-card, .mantine-Card-root, aside, header', label };
  }
  if (l.includes('text')) {
    return { selector: '.qunix-server-card, h1, h2, h3, p', label };
  }
  if (l.includes('background') || l.includes('base') || l.includes('wallpaper')) {
    return { selector: 'body, #root', label };
  }
  return null;
}

interface ColorFieldProps {
  value?: string;
  onChange?: (v: string) => void;
  onBlur?: () => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  targetSelector?: string;
  targetLabel?: string;
}

export function ColorField({ value, onChange, onBlur, label, description, error, targetSelector, targetLabel }: ColorFieldProps) {
  const [opened, setOpened] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const colorStr = typeof value === 'string' ? value : '';

  // Notify live preview to highlight the affected UI region
  useEffect(() => {
    if (opened) {
      const resolved = targetSelector
        ? { selector: targetSelector, label: targetLabel || (typeof label === 'string' ? label : 'Selected Element') }
        : inferTargetSelector(label);
      if (resolved) {
        window.dispatchEvent(new CustomEvent('qunix-highlight-target', { detail: resolved }));
      }
    } else {
      window.dispatchEvent(new CustomEvent('qunix-highlight-target', { detail: null }));
    }
  }, [opened, targetSelector, targetLabel, label]);

  useEffect(() => {
    return () => {
      window.dispatchEvent(new CustomEvent('qunix-highlight-target', { detail: null }));
    };
  }, []);

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
            {'EyeDropper' in window && (
              <button
                type='button'
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const eyeDropper = new (window as any).EyeDropper();
                    const result = await eyeDropper.open();
                    if (result?.sRGBHex) {
                      onChange?.(result.sRGBHex);
                    }
                  } catch (err) {
                    // User canceled eyedropper
                  }
                }}
                title='Pick color from screen'
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '6px',
                  color: '#a29bfe',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
              >
                <FontAwesomeIcon icon={faEyedropper} style={{ fontSize: '12px' }} />
              </button>
            )}
          </div>
        </div>
      )}
      {error && <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '2px' }}>{String(error)}</div>}
    </div>
  );
}
