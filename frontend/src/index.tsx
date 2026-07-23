import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useLocation } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faMicrochip,
  faMemory,
  faHardDrive,
  faCopy,
  faCloudDownload,
  faCloudUpload,
  faPalette,
  faCircleCheck,
  faCircleXmark,
  faCircleExclamation,
  faCircleInfo,
} from '@fortawesome/free-solid-svg-icons';
import Notification from '@/elements/Notification.tsx';
import { Extension, ExtensionContext } from 'shared';
import { useComputedColorScheme, type MantineThemeOverride } from '@mantine/core';
import { axiosInstance } from '@/api/axios.ts';
import { useServerStore } from '@/stores/server.ts';
import { useUserStore } from '@/stores/user.ts';
import { bytesToString, mbToBytes } from '@/lib/size.ts';
import { formatMilliseconds } from '@/lib/time.ts';
import { formatAllocation } from '@/lib/server.ts';
import ConfigurationPage from './ConfigurationPage.tsx';
import AdminSettingsPage from './AdminSettingsPage.tsx';
import Alert from '@/elements/Alert.tsx';
import pkg from '../package.json';
import './app.css';

import { faTrash, faShareNodes, faSliders } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '@/providers/ToastProvider.tsx';
import ActionIcon from '@/elements/ActionIcon.tsx';
import Tooltip from '@/elements/Tooltip.tsx';

const StatsOverlay: React.FC = () => {
  const { server, stats, state } = useServerStore();

  if (!server || !stats) return null;

  const uptimeStr =
    state === 'offline' && server.status !== 'installing' ? 'Offline' : formatMilliseconds(stats.uptime || 0);

  const cpuStr = `${(stats.cpuAbsolute || 0).toFixed(2)}% / ${server.limits.cpu !== 0 ? `${server.limits.cpu}%` : 'Unlimited'}`;
  const memoryStr = `${bytesToString(stats.memoryBytes || 0)} / ${server.limits.memory !== 0 ? bytesToString(mbToBytes(server.limits.memory)) : 'Unlimited'}`;
  const diskStr = `${bytesToString(stats.diskBytes || 0)} / ${server.limits.disk !== 0 ? bytesToString(mbToBytes(server.limits.disk)) : 'Unlimited'}`;
  const netInStr =
    state === 'offline' && server.status !== 'installing' ? 'Offline' : bytesToString(stats.network?.rxBytes || 0);
  const netOutStr =
    state === 'offline' && server.status !== 'installing' ? 'Offline' : bytesToString(stats.network?.txBytes || 0);

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
        {copied ? <span className='copied-text'>Copied!</span> : <FontAwesomeIcon icon={faCopy} />}
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
      .catch((_err) => {
        /* ignore */
      });

    return () => {
      const root = document.documentElement;
      root.style.setProperty('--ds-server-banner-image', 'none');
      root.classList.remove('has-server-banner');
    };
  }, []);

  const isConsolePage =
    !!id && (location.pathname.endsWith(`/server/${id}`) || location.pathname.endsWith(`/server/${id}/`));

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

  if (
    hasBanner &&
    isConsolePage &&
    infoBarLeftCol &&
    infoBarMain &&
    document.body.contains(infoBarLeftCol) &&
    document.body.contains(infoBarMain)
  ) {
    return (
      <>
        {createPortal(<StatsOverlay />, infoBarLeftCol)}
        {createPortal(<AllocationPill />, infoBarMain)}
      </>
    );
  }

  return null;
};

