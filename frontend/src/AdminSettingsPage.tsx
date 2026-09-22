import React, { useEffect, useState, useRef } from 'react';
import './styles/admin/layout.css';
import './styles/admin/inputs.css';
import './styles/admin/popover.css';
import {
  Stack,
  Group,
  NumberInput,
  TextInput,
  Switch,
  Tabs,
  FileButton,
  useComputedColorScheme,
  ScrollArea,
  Select,
} from '@mantine/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPalette,
  faCogs,
  faWindowMaximize,
  faImage,
  faArrowLeft,
  faSave,
  faUpload,
  faDownload,
  faRotateLeft,
  faBullhorn,
  faRoute,
  faSliders,
  faBolt,
  faTerminal,
  faChartLine,
  faRuler,
  faColumns,
  faMagic,
  faSquare,
  faFont,
  faFolder,
  faLink,
  faDatabase,
  faShareNodes,
} from '@fortawesome/free-solid-svg-icons';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router';
import { httpErrorToHuman, axiosInstance } from '@/api/axios.ts';
import getAllEggs from '@/api/admin/nests/getAllEggs.ts';
import Button from '@/elements/buttons/Button.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import { qunixThemeSettingsSchema } from './lib/schemas.ts';
import { ColorsSettings } from './components/settings/ColorsSettings';
import { LayoutSettings } from './components/settings/LayoutSettings';
import { StylingsSettings } from './components/settings/StylingsSettings';
import { SidebarSettings } from './components/settings/SidebarSettings';
import { BannersSettings } from './components/settings/BannersSettings';
import { AnnouncementSettings } from './components/settings/AnnouncementSettings';
import { AdvancedSettings } from './components/settings/AdvancedSettings';
import { hslToHex } from './components/settings/colorUtils';
import { LoginLayoutSettings } from './components/settings/LoginLayoutSettings';
import { EmbedSettings } from './components/settings/EmbedSettings';
import { useExtTranslations } from './translations.ts';

const HOVER_STYLES = [
  {
    value: 'none',
    label: 'Default',
    description: 'Use the standard panel hover style without overrides.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#1e1631' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
        <rect x='5' y='5' width='20' height='50' rx='3' fill='#161025' />
        <rect x='8' y='10' width='14' height='6' rx='2' fill='rgba(255,255,255,0.2)' />
        <rect x='8' y='20' width='14' height='6' rx='2' fill='rgba(255,255,255,0.4)' />
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
        <rect x='8' y='10' width='14' height='6' rx='2' fill='rgba(255,255,255,0.2)' />
        <rect x='8' y='20' width='14' height='6' rx='2' fill='url(#style1-grad-admin)' />
        <line x1='22' y1='20' x2='22' y2='26' stroke='#6c5ce7' strokeWidth='1.5' strokeLinecap='round' />
        <rect x='8' y='30' width='14' height='6' rx='2' fill='rgba(255,255,255,0.2)' />

        <defs>
          <linearGradient id='style1-grad-admin' x1='8' y1='20' x2='22' y2='20' gradientUnits='userSpaceOnUse'>
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
        <rect x='8' y='10' width='14' height='6' rx='2' fill='rgba(255,255,255,0.2)' />
        <rect x='8' y='20' width='14' height='6' rx='3' fill='rgba(255,255,255,0.05)' />
        <line x1='6.5' y1='21.5' x2='6.5' y2='24.5' stroke='#6c5ce7' strokeWidth='1.5' strokeLinecap='round' />
        <rect x='10' y='20' width='10' height='6' rx='1' fill='#6c5ce7' fillOpacity='0.8' />
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
        <rect x='8' y='10' width='14' height='6' rx='2' fill='rgba(255,255,255,0.2)' />
        <rect x='9' y='20' width='12' height='6' rx='3' fill='#6c5ce7' fillOpacity='0.9' />
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
        <rect x='8' y='10' width='14' height='6' rx='2' fill='rgba(255,255,255,0.2)' />
        <rect x='5' y='20' width='20' height='6' fill='#6c5ce7' fillOpacity='0.8' />
        <rect x='8' y='30' width='14' height='6' rx='2' fill='rgba(255,255,255,0.2)' />
      </svg>
    ),
  },
];

