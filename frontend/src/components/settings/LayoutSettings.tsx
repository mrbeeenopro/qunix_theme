import React from 'react';
import { useNavigate } from 'react-router';
import { Stack, Group, TextInput, NumberInput, Divider, Select, Button, Badge, Switch } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { z } from 'zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faImage,
  faRuler,
  faSquare,
  faFont,
  faCogs,
  faTerminal,
  faDownload,
  faCloudDownload,
  faCloud,
  faServer,
  faCheckCircle,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { qunixThemeSettingsSchema } from '../../lib/schemas.ts';
import { useExtTranslations } from '../../translations.ts';
import {
  downloadAndCacheFont,
  getCachedFont,
  deleteCachedFont,
  cleanOtherCachedFonts,
  isBundledFont,
  extractFamilyName,
  CachedFontRecord,
} from '../../lib/fontManager.ts';
import {
  QuickLinkItem,
  parseQuickLinks,
} from '../theme/quickLinksConfig.ts';
import { QuickLinksEditor } from '../theme/QuickLinksEditor.tsx';

const getDashboardLayouts = (accent: string) => [
  {
    value: 'default',
    label: 'Default',
    description: 'Standard full-height sidebar and console layout.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#131123' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
        <rect x='4' y='4' width='16' height='52' rx='2' fill='#161025' />
        <rect x='24' y='4' width='52' height='12' rx='2' fill='#161025' />
        <rect x='24' y='20' width='52' height='36' rx='2' fill='#161025' fillOpacity='0.5' />
      </svg>
    ),
  },
  {
    value: 'floating',
    label: 'Floating',
    description: 'Floating sidebar and card layouts with spacing.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#131123' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
        <rect x='6' y='6' width='14' height='48' rx='4' fill='#161025' stroke={accent} strokeWidth='1' />
        <rect x='24' y='6' width='50' height='48' rx='4' fill='#161025' fillOpacity='0.5' />
      </svg>
    ),
  },
  {
    value: 'pill',
    label: 'Pill',
    description: 'Sidebar items with fully rounded pill shapes.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#131123' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
        <rect x='4' y='4' width='16' height='52' rx='8' fill='#161025' />
        <rect x='24' y='4' width='52' height='52' rx='6' fill='#161025' fillOpacity='0.5' />
      </svg>
    ),
  },
  {
    value: 'slim',
    label: 'Slim',
    description: 'A slim navigation drawer for narrow views.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#131123' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
        <rect x='4' y='4' width='8' height='52' rx='1' fill='#161025' />
        <rect x='16' y='4' width='60' height='52' rx='2' fill='#161025' fillOpacity='0.5' />
      </svg>
    ),
  },
  {
    value: 'horizontal',
    label: 'Horizontal',
    description: 'Horizontal navigation header at the top of the viewport.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#131123' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
        <rect x='4' y='4' width='72' height='10' rx='2' fill='#161025' />
        <rect x='4' y='18' width='72' height='38' rx='2' fill='#161025' fillOpacity='0.5' />
      </svg>
    ),
  },
  {
    value: 'icons',
    label: 'Icons Only',
    description: 'Minimized icon-only sidebar drawer.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#131123' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
        <rect x='4' y='4' width='8' height='52' rx='1' fill='#161025' />
        <rect x='16' y='4' width='60' height='52' rx='2' fill='#161025' fillOpacity='0.5' />
        <rect x='6' y='8' width='4' height='4' rx='1' fill={accent} />
        <rect x='6' y='16' width='4' height='4' rx='1' fill={accent} />
        <rect x='6' y='24' width='4' height='4' rx='1' fill={accent} />
      </svg>
    ),
  },
];