async function loadFontCSPFriendly(fontName: string) {
  try {
    const formattedFont = fontName
      .split(/[\s-]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const styleId = `qunix-csp-font-${formattedFont.replace(/\s+/g, '-')}`;
    if (document.getElementById(styleId)) return;

    // Create placeholder style to avoid multiple simultaneous requests
    const placeholder = document.createElement('style');
    placeholder.id = styleId;
    document.head.appendChild(placeholder);

    const cssUrl = `https://fonts.googleapis.com/css2?family=${formattedFont.replace(/\s+/g, '+')}:wght@400;500;600;700&display=swap`;
    const res = await fetch(cssUrl);
    if (!res.ok) {
      placeholder.remove();
      throw new Error(`Failed to fetch font CSS: ${res.status}`);
    }
    let cssText = await res.text();

    const urlRegex = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g;
    const matches = [...cssText.matchAll(urlRegex)];

    for (const match of matches) {
      const originalUrl = match[1];
      try {
        const fontRes = await fetch(originalUrl);
        if (!fontRes.ok) continue;
        const fontBlob = await fontRes.blob();
        const blobUrl = URL.createObjectURL(fontBlob);
        cssText = cssText.replaceAll(originalUrl, blobUrl);
      } catch (_err) {
        // ignore individual font file errors
      }
    }

    placeholder.innerHTML = cssText;
  } catch (_err) {
    // font load failed silently
  }
}

const QunixThemeLoader: React.FC = () => {
  const computedColorScheme = useComputedColorScheme('dark');
  const [settings, setSettings] = useState<any>(() => (window as any).qunixThemeSettings);
  const servers = useUserStore((state) => state.servers);
  const location = useLocation();

  useEffect(() => {
    const handleLoaded = (e: Event) => {
      setSettings((e as CustomEvent).detail);
    };
    window.addEventListener('qunix-settings-loaded', handleLoaded);
    return () => window.removeEventListener('qunix-settings-loaded', handleLoaded);
  }, []);

  // Update root element custom properties
  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;
    root.setAttribute(
      'data-sidebar-hover-style',
      settings.sidebar_hover_style || settings.sidebarHoverStyle || 'style-1',
    );
    const isDark = computedColorScheme === 'dark';

    const getThemeVal = (darkVal: string, lightVal: string) => {
      return isDark ? darkVal : lightVal;
    };

    const getThemeValOpt = (darkVal: any, lightVal: any) => {
      return isDark ? darkVal : lightVal;
    };

    const backgroundColor = getThemeVal(
      settings.background_color || settings.backgroundColor,
      settings.light_background_color || settings.lightBackgroundColor || '#f3effa',
    );
    const textColor = getThemeVal(
      settings.text_color || settings.textColor,
      settings.light_text_color || settings.lightTextColor || '#1e1631',
    );
    const focusColor = getThemeVal(
      settings.focus_color || settings.focusColor,
      settings.light_focus_color || settings.lightFocusColor || 'hsla(263, 85%, 60%, 1.00)',
    );
    const sidebarColor = getThemeVal(
      settings.sidebar_color || settings.sidebarColor,
      settings.light_sidebar_color || settings.lightSidebarColor || '#ffffff',
    );
    const cardColor = getThemeVal(
      settings.card_color || settings.cardColor,
      settings.light_card_color || settings.lightCardColor || '#ffffff',
    );
    const borderColor = getThemeVal(
      settings.border_color || settings.borderColor,
      settings.light_border_color || settings.lightBorderColor || 'rgba(108, 92, 231, 0.15)',
    );
    const navbarColor = getThemeVal(
      settings.navbar_color || settings.navbarColor,
      settings.light_navbar_color || settings.lightNavbarColor || '#ffffff',
    );
    const terminalColor = getThemeVal(
      settings.terminal_color || settings.terminalColor,
      settings.light_terminal_color || settings.lightTerminalColor || '#f1f2f6',
    );
    const terminalTextColor = getThemeVal(
      settings.terminal_text_color || settings.terminalTextColor,
      settings.light_terminal_text_color || settings.lightTerminalTextColor || '#2f3542',
    );
    const inputColor = getThemeVal(
      settings.input_color || settings.inputColor,
      settings.light_input_color || settings.lightInputColor || '#f1f2f6',
    );
    const editorColor = getThemeVal(
      settings.editor_color || settings.editorColor,
      settings.light_editor_color || settings.lightEditorColor || '#ffffff',
    );
    const editorTextColor = getThemeVal(
      settings.editor_text_color || settings.editorTextColor,
      settings.light_editor_text_color || settings.lightEditorTextColor || '#2f3542',
    );
    const listingColor = getThemeVal(
      settings.listing_color || settings.listingColor,
      settings.light_listing_color || settings.lightListingColor || '#ffffff',
    );
    const buttonColor = getThemeVal(
      settings.button_color || settings.buttonColor,
      settings.light_button_color || settings.lightButtonColor || '#6c5ce7',
    );
    const serverActionBg = getThemeVal(
      settings.server_action_bg ||
        settings.serverActionBg ||
        settings.server_action_color ||
        settings.serverActionColor,
      settings.light_server_action_bg || settings.lightServerActionBg || '#f1f2f6',
    );
    const powerStartBg = getThemeVal(
      settings.power_start_bg || settings.powerStartBg,
      settings.light_power_start_bg || settings.lightPowerStartBg || '#2ed573',
    );
    const powerRestartBg = getThemeVal(
      settings.power_restart_bg || settings.powerRestartBg,
      settings.light_power_restart_bg || settings.lightPowerRestartBg || '#747d8c',
    );
    const powerStopBg = getThemeVal(
      settings.power_stop_bg || settings.powerStopBg,
      settings.light_power_stop_bg || settings.lightPowerStopBg || '#ff4757',
    );
    const sidebarActiveColor = getThemeVal(
      settings.sidebar_active_color || settings.sidebarActiveColor,
      settings.light_sidebar_active_color || settings.lightSidebarActiveColor || '#6c5ce7',
    );
    const sidebarActiveBg = getThemeVal(
      settings.sidebar_active_bg || settings.sidebarActiveBg,
      settings.light_sidebar_active_bg || settings.lightSidebarActiveBg || 'rgba(108, 92, 231, 0.1)',
    );
    const backgroundImage = getThemeValOpt(
      settings.background_image || settings.backgroundImage,
      settings.light_background_image || settings.lightBackgroundImage,
    );
    const shadowOpacity = getThemeValOpt(
      settings.shadow_opacity !== undefined ? settings.shadow_opacity : settings.shadowOpacity,
      settings.light_shadow_opacity !== undefined ? settings.light_shadow_opacity : settings.lightShadowOpacity,
    );
    const announcementBg = getThemeVal(
      settings.announcement_bg || settings.announcementBg || 'rgba(108, 92, 231, 0.15)',
      settings.light_announcement_bg || settings.lightAnnouncementBg || 'rgba(108, 92, 231, 0.1)',
    );
    const announcementBlur =
      settings.announcement_blur !== undefined
        ? settings.announcement_blur
        : settings.announcementBlur !== undefined
          ? settings.announcementBlur
          : 10;
    const announcementBorder = getThemeVal(
      settings.announcement_border_color || settings.announcementBorderColor || '#6c5ce7',
      settings.light_announcement_border_color || settings.lightAnnouncementBorderColor || '#6c5ce7',
    );
    const announcementRadius =
      settings.announcement_radius !== undefined
        ? settings.announcement_radius
        : settings.announcementRadius !== undefined
          ? settings.announcementRadius
          : 12;
    const announcementCtaBg = getThemeVal(
      settings.announcement_cta_bg || settings.announcementCtaBg || '#6c5ce7',
      settings.light_announcement_cta_bg || settings.lightAnnouncementCtaBg || '#6c5ce7',
    );
    const announcementCtaColor = getThemeVal(
      settings.announcement_cta_color || settings.announcementCtaColor || '#ffffff',
      settings.light_announcement_cta_color || settings.lightAnnouncementCtaColor || '#ffffff',
    );
    const announcementCtaRadius =
      settings.announcement_cta_radius !== undefined
        ? settings.announcement_cta_radius
        : settings.announcementCtaRadius !== undefined
          ? settings.announcementCtaRadius
          : 8;

    const borderRadius = settings.border_radius !== undefined ? settings.border_radius : settings.borderRadius;
    const buttonRadius = settings.button_radius !== undefined ? settings.button_radius : settings.buttonRadius;
    const inputRadius = settings.input_radius !== undefined ? settings.input_radius : settings.inputRadius;
    const cardRadius = settings.card_radius !== undefined ? settings.card_radius : settings.cardRadius;
    const navbarHeight = settings.navbar_height !== undefined ? settings.navbar_height : settings.navbarHeight;
    const sidebarItemGap =
      settings.sidebar_item_gap !== undefined ? settings.sidebar_item_gap : settings.sidebarItemGap;
    const sidebarBlur = settings.sidebar_blur !== undefined ? settings.sidebar_blur : settings.sidebarBlur;
    const wallpaperBlur = settings.wallpaper_blur !== undefined ? settings.wallpaper_blur : settings.wallpaperBlur;
    const wallpaperBrightness =
      settings.wallpaper_brightness !== undefined ? settings.wallpaper_brightness : settings.wallpaperBrightness;
    const glassTransparency =
      settings.glass_transparency !== undefined ? settings.glass_transparency : settings.glassTransparency;
    const sidebarAnimation =
      settings.sidebar_animation !== undefined ? settings.sidebar_animation : settings.sidebarAnimation;
    const fontFamily = settings.font_family || settings.fontFamily;
    const sidebarItemHeight =
      settings.sidebar_item_height !== undefined ? settings.sidebar_item_height : settings.sidebarItemHeight;
    const listingRadius = settings.listing_radius !== undefined ? settings.listing_radius : settings.listingRadius;
    const checkboxRadius = settings.checkbox_radius !== undefined ? settings.checkbox_radius : settings.checkboxRadius;
    const sidebarWidth = settings.sidebar_width !== undefined ? settings.sidebar_width : settings.sidebarWidth;
    const sidebarRadius = settings.sidebar_radius !== undefined ? settings.sidebar_radius : settings.sidebarRadius;
    const sidebarActiveRadius =
      settings.sidebar_active_radius !== undefined ? settings.sidebar_active_radius : settings.sidebarActiveRadius;

    const terminalCursor = getThemeVal(
      settings.terminal_cursor_color || settings.terminalCursorColor,
      settings.light_terminal_cursor_color || settings.lightTerminalCursorColor || '#6c5ce7',
    );
    const terminalSelection = getThemeVal(
      settings.terminal_selection_color || settings.terminalSelectionColor,
      settings.light_terminal_selection_color || settings.lightTerminalSelectionColor || 'rgba(108, 92, 231, 0.3)',
    );
    const ansiBlack = getThemeVal(
      settings.terminal_ansi_black || settings.terminalAnsiBlack,
      settings.light_terminal_ansi_black || settings.lightTerminalAnsiBlack || '#d5d6db',
    );
    const ansiRed = getThemeVal(
      settings.terminal_ansi_red || settings.terminalAnsiRed,
      settings.light_terminal_ansi_red || settings.lightTerminalAnsiRed || '#f7768e',
    );
    const ansiGreen = getThemeVal(
      settings.terminal_ansi_green || settings.terminalAnsiGreen,
      settings.light_terminal_ansi_green || settings.lightTerminalAnsiGreen || '#485e30',
    );
    const ansiYellow = getThemeVal(
      settings.terminal_ansi_yellow || settings.terminalAnsiYellow,
      settings.light_terminal_ansi_yellow || settings.lightTerminalAnsiYellow || '#8f5e15',
    );
    const ansiBlue = getThemeVal(
      settings.terminal_ansi_blue || settings.terminalAnsiBlue,
      settings.light_terminal_ansi_blue || settings.lightTerminalAnsiBlue || '#34548a',
    );
    const ansiMagenta = getThemeVal(
      settings.terminal_ansi_magenta || settings.terminalAnsiMagenta,
      settings.light_terminal_ansi_magenta || settings.lightTerminalAnsiMagenta || '#5a4a78',
    );
    const ansiCyan = getThemeVal(
      settings.terminal_ansi_cyan || settings.terminalAnsiCyan,
      settings.light_terminal_ansi_cyan || settings.lightTerminalAnsiCyan || '#0f4b6e',
    );
    const ansiWhite = getThemeVal(
      settings.terminal_ansi_white || settings.terminalAnsiWhite,
      settings.light_terminal_ansi_white || settings.lightTerminalAnsiWhite || '#343b58',
    );
    const chartSeries1Border = getThemeVal(
      settings.chart_series_1_border || settings.chartSeries1Border || '#22d3ee',
      settings.light_chart_series_1_border || settings.lightChartSeries1Border || '#0891b2',
    );
    const chartSeries1Fill = getThemeVal(
      settings.chart_series_1_fill || settings.chartSeries1Fill || 'rgba(14, 116, 144, 0.5)',
      settings.light_chart_series_1_fill || settings.lightChartSeries1Fill || 'rgba(8, 145, 178, 0.15)',
    );
    const chartSeries2Border = getThemeVal(
      settings.chart_series_2_border || settings.chartSeries2Border || '#facc15',
      settings.light_chart_series_2_border || settings.lightChartSeries2Border || '#d97706',
    );
    const chartSeries2Fill = getThemeVal(
      settings.chart_series_2_fill || settings.chartSeries2Fill || 'rgba(161, 98, 7, 0.5)',
      settings.light_chart_series_2_fill || settings.lightChartSeries2Fill || 'rgba(217, 119, 6, 0.15)',
    );
    const dark7Color = getThemeVal(
      settings.dark_7_color || settings.dark7Color || '#0a0a0a',
      settings.light_dark_7_color || settings.lightDark7Color || '#ffffff',
    );
    const dark6Color = getThemeVal(
      settings.dark_6_color || settings.dark6Color || '#111111',
      settings.light_dark_6_color || settings.lightDark6Color || '#ebebeb',
    );

    root.style.setProperty('--ds-background', backgroundColor);
    root.style.setProperty('--ds-gray-900', textColor);
    root.style.setProperty('--ds-focus-color', focusColor);
    root.style.setProperty('--ds-dark-7', dark7Color);
    root.style.setProperty('--ds-dark-6', dark6Color);
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
    root.style.setProperty('--ds-announcement-bg', announcementBg);
    root.style.setProperty('--ds-announcement-blur', `${announcementBlur}px`);
    root.style.setProperty('--ds-announcement-border', announcementBorder);
    root.style.setProperty('--ds-announcement-radius', `${announcementRadius}px`);
    root.style.setProperty('--ds-announcement-cta-bg', announcementCtaBg);
    root.style.setProperty('--ds-announcement-cta-color', announcementCtaColor);
    root.style.setProperty('--ds-announcement-cta-radius', `${announcementCtaRadius}px`);
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
    root.style.setProperty('--chart-series-1-border', chartSeries1Border);
    root.style.setProperty('--chart-series-1-fill', chartSeries1Fill);
    root.style.setProperty('--chart-series-2-border', chartSeries2Border);
    root.style.setProperty('--chart-series-2-fill', chartSeries2Fill);

    if (borderRadius !== undefined) root.style.setProperty('--ds-border-radius', `${borderRadius}px`);
    if (buttonRadius !== undefined) root.style.setProperty('--ds-button-radius', `${buttonRadius}px`);
    if (inputRadius !== undefined) root.style.setProperty('--ds-input-radius', `${inputRadius}px`);
    if (cardRadius !== undefined) root.style.setProperty('--ds-card-radius', `${cardRadius}px`);
    if (listingRadius !== undefined) root.style.setProperty('--ds-listing-radius', `${listingRadius}px`);
    if (checkboxRadius !== undefined) root.style.setProperty('--ds-checkbox-radius', `${checkboxRadius}px`);
    if (navbarHeight !== undefined) root.style.setProperty('--ds-navbar-height', `${navbarHeight}px`);
    if (sidebarItemGap !== undefined) root.style.setProperty('--ds-sidebar-item-gap', `${sidebarItemGap}px`);
    if (sidebarItemHeight !== undefined) root.style.setProperty('--ds-sidebar-item-height', `${sidebarItemHeight}px`);
    if (sidebarAnimation !== undefined) root.style.setProperty('--ds-sidebar-animation', sidebarAnimation ? '1' : '0');
    if (sidebarWidth !== undefined) root.style.setProperty('--ds-sidebar-width', `${sidebarWidth}px`);
    if (sidebarRadius !== undefined) root.style.setProperty('--ds-sidebar-radius', `${sidebarRadius}px`);
    if (sidebarActiveRadius !== undefined)
      root.style.setProperty('--ds-sidebar-active-radius', `${sidebarActiveRadius}px`);
    if (sidebarBlur !== undefined) {
      const sbNum = Number(sidebarBlur);
      root.style.setProperty('--ds-sidebar-blur', `${sbNum}px`);
      root.style.setProperty('--ds-sidebar-blur-active', sbNum === 0 ? 'none' : `blur(${sbNum}px)`);
    }
    if (wallpaperBlur !== undefined) root.style.setProperty('--ds-wallpaper-blur', `${wallpaperBlur}px`);
    if (wallpaperBrightness !== undefined)
      root.style.setProperty('--ds-wallpaper-brightness', `${wallpaperBrightness}`);
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
      root.style.setProperty(
        '--ds-shadow-border',
        `0px 0px 0px 1px ${isDark ? `rgba(255, 255, 255, ${shadowOpacity})` : `rgba(0, 0, 0, ${shadowOpacity})`}`,
      );
    }

    if (fontFamily && fontFamily !== 'Inter' && fontFamily !== 'Geist') {
      const formattedFont = fontFamily
        .split(/[\s-]+/)
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      loadFontCSPFriendly(formattedFont);
      root.style.setProperty('--ds-font-family', `"${formattedFont}", 'JetBrains Mono', monospace`);
    } else {
      root.style.setProperty('--ds-font-family', "'JetBrains Mono', monospace");
    }
  }, [computedColorScheme, settings]);

  // Apply egg banners to server listing dashboard cards dynamically
  useEffect(() => {
    if (!settings) return;

    const applyBanners = () => {
      const serverLinks = document.querySelectorAll('a[href^="/server/"]');
      const eggBanners = settings.egg_banners || settings.eggBanners || {};

      serverLinks.forEach((aEl) => {
        const href = aEl.getAttribute('href') || '';
        const parts = href.split('/');
        const uuidShort = parts[parts.length - 1];
        if (!uuidShort) return;

        const server = servers.data?.find((s: any) => s.uuidShort === uuidShort || s.uuid === uuidShort);
        if (server && server.egg) {
          const bannerUrl = eggBanners[server.egg.uuid];
          const cardEl = aEl.querySelector('.mantine-Card-root');
          if (cardEl) {
            if (bannerUrl) {
              cardEl.classList.add('qunix-server-card', 'has-banner');
              (cardEl as HTMLElement).style.setProperty('--ds-egg-banner-image', `url(${bannerUrl})`);
            } else {
              cardEl.classList.remove('qunix-server-card', 'has-banner');
              (cardEl as HTMLElement).style.removeProperty('--ds-egg-banner-image');
            }
          }
        }
      });
    };

    applyBanners();

    // Observe body changes for search / pagination re-renders
    const observer = new MutationObserver(applyBanners);
    observer.observe(document.body, { childList: true, subtree: true });

    // Periodic safety sync
    const interval = setInterval(applyBanners, 500);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, [servers, location.pathname, location.search, settings]);

  return null;
};

