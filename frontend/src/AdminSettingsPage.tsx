import React, { useEffect, useState, useRef } from 'react';
import { Stack, Group, ColorInput, NumberInput, TextInput, Switch, Tabs, FileButton, useComputedColorScheme, ScrollArea } from '@mantine/core';
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
  faRotateLeft 
} from '@fortawesome/free-solid-svg-icons';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';
import { useNavigate } from 'react-router';
import { httpErrorToHuman, axiosInstance } from '@/api/axios.ts';
import getAllEggs from '@/api/admin/nests/getAllEggs.ts';
import Button from '@/elements/Button.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import { qunixThemeSettingsSchema } from './lib/schemas.ts';

const PRESETS = [
  {
    name: 'Tokyo Night',
    colors: ['#1a1b26', '#16161e', '#7aa2f7', '#1f2335'],
    values: {
      background_color: '#1a1b26',
      text_color: '#c0caf5',
      focus_color: '#7aa2f7',
      sidebar_color: '#16161e',
      card_color: 'rgba(36, 40, 59, 0.74)',
      border_color: 'rgba(154, 165, 233, 0.15)',
      navbar_color: '#1f2335',
      terminal_color: '#1a1b26',
      button_color: '#7aa2f7',
      sidebar_active_color: '#7aa2f7',
      sidebar_active_bg: 'rgba(255, 255, 255, 0.05)',
    }
  },
  {
    name: 'Qunix Space',
    colors: ['#120b1f', '#1a1329', '#6c5ce7', '#161025'],
    values: {
      background_color: '#120b1fff',
      text_color: '#e2e8f0',
      focus_color: 'hsla(263, 85%, 60%, 1.00)',
      sidebar_color: '#1a1329ff',
      card_color: '#1e1631ff',
      border_color: 'rgba(156, 136, 255, 0.15)',
      navbar_color: '#161025ff',
      terminal_color: '#1a1b26ff',
      button_color: '#6c5ce7ff',
      sidebar_active_color: '#6c5ce7ff',
      sidebar_active_bg: 'rgba(255, 255, 255, 0.05)',
    }
  },
  {
    name: 'Cyberpunk',
    colors: ['#000000', '#0d0211', '#ff0055', '#1a0022'],
    values: {
      background_color: '#000000',
      text_color: '#00ffcc',
      focus_color: '#ff0055',
      sidebar_color: '#0d0211',
      card_color: '#1a0022',
      border_color: 'rgba(255, 0, 85, 0.3)',
      navbar_color: '#0d0211',
      terminal_color: '#0d0211',
      button_color: '#ff0055',
      sidebar_active_color: '#ff0055',
      sidebar_active_bg: 'rgba(255, 0, 85, 0.15)',
    }
  },
  {
    name: 'Dracula',
    colors: ['#282a36', '#21222c', '#bd93f9', '#1d1f27'],
    values: {
      background_color: '#282a36',
      text_color: '#f8f8f2',
      focus_color: '#bd93f9',
      sidebar_color: '#21222c',
      card_color: '#1d1f27',
      border_color: 'rgba(189, 147, 249, 0.2)',
      navbar_color: '#21222c',
      terminal_color: '#282a36',
      button_color: '#bd93f9',
      sidebar_active_color: '#bd93f9',
      sidebar_active_bg: 'rgba(255, 255, 255, 0.05)',
    }
  }
];

