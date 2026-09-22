import React, { useEffect, useState, useRef } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { useParams, useLocation, matchPath, MemoryRouter, NavLink, useNavigate } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faChevronDown,
  faChevronUp,
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
  faTrash,
  faShareNodes,
  faSliders,
  faList,
  faTh,
  faServer,
  faChevronRight,
  faPlay,
  faRotateRight,
  faStop,
  faSkull,
  faCheckCircle,
  faEllipsisVertical,
  faBan,
  faTriangleExclamation,
  faFolder,
  faNetworkWired,
  faCircle,
  faWindowRestore,
  faThumbtack,
  faUserCog,
  faGraduationCap,
  faCircleHalfStroke,
  faCheck,
  faMoon,
  faSun,
  faArrowRightFromBracket,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';
import Notification from '@/elements/feedback/Notification.tsx';
import { NotificationCenter } from './components/theme/NotificationCenter.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import { Extension, ExtensionContext, globalTranslationHandle } from 'shared';
import { useComputedColorScheme, useMantineColorScheme, type MantineThemeOverride, ActionIcon, Divider as MantineDivider } from '@mantine/core';
import { axiosInstance } from '@/api/axios.ts';
import { useServerStore } from '@/stores/server.ts';
import { useUserStore } from '@/stores/user.ts';
import { getGlobalStore, useGlobalStore } from '@/stores/global.ts';
import { useQueryClient } from '@tanstack/react-query';
import { bytesToString, mbToBytes } from '@/lib/format/size.ts';
import { formatMilliseconds } from '@/lib/format/time.ts';
import { formatAllocation } from '@/lib/domain/server.ts';
import { copyToClipboard } from '@/lib/clipboard/copy.ts';
import Alert from '@/elements/feedback/Alert.tsx';
import Spinner from '@/elements/feedback/Spinner.tsx';
import * as Spinners from 'react-spinners';
import pkg from '../package.json';
import './app.css';
import { renderPreloaderCanvas } from './lib/preloaderCanvas.ts';

// Preloader with multiple high-tech styles, exact duration timing & smooth dismissal
(function initQunixDynamicPreloader() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  try {
    let settings: any = {};
    const raw = localStorage.getItem('qunix_theme_settings');
    if (raw) {
      settings = JSON.parse(raw);
    }
    const userPrivacy = localStorage.getItem('qunix_user_privacy_mode');
    const isPrivacy = userPrivacy !== null ? userPrivacy === 'true' : false;
    document.documentElement.setAttribute('data-privacy-blur', isPrivacy ? 'true' : 'false');
    const enabled = settings.enable_preloader !== undefined ? settings.enable_preloader : true;

    // Clean up any static preloader if preloader is disabled
    const staticShell = document.getElementById('qunix-preloader-shell');
    if (!enabled) {
      if ((window as any).__qunixStaticPreloaderStop) {
        try { (window as any).__qunixStaticPreloaderStop(); } catch (_) {}
      }
      if (staticShell) staticShell.remove();
      const dyn = document.getElementById('qunix-dyn-preloader');
      if (dyn) dyn.remove();
      return;
    }

    if (document.getElementById('qunix-dyn-preloader')) return;

    const accentColor = settings.preloader_color || settings.preloaderColor || '#7aa2f7';
    const preloaderStyle = settings.preloader_style || settings.preloaderStyle || 'bar';
    const preloaderText = (settings.preloader_text !== undefined ? settings.preloader_text : settings.preloaderText) || 'INITIALIZING PANEL...';
    const targetDelay = Math.max(200, Number(settings.preloader_delay ?? 1500));
    const initStartTime = (window as any).__qunixPreloaderStartTime || performance.now();

    const bgColor = settings.preloader_bg_color || settings.preloaderBgColor || settings.login_background_color || settings.loginBackgroundColor || '#090a0f';
    const bgImgUrl = settings.preloader_bg_image || settings.preloaderBgImage || settings.login_background_image || settings.loginBackgroundImage || '';

    let appName = settings.site_title || settings.siteTitle || settings.app_name || settings.appName || '';
    let customLogoUrl = settings.preloader_logo || settings.preloaderLogo || '';
    let isPreloaderBanner = false;

    // 1. Check Calagopus 'global' Zustand store in localStorage
    try {
      const rawGlobal = localStorage.getItem('global');
      if (rawGlobal) {
        const parsed = JSON.parse(rawGlobal);
        if (!appName && parsed?.state?.settings?.app?.name) {
          appName = parsed.state.settings.app.name;
        }
        if (!customLogoUrl) {
          if (parsed?.state?.settings?.app?.banner) {
            customLogoUrl = parsed.state.settings.app.banner;
            isPreloaderBanner = true;
          } else {
            customLogoUrl = parsed?.state?.settings?.app?.icon || parsed?.state?.settings?.app?.iconLight || '';
          }
        }
      }
    } catch (_) {}

    // 2. Fallback to legacy settings keys
    try {
      const rawPanelSettings = localStorage.getItem('settings') || localStorage.getItem('panel_settings');
      if (rawPanelSettings) {
        const parsed = JSON.parse(rawPanelSettings);
        if (!appName && parsed?.app?.name) appName = parsed.app.name;
        if (!customLogoUrl) {
          if (parsed?.app?.banner) {
            customLogoUrl = parsed.app.banner;
            isPreloaderBanner = true;
          } else {
            customLogoUrl = parsed?.app?.icon || parsed?.app?.iconLight || '';
          }
        }
      }
    } catch (_) {}

    // 3. Fallback to Meta tags or document.title
    if (!appName) {
      const metaOg = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
      const metaApp = document.querySelector('meta[name="application-name"]')?.getAttribute('content');
      const metaTitle = document.querySelector('meta[name="title"]')?.getAttribute('content');
      appName = metaOg || metaApp || metaTitle || document.title || 'Calagopus';
      appName = appName.split(' - ')[0].split(' | ')[0].trim();
    }
    if (!appName) appName = 'Calagopus';

    if (!customLogoUrl) {
      customLogoUrl = '/icon.svg';
    } else if (
      customLogoUrl.toLowerCase().includes('banner') ||
      customLogoUrl.toLowerCase().includes('2016')
    ) {
      isPreloaderBanner = true;
    }

    const bgStyle = bgImgUrl && bgImgUrl.trim()
      ? `background-image: url("${bgImgUrl}"); background-size: cover; background-position: center; background-repeat: no-repeat; background-color: ${bgColor};`
      : `background: radial-gradient(circle at 50% 35%, rgba(108, 92, 231, 0.22), transparent 65%), ${bgColor};`;

    const styleEl = document.createElement('style');
    styleEl.id = 'qunix-dyn-preloader-style';
    styleEl.textContent = `
      #qunix-dyn-preloader {
        position: fixed;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        ${bgStyle}
        z-index: 99999;
        transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: none;
      }
      #qunix-dyn-preloader.fade-out {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
      }
      .qunix-dyn-brand {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
        text-align: center;
      }
      .qunix-dyn-logo-img {
        max-width: 220px;
        max-height: 70px;
        width: auto;
        height: auto;
        object-fit: contain;
        animation: qunix-dyn-pulse 2s ease-in-out infinite;
        margin-bottom: 8px;
      }
      .qunix-dyn-brand.is-banner .qunix-dyn-logo-img {
        max-width: min(520px, 92vw) !important;
        max-height: 130px !important;
        margin-bottom: 18px !important;
      }
      .qunix-dyn-brand.is-banner .qunix-dyn-title {
        display: none !important;
      }
      .qunix-dyn-title {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 22px;
        font-weight: 700;
        letter-spacing: -0.5px;
        color: #ffffff;
        text-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
        margin-bottom: 4px;
      }
      .qunix-dyn-subtitle {
        margin-top: 14px;
        font-family: "JetBrains Mono", monospace, system-ui;
        font-size: 11px;
        letter-spacing: 2.2px;
        color: #a9b1d6;
        text-transform: uppercase;
        text-shadow: 0 0 10px ${accentColor}66;
        animation: qunix-text-pulse 2s ease-in-out infinite;
      }

      @keyframes qunix-dyn-pulse {
        0%, 100% { transform: scale(1.03); opacity: 1; }
        50% { transform: scale(0.97); opacity: 0.85; }
      }
      @keyframes qunix-text-pulse {
        0%, 100% { opacity: 0.9; }
        50% { opacity: 0.55; }
      }
    `;
    document.head.appendChild(styleEl);

    if (staticShell) {
      if ((window as any).__qunixStaticPreloaderStop) {
        try { (window as any).__qunixStaticPreloaderStop(); } catch (_) {}
      }
      staticShell.remove();
    }

    const logoHtml = `<img src="${customLogoUrl}" alt="${appName}" class="qunix-dyn-logo-img" onError="this.style.display='none'" />`;
    const loaderHtml = `<canvas id="qunix-dyn-spinner-canvas" width="440" height="140" style="width: 220px; height: 70px; display: block; margin: 0 auto;"></canvas>`;
    const subtitleHtml = `<div class="qunix-dyn-subtitle">${preloaderText}</div>`;
    const titleHtml = isPreloaderBanner ? '' : `<div class="qunix-dyn-title">${appName}</div>`;

    const preloaderEl = document.createElement('div');
    preloaderEl.id = 'qunix-dyn-preloader';
    preloaderEl.innerHTML = `
      <div class="qunix-dyn-brand ${isPreloaderBanner ? 'is-banner' : ''}">
        ${logoHtml}
        ${titleHtml}
      </div>
      ${loaderHtml}
      ${subtitleHtml}
    `;
    document.body.appendChild(preloaderEl);

    const canvas = document.getElementById('qunix-dyn-spinner-canvas') as HTMLCanvasElement | null;
    let stopSpinner: (() => void) | null = null;
    if (canvas) {
      stopSpinner = renderPreloaderCanvas(canvas, preloaderStyle, accentColor);
    }

    let isDismissed = false;

    const executeDismiss = () => {
      if (isDismissed) return;
      isDismissed = true;

      if (stopSpinner) {
        try { stopSpinner(); } catch (_) {}
        stopSpinner = null;
      }
      if ((window as any).__qunixStaticPreloaderStop) {
        try { (window as any).__qunixStaticPreloaderStop(); } catch (_) {}
      }

      preloaderEl.classList.add('fade-out');
      setTimeout(() => {
        try {
          preloaderEl.remove();
          styleEl.remove();
          const staticShell = document.getElementById('qunix-preloader-shell');
          if (staticShell) staticShell.remove();
        } catch (_) {}
      }, 350);
    };

    const requestDismiss = (immediate = false) => {
      if (immediate) {
        executeDismiss();
        return;
      }
      const elapsed = performance.now() - initStartTime;
      const remaining = Math.max(0, targetDelay - elapsed);
      setTimeout(executeDismiss, remaining);
    };

    (window as any).dismissQunixPreloader = requestDismiss;
    (window as any).dismissQunixPreloaderNow = () => executeDismiss();

    // Listen for settings event to dismiss immediately if disabled or update title
    const handleSettingsLoaded = (e: Event) => {
      try {
        const s = (e as CustomEvent).detail;
        if (s && s.enable_preloader === false) {
          executeDismiss();
          return;
        }
        const updatedTitle = s?.site_title || s?.siteTitle || s?.app_name || s?.appName;
        if (updatedTitle) {
          const dt = document.querySelector('#qunix-dyn-preloader .qunix-dyn-title');
          if (dt) dt.textContent = updatedTitle;
          const st = document.getElementById('qunix-preloader-title');
          if (st) st.textContent = updatedTitle;
        }
      } catch (_) {}
    };
    window.addEventListener('qunix-settings-loaded', handleSettingsLoaded);

    // Since ESM chunks execute when document is interactive or complete, trigger dismiss immediately based on targetDelay
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      requestDismiss();
    } else {
      window.addEventListener('DOMContentLoaded', () => requestDismiss(), { once: true });
      window.addEventListener('load', () => requestDismiss(), { once: true });
      setTimeout(executeDismiss, targetDelay + 1500);
    }
  } catch (err) {
    console.error('Failed to init dynamic preloader:', err);
  }
})();

const AdminSettingsPageLazy = React.lazy(() => import('./AdminSettingsPage.tsx'));
const ConfigurationPageLazy = React.lazy(() => import('./ConfigurationPage.tsx'));

const LazyAdminSettings: React.FC = (props) => (
  <React.Suspense fallback={<div className="p-8 text-center text-neutral-400">Loading Theme Settings...</div>}>
    <AdminSettingsPageLazy {...props} />
  </React.Suspense>
);

const LazyConfiguration: React.FC = (props) => (
  <React.Suspense fallback={<div className="p-8 text-center text-neutral-400">Loading Configuration...</div>}>
    <ConfigurationPageLazy {...props} />
  </React.Suspense>
);

import Sidebar from '@/elements/navigation/Sidebar.tsx';
import Button from '@/elements/buttons/Button.tsx';
import Tooltip from '@/elements/overlays/Tooltip.tsx';
import Card from '@/elements/data-display/Card.tsx';
import Avatar from '@/elements/data-display/Avatar.tsx';
import Select from '@/elements/input/Select.tsx';
import { useAuth } from '@/providers/AuthProvider.tsx';
import { isAdmin } from '@/lib/auth/permissions.ts';
import AccountContentContainer from '@/elements/containers/AccountContentContainer.tsx';
import { useWindows } from '@/providers/WindowProvider.tsx';
import { useTranslations } from '@/providers/TranslationProvider.tsx';
import ContextMenu from '@/elements/overlays/ContextMenu.tsx';
import RouterRoutes from '@/RouterRoutes.tsx';
import DynamicIcon from './components/theme/DynamicIcon.tsx';
import QunixServerListRow from './components/theme/QunixServerListRow.tsx';
import QunixSidebar from './components/theme/QunixSidebar.tsx';
import {
  useDashboardLayout,
  QunixDashboardContainerWrapper,
} from './components/theme/DashboardLayout.tsx';
import ServerBannerComponent from './components/theme/ServerBanner.tsx';
import { CustomToast, QunixThemeToast } from './components/theme/ToastComponents.tsx';
import QunixPrivacyContainer from './components/theme/QunixPrivacyContainer.tsx';

if (typeof window !== 'undefined' && !(window as any).qunixRenderedServersMap) {
  (window as any).qunixRenderedServersMap = new Map<string, any>();
}

const ITEM_DEFAULT_ICONS: Record<string, string> = {
  servers: 'server',
  admin: 'cog-6-tooth',
  account: 'user',
  security_keys: 'key',
  api_keys: 'code-bracket',
  ssh_keys: 'key',
  snippets: 'document-text',
  oauth: 'link',
  sessions: 'shield-check',
  shortcuts: 'command-line',
  activity: 'clock',
  server_console: 'terminal',
  server_files: 'folder',
  server_databases: 'circle-stack',
  server_schedules: 'calendar',
  server_users: 'users',
  server_backups: 'archive-box',
  server_network: 'globe-alt',
  server_startup: 'play',
  server_settings: 'adjustments-horizontal',
  admin_settings: 'adjustments-horizontal',
  admin_announcements: 'megaphone',
  admin_assets: 'photo',
  admin_extensions: 'puzzle-piece',
  admin_users: 'users',
  admin_locations: 'map-pin',
  admin_nodes: 'server-stack',
  admin_servers: 'server',
  admin_nests: 'archive-box',
  admin_egg_configurations: 'cog-6-tooth',
  admin_egg_repositories: 'folder',
  admin_database_hosts: 'circle-stack',
  admin_database_agent_hosts: 'server-stack',
  admin_database_agent_templates: 'cube',
  admin_oauth_providers: 'key',
  admin_backup_configurations: 'archive-box',
  admin_mounts: 'folder-tree',
  admin_roles: 'document-text',
  admin_activity: 'clock',
};

const getSidebarKey = (to: string): string | null => {
  const cleanPath = to.split('?')[0].split('#')[0].replace(/\/$/, '');

  if (cleanPath === '' || cleanPath === '/' || cleanPath === '/grouped') return 'servers';
  if (cleanPath === '/admin' || cleanPath === '/admin/') return 'admin';
  if (cleanPath.startsWith('/admin/settings')) return 'admin_settings';
  if (cleanPath.startsWith('/admin/announcements')) return 'admin_announcements';
  if (cleanPath.startsWith('/admin/assets')) return 'admin_assets';
  if (cleanPath.startsWith('/admin/extensions')) return 'admin_extensions';
  if (cleanPath.startsWith('/admin/users')) return 'admin_users';
  if (cleanPath.startsWith('/admin/locations')) return 'admin_locations';
  if (cleanPath.startsWith('/admin/nodes')) return 'admin_nodes';
  if (cleanPath.startsWith('/admin/servers')) return 'admin_servers';
  if (cleanPath.startsWith('/admin/nests')) return 'admin_nests';
  if (cleanPath.startsWith('/admin/egg-configurations')) return 'admin_egg_configurations';
  if (cleanPath.startsWith('/admin/egg-repositories')) return 'admin_egg_repositories';
  if (cleanPath.startsWith('/admin/database-hosts')) return 'admin_database_hosts';
  if (cleanPath.startsWith('/admin/database-agent-hosts')) return 'admin_database_agent_hosts';
  if (cleanPath.startsWith('/admin/database-agent-templates')) return 'admin_database_agent_templates';
  if (cleanPath.startsWith('/admin/oauth-providers')) return 'admin_oauth_providers';
  if (cleanPath.startsWith('/admin/backup-configurations')) return 'admin_backup_configurations';
  if (cleanPath.startsWith('/admin/mounts')) return 'admin_mounts';
  if (cleanPath.startsWith('/admin/roles')) return 'admin_roles';
  if (cleanPath.startsWith('/admin/activity')) return 'admin_activity';
  if (cleanPath.startsWith('/account/security-keys')) return 'security_keys';
  if (cleanPath.startsWith('/account/api-keys')) return 'api_keys';
  if (cleanPath.startsWith('/account/ssh-keys')) return 'ssh_keys';
  if (cleanPath.startsWith('/account/snippets') || cleanPath.startsWith('/account/command-snippets')) return 'snippets';
  if (cleanPath.startsWith('/account/oauth') || cleanPath.startsWith('/account/oauth-links')) return 'oauth';
  if (cleanPath.startsWith('/account/sessions')) return 'sessions';
  if (cleanPath.startsWith('/account/shortcuts')) return 'shortcuts';
  if (cleanPath.startsWith('/account/activity')) return 'activity';
  if (cleanPath.startsWith('/account')) return 'account';

  // Match server routes
  if (cleanPath.startsWith('/server/')) {
    const parts = cleanPath.split('/'); // ["", "server", "uuid", "subpage"]
    if (parts.length === 3) return 'server_console';
    const sub = parts[3];
    if (sub === 'files' || parts.slice(3).join('/').startsWith('files')) return 'server_files';
    if (sub === 'databases') return 'server_databases';
    if (sub === 'schedules') return 'server_schedules';
    if (sub === 'users' || sub === 'subusers') return 'server_users';
    if (sub === 'backups') return 'server_backups';
    if (sub === 'network') return 'server_network';
    if (sub === 'startup') return 'server_startup';
    if (sub === 'mounts') return 'server_mounts';
    if (sub === 'activity') return 'server_activity';
    if (sub === 'settings') return 'server_settings';
  }

  return null;
};

