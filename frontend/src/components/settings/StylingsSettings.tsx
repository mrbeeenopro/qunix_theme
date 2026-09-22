import React from 'react';
import { Switch, Stack, Group, Select, Textarea, NumberInput, TextInput } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { z } from 'zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagic,
  faSliders,
  faArrowUp,
  faEye,
  faExpand,
  faBolt,
  faArrowRight,
  faCube,
  faSun,
  faBan,
  faSpinner,
  faList,
} from '@fortawesome/free-solid-svg-icons';
import { qunixThemeSettingsSchema } from '../../lib/schemas.ts';
import { ColorField } from './ColorField.tsx';
import { PreloaderCanvasDemo } from './PreloaderCanvasDemo.tsx';
import { useExtTranslations } from '../../translations.ts';

const CARD_ANIMATION_OPTIONS = [
  {
    value: 'slide-up',
    label: 'Slide Up (Default)',
    description: 'Smooth upward entrance with decelerating fade.',
    icon: faArrowUp,
  },
  {
    value: 'fade',
    label: 'Gentle Fade In',
    description: 'Subtle and clean opacity fade without movement.',
    icon: faEye,
  },
  {
    value: 'scale',
    label: 'Scale Zoom In',
    description: 'Crisp zoom scaling up smoothly from 95%.',
    icon: faExpand,
  },
  {
    value: 'pop',
    label: 'Spring Bounce',
    description: 'Playful spring entrance with energetic overshoot.',
    icon: faBolt,
  },
  {
    value: 'slide-left',
    label: 'Slide From Left',
    description: 'Dynamic horizontal slide moving from left to right.',
    icon: faArrowRight,
  },
  {
    value: 'flip',
    label: '3D Perspective Flip',
    description: 'Modern 3D tilt flip entering with depth perspective.',
    icon: faCube,
  },
  {
    value: 'glow',
    label: 'Ambient Glow In',
    description: 'Smooth entrance with ambient accent shimmer highlight.',
    icon: faSun,
  },
  {
    value: 'none',
    label: 'None (Instant)',
    description: 'Zero animation for instant, lightning-fast rendering.',
    icon: faBan,
  },
];

const LISTING_ANIMATION_OPTIONS = [
  {
    value: 'inherit',
    label: 'Inherit Card Animation',
    description: 'Use the global Card Entrance Animation setting above.',
    icon: faMagic,
  },
  {
    value: 'slide-up',
    label: 'Slide Up',
    description: 'Smooth upward entrance with staggered cascade.',
    icon: faArrowUp,
  },
  {
    value: 'fade',
    label: 'Gentle Fade In',
    description: 'Subtle and clean opacity fade across rows & cards.',
    icon: faEye,
  },
  {
    value: 'scale',
    label: 'Scale Zoom In',
    description: 'Crisp zoom scaling up smoothly from 95%.',
    icon: faExpand,
  },
  {
    value: 'pop',
    label: 'Spring Bounce',
    description: 'Playful spring entrance with energetic cascade.',
    icon: faBolt,
  },
  {
    value: 'slide-left',
    label: 'Slide From Left',
    description: 'Dynamic horizontal slide moving from left to right.',
    icon: faArrowRight,
  },
  {
    value: 'flip',
    label: '3D Perspective Flip',
    description: 'Modern 3D tilt flip entering with depth perspective.',
    icon: faCube,
  },
  {
    value: 'glow',
    label: 'Ambient Glow In',
    description: 'Smooth entrance with ambient accent shimmer highlight.',
    icon: faSun,
  },
  {
    value: 'none',
    label: 'None (Instant)',
    description: 'Zero animation for instant, lightning-fast rendering.',
    icon: faBan,
  },
];

const CARD_HOVER_OPTIONS = [
  {
    value: 'shift',
    label: 'Translate Shift (Default)',
    description: 'Cards lift upward and list rows glide smoothly to the right.',
    icon: faArrowRight,
  },
  {
    value: 'scale',
    label: 'Scale Zoom Up',
    description: 'Cards and rows scale up smoothly with rich depth elevation.',
    icon: faExpand,
  },
  {
    value: 'glow',
    label: 'Ambient Border Glow',
    description: 'Surrounds hovered items with vibrant theme luminous glow.',
    icon: faSun,
  },
  {
    value: 'none',
    label: 'No Hover Transform',
    description: 'Minimal static hover behavior without transformations.',
    icon: faBan,
  },
];

