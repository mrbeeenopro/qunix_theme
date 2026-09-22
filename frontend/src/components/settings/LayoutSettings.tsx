import React from 'react';
import { Stack, Group, TextInput, NumberInput, Divider, Select } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { z } from 'zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faRuler, faSquare, faFont, faCogs, faTerminal } from '@fortawesome/free-solid-svg-icons';
import { qunixThemeSettingsSchema } from '../../lib/schemas.ts';
import { useExtTranslations } from '../../translations.ts';

const DASHBOARD_LAYOUTS = [
  {
    value: 'default',
    label: 'Default',
    description: 'Standard full-height sidebar and console layout.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#1e1631' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
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
        <rect width='80' height='60' rx='6' fill='#1e1631' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
        <rect x='6' y='6' width='14' height='48' rx='4' fill='#161025' stroke='#6c5ce7' strokeWidth='1' />
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
        <rect width='80' height='60' rx='6' fill='#1e1631' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
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
        <rect width='80' height='60' rx='6' fill='#1e1631' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
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
        <rect width='80' height='60' rx='6' fill='#1e1631' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
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
        <rect width='80' height='60' rx='6' fill='#1e1631' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
        <rect x='4' y='4' width='8' height='52' rx='1' fill='#161025' />
        <rect x='16' y='4' width='60' height='52' rx='2' fill='#161025' fillOpacity='0.5' />
        <rect x='6' y='8' width='4' height='4' rx='1' fill='#6c5ce7' />
        <rect x='6' y='16' width='4' height='4' rx='1' fill='#6c5ce7' />
        <rect x='6' y='24' width='4' height='4' rx='1' fill='#6c5ce7' />
      </svg>
    ),
  },
];

interface LayoutSettingsProps {
  form: UseFormReturnType<z.infer<typeof qunixThemeSettingsSchema>>;
}