const getConsoleStyles = (accent: string) => [
  {
    value: 'default',
    label: 'Default Banner',
    description: 'Standard banner header.',
    svg: (
      <svg width='100%' height='54' viewBox='0 0 80 54' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='54' rx='5' fill='#131123' stroke='rgba(255,255,255,0.08)' strokeWidth='1' />
        <rect x='4' y='4' width='72' height='10' rx='2' fill='#1f1b2e' stroke='rgba(255,255,255,0.1)' strokeWidth='0.5' />
        <rect x='4' y='16' width='48' height='24' rx='2' fill='#0a0a0e' stroke='rgba(255,255,255,0.06)' strokeWidth='0.5' />
        <rect x='54' y='16' width='22' height='24' rx='2' fill='#161420' stroke='rgba(255,255,255,0.06)' strokeWidth='0.5' />
        <rect x='4' y='42' width='72' height='8' rx='2' fill='#161420' fillOpacity='0.6' />
      </svg>
    ),
  },
  {
    value: 'mini',
    label: 'Mini Banner',
    description: 'Compact header with egg banner wallpaper.',
    svg: (
      <svg width='100%' height='54' viewBox='0 0 80 54' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='54' rx='5' fill='#131123' stroke='rgba(255,255,255,0.08)' strokeWidth='1' />
        <rect x='4' y='4' width='72' height='12' rx='3' fill={`color-mix(in srgb, ${accent} 25%, transparent)`} stroke={accent} strokeWidth='0.8' />
        <rect x='4' y='18' width='48' height='32' rx='2' fill='#0a0a0e' stroke='rgba(255,255,255,0.06)' strokeWidth='0.5' />
        <rect x='54' y='18' width='22' height='32' rx='2' fill='#161420' stroke='rgba(255,255,255,0.06)' strokeWidth='0.5' />
      </svg>
    ),
  },
  {
    value: 'compact',
    label: 'Compact Sidebar',
    description: 'Side-by-side terminal with resource sparklines.',
    svg: (
      <svg width='100%' height='54' viewBox='0 0 80 54' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='54' rx='5' fill='#131123' stroke='rgba(255,255,255,0.08)' strokeWidth='1' />
        <rect x='4' y='4' width='72' height='6' rx='1.5' fill='#1c172b' />
        <rect x='4' y='12' width='46' height='38' rx='2' fill='#09090d' stroke={accent} strokeWidth='0.8' />
        <rect x='52' y='12' width='24' height='6' rx='1' fill='#1c172b' />
        <rect x='52' y='19' width='24' height='7' rx='1' fill='#1c172b' />
        <path d='M53 24 Q59 21, 65 24 T75 22' stroke={accent} strokeWidth='0.8' fill='none' />
        <rect x='52' y='27' width='24' height='7' rx='1' fill='#1c172b' />
        <path d='M53 32 Q59 29, 65 32 T75 30' stroke={accent} strokeWidth='0.8' fill='none' />
        <rect x='52' y='35' width='24' height='7' rx='1' fill='#1c172b' />
        <path d='M53 40 Q59 37, 65 40 T75 38' stroke='#10b981' strokeWidth='0.8' fill='none' />
        <rect x='52' y='43' width='24' height='7' rx='1' fill='#1c172b' />
        <path d='M53 48 Q59 45, 65 48 T75 46' stroke={accent} strokeWidth='0.8' fill='none' />
      </svg>
    ),
  },
  {
    value: 'custom',
    label: '4. Custom Layout',
    description: 'Drag & drop modular console with Qunix & Calagopus components.',
    svg: (
      <svg width='100%' height='54' viewBox='0 0 80 54' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='54' rx='5' fill='#131123' stroke='rgba(255,255,255,0.08)' strokeWidth='1' />
        <rect x='4' y='4' width='72' height='8' rx='2' fill={accent} fillOpacity='0.4' stroke={accent} strokeWidth='0.6' />
        <rect x='4' y='16' width='34' height='16' rx='2' fill='#181926' stroke='rgba(255,255,255,0.1)' strokeWidth='0.5' />
        <rect x='42' y='16' width='34' height='16' rx='2' fill='#181926' stroke='rgba(255,255,255,0.1)' strokeWidth='0.5' />
        <rect x='4' y='36' width='72' height='14' rx='2' fill='#0e0f15' stroke='rgba(255,255,255,0.06)' strokeWidth='0.5' />
        <circle cx='8' cy='8' r='1.5' fill='#10b981' />
        <path d='M14 8h16' stroke={`color-mix(in srgb, ${accent} 80%, white)`} strokeWidth='1' strokeLinecap='round' />
      </svg>
    ),
  },
];

interface LayoutSettingsProps {
  form: UseFormReturnType<z.infer<typeof qunixThemeSettingsSchema>>;
  onNavigateTab?: (tab: string) => void;
}

