import { Stack, TextInput, ColorInput } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { z } from 'zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowMaximize, faSliders, faLink, faImage, faFillDrip } from '@fortawesome/free-solid-svg-icons';
import { qunixThemeSettingsSchema } from '../../lib/schemas.ts';

const LOGIN_LAYOUTS = [
  {
    value: 'default',
    label: 'Default',
    description: 'Centered form on plain dark theme backdrop.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#1e1631' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
        <rect x='25' y='12' width='30' height='36' rx='3' fill='#161025' />
        <rect x='30' y='18' width='20' height='4' rx='1' fill='rgba(255,255,255,0.2)' />
        <rect x='30' y='26' width='20' height='4' rx='1' fill='rgba(255,255,255,0.2)' />
        <rect x='30' y='34' width='20' height='6' rx='1.5' fill='#6c5ce7' />
      </svg>
    ),
  },
  {
    value: 'flat',
    label: 'Flat',
    description: 'Clean borderless input form without structural cards.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#1e1631' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
        <rect x='30' y='18' width='20' height='4' rx='1' fill='rgba(255,255,255,0.2)' />
        <rect x='30' y='26' width='20' height='4' rx='1' fill='rgba(255,255,255,0.2)' />
        <rect x='30' y='34' width='20' height='6' rx='1.5' fill='#6c5ce7' />
      </svg>
    ),
  },
  {
    value: 'side-banner',
    label: 'Side Banner',
    description: 'Split dashboard screen: Form on left, Banner on right.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#1e1631' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
        <rect x='4' y='4' width='34' height='52' rx='2' fill='#161025' />
        <rect x='10' y='18' width='22' height='4' rx='1' fill='rgba(255,255,255,0.2)' />
        <rect x='10' y='26' width='22' height='4' rx='1' fill='rgba(255,255,255,0.2)' />
        <rect x='10' y='34' width='22' height='6' rx='1.5' fill='#6c5ce7' />
        <rect x='42' y='4' width='34' height='52' rx='2' fill='#6c5ce7' fillOpacity='0.4' />
      </svg>
    ),
  },
  {
    value: 'side-banner-inverted',
    label: 'Side Banner Inverted',
    description: 'Split dashboard screen: Form on right, Banner on left.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#1e1631' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
        <rect x='42' y='4' width='34' height='52' rx='2' fill='#161025' />
        <rect x='48' y='18' width='22' height='4' rx='1' fill='rgba(255,255,255,0.2)' />
        <rect x='48' y='26' width='22' height='4' rx='1' fill='rgba(255,255,255,0.2)' />
        <rect x='48' y='34' width='22' height='6' rx='1.5' fill='#6c5ce7' />
        <rect x='4' y='4' width='34' height='52' rx='2' fill='#6c5ce7' fillOpacity='0.4' />
      </svg>
    ),
  },
  {
    value: 'floating-banner',
    label: 'Floating Banner',
    description: 'Form and banner placed side by side inside a single card.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#1e1631' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
        <rect x='12' y='12' width='56' height='36' rx='4' fill='#161025' stroke='rgba(255,255,255,0.08)' strokeWidth='1' />
        <rect x='16' y='18' width='20' height='4' rx='1' fill='rgba(255,255,255,0.2)' />
        <rect x='16' y='26' width='20' height='4' rx='1' fill='rgba(255,255,255,0.2)' />
        <rect x='16' y='34' width='20' height='6' rx='1.5' fill='#6c5ce7' />
        <rect x='40' y='16' width='24' height='28' rx='2' fill='#6c5ce7' fillOpacity='0.4' />
      </svg>
    ),
  },
  {
    value: 'panels',
    label: 'Panels',
    description: 'Separate detached panels for login form and banner visual.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#1e1631' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
        <rect x='10' y='12' width='26' height='36' rx='3' fill='#161025' />
        <rect x='14' y='18' width='18' height='4' rx='1' fill='rgba(255,255,255,0.2)' />
        <rect x='14' y='26' width='18' height='4' rx='1' fill='rgba(255,255,255,0.2)' />
        <rect x='14' y='34' width='18' height='6' rx='1.5' fill='#6c5ce7' />
        <rect x='42' y='12' width='28' height='36' rx='3' fill='#6c5ce7' fillOpacity='0.4' />
      </svg>
    ),
  },
];

const LOGO_POSITIONS = [
  {
    value: 'header',
    label: 'Header',
    description: 'Logo floats top-left.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#1e1631' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
        <rect x='6' y='6' width='6' height='6' rx='1.5' fill='#6c5ce7' />
        <rect x='25' y='16' width='30' height='32' rx='3' fill='#161025' />
      </svg>
    ),
  },
  {
    value: 'above-form',
    label: 'Above Form',
    description: 'Logo is centered directly above the login block.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#1e1631' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
        <rect x='36' y='8' width='8' height='8' rx='2' fill='#6c5ce7' />
        <rect x='25' y='20' width='30' height='28' rx='3' fill='#161025' />
      </svg>
    ),
  },
];