export function LayoutSettings({ form }: LayoutSettingsProps) {
  const { t: tExt } = useExtTranslations();
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

  return (
    <>
      {/* 1. Dashboard Layout Mode */}
      <div>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'block',
            color: '#a29bfe',
            marginBottom: '12px',
          }}
        >
          <FontAwesomeIcon icon={faCogs} style={{ marginRight: '6px' }} />
          Dashboard Layout
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {DASHBOARD_LAYOUTS.map((layout) => {
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
                  background: '#0a0a0c',
                  border: isSelected ? '2px solid #6c5ce7' : '1px solid #222228',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 0 10px rgba(108, 92, 231, 0.15)' : 'none',
                }}
              >
                <div style={{ transform: 'scale(0.85)', margin: '-4px 0' }}>{layout.svg}</div>
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{ fontSize: '10px', fontWeight: 600, color: isSelected ? '#a29bfe' : '#e2e8f0' }}
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
            color: '#a29bfe',
            marginBottom: '12px',
          }}
        >
          <FontAwesomeIcon icon={faTerminal} style={{ marginRight: '6px' }} />
          Server Console Layout
        </span>
        <span
          style={{
            fontSize: '11px',
            color: '#71717a',
            display: 'block',
            marginBottom: '12px',
            lineHeight: '1.4',
          }}
        >
          Select 1 of 3 console display styles: (1) Default banner, (2) Egg Banner Overlay, (3) Compact Side-by-Side with 4 real-time resource sparkline charts.
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            {
              value: 'default',
              label: '1. Default Banner',
              description: 'Standard Calagopus Panel banner header.',
              svg: (
                <svg width='100%' height='54' viewBox='0 0 80 54' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <rect width='80' height='54' rx='5' fill='#121218' stroke='rgba(255,255,255,0.08)' strokeWidth='1' />
                  <rect x='4' y='4' width='72' height='10' rx='2' fill='#1f1b2e' stroke='rgba(255,255,255,0.1)' strokeWidth='0.5' />
                  <rect x='4' y='16' width='48' height='24' rx='2' fill='#0a0a0e' stroke='rgba(255,255,255,0.06)' strokeWidth='0.5' />
                  <rect x='54' y='16' width='22' height='24' rx='2' fill='#161420' stroke='rgba(255,255,255,0.06)' strokeWidth='0.5' />
                  <rect x='4' y='42' width='72' height='8' rx='2' fill='#161420' fillOpacity='0.6' />
                </svg>
              ),
            },
            {
              value: 'mini',
              label: '2. Mini Banner',
              description: 'Hero header overlaying customized egg image wallpapers.',
              svg: (
                <svg width='100%' height='54' viewBox='0 0 80 54' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <rect width='80' height='54' rx='5' fill='#121218' stroke='rgba(255,255,255,0.08)' strokeWidth='1' />
                  <rect x='4' y='4' width='72' height='12' rx='3' fill='url(#miniBannerGrad)' stroke='#6c5ce7' strokeWidth='0.8' />
                  <defs>
                    <linearGradient id='miniBannerGrad' x1='0' y1='0' x2='80' y2='0'>
                      <stop offset='0%' stopColor='#6c5ce7' stopOpacity='0.5' />
                      <stop offset='100%' stopColor='#a29bfe' stopOpacity='0.15' />
                    </linearGradient>
                  </defs>
                  <rect x='4' y='18' width='48' height='32' rx='2' fill='#0a0a0e' stroke='rgba(255,255,255,0.06)' strokeWidth='0.5' />
                  <rect x='54' y='18' width='22' height='32' rx='2' fill='#161420' stroke='rgba(255,255,255,0.06)' strokeWidth='0.5' />
                </svg>
              ),
            },
            {
              value: 'compact',
              label: '3. Compact Sidebar',
              description: 'Side-by-side terminal with 4 resource sparklines (CPU, Memory, Disk, Network).',
              svg: (
                <svg width='100%' height='54' viewBox='0 0 80 54' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <rect width='80' height='54' rx='5' fill='#121218' stroke='rgba(255,255,255,0.08)' strokeWidth='1' />
                  <rect x='4' y='4' width='72' height='6' rx='1.5' fill='#1c172b' />
                  <rect x='4' y='12' width='46' height='38' rx='2' fill='#09090d' stroke='#6c5ce7' strokeWidth='0.8' />
                  <rect x='52' y='12' width='24' height='6' rx='1' fill='#1c172b' />
                  <rect x='52' y='19' width='24' height='7' rx='1' fill='#1c172b' />
                  <path d='M53 24 Q59 21, 65 24 T75 22' stroke='#6c5ce7' strokeWidth='0.8' fill='none' />
                  <rect x='52' y='27' width='24' height='7' rx='1' fill='#1c172b' />
                  <path d='M53 32 Q59 29, 65 32 T75 30' stroke='#6c5ce7' strokeWidth='0.8' fill='none' />
                  <rect x='52' y='35' width='24' height='7' rx='1' fill='#1c172b' />
                  <path d='M53 40 Q59 37, 65 40 T75 38' stroke='#10b981' strokeWidth='0.8' fill='none' />
                  <rect x='52' y='43' width='24' height='7' rx='1' fill='#1c172b' />
                  <path d='M53 48 Q59 45, 65 48 T75 46' stroke='#3b82f6' strokeWidth='0.8' fill='none' />
                </svg>
              ),
            },
          ].map((item) => {
            const isSelected = (form.values.console_style || 'default') === item.value;
            return (
              <div
                key={item.value}
                onClick={() => form.setFieldValue('console_style', item.value)}
                style={{
                  background: isSelected ? 'rgba(108, 92, 231, 0.1)' : '#0a0a0c',
                  border: isSelected ? '2px solid #6c5ce7' : '1px solid #1a1a20',
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 0 12px rgba(108, 92, 231, 0.2)' : 'none',
                }}
              >
                <div style={{ transform: 'scale(1)', width: '100%' }}>{item.svg}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '12px', color: isSelected ? '#a29bfe' : '#ffffff' }}>
                    {item.label}
                  </div>
                </div>
              </div>
            );
          })}
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
            color: '#a29bfe',
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
            color: '#a29bfe',
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
            color: '#a29bfe',
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
              { value: 'JetBrains Mono', label: 'JetBrains Mono (Monospace)' },
              { value: 'Google Sans', label: 'Google Sans (Modern Clean)' },
              { value: 'Outfit', label: 'Outfit (Sleek Modern Geometric)' },
              { value: 'Inter', label: 'Inter (Clean Tech Sans)' },
              { value: 'Poppins', label: 'Poppins (Geometric Sans)' },
              { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans (Modern SaaS)' },
              { value: 'Roboto', label: 'Roboto (Classic)' },
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
            placeholder='JetBrains Mono or https://fonts.googleapis.com/css2?family=Outfit:wght@400;600&display=swap'
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
    </>
  );
}

export default LayoutSettings;