interface StylingsSettingsProps {
  form: UseFormReturnType<z.infer<typeof qunixThemeSettingsSchema>>;
}

export function StylingsSettings({ form }: StylingsSettingsProps) {
  const { t: tExt } = useExtTranslations();
  return (
    <>
      <Stack gap="md">
        {/* 1. Dashboard List/Grid Layout Settings */}
        <div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 'bold',
              display: 'block',
              color: '#a29bfe',
              marginBottom: '4px',
            }}
          >
            <FontAwesomeIcon icon={faSliders} style={{ marginRight: '6px' }} />
            Dashboard List & Grid Views
          </span>
          <Stack gap='sm' mt='xs'>
            <Switch
              label='Enable Layout Toggle'
              checked={form.values.enable_layout_toggle !== false}
              onChange={(e) => form.setFieldValue('enable_layout_toggle', e.currentTarget.checked)}
              styles={{
                label: { color: '#e4e4e7', fontSize: '11px', fontWeight: 600 },
              }}
            />

            <Textarea
              label='Dashboard Welcome Subtitle'
              placeholder='Manage and monitor your game servers in real-time...'
              {...form.getInputProps('welcome_subtitle')}
              rows={2}
              styles={{
                input: {
                  background: '#141418',
                  border: '1px solid #27272a',
                  color: '#e4e4e7',
                },
                label: { color: '#e4e4e7' },
              }}
            />

            <Select
              label='List View Mini Chart'
              comboboxProps={{ withinPortal: true, zIndex: 10000 }}
              data={[
                { value: 'cpu', label: 'CPU Usage Sparkline' },
                { value: 'ram', label: 'RAM Usage Sparkline' },
                { value: 'disk', label: 'Disk Usage Sparkline' },
                { value: 'network', label: 'Network Traffic Sparkline' },
                { value: 'disabled', label: 'Disable Mini Chart' },
              ]}
              {...form.getInputProps('list_layout_chart')}
              styles={{
                input: { background: '#141418', border: '1px solid #27272a', color: '#e4e4e7' },
                dropdown: { background: '#141418', border: '1px solid #27272a' },
                option: { color: '#e4e4e7' },
              }}
            />

            <Select
              label='Grid View Banner Style'
              comboboxProps={{ withinPortal: true, zIndex: 10000 }}
              data={[
                { value: 'cover', label: 'Dark Overlay Cover' },
                { value: 'right', label: 'Right Fade-in' },
                { value: 'fade-left', label: 'Left Fade-in' },
                { value: 'fade-up', label: 'Upward Fade-in' },
                { value: 'fade-down', label: 'Downward Fade-in' },
                { value: 'fade-half', label: 'Fade Half' },
                { value: 'disabled', label: 'Disable Egg Banners' },
              ]}
              {...form.getInputProps('grid_banner_style')}
              styles={{
                input: { background: '#141418', border: '1px solid #27272a', color: '#e4e4e7' },
                dropdown: { background: '#141418', border: '1px solid #27272a' },
                option: { color: '#e4e4e7' },
              }}
            />

            <Select
              label='List View Banner Style'
              comboboxProps={{ withinPortal: true, zIndex: 10000 }}
              data={[
                { value: 'right', label: 'Right Fade-in' },
                { value: 'fade-left', label: 'Left Fade-in' },
                { value: 'fade-up', label: 'Upward Fade-in' },
                { value: 'fade-down', label: 'Downward Fade-in' },
                { value: 'fade-half', label: 'Fade Half' },
                { value: 'cover', label: 'Full Cover' },
                { value: 'disabled', label: 'Disable Egg Banners' },
              ]}
              {...form.getInputProps('list_banner_style')}
              styles={{
                input: { background: '#141418', border: '1px solid #27272a', color: '#e4e4e7' },
                dropdown: { background: '#141418', border: '1px solid #27272a' },
                option: { color: '#e4e4e7' },
              }}
            />
          </Stack>
        </div>

        {/* 2. Global Card & Listing Animations */}
        <div style={{ borderTop: '1px solid #111114', paddingTop: '16px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#a29bfe',
              marginBottom: '4px',
            }}
          >
            <FontAwesomeIcon icon={faMagic} />
            Global Card Entrance Animation
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
            Choose entrance animation applied to cards, widgets, and console components.
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px' }}>
            {CARD_ANIMATION_OPTIONS.map((item) => {
              const isSelected = (form.values.card_animation || 'slide-up') === item.value;
              return (
                <div
                  key={item.value}
                  onClick={() => form.setFieldValue('card_animation', item.value)}
                  style={{
                    background: isSelected ? 'rgba(108, 92, 231, 0.12)' : '#0a0a0c',
                    border: isSelected ? '1.5px solid #6c5ce7' : '1px solid #222228',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
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
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: isSelected ? '#a29bfe' : '#e4e4e7' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '9px', color: '#71717a', marginTop: '2px', lineHeight: '1.2' }}>
                      {item.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dedicated Listing Entrance Animation */}
          <div style={{ marginTop: '16px', borderTop: '1px solid #1a1a22', paddingTop: '14px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#a29bfe',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '4px',
              }}
            >
              <FontAwesomeIcon icon={faList} />
              Dedicated Listing & Server Cards Animation
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
              Custom entrance animation applied specifically to server lists, server cards, and table rows.
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px' }}>
              {LISTING_ANIMATION_OPTIONS.map((item) => {
                const isSelected = (form.values.listing_animation || 'inherit') === item.value;
                return (
                  <div
                    key={item.value}
                    onClick={() => form.setFieldValue('listing_animation', item.value)}
                    style={{
                      background: isSelected ? 'rgba(108, 92, 231, 0.12)' : '#0a0a0c',
                      border: isSelected ? '1.5px solid #6c5ce7' : '1px solid #222228',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
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
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: isSelected ? '#a29bfe' : '#e4e4e7' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '9px', color: '#71717a', marginTop: '2px', lineHeight: '1.2' }}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Unified Card & Component Hover Animation */}
          <div style={{ marginTop: '16px', borderTop: '1px solid #1a1a22', paddingTop: '14px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#a29bfe',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '4px',
              }}
            >
              <FontAwesomeIcon icon={faSliders} />
              Unified Card & Component Hover Animations
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
              Synchronized hover transformation behavior applied across all server cards, listing rows, Version Chooser cards, and widget panels.
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px' }}>
              {CARD_HOVER_OPTIONS.map((item) => {
                const isSelected = (form.values.card_hover_animation || 'shift') === item.value;
                return (
                  <div
                    key={item.value}
                    onClick={() => form.setFieldValue('card_hover_animation', item.value)}
                    style={{
                      background: isSelected ? 'rgba(108, 92, 231, 0.12)' : '#0a0a0c',
                      border: isSelected ? '1.5px solid #6c5ce7' : '1px solid #222228',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
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
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: isSelected ? '#a29bfe' : '#e4e4e7' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '9px', color: '#71717a', marginTop: '2px', lineHeight: '1.2' }}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Spinner Options */}
        <div style={{ borderTop: '1px solid #111114', paddingTop: '16px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 'bold',
              display: 'block',
              color: '#a29bfe',
              marginBottom: '8px',
            }}
          >
            <FontAwesomeIcon icon={faSpinner} style={{ marginRight: '6px' }} />
            Page Loading Spinners
          </span>
          <Group grow>
            <Select
              label='Spinner Type'
              comboboxProps={{ withinPortal: true, zIndex: 10000 }}
              data={[
                { value: 'BarLoader', label: 'BarLoader' },
                { value: 'BeatLoader', label: 'BeatLoader' },
                { value: 'BounceLoader', label: 'BounceLoader' },
                { value: 'CircleLoader', label: 'CircleLoader' },
                { value: 'ClimbingBoxLoader', label: 'ClimbingBoxLoader' },
                { value: 'ClipLoader', label: 'ClipLoader' },
                { value: 'ClockLoader', label: 'ClockLoader' },
                { value: 'DotLoader', label: 'DotLoader' },
                { value: 'FadeLoader', label: 'FadeLoader' },
                { value: 'GridLoader', label: 'GridLoader' },
                { value: 'HashLoader', label: 'HashLoader' },
                { value: 'MoonLoader', label: 'MoonLoader' },
                { value: 'PacmanLoader', label: 'PacmanLoader' },
                { value: 'PropagateLoader', label: 'PropagateLoader' },
                { value: 'PuffLoader', label: 'PuffLoader' },
                { value: 'PulseLoader', label: 'PulseLoader' },
                { value: 'RingLoader', label: 'RingLoader' },
                { value: 'RiseLoader', label: 'RiseLoader' },
                { value: 'RotateLoader', label: 'RotateLoader' },
                { value: 'ScaleLoader', label: 'ScaleLoader' },
                { value: 'SkewLoader', label: 'SkewLoader' },
                { value: 'SquareLoader', label: 'SquareLoader' },
                { value: 'SyncLoader', label: 'SyncLoader' },
              ]}
              {...form.getInputProps('spinner_type')}
              styles={{
                input: { background: '#141418', border: '1px solid #27272a', color: '#e4e4e7' },
                dropdown: { background: '#141418', border: '1px solid #27272a' },
                option: { color: '#e4e4e7' },
              }}
            />
            <ColorField
              label='Spinner Color'
              {...form.getInputProps('spinner_color')}
            />
          </Group>
        </div>
        {/* 4. Preloader & Boot Screen */}
        <div style={{ borderTop: '1px solid #111114', paddingTop: '16px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 'bold',
              display: 'block',
              color: '#a29bfe',
              marginBottom: '8px',
            }}
          >
            <FontAwesomeIcon icon={faBolt} style={{ marginRight: '6px' }} />
            {tExt('admin.stylings.preloader', { defaultValue: 'Preloader Boot Screen' })}
          </span>

          <Stack gap='md'>
            <Switch
              label={tExt('admin.stylings.enablePreloader', { defaultValue: 'Enable Boot Preloader' })}
              checked={form.values.enable_preloader ?? true}
              onChange={(e) => form.setFieldValue('enable_preloader', e.currentTarget.checked)}
            />

            {(form.values.enable_preloader ?? true) && (
              <>
                {/* Interactive 60fps Canvas Demo Sandbox */}
                <PreloaderCanvasDemo
                  style={form.values.preloader_style || 'bar'}
                  delay={form.values.preloader_delay ?? 1500}
                  color={form.values.preloader_color || '#7aa2f7'}
                  text={form.values.preloader_text || 'INITIALIZING PANEL...'}
                  appName={
                    form.values.embed_site_name ||
                    (() => {
                      try {
                        const raw = localStorage.getItem('global');
                        if (raw) {
                          const g = JSON.parse(raw);
                          if (g?.state?.settings?.app?.name) return g.state.settings.app.name;
                        }
                      } catch (_) {}
                      return '';
                    })() ||
                    'Calagopus'
                  }
                  logoUrl={form.values.preloader_logo || ''}
                  bgColor={form.values.preloader_bg_color || ''}
                  bgImage={form.values.preloader_bg_image || ''}
                  onStyleChange={(newStyle) => form.setFieldValue('preloader_style', newStyle)}
                  onDelayChange={(newDelay) => form.setFieldValue('preloader_delay', newDelay)}
                />

                <Group grow align='flex-start'>
                  <ColorField
                    label={tExt('admin.stylings.preloaderColor', { defaultValue: 'Accent Color' })}
                    {...form.getInputProps('preloader_color')}
                  />

                  <NumberInput
                    label={tExt('admin.stylings.preloaderDelay', { defaultValue: 'Display Delay (ms)' })}
                    min={200}
                    max={10000}
                    step={250}
                    {...form.getInputProps('preloader_delay')}
                  />
                </Group>

                <TextInput
                  label={tExt('admin.stylings.preloaderText', { defaultValue: 'Status Text' })}
                  placeholder='INITIALIZING PANEL...'
                  {...form.getInputProps('preloader_text')}
                />

                <TextInput
                  label={tExt('admin.stylings.preloaderLogo', { defaultValue: 'Custom Logo URL' })}
                  placeholder='/icon.svg or https://...'
                  {...form.getInputProps('preloader_logo')}
                />

                <Group grow align='flex-start'>
                  <ColorField
                    label={tExt('admin.stylings.preloaderBgColor', { defaultValue: 'Background Color' })}
                    {...form.getInputProps('preloader_bg_color')}
                  />

                  <TextInput
                    label={tExt('admin.stylings.preloaderBgImage', { defaultValue: 'Background Image URL' })}
                    placeholder='https://...'
                    {...form.getInputProps('preloader_bg_image')}
                  />
                </Group>
              </>
            )}
          </Stack>
        </div>

      </Stack>
    </>
  );
}

export default StylingsSettings;