const getGlobalPackIcon = (pack: string, defaultName: string): string => {
  if (pack === 'heroicons') {
    return defaultName;
  }
  if (pack === 'mdi') {
    const mdiMap: Record<string, string> = {
      'server': 'server',
      'cog-6-tooth': 'cog',
      'cog': 'cog',
      'user': 'account',
      'key': 'key',
      'code-bracket': 'code-tags',
      'document-text': 'file-document-outline',
      'link': 'link',
      'shield-check': 'shield-check',
      'command-line': 'console',
      'clock': 'clock-outline',
      'terminal': 'console',
      'folder': 'folder',
      'circle-stack': 'database',
      'calendar': 'calendar',
      'users': 'account-group',
      'archive-box': 'archive',
      'globe-alt': 'earth',
      'play': 'play',
      'adjustments-horizontal': 'tune',
      'megaphone': 'bullhorn',
      'photo': 'image',
      'puzzle-piece': 'puzzle',
      'map-pin': 'map-marker',
      'server-stack': 'layers',
      'cube': 'package',
      'folder-tree': 'folder',
    };
    return mdiMap[defaultName] || defaultName;
  }
  if (pack === 'lineicons') {
    const lniMap: Record<string, string> = {
      'server': 'server',
      'cog-6-tooth': 'cog',
      'cog': 'cog',
      'user': 'user',
      'key': 'key',
      'code-bracket': 'code',
      'document-text': 'text-format',
      'link': 'link',
      'shield-check': 'shield',
      'command-line': 'terminal',
      'clock': 'timer',
      'terminal': 'terminal',
      'folder': 'folder',
      'circle-stack': 'database',
      'calendar': 'calendar',
      'users': 'users',
      'archive-box': 'archive',
      'globe-alt': 'world',
      'play': 'play',
      'adjustments-horizontal': 'control-panel',
      'megaphone': 'bullhorn',
      'photo': 'image',
      'puzzle-piece': 'puzzle',
      'map-pin': 'map-marker',
      'server-stack': 'layers',
      'cube': 'package',
      'folder-tree': 'folder',
    };
    return lniMap[defaultName] || defaultName;
  }
  if (pack === 'lucide') {
    const lucideMap: Record<string, string> = {
      'server': 'server',
      'cog-6-tooth': 'settings',
      'cog': 'settings',
      'user': 'user',
      'key': 'key',
      'code-bracket': 'code',
      'document-text': 'file-text',
      'link': 'link',
      'shield-check': 'shield-check',
      'command-line': 'terminal',
      'clock': 'clock',
      'terminal': 'terminal',
      'folder': 'folder',
      'circle-stack': 'database',
      'calendar': 'calendar',
      'users': 'users',
      'archive-box': 'archive',
      'globe-alt': 'globe',
      'play': 'play',
      'adjustments-horizontal': 'sliders',
      'megaphone': 'megaphone',
      'photo': 'image',
      'puzzle-piece': 'puzzle',
      'map-pin': 'map-pin',
      'server-stack': 'hard-drive',
      'cube': 'box',
      'folder-tree': 'folder-tree',
    };
    return lucideMap[defaultName] || defaultName;
  }
  return defaultName;
};

let globalServerNavExpanded = false;

const useServerNavCollapse = () => {
  const [expanded, setExpanded] = useState<boolean>(() => globalServerNavExpanded);

  useEffect(() => {
    const handleToggle = () => {
      setExpanded(globalServerNavExpanded);
    };
    window.addEventListener('qunix-server-nav-expand-toggle', handleToggle);
    return () => window.removeEventListener('qunix-server-nav-expand-toggle', handleToggle);
  }, []);

  const toggle = () => {
    globalServerNavExpanded = !globalServerNavExpanded;
    window.dispatchEvent(new Event('qunix-server-nav-expand-toggle'));
  };

  const expand = () => {
    if (!globalServerNavExpanded) {
      globalServerNavExpanded = true;
      window.dispatchEvent(new Event('qunix-server-nav-expand-toggle'));
    }
  };

  return { expanded, toggle, expand };
};

const SERVER_ROUTE_ORDER: Record<string, number> = {
  '': 0,
  'files': 1,
  'databases': 2,
  'schedules': 3,
  'users': 4,
  'backups': 5,
  'network': 6,
  'startup': 7,
  'settings': 8,
};

const QunixSidebarDivider: React.FC<any> = (props) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const categoryKey = props.label ? `qunix_cat_collapsed_${props.label.toLowerCase().replace(/[^a-z0-9]/g, '_')}` : '';

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (!categoryKey || typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(categoryKey) === 'true';
    } catch (_) {
      return false;
    }
  });

  const toggleCategory = (nextState?: boolean) => {
    const newState = nextState !== undefined ? nextState : !collapsed;
    setCollapsed(newState);
    if (categoryKey) {
      try {
        localStorage.setItem(categoryKey, String(newState));
      } catch (_) { }
    }
  };

  useEffect(() => {
    if (!headerRef.current) return;
    const headerEl = headerRef.current;

    const applyCollapse = () => {
      let next = headerEl.nextElementSibling as HTMLElement | null;
      let hasActiveChild = false;

      let tempNext = next;
      while (tempNext) {
        if (tempNext.classList.contains('qunix-sidebar-category-header') || tempNext.hasAttribute('data-qunix-category-divider')) {
          break;
        }
        if (tempNext.querySelector('.active, [data-active="true"], a.active')) {
          hasActiveChild = true;
          break;
        }
        tempNext = tempNext.nextElementSibling as HTMLElement | null;
      }

      const effectiveCollapsed = hasActiveChild ? false : collapsed;

      while (next) {
        if (next.classList.contains('qunix-sidebar-category-header') || next.hasAttribute('data-qunix-category-divider')) {
          break;
        }
        if (effectiveCollapsed) {
          next.style.display = 'none';
        } else {
          next.style.display = '';
        }
        next = next.nextElementSibling as HTMLElement | null;
      }
    };

    applyCollapse();
    const timer = setTimeout(applyCollapse, 50);
    return () => clearTimeout(timer);
  }, [collapsed, props.label]);

  if (!props.label) {
    return <MantineDivider className='my-2' />;
  }

  return (
    <div
      ref={headerRef}
      onClick={() => toggleCategory()}
      className="qunix-sidebar-category-header"
      data-qunix-category-divider="true"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 10px',
        margin: '12px 4px 4px 4px',
        cursor: 'pointer',
        userSelect: 'none',
        borderRadius: '4px',
        transition: 'background 0.15s ease',
        boxSizing: 'border-box',
        maxWidth: '100%',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{props.label}</span>
        <FontAwesomeIcon
          icon={faChevronRight}
          style={{
            fontSize: '9px',
            color: '#64748b',
            transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)',
            transition: 'transform 0.15s ease',
            flexShrink: 0,
          }}
        />
      </span>
    </div>
  );
};

const QunixSidebarFooter: React.FC = () => {
  const { t } = useTranslations();
  const { impersonating, user, doLogout } = useAuth();
  const navigate = useNavigate();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('dark');

  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(() => {
    const userVal = localStorage.getItem('qunix_user_privacy_mode');
    if (userVal !== null) return userVal === 'true';
    return document.documentElement.getAttribute('data-privacy-blur') === 'true';
  });

  useEffect(() => {
    const handleSync = (e: Event) => {
      setIsPrivacyMode(Boolean((e as CustomEvent).detail));
    };
    window.addEventListener('qunix-privacy-mode-changed', handleSync);
    return () => window.removeEventListener('qunix-privacy-mode-changed', handleSync);
  }, []);

  if (!user) {
    return null;
  }

  const suspended = Boolean(user.suspended);

  const changeTheme = async (event: React.MouseEvent, nextTheme: 'auto' | 'dark' | 'light') => {
    if (nextTheme === colorScheme) {
      return;
    }

    const nextComputed =
      nextTheme === 'auto' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : nextTheme;

    if (nextComputed === computedColorScheme || !document.startViewTransition) {
      setColorScheme(nextTheme);
      return;
    }

    const x = event.clientX;
    const y = event.clientY;

    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setColorScheme(nextTheme);
      });
    });

    transition.ready.then(() => {
      const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`];

      document.documentElement.animate(
        { clipPath },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        },
      );
    });
  };

  return (
    <ContextMenu
      items={[
        {
          type: 'action',
          icon: faUserCog,
          label: t('pages.account.account.title', {}),
          hidden: suspended,
          onClick: () => navigate('/account'),
        },
        {
          type: 'divider',
          hidden: suspended || !isAdmin(user),
        },
        {
          type: 'action',
          icon: faGraduationCap,
          label: t('pages.account.admin.title', {}),
          hidden: suspended || !isAdmin(user),
          onClick: () => navigate('/admin'),
        },
        {
          type: 'divider',
          hidden: suspended,
        },
        {
          type: 'action',
          icon: faCircleHalfStroke,
          label: t('elements.sidebar.button.theme', {}),
          items: [
            {
              type: 'action',
              icon: faCircleHalfStroke,
              label: t('elements.sidebar.button.themeAuto', {}),
              rightSection: colorScheme === 'auto' && <FontAwesomeIcon icon={faCheck} size='sm' />,
              onClick: (e) => changeTheme(e, 'auto'),
            },
            {
              type: 'action',
              icon: faMoon,
              label: t('elements.sidebar.button.themeDark', {}),
              rightSection: colorScheme === 'dark' && <FontAwesomeIcon icon={faCheck} size='sm' />,
              onClick: (e) => changeTheme(e, 'dark'),
            },
            {
              type: 'action',
              icon: faSun,
              label: t('elements.sidebar.button.themeLight', {}),
              rightSection: colorScheme === 'light' && <FontAwesomeIcon icon={faCheck} size='sm' />,
              onClick: (e) => changeTheme(e, 'light'),
            },
          ],
        },
        {
          type: 'action',
          icon: faEyeSlash,
          label: 'Privacy Mode',
          rightSection: isPrivacyMode && <FontAwesomeIcon icon={faCheck} size='sm' />,
          onClick: () => {
            const nextVal = !isPrivacyMode;
            setIsPrivacyMode(nextVal);
            localStorage.setItem('qunix_user_privacy_mode', String(nextVal));
            document.documentElement.setAttribute('data-privacy-blur', nextVal ? 'true' : 'false');
            window.dispatchEvent(new CustomEvent('qunix-privacy-mode-changed', { detail: nextVal }));
          },
        },
        {
          type: 'divider',
        },
        {
          type: 'action',
          icon: faArrowRightFromBracket,
          label: impersonating
            ? t('elements.sidebar.button.stopImpersonating', {})
            : t('elements.sidebar.button.logout', {}),
          color: 'red',
          onClick: doLogout,
        },
      ]}
    >
      {({ openMenu }) => (
        <Card
          className='flex flex-row! justify-between items-center min-h-fit'
          p='xs'
          hoverable
          id='sidebar-account-card'
          onClick={(e) => {
            const isIconOnly = document.documentElement.getAttribute('data-sidebar-style') === 'icons';
            if (isIconOnly) {
              e.preventDefault();
              e.stopPropagation();
              const cardEl = (e.currentTarget.closest('#sidebar-account-card') || e.currentTarget) as HTMLElement;
              const rect = cardEl.getBoundingClientRect();
              openMenu(rect.right + 10, rect.bottom - 40);
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            openMenu(e.clientX, e.clientY);
          }}
        >
          <NavLink
            to='/account'
            className='flex items-center flex-1 min-w-0'
            onClick={(e) => {
              const isIconOnly = document.documentElement.getAttribute('data-sidebar-style') === 'icons';
              if (isIconOnly) {
                e.preventDefault();
                e.stopPropagation();
                const cardEl = (e.currentTarget.closest('#sidebar-account-card') || e.currentTarget) as HTMLElement;
                const rect = cardEl.getBoundingClientRect();
                openMenu(rect.right + 10, rect.bottom - 40);
                return;
              }
              e.preventDefault();
              navigate('/account');
            }}
          >
            <Avatar size={40} className='select-none shrink-0' src={user.avatar} name={user.username} />
            <span className='font-sans font-normal text-sm whitespace-nowrap leading-tight ml-3 overflow-hidden text-ellipsis'>
              {user.username}
            </span>
          </NavLink>

          <ActionIcon
            variant='subtle'
            className='shrink-0'
            onClick={(e) => {
              e.preventDefault();
              openMenu(e.clientX, e.clientY);
            }}
          >
            <FontAwesomeIcon icon={faEllipsisVertical} />
          </ActionIcon>
        </Card>
      )}
    </ContextMenu>
  );
};

const QunixSidebarLink: React.FC<any> = (props) => {
  const { t } = useTranslations();
  const { addWindow } = useWindows();
  const { pathname } = useLocation();
  const isLight = document.documentElement.getAttribute('data-mantine-color-scheme') === 'light';
  const extraActive = props.activeMatches?.some((pattern: string) => matchPath({ path: pattern, end: false }, pathname)) ?? false;

  const [s, setSettings] = useState<any>(() => (window as any).qunixThemeSettings);

  useEffect(() => {
    const handleLoaded = (e: Event) => {
      setSettings((e as CustomEvent).detail);
    };
    window.addEventListener('qunix-settings-loaded', handleLoaded);
    return () => window.removeEventListener('qunix-settings-loaded', handleLoaded);
  }, []);

  let to = props.to;
  if (to.endsWith('/*')) to = to.slice(0, to.length - 2);

  const sidebarIcons = s?.sidebar_icons || s?.sidebarIcons || {};
  const globalPack = s?.sidebar_global_pack || s?.sidebarGlobalPack || 'default';
  const sidebarStyle = s?.sidebar_style || s?.sidebarStyle || 'full';

  const rawTo = props.to || '';
  const cleanTo = rawTo.split('?')[0].split('#')[0].replace(/\/$/, '').replace(/\/\*$/, '');

  const key = getSidebarKey(props.to);

  let serverNormalized = cleanTo;
  let serverSubpath = '';
  if (cleanTo.startsWith('/server/')) {
    const parts = cleanTo.split('/');
    if (parts.length >= 4) {
      serverSubpath = parts.slice(3).join('/');
      serverNormalized = `/server/:id/${serverSubpath}`;
    }
  }

  let customIcon: string | null = null;
  const linkName = typeof props.name === 'string' ? props.name : '';
  const lowerName = linkName.toLowerCase();

  // 1. Check exact key or name or redirect keys
  if (key && sidebarIcons[key]) {
    customIcon = sidebarIcons[key];
  } else if (linkName && sidebarIcons[`redirect:${linkName}`]) {
    customIcon = sidebarIcons[`redirect:${linkName}`];
  } else if (lowerName && sidebarIcons[`redirect:${lowerName}`]) {
    customIcon = sidebarIcons[`redirect:${lowerName}`];
  } else if (linkName && sidebarIcons[linkName]) {
    customIcon = sidebarIcons[linkName];
  } else if (lowerName && sidebarIcons[lowerName]) {
    customIcon = sidebarIcons[lowerName];
  } else if (props.to && sidebarIcons[`redirect:${props.to}`]) {
    customIcon = sidebarIcons[`redirect:${props.to}`];
  } else if (cleanTo && sidebarIcons[`redirect:${cleanTo}`]) {
    customIcon = sidebarIcons[`redirect:${cleanTo}`];
  } else if (sidebarIcons[props.to]) {
    customIcon = sidebarIcons[props.to];
  } else if (sidebarIcons[to]) {
    customIcon = sidebarIcons[to];
  } else if (sidebarIcons[cleanTo]) {
    customIcon = sidebarIcons[cleanTo];
  } else if (serverNormalized && sidebarIcons[serverNormalized]) {
    customIcon = sidebarIcons[serverNormalized];
  } else if (serverSubpath && sidebarIcons[`/server/${serverSubpath}`]) {
    customIcon = sidebarIcons[`/server/${serverSubpath}`];
  } else if (serverSubpath && sidebarIcons[serverSubpath]) {
    customIcon = sidebarIcons[serverSubpath];
  } else {
    const matchedKey = Object.keys(sidebarIcons).find((k) => {
      if (!k) return false;
      const cleanK = k.split('?')[0].split('#')[0].replace(/\/$/, '').replace(/\/\*$/, '');
      if (cleanK === cleanTo || cleanK === serverNormalized) return true;
      if (serverSubpath && (cleanK === `/server/${serverSubpath}` || cleanK === serverSubpath)) return true;
      if (linkName && cleanK.replace(/^redirect:/, '').toLowerCase() === lowerName) return true;
      if (cleanTo && cleanK && cleanTo.endsWith(cleanK)) return true;
      return false;
    });
    if (matchedKey) {
      customIcon = sidebarIcons[matchedKey];
    }
  }

  if (globalPack && globalPack !== 'default') {
    if (!customIcon || customIcon.startsWith('default:')) {
      let defaultName = key ? (ITEM_DEFAULT_ICONS[key] || null) : null;
      if (!defaultName && props.icon && typeof props.icon === 'object' && props.icon.iconName) {
        defaultName = props.icon.iconName;
      }
      if (!defaultName) {
        defaultName = 'server';
      }
      const mappedIcon = getGlobalPackIcon(globalPack, defaultName);
      customIcon = `${globalPack}:${mappedIcon}`;
    }
  } else {
    if (customIcon && customIcon.startsWith('default:')) {
      customIcon = null;
    }
  }

  const isMinimized = sidebarStyle === 'icons';

  const renderButton = (isActive: boolean) => {
    return (
      <Button
        color={isActive ? 'blue' : 'gray'}
        className={`${isActive ? 'cursor-default! active' : ''} ${props.className || ''}`}
        variant={isLight && isActive ? 'outline' : 'subtle'}
        fullWidth
      >
        <div className="qunix-nav-wrapper">
          <DynamicIcon
            icon={customIcon}
            fallback={props.icon}
            style={{ fontSize: '16px', flexShrink: 0 }}
            className="qunix-nav-icon"
          />
          <span className="qunix-nav-text">{props.name}</span>
        </div>
      </Button>
    );
  };

  const isExternal = to.startsWith('http://') || to.startsWith('https://');

  const linkEl = isExternal ? (
    <a
      href={to}
      target="_blank"
      rel="noopener noreferrer"
      className='w-full'
      style={{ display: 'block', textDecoration: 'none' }}
    >
      {renderButton(false)}
    </a>
  ) : (
    <NavLink
      to={to}
      end={props.end}
      className='w-full'
      style={{ display: 'block' }}
    >
      {({ isActive: navActive }) => {
        const isActive = navActive || extraActive;
        const button = renderButton(isActive);
        return button;
      }}
    </NavLink>
  );

  const contextMenuItems: any[] = isExternal
    ? [
        {
          type: 'action',
          icon: faWindowRestore,
          label: t('elements.sidebar.button.openInNewTab', {}),
          onClick: () => window.open(to, '_blank'),
          color: 'gray',
        },
      ]
    : [
        {
          type: 'action',
          icon: faWindowRestore,
          label: t('elements.sidebar.button.openInVirtualWindow', {}),
          onClick: () =>
            addWindow(
              props.title || props.name || 'Window',
              <MemoryRouter initialEntries={[to]}>
                <RouterRoutes isNormal={false} />
              </MemoryRouter>,
            ),
          color: 'gray',
        },
        {
          type: 'action',
          icon: faWindowRestore,
          label: t('elements.sidebar.button.openInPopup', {}),
          onClick: () =>
            window.open(
              to,
              '_blank',
              'popup=yes,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes',
            ),
          color: 'gray',
        },
        {
          type: 'action',
          icon: faWindowRestore,
          label: t('elements.sidebar.button.openInNewTab', {}),
          onClick: () => window.open(to, '_blank'),
          color: 'gray',
        },
      ];

  return (
    <ContextMenu
      menuProps={{ width: 250 }}
      items={contextMenuItems as any}
    >
      {({ openMenu }) => (
        <div
          onContextMenu={(e) => {
            e.preventDefault();
            const rect = e.currentTarget.getBoundingClientRect();
            openMenu(rect.left, rect.bottom);
          }}
          style={{ width: '100%' }}
        >
          {linkEl}
        </div>
      )}
    </ContextMenu>
  );
};

const qunixFontBlobCache = new Map<string, string>();
const qunixLoadedFonts = new Set<string>();

async function fetchAndInjectFontCSS(cssOrFontUrl: string, familyName: string, targetDoc: Document = document) {
  const fontSlug = familyName.replace(/\s+/g, '-').toLowerCase();
  const styleId = `qunix-font-style-${fontSlug}`;
  const existingEl = document.getElementById(styleId);
  if (existingEl && existingEl.textContent && existingEl.textContent.includes('@font-face') && qunixLoadedFonts.has(styleId)) {
    if (targetDoc && targetDoc !== document) {
      let targetEl = targetDoc.getElementById(styleId) as HTMLStyleElement | null;
      if (!targetEl) {
        targetEl = targetDoc.createElement('style');
        targetEl.id = styleId;
        targetDoc.head?.appendChild(targetEl);
      }
      targetEl.textContent = existingEl.textContent;
    }
    return;
  }

  try {
    const isFontFile = /\.(woff2?|ttf|otf)(\?.*)?$/i.test(cssOrFontUrl);
    if (isFontFile) {
      let finalUrl = cssOrFontUrl;
      if (cssOrFontUrl.startsWith('http://') || cssOrFontUrl.startsWith('https://')) {
        let blobUrl = qunixFontBlobCache.get(cssOrFontUrl);
        if (!blobUrl) {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 2500);
          try {
            const res = await fetch(cssOrFontUrl, { signal: ctrl.signal });
            if (res.ok) {
              const blob = await res.blob();
              blobUrl = URL.createObjectURL(blob);
              qunixFontBlobCache.set(cssOrFontUrl, blobUrl);
            }
          } catch (_) {} finally {
            clearTimeout(timer);
          }
        }
        if (blobUrl) finalUrl = blobUrl;
      }

      const ext = cssOrFontUrl.match(/\.(woff2?|ttf|otf)/i)?.[1]?.toLowerCase() || 'woff2';
      const format = ext === 'ttf' ? 'truetype' : ext === 'otf' ? 'opentype' : ext;

      const existingLink = document.getElementById(styleId);
      if (existingLink && existingLink.tagName.toLowerCase() === 'link') {
        existingLink.remove();
      }

      const cssContent = `@font-face { font-family: "${familyName}"; src: url("${finalUrl}") format("${format}"); font-display: swap; }`;
      const injectDirect = (doc: Document) => {
        if (!doc || !doc.head) return;
        let styleEl = doc.getElementById(styleId) as HTMLStyleElement | null;
        if (!styleEl) {
          styleEl = doc.createElement('style');
          styleEl.id = styleId;
          doc.head.appendChild(styleEl);
        }
        styleEl.textContent = cssContent;
      };
      injectDirect(document);
      if (targetDoc && targetDoc !== document) {
        injectDirect(targetDoc);
      }
      qunixLoadedFonts.add(styleId);
      return;
    }

    // 1. Fetch stylesheet text with 2500ms timeout
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2500);
    let res: Response;
    try {
      res = await fetch(cssOrFontUrl, {
        signal: ctrl.signal,
        headers: { Accept: 'text/css,*/*;q=0.1' },
      });
    } catch (_fetchErr) {
      return;
    } finally {
      clearTimeout(timer);
    }

    if (!res || !res.ok) return;

    let cssText = await res.text();

    // 2. Extract font binary URLs inside url(...)
    const urlRegex = /url\((?:['"]?)(https?:\/\/[^)'"]+)(?:['"]?)\)/g;
    const matches = Array.from(cssText.matchAll(urlRegex));
    const allFontUrls = Array.from(new Set(matches.map((m) => m[1])));

    // Limit to at most 4 primary font binaries (avoids 60 parallel fetches)
    const targetFontUrls = allFontUrls.slice(0, 4);

    // 3. Fetch font binaries in parallel with 2000ms timeout per file
    await Promise.all(
      targetFontUrls.map(async (fUrl) => {
        try {
          let blobUrl = qunixFontBlobCache.get(fUrl);
          if (!blobUrl) {
            const fontCtrl = new AbortController();
            const fontTimer = setTimeout(() => fontCtrl.abort(), 2000);
            try {
              const fontRes = await fetch(fUrl, { signal: fontCtrl.signal });
              if (fontRes.ok) {
                const fontBlob = await fontRes.blob();
                blobUrl = URL.createObjectURL(fontBlob);
                qunixFontBlobCache.set(fUrl, blobUrl);
              }
            } finally {
              clearTimeout(fontTimer);
            }
          }
          if (blobUrl) {
            cssText = cssText.split(fUrl).join(blobUrl);
          }
        } catch (_fErr) {}
      })
    );

    // 4. Strip unconverted remote font URLs in @font-face blocks so CSP doesn't warn
    cssText = cssText.replace(/@font-face\s*\{[^}]*url\(\s*['"]?https?:\/\/[^}]*\}/gi, '');

    // 5. Inject inline <style> element
    const injectIntoDoc = (doc: Document) => {
      if (!doc || !doc.head) return;
      const existingLink = doc.getElementById(styleId);
      if (existingLink && existingLink.tagName.toLowerCase() === 'link') {
        existingLink.remove();
      }
      let styleEl = doc.getElementById(styleId) as HTMLStyleElement | null;
      if (!styleEl) {
        styleEl = doc.createElement('style');
        styleEl.id = styleId;
        doc.head.appendChild(styleEl);
      }
      styleEl.textContent = cssText;
    };

    injectIntoDoc(document);
    if (targetDoc && targetDoc !== document) {
      injectIntoDoc(targetDoc);
    }
    qunixLoadedFonts.add(styleId);

    try {
      if (document.fonts && document.fonts.load) {
        document.fonts.load(`16px "${familyName}"`);
      }
      if (targetDoc && targetDoc.fonts && targetDoc.fonts.load) {
        targetDoc.fonts.load(`16px "${familyName}"`);
      }
    } catch (_) {}
  } catch (_err) {}
}

const GOOGLE_FONT_PRESET_URLS: Record<string, string> = {
  inter: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap',
  outfit: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600&display=swap',
  poppins: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap',
  'plus jakarta sans': 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600&display=swap',
  roboto: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
  'open sans': 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap',
  montserrat: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap',
  'space grotesk': 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600&display=swap',
  'fira code': 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600&display=swap',
  'jetbrains mono': 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap',
  'google sans': 'https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&display=swap',
};

async function loadFontCSPFriendly(fontName: string, targetDoc: Document = document) {
  if (!fontName) return;
  try {
    const cleanFont = fontName.trim();
    if (cleanFont.length < 2) return;

    const applyFontToDoc = (doc: Document, stack: string) => {
      if (!doc) return;
      const docRoot = doc.documentElement;
      if (docRoot) {
        docRoot.style.setProperty('--ds-font-family', stack);
        docRoot.style.setProperty('--mantine-font-family', stack);
        docRoot.style.setProperty('--font-sans', stack);
      }
      if (doc.body) {
        doc.body.style.fontFamily = stack;
      }
    };

    // 1. Direct stylesheet or font URL (http:// or https://)
    if (cleanFont.startsWith('http://') || cleanFont.startsWith('https://')) {
      let extractedName = 'CustomFont';
      const match = cleanFont.match(/family=([^&:]+)/);
      if (match && match[1]) {
        extractedName = decodeURIComponent(match[1]).replace(/\+/g, ' ').replace(/['"]/g, '').trim();
      } else {
        const urlParts = cleanFont.split('/');
        const fileName = urlParts[urlParts.length - 1].split('?')[0].split('#')[0];
        if (fileName) {
          extractedName = fileName.replace(/\.(otf|ttf|woff2?|css)$/i, '').replace(/['"]/g, '').trim();
        }
      }

      const fontStack = `"${extractedName}", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      applyFontToDoc(document, fontStack);
      if (targetDoc && targetDoc !== document) {
        applyFontToDoc(targetDoc, fontStack);
      }

      fetchAndInjectFontCSS(cleanFont, extractedName, targetDoc).catch(() => {});
      return;
    }

    // 2. System UI or sans-serif
    if (cleanFont.toLowerCase() === 'system-ui' || cleanFont.toLowerCase() === 'sans-serif') {
      const fontStack = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      applyFontToDoc(document, fontStack);
      if (targetDoc && targetDoc !== document) {
        applyFontToDoc(targetDoc, fontStack);
      }
      return;
    }

    // 3. Clean font family name
    const cleanName = cleanFont.replace(/^['"]|['"]$/g, '');
    const lowerName = cleanName.toLowerCase();

    // Fastpath for JetBrains Mono
    if (lowerName === 'jetbrains mono' || lowerName === 'jetbrainsmono nerd font') {
      const jbStack = "'JetBrains Mono', 'JetBrainsMono Nerd Font', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace";
      applyFontToDoc(document, jbStack);
      if (targetDoc && targetDoc !== document) {
        applyFontToDoc(targetDoc, jbStack);
      }
      return;
    }

    const formattedFont = cleanName
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const fontStack = `"${formattedFont}", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    applyFontToDoc(document, fontStack);
    if (targetDoc && targetDoc !== document) {
      applyFontToDoc(targetDoc, fontStack);
    }

    const builtInFonts = [
      'system-ui', 'sans-serif', 'serif', 'monospace',
      'arial', 'helvetica', 'times new roman', 'courier new', 'verdana',
      'georgia', 'tahoma', 'trebuchet ms', 'impact', 'consolas', 'menlo', 'monaco'
    ];

    if (!builtInFonts.includes(lowerName)) {
      const googleFontUrl = GOOGLE_FONT_PRESET_URLS[lowerName] ||
        `https://fonts.googleapis.com/css2?family=${encodeURIComponent(formattedFont).replace(/%20/g, '+')}:wght@400;600&display=swap`;
      fetchAndInjectFontCSS(googleFontUrl, formattedFont, targetDoc).catch(() => {});
    }
  } catch (_err) {}
}

