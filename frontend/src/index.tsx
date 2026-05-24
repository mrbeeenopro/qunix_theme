import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useLocation } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faMicrochip, faMemory, faHardDrive, faCopy, faCloudDownload, faCloudUpload } from '@fortawesome/free-solid-svg-icons';
import { Extension, ExtensionContext } from 'shared';
import { useComputedColorScheme, type MantineThemeOverride } from '@mantine/core';
import { axiosInstance } from '@/api/axios.ts';
import { useServerStore } from '@/stores/server.ts';
import { bytesToString, mbToBytes } from '@/lib/size.ts';
import { formatMilliseconds } from '@/lib/time.ts';
import { formatAllocation } from '@/lib/server.ts';
import ConfigurationPage from './ConfigurationPage.tsx';
import './app.css';

const StatsOverlay: React.FC = () => {
  const { server, stats, state } = useServerStore();

  if (!server || !stats) return null;

  const uptimeStr = state === 'offline' && server.status !== 'installing'
    ? 'Offline'
    : formatMilliseconds(stats.uptime || 0);

  const cpuStr = `${(stats.cpuAbsolute || 0).toFixed(2)}% / ${server.limits.cpu !== 0 ? `${server.limits.cpu}%` : 'Unlimited'}`;
  const memoryStr = `${bytesToString(stats.memoryBytes || 0)} / ${server.limits.memory !== 0 ? bytesToString(mbToBytes(server.limits.memory)) : 'Unlimited'}`;
  const diskStr = `${bytesToString(stats.diskBytes || 0)} / ${server.limits.disk !== 0 ? bytesToString(mbToBytes(server.limits.disk)) : 'Unlimited'}`;
  const netInStr = state === 'offline' && server.status !== 'installing'
    ? 'Offline'
    : bytesToString(stats.network?.rxBytes || 0);
  const netOutStr = state === 'offline' && server.status !== 'installing'
    ? 'Offline'
    : bytesToString(stats.network?.txBytes || 0);

  return (
    <div className='qunix-banner-stats'>
      <div className='qunix-banner-stat-item' title='Uptime'>
        <FontAwesomeIcon icon={faClock} />
        <span>{uptimeStr}</span>
      </div>
      <div className='qunix-banner-stat-item' title='CPU Usage'>
        <FontAwesomeIcon icon={faMicrochip} />
        <span>{cpuStr}</span>
      </div>
      <div className='qunix-banner-stat-item' title='Memory Usage'>
        <FontAwesomeIcon icon={faMemory} />
        <span>{memoryStr}</span>
      </div>
      <div className='qunix-banner-stat-item' title='Disk Usage'>
        <FontAwesomeIcon icon={faHardDrive} />
        <span>{diskStr}</span>
      </div>
      <div className='qunix-banner-stat-item' title='Network In'>
        <FontAwesomeIcon icon={faCloudDownload} />
        <span>{netInStr}</span>
      </div>
      <div className='qunix-banner-stat-item' title='Network Out'>
        <FontAwesomeIcon icon={faCloudUpload} />
        <span>{netOutStr}</span>
      </div>
    </div>
  );
};

const AllocationPill: React.FC = () => {
  const { server } = useServerStore();
  const [copied, setCopied] = useState(false);

  if (!server || !server.allocation) return null;

  const allocationStr = formatAllocation(server.allocation, server.egg.separatePort);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(allocationStr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button onClick={handleCopy} className='qunix-banner-allocation-pill' title='Click to copy IP Address'>
      <span className='allocation-text'>{allocationStr}</span>
      <span className='icon-wrap'>
        {copied ? (
          <span className='copied-text'>Copied!</span>
        ) : (
          <FontAwesomeIcon icon={faCopy} />
        )}
      </span>
    </button>
  );
};

