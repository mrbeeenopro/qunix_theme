import React from 'react';
import { Switch, Stack, Group, Select, Textarea, NumberInput, TextInput, Skeleton, Loader } from '@mantine/core';
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
  faLayerGroup,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { qunixThemeSettingsSchema } from '../../lib/schemas.ts';
import { ColorField } from './ColorField.tsx';
import { PreloaderCanvasDemo } from './PreloaderCanvasDemo.tsx';
import { useExtTranslations } from '../../translations.ts';
const getDialogDesignStyles = (accent: string) => [
  {
    value: 'stark',
    label: 'Stark',
    description: 'Seamless flat layout without dividing lines.',
    svg: (
      <svg width='100%' height='80' viewBox='0 0 160 80' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='160' height='80' rx='6' fill='#131123' />
        <rect x='10' y='10' width='140' height='60' rx='4' fill='#161b24' stroke='rgba(255,255,255,0.06)' />
        <rect x='18' y='18' width='42' height='5' rx='2.5' fill='#475569' />
        <rect x='18' y='28' width='108' height='4' rx='2' fill='#334155' />
        <rect x='18' y='36' width='78' height='4' rx='2' fill='#334155' />
        <rect x='92' y='52' width='20' height='10' rx='2.5' fill='#334155' />
        <rect x='118' y='52' width='24' height='10' rx='2.5' fill={accent} />
      </svg>
    ),
  },
  {
    value: 'classic',
    label: 'Classic, with a header and footer',
    description: 'Header and footer borders separating content.',
    svg: (
      <svg width='100%' height='80' viewBox='0 0 160 80' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='160' height='80' rx='6' fill='#131123' />
        <rect x='10' y='10' width='140' height='60' rx='4' fill='#161b24' stroke='rgba(255,255,255,0.06)' />
        <rect x='18' y='16' width='42' height='5' rx='2.5' fill='#475569' />
        <line x1='10' y1='25' x2='150' y2='25' stroke='rgba(255,255,255,0.1)' strokeWidth='1' />
        <rect x='18' y='31' width='108' height='4' rx='2' fill='#334155' />
        <rect x='18' y='38' width='78' height='4' rx='2' fill='#334155' />
        <line x1='10' y1='48' x2='150' y2='48' stroke='rgba(255,255,255,0.1)' strokeWidth='1' />
        <rect x='92' y='53' width='20' height='9' rx='2' fill='#334155' />
        <rect x='118' y='53' width='24' height='9' rx='2' fill={accent} />
      </svg>
    ),
  },
  {
    value: 'accent',
    label: 'Accent header',
    description: 'Colored accent banner bar across the header.',
    svg: (
      <svg width='100%' height='80' viewBox='0 0 160 80' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='160' height='80' rx='6' fill='#131123' />
        <rect x='10' y='10' width='140' height='60' rx='4' fill='#161b24' stroke='rgba(255,255,255,0.06)' />
        <path d='M10 14C10 11.7909 11.7909 10 14 10H146C148.209 10 150 11.7909 150 14V24H10V14Z' fill={accent} fillOpacity='0.4' />
        <rect x='18' y='15' width='42' height='4' rx='2' fill={accent} />
        <rect x='18' y='31' width='108' height='4' rx='2' fill='#334155' />
        <rect x='18' y='38' width='78' height='4' rx='2' fill='#334155' />
        <rect x='92' y='52' width='20' height='10' rx='2.5' fill='#334155' />
        <rect x='118' y='52' width='24' height='10' rx='2.5' fill={accent} />
      </svg>
    ),
  },
  {
    value: 'glass',
    label: 'Glass',
    description: 'Frosted translucent backdrop with glow.',
    svg: (
      <svg width='100%' height='80' viewBox='0 0 160 80' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='160' height='80' rx='6' fill='#131123' />
        <rect x='10' y='10' width='140' height='60' rx='4' fill='rgba(255,255,255,0.06)' stroke='rgba(255,255,255,0.22)' strokeWidth='1' />
        <rect x='18' y='18' width='42' height='5' rx='2.5' fill='#64748b' />
        <rect x='18' y='28' width='108' height='4' rx='2' fill='#475569' />
        <rect x='18' y='36' width='78' height='4' rx='2' fill='#475569' />
        <rect x='92' y='52' width='20' height='10' rx='2.5' fill='#334155' />
        <rect x='118' y='52' width='24' height='10' rx='2.5' fill={accent} />
      </svg>
    ),
  },
];

const getCardBorderStyles = (accent: string) => [
  {
    value: 'none',
    label: 'None',
    description: 'No border stroke around cards.',
    svg: (
      <svg width='100%' height='64' viewBox='0 0 160 64' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='160' height='64' rx='6' fill='#131123' />
        <rect x='10' y='9' width='140' height='46' rx='4' fill='#161b24' />
        <rect x='18' y='18' width='56' height='4' rx='2' fill='#475569' />
        <rect x='18' y='27' width='112' height='3.5' rx='1.75' fill='#334155' />
        <rect x='18' y='34' width='82' height='3.5' rx='1.75' fill='#334155' />
      </svg>
    ),
  },
  {
    value: 'subtle',
    label: 'Subtle',
    description: 'A hairline around each card.',
    svg: (
      <svg width='100%' height='64' viewBox='0 0 160 64' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='160' height='64' rx='6' fill='#131123' />
        <rect x='10' y='9' width='140' height='46' rx='4' fill='#161b24' stroke='rgba(255,255,255,0.14)' strokeWidth='1' />
        <rect x='18' y='18' width='56' height='4' rx='2' fill='#475569' />
        <rect x='18' y='27' width='112' height='3.5' rx='1.75' fill='#334155' />
        <rect x='18' y='34' width='82' height='3.5' rx='1.75' fill='#334155' />
      </svg>
    ),
  },
  {
    value: 'strong',
    label: 'Strong',
    description: 'Strong contrast border outline.',
    svg: (
      <svg width='100%' height='64' viewBox='0 0 160 64' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='160' height='64' rx='6' fill='#131123' />
        <rect x='10' y='9' width='140' height='46' rx='4' fill='#161b24' stroke='rgba(255,255,255,0.45)' strokeWidth='1.5' />
        <rect x='18' y='18' width='56' height='4' rx='2' fill='#475569' />
        <rect x='18' y='27' width='112' height='3.5' rx='1.75' fill='#334155' />
        <rect x='18' y='34' width='82' height='3.5' rx='1.75' fill='#334155' />
      </svg>
    ),
  },
  {
    value: 'accent',
    label: 'Accent',
    description: 'Accent colored border around each card.',
    svg: (
      <svg width='100%' height='64' viewBox='0 0 160 64' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='160' height='64' rx='6' fill='#131123' />
        <rect x='10' y='9' width='140' height='46' rx='4' fill='#161b24' stroke={accent} strokeWidth='1.5' />
        <rect x='18' y='18' width='56' height='4' rx='2' fill='#475569' />
        <rect x='18' y='27' width='112' height='3.5' rx='1.75' fill='#334155' />
        <rect x='18' y='34' width='82' height='3.5' rx='1.75' fill='#334155' />
      </svg>
    ),
  },
];