(window as any).qunixLoadFont = loadFontCSPFriendly;

const isAuthRoute = (p: string) =>
  p.startsWith('/auth') ||
  p.startsWith('/login') ||
  p.startsWith('/register') ||
  p.startsWith('/forgot-password') ||
  p.startsWith('/reset-password');

const qunixIconCache: Record<string, string> = {};

async function getOrFetchSvg(iconStr: string): Promise<string | null> {
  if (qunixIconCache[iconStr]) return qunixIconCache[iconStr];

  const [pack, name] = iconStr.split(':');
  if (!pack || !name) return null;

  let apiPrefix = pack;
  let cleanName = name;
  if (pack === 'fa' || pack === 'fontawesome' || pack === 'fa6-solid') {
    apiPrefix = 'fa6-solid';
    cleanName = name.replace(/^fa-/, '');
  } else if (pack === 'heroicons' || pack === 'heroicons-outline' || pack === 'heroicons-solid') {
    apiPrefix = 'heroicons';
    cleanName = name.replace('-solid', '').replace('-outline', '');
  } else if (pack === 'lineicons') {
    cleanName = name.replace('-filled', '').replace('-solid', '').replace('-outline', '');
  } else if (pack === 'lucide') {
    cleanName = name.replace('-outline', '').replace('-solid', '').replace('-filled', '');
  } else if (pack === 'mdi') {
    cleanName = name.replace('-filled', '');
  }

  try {
    const res = await fetch(`https://api.iconify.design/${apiPrefix}.json?icons=${cleanName}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data) return null;

    let iconData = data.icons ? data.icons[cleanName] : null;
    if (!iconData && data.aliases && data.aliases[cleanName]) {
      const alias = data.aliases[cleanName];
      const parentName = typeof alias === 'string' ? alias : alias.parent;
      if (parentName && data.icons && data.icons[parentName]) {
        iconData = data.icons[parentName];
      }
    }

    if (iconData && iconData.body) {
      const w = iconData.width || data.width || 24;
      const h = iconData.height || data.height || 24;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1.1em" height="1.1em" viewBox="0 0 ${w} ${h}" fill="currentColor" style="display:inline-block;vertical-align:middle;">${iconData.body}</svg>`;
      qunixIconCache[iconStr] = svg;
      return svg;
    }
  } catch (_) { }

  return null;
}



async function checkIconExistence(pack: string, name: string): Promise<boolean> {
  const iconStr = `${pack}:${name}`;
  const svg = await getOrFetchSvg(iconStr);
  return svg !== null;
}