const ServerBannerComponent: React.FC = () => {
  const { server } = useServerStore();
  const [settings, setSettings] = useState<any>(null);
  const { id } = useParams();
  const location = useLocation();
  const [infoBarLeftCol, setInfoBarLeftCol] = useState<Element | null>(null);
  const [infoBarMain, setInfoBarMain] = useState<Element | null>(null);
  const [hasBanner, setHasBanner] = useState(false);

  useEffect(() => {
    axiosInstance
      .get('/api/dev.qunix.theme/settings')
      .then((res) => {
        const s = res.data.settings;
        setSettings(s);
        (window as any).qunixThemeSettings = s;
        window.dispatchEvent(new CustomEvent('qunix-settings-loaded', { detail: s }));

        const root = document.documentElement;
        const eggBanners = s.egg_banners || s.eggBanners || {};
        for (const [eggUuid, bannerUrl] of Object.entries(eggBanners)) {
          if (bannerUrl) {
            root.style.setProperty(`--ds-egg-banner-${eggUuid}`, `url(${bannerUrl})`);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load theme settings for banner:', err);
      });

    return () => {
      const root = document.documentElement;
      root.style.setProperty('--ds-server-banner-image', 'none');
      root.classList.remove('has-server-banner');
    };
  }, []);

  const isConsolePage = !!id && (location.pathname.endsWith(`/server/${id}`) || location.pathname.endsWith(`/server/${id}/`));

  useEffect(() => {
    const root = document.documentElement;
    if (!server || !server.uuid || !server.egg || !settings || !isConsolePage) {
      root.style.setProperty('--ds-server-banner-image', 'none');
      root.classList.remove('has-server-banner');
      setHasBanner(false);
      return;
    }

    const eggBanners = settings.egg_banners || settings.eggBanners || {};
    const bannerUrl = eggBanners[server.egg.uuid];

    if (bannerUrl) {
      root.style.setProperty('--ds-server-banner-image', `url(${bannerUrl})`);
      root.classList.add('has-server-banner');
      setHasBanner(true);
    } else {
      root.style.setProperty('--ds-server-banner-image', 'none');
      root.classList.remove('has-server-banner');
      setHasBanner(false);
    }
  }, [server, settings, isConsolePage]);

  useEffect(() => {
    if (!isConsolePage) {
      setInfoBarLeftCol(null);
      setInfoBarMain(null);
      return;
    }

    // Try finding immediately
    const mainEl = document.querySelector('#console-infobar > div');
    const leftEl = document.querySelector('#console-infobar .flex-col');
    const gridEl = document.querySelector('#console-infobar + .grid');

    if (mainEl && leftEl) {
      setInfoBarLeftCol(leftEl);
      setInfoBarMain(mainEl);
    }
    if (gridEl && hasBanner) {
      gridEl.classList.add('qunix-stretched-console-grid');
    } else if (gridEl) {
      gridEl.classList.remove('qunix-stretched-console-grid');
    }

    // Otherwise check periodically
    let attempts = 0;
    const interval = setInterval(() => {
      const mainEl = document.querySelector('#console-infobar > div');
      const leftEl = document.querySelector('#console-infobar .flex-col');
      const gridEl = document.querySelector('#console-infobar + .grid');

      let foundAll = true;
      if (mainEl && leftEl) {
        setInfoBarLeftCol(leftEl);
        setInfoBarMain(mainEl);
      } else {
        foundAll = false;
      }

      if (gridEl && hasBanner) {
        gridEl.classList.add('qunix-stretched-console-grid');
      } else if (gridEl) {
        gridEl.classList.remove('qunix-stretched-console-grid');
      }

      if (foundAll || attempts > 50) {
        clearInterval(interval);
      }
      attempts++;
    }, 100);

    return () => {
      clearInterval(interval);
      setInfoBarLeftCol(null);
      setInfoBarMain(null);
      const gridEl = document.querySelector('#console-infobar + .grid');
      if (gridEl) {
        gridEl.classList.remove('qunix-stretched-console-grid');
      }
    };
  }, [isConsolePage, hasBanner, location.pathname]);

  if (hasBanner && isConsolePage && infoBarLeftCol && infoBarMain && document.body.contains(infoBarLeftCol) && document.body.contains(infoBarMain)) {
    return (
      <>
        {createPortal(<StatsOverlay />, infoBarLeftCol)}
        {createPortal(<AllocationPill />, infoBarMain)}
      </>
    );
  }

  return null;
};

const QunixThemeLoader: React.FC = () => {
  const computedColorScheme = useComputedColorScheme('dark');
  const [settings, setSettings] = useState<any>(() => (window as any).qunixThemeSettings);

  useEffect(() => {
    const handleLoaded = (e: Event) => {
      setSettings((e as CustomEvent).detail);
    };
    window.addEventListener('qunix-settings-loaded', handleLoaded);
    return () => window.removeEventListener('qunix-settings-loaded', handleLoaded);
  }, []);

  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;
    const isDark = computedColorScheme === 'dark';

    const getThemeVal = (darkVal: string, lightVal: string) => {
      return isDark ? darkVal : lightVal;
    };

    const getThemeValOpt = (darkVal: any, lightVal: any) => {
      return isDark ? darkVal : lightVal;
    };

    const backgroundColor = getThemeVal(settings.background_color || settings.backgroundColor, settings.light_background_color || settings.lightBackgroundColor || '#f3effaff');
    const textColor = getThemeVal(settings.text_color || settings.textColor, settings.light_text_color || settings.lightTextColor || '#1e1631ff');
    const focusColor = getThemeVal(settings.focus_color || settings.focusColor, settings.light_focus_color || settings.lightFocusColor || 'hsla(263, 85%, 60%, 1.00)');
    const sidebarColor = getThemeVal(settings.sidebar_color || settings.sidebarColor, settings.light_sidebar_color || settings.lightSidebarColor || '#ffffffff');
    const cardColor = getThemeVal(settings.card_color || settings.cardColor, settings.light_card_color || settings.lightCardColor || '#ffffffff');
    const borderColor = getThemeVal(settings.border_color || settings.borderColor, settings.light_border_color || settings.lightBorderColor || 'rgba(108, 92, 231, 0.15)');
    const navbarColor = getThemeVal(settings.navbar_color || settings.navbarColor, settings.light_navbar_color || settings.lightNavbarColor || '#ffffffff');
    const terminalColor = getThemeVal(settings.terminal_color || settings.terminalColor, settings.light_terminal_color || settings.lightTerminalColor || '#f1f2f6ff');
    const terminalTextColor = getThemeVal(settings.terminal_text_color || settings.terminalTextColor, settings.light_terminal_text_color || settings.lightTerminalTextColor || '#2f3542ff');
    const inputColor = getThemeVal(settings.input_color || settings.inputColor, settings.light_input_color || settings.lightInputColor || '#f1f2f6ff');
    const editorColor = getThemeVal(settings.editor_color || settings.editorColor, settings.light_editor_color || settings.lightEditorColor || '#ffffffff');
    const editorTextColor = getThemeVal(settings.editor_text_color || settings.editorTextColor, settings.light_editor_text_color || settings.lightEditorTextColor || '#2f3542ff');
    const listingColor = getThemeVal(settings.listing_color || settings.listingColor, settings.light_listing_color || settings.lightListingColor || '#ffffffff');
    const buttonColor = getThemeVal(settings.button_color || settings.buttonColor, settings.light_button_color || settings.lightButtonColor || '#6c5ce7ff');
    const serverActionBg = getThemeVal(settings.server_action_bg || settings.serverActionBg || settings.server_action_color || settings.serverActionColor, settings.light_server_action_bg || settings.lightServerActionBg || '#f1f2f6ff');
    const powerStartBg = getThemeVal(settings.power_start_bg || settings.powerStartBg, settings.light_power_start_bg || settings.lightPowerStartBg || '#2ed573ff');
    const powerRestartBg = getThemeVal(settings.power_restart_bg || settings.powerRestartBg, settings.light_power_restart_bg || settings.lightPowerRestartBg || '#747d8cff');
    const powerStopBg = getThemeVal(settings.power_stop_bg || settings.powerStopBg, settings.light_power_stop_bg || settings.lightPowerStopBg || '#ff4757ff');
    const sidebarActiveColor = getThemeVal(settings.sidebar_active_color || settings.sidebarActiveColor, settings.light_sidebar_active_color || settings.lightSidebarActiveColor || '#6c5ce7ff');
    const sidebarActiveBg = getThemeVal(settings.sidebar_active_bg || settings.sidebarActiveBg, settings.light_sidebar_active_bg || settings.lightSidebarActiveBg || 'rgba(108, 92, 231, 0.1)');
    const backgroundImage = getThemeValOpt(settings.background_image || settings.backgroundImage, settings.light_background_image || settings.lightBackgroundImage);
    const shadowOpacity = getThemeValOpt(settings.shadow_opacity !== undefined ? settings.shadow_opacity : settings.shadowOpacity, settings.light_shadow_opacity !== undefined ? settings.light_shadow_opacity : settings.lightShadowOpacity);

    const borderRadius = settings.border_radius !== undefined ? settings.border_radius : settings.borderRadius;
    const buttonRadius = settings.button_radius !== undefined ? settings.button_radius : settings.buttonRadius;
    const inputRadius = settings.input_radius !== undefined ? settings.input_radius : settings.inputRadius;
    const cardRadius = settings.card_radius !== undefined ? settings.card_radius : settings.cardRadius;
    const navbarHeight = settings.navbar_height !== undefined ? settings.navbar_height : settings.navbarHeight;
    const sidebarItemGap = settings.sidebar_item_gap !== undefined ? settings.sidebar_item_gap : settings.sidebarItemGap;
    const sidebarBlur = settings.sidebar_blur !== undefined ? settings.sidebar_blur : settings.sidebarBlur;
    const wallpaperBlur = settings.wallpaper_blur !== undefined ? settings.wallpaper_blur : settings.wallpaperBlur;
    const wallpaperBrightness = settings.wallpaper_brightness !== undefined ? settings.wallpaper_brightness : settings.wallpaperBrightness;
    const glassTransparency = settings.glass_transparency !== undefined ? settings.glass_transparency : settings.glassTransparency;
    const sidebarAnimation = settings.sidebar_animation !== undefined ? settings.sidebar_animation : settings.sidebarAnimation;
    const fontFamily = settings.font_family || settings.fontFamily;
    const sidebarItemHeight = settings.sidebar_item_height !== undefined ? settings.sidebar_item_height : settings.sidebarItemHeight;

    const terminalCursor = getThemeVal(settings.terminal_cursor_color || settings.terminalCursorColor, settings.light_terminal_cursor_color || settings.lightTerminalCursorColor || '#6c5ce7ff');
    const terminalSelection = getThemeVal(settings.terminal_selection_color || settings.terminalSelectionColor, settings.light_terminal_selection_color || settings.lightTerminalSelectionColor || 'rgba(108, 92, 231, 0.3)');
    const ansiBlack = getThemeVal(settings.terminal_ansi_black || settings.terminalAnsiBlack, settings.light_terminal_ansi_black || settings.lightTerminalAnsiBlack || '#d5d6db');
    const ansiRed = getThemeVal(settings.terminal_ansi_red || settings.terminalAnsiRed, settings.light_terminal_ansi_red || settings.lightTerminalAnsiRed || '#f7768e');
    const ansiGreen = getThemeVal(settings.terminal_ansi_green || settings.terminalAnsiGreen, settings.light_terminal_ansi_green || settings.lightTerminalAnsiGreen || '#485e30');
    const ansiYellow = getThemeVal(settings.terminal_ansi_yellow || settings.terminalAnsiYellow, settings.light_terminal_ansi_yellow || settings.lightTerminalAnsiYellow || '#8f5e15');
    const ansiBlue = getThemeVal(settings.terminal_ansi_blue || settings.terminalAnsiBlue, settings.light_terminal_ansi_blue || settings.lightTerminalAnsiBlue || '#34548a');
    const ansiMagenta = getThemeVal(settings.terminal_ansi_magenta || settings.terminalAnsiMagenta, settings.light_terminal_ansi_magenta || settings.lightTerminalAnsiMagenta || '#5a4a78');
    const ansiCyan = getThemeVal(settings.terminal_ansi_cyan || settings.terminalAnsiCyan, settings.light_terminal_ansi_cyan || settings.lightTerminalAnsiCyan || '#0f4b6e');
    const ansiWhite = getThemeVal(settings.terminal_ansi_white || settings.terminalAnsiWhite, settings.light_terminal_ansi_white || settings.lightTerminalAnsiWhite || '#343b58');

    root.style.setProperty('--ds-background', backgroundColor);
    root.style.setProperty('--ds-gray-900', textColor);
    root.style.setProperty('--ds-focus-color', focusColor);
    root.style.setProperty('--ds-primary-color', buttonColor);
    root.style.setProperty('--ds-sidebar-bg', sidebarColor);
    root.style.setProperty('--ds-sidebar-active-color', sidebarActiveColor);
    root.style.setProperty('--ds-sidebar-active-bg', sidebarActiveBg);
    root.style.setProperty('--ds-card-bg', cardColor);
    root.style.setProperty('--ds-border-color', borderColor);
    root.style.setProperty('--ds-navbar-bg', navbarColor);
    root.style.setProperty('--ds-terminal-bg', terminalColor);
    root.style.setProperty('--ds-terminal-text', terminalTextColor);
    root.style.setProperty('--ds-input-bg', inputColor);
    root.style.setProperty('--ds-editor-bg', editorColor);
    root.style.setProperty('--ds-editor-text', editorTextColor);
    root.style.setProperty('--ds-listing-bg', listingColor);
    root.style.setProperty('--ds-server-action-bg', serverActionBg);
    root.style.setProperty('--ds-power-start-bg', powerStartBg);
    root.style.setProperty('--ds-power-restart-bg', powerRestartBg);
    root.style.setProperty('--ds-power-stop-bg', powerStopBg);
    root.style.setProperty('--ds-terminal-cursor', terminalCursor);
    root.style.setProperty('--ds-terminal-selection', terminalSelection);
    root.style.setProperty('--ds-terminal-ansi-black', ansiBlack);
    root.style.setProperty('--ds-terminal-ansi-red', ansiRed);
    root.style.setProperty('--ds-terminal-ansi-green', ansiGreen);
    root.style.setProperty('--ds-terminal-ansi-yellow', ansiYellow);
    root.style.setProperty('--ds-terminal-ansi-blue', ansiBlue);
    root.style.setProperty('--ds-terminal-ansi-magenta', ansiMagenta);
    root.style.setProperty('--ds-terminal-ansi-cyan', ansiCyan);
    root.style.setProperty('--ds-terminal-ansi-white', ansiWhite);

    if (borderRadius !== undefined) root.style.setProperty('--ds-border-radius', `${borderRadius}px`);
    if (buttonRadius !== undefined) root.style.setProperty('--ds-button-radius', `${buttonRadius}px`);
    if (inputRadius !== undefined) root.style.setProperty('--ds-input-radius', `${inputRadius}px`);
    if (cardRadius !== undefined) root.style.setProperty('--ds-card-radius', `${cardRadius}px`);
    if (navbarHeight !== undefined) root.style.setProperty('--ds-navbar-height', `${navbarHeight}px`);
    if (sidebarItemGap !== undefined) root.style.setProperty('--ds-sidebar-item-gap', `${sidebarItemGap}px`);
    if (sidebarItemHeight !== undefined) root.style.setProperty('--ds-sidebar-item-height', `${sidebarItemHeight}px`);
    if (sidebarAnimation !== undefined) root.style.setProperty('--ds-sidebar-animation', sidebarAnimation ? '1' : '0');
    if (sidebarBlur !== undefined) {
      const sbNum = Number(sidebarBlur);
      root.style.setProperty('--ds-sidebar-blur', `${sbNum}px`);
      root.style.setProperty('--ds-sidebar-blur-active', sbNum === 0 ? 'none' : `blur(${sbNum}px)`);
    }
    if (wallpaperBlur !== undefined) root.style.setProperty('--ds-wallpaper-blur', `${wallpaperBlur}px`);
    if (wallpaperBrightness !== undefined) root.style.setProperty('--ds-wallpaper-brightness', `${wallpaperBrightness}`);
    if (glassTransparency !== undefined) root.style.setProperty('--ds-glass-transparency', `${glassTransparency}%`);

    if (backgroundImage) {
      root.style.setProperty('--ds-background-image', `url(${backgroundImage})`);
      root.classList.add('has-bg-image');
      document.body.classList.add('has-bg-image');
    } else {
      root.style.setProperty('--ds-background-image', 'none');
      root.classList.remove('has-bg-image');
      document.body.classList.remove('has-bg-image');
    }

    if (shadowOpacity !== undefined) {
      root.style.setProperty('--ds-shadow-border', `0px 0px 0px 1px ${isDark ? `rgba(255, 255, 255, ${shadowOpacity})` : `rgba(0, 0, 0, ${shadowOpacity})`}`);
    }

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
  }, [computedColorScheme, settings]);

  return null;
};

