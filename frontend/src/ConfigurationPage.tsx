import React, { useEffect, useState } from 'react';
import { Stack, Group, ColorInput, NumberInput, TextInput, Switch, Tabs, useComputedColorScheme, FileButton } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPalette, faUpload, faDownload } from '@fortawesome/free-solid-svg-icons';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';
import { httpErrorToHuman, axiosInstance } from '@/api/axios.ts';
import getAllEggs from '@/api/admin/nests/getAllEggs.ts';
import Button from '@/elements/Button.tsx';
import TitleCard from '@/elements/TitleCard.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import { qunixThemeSettingsSchema } from './lib/schemas.ts';

export default function ConfigurationPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [nests, setNests] = useState<any[]>([]);
  const computedColorScheme = useComputedColorScheme('dark');

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
        form.setValues({
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

  useEffect(() => {
    const root = document.documentElement;
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
  ]);

  const doSave = () => {
    const payload = {
      background_color: form.values.background_color,
      text_color: form.values.text_color,
      focus_color: form.values.focus_color,
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
    };

    console.log('QUNIX_THEME: Attempting to save settings:', payload);
    setLoading(true);
    axiosInstance
      .put('/api/admin/extensions/dev.qunix.theme/settings', payload)
      .then((res) => {
        console.log('QUNIX_THEME: Save successful:', res.data);
        addToast('Theme settings saved. Refresh the page to apply.', 'success');
      })
      .catch((err) => {
        console.error('QUNIX_THEME: Save failed:', err);
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
          const firstErr = result.error.errors[0];
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
              <Tabs variant="pills" defaultValue="dark" classNames={{ panel: 'pt-3' }}>
                <Tabs.List>
                  <Tabs.Tab value="dark">Dark Theme Colors</Tabs.Tab>
                  <Tabs.Tab value="light">Light Theme Colors</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="dark">
                  <Stack gap="md" mt="xs">
                    <Group grow>
                      <ColorInput
                        label='Background Color'
                        description='The main background color of the panel.'
                        {...form.getInputProps('background_color')}
                      />
                      <ColorInput
                        label='Text Color'
                        description='The primary text color.'
                        {...form.getInputProps('text_color')}
                      />
                    </Group>
                    <Group grow>
                      <ColorInput
                        label='Focus Color'
                        description='Color used for focus rings and active elements.'
                        {...form.getInputProps('focus_color')}
                      />
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
                    <Group grow>
                      <ColorInput
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

                <Tabs.Panel value="light">
                  <Stack gap="md" mt="xs">
                    <Group grow>
                      <ColorInput
                        label='Background Color (Light)'
                        description='The main background color of the panel in light mode.'
                        {...form.getInputProps('light_background_color')}
                      />
                      <ColorInput
                        label='Text Color (Light)'
                        description='The primary text color in light mode.'
                        {...form.getInputProps('light_text_color')}
                      />
                    </Group>
                    <Group grow>
                      <ColorInput
                        label='Focus Color (Light)'
                        description='Color used for focus rings and active elements in light mode.'
                        {...form.getInputProps('light_focus_color')}
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
                    <Group grow>
                      <ColorInput
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
                <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--ds-primary-color)' }}>Layout Settings (Universal)</h4>
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
              <Tabs variant="pills" defaultValue="dark" classNames={{ panel: 'pt-3' }}>
                <Tabs.List>
                  <Tabs.Tab value="dark">Dark Theme Colors</Tabs.Tab>
                  <Tabs.Tab value="light">Light Theme Colors</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="dark">
                  <Stack gap="md" mt="xs">
                    <Group grow>
                      <ColorInput
                        label='Menu / Navbar Color'
                        description='The background color of the top navigation bar and dropdown menus.'
                        {...form.getInputProps('navbar_color')}
                      />
                      <ColorInput
                        label='Sidebar (Mobile) Color'
                        description='The background color of the sidebar.'
                        {...form.getInputProps('sidebar_color')}
                      />
                    </Group>
                    <Group grow>
                      <ColorInput
                        label='Sidebar Active Tab Text/Icon Color'
                        description='Text and icon color of the active sidebar tab.'
                        {...form.getInputProps('sidebar_active_color')}
                      />
                      <ColorInput
                        label='Sidebar Active Tab Background'
                        description='Background color of the active sidebar tab.'
                        {...form.getInputProps('sidebar_active_bg')}
                      />
                    </Group>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="light">
                  <Stack gap="md" mt="xs">
                    <Group grow>
                      <ColorInput
                        label='Menu / Navbar Color (Light)'
                        description='The background color of the top navigation bar in light mode.'
                        {...form.getInputProps('light_navbar_color')}
                      />
                      <ColorInput
                        label='Sidebar Color (Light)'
                        description='The background color of the sidebar in light mode.'
                        {...form.getInputProps('light_sidebar_color')}
                      />
                    </Group>
                    <Group grow>
                      <ColorInput
                        label='Sidebar Active Tab Text/Icon Color (Light)'
                        description='Text and icon color of the active sidebar tab in light mode.'
                        {...form.getInputProps('light_sidebar_active_color')}
                      />
                      <ColorInput
                        label='Sidebar Active Tab Background (Light)'
                        description='Background color of the active sidebar tab in light mode.'
                        {...form.getInputProps('light_sidebar_active_bg')}
                      />
                    </Group>
                  </Stack>
                </Tabs.Panel>
              </Tabs>

              <div style={{ borderTop: '1px solid var(--ds-border-color)', paddingTop: '16px', marginTop: '8px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--ds-primary-color)' }}>Layout Settings (Universal)</h4>
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
              </div>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='card'>
            <Stack gap='md'>
              <Tabs variant="pills" defaultValue="dark" classNames={{ panel: 'pt-3' }}>
                <Tabs.List>
                  <Tabs.Tab value="dark">Dark Theme Colors</Tabs.Tab>
                  <Tabs.Tab value="light">Light Theme Colors</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="dark">
                  <Stack gap="md" mt="xs">
                    <Group grow>
                      <ColorInput
                        label='Card Color'
                        description='The background color of cards and segments.'
                        {...form.getInputProps('card_color')}
                      />
                      <ColorInput
                        label='Input Background'
                        description='The background color for text inputs.'
                        {...form.getInputProps('input_color')}
                      />
                    </Group>
                    <Group grow>
                      <ColorInput
                        label='Button Color'
                        description='The primary color for buttons.'
                        {...form.getInputProps('button_color')}
                      />
                      <ColorInput
                        label='Server Action Background Color'
                        description='Default background color for the server action container when no egg banner is configured.'
                        {...form.getInputProps('server_action_bg')}
                      />
                    </Group>
                    <Group grow>
                      <ColorInput
                        label='Console Start Button Color'
                        description='Background color for the Start button in the server console.'
                        {...form.getInputProps('power_start_bg')}
                      />
                      <ColorInput
                        label='Console Restart Button Color'
                        description='Background color for the Restart button in the server console.'
                        {...form.getInputProps('power_restart_bg')}
                      />
                      <ColorInput
                        label='Console Stop Button Color'
                        description='Background color for the Stop/Kill button in the server console.'
                        {...form.getInputProps('power_stop_bg')}
                      />
                    </Group>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="light">
                  <Stack gap="md" mt="xs">
                    <Group grow>
                      <ColorInput
                        label='Card Color (Light)'
                        description='The background color of cards in light mode.'
                        {...form.getInputProps('light_card_color')}
                      />
                      <ColorInput
                        label='Input Background (Light)'
                        description='The background color for text inputs in light mode.'
                        {...form.getInputProps('light_input_color')}
                      />
                    </Group>
                    <Group grow>
                      <ColorInput
                        label='Button Color (Light)'
                        description='The primary color for buttons in light mode.'
                        {...form.getInputProps('light_button_color')}
                      />
                      <ColorInput
                        label='Server Action Background Color (Light)'
                        description='Default background color for the server action container in light mode.'
                        {...form.getInputProps('light_server_action_bg')}
                      />
                    </Group>
                    <Group grow>
                      <ColorInput
                        label='Console Start Button Color (Light)'
                        description='Background color for the Start button in light mode.'
                        {...form.getInputProps('light_power_start_bg')}
                      />
                      <ColorInput
                        label='Console Restart Button Color (Light)'
                        description='Background color for the Restart button in light mode.'
                        {...form.getInputProps('light_power_restart_bg')}
                      />
                      <ColorInput
                        label='Console Stop Button Color (Light)'
                        description='Background color for the Stop/Kill button in light mode.'
                        {...form.getInputProps('light_power_stop_bg')}
                      />
                    </Group>
                  </Stack>
                </Tabs.Panel>
              </Tabs>

              <div style={{ borderTop: '1px solid var(--ds-border-color)', paddingTop: '16px', marginTop: '8px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--ds-primary-color)' }}>Layout Settings (Universal)</h4>
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
              <Tabs variant="pills" defaultValue="dark" classNames={{ panel: 'pt-3' }}>
                <Tabs.List>
                  <Tabs.Tab value="dark">Dark Theme Colors</Tabs.Tab>
                  <Tabs.Tab value="light">Light Theme Colors</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="dark">
                  <Stack gap="md" mt="xs">
                    <Group grow>
                      <ColorInput
                        label='Listing Color'
                        description='The background color for lists and tables (Nodes, Users, Files, etc.).'
                        {...form.getInputProps('listing_color')}
                      />
                    </Group>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="light">
                  <Stack gap="md" mt="xs">
                    <Group grow>
                      <ColorInput
                        label='Listing Color (Light)'
                        description='The background color for lists and tables in light mode.'
                        {...form.getInputProps('light_listing_color')}
                      />
                    </Group>
                  </Stack>
                </Tabs.Panel>
              </Tabs>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='terminal'>
            <Stack gap='md'>
              <Tabs variant="pills" defaultValue="dark" classNames={{ panel: 'pt-3' }}>
                <Tabs.List>
                  <Tabs.Tab value="dark">Dark Theme Colors</Tabs.Tab>
                  <Tabs.Tab value="light">Light Theme Colors</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="dark">
                  <Stack gap="md" mt="xs">
                    <Group grow>
                      <ColorInput
                        label='Terminal Background'
                        description='The background color for terminals.'
                        {...form.getInputProps('terminal_color')}
                      />
                      <ColorInput
                        label='Terminal Text'
                        description='The text color for terminals.'
                        {...form.getInputProps('terminal_text_color')}
                      />
                    </Group>
                    <Group grow style={{ display: 'none' }}>
                      <ColorInput
                        label='Terminal Cursor Color'
                        description='The color of the terminal cursor.'
                        {...form.getInputProps('terminal_cursor_color')}
                      />
                      <ColorInput
                        label='Terminal Selection Background'
                        description='Background color for selected text in terminals.'
                        {...form.getInputProps('terminal_selection_color')}
                      />
                    </Group>
                    <Group grow style={{ display: 'none' }}>
                      <ColorInput
                        label='Terminal Black'
                        description='ANSI Color: Black'
                        {...form.getInputProps('terminal_ansi_black')}
                      />
                      <ColorInput
                        label='Terminal Red'
                        description='ANSI Color: Red'
                        {...form.getInputProps('terminal_ansi_red')}
                      />
                      <ColorInput
                        label='Terminal Green'
                        description='ANSI Color: Green'
                        {...form.getInputProps('terminal_ansi_green')}
                      />
                      <ColorInput
                        label='Terminal Yellow'
                        description='ANSI Color: Yellow'
                        {...form.getInputProps('terminal_ansi_yellow')}
                      />
                    </Group>
                    <Group grow style={{ display: 'none' }}>
                      <ColorInput
                        label='Terminal Blue'
                        description='ANSI Color: Blue'
                        {...form.getInputProps('terminal_ansi_blue')}
                      />
                      <ColorInput
                        label='Terminal Magenta'
                        description='ANSI Color: Magenta'
                        {...form.getInputProps('terminal_ansi_magenta')}
                      />
                      <ColorInput
                        label='Terminal Cyan'
                        description='ANSI Color: Cyan'
                        {...form.getInputProps('terminal_ansi_cyan')}
                      />
                      <ColorInput
                        label='Terminal White'
                        description='ANSI Color: White'
                        {...form.getInputProps('terminal_ansi_white')}
                      />
                    </Group>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="light">
                  <Stack gap="md" mt="xs">
                    <Group grow>
                      <ColorInput
                        label='Terminal Background (Light)'
                        description='The background color for terminals in light mode.'
                        {...form.getInputProps('light_terminal_color')}
                      />
                      <ColorInput
                        label='Terminal Text (Light)'
                        description='The text color for terminals in light mode.'
                        {...form.getInputProps('light_terminal_text_color')}
                      />
                    </Group>
                    <Group grow style={{ display: 'none' }}>
                      <ColorInput
                        label='Terminal Cursor Color (Light)'
                        description='The color of the terminal cursor in light mode.'
                        {...form.getInputProps('light_terminal_cursor_color')}
                      />
                      <ColorInput
                        label='Terminal Selection Background (Light)'
                        description='Background color for selected text in light mode.'
                        {...form.getInputProps('light_terminal_selection_color')}
                      />
                    </Group>
                    <Group grow style={{ display: 'none' }}>
                      <ColorInput
                        label='Terminal Black (Light)'
                        description='ANSI Color: Black in light mode.'
                        {...form.getInputProps('light_terminal_ansi_black')}
                      />
                      <ColorInput
                        label='Terminal Red (Light)'
                        description='ANSI Color: Red in light mode.'
                        {...form.getInputProps('light_terminal_ansi_red')}
                      />
                      <ColorInput
                        label='Terminal Green (Light)'
                        description='ANSI Color: Green in light mode.'
                        {...form.getInputProps('light_terminal_ansi_green')}
                      />
                      <ColorInput
                        label='Terminal Yellow (Light)'
                        description='ANSI Color: Yellow in light mode.'
                        {...form.getInputProps('light_terminal_ansi_yellow')}
                      />
                    </Group>
                    <Group grow style={{ display: 'none' }}>
                      <ColorInput
                        label='Terminal Blue (Light)'
                        description='ANSI Color: Blue in light mode.'
                        {...form.getInputProps('light_terminal_ansi_blue')}
                      />
                      <ColorInput
                        label='Terminal Magenta (Light)'
                        description='ANSI Color: Magenta in light mode.'
                        {...form.getInputProps('light_terminal_ansi_magenta')}
                      />
                      <ColorInput
                        label='Terminal Cyan (Light)'
                        description='ANSI Color: Cyan in light mode.'
                        {...form.getInputProps('light_terminal_ansi_cyan')}
                      />
                      <ColorInput
                        label='Terminal White (Light)'
                        description='ANSI Color: White in light mode.'
                        {...form.getInputProps('light_terminal_ansi_white')}
                      />
                    </Group>
                  </Stack>
                </Tabs.Panel>
              </Tabs>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='editor'>
            <Stack gap='md'>
              <Tabs variant="pills" defaultValue="dark" classNames={{ panel: 'pt-3' }}>
                <Tabs.List>
                  <Tabs.Tab value="dark">Dark Theme Colors</Tabs.Tab>
                  <Tabs.Tab value="light">Light Theme Colors</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="dark">
                  <Stack gap="md" mt="xs">
                    <Group grow>
                      <ColorInput
                        label='Editor Background'
                        description='The background color for code editors (File Manager).'
                        {...form.getInputProps('editor_color')}
                      />
                      <ColorInput
                        label='Editor Text'
                        description='The text color for code editors.'
                        {...form.getInputProps('editor_text_color')}
                      />
                    </Group>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="light">
                  <Stack gap="md" mt="xs">
                    <Group grow>
                      <ColorInput
                        label='Editor Background (Light)'
                        description='The background color for code editors in light mode.'
                        {...form.getInputProps('light_editor_color')}
                      />
                      <ColorInput
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
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--ds-primary-color)' }}>
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

        <Group mt='xl' justify="space-between">
          <Group>
            <Button type='submit' loading={loading} className='w-fit!'>
              Save Settings
            </Button>
            <Button variant='outline' color='red' onClick={handleReset} loading={loading} className='w-fit!'>
              Reset to Default
            </Button>
          </Group>
          <Group>
            <FileButton onChange={handleImportFile} accept="application/json">
              {(props) => (
                <Button {...props} variant="light" color="grape" leftSection={<FontAwesomeIcon icon={faUpload} />}>
                  Import Theme
                </Button>
              )}
            </FileButton>
            <Button variant="light" color="indigo" onClick={handleExportFile} leftSection={<FontAwesomeIcon icon={faDownload} />}>
              Export Theme
            </Button>
          </Group>
        </Group>
      </form>
    </TitleCard>
  );
}