const GLOBAL_CARD_STYLES = [
  {
    value: 'none',
    label: 'Flat Solid',
    description: 'Flat card surface without overlays.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#131123' stroke='rgba(255,255,255,0.1)' strokeWidth='1' />
        <rect x='8' y='8' width='20' height='20' rx='4' fill='#1e222d' />
        <rect x='34' y='10' width='36' height='6' rx='2' fill='#e2e8f0' />
        <rect x='34' y='20' width='24' height='5' rx='2' fill='#71717a' />
        <rect x='8' y='36' width='64' height='16' rx='4' fill='#161922' stroke='rgba(255,255,255,0.06)' />
      </svg>
    ),
  },
  {
    value: 'subtle-fade',
    label: 'Subtle Fade',
    description: 'Subtle diagonal card tint.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='url(#global-card-grad-subtle)' stroke='rgba(255,255,255,0.12)' strokeWidth='1' />
        <rect x='8' y='8' width='20' height='20' rx='4' fill='rgba(108,92,231,0.2)' stroke='rgba(108,92,231,0.4)' />
        <rect x='34' y='10' width='36' height='6' rx='2' fill='#e2e8f0' />
        <rect x='34' y='20' width='24' height='5' rx='2' fill='#71717a' />
        <rect x='8' y='36' width='64' height='16' rx='4' fill='url(#global-card-grad-subtle-inner)' stroke='rgba(255,255,255,0.08)' />
        <defs>
          <linearGradient id='global-card-grad-subtle' x1='0' y1='0' x2='80' y2='60' gradientUnits='userSpaceOnUse'>
            <stop stopColor='#272936' />
            <stop offset='1' stopColor='#12131a' />
          </linearGradient>
          <linearGradient id='global-card-grad-subtle-inner' x1='0' y1='0' x2='64' y2='16' gradientUnits='userSpaceOnUse'>
            <stop stopColor='rgba(255,255,255,0.08)' />
            <stop offset='1' stopColor='rgba(255,255,255,0.02)' />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    value: 'top-accent',
    label: 'Top Accent',
    description: 'Top edge accent line.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='url(#global-card-grad-top)' stroke='rgba(255,255,255,0.1)' strokeWidth='1' />
        <line x1='6' y1='1' x2='74' y2='1' stroke='rgba(255,255,255,0.35)' strokeWidth='1.5' strokeLinecap='round' />
        <rect x='8' y='10' width='20' height='20' rx='4' fill='rgba(255,255,255,0.06)' />
        <rect x='34' y='12' width='36' height='6' rx='2' fill='#e2e8f0' />
        <rect x='34' y='22' width='24' height='5' rx='2' fill='#71717a' />
        <rect x='8' y='38' width='64' height='14' rx='3' fill='rgba(255,255,255,0.03)' />
        <defs>
          <linearGradient id='global-card-grad-top' x1='40' y1='0' x2='40' y2='60' gradientUnits='userSpaceOnUse'>
            <stop stopColor='#252632' />
            <stop offset='0.5' stopColor='#14151c' />
            <stop offset='1' stopColor='#0e0f14' />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    value: 'glass',
    label: 'Frosted Glass',
    description: 'Translucent glass effect.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='url(#global-card-grad-glass)' stroke='rgba(255,255,255,0.2)' strokeWidth='1.2' />
        <rect x='8' y='8' width='64' height='20' rx='4' fill='rgba(255,255,255,0.08)' stroke='rgba(255,255,255,0.1)' />
        <circle cx='18' cy='18' r='3.5' fill='#a29bfe' />
        <rect x='26' y='15' width='28' height='6' rx='2' fill='#ffffff' fillOpacity='0.8' />
        <rect x='8' y='34' width='64' height='18' rx='4' fill='rgba(255,255,255,0.05)' stroke='rgba(255,255,255,0.08)' />
        <defs>
          <linearGradient id='global-card-grad-glass' x1='0' y1='0' x2='80' y2='60' gradientUnits='userSpaceOnUse'>
            <stop stopColor='#252136' />
            <stop offset='1' stopColor='#13121d' />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    value: 'border-only',
    label: 'Border Outline',
    description: 'Clean border with dark fill.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#0d0e12' stroke='rgba(255,255,255,0.22)' strokeWidth='1.5' />
        <rect x='8' y='8' width='20' height='20' rx='4' fill='none' stroke='rgba(255,255,255,0.2)' strokeWidth='1' />
        <rect x='34' y='10' width='36' height='6' rx='2' fill='#e2e8f0' />
        <rect x='34' y='20' width='24' height='5' rx='2' fill='#71717a' />
        <rect x='8' y='36' width='64' height='16' rx='4' fill='none' stroke='rgba(255,255,255,0.14)' strokeWidth='1' />
      </svg>
    ),
  },
  {
    value: 'glow-rim',
    label: 'Accent Rim',
    description: 'Accent border highlight.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#14131d' stroke='#6c5ce7' strokeWidth='1.5' />
        <rect x='8' y='8' width='20' height='20' rx='4' fill='rgba(108,92,231,0.25)' />
        <rect x='34' y='10' width='36' height='6' rx='2' fill='#e2e8f0' />
        <rect x='34' y='20' width='24' height='5' rx='2' fill='#a29bfe' />
        <rect x='8' y='36' width='64' height='16' rx='4' fill='#1b1928' stroke='rgba(108,92,231,0.3)' />
      </svg>
    ),
  },
];