const getLogLevel = (line: string): 'info' | 'warning' | 'error' | 'other' => {
  const clean = line.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '').toUpperCase();
  if (clean.includes('ERROR') || clean.includes('ERR:') || clean.includes('FATAL') || clean.includes('SEVERE')) {
    return 'error';
  }
  if (clean.includes('WARN') || clean.includes('WARNING')) {
    return 'warning';
  }
  if (clean.includes('INFO')) {
    return 'info';
  }
  return 'other';
};

const ConsoleFilterTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [counts, setCounts] = useState({ all: 0, info: 0, warning: 0, error: 0 });

  useEffect(() => {
    let activeState = (window as any).consoleFilterState;

    const update = () => {
      if (activeState) {
        setActiveTab(activeState.activeTab);

        const all = activeState.historyLines.length;
        let info = 0;
        let warning = 0;
        let error = 0;
        for (const line of activeState.historyLines) {
          if (line.level === 'info' || line.level === 'other') info++;
          else if (line.level === 'warning') warning++;
          else if (line.level === 'error') error++;
        }
        setCounts({ all, info, warning, error });
      }
    };

    const subscribe = (stateObj: any) => {
      if (!stateObj) return;
      activeState = stateObj;
      stateObj.listeners.push(update);
      update();
    };

    if (activeState) {
      subscribe(activeState);
    }

    const handleLoaded = (e: Event) => {
      subscribe((e as CustomEvent).detail);
    };

    window.addEventListener('qunix-console-filter-loaded', handleLoaded);

    return () => {
      window.removeEventListener('qunix-console-filter-loaded', handleLoaded);
      if (activeState) {
        activeState.listeners = activeState.listeners.filter((l: any) => l !== update);
      }
    };
  }, []);

  const handleTabClick = (tab: string) => {
    const state = (window as any).consoleFilterState;
    if (state) {
      state.setFilter(tab);
    }
  };

  const showInfo = counts.info > 0;
  const showWarning = counts.warning > 0;
  const showError = counts.error > 0;

  const formatCount = (count: number) => {
    return count > 99 ? '99+' : count;
  };

  return (
    <div className='qunix-console-filter-tabs'>
      <button
        onClick={() => handleTabClick('all')}
        className={`qunix-console-filter-tab ${activeTab === 'all' ? 'active' : ''}`}
      >
        View All ({formatCount(counts.all)})
      </button>
      {showInfo && (
        <button
          onClick={() => handleTabClick('info')}
          className={`qunix-console-filter-tab ${activeTab === 'info' ? 'active' : ''}`}
        >
          Info ({formatCount(counts.info)})
        </button>
      )}
      {showWarning && (
        <button
          onClick={() => handleTabClick('warning')}
          className={`qunix-console-filter-tab ${activeTab === 'warning' ? 'active' : ''}`}
        >
          Warning ({formatCount(counts.warning)})
        </button>
      )}
      {showError && (
        <button
          onClick={() => handleTabClick('error')}
          className={`qunix-console-filter-tab ${activeTab === 'error' ? 'active' : ''}`}
        >
          Error ({formatCount(counts.error)})
        </button>
      )}
    </div>
  );
};