export default function AdminSettingsPage() {
  const { addToast } = useToast();
  const { t: tExt } = useExtTranslations();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [nests, setNests] = useState<any[]>([]);
  const [extensions, setExtensions] = useState<any[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromPath = (pathname: string) => {
    if (pathname.includes('/advanced')) return 'advanced';
    if (pathname.includes('/layout')) return 'layout';
    if (pathname.includes('/stylings')) return 'stylings';
    if (pathname.includes('/sidebar')) return 'sidebar';
    if (pathname.includes('/banners')) return 'banners';
    if (pathname.includes('/announcement')) return 'announcement';
    if (pathname.includes('/login-layout')) return 'login-layout';
    if (pathname.includes('/embed')) return 'embed';
    return 'colors';
  };

  const [activeTab, setActiveTab] = useState<string>(() => getTabFromPath(location.pathname));

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'colors') {
      navigate('/admin/qunix-settings');
    } else {
      navigate(`/admin/qunix-settings/${tabId}`);
    }
  };

  const computedColorScheme = useComputedColorScheme('dark');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const rawInitialValues = {
    background_color: '#070708',
    text_color: '#e2e8f0',
    focus_color: '#070708',
    shadow_opacity: 0.25,
    font_family: 'JetBrains Mono',
    dark_7_color: '#1f1f1f',
    dark_6_color: '#313133',
    mini_card_bg_color: '#242323',
    light_mini_card_bg_color: '#f4f4f6',
    sidebar_color: '#111114',
    card_color: '#121212',
    border_color: 'rgba(184, 184, 184, 0.15)',
    border_radius: 8,
    navbar_color: '#08080a',
    terminal_color: '#1C1F24',
    terminal_text_color: '#FEFEFD',
    input_color: '#212121',
    button_radius: 8,
    input_radius: 8,
    card_radius: 8,
    console_banner_radius: 16,
    navbar_height: 64,
    sidebar_item_gap: 4,
    sidebar_animation: true,
    background_image: '',
    sidebar_blur: 0,
    wallpaper_blur: 0,
    wallpaper_brightness: 1.0,
    glass_transparency: 20,
    editor_color: '#141313',
    editor_text_color: '#e2e8f0',
    listing_color: '#1f1f1f',
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
    egg_banners: {} as Record<string, string>,
    chart_series_1_border: '#22d3ee',
    chart_series_1_fill: 'rgba(14, 116, 144, 0.5)',
    chart_series_2_border: '#facc15',
    chart_series_2_fill: 'rgba(161, 98, 7, 0.5)',
    popup_window_border_color: 'rgba(255, 255, 255, 0.12)',
    quick_actions_bg: '#120f12',
    quick_actions_text_color: '#c0caf5',
    quick_actions_border_color: 'rgba(154, 165, 233, 0.15)',
    chrome_toolbar_color: '#0a0a0d',

    // Light Mode Defaults
    light_background_color: '#f3effa',
    light_text_color: '#1e1631',
    light_focus_color: '#8542f0',
    light_shadow_opacity: 0.08,
    light_dark_7_color: '#ffffff',
    light_dark_6_color: '#ebebeb',
    light_popup_window_border_color: 'rgba(0, 0, 0, 0.12)',
    light_quick_actions_bg: '#f1f3f5',
    light_quick_actions_text_color: '#1a1b26',
    light_quick_actions_border_color: 'rgba(0, 0, 0, 0.12)',
    light_chrome_toolbar_color: '#ffffff',
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
    announcement_info_bg: 'rgba(59, 130, 246, 0.15)',
    announcement_info_border: '#3b82f6',
    announcement_error_bg: 'rgba(239, 68, 68, 0.15)',
    announcement_error_border: '#ef4444',
    announcement_warning_bg: 'rgba(245, 158, 11, 0.15)',
    announcement_warning_border: '#f59e0b',
    announcement_success_bg: 'rgba(16, 185, 129, 0.15)',
    announcement_success_border: '#10b981',
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
    toast_info_color: '#3b82f6',
    toast_success_color: '#10b981',
    toast_warning_color: '#f59e0b',
    toast_error_color: '#ef4444',
    toast_info_bg: 'rgba(59, 130, 246, 0.15)',
    toast_success_bg: 'rgba(16, 185, 129, 0.15)',
    toast_warning_bg: 'rgba(245, 158, 11, 0.15)',
    toast_error_bg: 'rgba(239, 68, 68, 0.15)',
    listing_radius: 12,
    checkbox_radius: 4,
    sidebar_hover_style: 'style-1',
    sidebar_grow_bg: 'rgba(108, 92, 231, 0.18)',
    sidebar_grow_text_color: '#ffffff',
    sidebar_grow_border_color: '#6c5ce7',
    light_sidebar_grow_bg: 'rgba(108, 92, 231, 0.12)',
    light_sidebar_grow_text_color: '#1e1631',
    light_sidebar_grow_border_color: '#6c5ce7',
    sidebar_width: 256,
    sidebar_radius: 6,
    sidebar_active_radius: 6,
    page_title_icon: true,
    spinner_type: 'ClipLoader',
    spinner_color: '#6c5ce7',
    console_style: 'default',
    enable_layout_toggle: true,
    list_layout_chart: 'cpu',
    card_hover_animation: 'shift',
    card_animation: 'slide-up',
    listing_animation: 'inherit',
    grid_banner_style: 'cover',
    list_banner_style: 'right',
    welcome_subtitle: '',
    sidebar_style: 'full',
    sidebar_icons: {} as Record<string, string>,
    sidebar_global_pack: 'default',
    dashboard_layout: 'default',
    hide_sidebar_power_actions: false,
    announcement_display_mode: 'notifications',
    announcement_important_rule: 'important_flag',
    announcement_show_important_as_banner: true,
    embed_title: '',
    embed_description: '',
    embed_color: '#6c5ce7',
    embed_image: '',
    embed_site_name: '',
    dock_position: 'sidebar',
    login_layout: 'default',
    login_logo_position: 'above-form',
    login_support_position: 'above-form',
    login_banner_image: '/login_bg.png',
    login_background_image: '',
    login_background_color: '',
    login_support_link: '',
    enable_preloader: true,
    preloader_delay: 1500,
    preloader_style: 'bar',
    preloader_color: '#7aa2f7',
    preloader_text: 'INITIALIZING PANEL...',
    preloader_bg_color: '#121217',
    preloader_bg_image: '',
    preloader_logo: '',
    privacy_blur: false,
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

  // Force-hide Calagopus layout and style full screen
  useEffect(() => {
    document.body.classList.add('qunix-settings-active');
    return () => {
      document.body.classList.remove('qunix-settings-active');
    };
  }, []);
  useEffect(() => {
    const fetchNestsAndEggs = async () => {
      try {
        const data = await getAllEggs();
        if (Array.isArray(data) && data.length > 0) {
          const hasEggs = data.some((n: any) => n.eggs && n.eggs.length > 0);
          if (hasEggs) {
            setNests(data);
            return;
          }
        }
      } catch (err) {
        console.warn('getAllEggs() threw error, trying fallbacks:', err);
      }

      // Fallback 1: Direct /api/admin/nests/eggs without strict Zod schema validation
      try {
        const rawRes = await axiosInstance.get('/api/admin/nests/eggs');
        if (rawRes.data?.nests && Array.isArray(rawRes.data.nests) && rawRes.data.nests.length > 0) {
          const rawNests = rawRes.data.nests.map((item: any) => ({
            nest: item.nest || item,
            eggs: item.eggs || [],
          }));
          const hasEggs = rawNests.some((n: any) => n.eggs && n.eggs.length > 0);
          if (hasEggs) {
            setNests(rawNests);
            return;
          }
        }
      } catch (err) {
        console.warn('Direct /api/admin/nests/eggs fallback failed:', err);
      }

      // Fallback 2: Query /api/admin/nests, then query /api/admin/nests/{uuid}/eggs for each nest
      try {
        const nestsRes = await axiosInstance.get('/api/admin/nests', { params: { per_page: 100 } });
        const nestList = nestsRes.data?.nests?.data || nestsRes.data?.nests || [];
        const fullNests = await Promise.all(
          nestList.map(async (nest: any) => {
            try {
              const eggsRes = await axiosInstance.get(`/api/admin/nests/${nest.uuid}/eggs`, { params: { per_page: 100 } });
              const eggs = eggsRes.data?.eggs?.data || eggsRes.data?.eggs || [];
              return { nest, eggs };
            } catch {
              return { nest, eggs: [] };
            }
          })
        );
        setNests(fullNests);
      } catch (fallbackErr) {
        console.error('Failed to load nests/eggs via fallback:', fallbackErr);
      }
    };

    fetchNestsAndEggs();

    axiosInstance
      .get('/api/admin/extensions')
      .then((res) => {
        setExtensions(res.data.extensions || []);
      })
      .catch((_err) => { });
  }, []);

  useEffect(() => {
    axiosInstance
      .get('/api/admin/extensions/dev.qunix.theme/settings')
      .then((res) => {
        const s = res.data.settings;
        let localS: any = {};
        try {
          localS = JSON.parse(localStorage.getItem('qunix_theme_settings') || '{}');
        } catch (_) {}
        for (const k in s) {
          if (typeof s[k] === 'string') {
            s[k] = hslToHex(s[k]);
          }
        }
        form.initialize({
          background_color: hslToHex(s.background_color || s.backgroundColor || '#070708'),
          text_color: hslToHex(s.text_color || s.textColor || '#e2e8f0'),
          focus_color: hslToHex(s.focus_color || s.focusColor || '#070708'),
          shadow_opacity:
            s.shadow_opacity !== undefined ? s.shadow_opacity : s.shadowOpacity !== undefined ? s.shadowOpacity : 0.25,
          font_family: s.font_family || s.fontFamily || 'JetBrains Mono',
          terminal_font_family: s.terminal_font_family || s.terminalFontFamily || 'JetBrainsMono Nerd Font',
          sidebar_color: hslToHex(s.sidebar_color || s.sidebarColor || '#111114'),
          card_color: hslToHex(s.card_color || s.cardColor || '#121212'),
          mini_card_bg_color: hslToHex(s.mini_card_bg_color || s.miniCardBgColor || '#242323'),
          light_mini_card_bg_color: hslToHex(s.light_mini_card_bg_color || s.lightMiniCardBgColor || '#f4f4f6'),
          popup_window_border_color: hslToHex(
            s.popup_window_border_color || s.popupWindowBorderColor || 'rgba(255, 255, 255, 0.12)',
          ),
          light_popup_window_border_color: hslToHex(
            s.light_popup_window_border_color || s.lightPopupWindowBorderColor || 'rgba(0, 0, 0, 0.12)',
          ),
          border_color: hslToHex(s.border_color || s.borderColor || 'rgba(184, 184, 184, 0.15)'),
          border_radius:
            s.border_radius !== undefined ? s.border_radius : s.borderRadius !== undefined ? s.borderRadius : 8,
          navbar_color: hslToHex(s.navbar_color || s.navbarColor || '#08080a'),
          terminal_color: hslToHex(s.terminal_color || s.terminalColor || '#1C1F24'),
          terminal_text_color: hslToHex(s.terminal_text_color || s.terminalTextColor || '#FEFEFD'),
          input_color: hslToHex(s.input_color || s.inputColor || '#212121'),
          button_radius:
            s.button_radius !== undefined ? s.button_radius : s.buttonRadius !== undefined ? s.buttonRadius : 8,
          input_radius: s.input_radius !== undefined ? s.input_radius : s.inputRadius !== undefined ? s.inputRadius : 8,
          card_radius: s.card_radius !== undefined ? s.card_radius : s.cardRadius !== undefined ? s.cardRadius : 8,
          console_banner_radius: s.console_banner_radius !== undefined ? s.console_banner_radius : s.consoleBannerRadius !== undefined ? s.consoleBannerRadius : 16,
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
          editor_color: hslToHex(s.editor_color || s.editorColor || '#141313'),
          editor_text_color: hslToHex(s.editor_text_color || s.editorTextColor || '#e2e8f0'),
          dark_7_color: hslToHex(s.dark_7_color || s.dark7Color || '#1f1f1f'),
          dark_6_color: hslToHex(s.dark_6_color || s.dark6Color || '#313133'),
          listing_color: hslToHex(s.listing_color || s.listingColor || '#1f1f1f'),
          button_color: hslToHex(s.button_color || s.buttonColor || '#6c5ce7'),
          server_action_bg: hslToHex(
            s.server_action_bg || s.serverActionBg || s.server_action_color || s.serverActionColor || '#0a0a0a',
          ),
          power_start_bg: hslToHex(s.power_start_bg || s.powerStartBg || '#40c057'),
          power_restart_bg: hslToHex(s.power_restart_bg || s.powerRestartBg || '#868e96'),
          power_stop_bg: hslToHex(s.power_stop_bg || s.powerStopBg || '#fa5252'),
          sidebar_active_color: hslToHex(s.sidebar_active_color || s.sidebarActiveColor || '#6c5ce7'),
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
          chart_series_1_border: hslToHex(s.chart_series_1_border || s.chartSeries1Border || '#22d3ee'),
          chart_series_1_fill: hslToHex(s.chart_series_1_fill || s.chartSeries1Fill || 'rgba(14, 116, 144, 0.5)'),
          chart_series_2_border: hslToHex(s.chart_series_2_border || s.chartSeries2Border || '#facc15'),
          chart_series_2_fill: hslToHex(s.chart_series_2_fill || s.chartSeries2Fill || 'rgba(161, 98, 7, 0.5)'),
          quick_actions_bg: hslToHex(s.quick_actions_bg || s.quickActionsBg || '#120f12'),
          quick_actions_text_color: hslToHex(s.quick_actions_text_color || s.quickActionsTextColor || '#c0caf5'),
          quick_actions_border_color: hslToHex(
            s.quick_actions_border_color || s.quickActionsBorderColor || 'rgba(154, 165, 233, 0.15)',
          ),
          chrome_toolbar_color: hslToHex(s.chrome_toolbar_color || s.chromeToolbarColor || '#0a0a0d'),
          egg_banners: s.egg_banners || s.eggBanners || {},

          // Light Mode Fields
          light_background_color: hslToHex(s.light_background_color || s.lightBackgroundColor || '#f3effa'),
          light_text_color: hslToHex(s.light_text_color || s.lightTextColor || '#1e1631'),
          light_focus_color: hslToHex(s.light_focus_color || s.lightFocusColor || '#8542f0'),
          light_dark_7_color: hslToHex(s.light_dark_7_color || s.lightDark7Color || '#ffffff'),
          light_dark_6_color: hslToHex(s.light_dark_6_color || s.lightDark6Color || '#ebebeb'),
          light_quick_actions_bg: hslToHex(s.light_quick_actions_bg || s.lightQuickActionsBg || '#f1f3f5'),
          light_quick_actions_text_color: hslToHex(
            s.light_quick_actions_text_color || s.lightQuickActionsTextColor || '#1a1b26',
          ),
          light_quick_actions_border_color: hslToHex(
            s.light_quick_actions_border_color || s.lightQuickActionsBorderColor || 'rgba(0, 0, 0, 0.12)',
          ),
          light_chrome_toolbar_color: hslToHex(
            s.light_chrome_toolbar_color || s.lightChromeToolbarColor || '#ffffff',
          ),
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
          announcement_info_bg: hslToHex(s.announcement_info_bg || s.announcementInfoBg || 'rgba(59, 130, 246, 0.15)'),
          announcement_info_border: hslToHex(s.announcement_info_border || s.announcementInfoBorder || '#3b82f6'),
          announcement_error_bg: hslToHex(s.announcement_error_bg || s.announcementErrorBg || 'rgba(239, 68, 68, 0.15)'),
          announcement_error_border: hslToHex(s.announcement_error_border || s.announcementErrorBorder || '#ef4444'),
          announcement_warning_bg: hslToHex(s.announcement_warning_bg || s.announcementWarningBg || 'rgba(245, 158, 11, 0.15)'),
          announcement_warning_border: hslToHex(s.announcement_warning_border || s.announcementWarningBorder || '#f59e0b'),
          announcement_success_bg: hslToHex(s.announcement_success_bg || s.announcementSuccessBg || 'rgba(16, 185, 129, 0.15)'),
          announcement_success_border: hslToHex(s.announcement_success_border || s.announcementSuccessBorder || '#10b981'),
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
          toast_info_color: hslToHex(s.toast_info_color || s.toastInfoColor || '#3b82f6'),
          toast_success_color: hslToHex(s.toast_success_color || s.toastSuccessColor || '#10b981'),
          toast_warning_color: hslToHex(s.toast_warning_color || s.toastWarningColor || '#f59e0b'),
          toast_error_color: hslToHex(s.toast_error_color || s.toastErrorColor || '#ef4444'),
          toast_info_bg: s.toast_info_bg || s.toastInfoBg || 'rgba(59, 130, 246, 0.15)',
          toast_success_bg: s.toast_success_bg || s.toastSuccessBg || 'rgba(16, 185, 129, 0.15)',
          toast_warning_bg: s.toast_warning_bg || s.toastWarningBg || 'rgba(245, 158, 11, 0.15)',
          toast_error_bg: s.toast_error_bg || s.toastErrorBg || 'rgba(239, 68, 68, 0.15)',
          listing_radius:
            s.listing_radius !== undefined ? s.listing_radius : s.listingRadius !== undefined ? s.listingRadius : 12,
          checkbox_radius:
            s.checkbox_radius !== undefined ? s.checkbox_radius : s.checkboxRadius !== undefined ? s.checkboxRadius : 4,
          sidebar_hover_style: s.sidebar_hover_style || s.sidebarHoverStyle || 'style-1',
          sidebar_grow_bg: hslToHex(s.sidebar_grow_bg || s.sidebarGrowBg || 'rgba(108, 92, 231, 0.18)'),
          sidebar_grow_text_color: hslToHex(s.sidebar_grow_text_color || s.sidebarGrowTextColor || '#ffffff'),
          sidebar_grow_border_color: hslToHex(s.sidebar_grow_border_color || s.sidebarGrowBorderColor || '#6c5ce7'),
          light_sidebar_grow_bg: hslToHex(s.light_sidebar_grow_bg || s.lightSidebarGrowBg || 'rgba(108, 92, 231, 0.12)'),
          light_sidebar_grow_text_color: hslToHex(s.light_sidebar_grow_text_color || s.lightSidebarGrowTextColor || '#1e1631'),
          light_sidebar_grow_border_color: hslToHex(s.light_sidebar_grow_border_color || s.lightSidebarGrowBorderColor || '#6c5ce7'),
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
          spinner_type: s.spinner_type || s.spinnerType || 'ClipLoader',
          spinner_color: hslToHex(s.spinner_color || s.spinnerColor || '#6c5ce7'),
          console_style: s.console_style || s.consoleStyle || 'default',
          enable_layout_toggle: s.enable_layout_toggle !== undefined ? s.enable_layout_toggle : s.enableLayoutToggle !== undefined ? s.enableLayoutToggle : true,
          list_layout_chart: s.list_layout_chart || s.listLayoutChart || 'cpu',
          card_hover_animation: s.card_hover_animation || s.cardHoverAnimation || 'shift',
          card_animation: s.card_animation || s.cardAnimation || 'slide-up',
          listing_animation: s.listing_animation || s.listingAnimation || 'inherit',
          grid_banner_style: s.grid_banner_style || s.gridBannerStyle || 'cover',
          list_banner_style: s.list_banner_style || s.listBannerStyle || 'right',
          welcome_subtitle: s.welcome_subtitle || s.welcomeSubtitle || '',
          sidebar_style: s.sidebar_style || s.sidebarStyle || 'full',
          sidebar_icons: s.sidebar_icons || s.sidebarIcons || {},
          sidebar_global_pack: s.sidebar_global_pack || s.sidebarGlobalPack || 'default',
          dashboard_layout: s.dashboard_layout || s.dashboardLayout || 'default',
          hide_sidebar_power_actions: s.hide_sidebar_power_actions !== undefined ? s.hide_sidebar_power_actions : false,
          announcement_display_mode: s.announcement_display_mode || 'notifications',
          announcement_important_rule: s.announcement_important_rule || 'important_flag',
          announcement_show_important_as_banner: s.announcement_show_important_as_banner !== undefined ? s.announcement_show_important_as_banner : true,
          dock_position: s.dock_position || 'sidebar',
          login_layout: s.login_layout || s.loginLayout || 'default',
          login_logo_position: s.login_logo_position || s.loginLogoPosition || 'above-form',
          login_support_position: s.login_support_position || s.loginSupportPosition || 'above-form',
          login_banner_image: s.login_banner_image || s.loginBannerImage || '',
          login_background_image: s.login_background_image || s.loginBackgroundImage || '',
          login_background_color: s.login_background_color || s.loginBackgroundColor || '',
          login_support_link: s.login_support_link || s.loginSupportLink || '',
          embed_title: s.embed_title || '',
          embed_description: s.embed_description || '',
          embed_color: s.embed_color ? hslToHex(s.embed_color) : '#6c5ce7',
          embed_image: s.embed_image || '',
          embed_site_name: s.embed_site_name || '',
          enable_preloader: s.enable_preloader !== undefined ? s.enable_preloader : (localS.enable_preloader !== undefined ? localS.enable_preloader : true),
          preloader_delay: s.preloader_delay !== undefined ? s.preloader_delay : (localS.preloader_delay !== undefined ? localS.preloader_delay : 1500),
          preloader_style: s.preloader_style || localS.preloader_style || 'bar',
          preloader_color: s.preloader_color || localS.preloader_color || '#7aa2f7',
          preloader_text: s.preloader_text !== undefined ? s.preloader_text : (localS.preloader_text !== undefined ? localS.preloader_text : 'INITIALIZING PANEL...'),
          preloader_bg_color: s.preloader_bg_color || s.preloaderBgColor || localS.preloader_bg_color || '#121217',
          preloader_bg_image: s.preloader_bg_image || s.preloaderBgImage || localS.preloader_bg_image || '',
          preloader_logo: s.preloader_logo || s.preloaderLogo || localS.preloader_logo || '',
          privacy_blur: s.privacy_blur !== undefined ? s.privacy_blur : (localS.privacy_blur !== undefined ? localS.privacy_blur : false),
        });
      })
      .catch((err) => addToast(httpErrorToHuman(err), 'error'))
      .finally(() => {
        setInitialLoading(false);
      });
  }, []);

  // Update Iframe Preview in Real-time
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const updateIframeStyles = () => {
      const iframeWindow = iframe.contentWindow;
      const iframeDoc = iframe.contentDocument || iframeWindow?.document;
      if (!iframeDoc) return;

      const s = form.values;
      const isDark = computedColorScheme === 'dark';

      const getThemeVal = (darkVal?: string, lightVal?: string) => {
        return (isDark ? darkVal : lightVal) || '';
      };

      const getThemeValOpt = <T,>(darkVal?: T, lightVal?: T): T | undefined => {
        const v = isDark ? darkVal : lightVal;
        return v !== undefined && v !== null && (v as any) !== '' ? v : undefined;
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
      const sidebarGrowBg = getThemeVal(s.sidebar_grow_bg || '', s.light_sidebar_grow_bg || '');
      const sidebarGrowTextColor = getThemeVal(s.sidebar_grow_text_color || '', s.light_sidebar_grow_text_color || '');
      const sidebarGrowBorderColor = getThemeVal(s.sidebar_grow_border_color || '', s.light_sidebar_grow_border_color || '');
      const backgroundImage = getThemeValOpt(s.background_image, s.light_background_image);
      const shadowOpacity = getThemeValOpt(s.shadow_opacity, s.light_shadow_opacity);
      const chartSeries1Border = getThemeVal(s.chart_series_1_border, s.light_chart_series_1_border);
      const chartSeries1Fill = getThemeVal(s.chart_series_1_fill, s.light_chart_series_1_fill);
      const chartSeries2Border = getThemeVal(s.chart_series_2_border, s.light_chart_series_2_border);
      const chartSeries2Fill = getThemeVal(s.chart_series_2_fill, s.light_chart_series_2_fill);
      const announcementBg = getThemeVal(s.announcement_bg, s.light_announcement_bg);
      const announcementBorder = getThemeVal(s.announcement_border_color, s.light_announcement_border_color);
      const announcementCtaBg = getThemeVal(s.announcement_cta_bg, s.light_announcement_cta_bg);
      const announcementCtaColor = getThemeVal(s.announcement_cta_color, s.light_announcement_cta_color);
      const miniCardBgColor = getThemeVal(s.mini_card_bg_color, s.light_mini_card_bg_color);
      const popupWindowBorderColor = getThemeVal(s.popup_window_border_color, s.light_popup_window_border_color);
      const quickActionsBg = getThemeVal(s.quick_actions_bg, s.light_quick_actions_bg);
      const quickActionsText = getThemeVal(s.quick_actions_text_color, s.light_quick_actions_text_color);
      const quickActionsBorder = getThemeVal(s.quick_actions_border_color, s.light_quick_actions_border_color);

      const root = iframeDoc.documentElement;
      if (!root) return;
      root.setAttribute('data-sidebar-hover-style', s.sidebar_hover_style || 'style-1');

      if (iframeDoc.defaultView) {
        (iframeDoc.defaultView as any).qunixThemeSettings = {
          ...((iframeDoc.defaultView as any).qunixThemeSettings || {}),
          toast_style: s.toast_style,
          toast_timer: s.toast_timer,
          toast_radius: s.toast_radius,
          toast_colored_border: s.toast_colored_border,
          toast_background_tint: s.toast_background_tint,
          page_title_icon: s.page_title_icon,
          sidebar_style: s.sidebar_style,
          sidebar_icons: s.sidebar_icons,
        };
      }

      if (backgroundColor) root.style.setProperty('--ds-background', backgroundColor);
      if (textColor) root.style.setProperty('--ds-gray-900', textColor);
      if (focusColor) root.style.setProperty('--ds-focus-color', focusColor);
      if (dark7Color) root.style.setProperty('--ds-dark-7', dark7Color);
      if (dark6Color) root.style.setProperty('--ds-dark-6', dark6Color);
      if (miniCardBgColor) root.style.setProperty('--ds-mini-card-bg', miniCardBgColor);
      if (popupWindowBorderColor) root.style.setProperty('--ds-popup-window-border-color', popupWindowBorderColor);
      if (quickActionsBg) root.style.setProperty('--ds-quick-actions-bg', quickActionsBg);
      if (quickActionsText) root.style.setProperty('--ds-quick-actions-text', quickActionsText);
      if (quickActionsBorder) root.style.setProperty('--ds-quick-actions-border', quickActionsBorder);
      if (backgroundColor) root.style.setProperty('--mantine-color-body', backgroundColor);
      if (borderColor) root.style.setProperty('--mantine-color-default-border', borderColor);
      if (textColor) root.style.setProperty('--mantine-color-text', textColor);
      if (shadowOpacity !== undefined) {
        root.style.setProperty(
          '--ds-shadow-border',
          `0px 0px 0px 1px ${isDark ? `rgba(255, 255, 255, ${shadowOpacity})` : `rgba(0, 0, 0, ${shadowOpacity})`}`,
        );
      }
      if (sidebarColor) root.style.setProperty('--ds-sidebar-bg', sidebarColor);
      if (sidebarActiveColor) root.style.setProperty('--ds-sidebar-active-color', sidebarActiveColor);
      if (sidebarActiveBg) root.style.setProperty('--ds-sidebar-active-bg', sidebarActiveBg);
      if (sidebarGrowBg) root.style.setProperty('--ds-sidebar-grow-bg', sidebarGrowBg);
      if (sidebarGrowTextColor) root.style.setProperty('--ds-sidebar-grow-text-color', sidebarGrowTextColor);
      if (sidebarGrowBorderColor) root.style.setProperty('--ds-sidebar-grow-border-color', sidebarGrowBorderColor);
      if (s.sidebar_item_height !== undefined)
        root.style.setProperty('--ds-sidebar-item-height', `${s.sidebar_item_height}px`);
      if (cardColor) root.style.setProperty('--ds-card-bg', cardColor);
      if (borderColor) root.style.setProperty('--ds-border-color', borderColor);
      if (s.border_radius !== undefined) root.style.setProperty('--ds-border-radius', `${s.border_radius}px`);
      if (navbarColor) root.style.setProperty('--ds-navbar-bg', navbarColor);
      if (terminalColor) root.style.setProperty('--ds-terminal-bg', terminalColor);
      if (terminalTextColor) root.style.setProperty('--ds-terminal-text', terminalTextColor);
      if (chartSeries1Border) root.style.setProperty('--chart-series-1-border', chartSeries1Border);
      if (chartSeries1Fill) root.style.setProperty('--chart-series-1-fill', chartSeries1Fill);
      if (chartSeries2Border) root.style.setProperty('--chart-series-2-border', chartSeries2Border);
      if (chartSeries2Fill) root.style.setProperty('--chart-series-2-fill', chartSeries2Fill);
      if (inputColor) root.style.setProperty('--ds-input-bg', inputColor);
      if (s.button_radius !== undefined) root.style.setProperty('--ds-button-radius', `${s.button_radius}px`);
      if (s.input_radius !== undefined) root.style.setProperty('--ds-input-radius', `${s.input_radius}px`);
      if (s.card_radius !== undefined) root.style.setProperty('--ds-card-radius', `${s.card_radius}px`);
      if (s.console_banner_radius !== undefined) root.style.setProperty('--ds-console-banner-radius', `${s.console_banner_radius}px`);
      if (s.listing_radius !== undefined) root.style.setProperty('--ds-listing-radius', `${s.listing_radius}px`);
      if (s.checkbox_radius !== undefined) root.style.setProperty('--ds-checkbox-radius', `${s.checkbox_radius}px`);
      if (s.navbar_height !== undefined) root.style.setProperty('--ds-navbar-height', `${s.navbar_height}px`);
      if (s.sidebar_item_gap !== undefined) root.style.setProperty('--ds-sidebar-item-gap', `${s.sidebar_item_gap}px`);
      if (s.sidebar_animation !== undefined)
        root.style.setProperty('--ds-sidebar-animation', s.sidebar_animation ? '1' : '0');
      const isMinimized = s.sidebar_style === 'icons';
      root.setAttribute('data-sidebar-style', s.sidebar_style || 'full');
      root.setAttribute(
        'data-hide-sidebar-power',
        s.hide_sidebar_power_actions ? 'true' : 'false',
      );
      root.setAttribute(
        'data-page-title-icon',
        s.page_title_icon !== false ? 'true' : 'false',
      );
      root.setAttribute('data-dashboard-layout', s.dashboard_layout || 'default');
      root.setAttribute('data-card-animation', s.card_animation || 'slide-up');
      root.setAttribute('data-listing-animation', s.listing_animation || 'inherit');
      const hoverAnimation = s.card_hover_animation || 'shift';
      root.classList.remove('qunix-hover-shift', 'qunix-hover-scale', 'qunix-hover-glow', 'qunix-hover-none');
      root.classList.add(`qunix-hover-${hoverAnimation}`);
      root.setAttribute('data-dock-position', 'sidebar');
      const sidebarWidth = isMinimized ? 72 : (s.sidebar_width !== undefined ? s.sidebar_width : 256);
      root.style.setProperty('--ds-sidebar-width', `${sidebarWidth}px`);
      if (s.sidebar_radius !== undefined) root.style.setProperty('--ds-sidebar-radius', `${s.sidebar_radius}px`);
      if (s.sidebar_active_radius !== undefined)
        root.style.setProperty('--ds-sidebar-active-radius', `${s.sidebar_active_radius}px`);

      if (backgroundImage !== undefined) {
        if (backgroundImage) {
          root.style.setProperty('--ds-background-image', `url(${backgroundImage})`);
          root.classList.add('has-bg-image');
          if (iframeDoc.body) iframeDoc.body.classList.add('has-bg-image');
        } else {
          root.style.setProperty('--ds-background-image', 'none');
          root.classList.remove('has-bg-image');
          if (iframeDoc.body) iframeDoc.body.classList.remove('has-bg-image');
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
      if (announcementBg) root.style.setProperty('--ds-announcement-bg', announcementBg);
      if (s.announcement_blur !== undefined)
        root.style.setProperty('--ds-announcement-blur', `${s.announcement_blur}px`);
      if (announcementBorder) root.style.setProperty('--ds-announcement-border', announcementBorder);
      if (s.announcement_radius !== undefined)
        root.style.setProperty('--ds-announcement-radius', `${s.announcement_radius}px`);
      if (announcementCtaBg) root.style.setProperty('--ds-announcement-cta-bg', announcementCtaBg);
      if (announcementCtaColor) root.style.setProperty('--ds-announcement-cta-color', announcementCtaColor);
      if (s.announcement_cta_radius !== undefined)
        root.style.setProperty('--ds-announcement-cta-radius', `${s.announcement_cta_radius}px`);

      if (s.font_family) {
        const cleanFont = s.font_family.replace(/['"]/g, '').trim();
        const fontStack = `"${cleanFont}", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        root.style.setProperty('--ds-font-family', fontStack);
        root.style.setProperty('--mantine-font-family', fontStack);
        root.style.setProperty('--font-sans', fontStack);
        if (iframeDoc.body) {
          iframeDoc.body.style.fontFamily = fontStack;
        }

        // Synchronize loaded font @font-face style blocks into iframeDoc.head
        document.querySelectorAll('style[id^="qunix-font-"]').forEach((styleEl) => {
          let iframeStyle = iframeDoc.getElementById(styleEl.id);
          if (!iframeStyle) {
            iframeStyle = iframeDoc.createElement('style');
            iframeStyle.id = styleEl.id;
            iframeDoc.head.appendChild(iframeStyle);
          }
          iframeStyle.textContent = styleEl.textContent;
        });

        try {
          (window as any).qunixLoadFont?.(s.font_family, document);
          if (iframeDoc) {
            (window as any).qunixLoadFont?.(s.font_family, iframeDoc);
          }
          if (iframeWindow && (iframeWindow as any).qunixLoadFont) {
            (iframeWindow as any).qunixLoadFont(s.font_family);
          }
        } catch (_) {}
      }
      if (s.terminal_font_family) {
        root.style.setProperty('--ds-terminal-font-family', `"${s.terminal_font_family}", monospace`);
      }

      if (iframeWindow) {
        (iframeWindow as any).qunixThemeSettings = s;
        iframeWindow.dispatchEvent(new CustomEvent('qunix-settings-loaded', { detail: s }));
      }
    };

    updateIframeStyles();

    const handleLoad = () => {
      updateIframeStyles();
    };

    iframe.addEventListener('load', handleLoad);
    return () => {
      iframe.removeEventListener('load', handleLoad);
    };
  }, [form.values, computedColorScheme]);

  // Highlight target region in live preview iframe when selecting/editing a color
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleHighlight = (e: Event) => {
      const detail = (e as CustomEvent).detail as { selector: string; label: string } | null;
      const iframeWindow = iframe.contentWindow;
      const iframeDoc = iframe.contentDocument || iframeWindow?.document;
      if (!iframeDoc || !iframeDoc.body) return;

      const existingBox = iframeDoc.getElementById('qunix-demo-highlight-box');

      if (!detail || !detail.selector) {
        if (existingBox) {
          existingBox.style.opacity = '0';
          setTimeout(() => {
            try { existingBox.remove(); } catch (_) {}
          }, 250);
        }
        return;
      }

      // Inject highlight keyframe animation if missing
      if (!iframeDoc.getElementById('qunix-demo-highlight-style')) {
        const styleTag = iframeDoc.createElement('style');
        styleTag.id = 'qunix-demo-highlight-style';
        styleTag.textContent = `
          @keyframes qunix-highlight-pulse {
            0%, 100% {
              box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.45), 0 0 25px rgba(108, 92, 231, 0.6);
              border-color: #6c5ce7;
            }
            50% {
              box-shadow: 0 0 0 7px rgba(108, 92, 231, 0.2), 0 0 40px rgba(108, 92, 231, 0.9);
              border-color: #a29bfe;
            }
          }
        `;
        iframeDoc.head.appendChild(styleTag);
      }

      // Find best target element
      const selectors = detail.selector.split(',').map((s) => s.trim());
      let targetEl: HTMLElement | null = null;
      for (const sel of selectors) {
        try {
          const found = iframeDoc.querySelector(sel) as HTMLElement | null;
          if (found && (found.offsetWidth > 0 || found.offsetHeight > 0)) {
            targetEl = found;
            break;
          }
          if (found && !targetEl) {
            targetEl = found;
          }
        } catch (_) {}
      }

      if (!targetEl) {
        if (existingBox) existingBox.remove();
        return;
      }

      let box = existingBox;
      if (!box) {
        box = iframeDoc.createElement('div');
        box.id = 'qunix-demo-highlight-box';
        iframeDoc.body.appendChild(box);
      }

      const rect = targetEl.getBoundingClientRect();
      const scrollX = iframeWindow?.scrollX || iframeDoc.documentElement.scrollLeft || 0;
      const scrollY = iframeWindow?.scrollY || iframeDoc.documentElement.scrollTop || 0;

      const top = Math.max(0, rect.top + scrollY - 4);
      const left = Math.max(0, rect.left + scrollX - 4);
      const width = Math.max(20, rect.width + 8);
      const height = Math.max(20, rect.height + 8);

      box.style.cssText = `
        position: absolute;
        top: ${top}px;
        left: ${left}px;
        width: ${width}px;
        height: ${height}px;
        border: 2px solid #6c5ce7;
        border-radius: 8px;
        pointer-events: none;
        z-index: 9999999;
        transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        animation: qunix-highlight-pulse 1.8s ease-in-out infinite;
        opacity: 1;
      `;

      box.innerHTML = `
        <div style="
          position: absolute;
          top: -28px;
          left: 0;
          background: #6c5ce7;
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.3px;
          padding: 3px 10px;
          border-radius: 6px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
          white-space: nowrap;
          font-family: system-ui, -apple-system, sans-serif;
          display: flex;
          align-items: center;
          gap: 5px;
          pointer-events: none;
        ">
          <span style="font-size: 12px;">🎯</span>
          <span>${detail.label}</span>
        </div>
      `;

      try {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } catch (_) {}
    };

    window.addEventListener('qunix-highlight-target', handleHighlight);
    return () => {
      window.removeEventListener('qunix-highlight-target', handleHighlight);
    };
  }, []);

  const applyPreset = (presetValues: Partial<z.infer<typeof qunixThemeSettingsSchema>>) => {
    const normalizedPreset: any = {};
    for (const k in presetValues) {
      if (typeof (presetValues as any)[k] === 'string') {
        normalizedPreset[k] = hslToHex((presetValues as any)[k]);
      } else {
        normalizedPreset[k] = (presetValues as any)[k];
      }
    }
    form.setValues({
      ...form.values,
      ...normalizedPreset,
    });
    addToast('Preset values loaded.', 'success');
  };

  const doSave = () => {
    const payload = form.values;
    setLoading(true);
    axiosInstance
      .put('/api/admin/extensions/dev.qunix.theme/settings', payload)
      .then(() => {
        addToast(tExt('admin.toasts.saveSuccess', {}), 'success');
        form.initialize(payload);
        form.resetDirty(payload);
        try {
          localStorage.setItem('qunix_theme_settings', JSON.stringify(payload));
        } catch (_) { }
        (window as any).qunixThemeSettings = payload;
        window.dispatchEvent(new CustomEvent('qunix-settings-loaded', { detail: payload }));
        if (payload.font_family) {
          try {
            (window as any).qunixLoadFont?.(payload.font_family);
          } catch (_) {}
        }
      })
      .catch((err) => {
        console.error(err);
        addToast(httpErrorToHuman(err), 'error');
      })
      .finally(() => setLoading(false));
  };

  const handleReset = () => {
    const rawDefaultSettings = {
      background_color: '#070708',
      text_color: '#e2e8f0',
      focus_color: '#070708',
      dark_7_color: '#1f1f1f',
      dark_6_color: '#313133',
      shadow_opacity: 0.25,
      font_family: 'JetBrains Mono',
      sidebar_color: '#111114',
      card_color: '#121212',
      border_color: 'rgba(184, 184, 184, 0.15)',
      border_radius: 20,
      navbar_color: '#08080a',
      terminal_color: '#1C1F24',
      terminal_text_color: '#FEFEFD',
      input_color: '#212121',
      button_radius: 20,
      input_radius: 8,
      card_radius: 12,
      console_banner_radius: 16,
      navbar_height: 64,
      sidebar_item_gap: 6,
      sidebar_animation: true,
      background_image: '',
      sidebar_blur: 0,
      wallpaper_blur: 0,
      wallpaper_brightness: 1.0,
      glass_transparency: 20,
      editor_color: '#141313',
      editor_text_color: '#e2e8f0',
      listing_color: '#1f1f1f',
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
      chart_series_1_border: '#22d3ee',
      chart_series_1_fill: 'rgba(14, 116, 144, 0.5)',
      chart_series_2_border: '#facc15',
      chart_series_2_fill: 'rgba(161, 98, 7, 0.5)',
      mini_card_bg_color: '#242323',
      popup_window_border_color: 'rgba(255, 255, 255, 0.12)',
      quick_actions_bg: '#120f12',
      quick_actions_text_color: '#c0caf5',
      quick_actions_border_color: 'rgba(154, 165, 233, 0.15)',
      chrome_toolbar_color: '#0a0a0d',
      preloader_color: '#7aa2f7',
      preloader_bg_color: '#121217',
      egg_banners: {},

      // Light Mode Defaults
      light_background_color: '#f3effa',
      light_text_color: '#1e1631',
      light_focus_color: '#8542f0',
      light_shadow_opacity: 0.08,
      light_dark_7_color: '#ffffff',
      light_dark_6_color: '#ebebeb',
      light_mini_card_bg_color: '#f4f4f6',
      light_popup_window_border_color: 'rgba(0, 0, 0, 0.12)',
      light_quick_actions_bg: '#f1f3f5',
      light_quick_actions_text_color: '#1a1b26',
      light_quick_actions_border_color: 'rgba(0, 0, 0, 0.12)',
      light_chrome_toolbar_color: '#ffffff',
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
      card_animation: 'slide-up',
      listing_animation: 'inherit',
      dashboard_layout: 'default',
      hide_sidebar_power_actions: false,
      announcement_display_mode: 'notifications',
      announcement_important_rule: 'important_flag',
      announcement_show_important_as_banner: true,
      embed_title: '',
      embed_description: '',
      embed_color: '#6c5ce7',
      embed_image: '',
      embed_site_name: '',
      dock_position: 'sidebar',
      login_layout: 'default',
      login_logo_position: 'above-form',
      login_support_position: 'above-form',
      login_banner_image: '',
      login_support_link: '',
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
      .then(() => {
        addToast('Theme settings reset to default.', 'success');
      })
      .catch((err) => addToast(httpErrorToHuman(err), 'error'))
      .finally(() => setLoading(false));
  };

  const handleImportFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        const merged = { ...form.values, ...parsed };
        const result = qunixThemeSettingsSchema.safeParse(merged);
        if (!result.success) {
          const firstErr = result.error.issues[0];
          addToast(`Import failed: ${firstErr.path.join('.') || 'root'} - ${firstErr.message}`, 'error');
          return;
        }
        form.setValues(result.data);
        addToast('Theme configuration imported.', 'success');
      } catch (err) {
        addToast('Failed to parse config file.', 'error');
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
      addToast('Theme settings exported.', 'success');
    } catch (err) {
      addToast('Failed to export.', 'error');
    }
  };

  return (
    <div
      id='qunix-settings-page'
      style={{
        display: 'flex',
        width: '100vw',
        height: '100dvh',
        background: '#000000',
        color: '#e2e8f0',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* 1. Left Toolbar Bar */}
      <div
        style={{
          position: 'relative',
          width: '64px',
          height: '100%',
          maxHeight: '100dvh',
          overflow: 'hidden',
          flexShrink: 0,
          background: '#040405',
          borderRight: '1px solid #111114',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 0',
          boxSizing: 'border-box',
        }}
      >
        {/* Top: Back arrow button */}
        <button
          onClick={() => navigate('/admin')}
          title='Go Back'
          style={{
            position: 'absolute',
            top: '16px',
            width: '40px',
            height: '40px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#ef4444',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ef4444';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
            e.currentTarget.style.color = '#ef4444';
          }}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>

        {/* Middle: Tab Switcher Icons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { id: 'colors', icon: faPalette, title: tExt('admin.tabs.colors.title', {}) },
            { id: 'layout', icon: faCogs, title: tExt('admin.tabs.layout.title', {}) },
            { id: 'sidebar', icon: faColumns, title: tExt('admin.tabs.sidebar.title', {}) },
            { id: 'stylings', icon: faSliders, title: tExt('admin.tabs.stylings.title', {}) },
            { id: 'banners', icon: faImage, title: tExt('admin.tabs.banners.title', {}) },
            { id: 'announcement', icon: faBullhorn, title: tExt('admin.tabs.announcement.title', {}) },
            { id: 'login-layout', icon: faWindowMaximize, title: tExt('admin.tabs.loginLayout.title', {}) },
            // ponytail: Social Meta Tags & Discord Embeds tab hidden temporarily per user request; will be restored with toggle in future update
            // { id: 'embed', icon: faShareNodes, title: tExt('admin.tabs.embed.title', {}) },
            { id: 'advanced', icon: faDatabase, title: tExt('admin.tabs.advanced.title', {}) },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                title={tab.title}
                style={{
                  width: '40px',
                  height: '40px',
                  background: isSelected ? 'rgba(108, 92, 231, 0.15)' : 'transparent',
                  border: isSelected ? '1px solid #6c5ce7' : '1px solid transparent',
                  borderRadius: '8px',
                  color: isSelected ? '#a29bfe' : '#71717a',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.color = '#a29bfe';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.color = '#71717a';
                }}
              >
                <FontAwesomeIcon icon={tab.icon} />
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Middle Form Pane */}
      <div
        style={{
          width: '380px',
          height: '100%',
          maxHeight: '100dvh',
          overflow: 'hidden',
          flexShrink: 0,
          background: '#070708',
          borderRight: '1px solid #111114',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        {/* Title pane */}
        <div style={{ padding: '20px 24px 16px 24px', borderBottom: '1px solid #111114' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{tExt('admin.title', {})}</h2>
        </div>

        {initialLoading ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px',
              gap: '16px',
              animation: 'qunix-fade-in 0.3s ease-out',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '52px',
                height: '52px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: '2.5px solid rgba(108, 92, 231, 0.15)',
                  borderTopColor: '#6c5ce7',
                  animation: 'qunix-spin 0.8s linear infinite',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: '7px',
                  borderRadius: '50%',
                  border: '2px solid rgba(162, 155, 254, 0.15)',
                  borderBottomColor: '#a29bfe',
                  animation: 'qunix-spin-reverse 1.2s linear infinite',
                }}
              />
              <FontAwesomeIcon
                icon={faCogs}
                style={{
                  fontSize: '16px',
                  color: '#a29bfe',
                  animation: 'qunix-pulse 1.6s ease-in-out infinite',
                }}
              />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', letterSpacing: '0.3px' }}>
                {tExt('admin.loading', {})}
              </div>
            </div>
          </div>
        ) : (
          <ScrollArea style={{ flex: 1, padding: '24px' }} type='auto'>
            <form onSubmit={(e) => e.preventDefault()}>
              <Stack gap='md' style={{ paddingBottom: '32px' }}>
                {activeTab === 'colors' && <ColorsSettings form={form} />}
                {activeTab === 'layout' && <LayoutSettings form={form} />}
                {activeTab === 'stylings' && <StylingsSettings form={form} />}
                {activeTab === 'sidebar' && <SidebarSettings form={form} extensions={extensions} />}
                {activeTab === 'banners' && <BannersSettings form={form} nests={nests} />}
                {activeTab === 'announcement' && <AnnouncementSettings form={form} />}
                {activeTab === 'login-layout' && <LoginLayoutSettings form={form} />}
                {activeTab === 'embed' && <EmbedSettings form={form} />}
                {activeTab === 'advanced' && (
                  <AdvancedSettings
                    form={form}
                    handleExportFile={handleExportFile}
                    handleImportFile={handleImportFile}
                    handleReset={handleReset}
                  />
                )}
              </Stack>
            </form>
          </ScrollArea>
        )}

      </div>

      {/* 3. Live Preview Iframe */}
      <div
        id='qunix-preview-container'
        style={{
          flex: 1,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          background: '#000000',
        }}
      >
        <div
          style={{
            padding: '12px 20px',
            background: '#040405',
            border: '1px solid #111114',
            borderBottom: 'none',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        />
        <iframe
          ref={iframeRef}
          src='/'
          style={{
            flex: 1,
            border: '1px solid #111114',
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px',
            background: 'var(--ds-background, #1a1b26)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 0, 0, 0.2)',
          }}
        />
      </div>

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
            {tExt('admin.unsavedWarning', {})}
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
              {tExt('admin.reset', {})}
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
              {loading ? tExt('admin.saving', {}) : tExt('admin.saveChanges', {})}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
