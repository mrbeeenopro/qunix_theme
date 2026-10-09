export interface HomeDashboardModule {
  id: string;
  name: string;
  source: 'Calagopus' | 'Qunix';
  sourceColor: string;
  description: string;
  iconName: string;
  enabled: boolean;
  width: number;
}

export const DEFAULT_HOME_MODULES: HomeDashboardModule[] = [
  {
    id: 'welcome',
    name: 'Welcome Header & Passkey Tip',
    source: 'Qunix',
    sourceColor: '#a855f7',
    description: 'Personalized greeting title and security passkey helper subtext banner.',
    iconName: 'tv',
    enabled: true,
    width: 12,
  },
  {
    id: 'quick_links',
    name: 'Quick Action Community Links',
    source: 'Qunix',
    sourceColor: '#38bdf8',
    description: 'Community action cards: Billing, Discord, Website, and Contact Support.',
    iconName: 'credit-card',
    enabled: true,
    width: 12,
  },
  {
    id: 'toolbar',
    name: 'Server Filter & Search Toolbar',
    source: 'Qunix',
    sourceColor: '#38bdf8',
    description: 'Navigation tabs, search box, user toggle, and grid/list switch.',
    iconName: 'sliders',
    enabled: true,
    width: 12,
  },
  {
    id: 'servers',
    name: 'Server Cards Grid / List',
    source: 'Qunix',
    sourceColor: '#a855f7',
    description: 'Draggable server cards with CPU/RAM/Disk stats, status badge, and IP.',
    iconName: 'server',
    enabled: true,
    width: 12,
  },
];

export interface DashboardModule {
  id: string;
  name: string;
  source: 'Calagopus' | 'Qunix';
  sourceColor: string;
  description: string;
  iconName: string;
  enabled: boolean;
  width: number; // 12 = full, 8 = 2/3, 6 = half, 4 = 1/3
}

export const DEFAULT_DASHBOARD_MODULES: DashboardModule[] = [
  {
    id: 'hero_header',
    name: 'Server Header & Power Actions',
    source: 'Qunix',
    sourceColor: '#a855f7',
    description: 'Server name, status badge, allocation IP, and Start/Restart/Stop/Kill action buttons.',
    iconName: 'server',
    enabled: true,
    width: 12,
  },
  {
    id: 'metrics_stats',
    name: 'System Metrics (CPU, RAM, Disk, Net)',
    source: 'Calagopus',
    sourceColor: '#38bdf8',
    description: '4 responsive metric cards for CPU Load, Memory, Disk Space, and Network Bandwidth.',
    iconName: 'microchip',
    enabled: true,
    width: 12,
  },
  {
    id: 'management_shortcuts',
    name: 'Management Shortcuts',
    source: 'Qunix',
    sourceColor: '#a855f7',
    description: '8 quick navigation tiles: Console, Files, Databases, Backups, Network, Schedules, Startup, Settings.',
    iconName: 'sliders',
    enabled: true,
    width: 12,
  },
  {
    id: 'sftp_details',
    name: 'SFTP Connection Details',
    source: 'Calagopus',
    sourceColor: '#38bdf8',
    description: 'SFTP server host, connection port, username, password hint, and Open SFTP action.',
    iconName: 'shield',
    enabled: true,
    width: 6,
  },
  {
    id: 'environment_specs',
    name: 'Environment & Specifications',
    source: 'Calagopus',
    sourceColor: '#38bdf8',
    description: 'Host node, Template/Egg, Docker image, Server identifier UUID, and Launch Console link.',
    iconName: 'layer-group',
    enabled: true,
    width: 6,
  },
  {
    id: 'terminal_console',
    name: 'Console Terminal (xterm.js)',
    source: 'Calagopus',
    sourceColor: '#38bdf8',
    description: 'Live interactive Calagopus server console and command input powered by xterm.js.',
    iconName: 'terminal',
    enabled: true,
    width: 12,
  },
  {
    id: 'network_chart',
    name: 'Network Traffic Area Chart (24h)',
    source: 'Qunix',
    sourceColor: '#38bdf8',
    description: 'Mantine AreaChart displaying 24-hour historical inbound & outbound bandwidth with localStorage persistence.',
    iconName: 'network-wired',
    enabled: false,
    width: 12,
  },
];