export function LayoutSettings({ form, onNavigateTab }: LayoutSettingsProps) {
  const navigate = useNavigate();
  const { t: tExt } = useExtTranslations();
  const themeAccent = form.values.button_color || form.values.focus_color || '#6c5ce7';
  const cardBgUnselected = '#131123';
  const cardBorderUnselected = '1px solid #1e2430';
  const cardBgSelected = `color-mix(in srgb, ${themeAccent} 14%, transparent)`;
  const cardBorderSelected = `2px solid ${themeAccent}`;
  const accentTextColor = `color-mix(in srgb, ${themeAccent} 80%, white)`;
  const debouncedFontLoaderRef = React.useRef<any>(null);
  const debouncedLoadFont = React.useCallback((val: string) => {
    if (debouncedFontLoaderRef.current) clearTimeout(debouncedFontLoaderRef.current);
    debouncedFontLoaderRef.current = setTimeout(() => {
      const clean = val.trim();
      if (clean.length > 2) {
        try {
          (window as any).qunixLoadFont?.(clean);
        } catch (_) {}
      }
    }, 500);
  }, []);

  const currentFontValue = (form.values.font_family || '').trim();
  const currentFamilyName = React.useMemo(() => extractFamilyName(currentFontValue), [currentFontValue]);
  const isBundled = React.useMemo(() => isBundledFont(currentFamilyName), [currentFamilyName]);

  const [cachedFont, setCachedFont] = React.useState<CachedFontRecord | null>(null);
  const [isDownloading, setIsDownloading] = React.useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = React.useState<string>('');
  const [downloadError, setDownloadError] = React.useState<string | null>(null);

  const quickLinksData = React.useMemo(() => {
    return parseQuickLinks(form.values.dashboard_quick_links);
  }, [form.values.dashboard_quick_links]);

  const handleQuickLinksChange = (updated: QuickLinkItem[]) => {
    form.setFieldValue('dashboard_quick_links', JSON.stringify(updated));
  };

  const checkCacheStatus = React.useCallback(async (fontVal: string) => {
    if (!fontVal) {
      setCachedFont(null);
      return;
    }
    const fam = extractFamilyName(fontVal);
    // Auto-clean any other cached fonts from local browser cache
    try {
      await cleanOtherCachedFonts(fontVal);
    } catch (_) {}

    if (isBundledFont(fam)) {
      setCachedFont(null);
      return;
    }
    try {
      const record = await getCachedFont(fontVal);
      if (record) {
        setCachedFont(record);
      } else {
        // Auto-download to local browser cache
        setIsDownloading(true);
        setDownloadProgress('Auto-downloading font to local cache...');
        setDownloadError(null);
        try {
          const res = await downloadAndCacheFont(fontVal, (msg) => {
            setDownloadProgress(msg);
          });
          if (res.success && res.record) {
            setCachedFont(res.record);
            setDownloadProgress(`Cached locally (${res.sizeKb || Math.round(res.record.sizeBytes / 1024)} KB)`);
          } else if (!res.success) {
            setDownloadError(res.error || 'Failed to auto-download font');
          }
          try {
            (window as any).qunixLoadFont?.(fontVal);
          } catch (_) {}
        } catch (err: any) {
          setDownloadError(err?.message || 'Failed to auto-download font');
        } finally {
          setIsDownloading(false);
        }
      }
    } catch (_) {
      setCachedFont(null);
    }
  }, []);

  React.useEffect(() => {
    checkCacheStatus(currentFontValue);
  }, [currentFontValue, checkCacheStatus]);

  const handleDownloadFont = async () => {
    if (!currentFontValue) return;
    setIsDownloading(true);
    setDownloadProgress('Fetching font and converting to Base64...');
    setDownloadError(null);
    try {
      const res = await downloadAndCacheFont(currentFontValue, (msg) => {
        setDownloadProgress(msg);
      });
      if (res.success && res.record) {
        setCachedFont(res.record);
        setDownloadProgress(`Cached successfully (${res.sizeKb || Math.round(res.record.sizeBytes / 1024)} KB)!`);
      } else if (!res.success) {
        setDownloadError(res.error || 'Failed to download font');
      }
      try {
        (window as any).qunixLoadFont?.(currentFontValue);
      } catch (_) {}
    } catch (err: any) {
      setDownloadError(err?.message || 'Failed to download font');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteFontCache = async () => {
    if (!currentFontValue) return;
    try {
      await deleteCachedFont(currentFontValue);
      setCachedFont(null);
      setDownloadProgress('');
      setDownloadError(null);
    } catch (err: any) {
      setDownloadError(err?.message || 'Failed to delete cache');
    }
  };

  return (
    <>
      {/* 1. Dashboard Layout Mode */}
      <div>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'block',
            color: accentTextColor,
            marginBottom: '12px',
          }}
        >
          <FontAwesomeIcon icon={faCogs} style={{ marginRight: '6px' }} />
          Navigation Shell Layout
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {getDashboardLayouts(themeAccent).map((layout) => {
            const isSelected = layout.value === 'icons'
              ? form.values.sidebar_style === 'icons'
              : (form.values.dashboard_layout || 'default') === layout.value && form.values.sidebar_style !== 'icons';
            return (
              <div
                key={layout.value}
                onClick={() => {
                  if (layout.value === 'icons') {
                    form.setFieldValue('sidebar_style', 'icons');
                    form.setFieldValue('dashboard_layout', 'default');
                    form.setFieldValue('sidebar_hover_style', 'none');
                  } else {
                    form.setFieldValue('sidebar_style', 'full');
                    form.setFieldValue('dashboard_layout', layout.value);
                  }
                }}
                style={{
                  background: isSelected ? cardBgSelected : cardBgUnselected,
                  border: isSelected ? cardBorderSelected : cardBorderUnselected,
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                  boxShadow: 'none',
                }}
              >
                <div style={{ transform: 'scale(0.85)', margin: '-4px 0' }}>{layout.svg}</div>
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{ fontSize: '10px', fontWeight: 600, color: isSelected ? accentTextColor : '#e2e8f0' }}
                  >
                    {layout.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Divider my="md" color="#111114" />

      {/* 2. Server Console Layout */}
      <div>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'block',
            color: accentTextColor,
            marginBottom: '12px',
          }}
        >
          <FontAwesomeIcon icon={faTerminal} style={{ marginRight: '6px' }} />
          Server Console Layout
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
          {getConsoleStyles(themeAccent).map((item) => {
            const isSelected = (form.values.console_style || 'default') === item.value;
            return (
              <div
                key={item.value}
                onClick={() => {
                  form.setFieldValue('console_style', item.value);
                  if (typeof window !== 'undefined' && (window as any).qunixThemeSettings) {
                    (window as any).qunixThemeSettings.console_style = item.value;
                  }
                  if (typeof document !== 'undefined') {
                    document.documentElement.setAttribute('data-console-style', item.value);
                  }
                  window.dispatchEvent(
                    new CustomEvent('qunix-theme-settings-changed', {
                      detail: { ...((window as any).qunixThemeSettings || {}), console_style: item.value },
                    })
                  );
                }}
                style={{
                  background: isSelected ? cardBgSelected : cardBgUnselected,
                  border: isSelected ? cardBorderSelected : cardBorderUnselected,
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: 'none',
                }}
              >
                <div style={{ transform: 'scale(1)', width: '100%' }}>{item.svg}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '12px', color: isSelected ? accentTextColor : '#ffffff' }}>
                    {item.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Builder shortcut banner when Custom is selected */}
        {form.values.console_style === 'custom' && (
          <div
            style={{
              marginTop: '12px',
              padding: '12px 14px',
              background: `color-mix(in srgb, ${themeAccent} 10%, transparent)`,
              border: `1px solid color-mix(in srgb, ${themeAccent} 25%, transparent)`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', display: 'block' }}>
                Modular Console Customizer
              </span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                Arrange, toggle, and size Qunix & Calagopus modules.
              </span>
            </div>
            <Button
              size='xs'
              onClick={() => onNavigateTab?.('dashboard-layout')}
              style={{
                background: `color-mix(in srgb, ${themeAccent} 15%, transparent)`,
                color: accentTextColor,
                border: `1px solid color-mix(in srgb, ${themeAccent} 35%, transparent)`,
              }}
            >
              Open Builder
            </Button>
          </div>
        )}

        {/* Disable Console Auto-Resize / Height Stretch */}
        <div
          style={{
            marginTop: '12px',
            padding: '12px 14px',
            background: '#0d0d12',
            border: '1px solid #1a1a24',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', display: 'block' }}>
              Disable Terminal Auto-Resize
            </span>
            <span style={{ fontSize: '11px', color: '#71717a', lineHeight: '1.4', display: 'block', marginTop: '2px' }}>
              Maintains fixed terminal height instead of stretching to fill viewport.
            </span>
          </div>
          <Switch
            checked={!!form.values.disable_console_auto_resize}
            onChange={(event) => form.setFieldValue('disable_console_auto_resize', event.currentTarget.checked)}
            color={themeAccent}
            size='sm'
          />
        </div>
      </div>

      <Divider my="md" color="#111114" />

      {/* 3. Wallpaper & Spacing */}
      <div>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'block',
            color: accentTextColor,
            marginBottom: '12px',
          }}
        >
          <FontAwesomeIcon icon={faImage} style={{ marginRight: '6px' }} />
          Wallpaper & Spacing
        </span>
        <Stack gap='sm'>
          <div>
            <TextInput label='Background Image URL (Dark)' {...form.getInputProps('background_image')} />
            <div
              style={{
                marginTop: '8px',
                height: '80px',
                width: '100%',
                borderRadius: '6px',
                border: '1px solid #2d2d30',
                backgroundImage: form.values.background_image
                  ? `linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.7) 100%), url(${form.values.background_image})`
                  : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: form.values.background_image ? 'transparent' : '#121214',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {form.values.background_image ? (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: '#fff',
                    textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                  }}
                >
                  Dark Mode Wallpaper Preview
                </span>
              ) : (
                <span style={{ fontSize: '9px', color: '#71717a' }}>No Dark Mode wallpaper URL</span>
              )}
            </div>
          </div>

          <div>
            <TextInput label='Background Image URL (Light)' {...form.getInputProps('light_background_image')} />
            <div
              style={{
                marginTop: '8px',
                height: '80px',
                width: '100%',
                borderRadius: '6px',
                border: '1px solid #2d2d30',
                backgroundImage: form.values.light_background_image
                  ? `linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.7) 100%), url(${form.values.light_background_image})`
                  : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: form.values.light_background_image ? 'transparent' : '#121214',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {form.values.light_background_image ? (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: '#fff',
                    textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                  }}
                >
                  Light Mode Wallpaper Preview
                </span>
              ) : (
                <span style={{ fontSize: '9px', color: '#71717a' }}>No Light Mode wallpaper URL</span>
              )}
            </div>
          </div>

          <Group grow>
            <NumberInput
              label='Wallpaper Blur'
              min={0}
              max={50}
              {...form.getInputProps('wallpaper_blur')}
            />
            <NumberInput
              label='Brightness'
              min={0}
              max={1}
              step={0.1}
              {...form.getInputProps('wallpaper_brightness')}
            />
          </Group>
          <Group grow>
            <NumberInput
              label='Glass Transparency (%)'
              min={0}
              max={100}
              {...form.getInputProps('glass_transparency')}
            />
            <NumberInput
              label='Navbar Height (px)'
              min={32}
              max={200}
              {...form.getInputProps('navbar_height')}
            />
          </Group>
        </Stack>
      </div>

      <Divider my="md" color="#111114" />

      {/* 4. Borders & Shadows */}
      <div>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'block',
            color: accentTextColor,
            marginBottom: '12px',
          }}
        >
          <FontAwesomeIcon icon={faSquare} style={{ marginRight: '6px' }} />
          Borders & Shadows
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <div style={{ background: '#0a0a0c', border: '1px solid #1a1a20', borderRadius: '8px', padding: '10px 12px' }}>
            <NumberInput
              label='Card Radius'
              suffix=' px'
              min={0}
              max={100}
              {...form.getInputProps('card_radius')}
            />
          </div>
          <div style={{ background: '#0a0a0c', border: '1px solid #1a1a20', borderRadius: '8px', padding: '10px 12px' }}>
            <NumberInput
              label='Input Radius'
              suffix=' px'
              min={0}
              max={100}
              {...form.getInputProps('input_radius')}
            />
          </div>
          <div style={{ background: '#0a0a0c', border: '1px solid #1a1a20', borderRadius: '8px', padding: '10px 12px' }}>
            <NumberInput
              label='Button Radius'
              suffix=' px'
              min={0}
              max={100}
              {...form.getInputProps('button_radius')}
            />
          </div>
          <div style={{ background: '#0a0a0c', border: '1px solid #1a1a20', borderRadius: '8px', padding: '10px 12px' }}>
            <NumberInput
              label='Global Radius'
              suffix=' px'
              min={0}
              max={100}
              {...form.getInputProps('border_radius')}
            />
          </div>
          <div style={{ background: '#0a0a0c', border: '1px solid #1a1a20', borderRadius: '8px', padding: '10px 12px' }}>
            <NumberInput
              label='Listing Radius'
              suffix=' px'
              min={0}
              max={100}
              {...form.getInputProps('listing_radius')}
            />
          </div>
          <div style={{ background: '#0a0a0c', border: '1px solid #1a1a20', borderRadius: '8px', padding: '10px 12px' }}>
            <NumberInput
              label='Console Banner Radius'
              suffix=' px'
              min={0}
              max={100}
              {...form.getInputProps('console_banner_radius')}
            />
          </div>
          <div style={{ background: '#0a0a0c', border: '1px solid #1a1a20', borderRadius: '8px', padding: '10px 12px' }}>
            <NumberInput
              label='Checkbox / Tick Radius'
              suffix=' px'
              min={0}
              max={100}
              {...form.getInputProps('checkbox_radius')}
            />
          </div>
          <div style={{ background: '#0a0a0c', border: '1px solid #1a1a20', borderRadius: '8px', padding: '10px 12px' }}>
            <NumberInput
              label='Shadow Opacity (Dark)'
              min={0}
              max={1}
              step={0.01}
              decimalScale={2}
              {...form.getInputProps('shadow_opacity')}
            />
          </div>
          <div style={{ gridColumn: 'span 2', background: '#0a0a0c', border: '1px solid #1a1a20', borderRadius: '8px', padding: '10px 12px' }}>
            <NumberInput
              label='Shadow Opacity (Light)'
              min={0}
              max={1}
              step={0.01}
              decimalScale={2}
              {...form.getInputProps('light_shadow_opacity')}
            />
          </div>
        </div>
      </div>

      <Divider my="md" color="#111114" />

      {/* 5. Typography & Terminal Fonts */}
      <div>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'block',
            color: accentTextColor,
            marginBottom: '12px',
          }}
        >
          <FontAwesomeIcon icon={faFont} style={{ marginRight: '6px' }} />
          {tExt('admin.layout.typography', { defaultValue: 'Typography & Terminal Fonts' })}
        </span>
        <Stack gap='sm'>
          <Select
            label={tExt('admin.layout.globalFontFamily', { defaultValue: 'UI Font Family Presets' })}
            searchable
            comboboxProps={{ withinPortal: true, zIndex: 10000 }}
            data={[
              { value: 'JetBrains Mono', label: 'JetBrains Mono (Built-in Local · Monospace)' },
              { value: 'Outfit', label: 'Outfit (Built-in Local · Modern Geometric)' },
              { value: 'Inter', label: 'Inter (Built-in Local · Clean Tech Sans)' },
              { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans (Built-in Local · Modern SaaS)' },
              { value: 'Roboto', label: 'Roboto (Built-in Local · Classic Sans)' },
              { value: 'Geist Sans', label: 'Geist Sans (Modern Clean)' },
              { value: 'Poppins', label: 'Poppins (Geometric Sans)' },
              { value: 'Open Sans', label: 'Open Sans' },
              { value: 'Montserrat', label: 'Montserrat' },
              { value: 'Space Grotesk', label: 'Space Grotesk' },
              { value: 'Fira Code', label: 'Fira Code' },
              { value: 'system-ui', label: 'System UI (Native OS Font)' },
            ]}
            value={form.values.font_family || 'JetBrains Mono'}
            onChange={(val) => {
              if (val) {
                form.setFieldValue('font_family', val);
                try {
                  (window as any).qunixLoadFont?.(val);
                } catch (_) {}
              }
            }}
          />
          <TextInput
            label={tExt('admin.layout.customFontFamily', { defaultValue: 'Custom Font Family / Stylesheet URL' })}
            placeholder='e.g. Space Grotesk or https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600&display=swap'
            value={form.values.font_family || ''}
            onChange={(e) => {
              const val = e.currentTarget.value;
              form.setFieldValue('font_family', val);
              debouncedLoadFont(val);
            }}
            onBlur={(e) => {
              const val = e.currentTarget.value.trim();
              if (val.length > 2) {
                try {
                  (window as any).qunixLoadFont?.(val);
                } catch (_) {}
              }
            }}
          />

          {/* Font Cache & Offline HTTPS Status Indicator */}
          {currentFontValue && (
            isBundled ? null : cachedFont ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: '6px',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <FontAwesomeIcon icon={faServer} style={{ color: '#818cf8', fontSize: '14px' }} />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#818cf8' }}>
                      Stored in Local Browser Cache ({Math.round(cachedFont.sizeBytes / 1024)} KB)
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      Saved as Base64 data font in browser IndexedDB. Zero CSP violations on HTTPS.
                    </div>
                  </div>
                </div>
                <Group gap='xs'>
                  <Button
                    size='xs'
                    variant='light'
                    color='indigo'
                    loading={isDownloading}
                    leftSection={<FontAwesomeIcon icon={faDownload} />}
                    onClick={handleDownloadFont}
                  >
                    Re-download
                  </Button>
                  <Button
                    size='xs'
                    variant='subtle'
                    color='red'
                    leftSection={<FontAwesomeIcon icon={faTrash} />}
                    onClick={handleDeleteFontCache}
                  >
                    Clear
                  </Button>
                </Group>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '10px 12px',
                  background: 'rgba(234, 179, 8, 0.08)',
                  border: '1px solid rgba(234, 179, 8, 0.25)',
                  borderRadius: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                    <FontAwesomeIcon icon={faCloud} style={{ color: '#eab308', fontSize: '14px' }} />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#eab308' }}>
                        External Cloud Font ({currentFamilyName})
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        Remote fonts can be blocked by HTTPS Content Security Policy. Download and cache to local storage for 100% offline & CSP-safe loading.
                      </div>
                    </div>
                  </div>
                  <Button
                    size='xs'
                    color='yellow'
                    variant='filled'
                    loading={isDownloading}
                    leftSection={<FontAwesomeIcon icon={faCloudDownload} />}
                    onClick={handleDownloadFont}
                  >
                    Download to Local Cache
                  </Button>
                </div>
                {downloadProgress && (
                  <div style={{ fontSize: '11px', color: '#38bdf8', paddingLeft: '23px' }}>
                    {downloadProgress}
                  </div>
                )}
                {downloadError && (
                  <div style={{ fontSize: '11px', color: '#ef4444', paddingLeft: '23px' }}>
                    Error: {downloadError}
                  </div>
                )}
              </div>
            )
          )}
          <Select
            label={tExt('admin.layout.terminalFontFamily', { defaultValue: 'Terminal Font Family (XTerm)' })}
            comboboxProps={{ withinPortal: true, zIndex: 10000 }}
            data={[
              { value: 'Consolas', label: 'Consolas' },
              { value: 'Menlo', label: 'Menlo' },
              { value: 'Monaco', label: 'Monaco' },
              { value: 'Courier New', label: 'Courier New' },
              { value: 'FiraCode Nerd Font', label: 'FiraCode Nerd Font' },
              { value: 'JetBrainsMono Nerd Font', label: 'JetBrainsMono Nerd Font' },
              { value: 'Meslo LG M Nerd Font', label: 'Meslo LG M Nerd Font' },
              { value: 'UbuntuMono Nerd Font', label: 'UbuntuMono Nerd Font' },
            ]}
            allowDeselect={false}
            clearable={false}
            value={
              form.values.terminal_font_family === 'JetBrains Mono' || !form.values.terminal_font_family
                ? 'JetBrainsMono Nerd Font'
                : form.values.terminal_font_family
            }
            onChange={(val) => {
              if (val) {
                form.setFieldValue('terminal_font_family', val);
              }
            }}
          />
        </Stack>
      </div>

      {/* 5. Dashboard Quick Links Section */}
      <div className='qunix-admin-card p-6'>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: '#f8fafc' }}>
              Dashboard Quick Links
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Configure the action cards shown at the top of the dashboard. Enable or disable individual cards, toggle whether links are clickable or informational, and customize titles, URLs, and icons.
            </p>
          </div>
          <Switch
            label='Enable Quick Links'
            checked={form.values.enable_dashboard_quick_links !== false}
            onChange={(e) => form.setFieldValue('enable_dashboard_quick_links', e.currentTarget.checked)}
          />
        </div>
        {form.values.enable_dashboard_quick_links !== false && (
          <QuickLinksEditor links={quickLinksData} onChange={handleQuickLinksChange} />
        )}
      </div>
    </>
  );
}

export default LayoutSettings;