const SERVER_GRID_STYLES = [
  {
    value: 'default',
    label: 'Calagopus Default',
    description: 'Classic standard grid cards without overrides.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#1b1b22' stroke='rgba(255,255,255,0.08)' strokeWidth='1.2' />
        {/* Left vertical status stripe */}
        <rect x='0' y='0' width='3.5' height='60' rx='1' fill='#ff4757' />
        {/* Status icon & title */}
        <circle cx='11' cy='14' r='3' fill='rgba(255,255,255,0.2)' stroke='rgba(255,255,255,0.4)' strokeWidth='0.8' />
        <rect x='17' y='11.5' width='24' height='5.5' rx='1.5' fill='rgba(255,255,255,0.85)' />
        {/* User badge & Allocation pill */}
        <circle cx='46' cy='14' r='1.5' fill='#ffa502' />
        <rect x='51' y='10' width='20' height='8' rx='2.5' fill='rgba(255,255,255,0.06)' stroke='rgba(255,255,255,0.12)' strokeWidth='0.8' />
        <circle cx='75' cy='14' r='1.5' fill='rgba(255,255,255,0.4)' />
        {/* Divider line */}
        <line x1='6' y1='25' x2='76' y2='25' stroke='rgba(255,255,255,0.08)' strokeWidth='1' />
        {/* 3 Metric counters */}
        <rect x='9' y='34' width='18' height='8' rx='1.5' fill='rgba(255,255,255,0.04)' />
        <rect x='31' y='34' width='18' height='8' rx='1.5' fill='rgba(255,255,255,0.04)' />
        <rect x='53' y='34' width='18' height='8' rx='1.5' fill='rgba(255,255,255,0.04)' />
      </svg>
    ),
  },
  {
    value: 'modern-bento',
    label: 'Modern Bento',
    description: 'Clean stacked widgets with high-tech accents.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='7' fill='#161420' stroke='rgba(255,255,255,0.1)' strokeWidth='1.5' />
        <rect x='8' y='8' width='40' height='7' rx='2' fill='#e2e8f0' />
        <circle cx='70' cy='11.5' r='3.5' fill='#2ed573' />
        <rect x='8' y='20' width='64' height='16' rx='4' fill='#201c2e' stroke='rgba(255,255,255,0.06)' />
        <rect x='13' y='25' width='14' height='6' rx='1' fill='#6c5ce7' />
        <rect x='33' y='25' width='14' height='6' rx='1' fill='#a29bfe' fillOpacity='0.5' />
        <rect x='53' y='25' width='14' height='6' rx='1' fill='rgba(255,255,255,0.1)' />
        <rect x='8' y='41' width='30' height='11' rx='3' fill='rgba(255,255,255,0.06)' />
        <rect x='42' y='41' width='30' height='11' rx='3' fill='rgba(108,92,231,0.2)' />
      </svg>
    ),
  },
  {
    value: 'minimal-clean',
    label: 'Minimal Clean',
    description: 'Monochrome and ultra-sleek crisp lines.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='3' fill='#0d0f14' stroke='rgba(255,255,255,0.08)' strokeWidth='1' />
        <rect x='8' y='10' width='32' height='5' fill='rgba(255,255,255,0.7)' />
        <circle cx='68' cy='12.5' r='2.5' fill='rgba(255,255,255,0.4)' />
        <line x1='8' y1='22' x2='72' y2='22' stroke='rgba(255,255,255,0.06)' strokeWidth='1' />
        <rect x='8' y='28' width='20' height='12' fill='rgba(255,255,255,0.03)' stroke='rgba(255,255,255,0.06)' />
        <rect x='30' y='28' width='20' height='12' fill='rgba(255,255,255,0.03)' stroke='rgba(255,255,255,0.06)' />
        <rect x='52' y='28' width='20' height='12' fill='rgba(255,255,255,0.03)' stroke='rgba(255,255,255,0.06)' />
      </svg>
    ),
  },
  {
    value: 'glass-depth',
    label: 'Glass Depth',
    description: 'Frosted layering & translucent glass chips.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='9' fill='url(#grid-glass-grad)' stroke='rgba(255,255,255,0.2)' strokeWidth='1.5' />
        <rect x='8' y='8' width='64' height='16' rx='5' fill='rgba(255,255,255,0.08)' stroke='rgba(255,255,255,0.1)' />
        <circle cx='16' cy='16' r='3' fill='#a29bfe' />
        <rect x='24' y='13' width='28' height='6' rx='2' fill='#ffffff' fillOpacity='0.8' />
        <rect x='8' y='30' width='64' height='22' rx='5' fill='rgba(255,255,255,0.05)' stroke='rgba(255,255,255,0.08)' />
        <defs>
          <linearGradient id='grid-glass-grad' x1='0' y1='0' x2='80' y2='60' gradientUnits='userSpaceOnUse'>
            <stop stopColor='#252136' />
            <stop offset='1' stopColor='#13121d' />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    value: 'compact-dense',
    label: 'Compact Dense',
    description: 'High-density overview cards for many servers.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='4' fill='#15151c' stroke='rgba(255,255,255,0.08)' strokeWidth='1' />
        <circle cx='10' cy='10' r='2.5' fill='#2ed573' />
        <rect x='16' y='8' width='36' height='4' rx='1' fill='rgba(255,255,255,0.8)' />
        <rect x='8' y='18' width='64' height='18' rx='2' fill='rgba(255,255,255,0.04)' />
        <rect x='8' y='40' width='64' height='14' rx='2' fill='rgba(255,255,255,0.03)' />
      </svg>
    ),
  },
];

const SERVER_LIST_STYLES = [
  {
    value: 'default',
    label: 'Calagopus Default',
    description: 'Classic standard list row with clean borders.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#131123' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
        <rect x='4' y='7' width='72' height='18' rx='4' fill='#161025' stroke='rgba(255,255,255,0.06)' />
        <circle cx='10' cy='16' r='2.5' fill='#2ed573' />
        <rect x='16' y='13' width='24' height='6' rx='2' fill='rgba(255,255,255,0.6)' />
        <rect x='52' y='13' width='20' height='6' rx='2' fill='rgba(255,255,255,0.2)' />
        <rect x='4' y='33' width='72' height='18' rx='4' fill='#161025' stroke='rgba(255,255,255,0.06)' />
        <circle cx='10' cy='42' r='2.5' fill='#747d8c' />
        <rect x='16' y='39' width='24' height='6' rx='2' fill='rgba(255,255,255,0.3)' />
        <rect x='52' y='39' width='20' height='6' rx='2' fill='rgba(255,255,255,0.1)' />
      </svg>
    ),
  },
  {
    value: 'modern-compact',
    label: 'Modern Compact',
    description: 'High-density sleek row with compact badges.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#141418' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
        <rect x='4' y='6' width='72' height='13' rx='2' fill='#1c1c24' stroke='rgba(255,255,255,0.05)' />
        <circle cx='9' cy='12.5' r='2' fill='#2ed573' />
        <rect x='15' y='10.5' width='24' height='4' rx='1' fill='#e2e8f0' />
        <rect x='54' y='10.5' width='18' height='4' rx='2' fill='#6c5ce7' fillOpacity='0.5' />
        <rect x='4' y='23' width='72' height='13' rx='2' fill='#1c1c24' stroke='rgba(255,255,255,0.05)' />
        <circle cx='9' cy='29.5' r='2' fill='#2ed573' />
        <rect x='15' y='27.5' width='24' height='4' rx='1' fill='#e2e8f0' />
        <rect x='4' y='40' width='72' height='13' rx='2' fill='#1c1c24' stroke='rgba(255,255,255,0.05)' />
        <circle cx='9' cy='46.5' r='2' fill='#747d8c' />
        <rect x='15' y='44.5' width='24' height='4' rx='1' fill='rgba(255,255,255,0.4)' />
      </svg>
    ),
  },
  {
    value: 'glass-row',
    label: 'Glassmorphism Row',
    description: 'Frosted blur backdrop with subtle translucent border.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#1a162b' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
        <rect x='4' y='8' width='72' height='20' rx='6' fill='rgba(255,255,255,0.08)' stroke='rgba(255,255,255,0.15)' />
        <circle cx='13' cy='18' r='3' fill='#a29bfe' />
        <rect x='20' y='15' width='26' height='6' rx='2' fill='#ffffff' fillOpacity='0.85' />
        <rect x='54' y='15' width='18' height='6' rx='3' fill='rgba(108,92,231,0.4)' />
        <rect x='4' y='32' width='72' height='20' rx='6' fill='rgba(255,255,255,0.04)' stroke='rgba(255,255,255,0.1)' />
        <circle cx='13' cy='42' r='3' fill='rgba(255,255,255,0.3)' />
        <rect x='20' y='39' width='26' height='6' rx='2' fill='rgba(255,255,255,0.5)' />
      </svg>
    ),
  },
  {
    value: 'card-row',
    label: 'Floating Card Row',
    description: 'Elevated floating cards with soft depth separation.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#0e0e13' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
        <rect x='5' y='6' width='70' height='21' rx='5' fill='#1b1b24' stroke='rgba(255,255,255,0.1)' />
        <circle cx='14' cy='16.5' r='3' fill='#2ed573' />
        <rect x='21' y='13.5' width='24' height='6' rx='2' fill='#e2e8f0' />
        <rect x='53' y='13.5' width='18' height='6' rx='2' fill='rgba(255,255,255,0.1)' />
        <rect x='5' y='32' width='70' height='21' rx='5' fill='#1b1b24' stroke='rgba(255,255,255,0.1)' />
        <circle cx='14' cy='42.5' r='3' fill='#747d8c' />
        <rect x='21' y='39.5' width='24' height='6' rx='2' fill='rgba(255,255,255,0.5)' />
      </svg>
    ),
  },
];