export default function AdminSettingsPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [nests, setNests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('colors');
  const computedColorScheme = useComputedColorScheme('dark');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof qunixThemeSettingsSchema>>({
    initialValues: {
      background_color: '#1a1b26',
      text_color: '#c0caf5',
      focus_color: 'hsla(261, 84%, 79%, 1)',
      shadow_opacity: 0.25,
      font_family: 'JetBrains Mono',
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
      egg_banners: {},

      // Light Mode Defaults
      light_background_color: '#f3effaff',
      light_text_color: '#1e1631ff',
      light_focus_color: 'hsla(263, 85%, 60%, 1.00)',
      light_shadow_opacity: 0.08,
      light_sidebar_color: '#ffffffff',
      light_card_color: '#ffffffff',
      light_border_color: 'rgba(108, 92, 231, 0.15)',
      light_navbar_color: '#ffffffff',
      light_terminal_color: '#f1f2f6ff',
      light_terminal_text_color: '#2f3542ff',
      light_input_color: '#f1f2f6ff',
      light_background_image: '',
      light_editor_color: '#ffffffff',
      light_editor_text_color: '#2f3542ff',
      light_listing_color: '#ffffffff',
      light_button_color: '#6c5ce7ff',
      light_server_action_bg: '#f1f2f6ff',
      light_power_start_bg: '#2ed573ff',
      light_power_restart_bg: '#747d8cff',
      light_power_stop_bg: '#ff4757ff',
      light_sidebar_active_color: '#6c5ce7ff',
      light_sidebar_active_bg: 'rgba(108, 92, 231, 0.1)',
      light_terminal_cursor_color: '#6c5ce7ff',
      light_terminal_selection_color: 'rgba(108, 92, 231, 0.3)',
      light_terminal_ansi_black: '#d5d6db',
      light_terminal_ansi_red: '#f7768e',
      light_terminal_ansi_green: '#485e30',
      light_terminal_ansi_yellow: '#8f5e15',
      light_terminal_ansi_blue: '#34548a',
      light_terminal_ansi_magenta: '#5a4a78',
      light_terminal_ansi_cyan: '#0f4b6e',
      light_terminal_ansi_white: '#343b58',
    },
    validate: zodResolver(qunixThemeSettingsSchema),
  });

  // Force-hide Calagopus layout and style full screen
  useEffect(() => {
    document.body.classList.add('qunix-settings-active');
    const styleId = 'qunix-designer-fullscreen-override';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.innerHTML = `
        /* Hide main panel sidebars, headers, footers, and overlays */
        body.qunix-settings-active aside,
        body.qunix-settings-active footer,
        body.qunix-settings-active header,
        body.qunix-settings-active .mantine-AppShell-navbar,
        body.qunix-settings-active .mantine-AppShell-header,
        body.qunix-settings-active .mantine-AppShell-footer,
        body.qunix-settings-active #sidebar-content,
        body.qunix-settings-active #sidebar-desktop,
        body.qunix-settings-active [class*="Sidebar-root"],
        body.qunix-settings-active [class*="AppShell-navbar"],
        body.qunix-settings-active [class*="AppShell-header"],
        body.qunix-settings-active [class*="AppShell-footer"],
        body.qunix-settings-active [id*="sidebar"],
        body.qunix-settings-active [id*="footer"],
        body.qunix-settings-active [class*="sidebar"],
        body.qunix-settings-active [class*="footer"],
        body.qunix-settings-active .my-2.ml-auto.mr-12,
        body.qunix-settings-active [class*="Copyright"],
        body.qunix-settings-active [class*="copyright"],
        body.qunix-settings-active [class*="lg:hidden"],
        body.qunix-settings-active [class*="hidden!"],
        body.qunix-settings-active [class*="rounded-l-none!"],
        body.qunix-settings-active [class*="Drawer"],
        body.qunix-settings-active [class*="Modal"],
        body.qunix-settings-active [class*="Overlay"],
        body.qunix-settings-active *:has(> #admin-root) > *:not(#admin-root):not(.mantine-Portal-root):not([class*="Portal"]) {
          display: none !important;
        }

        body.qunix-settings-active #admin-root {
          margin-left: 0 !important;
          max-width: 100vw !important;
          width: 100vw !important;
          height: 100dvh !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        body.qunix-settings-active #admin-root > div,
        body.qunix-settings-active #admin-root > div > div,
        body.qunix-settings-active .mantine-Container-root,
        body.qunix-settings-active main.mantine-AppShell-main {
          max-width: 100vw !important;
          width: 100vw !important;
          height: 100dvh !important;
          padding: 0 !important;
          margin: 0 !important;
          overflow: hidden !important;
          display: block !important;
        }

        #qunix-settings-page {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100dvh !important;
          max-height: 100dvh !important;
          z-index: 9999 !important;
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box !important;
          background: #000000 !important;
        }

        body.qunix-settings-active, 
        body.qunix-settings-active html, 
        body.qunix-settings-active #root, 
        body.qunix-settings-active #app, 
        body.qunix-settings-active .mantine-AppShell-root {
          overflow: hidden !important;
          height: 100dvh !important;
          max-height: 100dvh !important;
          background-color: #000000 !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        /* Dark premium inputs override */
        #qunix-settings-page input,
        #qunix-settings-page select,
        #qunix-settings-page textarea,
        #qunix-settings-page .mantine-Input-input,
        #qunix-settings-page .mantine-TextInput-input,
        #qunix-settings-page .mantine-PasswordInput-input,
        #qunix-settings-page .mantine-Select-input,
        #qunix-settings-page .mantine-Textarea-input,
        #qunix-settings-page .mantine-NumberInput-input,
        #qunix-settings-page .mantine-ColorInput-input {
          background-color: #0d0d0f !important;
          border: 1px solid #1a1a20 !important;
          color: #e2e8f0 !important;
        }

        #qunix-settings-page label,
        #qunix-settings-page .mantine-InputWrapper-label {
          color: #a1a1aa !important;
          font-weight: 500 !important;
          font-size: 11px !important;
        }

        #qunix-settings-page button[role="tab"] {
          background-color: transparent !important;
          color: #71717a !important;
          border: 1px solid transparent !important;
        }
        #qunix-settings-page button[role="tab"][data-active="true"],
        #qunix-settings-page button[role="tab"][data-active] {
          background-color: rgba(108, 92, 231, 0.12) !important;
          border: 1px solid #6c5ce7 !important;
          color: #a29bfe !important;
        }

        #qunix-settings-page .mantine-ScrollArea-viewport {
          background-color: #070708 !important;
        }

        /* Mantine Popover / Color Picker Dark Mode Styling */
        body.qunix-settings-active .mantine-Popover-dropdown,
        body.qunix-settings-active .mantine-ColorInput-dropdown,
        body.qunix-settings-active .mantine-ColorPicker-root,
        body.qunix-settings-active .mantine-Popover-dropdown input,
        body.qunix-settings-active .mantine-ColorInput-dropdown input,
        body.qunix-settings-active .mantine-ColorPicker-root input {
          background-color: #0d0d0f !important;
          border: 1px solid #1a1a22 !important;
          color: #e2e8f0 !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5) !important;
        }
        body.qunix-settings-active .mantine-ColorPicker-swatch {
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        body.qunix-settings-active .mantine-ColorPicker-slider, 
        body.qunix-settings-active .mantine-ColorPicker-alphaSlider {
          height: 10px !important;
        }

        /* Responsive Mobile Layout overrides */
        @media (max-width: 768px) {
          /* Hide Live Preview iframe container */
          #qunix-settings-page > div:last-child {
            display: none !important;
          }
          /* Expand form pane to occupy full remaining width */
          #qunix-settings-page > div:nth-child(2) {
            width: calc(100vw - 64px) !important;
            flex: 1 !important;
          }
        }

        @media (max-width: 500px) {
          /* Stack side-by-side elements inside the form container */
          #qunix-settings-page .mantine-Group-root:not(.presets-group) {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
          }
          #qunix-settings-page .mantine-Group-root:not(.presets-group) > * {
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `;
      document.head.appendChild(styleEl);
    }

    return () => {
      document.body.classList.remove('qunix-settings-active');
      styleEl?.remove();
    };
  }, []);

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
    axiosInstance
      .get('/api/admin/extensions/dev.qunix.theme/settings')
      .then((res) => {
        const s = res.data.settings;
        form.initialize({
          background_color: s.background_color || s.backgroundColor || '#1a1b26',
          text_color: s.text_color || s.textColor || '#c0caf5',
          focus_color: s.focus_color || s.focusColor || 'hsla(261, 84%, 79%, 1)',
          shadow_opacity:
            s.shadow_opacity !== undefined ? s.shadow_opacity : s.shadowOpacity !== undefined ? s.shadowOpacity : 0.25,
          font_family: s.font_family || s.fontFamily || 'JetBrains Mono',
          sidebar_color: s.sidebar_color || s.sidebarColor || '#16161e',
          card_color: s.card_color || s.cardColor || 'rgba(36, 40, 59, 0.74)',
          border_color: s.border_color || s.borderColor || 'rgba(154, 165, 233, 0.15)',
          border_radius:
            s.border_radius !== undefined ? s.border_radius : s.borderRadius !== undefined ? s.borderRadius : 8,
          navbar_color: s.navbar_color || s.navbarColor || '#1f2335',
          terminal_color: s.terminal_color || s.terminalColor || '#1a1b26',
          terminal_text_color: s.terminal_text_color || s.terminalTextColor || '#a9b1d6',
          input_color: s.input_color || s.inputColor || '#24283b',
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
          editor_color: s.editor_color || s.editorColor || '#000000',
          editor_text_color: s.editor_text_color || s.editorTextColor || '#ffffff',
          listing_color: s.listing_color || s.listingColor || '#0a0a0a',
          button_color: s.button_color || s.buttonColor || '#0a72ef',
          server_action_bg: s.server_action_bg || s.serverActionBg || s.server_action_color || s.serverActionColor || '#0a0a0a',
          power_start_bg: s.power_start_bg || s.powerStartBg || '#40c057',
          power_restart_bg: s.power_restart_bg || s.powerRestartBg || '#868e96',
          power_stop_bg: s.power_stop_bg || s.powerStopBg || '#fa5252',
          sidebar_active_color: s.sidebar_active_color || s.sidebarActiveColor || '#7aa2f7',
          sidebar_active_bg: s.sidebar_active_bg || s.sidebarActiveBg || 'rgba(255, 255, 255, 0.05)',
          sidebar_item_height:
            s.sidebar_item_height !== undefined
              ? s.sidebar_item_height
              : s.sidebarItemHeight !== undefined
                ? s.sidebarItemHeight
                : 36,
          terminal_cursor_color: s.terminal_cursor_color || s.terminalCursorColor || '#7aa2f7',
          terminal_selection_color: s.terminal_selection_color || s.terminalSelectionColor || 'rgba(255, 255, 255, 0.15)',
          terminal_ansi_black: s.terminal_ansi_black || s.terminalAnsiBlack || '#15161e',
          terminal_ansi_red: s.terminal_ansi_red || s.terminalAnsiRed || '#f7768e',
          terminal_ansi_green: s.terminal_ansi_green || s.terminalAnsiGreen || '#9ece6a',
          terminal_ansi_yellow: s.terminal_ansi_yellow || s.terminalAnsiYellow || '#e0af68',
          terminal_ansi_blue: s.terminal_ansi_blue || s.terminalAnsiBlue || '#7aa2f7',
          terminal_ansi_magenta: s.terminal_ansi_magenta || s.terminalAnsiMagenta || '#bb9af7',
          terminal_ansi_cyan: s.terminal_ansi_cyan || s.terminalAnsiCyan || '#7dcfff',
          terminal_ansi_white: s.terminal_ansi_white || s.terminalAnsiWhite || '#a9b1d6',
          egg_banners: s.egg_banners || s.eggBanners || {},

          // Light Mode Fields
          light_background_color: s.light_background_color || s.lightBackgroundColor || '#f3effaff',
          light_text_color: s.light_text_color || s.lightTextColor || '#1e1631ff',
          light_focus_color: s.light_focus_color || s.lightFocusColor || 'hsla(263, 85%, 60%, 1.00)',
          light_shadow_opacity:
            s.light_shadow_opacity !== undefined ? s.light_shadow_opacity : s.lightShadowOpacity !== undefined ? s.lightShadowOpacity : 0.08,
          light_sidebar_color: s.light_sidebar_color || s.lightSidebarColor || '#ffffffff',
          light_card_color: s.light_card_color || s.lightCardColor || '#ffffffff',
          light_border_color: s.light_border_color || s.lightBorderColor || 'rgba(108, 92, 231, 0.15)',
          light_navbar_color: s.light_navbar_color || s.lightNavbarColor || '#ffffffff',
          light_terminal_color: s.light_terminal_color || s.lightTerminalColor || '#f1f2f6ff',
          light_terminal_text_color: s.light_terminal_text_color || s.lightTerminalTextColor || '#2f3542ff',
          light_input_color: s.light_input_color || s.lightInputColor || '#f1f2f6ff',
          light_background_image: s.light_background_image || s.lightBackgroundImage || '',
          light_editor_color: s.light_editor_color || s.lightEditorColor || '#ffffffff',
          light_editor_text_color: s.light_editor_text_color || s.lightEditorTextColor || '#2f3542ff',
          light_listing_color: s.light_listing_color || s.lightListingColor || '#ffffffff',
          light_button_color: s.light_button_color || s.lightButtonColor || '#6c5ce7ff',
          light_server_action_bg: s.light_server_action_bg || s.lightServerActionBg || '#f1f2f6ff',
          light_power_start_bg: s.light_power_start_bg || s.lightPowerStartBg || '#2ed573ff',
          light_power_restart_bg: s.light_power_restart_bg || s.lightPowerRestartBg || '#747d8cff',
          light_power_stop_bg: s.light_power_stop_bg || s.lightPowerStopBg || '#ff4757ff',
          light_sidebar_active_color: s.light_sidebar_active_color || s.lightSidebarActiveColor || '#6c5ce7ff',
          light_sidebar_active_bg: s.light_sidebar_active_bg || s.lightSidebarActiveBg || 'rgba(108, 92, 231, 0.1)',
          light_terminal_cursor_color: s.light_terminal_cursor_color || s.lightTerminalCursorColor || '#6c5ce7ff',
          light_terminal_selection_color: s.light_terminal_selection_color || s.lightTerminalSelectionColor || 'rgba(108, 92, 231, 0.3)',
          light_terminal_ansi_black: s.light_terminal_ansi_black || s.lightTerminalAnsiBlack || '#d5d6db',
          light_terminal_ansi_red: s.light_terminal_ansi_red || s.lightTerminalAnsiRed || '#f7768e',
          light_terminal_ansi_green: s.light_terminal_ansi_green || s.lightTerminalAnsiGreen || '#485e30',
          light_terminal_ansi_yellow: s.light_terminal_ansi_yellow || s.lightTerminalAnsiYellow || '#8f5e15',
          light_terminal_ansi_blue: s.light_terminal_ansi_blue || s.lightTerminalAnsiBlue || '#34548a',
          light_terminal_ansi_magenta: s.light_terminal_ansi_magenta || s.lightTerminalAnsiMagenta || '#5a4a78',
          light_terminal_ansi_cyan: s.light_terminal_ansi_cyan || s.lightTerminalAnsiCyan || '#0f4b6e',
          light_terminal_ansi_white: s.light_terminal_ansi_white || s.lightTerminalAnsiWhite || '#343b58',
        });
      })
      .catch((err) => addToast(httpErrorToHuman(err), 'error'));
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
      const serverActionBg = getThemeVal(s.server_action_bg, s.light_server_action_bg);
      const powerStartBg = getThemeVal(s.power_start_bg, s.light_power_start_bg);
      const powerRestartBg = getThemeVal(s.power_restart_bg, s.light_power_restart_bg);
      const powerStopBg = getThemeVal(s.power_stop_bg, s.light_power_stop_bg);
      const sidebarActiveColor = getThemeVal(s.sidebar_active_color, s.light_sidebar_active_color);
      const sidebarActiveBg = getThemeVal(s.sidebar_active_bg, s.light_sidebar_active_bg);
      const backgroundImage = getThemeValOpt(s.background_image, s.light_background_image);
      const shadowOpacity = getThemeValOpt(s.shadow_opacity, s.light_shadow_opacity);

      const root = iframeDoc.documentElement;
      
      if (backgroundColor) root.style.setProperty('--ds-background', backgroundColor);
      if (textColor) root.style.setProperty('--ds-gray-900', textColor);
      if (focusColor) root.style.setProperty('--ds-focus-color', focusColor);
      if (shadowOpacity !== undefined) {
        root.style.setProperty('--ds-shadow-border', `0px 0px 0px 1px ${isDark ? `rgba(255, 255, 255, ${shadowOpacity})` : `rgba(0, 0, 0, ${shadowOpacity})`}`);
      }
      if (sidebarColor) root.style.setProperty('--ds-sidebar-bg', sidebarColor);
      if (sidebarActiveColor) root.style.setProperty('--ds-sidebar-active-color', sidebarActiveColor);
      if (sidebarActiveBg) root.style.setProperty('--ds-sidebar-active-bg', sidebarActiveBg);
      if (s.sidebar_item_height !== undefined) root.style.setProperty('--ds-sidebar-item-height', `${s.sidebar_item_height}px`);
      if (cardColor) root.style.setProperty('--ds-card-bg', cardColor);
      if (borderColor) root.style.setProperty('--ds-border-color', borderColor);
      if (s.border_radius !== undefined) root.style.setProperty('--ds-border-radius', `${s.border_radius}px`);
      if (navbarColor) root.style.setProperty('--ds-navbar-bg', navbarColor);
      if (terminalColor) root.style.setProperty('--ds-terminal-bg', terminalColor);
      if (terminalTextColor) root.style.setProperty('--ds-terminal-text', terminalTextColor);
      if (inputColor) root.style.setProperty('--ds-input-bg', inputColor);
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
          iframeDoc.body.classList.add('has-bg-image');
        } else {
          root.style.setProperty('--ds-background-image', 'none');
          root.classList.remove('has-bg-image');
          iframeDoc.body.classList.remove('has-bg-image');
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

  const applyPreset = (presetValues: Partial<z.infer<typeof qunixThemeSettingsSchema>>) => {
    form.setValues({
      ...form.values,
      ...presetValues
    });
    addToast('Preset values loaded.', 'success');
  };

  const doSave = () => {
    const payload = form.values;
    setLoading(true);
    axiosInstance
      .put('/api/admin/extensions/dev.qunix.theme/settings', payload)
      .then(() => {
        addToast('Theme settings saved successfully.', 'success');
        form.initialize(payload);
      })
      .catch((err) => {
        console.error(err);
        addToast(httpErrorToHuman(err), 'error');
      })
      .finally(() => setLoading(false));
  };

  const handleReset = () => {
    const defaultSettings = {
      background_color: '#120b1fff',
      text_color: '#e2e8f0',
      focus_color: 'hsla(263, 85%, 60%, 1.00)',
      shadow_opacity: 0.25,
      font_family: 'JetBrains Mono',
      sidebar_color: '#1a1329ff',
      card_color: '#1e1631ff',
      border_color: 'rgba(156, 136, 255, 0.15)',
      border_radius: 20,
      navbar_color: '#161025ff',
      terminal_color: '#1a1b26ff',
      terminal_text_color: '#a9b1d6ff',
      input_color: '#251b3aff',
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
      editor_color: '#0f081aff',
      editor_text_color: '#e2e8f0ff',
      listing_color: '#1e1631ff',
      button_color: '#6c5ce7ff',
      server_action_bg: '#0a0a0a',
      power_start_bg: '#40c057',
      power_restart_bg: '#868e96',
      power_stop_bg: '#fa5252',
      sidebar_active_color: '#6c5ce7ff',
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

      // Light Mode Defaults
      light_background_color: '#f3effaff',
      light_text_color: '#1e1631ff',
      light_focus_color: 'hsla(263, 85%, 60%, 1.00)',
      light_shadow_opacity: 0.08,
      light_sidebar_color: '#ffffffff',
      light_card_color: '#ffffffff',
      light_border_color: 'rgba(108, 92, 231, 0.15)',
      light_navbar_color: '#ffffffff',
      light_terminal_color: '#f1f2f6ff',
      light_terminal_text_color: '#2f3542ff',
      light_input_color: '#f1f2f6ff',
      light_background_image: '',
      light_editor_color: '#ffffffff',
      light_editor_text_color: '#2f3542ff',
      light_listing_color: '#ffffffff',
      light_button_color: '#6c5ce7ff',
      light_server_action_bg: '#f1f2f6ff',
      light_power_start_bg: '#2ed573ff',
      light_power_restart_bg: '#747d8cff',
      light_power_stop_bg: '#ff4757ff',
      light_sidebar_active_color: '#6c5ce7ff',
      light_sidebar_active_bg: 'rgba(108, 92, 231, 0.1)',
      light_terminal_cursor_color: '#6c5ce7ff',
      light_terminal_selection_color: 'rgba(108, 92, 231, 0.3)',
      light_terminal_ansi_black: '#d5d6db',
      light_terminal_ansi_red: '#f7768e',
      light_terminal_ansi_green: '#485e30',
      light_terminal_ansi_yellow: '#8f5e15',
      light_terminal_ansi_blue: '#34548a',
      light_terminal_ansi_magenta: '#5a4a78',
      light_terminal_ansi_cyan: '#0f4b6e',
      light_terminal_ansi_white: '#343b58',
    };

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
    <div id="qunix-settings-page" style={{ 
      display: 'flex', 
      width: '100vw', 
      height: '100dvh', 
      background: '#000000', 
      color: '#e2e8f0', 
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      
      {/* 1. Left Toolbar Bar */}
      <div style={{
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
        justifyContent: 'space-between',
        padding: '16px 0',
        boxSizing: 'border-box'
      }}>
        {/* Top: Back arrow button */}
        <button 
          onClick={() => navigate('/admin')}
          title="Go Back"
          style={{
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
            transition: 'all 0.2s'
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
            { id: 'colors', icon: faPalette, title: 'Theme Colors' },
            { id: 'layout', icon: faCogs, title: 'Layout & Spacing' },
            { id: 'banners', icon: faImage, title: 'Egg Banners' }
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
                  transition: 'all 0.2s'
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

        {/* Bottom: Save Button */}
        <button 
          onClick={doSave}
          title="Save Settings"
          style={{
            width: '40px',
            height: '40px',
            background: 'rgba(92, 124, 250, 0.15)',
            border: '1px solid rgba(92, 124, 250, 0.3)',
            borderRadius: '8px',
            color: '#5c7cfa',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#5c7cfa';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(92, 124, 250, 0.15)';
            e.currentTarget.style.color = '#5c7cfa';
          }}
        >
          <FontAwesomeIcon icon={faSave} />
        </button>
      </div>

      {/* 2. Middle Form Pane */}
      <div style={{
        width: '380px',
        height: '100%',
        maxHeight: '100dvh',
        overflow: 'hidden',
        flexShrink: 0,
        background: '#070708',
        borderRight: '1px solid #111114',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }}>
        {/* Title pane */}
        <div style={{ padding: '24px 24px 16px 24px', borderBottom: '1px solid #111114' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>
            {activeTab === 'colors' ? 'Theme Colors' : 
             activeTab === 'layout' ? 'Layout & Spacing' : 
             activeTab === 'banners' ? 'Egg Banners Settings' : 'Settings'}
          </h2>
          <span style={{ fontSize: '11px', color: '#71717a' }}>Customize theme configurations live.</span>
        </div>

        <ScrollArea style={{ flex: 1, padding: '24px' }} type="auto">
          <form onSubmit={(e) => e.preventDefault()}>
            <Stack gap="md" style={{ paddingBottom: '32px' }}>
              
              {activeTab === 'colors' && (
                <>
                  {/* Presets */}
                  <div style={{ background: '#0b0b0d', padding: '16px', borderRadius: '8px', border: '1px solid #141418' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '10px', color: '#a29bfe' }}>Presets</span>
                    <Group gap="xs" className="presets-group">
                      {PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => applyPreset(preset.values)}
                          title={preset.name}
                          style={{
                            padding: '6px 8px',
                            fontSize: '10px',
                            border: '1px solid #2d2d30',
                            borderRadius: '6px',
                            background: '#09090a',
                            color: '#e2e8f0',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span style={{ display: 'flex', gap: '2px' }}>
                            {preset.colors.map((c, idx) => (
                              <span key={idx} style={{ width: '6px', height: '6px', background: c, borderRadius: '50%' }} />
                            ))}
                          </span>
                          {preset.name}
                        </button>
                      ))}
                    </Group>
                  </div>

                  <Tabs defaultValue="dark" variant="pills" classNames={{ list: 'mb-3' }}>
                    <Tabs.List>
                      <Tabs.Tab value="dark">Dark Colors</Tabs.Tab>
                      <Tabs.Tab value="light">Light Colors</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="dark">
                      <Stack gap="md">
                        {/* Subheading: Base Colors */}
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', color: '#a29bfe', marginBottom: '8px' }}>Base Colors</span>
                          <Stack gap="xs">
                            <ColorInput label='Background' {...form.getInputProps('background_color')} />
                            <ColorInput label='Text' {...form.getInputProps('text_color')} />
                            <ColorInput label='Focus Accent' {...form.getInputProps('focus_color')} />
                            <ColorInput label='Border' {...form.getInputProps('border_color')} />
                          </Stack>
                        </div>

                        {/* Subheading: Navigation Menu */}
                        <div style={{ borderTop: '1px solid #141418', paddingTop: '12px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', color: '#a29bfe', marginBottom: '8px' }}>Navigation Menu</span>
                          <Stack gap="xs">
                            <ColorInput label='Sidebar BG' {...form.getInputProps('sidebar_color')} />
                            <ColorInput label='Navbar BG' {...form.getInputProps('navbar_color')} />
                            <ColorInput label='Active Link Text' {...form.getInputProps('sidebar_active_color')} />
                            <ColorInput label='Active Link BG' {...form.getInputProps('sidebar_active_bg')} />
                          </Stack>
                        </div>

                        {/* Subheading: UI Cards & Controls */}
                        <div style={{ borderTop: '1px solid #141418', paddingTop: '12px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', color: '#a29bfe', marginBottom: '8px' }}>UI Cards & Controls</span>
                          <Stack gap="xs">
                            <ColorInput label='Card BG' {...form.getInputProps('card_color')} />
                            <ColorInput label='Input BG' {...form.getInputProps('input_color')} />
                            <ColorInput label='Button BG' {...form.getInputProps('button_color')} />
                            <ColorInput label='Listing BG' {...form.getInputProps('listing_color')} />
                          </Stack>
                        </div>

                        {/* Subheading: Interactive & Server Actions */}
                        <div style={{ borderTop: '1px solid #141418', paddingTop: '12px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', color: '#a29bfe', marginBottom: '8px' }}>Interactive & Server Actions</span>
                          <Stack gap="xs">
                            <ColorInput label='Console Action BG' {...form.getInputProps('server_action_bg')} />
                            <ColorInput label='Console Start' {...form.getInputProps('power_start_bg')} />
                            <ColorInput label='Console Restart' {...form.getInputProps('power_restart_bg')} />
                            <ColorInput label='Console Stop' {...form.getInputProps('power_stop_bg')} />
                          </Stack>
                        </div>

                        {/* Subheading: Console & Code Editor */}
                        <div style={{ borderTop: '1px solid #141418', paddingTop: '12px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', color: '#a29bfe', marginBottom: '8px' }}>Console & Code Editor</span>
                          <Stack gap="xs">
                            <ColorInput label='Terminal BG' {...form.getInputProps('terminal_color')} />
                            <ColorInput label='Terminal Text' {...form.getInputProps('terminal_text_color')} />
                            <ColorInput label='Terminal Cursor' {...form.getInputProps('terminal_cursor_color')} />
                            <ColorInput label='Terminal Selection' {...form.getInputProps('terminal_selection_color')} />
                            <ColorInput label='Editor BG' {...form.getInputProps('editor_color')} />
                            <ColorInput label='Editor Text' {...form.getInputProps('editor_text_color')} />
                          </Stack>
                        </div>

                        {/* Subheading: Terminal ANSI Colors */}
                        <div style={{ borderTop: '1px solid #141418', paddingTop: '12px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', color: '#a29bfe', marginBottom: '8px' }}>Terminal ANSI Colors</span>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                            <ColorInput label='ANSI Black' {...form.getInputProps('terminal_ansi_black')} />
                            <ColorInput label='ANSI Red' {...form.getInputProps('terminal_ansi_red')} />
                            <ColorInput label='ANSI Green' {...form.getInputProps('terminal_ansi_green')} />
                            <ColorInput label='ANSI Yellow' {...form.getInputProps('terminal_ansi_yellow')} />
                            <ColorInput label='ANSI Blue' {...form.getInputProps('terminal_ansi_blue')} />
                            <ColorInput label='ANSI Magenta' {...form.getInputProps('terminal_ansi_magenta')} />
                            <ColorInput label='ANSI Cyan' {...form.getInputProps('terminal_ansi_cyan')} />
                            <ColorInput label='ANSI White' {...form.getInputProps('terminal_ansi_white')} />
                          </div>
                        </div>
                      </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="light">
                      <Stack gap="md">
                        {/* Subheading: Base Colors */}
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', color: '#a29bfe', marginBottom: '8px' }}>Base Colors (Light)</span>
                          <Stack gap="xs">
                            <ColorInput label='Background' {...form.getInputProps('light_background_color')} />
                            <ColorInput label='Text' {...form.getInputProps('light_text_color')} />
                            <ColorInput label='Focus Accent' {...form.getInputProps('light_focus_color')} />
                            <ColorInput label='Border' {...form.getInputProps('light_border_color')} />
                          </Stack>
                        </div>

                        {/* Subheading: Navigation Menu */}
                        <div style={{ borderTop: '1px solid #141418', paddingTop: '12px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', color: '#a29bfe', marginBottom: '8px' }}>Navigation Menu (Light)</span>
                          <Stack gap="xs">
                            <ColorInput label='Sidebar BG' {...form.getInputProps('light_sidebar_color')} />
                            <ColorInput label='Navbar BG' {...form.getInputProps('light_navbar_color')} />
                            <ColorInput label='Active Link Text' {...form.getInputProps('light_sidebar_active_color')} />
                            <ColorInput label='Active Link BG' {...form.getInputProps('light_sidebar_active_bg')} />
                          </Stack>
                        </div>

                        {/* Subheading: UI Cards & Controls */}
                        <div style={{ borderTop: '1px solid #141418', paddingTop: '12px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', color: '#a29bfe', marginBottom: '8px' }}>UI Cards & Controls (Light)</span>
                          <Stack gap="xs">
                            <ColorInput label='Card BG' {...form.getInputProps('light_card_color')} />
                            <ColorInput label='Input BG' {...form.getInputProps('light_input_color')} />
                            <ColorInput label='Button BG' {...form.getInputProps('light_button_color')} />
                            <ColorInput label='Listing BG' {...form.getInputProps('light_listing_color')} />
                          </Stack>
                        </div>

                        {/* Subheading: Interactive & Server Actions */}
                        <div style={{ borderTop: '1px solid #141418', paddingTop: '12px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', color: '#a29bfe', marginBottom: '8px' }}>Interactive & Server Actions (Light)</span>
                          <Stack gap="xs">
                            <ColorInput label='Console Action BG' {...form.getInputProps('light_server_action_bg')} />
                            <ColorInput label='Console Start' {...form.getInputProps('light_power_start_bg')} />
                            <ColorInput label='Console Restart' {...form.getInputProps('light_power_restart_bg')} />
                            <ColorInput label='Console Stop' {...form.getInputProps('light_power_stop_bg')} />
                          </Stack>
                        </div>

                        {/* Subheading: Console & Code Editor */}
                        <div style={{ borderTop: '1px solid #141418', paddingTop: '12px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', color: '#a29bfe', marginBottom: '8px' }}>Console & Code Editor (Light)</span>
                          <Stack gap="xs">
                            <ColorInput label='Terminal BG' {...form.getInputProps('light_terminal_color')} />
                            <ColorInput label='Terminal Text' {...form.getInputProps('light_terminal_text_color')} />
                            <ColorInput label='Terminal Cursor' {...form.getInputProps('light_terminal_cursor_color')} />
                            <ColorInput label='Terminal Selection' {...form.getInputProps('light_terminal_selection_color')} />
                            <ColorInput label='Editor BG' {...form.getInputProps('light_editor_color')} />
                            <ColorInput label='Editor Text' {...form.getInputProps('light_editor_text_color')} />
                          </Stack>
                        </div>

                        {/* Subheading: Terminal ANSI Colors */}
                        <div style={{ borderTop: '1px solid #141418', paddingTop: '12px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', color: '#a29bfe', marginBottom: '8px' }}>Terminal ANSI Colors (Light)</span>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                            <ColorInput label='ANSI Black' {...form.getInputProps('light_terminal_ansi_black')} />
                            <ColorInput label='ANSI Red' {...form.getInputProps('light_terminal_ansi_red')} />
                            <ColorInput label='ANSI Green' {...form.getInputProps('light_terminal_ansi_green')} />
                            <ColorInput label='ANSI Yellow' {...form.getInputProps('light_terminal_ansi_yellow')} />
                            <ColorInput label='ANSI Blue' {...form.getInputProps('light_terminal_ansi_blue')} />
                            <ColorInput label='ANSI Magenta' {...form.getInputProps('light_terminal_ansi_magenta')} />
                            <ColorInput label='ANSI Cyan' {...form.getInputProps('light_terminal_ansi_cyan')} />
                            <ColorInput label='ANSI White' {...form.getInputProps('light_terminal_ansi_white')} />
                          </div>
                        </div>
                      </Stack>
                    </Tabs.Panel>
                  </Tabs>
                </>
              )}

              {activeTab === 'layout' && (
                <>
                  {/* Wallpaper & Spacing */}
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', color: '#a29bfe', marginBottom: '12px' }}>Wallpaper & Spacing</span>
                    <Stack gap="sm">
                      <TextInput label='Background Image URL' {...form.getInputProps('background_image')} />
                      <TextInput label='Background Image (Light)' {...form.getInputProps('light_background_image')} />
                      <Group grow>
                        <NumberInput label='Wallpaper Blur' min={0} max={50} {...form.getInputProps('wallpaper_blur')} />
                        <NumberInput label='Brightness' min={0} max={1} step={0.1} {...form.getInputProps('wallpaper_brightness')} />
                      </Group>
                      <NumberInput label='Glass Transparency (%)' min={0} max={100} {...form.getInputProps('glass_transparency')} />
                    </Stack>
                  </div>

                  {/* Navigation Spacing */}
                  <div style={{ borderTop: '1px solid #111114', paddingTop: '16px', marginTop: '16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', color: '#a29bfe', marginBottom: '12px' }}>Navigation Spacing</span>
                    <Stack gap="sm">
                      <Group grow>
                        <NumberInput label='Navbar Height (px)' min={32} max={200} {...form.getInputProps('navbar_height')} />
                        <NumberInput label='Link Height (px)' min={20} max={100} {...form.getInputProps('sidebar_item_height')} />
                      </Group>
                      <Group grow>
                        <NumberInput label='Item Gap (px)' min={0} max={100} {...form.getInputProps('sidebar_item_gap')} />
                        <NumberInput label='Sidebar Blur (px)' min={0} max={50} {...form.getInputProps('sidebar_blur')} />
                      </Group>
                      <Switch label='Hover Glow Animations' mt="xs" checked={form.values.sidebar_animation} onChange={(event) => form.setFieldValue('sidebar_animation', event.currentTarget.checked)} />
                    </Stack>
                  </div>

                  {/* Borders & Shadows */}
                  <div style={{ borderTop: '1px solid #111114', paddingTop: '16px', marginTop: '16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', color: '#a29bfe', marginBottom: '12px' }}>Borders & Shadows</span>
                    <Stack gap="sm">
                      <Group grow>
                        <NumberInput label='Card Radius' min={0} max={100} {...form.getInputProps('card_radius')} />
                        <NumberInput label='Input Radius' min={0} max={100} {...form.getInputProps('input_radius')} />
                        <NumberInput label='Button Radius' min={0} max={100} {...form.getInputProps('button_radius')} />
                      </Group>
                      <Group grow>
                        <NumberInput label='Global Radius' min={0} max={100} {...form.getInputProps('border_radius')} />
                      </Group>
                      <Group grow>
                        <NumberInput label='Shadow Opacity' min={0} max={1} step={0.01} decimalScale={2} {...form.getInputProps('shadow_opacity')} />
                        <NumberInput label='Shadow Opacity (Light)' min={0} max={1} step={0.01} decimalScale={2} {...form.getInputProps('light_shadow_opacity')} />
                      </Group>
                    </Stack>
                  </div>

                  {/* Typography */}
                  <div style={{ borderTop: '1px solid #111114', paddingTop: '16px', marginTop: '16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', color: '#a29bfe', marginBottom: '12px' }}>Typography</span>
                    <Stack gap="sm">
                      <TextInput label='Font Family' placeholder='JetBrains Mono' {...form.getInputProps('font_family')} />
                    </Stack>
                  </div>
                </>
              )}

              {activeTab === 'banners' && (
                <>
                  {nests.length === 0 ? (
                    <span style={{ fontSize: '11px', color: '#71717a' }}>No nests loaded.</span>
                  ) : (
                    nests.map((n) => (
                      <div key={n.nest.uuid} style={{ borderBottom: '1px solid #1c1c1f', paddingBottom: '16px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', color: '#a29bfe', marginBottom: '12px' }}>
                          {n.nest.name}
                        </span>
                        <Stack gap="sm">
                          {n.eggs.map((e: any) => {
                            const bannerUrl = form.values.egg_banners?.[e.uuid] || '';
                            return (
                              <div key={e.uuid}>
                                <TextInput
                                  label={`${e.name} Banner URL`}
                                  placeholder='https://example.com/banner.jpg'
                                  value={bannerUrl}
                                  onChange={(event) => {
                                    const val = event.currentTarget.value;
                                    form.setFieldValue('egg_banners', {
                                      ...form.values.egg_banners,
                                      [e.uuid]: val,
                                    });
                                  }}
                                  styles={{ input: { background: '#121214', border: '1px solid #2d2d30', color: '#e2e8f0' } }}
                                />
                                <div style={{
                                  marginTop: '8px',
                                  height: '64px',
                                  width: '100%',
                                  borderRadius: '6px',
                                  border: '1px solid #2d2d30',
                                  backgroundImage: bannerUrl ? `linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.7) 100%), url(${bannerUrl})` : 'none',
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                  backgroundColor: bannerUrl ? 'transparent' : '#121214',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  overflow: 'hidden',
                                  position: 'relative'
                                }}>
                                  {bannerUrl ? (
                                    <span style={{
                                      fontSize: '10px',
                                      fontWeight: 'bold',
                                      color: '#fff',
                                      textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                                    }}>
                                      {e.name} Banner Preview
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: '9px', color: '#71717a' }}>
                                      No custom banner url
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </Stack>
                      </div>
                    ))
                  )}
                </>
              )}

            </Stack>
          </form>
        </ScrollArea>

        {/* Global form tools */}
        <div style={{ borderTop: '1px solid #111114', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '8px', background: '#040405' }}>
          <Group grow>
            <Button onClick={doSave} loading={loading} variant="filled" color="indigo" leftSection={<FontAwesomeIcon icon={faSave} />} styles={{ root: { fontSize: '11px', height: '32px' } }}>
              Save Settings
            </Button>
            <Button onClick={handleReset} variant="outline" color="red" leftSection={<FontAwesomeIcon icon={faRotateLeft} />} styles={{ root: { fontSize: '11px', height: '32px' } }}>
              Reset Settings
            </Button>
          </Group>
          <Group grow>
            <FileButton onChange={handleImportFile} accept="application/json">
              {(props) => (
                <Button {...props} variant="light" color="grape" size="xs" leftSection={<FontAwesomeIcon icon={faUpload} />} styles={{ root: { fontSize: '11px', height: '32px' } }}>
                  Import Config
                </Button>
              )}
            </FileButton>
            <Button onClick={handleExportFile} variant="light" color="indigo" size="xs" leftSection={<FontAwesomeIcon icon={faDownload} />} styles={{ root: { fontSize: '11px', height: '32px' } }}>
              Export Config
            </Button>
          </Group>
        </div>
      </div>

      {/* 3. Live Preview Iframe */}
      <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', background: '#000000' }}>
        <div style={{ 
          padding: '12px 20px', 
          background: '#040405', 
          border: '1px solid #111114',
          borderBottom: 'none',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          boxSizing: 'border-box'
        }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#e2e8f0' }}>LIVE DASHBOARD PREVIEW</span>
          <span style={{ fontSize: '9px', color: '#71717a' }}>Iframe Container (Root URL)</span>
        </div>
        <iframe
          ref={iframeRef}
          src="/"
          style={{
            flex: 1,
            border: '1px solid #111114',
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px',
            background: 'var(--ds-background, #1a1b26)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 0, 0, 0.2)'
          }}
        />
      </div>

      {/* Floating Unsaved Changes Warning Banner */}
      {form.isDirty() && (
        <div style={{
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
          boxSizing: 'border-box'
        }}>
          <span style={{ fontSize: '13px', fontWeight: 500, fontFamily: 'system-ui, sans-serif' }}>
            {navigator.language.startsWith('vi') ? 'Hãy cẩn thận – bạn chưa lưu các thay đổi!' : 'Careful — you have unsaved changes!'}
          </span>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              type="button"
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
                fontFamily: 'system-ui, sans-serif'
              }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              {navigator.language.startsWith('vi') ? 'Đặt lại' : 'Reset'}
            </button>
            <Button
              onClick={doSave}
              loading={loading}
              color="green"
              size="xs"
              styles={{
                root: {
                  fontSize: '12px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: '#23a55a',
                  fontFamily: 'system-ui, sans-serif',
                  '&:hover': {
                    backgroundColor: '#1a7f43'
                  }
                }
              }}
            >
              {navigator.language.startsWith('vi') ? 'Lưu Thay Đổi' : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