class QunixThemeExtension extends Extension {
  public cardConfigurationPage = ConfigurationPage;
  public cardComponent = null;

  public initialize(ctx: ExtensionContext): void {
    ctx.extensionRegistry.pages.server.prependComponent(ServerBannerComponent);
    ctx.extensionRegistry.pages.global.prependComponent(QunixThemeLoader);

    ctx.extensionRegistry.pages.server.console.xterm.addInitHandler((options) => {
      const s = (window as any).qunixThemeSettings;
      if (!s) return;

      const isDark = document.documentElement.getAttribute('data-mantine-color-scheme') !== 'light';

      const bgColor = isDark 
        ? (s.terminal_color || s.terminalColor || '#1a1b26')
        : (s.light_terminal_color || s.lightTerminalColor || '#f1f2f6ff');
        
      const fgColor = isDark 
        ? (s.terminal_text_color || s.terminalTextColor || '#a9b1d6')
        : (s.light_terminal_text_color || s.lightTerminalTextColor || '#2f3542ff');

      const cursorColor = isDark 
        ? (s.terminal_cursor_color || s.terminalCursorColor || s.button_color || '#7aa2f7')
        : (s.light_terminal_cursor_color || s.lightTerminalCursorColor || s.light_button_color || '#6c5ce7ff');
        
      const selectionColor = isDark 
        ? (s.terminal_selection_color || s.terminalSelectionColor || 'rgba(255, 255, 255, 0.15)')
        : (s.light_terminal_selection_color || s.lightTerminalSelectionColor || 'rgba(108, 92, 231, 0.3)');

      options.theme = {
        ...options.theme,
        background: bgColor,
        foreground: fgColor,
        cursor: cursorColor,
        cursorAccent: isDark ? '#000000' : '#ffffff',
        selectionBackground: selectionColor,
        selectionInactiveBackground: selectionColor,
        black: isDark ? (s.terminal_ansi_black || s.terminalAnsiBlack || '#15161e') : (s.light_terminal_ansi_black || s.lightTerminalAnsiBlack || '#d5d6db'),
        red: isDark ? (s.terminal_ansi_red || s.terminalAnsiRed || '#f7768e') : (s.light_terminal_ansi_red || s.lightTerminalAnsiRed || '#f7768e'),
        green: isDark ? (s.terminal_ansi_green || s.terminalAnsiGreen || '#9ece6a') : (s.light_terminal_ansi_green || s.lightTerminalAnsiGreen || '#485e30'),
        yellow: isDark ? (s.terminal_ansi_yellow || s.terminalAnsiYellow || '#e0af68') : (s.light_terminal_ansi_yellow || s.lightTerminalAnsiYellow || '#8f5e15'),
        blue: isDark ? (s.terminal_ansi_blue || s.terminalAnsiBlue || '#7aa2f7') : (s.light_terminal_ansi_blue || s.lightTerminalAnsiBlue || '#34548a'),
        magenta: isDark ? (s.terminal_ansi_magenta || s.terminalAnsiMagenta || '#bb9af7') : (s.light_terminal_ansi_magenta || s.lightTerminalAnsiMagenta || '#5a4a78'),
        cyan: isDark ? (s.terminal_ansi_cyan || s.terminalAnsiCyan || '#7dcfff') : (s.light_terminal_ansi_cyan || s.lightTerminalAnsiCyan || '#0f4b6e'),
        white: isDark ? (s.terminal_ansi_white || s.terminalAnsiWhite || '#a9b1d6') : (s.light_terminal_ansi_white || s.lightTerminalAnsiWhite || '#343b58'),
      };
    });

    const titleStyle = 'color: #6200ffec; font-weight: bold; font-size: 14px; font-family: monospace;';
    const textStyle = 'color: #a7a7a7; font-size: 12px; font-family: monospace;';

    console.log(
        '%c Qunix Theme - © 2026 Mrbeenopro (mrbeenopro.com)\n' +
        '%c get this theme at https://github.com/mrbeeenopro/qunix_theme\n' +
        "any questions or issues? Join the discussion at https://github.com/mrbeeenopro/qunix_theme/discussions",
        titleStyle, 
        textStyle   
    );

    axiosInstance
      .get('/api/dev.qunix.theme/settings')
      .then((res) => {
        const s = res.data.settings;
        (window as any).qunixThemeSettings = s;
        window.dispatchEvent(new CustomEvent('qunix-settings-loaded', { detail: s }));

        const root = document.documentElement;
        const eggBanners = s.egg_banners || s.eggBanners || {};
        for (const [eggUuid, bannerUrl] of Object.entries(eggBanners)) {
          if (bannerUrl) {
            root.style.setProperty(`--ds-egg-banner-${eggUuid}`, `url(${bannerUrl})`);
          }
        }
      })
      .catch((err) => console.error('Failed to load theme settings:', err));

    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', (e) => {
        if (document.documentElement.style.getPropertyValue('--ds-sidebar-animation') !== '1') return;

        const cards = document.querySelectorAll('.mantine-NavLink-root');
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i] as HTMLElement;
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);
        }
      });
    }
  }

  public initializeMantineTheme(_ctx: ExtensionContext): MantineThemeOverride {
    return {
      fontFamily: 'var(--ds-font-family), "JetBrains Mono", monospace',
      fontFamilyMonospace: 'JetBrains Mono, monospace',
      black: '#000000',
      white: '#ffffff',
      primaryColor: 'blue',
      defaultRadius: 8,
      colors: {
        dark: [
          '#ffffff', // 0
          '#ebebeb', // 1
          '#808080', // 2
          '#666666', // 3
          '#4d4d4d', // 4
          '#333333', // 5
          '#111111', // 6
          '#0a0a0a', // 7
          '#050505', // 8
          '#000000', // 9
        ],
        blue: [
          '#ebf5ff', // 0
          '#d1e9ff', // 1
          '#a3d3ff', // 2
          '#75bdff', // 3
          '#47a7ff', // 4
          '#1991ff', // 5
          '#0a72ef', // 6 (Develop Blue)
          '#0059c1', // 7
          '#004293', // 8
          '#002b65', // 9
        ],
        pink: [
          '#fff0f6',
          '#ffdeeb',
          '#fcc2d7',
          '#faa2c1',
          '#f783ac',
          '#f06595',
          '#de1d8d', // Preview Pink
          '#c2255c',
          '#a61e4d',
          '#861841',
        ],
        red: [
          '#fff5f5',
          '#ffe3e3',
          '#ffc9c9',
          '#ffa8a8',
          '#ff8787',
          '#ff6b6b',
          '#ff5b4f', // Ship Red
          '#e03131',
          '#c92a2a',
          '#a61d24',
        ],
      },
      headings: {
        fontWeight: '600',
        fontFamily: 'var(--ds-font-family), "JetBrains Mono", monospace',
      },
    };
  }
}

export default new QunixThemeExtension();