export interface ConsoleModule {
  id: string;
  name: string;
  source: 'Calagopus' | 'Qunix';
  sourceColor: string;
  description: string;
  iconName: string;
  enabled: boolean;
  width: number; // 12, 8, 6, 4
  height?: number; // Custom height in px
}

export const DEFAULT_CONSOLE_MODULES: ConsoleModule[] = [
  {
    id: 'console_infobar',
    name: 'Infobar & Power Controls',
    source: 'Qunix',
    sourceColor: '#a855f7',
    description: 'Server name, status badge, uptime indicator, and Start/Restart/Stop/Kill action buttons.',
    iconName: 'server',
    enabled: true,
    width: 12,
  },
  {
    id: 'console_terminal',
    name: 'Interactive Terminal (xterm.js)',
    source: 'Calagopus',
    sourceColor: '#38bdf8',
    description: 'Live interactive server terminal console and command bar powered by xterm.js.',
    iconName: 'terminal',
    enabled: true,
    width: 8,
  },
  {
    id: 'server_details',
    name: 'Server Details & Specs',
    source: 'Calagopus',
    sourceColor: '#38bdf8',
    description: 'Node name, IP allocation, SFTP host/port, template egg, and Docker image specs.',
    iconName: 'layer-group',
    enabled: true,
    width: 4,
  },
  {
    id: 'server_stats',
    name: 'Resource Statistics & Charts',
    source: 'Calagopus',
    sourceColor: '#38bdf8',
    description: 'Real-time CPU, Memory, Disk space, and Network bandwidth utilization sparklines.',
    iconName: 'microchip',
    enabled: true,
    width: 12,
  },
  {
    id: 'qunix_metrics_grid',
    name: 'Qunix 4-Stat Metrics Cards',
    source: 'Qunix',
    sourceColor: '#a855f7',
    description: 'Modern flat stat cards with progress indicators for CPU, Memory, Disk, and Network.',
    iconName: 'microchip',
    enabled: false,
    width: 12,
  },
  {
    id: 'qunix_quick_actions',
    name: 'Qunix Navigation Shortcuts',
    source: 'Qunix',
    sourceColor: '#a855f7',
    description: 'Direct shortcut navigation buttons to Files, Backups, Databases, Schedules, Users, and Settings.',
    iconName: 'sliders',
    enabled: false,
    width: 12,
  },
  {
    id: 'sftp_details',
    name: 'SFTP Connection Details',
    source: 'Calagopus',
    sourceColor: '#38bdf8',
    description: 'SFTP host, connection port, username, password hint, and Open SFTP action.',
    iconName: 'shield',
    enabled: false,
    width: 6,
  },
  {
    id: 'environment_specs',
    name: 'Environment & Specifications',
    source: 'Calagopus',
    sourceColor: '#38bdf8',
    description: 'Host node, Template/Egg, Docker image, Server identifier UUID, and Launch Console link.',
    iconName: 'layer-group',
    enabled: false,
    width: 6,
  },
  {
    id: 'hero_banner',
    name: 'Server Header Banner (Egg Art & Badges)',
    source: 'Qunix',
    sourceColor: '#a855f7',
    description: 'Rich graphic server banner featuring egg artwork, server description, ping, and status indicators.',
    iconName: 'server',
    enabled: false,
    width: 12,
  },
  {
    id: 'compact_sparklines',
    name: 'Compact Metrics Sparklines',
    source: 'Calagopus',
    sourceColor: '#38bdf8',
    description: 'High-density horizontal sparkline gauges showing live CPU, memory, disk, and network stats.',
    iconName: 'microchip',
    enabled: false,
    width: 12,
  },
  {
    id: 'quick_links_widget',
    name: 'Quick Action Buttons / Links',
    source: 'Qunix',
    sourceColor: '#a855f7',
    description: 'Custom community & navigation buttons (Billing, Discord, Website, Support ticket).',
    iconName: 'sliders',
    enabled: false,
    width: 12,
  },
];