const LOADER_STYLES = [
  {
    value: 'skeleton',
    label: 'Skeleton',
    description: 'Clean placeholder blocks while content loads.',
    renderSvg: () => (
      <div style={{ width: '80px', height: '60px', background: '#15141d', borderRadius: '6px', border: '1.5px solid rgba(255,255,255,0.06)', padding: '10px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
        <Skeleton height={6} width='50%' radius='sm' />
        <Skeleton height={12} width='100%' radius='sm' />
        <Skeleton height={12} width='100%' radius='sm' />
      </div>
    ),
  },
  {
    value: 'spinner',
    label: 'Animated Spinner',
    description: 'Rotating circular spinner with custom color.',
    renderSvg: (color: string) => (
      <div style={{ width: '80px', height: '60px', background: '#15141d', borderRadius: '6px', border: '1.5px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
        <Loader size={26} color={color || '#6c5ce7'} />
      </div>
    ),
  },
];

const SPINNER_SHAPE_OPTIONS = [
  {
    value: 'oval',
    label: 'Circular Oval',
    renderSvg: (color: string) => (
      <div style={{ width: '36px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader size={18} type='oval' color={color || '#6c5ce7'} />
      </div>
    ),
  },
  {
    value: 'bars',
    label: 'Equalizer Bars',
    renderSvg: (color: string) => (
      <div style={{ width: '36px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader size={18} type='bars' color={color || '#6c5ce7'} />
      </div>
    ),
  },
  {
    value: 'dots',
    label: 'Pulsing Dots',
    renderSvg: (color: string) => (
      <div style={{ width: '36px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader size={18} type='dots' color={color || '#6c5ce7'} />
      </div>
    ),
  },
];

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
    label: 'Accent Fade In',
    description: 'Smooth entrance with subtle accent highlight.',
    icon: faSun,
  },
  {
    value: 'none',
    label: 'None (Instant)',
    description: 'Zero animation for instant, lightning-fast rendering.',
    icon: faBan,
  },
];

const COMPONENT_OVERLAY_STYLES = [
  {
    value: 'fade',
    label: 'Shader Fade',
    desc: 'Default smooth gradient',
    svg: (
      <svg width='72' height='48' viewBox='0 0 72 48' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='72' height='48' rx='6' fill='#131123' stroke='rgba(255,255,255,0.08)' strokeWidth='1' />
        <path d='M20 38 L36 20 L52 38 Z' fill='#4834d4' opacity='0.45' />
        <path d='M38 38 L50 24 L64 38 Z' fill='#686de0' opacity='0.4' />
        <circle cx='54' cy='16' r='6' fill='#f0932b' opacity='0.6' />
        <rect width='72' height='48' rx='6' fill='url(#ovl-fade-grad)' />
        <circle cx='10' cy='14' r='2.5' fill='#2ed573' />
        <rect x='16' y='12' width='22' height='4' rx='1' fill='#ffffff' fillOpacity='0.85' />
        <rect x='10' y='28' width='16' height='3' rx='1' fill='rgba(255,255,255,0.4)' />
        <defs>
          <linearGradient id='ovl-fade-grad' x1='0' y1='0' x2='72' y2='0' gradientUnits='userSpaceOnUse'>
            <stop stopColor='#0b0c16' stopOpacity='0.95' />
            <stop offset='0.5' stopColor='#0b0c16' stopOpacity='0.55' />
            <stop offset='1' stopColor='#0b0c16' stopOpacity='0.08' />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    value: 'glass',
    label: 'Frosted Glass',
    desc: 'Backdrop blur & tint',
    svg: (
      <svg width='72' height='48' viewBox='0 0 72 48' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='72' height='48' rx='6' fill='#131123' stroke='rgba(255,255,255,0.08)' strokeWidth='1' />
        <circle cx='36' cy='24' r='16' fill='#6c5ce7' opacity='0.5' />
        <circle cx='52' cy='16' r='10' fill='#0984e3' opacity='0.45' />
        <rect x='3' y='3' width='66' height='42' rx='5' fill='rgba(255,255,255,0.08)' stroke='rgba(255,255,255,0.22)' strokeWidth='1' />
        <line x1='6' y1='6' x2='26' y2='6' stroke='rgba(255,255,255,0.4)' strokeWidth='1' strokeLinecap='round' />
        <circle cx='12' cy='16' r='2.5' fill='#a29bfe' />
        <rect x='18' y='14' width='24' height='4' rx='1' fill='#ffffff' />
        <rect x='12' y='28' width='20' height='3' rx='1' fill='rgba(255,255,255,0.45)' />
      </svg>
    ),
  },
  {
    value: 'solid',
    label: 'Solid Shield',
    desc: 'High opacity dark',
    svg: (
      <svg width='72' height='48' viewBox='0 0 72 48' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='72' height='48' rx='6' fill='#131123' stroke='rgba(255,255,255,0.08)' strokeWidth='1' />
        <circle cx='52' cy='22' r='14' fill='#e056fd' opacity='0.35' />
        <rect width='72' height='48' rx='6' fill='#0d0e14' fillOpacity='0.88' stroke='rgba(255,255,255,0.06)' strokeWidth='1' />
        <circle cx='10' cy='14' r='2.5' fill='#2ed573' />
        <rect x='16' y='12' width='26' height='4' rx='1' fill='#ffffff' />
        <rect x='10' y='24' width='44' height='3' rx='1' fill='rgba(255,255,255,0.35)' />
        <rect x='10' y='32' width='30' height='3' rx='1' fill='rgba(255,255,255,0.2)' />
      </svg>
    ),
  },
  {
    value: 'radial',
    label: 'Radial Accent',
    desc: 'Soft centered focus',
    svg: (
      <svg width='72' height='48' viewBox='0 0 72 48' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='72' height='48' rx='6' fill='#131123' stroke='rgba(255,255,255,0.08)' strokeWidth='1' />
        <ellipse cx='48' cy='24' rx='28' ry='20' fill='url(#ovl-radial-glow)' />
        <circle cx='10' cy='14' r='2.5' fill='#2ed573' />
        <rect x='16' y='12' width='22' height='4' rx='1' fill='#ffffff' />
        <rect x='10' y='28' width='28' height='3' rx='1' fill='rgba(255,255,255,0.45)' />
        <defs>
          <radialGradient id='ovl-radial-glow' cx='50%' cy='50%' r='50%'>
            <stop stopColor='#6c5ce7' stopOpacity='0.25' />
            <stop offset='1' stopColor='#6c5ce7' stopOpacity='0' />
          </radialGradient>
        </defs>
      </svg>
    ),
  },
  {
    value: 'none',
    label: 'None (Raw)',
    desc: 'Direct image without tint',
    svg: (
      <svg width='72' height='48' viewBox='0 0 72 48' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='72' height='48' rx='6' fill='url(#ovl-raw-vivid)' stroke='rgba(255,255,255,0.15)' strokeWidth='1' />
        <path d='M10 40 L30 18 L52 40 Z' fill='#00cec9' opacity='0.7' />
        <path d='M36 40 L50 24 L68 40 Z' fill='#0984e3' opacity='0.8' />
        <circle cx='54' cy='14' r='5' fill='#ffeaa7' />
        <rect x='8' y='8' width='22' height='6' rx='2' fill='rgba(0,0,0,0.55)' />
        <rect x='10' y='10' width='18' height='2.5' rx='1' fill='#ffffff' />
        <defs>
          <linearGradient id='ovl-raw-vivid' x1='0' y1='0' x2='72' y2='48' gradientUnits='userSpaceOnUse'>
            <stop stopColor='#2d3436' />
            <stop offset='1' stopColor='#1e272e' />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
];

const BUTTON_STYLES = [
  {
    value: 'filled',
    label: 'Filled',
    desc: 'Solid theme color fill',
    svg: (
      <svg width='64' height='32' viewBox='0 0 64 32' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect x='4' y='5' width='56' height='22' rx='5' fill='#6c5ce7' />
        <rect x='18' y='13' width='28' height='6' rx='2' fill='#ffffff' />
      </svg>
    ),
  },
  {
    value: 'outline',
    label: 'Outline',
    desc: 'Clean outline',
    svg: (
      <svg width='64' height='32' viewBox='0 0 64 32' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect x='4' y='5' width='56' height='22' rx='5' fill='rgba(108,92,231,0.06)' stroke='#6c5ce7' strokeWidth='1.5' />
        <rect x='18' y='13' width='28' height='6' rx='2' fill='#a29bfe' />
      </svg>
    ),
  },
];

const INPUT_STYLES = [
  {
    value: 'filled',
    label: 'Filled',
    desc: 'Solid dark surface',
    svg: (
      <svg width='64' height='32' viewBox='0 0 64 32' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect x='4' y='5' width='56' height='22' rx='4' fill='#1b1928' stroke='rgba(255,255,255,0.08)' strokeWidth='1' />
        <line x1='12' y1='10' x2='12' y2='22' stroke='#6c5ce7' strokeWidth='1.2' />
        <rect x='17' y='13' width='26' height='5' rx='1.5' fill='rgba(255,255,255,0.45)' />
      </svg>
    ),
  },
  {
    value: 'outline',
    label: 'Outline',
    desc: 'Clean border & transparent',
    svg: (
      <svg width='64' height='32' viewBox='0 0 64 32' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect x='4' y='5' width='56' height='22' rx='4' fill='transparent' stroke='#6c5ce7' strokeWidth='1.5' />
        <line x1='12' y1='10' x2='12' y2='22' stroke='#6c5ce7' strokeWidth='1.2' />
        <rect x='17' y='13' width='26' height='5' rx='1.5' fill='rgba(255,255,255,0.65)' />
      </svg>
    ),
  },
];

const SWITCH_STYLES = [
  {
    value: 'pill',
    label: 'Pill',
    desc: 'Rounded',
    svg: (
      <svg width='54' height='28' viewBox='0 0 54 28' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect x='7' y='6' width='40' height='16' rx='8' fill='#6c5ce7' />
        <circle cx='37' cy='14' r='6' fill='#ffffff' filter='drop-shadow(0 1px 2px rgba(0,0,0,0.35))' />
      </svg>
    ),
  },
  {
    value: 'square',
    label: 'Square',
    desc: 'Geometric',
    svg: (
      <svg width='54' height='28' viewBox='0 0 54 28' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect x='7' y='6' width='40' height='16' rx='2' fill='#6c5ce7' />
        <rect x='31' y='8' width='12' height='12' rx='1' fill='#ffffff' />
      </svg>
    ),
  },
  {
    value: 'glow',
    label: 'Accent',
    desc: 'Accent border',
    svg: (
      <svg width='54' height='28' viewBox='0 0 54 28' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect x='7' y='6' width='40' height='16' rx='8' fill='#1b1928' stroke='#6c5ce7' strokeWidth='1.5' />
        <circle cx='37' cy='14' r='6' fill='#a29bfe' />
      </svg>
    ),
  },
];

const ICON_STYLES = [
  {
    value: 'default',
    label: 'Default',
    desc: 'Standard',
    svg: (
      <svg width='54' height='28' viewBox='0 0 54 28' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect x='18' y='6' width='18' height='4' rx='1' fill='#a29bfe' />
        <rect x='18' y='12' width='18' height='4' rx='1' fill='#a29bfe' />
        <rect x='18' y='18' width='18' height='4' rx='1' fill='#a29bfe' />
        <circle cx='32' cy='8' r='1' fill='#2ed573' />
        <circle cx='32' cy='14' r='1' fill='#2ed573' />
        <circle cx='32' cy='20' r='1' fill='#2ed573' />
      </svg>
    ),
  },
  {
    value: 'badge',
    label: 'Badge',
    desc: 'Framed',
    svg: (
      <svg width='54' height='28' viewBox='0 0 54 28' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect x='14' y='3' width='26' height='22' rx='5' fill='#201c2e' stroke='#6c5ce7' strokeWidth='1.2' />
        <rect x='19' y='7' width='16' height='3.5' rx='1' fill='#e2e8f0' />
        <rect x='19' y='12' width='16' height='3.5' rx='1' fill='#e2e8f0' />
        <rect x='19' y='17' width='16' height='3.5' rx='1' fill='#e2e8f0' />
      </svg>
    ),
  },
  {
    value: 'minimal',
    label: 'Minimal',
    desc: 'Muted',
    svg: (
      <svg width='54' height='28' viewBox='0 0 54 28' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect x='18' y='6' width='18' height='3.5' rx='1' fill='rgba(255,255,255,0.35)' />
        <rect x='18' y='12' width='18' height='3.5' rx='1' fill='rgba(255,255,255,0.35)' />
        <rect x='18' y='18' width='18' height='3.5' rx='1' fill='rgba(255,255,255,0.35)' />
      </svg>
    ),
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
    label: 'Accent Fade In',
    description: 'Smooth entrance with subtle accent highlight.',
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
    label: 'Accent Border',
    description: 'Highlights hovered items with theme accent border.',
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
  const popupAccent = form.values.dialog_accent_color || form.values.button_color || form.values.focus_color || '#6c5ce7';
  const themeAccent = form.values.button_color || form.values.focus_color || '#6c5ce7';
  const cardBgUnselected = '#131123';
  const cardBorderUnselected = '1px solid #1e2430';
  const cardBgSelected = `color-mix(in srgb, ${themeAccent} 14%, transparent)`;
  const cardBorderSelected = `2px solid ${themeAccent}`;
  const accentTextColor = `color-mix(in srgb, ${themeAccent} 80%, white)`;
  const dialogDesignStyles = getDialogDesignStyles(popupAccent);
  const cardBorderStyles = getCardBorderStyles(themeAccent);
  return (
    <>
      <Stack gap="md">
        {/* 1. Popup Styles */}
        <div>
          <div style={{ marginBottom: '10px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', display: 'block' }}>
              Popup styles
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginTop: '3px' }}>
              How every pop-up dialog is laid out: confirmations, renames, upload conflicts and the rest.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {dialogDesignStyles.map((item) => {
              const isSelected = (form.values.dialog_design || 'stark') === item.value;
              return (
                <div
                  key={item.value}
                  onClick={() => {
                    form.setFieldValue('dialog_design', item.value);
                    (window as any).qunixThemeSettings = {
                      ...((window as any).qunixThemeSettings || {}),
                      ...form.values,
                      dialog_design: item.value,
                    };
                    const root = document.documentElement;
                    if (root) {
                      root.setAttribute('data-dialog-design', item.value);
                      root.style.setProperty('--ds-dialog-accent-color', popupAccent);
                      root.style.setProperty('--ds-button-color', form.values.button_color || '#6c5ce7');
                    }
                  }}
                  style={{
                    background: isSelected ? `color-mix(in srgb, ${themeAccent} 12%, transparent)` : '#0c1017',
                    border: isSelected ? `2px solid ${themeAccent}` : '1px solid #1e2430',
                    borderRadius: '8px',
                    padding: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ width: '100%', overflow: 'hidden', borderRadius: '4px' }}>
                    {item.svg}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isSelected && (
                      <FontAwesomeIcon icon={faCheck} style={{ color: themeAccent, fontSize: '11px' }} />
                    )}
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: isSelected ? 600 : 500,
                        color: isSelected ? '#f8fafc' : '#94a3b8',
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Color customization option for Popup Header Accent */}
          {form.values.dialog_design === 'accent' && (
            <div
              style={{
                marginTop: '12px',
                background: '#0a0a0c',
                border: '1px solid #1c1c21',
                borderRadius: '8px',
                padding: '12px',
              }}
            >
              <ColorField
                label='Popup Header Accent Color'
                description='Custom color for popup banner headers. Defaults to your active theme button color if left blank.'
                value={form.values.dialog_accent_color || ''}
                onChange={(val) => {
                  form.setFieldValue('dialog_accent_color', val);
                  (window as any).qunixThemeSettings = {
                    ...((window as any).qunixThemeSettings || {}),
                    ...form.values,
                    dialog_accent_color: val,
                  };
                  const root = document.documentElement;
                  if (root) {
                    root.style.setProperty(
                      '--ds-dialog-accent-color',
                      val || form.values.button_color || '#6c5ce7',
                    );
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* 2. Card Border (Image 3) */}
        <div>
          <div style={{ marginBottom: '10px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', display: 'block' }}>
              Card border
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginTop: '3px' }}>
              A hairline around each card.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {cardBorderStyles.map((item) => {
              const isSelected = (form.values.card_border || 'subtle') === item.value;
              return (
                <div
                  key={item.value}
                  onClick={() => {
                    form.setFieldValue('card_border', item.value);
                    (window as any).qunixThemeSettings = {
                      ...((window as any).qunixThemeSettings || {}),
                      ...form.values,
                      card_border: item.value,
                    };
                    const root = document.documentElement;
                    if (root) root.setAttribute('data-card-border', item.value);
                  }}
                  style={{
                    background: isSelected ? `color-mix(in srgb, ${themeAccent} 12%, transparent)` : '#0c1017',
                    border: isSelected ? `2px solid ${themeAccent}` : '1px solid #1e2430',
                    borderRadius: '8px',
                    padding: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ width: '100%', overflow: 'hidden', borderRadius: '4px' }}>
                    {item.svg}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isSelected && (
                      <FontAwesomeIcon icon={faCheck} style={{ color: themeAccent, fontSize: '11px' }} />
                    )}
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: isSelected ? 600 : 500,
                        color: isSelected ? '#f8fafc' : '#94a3b8',
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Card Surfaces & Shader Fade */}
        <div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 'bold',
              display: 'block',
              color: accentTextColor,
              marginBottom: '4px',
            }}
          >
            <FontAwesomeIcon icon={faLayerGroup} style={{ marginRight: '6px' }} />
            Global Card Surfaces & Shader Fade
          </span>

          <Stack gap='sm' mt='xs'>
            <Switch
              label='Disable Card Shader Fade (Pure Solid Background)'
              checked={(form.values.global_card_style || 'subtle-fade') === 'none'}
              onChange={(e) =>
                form.setFieldValue(
                  'global_card_style',
                  e.currentTarget.checked ? 'none' : 'subtle-fade',
                )
              }
              styles={{
                label: { color: '#e4e4e7', fontSize: '11px', fontWeight: 600 },
              }}
            />

            {/* Visual Global Card Style Selector */}
            <div style={{ marginTop: '4px', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'block',
                  color: '#e4e4e7',
                  marginBottom: '4px',
                }}
              >
                Global Card Style
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {GLOBAL_CARD_STYLES.map((style) => {
                  const isSelected = (form.values.global_card_style || 'subtle-fade') === style.value;
                  return (
                    <div
                      key={style.value}
                      onClick={() => form.setFieldValue('global_card_style', style.value)}
                      style={{
                        background: isSelected ? cardBgSelected : cardBgUnselected,
                        border: isSelected ? cardBorderSelected : cardBorderUnselected,
                        borderRadius: '8px',
                        padding: '10px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                        boxShadow: 'none',
                      }}
                    >
                      <div style={{ transform: 'scale(0.85)', margin: '-4px 0' }}>{style.svg}</div>
                      <div style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: isSelected ? accentTextColor : '#e4e4e7',
                          }}
                        >
                          {style.label}
                        </div>
                        <div
                          style={{
                            fontSize: '9px',
                            color: '#71717a',
                            marginTop: '2px',
                            lineHeight: '1.2',
                          }}
                        >
                          {style.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Component Overlay Style Selector */}
            <div style={{ marginTop: '12px', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'block',
                  color: '#e4e4e7',
                  marginBottom: '4px',
                }}
              >
                Component Overlay Style (Banner & Surface Tint)
              </span>
              <span style={{ fontSize: '10px', color: '#71717a', display: 'block', marginBottom: '8px' }}>
                Replaces the hardcoded fade overlay with your preferred shader, frosted glass, or raw surface.
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                {COMPONENT_OVERLAY_STYLES.map((opt) => {
                  const isSelected = (form.values.component_overlay_style || 'fade') === opt.value;
                  return (
                    <div
                      key={opt.value}
                      onClick={() => form.setFieldValue('component_overlay_style', opt.value)}
                      style={{
                        background: isSelected ? cardBgSelected : cardBgUnselected,
                        border: isSelected ? cardBorderSelected : cardBorderUnselected,
                        borderRadius: '8px',
                        padding: '10px 6px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ transform: 'scale(0.85)', margin: '-2px 0' }}>{opt.svg}</div>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: isSelected ? accentTextColor : '#e4e4e7' }}>
                          {opt.label}
                        </div>
                        <div style={{ fontSize: '9px', color: '#71717a', marginTop: '2px', lineHeight: '1.2' }}>
                          {opt.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>


            {/* Per-Component Styling Options: Button, Input, Switch, Icon */}
            <div style={{ marginTop: '12px', borderTop: '1px solid #1c1c21', paddingTop: '12px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'block',
                  color: '#e4e4e7',
                  marginBottom: '10px',
                }}
              >
                Individual Component Styles (Buttons, Inputs, Switches, Icons)
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '12px' }}>
                {/* Button Style */}
                <div style={{ background: '#0a0a0c', border: cardBorderUnselected, borderRadius: '8px', padding: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: accentTextColor, display: 'block', marginBottom: '6px' }}>
                    Button Style
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {BUTTON_STYLES.map((opt) => {
                      const isSel = (form.values.button_style || 'filled') === opt.value;
                      return (
                        <div
                          key={opt.value}
                          onClick={() => form.setFieldValue('button_style', opt.value)}
                          style={{
                            background: isSel ? cardBgSelected : '#141418',
                            border: isSel ? cardBorderSelected : '1px solid #27272a',
                            borderRadius: '6px',
                            padding: '8px 6px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                            textAlign: 'center',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ transform: 'scale(0.9)', margin: '-2px 0' }}>{opt.svg}</div>
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: isSel ? accentTextColor : '#e4e4e7' }}>
                              {opt.label}
                            </div>
                            <div style={{ fontSize: '9px', color: '#71717a', marginTop: '2px' }}>{opt.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Input Style */}
                <div style={{ background: '#0a0a0c', border: cardBorderUnselected, borderRadius: '8px', padding: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: accentTextColor, display: 'block', marginBottom: '6px' }}>
                    Input Style
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {INPUT_STYLES.map((opt) => {
                      const isSel = (form.values.input_style || 'filled') === opt.value;
                      return (
                        <div
                          key={opt.value}
                          onClick={() => form.setFieldValue('input_style', opt.value)}
                          style={{
                            background: isSel ? cardBgSelected : '#141418',
                            border: isSel ? cardBorderSelected : '1px solid #27272a',
                            borderRadius: '6px',
                            padding: '8px 6px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                            textAlign: 'center',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ transform: 'scale(0.9)', margin: '-2px 0' }}>{opt.svg}</div>
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: isSel ? accentTextColor : '#e4e4e7' }}>
                              {opt.label}
                            </div>
                            <div style={{ fontSize: '9px', color: '#71717a', marginTop: '2px' }}>{opt.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {/* Switch Style */}
                <div style={{ background: '#0a0a0c', border: cardBorderUnselected, borderRadius: '8px', padding: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: accentTextColor, display: 'block', marginBottom: '6px' }}>
                    Switch Style
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {SWITCH_STYLES.map((opt) => {
                      const isSel = (form.values.switch_style || 'pill') === opt.value;
                      return (
                        <div
                          key={opt.value}
                          onClick={() => form.setFieldValue('switch_style', opt.value)}
                          style={{
                            background: isSel ? cardBgSelected : '#141418',
                            border: isSel ? cardBorderSelected : '1px solid #27272a',
                            borderRadius: '6px',
                            padding: '8px 4px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                            textAlign: 'center',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ transform: 'scale(0.85)', margin: '-2px 0' }}>{opt.svg}</div>
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: isSel ? accentTextColor : '#e4e4e7' }}>
                              {opt.label}
                            </div>
                            <div style={{ fontSize: '9px', color: '#71717a', marginTop: '2px' }}>{opt.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Icon Style */}
                <div style={{ background: '#0a0a0c', border: cardBorderUnselected, borderRadius: '8px', padding: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: accentTextColor, display: 'block', marginBottom: '6px' }}>
                    Icon Style
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {ICON_STYLES.map((opt) => {
                      const isSel = (form.values.icon_style || 'default') === opt.value;
                      return (
                        <div
                          key={opt.value}
                          onClick={() => form.setFieldValue('icon_style', opt.value)}
                          style={{
                            background: isSel ? cardBgSelected : '#141418',
                            border: isSel ? cardBorderSelected : '1px solid #27272a',
                            borderRadius: '6px',
                            padding: '8px 4px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                            textAlign: 'center',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ transform: 'scale(0.85)', margin: '-2px 0' }}>{opt.svg}</div>
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: isSel ? accentTextColor : '#e4e4e7' }}>
                              {opt.label}
                            </div>
                            <div style={{ fontSize: '9px', color: '#71717a', marginTop: '2px' }}>{opt.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </Stack>
        </div>

        {/* Dashboard List/Grid Layout Settings */}
        <div style={{ borderTop: '1px solid #111114', paddingTop: '16px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 'bold',
              display: 'block',
              color: accentTextColor,
              marginBottom: '4px',
            }}
          >
            <FontAwesomeIcon icon={faSliders} style={{ marginRight: '6px' }} />
            Dashboard List & Grid Views
          </span>
          <Stack gap='sm' mt='xs'>
            <Switch
              label='Enable Server Dashboard Page (Route / with Console at /console)'
              checked={form.values.enable_server_dashboard !== false}
              onChange={(e) => form.setFieldValue('enable_server_dashboard', e.currentTarget.checked)}
              styles={{
                label: { color: '#e4e4e7', fontSize: '11px', fontWeight: 600 },
              }}
            />

            <Switch
              label='Enable Modern Flat UI'
              checked={form.values.enable_flat_design !== false}
              onChange={(e) => form.setFieldValue('enable_flat_design', e.currentTarget.checked)}
              styles={{
                label: { color: '#e4e4e7', fontSize: '11px', fontWeight: 600 },
              }}
            />

            {/* Visual Server Grid Card Style Selector */}
            <div style={{ marginTop: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'block',
                  color: '#e4e4e7',
                  marginBottom: '4px',
                }}
              >
                Server Grid Card Style
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {SERVER_GRID_STYLES.map((style) => {
                  const isSelected = (form.values.server_grid_style || 'default') === style.value;
                  return (
                    <div
                      key={style.value}
                      onClick={() => form.setFieldValue('server_grid_style', style.value)}
                      style={{
                        background: isSelected ? cardBgSelected : cardBgUnselected,
                        border: isSelected ? cardBorderSelected : cardBorderUnselected,
                        borderRadius: '8px',
                        padding: '10px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                        boxShadow: 'none',
                      }}
                    >
                      <div style={{ transform: 'scale(0.85)', margin: '-4px 0' }}>{style.svg}</div>
                      <div style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: isSelected ? accentTextColor : '#e4e4e7',
                          }}
                        >
                          {style.label}
                        </div>
                        <div
                          style={{
                            fontSize: '9px',
                            color: '#71717a',
                            marginTop: '2px',
                            lineHeight: '1.2',
                          }}
                        >
                          {style.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visual Server List Row Style Selector */}
            <div style={{ marginTop: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'block',
                  color: '#e4e4e7',
                  marginBottom: '4px',
                }}
              >
                Server List Row Style
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {SERVER_LIST_STYLES.map((style) => {
                  const isSelected = (form.values.server_list_style || 'default') === style.value;
                  return (
                    <div
                      key={style.value}
                      onClick={() => form.setFieldValue('server_list_style', style.value)}
                      style={{
                        background: isSelected ? cardBgSelected : cardBgUnselected,
                        border: isSelected ? cardBorderSelected : cardBorderUnselected,
                        borderRadius: '8px',
                        padding: '10px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                        boxShadow: 'none',
                      }}
                    >
                      <div style={{ transform: 'scale(0.85)', margin: '-4px 0' }}>{style.svg}</div>
                      <div style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: isSelected ? accentTextColor : '#e4e4e7',
                          }}
                        >
                          {style.label}
                        </div>
                        <div
                          style={{
                            fontSize: '9px',
                            color: '#71717a',
                            marginTop: '2px',
                            lineHeight: '1.2',
                          }}
                        >
                          {style.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Select
              label='Mobile Server Grid Card Layout'
              comboboxProps={{ withinPortal: true, zIndex: 10000 }}
              data={[
                { value: 'compact', label: 'Compact Row Card (Recommended for Phones)' },
                { value: 'grid', label: 'Stacked Bento Card' },
                { value: 'minimal', label: 'Minimal One-line Card' },
              ]}
              value={form.values.server_grid_mobile_layout || 'compact'}
              onChange={(val) => form.setFieldValue('server_grid_mobile_layout', val || 'compact')}
              styles={{
                input: { background: '#141418', border: '1px solid #27272a', color: '#e4e4e7' },
                dropdown: { background: '#141418', border: '1px solid #27272a' },
                option: { color: '#e4e4e7' },
              }}
            />


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
              color: accentTextColor,
              marginBottom: '4px',
            }}
          >
            <FontAwesomeIcon icon={faMagic} />
            Global Card Entrance Animation
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px' }}>
            {CARD_ANIMATION_OPTIONS.map((item) => {
              const isSelected = (form.values.card_animation || 'slide-up') === item.value;
              return (
                <div
                  key={item.value}
                  onClick={() => form.setFieldValue('card_animation', item.value)}
                  style={{
                    background: isSelected ? cardBgSelected : cardBgUnselected,
                    border: isSelected ? cardBorderSelected : cardBorderUnselected,
                    borderRadius: '8px',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    transition: 'all 0.15s ease',
                    boxShadow: 'none',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: isSelected ? themeAccent : '#1e1e26',
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
                    <div style={{ fontSize: '11px', fontWeight: 600, color: isSelected ? accentTextColor : '#e4e4e7' }}>
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
                color: accentTextColor,
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
                      background: isSelected ? cardBgSelected : cardBgUnselected,
                      border: isSelected ? cardBorderSelected : cardBorderUnselected,
                      borderRadius: '8px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      transition: 'all 0.15s ease',
                      boxShadow: 'none',
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: isSelected ? themeAccent : '#1e1e26',
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
                      <div style={{ fontSize: '11px', fontWeight: 600, color: isSelected ? accentTextColor : '#e4e4e7' }}>
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
                color: accentTextColor,
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
                      background: isSelected ? cardBgSelected : cardBgUnselected,
                      border: isSelected ? cardBorderSelected : cardBorderUnselected,
                      borderRadius: '8px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      transition: 'all 0.15s ease',
                      boxShadow: 'none',
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: isSelected ? themeAccent : '#1e1e26',
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
                      <div style={{ fontSize: '11px', fontWeight: 600, color: isSelected ? accentTextColor : '#e4e4e7' }}>
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

        {/* 3. Page & Component Content Loaders */}
        <div style={{ borderTop: '1px solid #111114', paddingTop: '16px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 'bold',
              display: 'block',
              color: accentTextColor,
              marginBottom: '4px',
            }}
          >
            <FontAwesomeIcon icon={faSpinner} style={{ marginRight: '6px' }} />
            Page & Component Content Loaders
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
            Choose between shimmering skeleton placeholder blocks or classic animated spinners during data loading.
          </span>

          {/* Visual Loader Style Selector (Skeleton vs Spinner) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '12px' }}>
            {LOADER_STYLES.map((item) => {
              const isSkeletonActive = form.values.enable_skeleton_loader !== false;
              const isSelected = item.value === 'skeleton' ? isSkeletonActive : !isSkeletonActive;
              const activeColor = form.values.spinner_color || themeAccent;
              return (
                <div
                  key={item.value}
                  onClick={() => form.setFieldValue('enable_skeleton_loader', item.value === 'skeleton')}
                  style={{
                    background: isSelected ? cardBgSelected : cardBgUnselected,
                    border: isSelected ? cardBorderSelected : cardBorderUnselected,
                    borderRadius: '8px',
                    padding: '12px 10px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease',
                    boxShadow: 'none',
                  }}
                >
                  <div style={{ transform: 'scale(0.9)', margin: '-4px 0' }}>
                    {item.renderSvg(activeColor)}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: isSelected ? accentTextColor : '#e4e4e7',
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: '9.5px',
                        color: '#71717a',
                        marginTop: '2px',
                        lineHeight: '1.25',
                      }}
                    >
                      {item.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Spinner Options when Spinner is active */}
          {form.values.enable_skeleton_loader === false && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: cardBorderUnselected,
                borderRadius: '8px',
                padding: '12px',
                marginTop: '6px',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#e4e4e7',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                Spinner Animation Shape
              </span>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  marginBottom: '12px',
                }}
              >
                {SPINNER_SHAPE_OPTIONS.map((shape) => {
                  const isSelected = (form.values.spinner_type || 'oval') === shape.value;
                  const activeColor = form.values.spinner_color || themeAccent;
                  return (
                    <div
                      key={shape.value}
                      onClick={() => form.setFieldValue('spinner_type', shape.value)}
                      style={{
                        background: isSelected ? cardBgSelected : cardBgUnselected,
                        border: isSelected ? cardBorderSelected : cardBorderUnselected,
                        borderRadius: '6px',
                        padding: '8px 6px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {shape.renderSvg(activeColor)}
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          color: isSelected ? accentTextColor : '#a1a1aa',
                        }}
                      >
                        {shape.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <ColorField
                label='Spinner Accent Color'
                {...form.getInputProps('spinner_color')}
              />
            </div>
          )}
        </div>
        {/* 4. Preloader & Boot Screen */}
        <div style={{ borderTop: '1px solid #111114', paddingTop: '16px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 'bold',
              display: 'block',
              color: accentTextColor,
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
                  color={form.values.preloader_color || themeAccent}
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