const ConsoleButtons: React.FC = () => {
  const { addToast } = useToast();
  const [sharing, setSharing] = useState(false);

  const handleClear = () => {
    const term = (window as any).activeXterm;
    if (term) {
      term.clear();
      addToast('Console cleared', 'success');
    } else {
      addToast('Terminal not initialized', 'error');
    }
  };

  const handleShareLogs = async () => {
    const term = (window as any).activeXterm;
    if (!term) {
      addToast('Terminal not initialized', 'error');
      return;
    }

    // Extract all text from xterm buffer
    const buffer = term.buffer.active;
    const lines = [];
    for (let i = 0; i < buffer.length; i++) {
      const line = buffer.getLine(i);
      if (line) {
        lines.push(line.translateToString(true));
      }
    }
    const logContent = lines.join('\n').trim();

    if (!logContent) {
      addToast('Console log is empty', 'error');
      return;
    }

    setSharing(true);
    try {
      const formData = new URLSearchParams();
      formData.append('content', logContent);

      const response = await fetch('https://api.mclo.gs/1/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json();
      if (data.success && data.url) {
        await navigator.clipboard.writeText(data.url);
        addToast('Logs shared! Link copied to clipboard.', 'success');
        window.open(data.url, '_blank', 'noopener,noreferrer');
      } else {
        addToast(data.error || 'Failed to share logs', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('An error occurred while sharing logs', 'error');
    } finally {
      setSharing(false);
    }
  };

  return (
    <>
      <Tooltip label='Clear Console'>
        <ActionIcon size='xs' variant='subtle' color='gray' onClick={handleClear}>
          <FontAwesomeIcon icon={faTrash} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label={sharing ? 'Sharing logs...' : 'Share Logs via mclo.gs'}>
        <ActionIcon size='xs' variant='subtle' color='gray' loading={sharing} onClick={handleShareLogs}>
          <FontAwesomeIcon icon={faShareNodes} />
        </ActionIcon>
      </Tooltip>
    </>
  );
};

const CustomToast: React.FC<{
  color?: string;
  onClose?: () => void;
  children: React.ReactNode;
  showTimer?: boolean;
  radius?: number;
  coloredBorder?: boolean;
  backgroundTint?: boolean;
}> = ({ color, onClose, children, showTimer = true, radius = 8, coloredBorder = true, backgroundTint = true }) => {
  let icon = faCircleInfo;
  let accentColor = '#7aa2f7'; // default blue

  if (color === 'green' || color === 'success') {
    icon = faCircleCheck;
    accentColor = '#2ed573';
  } else if (color === 'red' || color === 'error') {
    icon = faCircleXmark;
    accentColor = '#ff4757';
  } else if (color === 'yellow' || color === 'warning') {
    icon = faCircleExclamation;
    accentColor = '#ffa502';
  }

  return (
    <div
      className={`qunix-custom-toast-container ${coloredBorder ? 'has-colored-border' : ''} ${backgroundTint ? 'has-bg-tint' : ''}`}
      style={
        {
          '--toast-accent': accentColor,
          '--toast-radius': `${radius}px`,
        } as any
      }
    >
      <div className='qunix-custom-toast-content'>
        <div className='qunix-custom-toast-icon-wrapper'>
          <FontAwesomeIcon icon={icon} className='qunix-custom-toast-icon' />
        </div>
        <div className='qunix-custom-toast-message'>{children}</div>
        {onClose && (
          <button onClick={onClose} className='qunix-custom-toast-close'>
            &times;
          </button>
        )}
      </div>
      {showTimer && <div className='qunix-custom-toast-timer-bar' />}
    </div>
  );
};

const QunixThemeToast: React.FC<{
  color?: string;
  onClose?: () => void;
  children: React.ReactNode;
  showTimer?: boolean;
  radius?: number;
  coloredBorder?: boolean;
  backgroundTint?: boolean;
}> = ({ color, onClose, children, showTimer = true, radius = 8, coloredBorder = true, backgroundTint = true }) => {
  let icon = faCircleInfo;
  let accentColor = 'var(--ds-primary-color)';

  if (color === 'green' || color === 'success') {
    icon = faCircleCheck;
    accentColor = '#40c057';
  } else if (color === 'red' || color === 'error') {
    icon = faCircleXmark;
    accentColor = '#fa5252';
  } else if (color === 'yellow' || color === 'warning') {
    icon = faCircleExclamation;
    accentColor = '#fab005';
  }

  return (
    <div
      className={`qunix-theme-toast-container ${coloredBorder ? 'has-colored-border' : ''} ${backgroundTint ? 'has-bg-tint' : ''}`}
      style={
        {
          '--toast-accent': accentColor,
          '--toast-radius': `${radius}px`,
        } as any
      }
    >
      <div className='qunix-theme-toast-content'>
        <FontAwesomeIcon icon={icon} className='qunix-theme-toast-icon' />
        <div className='qunix-theme-toast-message'>{children}</div>
        {onClose && (
          <button onClick={onClose} className='qunix-theme-toast-close'>
            &times;
          </button>
        )}
      </div>
      {showTimer && <div className='qunix-theme-toast-timer-bar' />}
    </div>
  );
};

class QunixThemeExtension extends Extension {
  public cardConfigurationPage = ConfigurationPage;
  public cardComponent = null;

  public initialize(ctx: ExtensionContext): void {
    Alert.addRenderInterceptor((element, props) => {
      if (props.className && props.className.includes('mx-6')) {
        const s = (window as any).qunixThemeSettings;
        const ctaEnabled = s?.announcement_cta !== false && s?.announcementCta !== false;
        const ctaLink = s?.announcement_cta_link || s?.announcementCtaLink;
        const ctaText = s?.announcement_cta_text || s?.announcementCtaText || 'Go to link...';

        if (ctaLink && ctaEnabled) {
          const ctaButton = (
            <a href={ctaLink} target='_blank' rel='noopener noreferrer' className='qunix-announcement-cta-btn'>
              {ctaText}
            </a>
          );

          const originalChildren = props.children;
          const originalClassName = props.className || '';
          const hasClose = props.withCloseButton;
          const additionalClass = `qunix-announcement-alert ${hasClose ? 'has-close-button' : ''}`;

          return React.cloneElement(element, {
            className: `${originalClassName} ${additionalClass}`.trim(),
            children: (
              <>
                {originalChildren}
                {ctaButton}
              </>
            ),
          });
        }
      }
      return element;
    });

    Notification.addRenderInterceptor((element, props) => {
      const s = (window as any).qunixThemeSettings;
      const toastStyle = s?.toast_style || 'qunix';
      const showTimer = s?.toast_timer !== false && s?.toastTimer !== false;
      const radius = s?.toast_radius !== undefined ? s.toast_radius : 8;
      const coloredBorder = s?.toast_colored_border !== false && s?.toastColoredBorder !== false;
      const backgroundTint = s?.toast_background_tint !== false && s?.toastBackgroundTint !== false;

      if (toastStyle === 'blur') {
        return (
          <CustomToast
            color={props.color}
            onClose={props.onClose}
            showTimer={showTimer}
            radius={radius}
            coloredBorder={coloredBorder}
            backgroundTint={backgroundTint}
          >
            {props.children}
          </CustomToast>
        );
      } else {
        return (
          <QunixThemeToast
            color={props.color}
            onClose={props.onClose}
            showTimer={showTimer}
            radius={radius}
            coloredBorder={coloredBorder}
            backgroundTint={backgroundTint}
          >
            {props.children}
          </QunixThemeToast>
        );
      }
    });

    ctx.extensionRegistry.routes.addAdminRoute({
      name: 'Qunix Theme',
      icon: faPalette,
      path: '/qunix-settings/*',
      element: AdminSettingsPage,
      permission: ['extensions.qunix.theme.read'],
    });

    ctx.extensionRegistry.pages.server.prependComponent(ServerBannerComponent);
    ctx.extensionRegistry.pages.global.prependComponent(QunixThemeLoader);

    ctx.extensionRegistry.pages.server.console.xterm.addInitHandler((options) => {
      const s = (window as any).qunixThemeSettings;
      if (!s) return;

      const isDark = document.documentElement.getAttribute('data-mantine-color-scheme') !== 'light';

      const bgColor = isDark
        ? s.terminal_color || s.terminalColor || '#1a1b26'
        : s.light_terminal_color || s.lightTerminalColor || '#f1f2f6';

      const fgColor = isDark
        ? s.terminal_text_color || s.terminalTextColor || '#a9b1d6'
        : s.light_terminal_text_color || s.lightTerminalTextColor || '#2f3542';

      const cursorColor = isDark
        ? s.terminal_cursor_color || s.terminalCursorColor || s.button_color || '#7aa2f7'
        : s.light_terminal_cursor_color || s.lightTerminalCursorColor || s.light_button_color || '#6c5ce7';

      const selectionColor = isDark
        ? s.terminal_selection_color || s.terminalSelectionColor || 'rgba(255, 255, 255, 0.15)'
        : s.light_terminal_selection_color || s.lightTerminalSelectionColor || 'rgba(108, 92, 231, 0.3)';

      options.theme = {
        ...options.theme,
        background: bgColor,
        foreground: fgColor,
        cursor: cursorColor,
        cursorAccent: isDark ? '#000000' : '#ffffff',
        selectionBackground: selectionColor,
        selectionInactiveBackground: selectionColor,
        black: isDark
          ? s.terminal_ansi_black || s.terminalAnsiBlack || '#15161e'
          : s.light_terminal_ansi_black || s.lightTerminalAnsiBlack || '#d5d6db',
        red: isDark
          ? s.terminal_ansi_red || s.terminalAnsiRed || '#f7768e'
          : s.light_terminal_ansi_red || s.lightTerminalAnsiRed || '#f7768e',
        green: isDark
          ? s.terminal_ansi_green || s.terminalAnsiGreen || '#9ece6a'
          : s.light_terminal_ansi_green || s.lightTerminalAnsiGreen || '#485e30',
        yellow: isDark
          ? s.terminal_ansi_yellow || s.terminalAnsiYellow || '#e0af68'
          : s.light_terminal_ansi_yellow || s.lightTerminalAnsiYellow || '#8f5e15',
        blue: isDark
          ? s.terminal_ansi_blue || s.terminalAnsiBlue || '#7aa2f7'
          : s.light_terminal_ansi_blue || s.lightTerminalAnsiBlue || '#34548a',
        magenta: isDark
          ? s.terminal_ansi_magenta || s.terminalAnsiMagenta || '#bb9af7'
          : s.light_terminal_ansi_magenta || s.lightTerminalAnsiMagenta || '#5a4a78',
        cyan: isDark
          ? s.terminal_ansi_cyan || s.terminalAnsiCyan || '#7dcfff'
          : s.light_terminal_ansi_cyan || s.lightTerminalAnsiCyan || '#0f4b6e',
        white: isDark
          ? s.terminal_ansi_white || s.terminalAnsiWhite || '#a9b1d6'
          : s.light_terminal_ansi_white || s.lightTerminalAnsiWhite || '#343b58',
      };
    });

    ctx.extensionRegistry.pages.server.console.xterm.addAfterOpenHandler((term) => {
      (window as any).activeXterm = term;

      const filterState = {
        activeTab: 'all',
        historyLines: [] as { text: string; level: 'info' | 'warning' | 'error' | 'other' }[],
        lineBuffer: '',
        isRedrawing: false,
        listeners: [] as (() => void)[],
        setFilter: (tab: string) => {
          filterState.activeTab = tab;
          filterState.isRedrawing = true;
          term.reset();

          const filtered = filterState.historyLines.filter((line) => {
            if (tab === 'all') return true;
            if (tab === 'info') return line.level === 'info' || line.level === 'other';
            return line.level === tab;
          });

          if (filtered.length > 0) {
            const joinedText = filtered.map((l) => l.text + '\n').join('');
            term.write(joinedText);
          }
          if (tab === 'all' && filterState.lineBuffer) {
            term.write(filterState.lineBuffer);
          }
          filterState.isRedrawing = false;
          filterState.listeners.forEach((l) => l());
        },
      };

      (window as any).consoleFilterState = filterState;
      window.dispatchEvent(new CustomEvent('qunix-console-filter-loaded', { detail: filterState }));

      const originalWrite = term.write;
      term.write = function (data: string | Uint8Array) {
        if (filterState.isRedrawing) {
          return originalWrite.call(this, data);
        }

        const text = typeof data === 'string' ? data : new TextDecoder().decode(data);
        filterState.lineBuffer += text;

        const parts = filterState.lineBuffer.split('\n');
        filterState.lineBuffer = parts.pop() || '';

        let added = false;
        for (const completeLine of parts) {
          const level = getLogLevel(completeLine);
          filterState.historyLines.push({ text: completeLine, level });
          added = true;

          if (filterState.activeTab !== 'all') {
            const isInfo = filterState.activeTab === 'info' && (level === 'info' || level === 'other');
            if (isInfo || level === filterState.activeTab) {
              originalWrite.call(this, completeLine + '\n');
            }
          }
        }

        if (added) {
          filterState.listeners.forEach((l) => l());
        }

        if (filterState.activeTab === 'all') {
          return originalWrite.call(this, data);
        }
      };

      const originalReset = term.reset;
      term.reset = function () {
        if (!filterState.isRedrawing) {
          filterState.historyLines = [];
          filterState.lineBuffer = '';
          filterState.activeTab = 'all';
          filterState.listeners.forEach((l) => l());
        }
        return originalReset.call(this);
      };
    });

    ctx.extensionRegistry.pages.server.console.xterm.addOnUnmountHandler(() => {
      delete (window as any).activeXterm;
      delete (window as any).consoleFilterState;
    });

    ctx.extensionRegistry.pages.server.console.terminalHeaderLeftComponents.appendComponent(ConsoleFilterTabs);
    ctx.extensionRegistry.pages.server.console.terminalHeaderRightComponents.appendComponent(ConsoleButtons);

    const logoStyle =
      'color: #6c5ce7; font-weight: 900; font-size: 11px; font-family: monospace; line-height: 1.3; ' +
      'text-shadow: 0 0 12px #8542f060;';
    const subStyle = 'color: #a29bfe; font-size: 11px; font-family: monospace; line-height: 1.5;';
    const dimStyle = 'color: #555577; font-size: 10px; font-family: monospace;';

    console.log(
      '%c' +
        '  ██████╗ ██╗   ██╗███╗   ██╗██╗██╗  ██╗\n' +
        '  ██╔═══██╗██║   ██║████╗  ██║██║╚██╗██╔╝\n' +
        '  ██║   ██║██║   ██║██╔██╗ ██║██║ ╚███╔╝ \n' +
        '  ██║▄▄ ██║██║   ██║██║╚██╗██║██║ ██╔██╗ \n' +
        '  ╚██████╔╝╚██████╔╝██║ ╚████║██║██╔╝ ██╗\n' +
        '   ╚══▀▀═╝  ╚═════╝ ╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝\n' +
        `   Theme  v${pkg.version}  —  Calagopus Panel`,
      logoStyle,
    );
    console.log('%c  © 2026 Mrbeenopro · mrbeenopro.com\n' + '  github.com/mrbeenopro/qunix_theme', subStyle);
    console.log('%c  For issues & discussions visit the GitHub repo above.', dimStyle);

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
      .catch(() => {
        /* ignore settings fetch errors on init */
      });

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
          'var(--ds-dark-6, #111111)', // 6
          'var(--ds-dark-7, #0a0a0a)', // 7
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