export const loadSavedDashboardLayout = (): DashboardModule[] => {
  try {
    const s = (window as any).qunixThemeSettings;
    const raw = s?.custom_dashboard_layout || localStorage.getItem('qunix_custom_dashboard_layout');
    if (raw && raw.trim().length > 2) {
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.dashboard)
        ? parsed.dashboard
        : null;

      if (list && list.length > 0) {
        const map = new Map<string, any>(list.map((p: any) => [p.id, p]));
        return DEFAULT_DASHBOARD_MODULES.map((def) => {
          const saved = map.get(def.id);
          return saved ? { ...def, ...saved } : def;
        }).sort((a, b) => {
          const idxA = list.findIndex((p: any) => p.id === a.id);
          const idxB = list.findIndex((p: any) => p.id === b.id);
          if (idxA === -1) return 1;
          if (idxB === -1) return -1;
          return idxA - idxB;
        });
      }
    }
  } catch (_) {}
  return DEFAULT_DASHBOARD_MODULES;
};

export const loadSavedConsoleLayout = (): ConsoleModule[] => {
  try {
    const s = (window as any).qunixThemeSettings;
    const raw = s?.custom_dashboard_layout || localStorage.getItem('qunix_custom_console_layout');
    if (raw && raw.trim().length > 2) {
      const parsed = JSON.parse(raw);
      let list: any = null;
      if (!Array.isArray(parsed) && Array.isArray(parsed?.console)) {
        list = parsed.console;
      } else {
        const localRaw = localStorage.getItem('qunix_custom_console_layout');
        if (localRaw) {
          try {
            const lp = JSON.parse(localRaw);
            if (Array.isArray(lp)) list = lp;
          } catch (_) {}
        }
      }

      if (list && list.length > 0) {
        const map = new Map<string, any>(list.map((p: any) => [p.id, p]));
        return DEFAULT_CONSOLE_MODULES.map((def) => {
          const saved = map.get(def.id);
          return saved ? { ...def, ...saved } : def;
        }).sort((a, b) => {
          const idxA = list.findIndex((p: any) => p.id === a.id);
          const idxB = list.findIndex((p: any) => p.id === b.id);
          if (idxA === -1) return 1;
          if (idxB === -1) return -1;
          return idxA - idxB;
        });
      }
    }
  } catch (_) {}
  return DEFAULT_CONSOLE_MODULES;
};

export const loadSavedHomeDashboardLayout = (): HomeDashboardModule[] => {
  try {
    const s = (window as any).qunixThemeSettings;
    const raw = s?.custom_dashboard_layout || localStorage.getItem('qunix_dashboard_section_order');
    if (raw && raw.trim().length > 2) {
      const parsed = JSON.parse(raw);
      let list: any = null;
      if (Array.isArray(parsed?.main_dashboard)) {
        list = parsed.main_dashboard;
      } else if (Array.isArray(parsed)) {
        list = parsed;
      }

      if (list && list.length > 0) {
        const map = new Map<string, any>(
          list.map((p: any) => [typeof p === 'string' ? p : p.id, typeof p === 'string' ? { id: p, enabled: true } : p])
        );
        return DEFAULT_HOME_MODULES.map((def) => {
          const saved = map.get(def.id);
          return saved ? { ...def, ...saved } : def;
        }).sort((a, b) => {
          const idxA = list.findIndex((p: any) => (typeof p === 'string' ? p : p.id) === a.id);
          const idxB = list.findIndex((p: any) => (typeof p === 'string' ? p : p.id) === b.id);
          if (idxA === -1) return 1;
          if (idxB === -1) return -1;
          return idxA - idxB;
        });
      }
    }
  } catch (_) {}
  return DEFAULT_HOME_MODULES;
};

export const getColSpanClass = (width: number): string => {
  switch (width) {
    case 12:
      return 'col-span-12';
    case 8:
      return 'col-span-12 lg:col-span-8';
    case 6:
      return 'col-span-12 lg:col-span-6';
    case 4:
      return 'col-span-12 lg:col-span-4 sm:col-span-6';
    default:
      return 'col-span-12';
  }
};