function QunixGlobalThemeEnhancer() {
  useEffect(() => {
    let timerId: any = null;

    const updateGlobalContainerIcons = () => {
      const s = (window as any).qunixThemeSettings;
      if (!s) return;

      const sidebarIcons = s.sidebar_icons || s.sidebarIcons || {};
      const globalPack = s.sidebar_global_pack || s.sidebarGlobalPack || 'default';
      const isDefaultPack = !globalPack || globalPack === 'default';
      const activePack = isDefaultPack ? 'default' : globalPack;

      const ADMIN_ROUTE_MAP: Record<string, string> = {
        '/admin/settings': 'admin_settings',
        '/admin/announcements': 'admin_announcements',
        '/admin/assets': 'admin_assets',
        '/admin/extensions': 'admin_extensions',
        '/admin/users': 'admin_users',
        '/admin/locations': 'admin_locations',
        '/admin/nodes': 'admin_nodes',
        '/admin/servers': 'admin_servers',
        '/admin/nests': 'admin_nests',
        '/admin/egg-configurations': 'admin_egg_configurations',
        '/admin/egg-repositories': 'admin_egg_repositories',
        '/admin/database-hosts': 'admin_database_hosts',
        '/admin/database-agent-hosts': 'admin_database_agent_hosts',
        '/admin/database-agent-templates': 'admin_database_agent_templates',
        '/admin/oauth-providers': 'admin_oauth_providers',
        '/admin/backup-configurations': 'admin_backup_configurations',
        '/admin/mounts': 'admin_mounts',
        '/admin/roles': 'admin_roles',
        '/admin/activity': 'admin_activity',
      };

      const ADMIN_DEFAULTS: Record<string, string> = {
        admin_settings: 'adjustments-horizontal',
        admin_announcements: 'megaphone',
        admin_assets: 'photo',
        admin_extensions: 'puzzle-piece',
        admin_users: 'users',
        admin_locations: 'map-pin',
        admin_nodes: 'server-stack',
        admin_servers: 'server',
        admin_nests: 'archive-box',
        admin_egg_configurations: 'cog-6-tooth',
        admin_egg_repositories: 'folder',
        admin_database_hosts: 'circle-stack',
        admin_database_agent_hosts: 'server-stack',
        admin_database_agent_templates: 'cube',
        admin_oauth_providers: 'key',
        admin_backup_configurations: 'archive-box',
        admin_mounts: 'folder-tree',
        admin_roles: 'document-text',
        admin_activity: 'clock',
      };

      // 1. Sub-Navigation Tabs & Links
      const allLinks = document.querySelectorAll('a.mantine-NavLink-root, .mantine-Tabs-list a, .mantine-AppShell-navbar a, .mantine-Tabs-tab');
      allLinks.forEach(async (aEl) => {
        const href = (aEl as HTMLAnchorElement).getAttribute('href');
        const text = aEl.textContent?.trim().toLowerCase() || '';

        let adminKey: string | null = null;
        if (href) {
          const cleanHref = href.split('?')[0].split('#')[0].replace(/\/$/, '');
          if (ADMIN_ROUTE_MAP[cleanHref]) adminKey = ADMIN_ROUTE_MAP[cleanHref];
        }

        if (!adminKey) {
          if (text.includes('extensions')) adminKey = 'admin_extensions';
          else if (text.includes('users')) adminKey = 'admin_users';
          else if (text.includes('locations')) adminKey = 'admin_locations';
          else if (text.includes('nodes')) adminKey = 'admin_nodes';
          else if (text.includes('servers')) adminKey = 'admin_servers';
          else if (text.includes('nests')) adminKey = 'admin_nests';
          else if (text.includes('egg configurations') || text === 'eggs') adminKey = 'admin_egg_configurations';
          else if (text.includes('egg repositories')) adminKey = 'admin_egg_repositories';
          else if (text.includes('database hosts')) adminKey = 'admin_database_hosts';
          else if (text.includes('database agent hosts')) adminKey = 'admin_database_agent_hosts';
          else if (text.includes('database agent templates')) adminKey = 'admin_database_agent_templates';
          else if (text.includes('oauth')) adminKey = 'admin_oauth_providers';
          else if (text.includes('backups')) adminKey = 'admin_backup_configurations';
          else if (text.includes('mounts')) adminKey = 'admin_mounts';
          else if (text.includes('roles')) adminKey = 'admin_roles';
          else if (text.includes('settings')) adminKey = 'admin_settings';
          else if (text.includes('announcements')) adminKey = 'admin_announcements';
          else if (text.includes('assets')) adminKey = 'admin_assets';
        }

        if (!adminKey) return;

        let iconStr = sidebarIcons[adminKey] || (href ? sidebarIcons[href] : null);
        if (!iconStr && !isDefaultPack) {
          const defaultName = ADMIN_DEFAULTS[adminKey] || 'server';
          const mappedIcon = getGlobalPackIcon(activePack, defaultName);
          iconStr = `${activePack}:${mappedIcon}`;
        }

        if (iconStr) {
          const iconWrapper = aEl.querySelector('.mantine-NavLink-leftSection, .mantine-Tabs-tabSection, .qunix-nav-icon');
          if (iconWrapper && iconWrapper.getAttribute('data-qunix-icon') !== iconStr) {
            iconWrapper.setAttribute('data-qunix-icon', iconStr);
            const svgMarkup = await getOrFetchSvg(iconStr);
            if (svgMarkup) {
              iconWrapper.innerHTML = svgMarkup;
            }
          }
        }
      });

      // 2. Container Cards, Overview Blocks & FontAwesome SVGs in Main Area
      if (isDefaultPack) return;

      const FA_ICON_TO_CANONICAL: Record<string, { key?: string; defaultName: string }> = {
        'stethoscope': { defaultName: 'adjustments-horizontal' },
        'microchip': { defaultName: 'cpu-chip' },
        'cpu': { defaultName: 'cpu-chip' },
        'memory': { defaultName: 'cpu-chip' },
        'server': { key: 'admin_servers', defaultName: 'server' },
        'computer': { key: 'admin_nodes', defaultName: 'server-stack' },
        'hard-drive': { defaultName: 'server-stack' },
        'hdd': { defaultName: 'server-stack' },
        'database': { key: 'admin_database_hosts', defaultName: 'circle-stack' },
        'coins': { key: 'admin_database_hosts', defaultName: 'circle-stack' },
        'users': { key: 'admin_users', defaultName: 'users' },
        'user': { key: 'admin_users', defaultName: 'user' },
        'user-group': { key: 'admin_users', defaultName: 'users' },
        'earth': { key: 'admin_locations', defaultName: 'globe-alt' },
        'earth-americas': { key: 'admin_locations', defaultName: 'globe-alt' },
        'globe': { key: 'admin_locations', defaultName: 'globe-alt' },
        'map-pin': { key: 'admin_locations', defaultName: 'map-pin' },
        'location-dot': { key: 'admin_locations', defaultName: 'map-pin' },
        'egg': { key: 'admin_egg_configurations', defaultName: 'archive-box' },
        'folder': { key: 'admin_egg_repositories', defaultName: 'folder' },
        'archive': { key: 'admin_backup_configurations', defaultName: 'archive-box' },
        'box-archive': { key: 'admin_backup_configurations', defaultName: 'archive-box' },
        'scroll': { key: 'admin_roles', defaultName: 'document-text' },
        'shield': { key: 'admin_roles', defaultName: 'shield-check' },
        'shield-halved': { key: 'admin_roles', defaultName: 'shield-check' },
        'key': { key: 'admin_oauth_providers', defaultName: 'key' },
        'code': { defaultName: 'code-bracket' },
        'code-bracket': { defaultName: 'code-bracket' },
        'link': { defaultName: 'link' },
        'clock': { key: 'admin_activity', defaultName: 'clock' },
        'terminal': { key: 'server_console', defaultName: 'terminal' },
        'sliders': { key: 'admin_settings', defaultName: 'adjustments-horizontal' },
        'gear': { key: 'admin_settings', defaultName: 'cog-6-tooth' },
        'gears': { key: 'admin_settings', defaultName: 'cog-6-tooth' },
        'cog': { key: 'admin_settings', defaultName: 'cog-6-tooth' },
        'bullhorn': { key: 'admin_announcements', defaultName: 'megaphone' },
        'image': { key: 'admin_assets', defaultName: 'photo' },
        'photo-film': { key: 'admin_assets', defaultName: 'photo' },
        'puzzle-piece': { key: 'admin_extensions', defaultName: 'puzzle-piece' },
        'network-wired': { key: 'admin_nodes', defaultName: 'server-stack' },
        'layer-group': { key: 'admin_nests', defaultName: 'archive-box' },
        'chart-bar': { defaultName: 'chart-bar' },
        'chart-line': { defaultName: 'chart-bar' },
        'chart-simple': { defaultName: 'chart-bar' },
        'list': { defaultName: 'list-bullet' },
        'table-cells': { defaultName: 'squares-2x2' },
        'ban': { defaultName: 'no-symbol' },
        'circle-question': { defaultName: 'question-mark-circle' },
        'circle-check': { defaultName: 'check-circle' },
        'check': { defaultName: 'check-circle' },
        'triangle-exclamation': { defaultName: 'exclamation-triangle' },
        'exclamation': { defaultName: 'exclamation-triangle' },
        'desktop': { defaultName: 'server-stack' },
        'cube': { key: 'admin_database_agent_templates', defaultName: 'cube' },
        'folder-tree': { key: 'admin_mounts', defaultName: 'folder-tree' },
        'crow': { defaultName: 'archive-box' },
        'upload': { defaultName: 'cloud-arrow-up' },
        'cloud-arrow-up': { defaultName: 'cloud-arrow-up' },
        'cloud-upload': { defaultName: 'cloud-arrow-up' },
        'download': { defaultName: 'cloud-arrow-down' },
        'cloud-arrow-down': { defaultName: 'cloud-arrow-down' },
        'cloud-download': { defaultName: 'cloud-arrow-down' },
        'copy': { defaultName: 'clipboard' },
        'clipboard': { defaultName: 'clipboard' },
        'trash': { defaultName: 'trash' },
        'trash-can': { defaultName: 'trash' },
        'rotate': { defaultName: 'arrow-path' },
        'rotate-right': { defaultName: 'arrow-path' },
        'arrows-rotate': { defaultName: 'arrow-path' },
        'refresh': { defaultName: 'arrow-path' },
        'play': { defaultName: 'play' },
        'stop': { defaultName: 'stop' },
        'skull': { defaultName: 'skull' },
        'xmark': { defaultName: 'x-mark' },
        'times': { defaultName: 'x-mark' },
        'plus': { defaultName: 'plus' },
        'minus': { defaultName: 'minus' },
        'pencil': { defaultName: 'pencil' },
        'edit': { defaultName: 'pencil' },
        'pen': { defaultName: 'pencil' },
        'eye': { defaultName: 'eye' },
        'eye-slash': { defaultName: 'eye' },
        'filter': { defaultName: 'funnel' },
        'search': { defaultName: 'magnifying-glass' },
        'magnifying-glass': { defaultName: 'magnifying-glass' },
        'arrow-left': { defaultName: 'arrow-left' },
        'chevron-left': { defaultName: 'arrow-left' },
        'chevron-right': { defaultName: 'chevron-right' },
        'chevron-down': { defaultName: 'chevron-down' },
        'chevron-up': { defaultName: 'chevron-up' },
        'lock': { defaultName: 'lock-closed' },
        'unlock': { defaultName: 'lock-closed' },
        'file': { defaultName: 'document-text' },
        'file-lines': { defaultName: 'document-text' },
        'file-code': { defaultName: 'document-text' },
        'wrench': { defaultName: 'wrench' },
        'power-off': { defaultName: 'power' },
      };

      const containerSvgs = document.querySelectorAll(
        'svg[data-icon], svg.svg-inline--fa, fontawesome-icon svg, .mantine-Paper-root svg, .mantine-Card-root svg, .mantine-ThemeIcon-root svg, header svg, main svg, section svg'
      );

      containerSvgs.forEach(async (svgEl) => {
        if (
          svgEl.closest('.qunix-replaced-container-icon') ||
          svgEl.closest('.qunix-nav-wrapper') ||
          svgEl.closest('#qunix-settings-page') ||
          svgEl.closest('.qunix-bell-slot') ||
          svgEl.closest('.qunix-bell-btn') ||
          svgEl.closest('[data-no-qunix-replace]') ||
          svgEl.hasAttribute('data-no-qunix-replace')
        ) return;

        const dataIcon = svgEl.getAttribute('data-icon');
        let faName = dataIcon ? dataIcon.trim().toLowerCase() : '';

        if (!faName) {
          const cls = svgEl.getAttribute('class') || '';
          const match = cls.match(/fa-([a-z0-9-]+)/);
          if (match && match[1]) faName = match[1];
        }

        if (!faName) return;

        const canonical = FA_ICON_TO_CANONICAL[faName];
        if (!canonical) return;

        const key = canonical.key;
        const defaultName = canonical.defaultName;

        let iconStr = key ? sidebarIcons[key] : null;
        if (!iconStr || iconStr.startsWith('default:')) {
          const mappedIcon = getGlobalPackIcon(activePack, defaultName);
          iconStr = `${activePack}:${mappedIcon}`;
        }

        if (iconStr && svgEl.getAttribute('data-qunix-icon') !== iconStr) {
          svgEl.setAttribute('data-qunix-icon', iconStr);
          const svgMarkup = await getOrFetchSvg(iconStr);
          if (svgMarkup) {
            const wrapper = document.createElement('span');
            wrapper.className = 'qunix-replaced-container-icon';
            wrapper.setAttribute('data-qunix-icon', iconStr);
            wrapper.setAttribute('data-fa-name', faName);
            wrapper.style.display = 'inline-flex';
            wrapper.style.alignItems = 'center';
            wrapper.style.justifyContent = 'center';
            wrapper.style.verticalAlign = 'middle';
            wrapper.style.color = 'currentColor';
            wrapper.innerHTML = svgMarkup;
            svgEl.replaceWith(wrapper);
          }
        }
      });

      // Update existing replaced container icons if theme settings / icon pack change
      const replacedSvgs = document.querySelectorAll('.qunix-replaced-container-icon');
      replacedSvgs.forEach(async (repEl) => {
        const faName = repEl.getAttribute('data-fa-name');
        if (!faName) return;

        const canonical = FA_ICON_TO_CANONICAL[faName];
        if (!canonical) return;

        const key = canonical.key;
        const defaultName = canonical.defaultName;

        let iconStr = key ? sidebarIcons[key] : null;
        if (!iconStr || iconStr.startsWith('default:')) {
          const mappedIcon = getGlobalPackIcon(activePack, defaultName);
          iconStr = `${activePack}:${mappedIcon}`;
        }

        if (iconStr && repEl.getAttribute('data-qunix-icon') !== iconStr) {
          repEl.setAttribute('data-qunix-icon', iconStr);
          const svgMarkup = await getOrFetchSvg(iconStr);
          if (svgMarkup) {
            repEl.innerHTML = svgMarkup;
          }
        }
      });
    };

    const debouncedUpdate = () => {
      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(updateGlobalContainerIcons, 300);
    };

    const deferTask = (cb: () => void, timeout = 2000) => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        (window as any).requestIdleCallback(cb, { timeout });
      } else {
        setTimeout(cb, 100);
      }
    };

    deferTask(updateGlobalContainerIcons, 1000);

    const observer = new MutationObserver(debouncedUpdate);
    const mainEl = document.querySelector('main') || document.getElementById('root');
    if (mainEl) {
      observer.observe(mainEl, { childList: true, subtree: true });
    }

    // Mantine
    const cleanOverlays = () => {
      const overlays = document.querySelectorAll(
        '.mantine-Overlay-root, .mantine-Modal-overlay, .mantine-Drawer-overlay, [class*="Overlay"], [class*="overlay"]'
      );
      overlays.forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.style.backdropFilter || (htmlEl.style as any).webkitBackdropFilter) {
          htmlEl.style.backdropFilter = 'none';
          (htmlEl.style as any).webkitBackdropFilter = 'none';
        }
      });
    };

    let overlayTimerId: any = null;
    const debouncedCleanOverlays = () => {
      if (overlayTimerId) clearTimeout(overlayTimerId);
      overlayTimerId = setTimeout(cleanOverlays, 300);
    };

    cleanOverlays();
    const overlayCleaner = new MutationObserver(debouncedCleanOverlays);
    overlayCleaner.observe(document.body, { childList: true });

    return () => {
      if (timerId) clearTimeout(timerId);
      if (overlayTimerId) clearTimeout(overlayTimerId);
      observer.disconnect();
      overlayCleaner.disconnect();
      window.removeEventListener('qunix-settings-loaded', updateGlobalContainerIcons);
    };
  }, []);

  return null;
}

const AuthLanguageSelector: React.FC = () => {
  const { language, setLanguage } = useTranslations();
  const languages = useGlobalStore((state) => state.languages) || [];
  const [slot, setSlot] = useState<HTMLElement | null>(() => document.getElementById('qunix-login-lang-portal-slot'));

  useEffect(() => {
    const checkSlot = () => {
      const el = document.getElementById('qunix-login-lang-portal-slot');
      if (el && el !== slot) setSlot(el);
    };
    checkSlot();
    const interval = setInterval(checkSlot, 100);
    return () => clearInterval(interval);
  }, [slot]);

  const rawLangs = languages.length > 0 ? languages : ['en', 'vi', 'zh-cn', 'zh-tw', 'ja', 'ko', 'ru', 'de', 'fr', 'es', 'it', 'pt-br', 'tr', 'pl', 'cs', 'ro', 'sk', 'sv', 'nl', 'no', 'ar', 'he'];

  const languageOptions = rawLangs.map((lang) => {
    let label = lang;
    try {
      const displayName = new Intl.DisplayNames([lang], { type: 'language' }).of(lang);
      if (displayName) {
        label = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      }
    } catch {
      label = lang.toUpperCase();
    }
    return {
      value: lang,
      label,
    };
  });

  const globeIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.85 }}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );

  const selectNode = (
    <div className="qunix-login-lang-select-wrapper">
      <Select
        size="xs"
        leftSection={globeIcon}
        data={languageOptions}
        value={language}
        onChange={(val) => {
          if (val) {
            setLanguage(val);
            localStorage.setItem('last_language', val);
          }
        }}
        allowDeselect={false}
        comboboxProps={{ withinPortal: true, zIndex: 10000 }}
        classNames={{
          input: 'qunix-auth-lang-input',
        }}
      />
    </div>
  );

  if (!slot) return null;
  return createPortal(selectNode, slot);
};