const SUPPORT_POSITIONS = [
  {
    value: 'header',
    label: 'Header',
    description: 'Support link floats top-right.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#1e1631' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
        <rect x='66' y='6' width='8' height='4' rx='1' fill='#6c5ce7' />
        <rect x='25' y='16' width='30' height='32' rx='3' fill='#161025' />
      </svg>
    ),
  },
  {
    value: 'above-form',
    label: 'Above Form',
    description: 'Support link is centered below the login card.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#1e1631' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
        <rect x='25' y='12' width='30' height='28' rx='3' fill='#161025' />
        <rect x='34' y='46' width='12' height='4' rx='1' fill='#6c5ce7' />
      </svg>
    ),
  },
];

interface LoginLayoutSettingsProps {
  form: UseFormReturnType<z.infer<typeof qunixThemeSettingsSchema>>;
}

export function LoginLayoutSettings({ form }: LoginLayoutSettingsProps) {
  return (
    <Stack gap='md'>
      {/* 1. Login Layout Mode */}
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
          <FontAwesomeIcon icon={faSliders} style={{ marginRight: '6px' }} />
          Login Layout
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
          {LOGIN_LAYOUTS.map((layout) => {
            const isSelected = (form.values.login_layout || 'default') === layout.value;
            return (
              <div
                key={layout.value}
                onClick={() => form.setFieldValue('login_layout', layout.value)}
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

      {/* 2. Logo Position */}
      <div style={{ borderTop: '1px solid #111114', paddingTop: '16px', marginTop: '8px' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'block',
            color: '#a29bfe',
            marginBottom: '12px',
          }}
        >
          <FontAwesomeIcon icon={faWindowMaximize} style={{ marginRight: '6px' }} />
          Logo Position
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
          {LOGO_POSITIONS.map((pos) => {
            const isSelected = (form.values.login_logo_position || 'above-form') === pos.value;
            return (
              <div
                key={pos.value}
                onClick={() => form.setFieldValue('login_logo_position', pos.value)}
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
                <div style={{ transform: 'scale(0.85)', margin: '-4px 0' }}>{pos.svg}</div>
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{ fontSize: '10px', fontWeight: 600, color: isSelected ? '#a29bfe' : '#e2e8f0' }}
                  >
                    {pos.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Support Links Position */}
      <div style={{ borderTop: '1px solid #111114', paddingTop: '16px', marginTop: '8px' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'block',
            color: '#a29bfe',
            marginBottom: '12px',
          }}
        >
          <FontAwesomeIcon icon={faLink} style={{ marginRight: '6px' }} />
          Support Links Position
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
          {SUPPORT_POSITIONS.map((pos) => {
            const isSelected = (form.values.login_support_position || 'above-form') === pos.value;
            return (
              <div
                key={pos.value}
                onClick={() => form.setFieldValue('login_support_position', pos.value)}
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
                <div style={{ transform: 'scale(0.85)', margin: '-4px 0' }}>{pos.svg}</div>
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{ fontSize: '10px', fontWeight: 600, color: isSelected ? '#a29bfe' : '#e2e8f0' }}
                  >
                    {pos.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Support URL & Banner inputs */}
      <div style={{ borderTop: '1px solid #111114', paddingTop: '16px', marginTop: '8px' }}>
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
          Assets & URLs
        </span>
        <Stack gap='sm'>
          <TextInput
            label='Custom Login Page Background Image URL'
            description='Full screen background image displayed behind auth/login pages.'
            placeholder='https://example.com/login-wallpaper.jpg'
            {...form.getInputProps('login_background_image')}
            styles={{
              input: { background: '#141418', border: '1px solid #27272a', color: '#e4e4e7' },
              label: { color: '#e4e4e7' },
              description: { color: '#a1a1aa' },
            }}
          />
          <ColorInput
            label='Custom Login Page Background Color'
            description='Custom background color for auth/login pages (defaults to main theme background).'
            placeholder='#070708'
            {...form.getInputProps('login_background_color')}
            format='hex'
            swatches={['#070708', '#0a0a0c', '#141418', '#0f172a', '#1e1b4b', '#18181b', '#000000']}
            styles={{
              input: { background: '#141418', border: '1px solid #27272a', color: '#e4e4e7' },
              label: { color: '#e4e4e7' },
              description: { color: '#a1a1aa' },
            }}
          />
          <TextInput
            label='Custom Login Banner URL'
            description='Background or split banner image used in Side, Floating and Panel banner modes.'
            placeholder='https://example.com/banner.jpg'
            {...form.getInputProps('login_banner_image')}
            styles={{
              input: { background: '#141418', border: '1px solid #27272a', color: '#e4e4e7' },
              label: { color: '#e4e4e7' },
              description: { color: '#a1a1aa' },
            }}
          />
          <TextInput
            label='Support / Contact URL'
            description='Link to your Discord, support portal or custom website shown on the login page.'
            placeholder='https://discord.gg/yourserver'
            {...form.getInputProps('login_support_link')}
            styles={{
              input: { background: '#141418', border: '1px solid #27272a', color: '#e4e4e7' },
              label: { color: '#e4e4e7' },
              description: { color: '#a1a1aa' },
            }}
          />
        </Stack>
      </div>
    </Stack>
  );
}

export default LoginLayoutSettings;