const QunixThemeLoader: React.FC = () => {
  const computedColorScheme = useComputedColorScheme('dark');
  const [settings, setSettings] = useState<any>(() => (window as any).qunixThemeSettings);
  const queryClient = useQueryClient();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const getActivePrivacy = () => {
      const userVal = localStorage.getItem('qunix_user_privacy_mode');
      if (userVal !== null) return userVal === 'true';
      return document.documentElement.getAttribute('data-privacy-blur') === 'true';
    };

    const scanAndBlur = () => {
      if (!getActivePrivacy()) return;

      // 1. Server allocations on / page and other pages
      const allocBtns = document.querySelectorAll(
        '.qunix-grid-card-wrapper div[class*="@md:justify-end"] button, ' +
        '.qunix-server-card div[class*="@md:justify-end"] button, ' +
        'div[class*="@md:justify-end"] > button, ' +
        'div[class*="@md:justify-end"] > div.flex-row > button'
      );
      allocBtns.forEach((btn) => {
        if (!btn.classList.contains('qunix-privacy-blur')) {
          btn.classList.add('qunix-privacy-blur');
          btn.setAttribute('data-privacy-sensitive', 'true');
        }
      });

      // 2. Email inputs
      const emailInputs = document.querySelectorAll(
        'input[autocomplete="email"], input[name="email"], input[type="email"]'
      );
      emailInputs.forEach((input) => {
        if (!input.classList.contains('qunix-privacy-blur')) {
          input.classList.add('qunix-privacy-blur');
          input.setAttribute('data-privacy-sensitive', 'true');
        }
      });

      // 3. User email in text if user is logged in
      const emailToBlur = user?.email;
      if (emailToBlur && emailToBlur.length > 3 && emailToBlur.includes('@')) {
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node) => {
              if (node.nodeValue && node.nodeValue.includes(emailToBlur)) {
                return NodeFilter.FILTER_ACCEPT;
              }
              return NodeFilter.FILTER_SKIP;
            },
          }
        );

        let textNode;
        while ((textNode = walker.nextNode())) {
          const parent = textNode.parentElement;
          if (parent && !parent.classList.contains('qunix-privacy-blur') && parent.tagName !== 'SCRIPT' && parent.tagName !== 'STYLE') {
            parent.classList.add('qunix-privacy-blur');
            parent.setAttribute('data-privacy-sensitive', 'true');
          }
        }
      }

      // 4. Sensitive IP allocations or redacted elements across tables and cards
      const sensitiveElements = document.querySelectorAll(
        'table td code, .server-ip, [data-ip], [data-privacy-sensitive="true"]'
      );
      sensitiveElements.forEach((el) => {
        if (!el.classList.contains('qunix-privacy-blur')) {
          el.classList.add('qunix-privacy-blur');
          el.setAttribute('data-privacy-sensitive', 'true');
        }
      });
    };

    scanAndBlur();

    const handleSync = () => {
      scanAndBlur();
    };
    window.addEventListener('qunix-privacy-mode-changed', handleSync);

    const observer = new MutationObserver(() => {
      scanAndBlur();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      window.removeEventListener('qunix-privacy-mode-changed', handleSync);
      observer.disconnect();
    };
  }, [user?.email, location.pathname]);

  useEffect(() => {
    const handleLoaded = (e: Event) => {
      setSettings((e as CustomEvent).detail);
    };
    window.addEventListener('qunix-settings-loaded', handleLoaded);

    if (typeof window !== 'undefined' && (window as any).dismissQunixPreloader) {
      (window as any).dismissQunixPreloader(true);
    }

    const handleWheel = (e: WheelEvent) => {
      const container = document.querySelector(
        'html[data-dashboard-layout="horizontal"] #sidebar-content > div:nth-child(2), ' +
        'html[data-dock-position="header"] #sidebar-content > div:nth-child(2)'
      );
      if (container) {
        let target = e.target as HTMLElement | null;
        let isInside = false;
        while (target) {
          if (target === container) {
            isInside = true;
            break;
          }
          target = target.parentElement;
        }
        if (isInside) {
          e.preventDefault();
          container.scrollLeft += e.deltaY;
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('qunix-settings-loaded', handleLoaded);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  useEffect(() => {
    const handleRedirect = () => {
      const p = window.location.pathname.replace(/\/$/, '');
      if (p === '/admin/extensions/dev.qunix.theme' || p.startsWith('/admin/extensions/dev.qunix.theme/')) {
        window.location.replace('/admin/qunix-settings');
      }
    };
    handleRedirect();
    window.addEventListener('popstate', handleRedirect);
    return () => window.removeEventListener('popstate', handleRedirect);
  }, []);

  //  root element
  useEffect(() => {
    if (!settings) return;
    try {
      localStorage.setItem('qunix_theme_settings', JSON.stringify(settings));
    } catch (_) { }

    const root = document.documentElement;
    const sidebarStyle = settings.sidebar_style || settings.sidebarStyle || 'full';
    const isMinimized = sidebarStyle === 'icons';
    const hideSidebarPower = settings.hide_sidebar_power_actions !== undefined
      ? settings.hide_sidebar_power_actions
      : (settings.hideSidebarPowerActions !== undefined ? settings.hideSidebarPowerActions : false);
    const pageTitleIcon = settings.page_title_icon !== undefined
      ? settings.page_title_icon
      : (settings.pageTitleIcon !== undefined ? settings.pageTitleIcon : true);

    root.setAttribute('data-sidebar-style', sidebarStyle);
    root.setAttribute(
      'data-hide-sidebar-power',
      hideSidebarPower ? 'true' : 'false',
    );
    root.setAttribute(
      'data-page-title-icon',
      pageTitleIcon ? 'true' : 'false',
    );
    root.setAttribute(
      'data-sidebar-hover-style',
      settings.sidebar_hover_style || settings.sidebarHoverStyle || 'style-1',
    );
    root.setAttribute(
      'data-dashboard-layout',
      settings.dashboard_layout || settings.dashboardLayout || 'default',
    );
    root.setAttribute(
      'data-card-animation',
      settings.card_animation || settings.cardAnimation || 'slide-up',
    );
    root.setAttribute(
      'data-listing-animation',
      settings.listing_animation || settings.listingAnimation || 'inherit',
    );
    root.setAttribute(
      'data-dock-position',
      'sidebar',
    );
    const userPrivacy = localStorage.getItem('qunix_user_privacy_mode');
    const isPrivacy = userPrivacy !== null ? userPrivacy === 'true' : false;
    root.setAttribute('data-privacy-blur', isPrivacy ? 'true' : 'false');

    const sidebarWidth = isMinimized ? 72 : (settings.sidebar_width !== undefined ? settings.sidebar_width : 256);
    root.style.setProperty('--ds-sidebar-width', `${sidebarWidth}px`);
    const isDark = computedColorScheme === 'dark';

    const getThemeVal = (darkVal: string, lightVal: string) => {
      return isDark ? darkVal : lightVal;
    };

    const getThemeValOpt = (darkVal: any, lightVal: any) => {
      return isDark ? darkVal : lightVal;
    };

    const backgroundColor = getThemeVal(
      settings.background_color || settings.backgroundColor,
      settings.light_background_color || settings.lightBackgroundColor || '#f8fafc',
    );
    const textColor = getThemeVal(
      settings.text_color || settings.textColor,
      settings.light_text_color || settings.lightTextColor || '#0f172a',
    );
    const focusColor = getThemeVal(
      settings.focus_color || settings.focusColor,
      settings.light_focus_color || settings.lightFocusColor || '#3b82f6',
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
      settings.light_border_color || settings.lightBorderColor || 'rgba(0, 0, 0, 0.08)',
    );
    const navbarColor = getThemeVal(
      settings.navbar_color || settings.navbarColor,
      settings.light_navbar_color || settings.lightNavbarColor || '#ffffff',
    );
    const terminalColor = getThemeVal(
      settings.terminal_color || settings.terminalColor,
      settings.light_terminal_color || settings.lightTerminalColor || '#ffffff',
    );
    const terminalTextColor = getThemeVal(
      settings.terminal_text_color || settings.terminalTextColor,
      settings.light_terminal_text_color || settings.lightTerminalTextColor || '#0f172a',
    );
    const inputColor = getThemeVal(
      settings.input_color || settings.inputColor,
      settings.light_input_color || settings.lightInputColor || '#f1f5f9',
    );
    const editorColor = getThemeVal(
      settings.editor_color || settings.editorColor,
      settings.light_editor_color || settings.lightEditorColor || '#ffffff',
    );
    const editorTextColor = getThemeVal(
      settings.editor_text_color || settings.editorTextColor,
      settings.light_editor_text_color || settings.lightEditorTextColor || '#0f172a',
    );
    const listingColor = getThemeVal(
      settings.listing_color || settings.listingColor,
      settings.light_listing_color || settings.lightListingColor || '#ffffff',
    );
    const buttonColor = getThemeVal(
      settings.button_color || settings.buttonColor,
      settings.light_button_color || settings.lightButtonColor || '#2563eb',
    );
    const serverActionBg = getThemeVal(
      settings.server_action_bg ||
      settings.serverActionBg ||
      settings.server_action_color ||
      settings.serverActionColor,
      settings.light_server_action_bg || settings.lightServerActionBg || '#ffffff',
    );
    const powerStartBg = getThemeVal(
      settings.power_start_bg || settings.powerStartBg,
      settings.light_power_start_bg || settings.lightPowerStartBg || '#40c057',
    );
    const powerRestartBg = getThemeVal(
      settings.power_restart_bg || settings.powerRestartBg,
      settings.light_power_restart_bg || settings.lightPowerRestartBg || '#868e96',
    );
    const powerStopBg = getThemeVal(
      settings.power_stop_bg || settings.powerStopBg,
      settings.light_power_stop_bg || settings.lightPowerStopBg || '#fa5252',
    );
    const sidebarActiveColor = getThemeVal(
      settings.sidebar_active_color || settings.sidebarActiveColor,
      settings.light_sidebar_active_color || settings.lightSidebarActiveColor || '#2563eb',
    );
    const sidebarActiveBg = getThemeVal(
      settings.sidebar_active_bg || settings.sidebarActiveBg,
      settings.light_sidebar_active_bg || settings.lightSidebarActiveBg || 'rgba(37, 99, 235, 0.08)',
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
    const announcementInfoBg = settings.toast_info_bg || settings.toastInfoBg || settings.announcement_info_bg || settings.announcementInfoBg || 'rgba(59, 130, 246, 0.15)';
    const announcementInfoBorder = settings.toast_info_color || settings.toastInfoColor || settings.announcement_info_border || settings.announcementBorderColor || '#3b82f6';
    const announcementErrorBg = settings.toast_error_bg || settings.toastErrorBg || settings.announcement_error_bg || settings.announcementErrorBg || 'rgba(239, 68, 68, 0.15)';
    const announcementErrorBorder = settings.toast_error_color || settings.toastErrorColor || settings.announcement_error_border || settings.announcementErrorBorder || '#ef4444';
    const announcementWarningBg = settings.toast_warning_bg || settings.toastWarningBg || settings.announcement_warning_bg || settings.announcementWarningBg || 'rgba(245, 158, 11, 0.15)';
    const announcementWarningBorder = settings.toast_warning_color || settings.toastWarningColor || settings.announcement_warning_border || settings.announcementWarningBorder || '#f59e0b';
    const announcementSuccessBg = settings.toast_success_bg || settings.toastSuccessBg || settings.announcement_success_bg || settings.announcementSuccessBg || 'rgba(16, 185, 129, 0.15)';
    const announcementSuccessBorder = settings.toast_success_color || settings.toastSuccessColor || settings.announcement_success_border || settings.announcementSuccessBorder || '#10b981';
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
    const consoleBannerRadius =
      settings.console_banner_radius !== undefined
        ? settings.console_banner_radius
        : settings.consoleBannerRadius !== undefined
          ? settings.consoleBannerRadius
          : 16;
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
    const configuredSidebarWidth = settings.sidebar_width !== undefined ? settings.sidebar_width : settings.sidebarWidth;
    const sidebarRadius = settings.sidebar_radius !== undefined ? settings.sidebar_radius : settings.sidebarRadius;
    const sidebarActiveRadius =
      settings.sidebar_active_radius !== undefined ? settings.sidebar_active_radius : settings.sidebarActiveRadius;

    const sidebarGrowBg = getThemeVal(
      settings.sidebar_grow_bg || settings.sidebarGrowBg || 'rgba(108, 92, 231, 0.18)',
      settings.light_sidebar_grow_bg || settings.lightSidebarGrowBg || 'rgba(108, 92, 231, 0.12)',
    );
    const sidebarGrowTextColor = getThemeVal(
      settings.sidebar_grow_text_color || settings.sidebarGrowTextColor || '#ffffff',
      settings.light_sidebar_grow_text_color || settings.lightSidebarGrowTextColor || '#1e1631',
    );
    const sidebarGrowBorderColor = getThemeVal(
      settings.sidebar_grow_border_color || settings.sidebarGrowBorderColor || '#6c5ce7',
      settings.light_sidebar_grow_border_color || settings.lightSidebarGrowBorderColor || '#6c5ce7',
    );

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

    const modalBg = getThemeVal(
      settings.modal_bg || settings.modalBg || dark7Color,
      settings.light_modal_bg || settings.lightModalBg || '#ffffff',
    );
    const modalCardBg = getThemeVal(
      settings.modal_card_bg || settings.modalCardBg || dark6Color,
      settings.light_modal_card_bg || settings.lightModalCardBg || '#f8f9fa',
    );
    const miniCardBgColor = getThemeVal(
      settings.mini_card_bg_color || settings.miniCardBgColor || '#121212',
      settings.light_mini_card_bg_color || settings.lightMiniCardBgColor || '#f4f4f6',
    );
    const quickActionsBg = getThemeVal(
      settings.quick_actions_bg || settings.quickActionsBg || inputColor,
      settings.light_quick_actions_bg || settings.lightQuickActionsBg || '#f1f3f5',
    );
    const quickActionsText = getThemeVal(
      settings.quick_actions_text_color || settings.quickActionsTextColor || textColor,
      settings.light_quick_actions_text_color || settings.lightQuickActionsTextColor || '#1a1b26',
    );
    const quickActionsBorder = getThemeVal(
      settings.quick_actions_border_color || settings.quickActionsBorderColor || borderColor,
      settings.light_quick_actions_border_color || settings.lightQuickActionsBorderColor || 'rgba(0, 0, 0, 0.12)',
    );
    const popupWindowBorderColor = getThemeVal(
      settings.popup_window_border_color || settings.popupWindowBorderColor || 'rgba(255, 255, 255, 0.12)',
      settings.light_popup_window_border_color || settings.lightPopupWindowBorderColor || 'rgba(0, 0, 0, 0.12)',
    );

    root.style.setProperty('--ds-background', backgroundColor);
    root.style.setProperty('--mantine-color-body', backgroundColor);
    root.style.setProperty('--mantine-color-default-border', borderColor);
    root.style.setProperty('--mantine-color-default', cardColor);
    root.style.setProperty('--mantine-color-default-color', textColor);
    root.style.setProperty('--mantine-color-text', textColor);
    root.style.setProperty('--mantine-color-dark-7', dark7Color);
    root.style.setProperty('--mantine-color-dark-6', dark6Color);
    root.style.setProperty('--ds-popup-window-border-color', popupWindowBorderColor);
    root.style.setProperty('--ds-gray-900', textColor);
    root.style.setProperty('--ds-focus-color', focusColor);
    root.style.setProperty('--ds-dark-7', dark7Color);
    root.style.setProperty('--ds-dark-6', dark6Color);
    root.style.setProperty('--ds-modal-bg', modalBg);
    root.style.setProperty('--ds-modal-card-bg', modalCardBg);
    root.style.setProperty('--ds-mini-card-bg', miniCardBgColor);
    root.style.setProperty('--ds-quick-actions-bg', quickActionsBg);
    root.style.setProperty('--ds-quick-actions-text', quickActionsText);
    root.style.setProperty('--ds-quick-actions-border', quickActionsBorder);
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
    root.style.setProperty('--ds-announcement-info-bg', announcementInfoBg);
    root.style.setProperty('--ds-announcement-info-border', announcementInfoBorder);
    root.style.setProperty('--ds-announcement-error-bg', announcementErrorBg);
    root.style.setProperty('--ds-announcement-error-border', announcementErrorBorder);
    root.style.setProperty('--ds-announcement-warning-bg', announcementWarningBg);
    root.style.setProperty('--ds-announcement-warning-border', announcementWarningBorder);
    root.style.setProperty('--ds-announcement-success-bg', announcementSuccessBg);
    root.style.setProperty('--ds-announcement-success-border', announcementSuccessBorder);
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
    root.style.setProperty('--ds-sidebar-grow-bg', sidebarGrowBg);
    root.style.setProperty('--ds-sidebar-grow-text-color', sidebarGrowTextColor);
    root.style.setProperty('--ds-sidebar-grow-border-color', sidebarGrowBorderColor);
    root.style.setProperty('--ds-text-color', textColor);
    root.style.setProperty('--ds-card-bg-opaque', isDark ? '#0b0c16' : '#ffffff');
    root.style.setProperty('--ds-nav-hover-bg', isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)');
    root.style.setProperty('--ds-nav-hover-color', isDark ? '#ffffff' : '#0f172a');
    root.style.setProperty('--ds-dropdown-bg', isDark ? '#13141f' : '#ffffff');
    root.style.setProperty('--ds-dropdown-shadow', isDark ? '0 16px 36px rgba(0, 0, 0, 0.7)' : '0 16px 36px rgba(0, 0, 0, 0.12)');
    root.style.setProperty('--ds-toast-info-bg', announcementInfoBg);
    root.style.setProperty('--ds-toast-info-color', announcementInfoBorder);
    root.style.setProperty('--ds-toast-error-bg', announcementErrorBg);
    root.style.setProperty('--ds-toast-error-color', announcementErrorBorder);
    root.style.setProperty('--ds-toast-warning-bg', announcementWarningBg);
    root.style.setProperty('--ds-toast-warning-color', announcementWarningBorder);
    root.style.setProperty('--ds-toast-success-bg', announcementSuccessBg);
    root.style.setProperty('--ds-toast-success-color', announcementSuccessBorder);

    if (borderRadius !== undefined) root.style.setProperty('--ds-border-radius', `${borderRadius}px`);
    if (buttonRadius !== undefined) root.style.setProperty('--ds-button-radius', `${buttonRadius}px`);
    if (inputRadius !== undefined) root.style.setProperty('--ds-input-radius', `${inputRadius}px`);
    if (cardRadius !== undefined) root.style.setProperty('--ds-card-radius', `${cardRadius}px`);
    if (consoleBannerRadius !== undefined) root.style.setProperty('--ds-console-banner-radius', `${consoleBannerRadius}px`);
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

    const blurPx = wallpaperBlur !== undefined ? Number(wallpaperBlur) : 0;
    const brightness = wallpaperBrightness !== undefined ? Number(wallpaperBrightness) : 1;

    let wallpaperEl = document.getElementById('qunix-wallpaper-img') as HTMLImageElement | null;

    const isMobileViewport = window.innerWidth <= 768;

    if (backgroundImage) {
      try {
        if (backgroundImage.startsWith('http://') || backgroundImage.startsWith('https://')) {
          const bgOrigin = new URL(backgroundImage).origin;
          if (bgOrigin && bgOrigin !== window.location.origin && !document.getElementById('qunix-bg-preconnect')) {
            const preconnectLink = document.createElement('link');
            preconnectLink.id = 'qunix-bg-preconnect';
            preconnectLink.rel = 'preconnect';
            preconnectLink.href = bgOrigin;
            preconnectLink.crossOrigin = 'anonymous';
            document.head.appendChild(preconnectLink);
          }
        }
      } catch { }

      if (!wallpaperEl) {
        wallpaperEl = document.createElement('img');
        wallpaperEl.id = 'qunix-wallpaper-img';
        wallpaperEl.alt = '';
        wallpaperEl.setAttribute('aria-hidden', 'true');
        wallpaperEl.decoding = 'async';
        wallpaperEl.loading = 'lazy';
        document.documentElement.appendChild(wallpaperEl);
      }
      if (wallpaperEl.src !== backgroundImage) {
        wallpaperEl.src = backgroundImage;
      }
      wallpaperEl.style.filter = blurPx > 0 ? `blur(${blurPx}px)` : '';
      wallpaperEl.style.opacity = String(brightness);
      root.classList.add('has-bg-image');
      document.body.classList.add('has-bg-image');
    } else {
      if (wallpaperEl) wallpaperEl.remove();
      root.classList.remove('has-bg-image');
      document.body.classList.remove('has-bg-image');
    }

    const chromeToolbarColor = isDark
      ? (settings.chrome_toolbar_color || settings.chromeToolbarColor || navbarColor || backgroundColor)
      : (settings.light_chrome_toolbar_color || settings.lightChromeToolbarColor || settings.light_navbar_color || settings.lightNavbarColor || '#ffffff');

    let themeColorMeta = document.getElementById('meta-theme-color') as HTMLMetaElement | null;
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.id = 'meta-theme-color';
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }
    if (chromeToolbarColor) {
      themeColorMeta.setAttribute('content', chromeToolbarColor);
    }

    if (shadowOpacity !== undefined) {
      root.style.setProperty(
        '--ds-shadow-border',
        `0px 0px 0px 1px ${isDark ? `rgba(255, 255, 255, ${shadowOpacity})` : `rgba(0, 0, 0, ${shadowOpacity})`}`,
      );
    }

    //   egg banners
    const eggBanners = settings.egg_banners || settings.eggBanners || {};
    for (const [eggUuid, bannerUrl] of Object.entries(eggBanners)) {
      if (bannerUrl) {
        root.style.setProperty(`--ds-egg-banner-${eggUuid}`, `url("${bannerUrl}")`);
      } else {
        root.style.removeProperty(`--ds-egg-banner-${eggUuid}`);
      }
    }
    for (let i = 0; i < root.style.length; i++) {
      const propName = root.style[i];
      if (propName.startsWith('--ds-egg-banner-')) {
        const uuid = propName.replace('--ds-egg-banner-', '');
        if (!eggBanners[uuid]) {
          root.style.removeProperty(propName);
        }
      }
    }

    const activeFont = settings.font_family || settings.fontFamily || 'JetBrains Mono';
    loadFontCSPFriendly(activeFont);
    const activeTermFont = settings.terminal_font_family || settings.terminalFontFamily;
    if (activeTermFont) {
      const termFontMap: Record<string, string> = {
        'Consolas': "'Consolas', monospace",
        'Menlo': "'Menlo', monospace",
        'Monaco': "'Monaco', monospace",
        'Courier New': "'Courier New', monospace",
        'FiraCode Nerd Font': "'FiraCode Nerd Font', 'Fira Code', monospace",
        'JetBrainsMono Nerd Font': "'JetBrainsMono Nerd Font', 'JetBrains Mono', monospace",
        'JetBrains Mono': "'JetBrainsMono Nerd Font', 'JetBrains Mono', monospace",
        'Meslo LG M Nerd Font': "'MesloLGM Nerd Font', 'Meslo LG M', monospace",
        'UbuntuMono Nerd Font': "'UbuntuMono Nerd Font', 'Ubuntu Mono', monospace",
      };
      const resolvedTerm = termFontMap[activeTermFont] || (activeTermFont.includes('monospace') ? activeTermFont : `'${activeTermFont}', monospace`);
      root.style.setProperty('--ds-terminal-font-family', resolvedTerm);
      if ((window as any).activeXterm && (window as any).activeXterm.options) {
        (window as any).activeXterm.options.fontFamily = resolvedTerm;
        try { (window as any).activeXterm.refresh(0, (window as any).activeXterm.rows - 1); } catch (_) { }
      }
    }

    const hoverAnimation = settings.card_hover_animation || settings.cardHoverAnimation || 'shift';
    root.classList.remove('qunix-hover-shift', 'qunix-hover-scale', 'qunix-hover-glow', 'qunix-hover-none');
    root.classList.add(`qunix-hover-${hoverAnimation}`);

    // Meta/Embed tags
    const embedSiteName = settings.embed_site_name || settings.embedSiteName;
    const embedColor = settings.embed_color || settings.embedColor || settings.button_color;
    const embedTitle = settings.embed_title || settings.embedTitle;
    const embedDesc = settings.embed_description || settings.embedDescription;
    const embedImg = settings.embed_image || settings.embedImage;

    const ensureMetaTag = (attrName: 'name' | 'property', attrVal: string, contentVal: string, elementId?: string) => {
      if (!contentVal) return;
      const selector = elementId ? `#${elementId}` : `meta[${attrName}="${attrVal}"]`;
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrVal);
        if (elementId) el.id = elementId;
        document.head.appendChild(el);
      }
      el.setAttribute('content', contentVal);
    };

    if (embedColor) ensureMetaTag('name', 'theme-color', embedColor, 'meta-theme-color');
    if (embedTitle) {
      document.title = embedTitle;
      ensureMetaTag('name', 'title', embedTitle, 'meta-title');
      ensureMetaTag('property', 'og:title', embedTitle, 'meta-og-title');
      ensureMetaTag('property', 'twitter:title', embedTitle, 'meta-tw-title');
    }
    if (embedDesc) {
      ensureMetaTag('name', 'description', embedDesc, 'meta-description');
      ensureMetaTag('property', 'og:description', embedDesc, 'meta-og-desc');
      ensureMetaTag('property', 'twitter:description', embedDesc, 'meta-tw-desc');
    }
    if (embedImg) {
      ensureMetaTag('property', 'og:image', embedImg, 'meta-og-image');
      ensureMetaTag('property', 'twitter:image', embedImg, 'meta-tw-image');
    }
    if (embedSiteName) {
      ensureMetaTag('property', 'og:site_name', embedSiteName, 'meta-og-sitename');
    }
    ensureMetaTag('property', 'og:type', 'website');
    ensureMetaTag('property', 'twitter:card', 'summary_large_image');
  }, [computedColorScheme, settings]);

  // Apply egg banners to server 
  useEffect(() => {
    if (!settings) return;

    const applyBanners = () => {
      const isMobileViewport = window.innerWidth <= 768;
      const serverLinks = document.querySelectorAll('a[href^="/server/"]');
      const eggBanners = settings.egg_banners || settings.eggBanners || {};

      // Get all cached query data for servers from React Query cache
      const cachedServers: any[] = [];
      try {
        const queries = queryClient.getQueriesData<any>({ queryKey: ['user', 'servers'] });
        for (const [_, data] of queries) {
          if (!data) continue;
          if (Array.isArray(data)) {
            cachedServers.push(...data);
          } else if (Array.isArray(data.data)) {
            cachedServers.push(...data.data);
          } else if (Array.isArray(data.pages)) {
            for (const page of data.pages) {
              if (Array.isArray(page?.data)) {
                cachedServers.push(...page.data);
              } else if (Array.isArray(page)) {
                cachedServers.push(...page);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to read servers from query cache:', err);
      }

      serverLinks.forEach((aEl) => {
        if (aEl.closest('.qunix-grid-card-wrapper')) {
          // QunixServerItemWrapper manages grid view cards banner and hover effects directly
          return;
        }
        const href = aEl.getAttribute('href') || '';
        const match = href.match(/\/server\/([^\/]+)/i);
        const uuidShort = match ? match[1] : '';
        if (!uuidShort) return;

        const server =
          (window as any).qunixRenderedServersMap?.get(uuidShort.toLowerCase()) ||
          cachedServers.find(
            (s: any) =>
              s.uuidShort?.toLowerCase() === uuidShort.toLowerCase() ||
              s.uuid?.toLowerCase() === uuidShort.toLowerCase()
          );
        if (server && server.egg) {
          const customBannerUrl =
            eggBanners[server.egg.uuid] ||
            (server.egg.uuid && eggBanners[server.egg.uuid.toLowerCase()]) ||
            eggBanners[server.egg.name] ||
            (server.egg.name && eggBanners[server.egg.name.toLowerCase()]) ||
            (server.egg.id && eggBanners[server.egg.id]) ||
            (server.nest?.uuid && eggBanners[server.nest.uuid]) ||
            (server.nest?.uuid && eggBanners[server.nest.uuid.toLowerCase()]) ||
            (server.nest?.name && eggBanners[server.nest.name]) ||
            (server.egg?.nestUuid && eggBanners[server.egg.nestUuid]) ||
            (server.egg?.nest_uuid && eggBanners[server.egg.nest_uuid]);

          const eggName = (server.egg.name || '').toLowerCase();
          const nestName = (server.nest?.name || '').toLowerCase();
          const mcKeywords = [
            'minecraft',
            'paper',
            'spigot',
            'vanilla',
            'purpur',
            'forge',
            'fabric',
            'bedrock',
            'bungeecord',
            'velocity',
            'mohist',
            'sponge',
            'leaves',
            'folia',
          ];
          const isMinecraft = mcKeywords.some((k) => eggName.includes(k) || nestName.includes(k));
          const bannerUrl = customBannerUrl || (isMinecraft ? 'https://xgamingserver.com/img/game-images/minecraft-hero.webp' : null);
          const cardEl = aEl.querySelector('.mantine-Card-root, .qunix-list-row');
          if (cardEl) {
            const isListRow = cardEl.classList.contains('qunix-list-row');
            const gridBannerStyle = settings.grid_banner_style || settings.gridBannerStyle || 'cover';
            const listBannerStyle = settings.list_banner_style || settings.listBannerStyle || 'right';

            const activeStyle = isListRow ? listBannerStyle : gridBannerStyle;

            if (bannerUrl && activeStyle !== 'disabled') {
              cardEl.classList.add('qunix-server-card');
              cardEl.classList.remove(
                'has-banner',
                'has-banner-right',
                'has-banner-left',
                'has-banner-up',
                'has-banner-down',
                'has-banner-fade-half'
              );
              if (activeStyle === 'right') {
                cardEl.classList.add('has-banner-right');
              } else if (activeStyle === 'fade-left') {
                cardEl.classList.add('has-banner-left');
              } else if (activeStyle === 'fade-up') {
                cardEl.classList.add('has-banner-up');
              } else if (activeStyle === 'fade-down') {
                cardEl.classList.add('has-banner-down');
              } else if (activeStyle === 'fade-half') {
                cardEl.classList.add('has-banner-fade-half');
              } else {
                cardEl.classList.add('has-banner');
              }
              (cardEl as HTMLElement).style.setProperty('--ds-egg-banner-image', `url("${bannerUrl}")`);
            } else {
              cardEl.classList.remove(
                'qunix-server-card',
                'has-banner',
                'has-banner-right',
                'has-banner-left',
                'has-banner-up',
                'has-banner-down',
                'has-banner-fade-half'
              );
              (cardEl as HTMLElement).style.removeProperty('--ds-egg-banner-image');
            }
          }
        }
      });
    };

    applyBanners();

    const handleServerRendered = () => {
      applyBanners();
    };
    window.addEventListener('qunix-server-rendered', handleServerRendered);

    let debounceTimer: any = null;
    let observer: MutationObserver | null = null;
    const isDashboard = location.pathname === '/' || location.pathname === '/servers' || location.pathname.startsWith('/admin/servers');
    if (isDashboard) {
      const debouncedApply = () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(applyBanners, 250);
      };
      observer = new MutationObserver(debouncedApply);
      const listRoot = document.getElementById('server-list') || document.getElementById('root') || document.body;
      observer.observe(listRoot, { childList: true, subtree: false });
    }

    return () => {
      if (observer) observer.disconnect();
      if (debounceTimer) clearTimeout(debounceTimer);
      window.removeEventListener('qunix-server-rendered', handleServerRendered);
    };
  }, [queryClient, location.pathname, location.search, settings]);

  // Manage login/auth page layout dynamically
  useEffect(() => {
    if (!settings) return;
    let observer: MutationObserver | null = null;

    const syncLoginDom = () => {
      const isMobileViewport = window.innerWidth <= 768;
      // Disconnect observer if it exists to prevent infinite loops during restructuring
      if (observer) observer.disconnect();

      const isAuthPage = isAuthRoute(window.location.pathname);
      const root = document.documentElement;

      if (isAuthPage) {
        if (!root.classList.contains('qunix-auth-active')) {
          root.classList.add('qunix-auth-active');
        }
        const loginLayout = settings.login_layout || settings.loginLayout || 'default';
        const loginLogoPosition = settings.login_logo_position || settings.loginLogoPosition || 'above-form';
        const loginSupportPosition = settings.login_support_position || settings.loginSupportPosition || 'above-form';
        const loginBannerImage = settings.login_banner_image || settings.loginBannerImage || '/login_bg.png';
        const loginBgImage = settings.login_background_image || settings.loginBackgroundImage || '';
        const loginBgColor = settings.login_background_color || settings.loginBackgroundColor || '';
        const loginSupportLink = settings.login_support_link || settings.loginSupportLink || '';

        if (root.getAttribute('data-login-layout') !== loginLayout) {
          root.setAttribute('data-login-layout', loginLayout);
        }
        if (root.getAttribute('data-login-logo-position') !== loginLogoPosition) {
          root.setAttribute('data-login-logo-position', loginLogoPosition);
        }
        if (root.getAttribute('data-login-support-position') !== loginSupportPosition) {
          root.setAttribute('data-login-support-position', loginSupportPosition);
        }

        // Tag logo element for reliable CSS targeting & fix "mất appname"
        const logoEl = (document.querySelector(
          '.qunix-auth-active .qunix-auth-logo, .qunix-auth-active .select-none:has(img), .qunix-auth-active div[class*="select-none"]:has(img), .qunix-auth-active .mb-5:has(img)'
        ) || document.querySelector('.qunix-auth-active img[alt*="Calagopus"]')?.parentElement) as HTMLElement | null;

        if (logoEl) {
          if (!logoEl.classList.contains('qunix-auth-logo')) {
            logoEl.classList.add('qunix-auth-logo');
          }

          const logoImg = (logoEl.querySelector('img') ||
            document.querySelector('.qunix-auth-active img[alt*="Calagopus"]') ||
            document.querySelector('.qunix-auth-active div.select-none img')) as HTMLImageElement | null;

          let hasConfiguredBanner = false;
          try {
            const raw = localStorage.getItem('settings') || localStorage.getItem('panel_settings');
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed?.app?.banner) hasConfiguredBanner = true;
            }
          } catch (_) {}

          let isBanner = false;
          if (logoImg) {
            logoImg.classList.add('qunix-auth-logo-img');
            const alt = logoImg.getAttribute('alt') || '';
            const src = logoImg.getAttribute('src') || '';
            isBanner = Boolean(
              hasConfiguredBanner ||
              alt.toLowerCase().includes('banner') ||
              src.toLowerCase().includes('banner') ||
              src.toLowerCase().includes('2016') ||
              (logoImg.naturalWidth && logoImg.naturalWidth > logoImg.naturalHeight * 1.3)
            );

            if (!logoImg.complete) {
              logoImg.addEventListener('load', () => {
                syncLoginDom();
              }, { once: true });
            }

            if (isBanner) {
              logoImg.classList.add('qunix-auth-logo-banner');
              logoImg.classList.remove('qunix-auth-logo-icon');
              logoEl.classList.add('is-banner-logo');
              logoEl.classList.remove('is-icon-logo');
            } else {
              logoImg.classList.add('qunix-auth-logo-icon');
              logoImg.classList.remove('qunix-auth-logo-banner');
              logoEl.classList.add('is-icon-logo');
              logoEl.classList.remove('is-banner-logo');
            }
          }

          const existingTitle = logoEl.querySelector('h1, .qunix-auth-title');
          if (isBanner) {
            // User requested: When banner is shown, HIDE app name completely!
            if (existingTitle) {
              existingTitle.remove();
            }
          } else {
            // Icon mode: Ensure App Name is displayed next to the icon
            let appName = settings.site_title || settings.siteTitle || '';
            if (!appName) {
              try {
                const rawGlobal = localStorage.getItem('global');
                if (rawGlobal) {
                  const parsed = JSON.parse(rawGlobal);
                  if (parsed?.state?.settings?.app?.name) appName = parsed.state.settings.app.name;
                }
              } catch (_) {}
            }
            if (!appName) {
              try {
                const raw = localStorage.getItem('settings') || localStorage.getItem('panel_settings');
                if (raw) {
                  const parsed = JSON.parse(raw);
                  if (parsed?.app?.name) appName = parsed.app.name;
                }
              } catch (_) {}
            }
            if (!appName) {
              const metaOg = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
              const metaTitle = document.querySelector('meta[name="title"]')?.getAttribute('content');
              appName = metaOg || metaTitle || document.title || 'Calagopus';
            }
            appName = appName.split(' - ')[0].split(' | ')[0].trim();
            if (!appName) appName = 'Calagopus';

            let titleEl = existingTitle as HTMLElement | null;
            if (!titleEl) {
              titleEl = document.createElement('h1');
              titleEl.className = 'qunix-auth-title';
              titleEl.textContent = appName;
              logoEl.appendChild(titleEl);
            } else if (!titleEl.textContent?.trim()) {
              titleEl.textContent = appName;
            }
          }
        }

        if (loginBgImage) {
          const bgUrl = `url("${loginBgImage}")`;
          if (root.style.getPropertyValue('--ds-login-bg-image') !== bgUrl) {
            root.style.setProperty('--ds-login-bg-image', bgUrl);
          }
        } else {
          if (root.style.getPropertyValue('--ds-login-bg-image')) {
            root.style.removeProperty('--ds-login-bg-image');
          }
        }

        if (loginBgColor) {
          if (root.style.getPropertyValue('--ds-login-bg-color') !== loginBgColor) {
            root.style.setProperty('--ds-login-bg-color', loginBgColor);
          }
        } else {
          if (root.style.getPropertyValue('--ds-login-bg-color')) {
            root.style.removeProperty('--ds-login-bg-color');
          }
        }

        if (loginBannerImage) {
          const bannerUrl = `url("${loginBannerImage}")`;
          if (root.style.getPropertyValue('--ds-login-banner-image') !== bannerUrl) {
            root.style.setProperty('--ds-login-banner-image', bannerUrl);
          }
        } else {
          if (root.style.getPropertyValue('--ds-login-banner-image')) {
            root.style.removeProperty('--ds-login-banner-image');
          }
        }

        const hScreen = (document.querySelector('.qunix-auth-active .h-screen') ||
          document.querySelector('.qunix-auth-active [class*="h-(--auth-page-height)"]') ||
          document.querySelector('.qunix-auth-active [style*="--auth-page-height"]') ||
          document.querySelector('.qunix-auth-active div[class*="overflow-auto"]') ||
          document.querySelector('#root > div')) as HTMLElement | null;
        if (hScreen) {
          if (!hScreen.classList.contains('h-screen')) {
            hScreen.classList.add('h-screen');
          }

          if (['side-banner', 'side-banner-inverted'].includes(loginLayout)) {
            hScreen.style.setProperty('display', 'flex', 'important');
            hScreen.style.setProperty('flex-direction', 'row', 'important');
            hScreen.style.setProperty('flex-wrap', 'nowrap', 'important');
            hScreen.style.setProperty('overflow', 'hidden', 'important');
            hScreen.style.setProperty('height', '100vh', 'important');
            hScreen.style.setProperty('width', '100vw', 'important');
          } else {
            hScreen.style.removeProperty('flex-direction');
            hScreen.style.removeProperty('flex-wrap');
          }

          const realFormContainer = (
            hScreen.querySelector(':scope > div[class*="overflow-auto"], :scope > div[class*="h-("], :scope > div:has(.qunix-auth-logo), :scope > div:has(input)') ||
            Array.from(hScreen.children).find((el) => {
              const htmlEl = el as HTMLElement;
              return htmlEl.id !== 'qunix-login-banner' &&
                !htmlEl.id?.startsWith('mantine-') &&
                !htmlEl.style.position?.includes('fixed') &&
                htmlEl.querySelector('input, form, .select-none, .mantine-Card-root');
            }) ||
            hScreen.querySelector(':scope > div:not(#qunix-login-banner):not([style*="position: fixed"])')
          ) as HTMLElement | null;

          if (realFormContainer) {
            Array.from(hScreen.children).forEach((el) => {
              if (el !== realFormContainer && el.classList.contains('qunix-form-container')) {
                el.classList.remove('qunix-form-container');
              }
            });
            if (!realFormContainer.classList.contains('qunix-form-container')) {
              realFormContainer.classList.add('qunix-form-container');
            }

            let bannerEl = document.getElementById('qunix-login-banner');
            const hasBanner = ['side-banner', 'side-banner-inverted', 'floating-banner', 'panels'].includes(loginLayout);

            if (hasBanner) {
              if (!bannerEl) {
                bannerEl = document.createElement('div');
                bannerEl.id = 'qunix-login-banner';
                const inner = document.createElement('div');
                inner.id = 'qunix-login-banner-inner';
                bannerEl.appendChild(inner);
              }
              const inner = bannerEl.querySelector('#qunix-login-banner-inner') as HTMLElement | null;
              if (inner) {
                let cleanImg = (loginBannerImage || '/login_bg.png').trim();
                if (cleanImg.startsWith('url(')) {
                  cleanImg = cleanImg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
                }

                // Remove any duplicate img element so we don't double render or overlap images
                const existingImgs = inner.querySelectorAll('img');
                existingImgs.forEach((img) => img.remove());

                inner.style.backgroundImage = `url("${cleanImg}")`;
                inner.style.backgroundSize = 'cover';
                inner.style.backgroundPosition = 'center center';
                inner.style.backgroundRepeat = 'no-repeat';
              }
            } else {
              if (bannerEl) {
                bannerEl.remove();
                bannerEl = null;
              }
            }

            let formWrapper = realFormContainer.querySelector('.qunix-form-wrapper') as HTMLElement;
            const needsWrapper = ['floating-banner', 'panels'].includes(loginLayout);

            if (needsWrapper) {
              if (!formWrapper) {
                formWrapper = document.createElement('div');
                formWrapper.className = 'qunix-form-wrapper';
                while (realFormContainer.firstChild) {
                  const child = realFormContainer.firstChild;
                  if (child === bannerEl) {
                    realFormContainer.removeChild(child);
                  } else {
                    formWrapper.appendChild(child);
                  }
                }
                realFormContainer.appendChild(formWrapper);
              }
            } else {
              if (formWrapper) {
                while (formWrapper.firstChild) {
                  realFormContainer.appendChild(formWrapper.firstChild);
                }
                formWrapper.remove();
              }
            }

            if (bannerEl) {
              if (loginLayout === 'side-banner') {
                if (bannerEl.parentElement !== hScreen) {
                  hScreen.appendChild(bannerEl);
                } else if (hScreen.lastElementChild !== bannerEl) {
                  hScreen.appendChild(bannerEl);
                }
              } else if (loginLayout === 'side-banner-inverted') {
                if (bannerEl.parentElement !== hScreen) {
                  hScreen.insertBefore(bannerEl, hScreen.firstElementChild);
                } else if (hScreen.firstElementChild !== bannerEl) {
                  hScreen.insertBefore(bannerEl, hScreen.firstElementChild);
                }
              } else {
                if (bannerEl.parentElement !== realFormContainer) {
                  realFormContainer.appendChild(bannerEl);
                } else if (realFormContainer.lastElementChild !== bannerEl) {
                  realFormContainer.appendChild(bannerEl);
                }
              }
            }
          }
        }

        // Quick Language Switcher & Header Actions (Mount slot for Calagopus native Select component)
        let headerActions = document.getElementById('qunix-login-header-actions');
        if (!headerActions) {
          headerActions = document.createElement('div');
          headerActions.id = 'qunix-login-header-actions';
          headerActions.className = 'qunix-login-header-actions';
          document.body.appendChild(headerActions);
        }

        let langSlot = document.getElementById('qunix-login-lang-portal-slot');
        if (!langSlot) {
          langSlot = document.createElement('div');
          langSlot.id = 'qunix-login-lang-portal-slot';
          langSlot.className = 'qunix-login-lang-portal-slot';
          headerActions.appendChild(langSlot);
        } else if (langSlot.parentElement !== headerActions) {
          headerActions.appendChild(langSlot);
        }

        let supportEl = document.getElementById('qunix-login-support') as HTMLAnchorElement | null;
        if (loginSupportLink) {
          const wrapper = document.querySelector('.qunix-auth-active .h-screen .qunix-form-wrapper') ||
            document.querySelector('.qunix-auth-active .h-screen > div');
          if (wrapper) {
            if (!supportEl) {
              supportEl = document.createElement('a');
              supportEl.id = 'qunix-login-support';
              supportEl.href = loginSupportLink;
              supportEl.target = '_blank';
              supportEl.rel = 'noopener noreferrer';
              supportEl.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:6px;"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><span>Support</span>`;
              supportEl.className = 'qunix-login-support-btn';
            }
            if (loginSupportPosition === 'header') {
              if (supportEl.parentElement !== headerActions) {
                headerActions.appendChild(supportEl);
              }
            } else {
              if (supportEl.parentElement !== wrapper) {
                wrapper.appendChild(supportEl);
              }
            }
          }
        } else {
          if (supportEl) supportEl.remove();
        }
      } else {
        if (root.classList.contains('qunix-auth-active')) {
          root.classList.remove('qunix-auth-active');
        }
        if (root.hasAttribute('data-login-layout')) root.removeAttribute('data-login-layout');
        if (root.hasAttribute('data-login-logo-position')) root.removeAttribute('data-login-logo-position');
        if (root.hasAttribute('data-login-support-position')) root.removeAttribute('data-login-support-position');
        if (root.style.getPropertyValue('--ds-login-banner-image')) {
          root.style.removeProperty('--ds-login-banner-image');
        }

        const hScreenEl = document.getElementById('window_null_inner') || document.querySelector('.h-screen') as HTMLElement | null;
        if (hScreenEl) {
          hScreenEl.style.removeProperty('display');
          hScreenEl.style.removeProperty('flex-direction');
          hScreenEl.style.removeProperty('flex-wrap');
          hScreenEl.style.removeProperty('overflow');
          hScreenEl.style.removeProperty('height');
          hScreenEl.style.removeProperty('width');
        }

        const headerActions = document.getElementById('qunix-login-header-actions');
        if (headerActions) headerActions.remove();

        const bannerEl = document.getElementById('qunix-login-banner');
        if (bannerEl) bannerEl.remove();

        const supportEl = document.getElementById('qunix-login-support');
        if (supportEl) supportEl.remove();

        const formWrapper = document.querySelector('.qunix-form-wrapper');
        if (formWrapper) {
          const formContainer = formWrapper.parentElement;
          if (formContainer) {
            while (formWrapper.firstChild) {
              formContainer.appendChild(formWrapper.firstChild);
            }
          }
          formWrapper.remove();
        }
      }

      if (observer && isAuthRoute(location.pathname)) {
        observer.observe(document.body, { childList: true, subtree: true });
      }
    };

    syncLoginDom();

    if (isAuthRoute(location.pathname)) {
      observer = new MutationObserver(syncLoginDom);
      observer.observe(document.body, { childList: true, subtree: true });
    }

    let adminAnnObserver: MutationObserver | null = null;
    if (location.pathname.startsWith('/admin/announcements')) {
      const syncAdminAnnouncementsDom = () => {
        const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement | null;
        const dismissibleEl = document.querySelector('input[name="dismissible"]')?.closest('.mantine-Switch-root') ||
          Array.from(document.querySelectorAll('label, span')).find((el) => el.textContent?.trim() === 'Dismissible')?.closest('.mantine-Switch-root');

        if (dismissibleEl && !document.getElementById('qunix-important-switch-container')) {
          const titleVal = titleInput?.value || '';
          const pathParts = location.pathname.split('/');
          const annId = pathParts[pathParts.length - 1];
          const isUuid = annId && annId.length > 10 && annId !== 'announcements';

          const getSavedState = () => {
            const currentTitle = (document.querySelector('input[name="title"]') as HTMLInputElement)?.value || titleVal;
            if (isUuid && localStorage.getItem(`qunix_announcement_important_${annId}`) !== null) {
              return localStorage.getItem(`qunix_announcement_important_${annId}`) === 'true';
            }
            if (currentTitle && localStorage.getItem(`qunix_announcement_important_${currentTitle}`) !== null) {
              return localStorage.getItem(`qunix_announcement_important_${currentTitle}`) === 'true';
            }
            return false;
          };

          let isChecked = getSavedState();

          const wrapper = document.createElement('div');
          wrapper.id = 'qunix-important-switch-container';
          wrapper.className = 'mantine-Switch-root';
          wrapper.style.marginTop = '14px';
          wrapper.style.display = 'inline-flex';
          wrapper.style.alignItems = 'center';
          wrapper.style.gap = '10px';
          wrapper.style.cursor = 'pointer';

          const renderSwitchContent = () => {
            wrapper.innerHTML = `
              <div style="position: relative; display: inline-flex; align-items: center; gap: 10px; cursor: pointer; user-select: none;">
                <div style="position: relative; width: 38px; height: 22px; border-radius: 9999px; background-color: ${isChecked ? '#7950f2' : '#2c2e33'}; transition: background-color 150ms ease; display: flex; align-items: center; padding: 2px;">
                  <div style="width: 18px; height: 18px; border-radius: 9999px; background-color: #ffffff; transform: ${isChecked ? 'translateX(16px)' : 'translateX(0)'}; transition: transform 150ms ease; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>
                </div>
                <span style="font-size: 14px; font-weight: 500; color: ${isChecked ? '#ffffff' : '#c1c2c5'}; transition: color 150ms ease;">
                  📌 Mark as Important
                </span>
              </div>
            `;
          };

          renderSwitchContent();
          dismissibleEl.parentElement?.appendChild(wrapper);

          const handleToggle = () => {
            isChecked = !isChecked;
            renderSwitchContent();

            const currentTitle = (document.querySelector('input[name="title"]') as HTMLInputElement)?.value || titleVal;
            if (isUuid) {
              localStorage.setItem(`qunix_announcement_important_${annId}`, String(isChecked));
            }
            if (currentTitle) {
              localStorage.setItem(`qunix_announcement_important_${currentTitle}`, String(isChecked));
            }

            window.dispatchEvent(new CustomEvent('qunix-important-changed', { detail: { isChecked } }));
          };

          wrapper.addEventListener('click', handleToggle);

          const saveBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.includes('Save') || b.type === 'submit');
          if (saveBtn) {
            saveBtn.addEventListener('click', () => {
              const currentTitle = (document.querySelector('input[name="title"]') as HTMLInputElement)?.value || titleVal;
              if (currentTitle) {
                localStorage.setItem(`qunix_announcement_important_${currentTitle}`, String(isChecked));
              }
              if (isUuid) {
                localStorage.setItem(`qunix_announcement_important_${annId}`, String(isChecked));
              }
            });
          }
        }
      };

      syncAdminAnnouncementsDom();
      adminAnnObserver = new MutationObserver(syncAdminAnnouncementsDom);
      adminAnnObserver.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      if (observer) observer.disconnect();
      if (adminAnnObserver) adminAnnObserver.disconnect();
    };
  }, [location.pathname, settings]);

  const isAuthPage = isAuthRoute(location.pathname);

  return (
    <>
      <QunixGlobalThemeEnhancer />
      {isAuthPage && <AuthLanguageSelector />}
      {!isAuthPage && <NotificationCenter />}
    </>
  );
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

    let timer: any = null;
    const update = () => {
      if (timer) return;
      timer = setTimeout(() => {
        timer = null;
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
      }, 250);
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
        await copyToClipboard(data.url);
        addToast('Logs shared! Link copied to clipboard.', 'success');
        window.open(data.url, '_blank', 'noopener,noreferrer');
      } else {
        addToast(data.error || 'Failed to share logs', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('An error occurred while sharing logs', 'error');
    }
    setSharing(false);
  };

  return (
    <>
      <Tooltip label='Clear Console'>
        <ActionIcon
          className='group qunix-console-icon-btn'
          size='xs'
          radius={0}
          variant='transparent'
          onClick={handleClear}
        >
          <FontAwesomeIcon
            icon={faTrash}
            className='text-(--mantine-color-dimmed) group-hover:text-(--mantine-color-text) transition-colors'
          />
        </ActionIcon>
      </Tooltip>
      <Tooltip label={sharing ? 'Sharing logs...' : 'Share Logs via mclo.gs'}>
        <ActionIcon
          className='group qunix-console-icon-btn'
          size='xs'
          radius={0}
          variant='transparent'
          loading={sharing}
          onClick={handleShareLogs}
        >
          <FontAwesomeIcon
            icon={faShareNodes}
            className='text-(--mantine-color-dimmed) group-hover:text-(--mantine-color-text) transition-colors'
          />
        </ActionIcon>
      </Tooltip>
    </>
  );
};



class QunixThemeExtension extends Extension {
  public cardConfigurationPage = LazyConfiguration;
  public cardComponent = null;

  public initialize(ctx: ExtensionContext): void {
    try {
      const cached = localStorage.getItem('qunix_theme_settings');
      if (cached) {
        const s = JSON.parse(cached);
        (window as any).qunixThemeSettings = s;
        const root = document.documentElement;
        const isDark = root.getAttribute('data-mantine-color-scheme') !== 'light';

        const bg = isDark ? (s.background_color || s.backgroundColor) : (s.light_background_color || s.lightBackgroundColor);
        const cardBg = isDark ? (s.card_color || s.cardColor) : (s.light_card_color || s.lightCardColor);
        const border = isDark ? (s.border_color || s.borderColor) : (s.light_border_color || s.lightBorderColor);
        const text = isDark ? (s.text_color || s.textColor) : (s.light_text_color || s.lightTextColor);
        const sidebar = isDark ? (s.sidebar_color || s.sidebarColor) : (s.light_sidebar_color || s.lightSidebarColor);
        const navbar = isDark ? (s.navbar_color || s.navbarColor) : (s.light_navbar_color || s.lightNavbarColor);
        const input = isDark ? (s.input_color || s.inputColor) : (s.light_input_color || s.lightInputColor);
        const btn = isDark ? (s.button_color || s.buttonColor) : (s.light_button_color || s.lightButtonColor);
        const dark7 = isDark ? (s.dark_7_color || s.dark7Color) : (s.light_dark_7_color || s.lightDark7Color);
        const dark6 = isDark ? (s.dark_6_color || s.dark6Color) : (s.light_dark_6_color || s.lightDark6Color);
        const miniCard = isDark ? (s.mini_card_bg_color || s.miniCardBgColor) : (s.light_mini_card_bg_color || s.lightMiniCardBgColor);
        const popupBorder = isDark ? (s.popup_window_border_color || s.popupWindowBorderColor) : (s.light_popup_window_border_color || s.lightPopupWindowBorderColor);

        if (bg) {
          root.style.setProperty('--ds-background', bg);
          root.style.setProperty('--mantine-color-body', bg);
        }
        if (dark7) root.style.setProperty('--ds-dark-7', dark7);
        if (dark6) root.style.setProperty('--ds-dark-6', dark6);
        if (cardBg) {
          root.style.setProperty('--ds-card-bg', cardBg);
          root.style.setProperty('--mantine-color-default', cardBg);
        }
        if (border) {
          root.style.setProperty('--ds-border-color', border);
          root.style.setProperty('--mantine-color-default-border', border);
        }
        if (text) {
          root.style.setProperty('--ds-text-color', text);
          root.style.setProperty('--mantine-color-text', text);
          root.style.setProperty('--mantine-color-default-color', text);
        }
        if (miniCard) root.style.setProperty('--ds-mini-card-bg', miniCard);
        if (popupBorder) root.style.setProperty('--ds-popup-window-border-color', popupBorder);
        if (sidebar) root.style.setProperty('--ds-sidebar-bg', sidebar);
        if (navbar) root.style.setProperty('--ds-navbar-bg', navbar);
        if (input) root.style.setProperty('--ds-input-bg', input);
        if (btn) root.style.setProperty('--ds-primary-color', btn);

        const qBg = isDark ? (s.quick_actions_bg || s.quickActionsBg) : (s.light_quick_actions_bg || s.lightQuickActionsBg);
        const qText = isDark ? (s.quick_actions_text_color || s.quickActionsTextColor) : (s.light_quick_actions_text_color || s.lightQuickActionsTextColor);
        const qBorder = isDark ? (s.quick_actions_border_color || s.quickActionsBorderColor) : (s.light_quick_actions_border_color || s.lightQuickActionsBorderColor);
        if (qBg) root.style.setProperty('--ds-quick-actions-bg', qBg);
        if (qText) root.style.setProperty('--ds-quick-actions-text', qText);
        if (qBorder) root.style.setProperty('--ds-quick-actions-border', qBorder);

        if (s.chrome_toolbar_color || s.chromeToolbarColor) {
          const themeMeta = document.getElementById('meta-theme-color');
          if (themeMeta) themeMeta.setAttribute('content', s.chrome_toolbar_color || s.chromeToolbarColor);
        }

        // Terminal font family from cache
        const cachedTermFont = s.terminal_font_family || s.terminalFontFamily;
        if (cachedTermFont) {
          const tfm: Record<string, string> = {
            'Consolas': "'Consolas', monospace",
            'Menlo': "'Menlo', monospace",
            'Monaco': "'Monaco', monospace",
            'Courier New': "'Courier New', monospace",
            'FiraCode Nerd Font': "'FiraCode Nerd Font', 'Fira Code', monospace",
            'JetBrainsMono Nerd Font': "'JetBrainsMono Nerd Font', 'JetBrains Mono', monospace",
            'JetBrains Mono': "'JetBrainsMono Nerd Font', 'JetBrains Mono', monospace",
            'Meslo LG M Nerd Font': "'MesloLGM Nerd Font', 'Meslo LG M', monospace",
            'UbuntuMono Nerd Font': "'UbuntuMono Nerd Font', 'Ubuntu Mono', monospace",
          };
          root.style.setProperty('--ds-terminal-font-family', tfm[cachedTermFont] || `'${cachedTermFont}', monospace`);
        }

        const bgImg = s.background_image || s.backgroundImage;
        if (bgImg) {
          let wallpaperEl = document.getElementById('qunix-wallpaper-img') as HTMLImageElement | null;
          if (!wallpaperEl) {
            wallpaperEl = document.createElement('img');
            wallpaperEl.id = 'qunix-wallpaper-img';
            wallpaperEl.alt = '';
            wallpaperEl.setAttribute('aria-hidden', 'true');
            wallpaperEl.decoding = 'async';
            document.documentElement.appendChild(wallpaperEl);
          }
          if (wallpaperEl.src !== bgImg) {
            wallpaperEl.src = bgImg;
          }
          const blurPx = s.wallpaper_blur !== undefined ? Number(s.wallpaper_blur) : (s.wallpaperBlur !== undefined ? Number(s.wallpaperBlur) : 0);
          const brightness = s.wallpaper_brightness !== undefined ? Number(s.wallpaper_brightness) : (s.wallpaperBrightness !== undefined ? Number(s.wallpaperBrightness) : 1);
          wallpaperEl.style.filter = blurPx > 0 ? `blur(${blurPx}px)` : '';
          wallpaperEl.style.opacity = String(brightness);
          root.classList.add('has-bg-image');
          document.body.classList.add('has-bg-image');
        }

        const fontFamily = s.font_family || s.fontFamily || 'JetBrains Mono';
        loadFontCSPFriendly(fontFamily);

        root.setAttribute(
          'data-sidebar-hover-style',
          s.sidebar_hover_style || s.sidebarHoverStyle || 'style-1',
        );
        root.setAttribute(
          'data-dashboard-layout',
          s.dashboard_layout || s.dashboardLayout || 'default',
        );
        root.setAttribute(
          'data-card-animation',
          s.card_animation || s.cardAnimation || 'slide-up',
        );
        root.setAttribute(
          'data-listing-animation',
          s.listing_animation || s.listingAnimation || 'inherit',
        );
        root.setAttribute(
          'data-dock-position',
          'sidebar',
        );
      }
    } catch (_) { }

    // Dispatch cached settings to React after mount (microtask ensures components are ready)
    setTimeout(() => {
      const s = (window as any).qunixThemeSettings;
      if (s) {
        window.dispatchEvent(new CustomEvent('qunix-settings-loaded', { detail: s }));
      }
    }, 0);

    Spinner.replaceBaseComponent((props: any) => {
      const colorScheme = useComputedColorScheme();
      const s = (window as any).qunixThemeSettings;
      const spinnerType = s?.spinner_type || s?.spinnerType || 'ClipLoader';
      const isDark = colorScheme === 'dark';

      const defaultColor = isDark ? '#fff' : '#000';
      const color = s?.spinner_color || s?.spinnerColor || defaultColor;

      const defaultProp = 'default';
      let SpinnerComponent = (Spinners as any)[spinnerType] || (Spinners as any)[defaultProp]?.[spinnerType];
      if (!SpinnerComponent) {
        SpinnerComponent = Spinners.ClipLoader || (Spinners as any)[defaultProp]?.ClipLoader;
      }

      const sizeProps: any = {};
      if (['BarLoader', 'FadeLoader', 'ScaleLoader'].includes(spinnerType)) {
        if (props.size) {
          if (spinnerType === 'BarLoader') {
            sizeProps.height = 4;
            sizeProps.width = props.size;
          } else if (spinnerType === 'FadeLoader') {
            sizeProps.height = props.size / 3;
            sizeProps.width = props.size / 6;
          } else if (spinnerType === 'ScaleLoader') {
            sizeProps.height = props.size;
            sizeProps.width = props.size / 8;
          }
        }
      } else {
        sizeProps.size = props.size;
      }

      return (
        <SpinnerComponent
          {...sizeProps}
          color={color}
          aria-label='Loading Spinner'
          data-testid='loader'
        />
      );
    });

    Spinner.Centered.replaceBaseComponent((props: any) => (
      <div className={`flex items-center justify-center py-6 ${props.className || ''}`}>
        <Spinner size={props.size} />
      </div>
    ));

    Spinner.Suspense.replaceBaseComponent((props: any) => (
      <React.Suspense
        fallback={
          <div className={`flex items-center justify-center ${props.className || ''}`}>
            <Spinner />
          </div>
        }
      >
        {props.children}
      </React.Suspense>
    ));

    Alert.addRenderInterceptor((element, props) => {
      if (props.className && props.className.includes('mx-6')) {
        const s = (window as any).qunixThemeSettings;
        const displayMode = s?.announcement_display_mode || s?.announcementDisplayMode || 'notifications';
        const titleStr = typeof props.title === 'string' ? props.title : '';
        const isNonDismissible = !props.withCloseButton;

        const isExplicitlyImportant = titleStr && (
          localStorage.getItem('qunix_announcement_important_' + titleStr) === 'true' ||
          ((props as any).uuid && localStorage.getItem('qunix_announcement_important_' + (props as any).uuid) === 'true') ||
          titleStr.includes('[Important]') ||
          titleStr.includes('[IMPORTANT]')
        );

        if (displayMode === 'notifications' && !isExplicitlyImportant) {
          return <div style={{ display: 'none' }} />;
        }

        const ctaEnabled = s?.announcement_cta !== false && s?.announcementCta !== false;
        const ctaLink = s?.announcement_cta_link || s?.announcementCtaLink;
        const ctaText = s?.announcement_cta_text || s?.announcementCtaText || 'Go to link...';

        let titleNode = props.title;
        if (isNonDismissible) {
          titleNode = (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <FontAwesomeIcon icon={faThumbtack} style={{ fontSize: '11px', color: '#a29bfe' }} title="Pinned announcement (Cannot be dismissed)" />
              <span>{props.title}</span>
            </span>
          );
        }

        const ctaButton = (ctaLink && ctaEnabled) ? (
          <a href={ctaLink} target='_blank' rel='noopener noreferrer' className='qunix-announcement-cta-btn'>
            {ctaText}
          </a>
        ) : null;

        const originalChildren = props.children;
        const originalClassName = props.className || '';
        const hasClose = props.withCloseButton;
        const additionalClass = `qunix-announcement-alert ${hasClose ? 'has-close-button' : ''} ${isNonDismissible ? 'is-pinned' : ''}`;

        return React.cloneElement(element, {
          title: titleNode,
          className: `${originalClassName} ${additionalClass}`.trim(),
          children: (
            <>
              {originalChildren}
              {ctaButton}
            </>
          ),
        });
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

    Sidebar.replaceBaseComponent(QunixSidebar);

    Sidebar.Link.addRenderInterceptor((_element, props) => {
      return <QunixSidebarLink {...props} />;
    });

    Sidebar.Divider.addRenderInterceptor((_element, props) => {
      return <QunixSidebarDivider {...props} />;
    });

    Sidebar.Footer.replaceBaseComponent(QunixSidebarFooter);

    ctx.extensionRegistry.pages.dashboard.account.accountContainers.appendComponent(QunixPrivacyContainer);

    ctx.extensionRegistry.routes.addAdminRoute({
      name: 'Qunix Theme',
      icon: faPalette,
      path: '/qunix-settings/*',
      element: LazyAdminSettings,
      permission: ['extensions.qunix.theme.read'],
    });

    ctx.extensionRegistry.routes.addAdminRoute({
      name: undefined,
      path: '/extensions/dev.qunix.theme/*',
      element: LazyConfiguration,
      permission: ['qunix-theme.read'],
    });

    try {
      ctx.extensionRegistry.permissionIcons.addAdminPermissionIcon(
        'qunix-theme',
        <FontAwesomeIcon icon={faPalette} />
      );
      ctx.extensionRegistry.permissionIcons.addUserPermissionIcon(
        'qunix-theme',
        <FontAwesomeIcon icon={faPalette} />
      );
    } catch (_) { }

    ctx.extensionRegistry.pages.server.prependComponent(ServerBannerComponent);
    ctx.extensionRegistry.pages.global.prependComponent(QunixThemeLoader);

    AccountContentContainer.addPropsInterceptor((props) => {
      const containerAll = (window as any).extensionContext?.extensionRegistry?.pages?.dashboard?.home?.containerAll;
      const containerGrouped = (window as any).extensionContext?.extensionRegistry?.pages?.dashboard?.home?.containerGrouped;
      const isDashboard = props.registry === containerAll || props.registry === containerGrouped;
      if (isDashboard) {
        return { ...props, hideTitleComponent: true };
      }
      return props;
    });

    AccountContentContainer.addRenderInterceptor((element, props) => {
      const containerAll = (window as any).extensionContext?.extensionRegistry?.pages?.dashboard?.home?.containerAll;
      const containerGrouped = (window as any).extensionContext?.extensionRegistry?.pages?.dashboard?.home?.containerGrouped;
      const isDashboard = props.registry === containerAll || props.registry === containerGrouped;

      if (!isDashboard) {
        return element;
      }

      const isGrouped = props.registry === containerGrouped;
      return <QunixDashboardContainerWrapper props={props} isGrouped={isGrouped} originalElement={element} />;
    });

    // ponytail: Mobile Prism Code Editor replacement for Monaco
    // Monaco is unusable on mobile touch devices. On mobile viewports,
    // we hide the Monaco container and inject a lightweight Prism editor
    // that syncs changes back through Monaco's setValue() to preserve
    // the existing save/draft/collab wiring.
    ctx.extensionRegistry.elements.monacoEditor.addOnMountHandler((monacoEditor, monaco) => {
      const isMobile = window.innerWidth <= 768 || ('ontouchstart' in window && window.innerWidth <= 1024);
      if (!isMobile) return;

      const monacoContainerEl = (monacoEditor as any).getContainerDomNode?.();
      if (!monacoContainerEl) return;

      let wrapperEl = monacoContainerEl.closest('[style*="display: contents"]') || monacoContainerEl.parentElement;
      if (!wrapperEl) return;

      wrapperEl.style.display = 'none';
      monacoContainerEl.style.pointerEvents = 'none';


      if (!(window as any).__monacoTouchFilterApplied) {
        (window as any).__monacoTouchFilterApplied = true;
        const origWarn = console.warn;
        console.warn = function (...args: any[]) {
          if (typeof args[0] === 'string' && args[0].includes('UNKNOWN touch')) return;
          origWarn.apply(console, args);
        };
        const origLog = console.log;
        console.log = function (...args: any[]) {
          if (typeof args[0] === 'string' && args[0].includes('UNKNOWN touch')) return;
          origLog.apply(console, args);
        };
      }

      const prismContainer = document.createElement('div');
      prismContainer.id = 'qunix-prism-mobile-editor';
      prismContainer.style.cssText = 'width:100%;height:100%;min-height:200px;display:flex;flex-direction:column;border-radius:0;overflow:hidden;';
      wrapperEl.parentElement?.insertBefore(prismContainer, wrapperEl);
      const model = monacoEditor.getModel();
      const rawLang = (model?.getLanguageId?.() || '').toLowerCase();
      const uriPath = (model?.uri?.path || model?.uri?.fsPath || model?.uri?.toString?.() || '').toLowerCase();
      const headerText = (document.querySelector('h1, h2, .text-lg, header')?.textContent || '').toLowerCase();
      const pathOrHeader = uriPath + ' ' + headerText;

      const langMap: Record<string, string> = {
        'javascript': 'javascript', 'typescript': 'typescript', 'typescriptreact': 'tsx',
        'javascriptreact': 'jsx', 'js': 'javascript', 'ts': 'typescript', 'jsx': 'jsx', 'tsx': 'tsx',
        'json': 'json', 'jsonc': 'json', 'json5': 'json',
        'html': 'html', 'css': 'css', 'scss': 'scss', 'less': 'css',
        'xml': 'xml', 'yaml': 'yaml', 'yml': 'yaml', 'markdown': 'markdown', 'md': 'markdown',
        'python': 'python', 'py': 'python',
        'java': 'java', 'csharp': 'csharp', 'cpp': 'cpp', 'c': 'c', 'cs': 'csharp',
        'go': 'go', 'golang': 'go',
        'rust': 'rust', 'rs': 'rust',
        'php': 'php', 'ruby': 'ruby', 'rb': 'ruby',
        'shell': 'bash', 'shellscript': 'bash', 'sh': 'bash', 'bash': 'bash', 'zsh': 'bash', 'bat': 'batch',
        'sql': 'sql', 'mysql': 'sql', 'pgsql': 'sql',
        'lua': 'lua', 'perl': 'perl',
        'dockerfile': 'docker', 'docker': 'docker',
        'toml': 'toml', 'ini': 'ini', 'conf': 'ini', 'env': 'ini', 'dotenv': 'ini',
        'properties': 'properties', 'nginx': 'nginx',
        'swift': 'swift', 'kotlin': 'kotlin', 'scala': 'scala',
        'r': 'r', 'powershell': 'powershell', 'graphql': 'graphql',
      };

      let prismLang = langMap[rawLang];
      if (!prismLang || prismLang === 'text') {
        if (/\.ya?ml\b/.test(pathOrHeader)) prismLang = 'yaml';
        else if (/\.json5?\b/.test(pathOrHeader)) prismLang = 'json';
        else if (/\.(js|jsx|mjs|cjs)\b/.test(pathOrHeader)) prismLang = 'javascript';
        else if (/\.(ts|tsx)\b/.test(pathOrHeader)) prismLang = 'typescript';
        else if (/\.py\b/.test(pathOrHeader)) prismLang = 'python';
        else if (/\.rs\b/.test(pathOrHeader)) prismLang = 'rust';
        else if (/\.go\b/.test(pathOrHeader)) prismLang = 'go';
        else if (/\.sh\b|\.bash\b|\.zsh\b/.test(pathOrHeader)) prismLang = 'bash';
        else if (/\.sql\b/.test(pathOrHeader)) prismLang = 'sql';
        else if (/\.css\b/.test(pathOrHeader)) prismLang = 'css';
        else if (/\.html?\b|\.xml\b/.test(pathOrHeader)) prismLang = 'html';
        else if (/\.md\b|\.markdown\b/.test(pathOrHeader)) prismLang = 'markdown';
        else if (/\.docker\b|dockerfile/i.test(pathOrHeader)) prismLang = 'docker';
        else if (/\.conf\b|\.env\b|\.ini\b|\.properties\b/.test(pathOrHeader)) prismLang = 'ini';
        else if (/\.toml\b/.test(pathOrHeader)) prismLang = 'toml';
        else prismLang = 'yaml';
      }

      const loadGrammar = async (lang: string) => {
        try {
          switch (lang) {
            case 'yaml': await import('prism-code-editor/prism/languages/yaml'); break;
            case 'json': await import('prism-code-editor/prism/languages/json'); break;
            case 'javascript': await import('prism-code-editor/prism/languages/javascript'); break;
            case 'typescript': await import('prism-code-editor/prism/languages/typescript'); break;
            case 'jsx': await import('prism-code-editor/prism/languages/jsx'); break;
            case 'tsx': await import('prism-code-editor/prism/languages/tsx'); break;
            case 'python': await import('prism-code-editor/prism/languages/python'); break;
            case 'bash': await import('prism-code-editor/prism/languages/bash'); break;
            case 'sql': await import('prism-code-editor/prism/languages/sql'); break;
            case 'css': await import('prism-code-editor/prism/languages/css'); break;
            case 'html':
            case 'markup':
            case 'xml': await import('prism-code-editor/prism/languages/markup'); break;
            case 'markdown': await import('prism-code-editor/prism/languages/markdown'); break;
            case 'docker': await import('prism-code-editor/prism/languages/docker'); break;
            case 'ini': await import('prism-code-editor/prism/languages/ini'); break;
            case 'toml': await import('prism-code-editor/prism/languages/toml'); break;
            case 'c': await import('prism-code-editor/prism/languages/c'); break;
            case 'cpp': await import('prism-code-editor/prism/languages/cpp'); break;
            case 'csharp': await import('prism-code-editor/prism/languages/csharp'); break;
            case 'java': await import('prism-code-editor/prism/languages/java'); break;
            case 'go': await import('prism-code-editor/prism/languages/go'); break;
            case 'rust': await import('prism-code-editor/prism/languages/rust'); break;
            case 'php': await import('prism-code-editor/prism/languages/php'); break;
            case 'ruby': await import('prism-code-editor/prism/languages/ruby'); break;
            case 'lua': await import('prism-code-editor/prism/languages/lua'); break;
          }
        } catch (e) {
          console.warn('[Prism] Grammar load error for', lang, e);
        }
      };

      const isDark = document.documentElement.getAttribute('data-mantine-color-scheme') !== 'light';
      const currentValue = monacoEditor.getValue();
      const isReadOnly = monacoEditor.getOption(monaco.editor.EditorOption.readOnly);
      const initialTheme = isDark ? 'vs-code-dark' : 'vs-code-light';

      // Create mobile editor controls toolbar above editor with Hide/Show toggle button
      const toolbarEl = document.createElement('div');
      toolbarEl.id = 'qunix-prism-toolbar';
      toolbarEl.className = 'bg-neutral-900 text-neutral-200 border-b border-neutral-800 text-xs select-none';
      toolbarEl.innerHTML = `
        <div class="flex items-center justify-between px-2.5 py-1.5 border-b border-neutral-800/60 bg-neutral-950/50">
          <span class="font-medium text-neutral-400 text-[11px] uppercase tracking-wider">Editor Controls</span>
          <button id="qunix-prism-toggle-btn" type="button" class="px-2 py-0.5 text-xs bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-neutral-200 rounded border border-neutral-700 transition-colors cursor-pointer flex items-center gap-1">
            <span id="qunix-prism-toggle-text">Hide</span>
            <span id="qunix-prism-toggle-icon">▲</span>
          </button>
        </div>
        <div id="qunix-prism-toolbar-content" class="flex flex-wrap items-center justify-between gap-2 p-2 transition-all">
          <div class="flex items-center gap-3 flex-wrap">
            <label class="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" id="qunix-prism-line-numbers" checked />
              <span>Line numbers</span>
            </label>
            <label class="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" id="qunix-prism-word-wrap" checked />
              <span>Word wrap</span>
            </label>
            <label class="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" id="qunix-prism-readonly" ${isReadOnly ? 'checked' : ''} />
              <span>Read-only</span>
            </label>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <label class="flex items-center gap-1">
              <span>Theme:</span>
              <select id="qunix-prism-theme-select" class="bg-neutral-800 text-white rounded px-2 py-1 border border-neutral-700 outline-none text-xs">
                <option value="vs-code-dark">VS Code Dark</option>
                <option value="vs-code-light">VS Code Light</option>
                <option value="github-dark">GitHub Dark</option>
                <option value="github-light">GitHub Light</option>
                <option value="dracula">Dracula</option>
                <option value="atom-one-dark">Atom One Dark</option>
                <option value="night-owl">Night Owl</option>
              </select>
            </label>
            <label class="flex items-center gap-1">
              <span>Language:</span>
              <select id="qunix-prism-lang-select" class="bg-neutral-800 text-white rounded px-2 py-1 border border-neutral-700 outline-none text-xs">
                <option value="yaml">yaml</option>
                <option value="json">json</option>
                <option value="javascript">javascript</option>
                <option value="typescript">typescript</option>
                <option value="python">python</option>
                <option value="bash">bash</option>
                <option value="html">html</option>
                <option value="css">css</option>
                <option value="sql">sql</option>
                <option value="docker">docker</option>
                <option value="toml">toml</option>
                <option value="ini">ini</option>
                <option value="rust">rust</option>
                <option value="go">go</option>
                <option value="cpp">cpp</option>
                <option value="csharp">csharp</option>
                <option value="java">java</option>
                <option value="markdown">markdown</option>
              </select>
            </label>
          </div>
        </div>
      `;
      prismContainer.appendChild(toolbarEl);

      const editorEl = document.createElement('div');
      editorEl.style.cssText = 'width:100%;flex:1 1 auto;height:100%;min-height:0;border-radius:0;overflow:auto;';
      prismContainer.appendChild(editorEl);

      // Hide/Show toolbar toggle logic
      const toggleBtn = toolbarEl.querySelector('#qunix-prism-toggle-btn') as HTMLButtonElement;
      const toolbarContent = toolbarEl.querySelector('#qunix-prism-toolbar-content') as HTMLDivElement;
      const toggleIcon = toolbarEl.querySelector('#qunix-prism-toggle-icon') as HTMLSpanElement;
      const toggleText = toolbarEl.querySelector('#qunix-prism-toggle-text') as HTMLSpanElement;

      let isToolbarVisible = true;
      if (toggleBtn && toolbarContent) {
        toggleBtn.onclick = () => {
          isToolbarVisible = !isToolbarVisible;
          toolbarContent.style.display = isToolbarVisible ? 'flex' : 'none';
          if (toggleIcon) toggleIcon.textContent = isToolbarVisible ? '▲' : '▼';
          if (toggleText) toggleText.textContent = isToolbarVisible ? 'Hide' : 'Show';
        };
      }

      Promise.all([
        import('prism-code-editor/setups'),
        loadGrammar(prismLang)
      ]).then(([{ basicEditor }]) => {
        let syncing = false;

        const prismEditor = basicEditor(editorEl, {
          theme: initialTheme,
          language: prismLang,
          value: currentValue,
          readOnly: isReadOnly,
          wordWrap: true,
          lineNumbers: true,
          tabSize: Number(model?.getOptions?.().tabSize) || 2,
          insertSpaces: model?.getOptions?.().insertSpaces !== false,
          onUpdate: (value: string) => {
            if (syncing) return;
            syncing = true;
            monacoEditor.setValue(value);
            syncing = false;
          },
        });

        // Sync dropdown values with current editor settings
        const langSelect = toolbarEl.querySelector('#qunix-prism-lang-select') as HTMLSelectElement;
        const themeSelect = toolbarEl.querySelector('#qunix-prism-theme-select') as HTMLSelectElement;
        const lineNumCheck = toolbarEl.querySelector('#qunix-prism-line-numbers') as HTMLInputElement;
        const wordWrapCheck = toolbarEl.querySelector('#qunix-prism-word-wrap') as HTMLInputElement;
        const readOnlyCheck = toolbarEl.querySelector('#qunix-prism-readonly') as HTMLInputElement;

        if (langSelect) langSelect.value = prismLang;
        if (themeSelect) themeSelect.value = initialTheme;

        // Apply language after grammar loading to trigger syntax color formatting
        prismEditor.setOptions({ language: prismLang } as any);

        // Control listeners
        if (lineNumCheck) {
          lineNumCheck.onchange = (e) => prismEditor.setOptions({ lineNumbers: (e.target as HTMLInputElement).checked } as any);
        }
        if (wordWrapCheck) {
          wordWrapCheck.onchange = (e) => prismEditor.setOptions({ wordWrap: (e.target as HTMLInputElement).checked } as any);
        }
        if (readOnlyCheck) {
          readOnlyCheck.onchange = (e) => prismEditor.setOptions({ readOnly: (e.target as HTMLInputElement).checked } as any);
        }
        if (themeSelect) {
          themeSelect.onchange = (e) => prismEditor.setOptions({ theme: (e.target as HTMLSelectElement).value } as any);
        }
        if (langSelect) {
          langSelect.onchange = (e) => {
            const newLang = (e.target as HTMLSelectElement).value;
            loadGrammar(newLang).then(() => {
              prismEditor.setOptions({ language: newLang } as any);
            });
          };
        }

        // Style Prism editor
        const fontSize = monacoEditor.getOption(monaco.editor.EditorOption.fontSize);
        Object.assign(prismEditor.container.style, {
          height: '100%',
          fontSize: `${Math.max(fontSize, 13)}px`,
          minHeight: '250px',
        });

        // Theme observer
        const themeObserver = new MutationObserver(() => {
          const nowDark = document.documentElement.getAttribute('data-mantine-color-scheme') !== 'light';
          const newTheme = nowDark ? 'vs-code-dark' : 'vs-code-light';
          if (themeSelect) themeSelect.value = newTheme;
          prismEditor.setOptions({ theme: newTheme } as any);
        });
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mantine-color-scheme'] });

        // Cleanup
        const cleanupObserver = new MutationObserver(() => {
          if (!prismContainer.isConnected) {
            prismEditor.remove();
            themeObserver.disconnect();
            cleanupObserver.disconnect();
          }
        });
        if (prismContainer.parentElement) {
          cleanupObserver.observe(prismContainer.parentElement, { childList: true });
        }
      });
    });

    ;
    ctx.extensionRegistry.pages.server.console.xterm.addInitHandler((options) => {
      const s = (window as any).qunixThemeSettings;
      if (!s) return;

      const isDark = document.documentElement.getAttribute('data-mantine-color-scheme') !== 'light';

      const bgColor = isDark
        ? s.terminal_color || s.terminalColor || '#1C1F24'
        : s.light_terminal_color || s.lightTerminalColor || '#f1f2f6';

      const fgColor = isDark
        ? s.terminal_text_color || s.terminalTextColor || '#FEFEFD'
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

      // Override fontFamily before xterm instance is created
      const termFont = s.terminal_font_family || s.terminalFontFamily || 'JetBrainsMono Nerd Font';
      const fontMap: Record<string, string> = {
        'Consolas': "'Consolas', monospace",
        'Menlo': "'Menlo', monospace",
        'Monaco': "'Monaco', monospace",
        'Courier New': "'Courier New', monospace",
        'FiraCode Nerd Font': "'FiraCode Nerd Font', 'Fira Code', monospace",
        'JetBrainsMono Nerd Font': "'JetBrainsMono Nerd Font', 'JetBrains Mono', monospace",
        'JetBrains Mono': "'JetBrainsMono Nerd Font', 'JetBrains Mono', monospace",
        'Meslo LG M Nerd Font': "'MesloLGM Nerd Font', 'Meslo LG M', monospace",
        'UbuntuMono Nerd Font': "'UbuntuMono Nerd Font', 'Ubuntu Mono', monospace",
      };
      options.fontFamily = fontMap[termFont] || (termFont.includes('monospace') ? termFont : `'${termFont}', monospace`);
    });

    ctx.extensionRegistry.pages.server.console.xterm.addAfterOpenHandler((term) => {
      (window as any).activeXterm = term;
      try {
        const s = (window as any).qunixThemeSettings || {};
        const termFont = s.terminal_font_family || s.terminalFontFamily || 'JetBrainsMono Nerd Font';
        const fontMap: Record<string, string> = {
          'Consolas': "'Consolas', monospace",
          'Menlo': "'Menlo', monospace",
          'Monaco': "'Monaco', monospace",
          'Courier New': "'Courier New', monospace",
          'FiraCode Nerd Font': "'FiraCode Nerd Font', 'Fira Code', monospace",
          'JetBrainsMono Nerd Font': "'JetBrainsMono Nerd Font', 'JetBrains Mono', monospace",
          'JetBrains Mono': "'JetBrainsMono Nerd Font', 'JetBrains Mono', monospace",
          'Meslo LG M Nerd Font': "'MesloLGM Nerd Font', 'Meslo LG M', monospace",
          'UbuntuMono Nerd Font': "'UbuntuMono Nerd Font', 'Ubuntu Mono', monospace",
        };
        const resolvedFont = fontMap[termFont] || (termFont.includes('monospace') ? termFont : `'${termFont}', monospace`);
        if (term && term.options) {
          term.options.fontFamily = resolvedFont;
        }
      } catch (_) { }

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
        try {
          localStorage.setItem('qunix_theme_settings', JSON.stringify(s));
        } catch (_) { }
        (window as any).qunixThemeSettings = s;
        window.dispatchEvent(new CustomEvent('qunix-settings-loaded', { detail: s }));

        const root = document.documentElement;
        const termFont = s.terminal_font_family || s.terminalFontFamily || 'JetBrainsMono Nerd Font';
        const fontMap: Record<string, string> = {
          'Consolas': "'Consolas', monospace",
          'Menlo': "'Menlo', monospace",
          'Monaco': "'Monaco', monospace",
          'Courier New': "'Courier New', monospace",
          'FiraCode Nerd Font': "'FiraCode Nerd Font', 'Fira Code', monospace",
          'JetBrainsMono Nerd Font': "'JetBrainsMono Nerd Font', 'JetBrains Mono', monospace",
          'JetBrains Mono': "'JetBrainsMono Nerd Font', 'JetBrains Mono', monospace",
          'Meslo LG M Nerd Font': "'MesloLGM Nerd Font', 'Meslo LG M', monospace",
          'UbuntuMono Nerd Font': "'UbuntuMono Nerd Font', 'Ubuntu Mono', monospace",
        };
        const resolvedFont = fontMap[termFont] || (termFont.includes('monospace') ? termFont : `'${termFont}', monospace`);
        root.style.setProperty('--ds-terminal-font-family', resolvedFont);

        // Apply to live xterm canvas if already open
        if ((window as any).activeXterm && (window as any).activeXterm.options) {
          (window as any).activeXterm.options.fontFamily = resolvedFont;
          try { (window as any).activeXterm.refresh(0, (window as any).activeXterm.rows - 1); } catch (_) { }
        }
        const fontFamily = s.font_family || s.fontFamily || 'JetBrains Mono';
        loadFontCSPFriendly(fontFamily);

        const eggBanners = s.egg_banners || s.eggBanners || {};
        for (const [eggUuid, bannerUrl] of Object.entries(eggBanners)) {
          if (bannerUrl) {
            root.style.setProperty(`--ds-egg-banner-${eggUuid}`, `url("${bannerUrl}")`);
          }
        }
      })
      .catch(() => {
        const cached = (window as any).qunixThemeSettings;
        if (cached) {
          window.dispatchEvent(new CustomEvent('qunix-settings-loaded', { detail: cached }));
        }
      });

    if (typeof window !== 'undefined') {
      let rafPending = false;
      let lastMouseEvent: MouseEvent | null = null;
      window.addEventListener('mousemove', (e) => {
        if (typeof window !== 'undefined' && window.location.pathname.includes('/server/')) return;
        if (document.documentElement.style.getPropertyValue('--ds-sidebar-animation') !== '1') return;
        lastMouseEvent = e;
        if (rafPending) return;
        rafPending = true;
        requestAnimationFrame(() => {
          rafPending = false;
          const ev = lastMouseEvent;
          if (!ev) return;
          const target = ev.target as HTMLElement;
          const card = target.closest('.mantine-NavLink-root') as HTMLElement;
          if (card) {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${ev.clientX - rect.left}px`);
            card.style.setProperty('--mouse-y', `${ev.clientY - rect.top}px`);
          }
        });
      });
    }
  }

  public initializeMantineTheme(_ctx: ExtensionContext): MantineThemeOverride {
    return {
      fontFamily: 'var(--ds-font-family), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontFamilyMonospace: 'monospace',
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
        fontFamily: 'var(--ds-font-family), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
    };
  }
}

export default new QunixThemeExtension();
