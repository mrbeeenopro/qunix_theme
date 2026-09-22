import React, { useState } from 'react';
import { Select, Stack, Group, TextInput, Grid, Divider, Modal, Button, SimpleGrid, ScrollArea, NumberInput, Switch } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { z } from 'zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faColumns,
  faIcons,
  faInfoCircle,
  faSearch,
  faMousePointer,
  faChevronRight,
  faRuler,
  faMagic,
  faWindowMaximize,
} from '@fortawesome/free-solid-svg-icons';
import { qunixThemeSettingsSchema } from '../../lib/schemas.ts';
import DynamicIcon from '../theme/DynamicIcon.tsx';
import { ColorField } from './ColorField.tsx';
import { HEROICONS_LIST, MDI_LIST, LINEICONS_LIST, FONTAWESOME_LIST } from './IconList.ts';
import { useExtTranslations } from '../../translations.ts';
import { useGlobalStore } from '@/stores/global.ts';
import { axiosInstance } from '@/api/axios.ts';

const SIDEBAR_ITEMS = [
  { key: 'servers', label: 'Servers Dashboard' },
  { key: 'admin', label: 'Admin Panel' },
  { key: 'account', label: 'User Account' },
  { key: 'security_keys', label: 'Security Keys' },
  { key: 'api_keys', label: 'API Keys' },
  { key: 'ssh_keys', label: 'SSH Keys' },
  { key: 'snippets', label: 'Command Snippets' },
  { key: 'oauth', label: 'OAuth Links' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'shortcuts', label: 'Keyboard Shortcuts' },
  { key: 'activity', label: 'Account Activity' },
];

const SERVER_SIDEBAR_ITEMS = [
  { key: 'server_console', label: 'Server Console' },
  { key: 'server_files', label: 'File Manager' },
  { key: 'server_databases', label: 'Databases' },
  { key: 'server_schedules', label: 'Schedules' },
  { key: 'server_users', label: 'Subusers' },
  { key: 'server_backups', label: 'Backups' },
  { key: 'server_network', label: 'Network Allocations' },
  { key: 'server_startup', label: 'Startup Parameters' },
  { key: 'server_mounts', label: 'Server Mounts' },
  { key: 'server_activity', label: 'Server Activity' },
  { key: 'server_settings', label: 'Server Settings' },
];

const ADMIN_SUB_ITEMS = [
  { key: 'admin_settings', label: 'Admin: Settings' },
  { key: 'admin_announcements', label: 'Admin: Announcements' },
  { key: 'admin_assets', label: 'Admin: Assets' },
  { key: 'admin_extensions', label: 'Admin: Extensions' },
  { key: 'admin_users', label: 'Admin: Users' },
  { key: 'admin_locations', label: 'Admin: Locations' },
  { key: 'admin_nodes', label: 'Admin: Nodes' },
  { key: 'admin_servers', label: 'Admin: Servers' },
  { key: 'admin_nests', label: 'Admin: Nests' },
  { key: 'admin_egg_configurations', label: 'Admin: Egg Configurations' },
  { key: 'admin_egg_repositories', label: 'Admin: Egg Repositories' },
  { key: 'admin_database_hosts', label: 'Admin: Database Hosts' },
  { key: 'admin_database_agent_hosts', label: 'Admin: Database Agent Hosts' },
  { key: 'admin_database_agent_templates', label: 'Admin: Database Agent Templates' },
  { key: 'admin_oauth_providers', label: 'Admin: OAuth Providers' },
  { key: 'admin_backup_configurations', label: 'Admin: Backup Configurations' },
  { key: 'admin_mounts', label: 'Admin: Mounts' },
  { key: 'admin_roles', label: 'Admin: Roles' },
  { key: 'admin_activity', label: 'Admin: Activity' },
];

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
  {
    value: 'grow',
    label: 'Grow Scale Effect',
    description: 'Sidebar items scale up and shift smoothly on hover.',
    svg: (
      <svg width='80' height='60' viewBox='0 0 80 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='80' height='60' rx='6' fill='#1e1631' stroke='rgba(255,255,255,0.06)' strokeWidth='1.5' />
        <rect x='5' y='5' width='20' height='50' rx='3' fill='#161025' />
        <rect x='8' y='10' width='14' height='6' rx='2' fill='rgba(255,255,255,0.2)' />
        <rect x='7' y='20' width='16' height='7' rx='3' fill='#6c5ce7' />
        <rect x='8' y='31' width='14' height='6' rx='2' fill='rgba(255,255,255,0.2)' />
      </svg>
    ),
  },
];

interface SidebarSettingsProps {
  form: UseFormReturnType<z.infer<typeof qunixThemeSettingsSchema>>;
  extensions?: any[];
}

export function SidebarSettings({ form, extensions = [] }: SidebarSettingsProps) {
  const { t: tExt } = useExtTranslations();
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    dashboard: true,
    admin: false,
    server: false,
    extensions: false,
  });

  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const sidebarIcons = form.values.sidebar_icons || {};

  // Auto-detect extension items & routes
  const autoExtensionItems = React.useMemo(() => {
    const itemsMap = new Map<string, string>();

    if (Array.isArray(extensions)) {
      extensions.forEach((ext: any) => {
        const pkgName = ext.packageName || ext.metadataToml?.packageName;
        if (pkgName) {
          const path = `/admin/extensions/${pkgName}`;
          const name = ext.metadataToml?.name || ext.name || pkgName;
          itemsMap.set(path, `Extension: ${name}`);
        }
      });
    }

    const extCtx = (window as any).extensionContext;
    if (extCtx?.extensionRegistry?.routes) {
      const r = extCtx.extensionRegistry.routes;
      if (Array.isArray(r.adminRoutes)) {
        r.adminRoutes.forEach((route: any) => {
          if (route.path) {
            const fullPath = route.path.startsWith('/admin') ? route.path : `/admin/${route.path.replace(/^\//, '')}`;
            const labelStr = typeof route.name === 'function' ? route.name() : (route.name || fullPath);
            itemsMap.set(fullPath, `Admin Route: ${labelStr}`);
          }
        });
      }
      if (Array.isArray(r.serverRoutes)) {
        r.serverRoutes.forEach((route: any) => {
          if (route.path) {
            const fullPath = route.path.startsWith('/server') ? route.path : `/server/:id/${route.path.replace(/^\//, '')}`;
            const labelStr = typeof route.name === 'function' ? route.name() : (route.name || fullPath);
            itemsMap.set(fullPath, `Server Route: ${labelStr}`);
          }
        });
      }
      if (Array.isArray(r.accountRoutes)) {
        r.accountRoutes.forEach((route: any) => {
          if (route.path) {
            const fullPath = route.path.startsWith('/account') ? route.path : `/account/${route.path.replace(/^\//, '')}`;
            const labelStr = typeof route.name === 'function' ? route.name() : (route.name || fullPath);
            itemsMap.set(fullPath, `Account Route: ${labelStr}`);
          }
        });
      }
      if (Array.isArray(r.clientRoutes)) {
        r.clientRoutes.forEach((route: any) => {
          if (route.path) {
            const fullPath = route.path.startsWith('/') ? route.path : `/${route.path}`;
            const labelStr = typeof route.name === 'function' ? route.name() : (route.name || fullPath);
            itemsMap.set(fullPath, `Dashboard Route: ${labelStr}`);
          }
        });
      }
      if (Array.isArray(r.dashboardRoutes)) {
        r.dashboardRoutes.forEach((route: any) => {
          if (route.path) {
            const fullPath = route.path.startsWith('/') ? route.path : `/${route.path}`;
            const labelStr = typeof route.name === 'function' ? route.name() : (route.name || fullPath);
            itemsMap.set(fullPath, `Dashboard Route: ${labelStr}`);
          }
        });
      }
    }

    return Array.from(itemsMap.entries()).map(([key, label]) => ({ key, label }));
  }, [extensions]);

  // Icon Picker States
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeItemKey, setActiveItemKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProvider, setActiveProvider] = useState<'heroicons' | 'mdi' | 'lineicons' | 'lucide' | 'fontawesome'>('heroicons');
  const [activeStyle, setActiveStyle] = useState<'outline' | 'solid'>('outline');
  const [newRoutePath, setNewRoutePath] = useState('');
  const [customRouteList, setCustomRouteList] = useState<string[]>(() => {
    const defaultKeys = new Set([
      ...SIDEBAR_ITEMS.map((i) => i.key),
      ...SERVER_SIDEBAR_ITEMS.map((i) => i.key),
      ...ADMIN_SUB_ITEMS.map((i) => i.key),
    ]);
    return Object.keys(sidebarIcons).filter((k) => !defaultKeys.has(k));
  });

  // Auto-fetch redirects from store, admin settings, egg configurations, and current sidebarIcons
  const userRouteOrder = useGlobalStore((state: any) => state.settings?.user?.routeOrder);
  const [fetchedRedirects, setFetchedRedirects] = useState<Array<{ key: string; label: string }>>([]);

  React.useEffect(() => {
    let isMounted = true;

    const fetchAllRedirects = async () => {
      const redirectMap = new Map<string, string>();

      // 1. User routeOrder from globalStore
      if (Array.isArray(userRouteOrder)) {
        userRouteOrder.forEach((item: any) => {
          if (item?.type === 'redirect') {
            const name = item.name || 'Unnamed Redirect';
            const dest = item.destination || '';
            const key = item.name ? `redirect:${item.name}` : dest;
            if (key) {
              redirectMap.set(key, `Redirect: ${name}${dest ? ` (${dest})` : ''}`);
            }
          }
        });
      }

      // 2. Fetch admin settings (user.routeOrder)
      try {
        const res = await axiosInstance.get('/api/admin/settings');
        const settings = res.data?.settings;
        const ro = settings?.user?.routeOrder;
        if (Array.isArray(ro)) {
          ro.forEach((item: any) => {
            if (item?.type === 'redirect') {
              const name = item.name || 'Unnamed Redirect';
              const dest = item.destination || '';
              const key = item.name ? `redirect:${item.name}` : dest;
              if (key) {
                redirectMap.set(key, `Redirect: ${name}${dest ? ` (${dest})` : ''}`);
              }
            }
          });
        }
      } catch (_) {}

      // 3. Fetch egg configurations
      try {
        const res = await axiosInstance.get('/api/admin/egg-configurations');
        const list = res.data?.eggConfigurations || res.data?.items || (Array.isArray(res.data) ? res.data : []);
        if (Array.isArray(list)) {
          list.forEach((eggConfig: any) => {
            if (Array.isArray(eggConfig.routeOrder)) {
              eggConfig.routeOrder.forEach((item: any) => {
                if (item?.type === 'redirect') {
                  const name = item.name || 'Egg Redirect';
                  const dest = item.destination || '';
                  const key = item.name ? `redirect:${item.name}` : dest;
                  if (key) {
                    redirectMap.set(key, `Egg Redirect: ${name}${dest ? ` (${dest})` : ''}`);
                  }
                }
              });
            }
          });
        }
      } catch (_) {}

      // 4. Scan current sidebarIcons for existing redirects or URLs
      Object.keys(sidebarIcons).forEach((k) => {
        if (k.startsWith('redirect:') || k.startsWith('http://') || k.startsWith('https://')) {
          if (!redirectMap.has(k)) {
            const cleanName = k.replace(/^redirect:/, '');
            redirectMap.set(k, `Redirect: ${cleanName}`);
          }
        }
      });

      if (isMounted) {
        setFetchedRedirects(
          Array.from(redirectMap.entries()).map(([key, label]) => ({ key, label }))
        );
      }
    };

    fetchAllRedirects();

    return () => {
      isMounted = false;
    };
  }, [userRouteOrder]);

  const parseIconString = (iconStr: string | undefined) => {
    if (!iconStr) return { pack: 'default', name: '', style: 'outline' as 'outline' | 'solid' };
    if (iconStr.startsWith('fa:') || iconStr.startsWith('fontawesome:') || iconStr.startsWith('fa6-solid:')) {
      const rest = iconStr.replace(/^fa:/, '').replace(/^fontawesome:/, '').replace(/^fa6-solid:/, '');
      return { pack: 'fontawesome', name: rest, style: 'solid' as 'outline' | 'solid' };
    }

    const [pack, rest] = iconStr.split(':');
    if (rest === undefined) return { pack: 'default', name: '', style: 'outline' as 'outline' | 'solid' };

    let name = rest;
    let style: 'outline' | 'solid' = 'outline';

    if (pack === 'heroicons' || pack === 'heroicons-outline' || pack === 'heroicons-solid') {
      if (rest.endsWith('-solid') || pack === 'heroicons-solid') {
        name = rest.replace(/-solid$/, '');
        style = 'solid';
      } else {
        name = rest.replace(/-outline$/, '');
        style = 'outline';
      }
      return { pack: 'heroicons', name, style };
    }

    if (pack === 'mdi') {
      if (rest.endsWith('-outline')) {
        name = rest.slice(0, -8);
        style = 'outline';
      } else {
        name = rest.replace(/-filled$/, '');
        style = 'solid';
      }
      return { pack: 'mdi', name, style };
    }

    if (pack === 'lineicons') {
      if (rest.endsWith('-filled') || rest.endsWith('-solid')) {
        name = rest.replace(/-filled$/, '').replace(/-solid$/, '');
        style = 'solid';
      } else {
        name = rest.replace(/-outline$/, '');
        style = 'outline';
      }
      return { pack: 'lineicons', name, style };
    }

    return { pack, name: rest, style: 'outline' as 'outline' | 'solid' };
  };

  const serializeIcon = (pack: string, name: string, style: string): string => {
    if (pack === 'default') return '';

    const cleanName = name ? name.trim().toLowerCase() : '';
    if (!cleanName) return '';

    if (pack === 'fontawesome' || pack === 'fa' || pack === 'fa6-solid') {
      return `fa:${cleanName}`;
    }
    if (pack === 'heroicons') {
      return style === 'solid' ? `heroicons:${cleanName}-solid` : `heroicons:${cleanName}`;
    }
    if (pack === 'mdi') {
      return style === 'outline' ? `mdi:${cleanName}-outline` : `mdi:${cleanName}`;
    }
    if (pack === 'lineicons') {
      return style === 'solid' ? `lineicons:${cleanName}-filled` : `lineicons:${cleanName}`;
    }

    return `${pack}:${cleanName}`;
  };

  const ITEM_DEFAULT_ICONS: Record<string, string> = {
    servers: 'server',
    admin: 'cog',
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
    server_mounts: 'folder-tree',
    server_activity: 'clock',
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
    admin_egg_configurations: 'cog',
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

  const handleIconChange = (key: string, field: 'pack' | 'name' | 'style', value: string) => {
    const iconStr = sidebarIcons[key] || '';
    const parsed = parseIconString(iconStr);
    (parsed as any)[field] = value;

    if (field === 'pack' && value !== 'default' && !parsed.name) {
      parsed.name = ITEM_DEFAULT_ICONS[key] || 'server';
    }

    const serialized = serializeIcon(parsed.pack, parsed.name, parsed.style);

    const newIcons = { ...sidebarIcons };
    if (serialized) {
      newIcons[key] = serialized;
    } else {
      delete newIcons[key];
    }
    form.setFieldValue('sidebar_icons', newIcons);
  };

  const openPicker = (key: string) => {
    const iconStr = sidebarIcons[key] || '';
    const parsed = parseIconString(iconStr);
    setActiveItemKey(key);
    setActiveProvider(parsed.pack === 'default' ? 'fontawesome' : (parsed.pack as any));
    setActiveStyle(parsed.style);
    setSearchQuery('');
    setPickerOpen(true);
  };

  const selectIconFromPicker = (iconName: string) => {
    if (!activeItemKey) return;
    const serialized = serializeIcon(activeProvider, iconName, activeStyle);

    const newIcons = { ...sidebarIcons };
    if (serialized) {
      newIcons[activeItemKey] = serialized;
    } else {
      delete newIcons[activeItemKey];
    }
    form.setFieldValue('sidebar_icons', newIcons);
    setPickerOpen(false);
  };

  const getProviderIconList = () => {
    if (activeProvider === 'fontawesome') return FONTAWESOME_LIST;
    if (activeProvider === 'heroicons') return HEROICONS_LIST;
    if (activeProvider === 'mdi') return MDI_LIST;
    if (activeProvider === 'lucide') return HEROICONS_LIST;
    return LINEICONS_LIST;
  };

  const getFullIconName = (name: string) => {
    return serializeIcon(activeProvider, name, activeStyle);
  };

  const filteredIcons = getProviderIconList()
    .filter((name) => name.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 120);

  const renderIconRow = (item: { key: string; label: string }) => {
    const iconStr = sidebarIcons[item.key] || '';
    const parsed = parseIconString(iconStr);

    return (
      <div
        key={item.key}
        style={{
          background: '#0a0a0c',
          border: '1px solid #1c1c21',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '8px',
        }}
      >
        <Group justify='space-between' align='center' mb='xs'>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#e4e4e7' }}>{item.label}</span>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ds-primary-color, #7aa2f7)',
            }}
          >
            <DynamicIcon icon={iconStr} style={{ fontSize: '15px' }} />
          </div>
        </Group>

        <Grid>
          <Grid.Col span={6}>
            <Select
              comboboxProps={{ withinPortal: true, zIndex: 10000 }}
              placeholder='Pack'
              value={parsed.pack}
              onChange={(val) => handleIconChange(item.key, 'pack', val || 'default')}
              data={[
                { value: 'default', label: 'Default' },
                { value: 'fontawesome', label: 'FontAwesome' },
                { value: 'heroicons', label: 'Heroicons' },
                { value: 'mdi', label: 'MUI Icons' },
                { value: 'lineicons', label: 'Lineicons' },
                { value: 'lucide', label: 'Lucide Icons' },
              ]}
              styles={{
                input: { background: '#141418', border: '1px solid #27272a', color: '#e4e4e7', fontSize: '11px', height: '28px' },
                dropdown: { background: '#141418', border: '1px solid #27272a' },
                option: { color: '#e4e4e7', fontSize: '11px' },
              }}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              comboboxProps={{ withinPortal: true, zIndex: 10000 }}
              placeholder='Style'
              value={parsed.style}
              disabled={parsed.pack === 'default'}
              onChange={(val) => handleIconChange(item.key, 'style', val || 'outline')}
              data={[
                { value: 'outline', label: 'Outline' },
                { value: 'solid', label: 'Solid' },
              ]}
              styles={{
                input: { background: '#141418', border: '1px solid #27272a', color: '#e4e4e7', fontSize: '11px', height: '28px' },
                dropdown: { background: '#141418', border: '1px solid #27272a' },
                option: { color: '#e4e4e7', fontSize: '11px' },
              }}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Group gap='xs' align='center' style={{ width: '100%' }}>
              <TextInput
                placeholder='Icon Name'
                value={parsed.name}
                disabled={parsed.pack === 'default'}
                onChange={(e) => handleIconChange(item.key, 'name', e.currentTarget.value)}
                style={{ flex: 1 }}
                styles={{
                  input: { background: '#141418', border: '1px solid #27272a', color: '#e4e4e7', fontSize: '11px', height: '28px' },
                }}
              />
              <Button
                variant='light'
                color='blue'
                onClick={() => openPicker(item.key)}
                style={{ width: '32px', minWidth: '32px', height: '28px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title='Choose Icon visually'
              >
                <FontAwesomeIcon icon={faMousePointer} style={{ fontSize: '11px' }} />
              </Button>
            </Group>
          </Grid.Col>
        </Grid>
      </div>
    );
  };

  return (
    <>
      <Stack gap='md'>
        {/* 1. Sidebar Dimensions, Sizing & Toggles */}
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
            <FontAwesomeIcon icon={faRuler} style={{ marginRight: '6px' }} />
            Sidebar Dimensions & Spacing
          </span>
          <Stack gap='sm'>
            <Group grow>
              <NumberInput
                label='Sidebar Width (px)'
                min={150}
                max={400}
                {...form.getInputProps('sidebar_width')}
              />
              <NumberInput
                label='Item Radius (px)'
                min={0}
                max={50}
                {...form.getInputProps('sidebar_radius')}
              />
              <NumberInput
                label='Active Item Radius (px)'
                min={0}
                max={50}
                {...form.getInputProps('sidebar_active_radius')}
              />
            </Group>
            <Group grow>
              <NumberInput
                label='Link Height (px)'
                min={20}
                max={100}
                {...form.getInputProps('sidebar_item_height')}
              />
              <NumberInput
                label='Item Gap (px)'
                min={0}
                max={100}
                {...form.getInputProps('sidebar_item_gap')}
              />
              <NumberInput
                label='Sidebar Blur (px)'
                min={0}
                max={50}
                {...form.getInputProps('sidebar_blur')}
              />
            </Group>

            <Group grow mt="xs">
              <Switch
                label={tExt('admin.sidebar.hidePowerActions', {})}
                checked={!!form.values.hide_sidebar_power_actions}
                onChange={(event) => form.setFieldValue('hide_sidebar_power_actions', event.currentTarget.checked)}
                styles={{
                  label: { color: '#e2e8f0', fontSize: '11px', fontWeight: 600 },
                }}
              />
              <Switch
                label={tExt('admin.sidebar.pageTitleIcons', {})}
                checked={form.values.page_title_icon !== false}
                onChange={(event) => form.setFieldValue('page_title_icon', event.currentTarget.checked)}
                styles={{
                  label: { color: '#e2e8f0', fontSize: '11px', fontWeight: 600 },
                }}
              />
            </Group>
          </Stack>
        </div>

        <Divider my="sm" color="#111114" />

        {/* 2. Sidebar Hover Animation Style */}
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
            <FontAwesomeIcon icon={faMagic} style={{ marginRight: '6px' }} />
            Sidebar Hover Animation Style
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {HOVER_STYLES.map((style) => {
              const isIconsOnly = form.values.sidebar_style === 'icons';
              const isSelected = isIconsOnly
                ? style.value === 'none'
                : form.values.sidebar_hover_style === style.value;
              return (
                <div
                  key={style.value}
                  onClick={() => {
                    if (isIconsOnly) return;
                    form.setFieldValue('sidebar_hover_style', style.value);
                  }}
                  style={{
                    background: '#0a0a0c',
                    border: isSelected ? '2px solid #6c5ce7' : '1px solid #222228',
                    borderRadius: '8px',
                    padding: '8px',
                    cursor: isIconsOnly ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 0 10px rgba(108, 92, 231, 0.15)' : 'none',
                    opacity: isIconsOnly && style.value !== 'none' ? 0.35 : 1,
                  }}
                >
                  <div style={{ transform: 'scale(0.85)', margin: '-4px 0' }}>{style.svg}</div>
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{ fontSize: '10px', fontWeight: 600, color: isSelected ? '#a29bfe' : '#e2e8f0' }}
                    >
                      {style.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Switch
            label='Hover Glow Click Animations'
            mt='sm'
            checked={form.values.sidebar_animation}
            onChange={(event) => form.setFieldValue('sidebar_animation', event.currentTarget.checked)}
            styles={{
              label: { color: '#e2e8f0', fontSize: '11px' },
            }}
          />

          {form.values.sidebar_hover_style === 'grow' && (
            <div style={{ marginTop: '14px', background: '#0d0d11', padding: '12px', borderRadius: '8px', border: '1px solid #1e1e24' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#a29bfe', display: 'block', marginBottom: '8px' }}>
                Grow Scale Hover Custom Colors
              </span>
              <Stack gap='sm'>
                <ColorField label='Grow Hover Background (Dark)' {...form.getInputProps('sidebar_grow_bg')} />
                <ColorField label='Grow Hover Background (Light)' {...form.getInputProps('light_sidebar_grow_bg')} />
                <ColorField label='Grow Hover Text Color (Dark)' {...form.getInputProps('sidebar_grow_text_color')} />
                <ColorField label='Grow Hover Text Color (Light)' {...form.getInputProps('light_sidebar_grow_text_color')} />
                <ColorField label='Grow Hover Accent Border (Dark)' {...form.getInputProps('sidebar_grow_border_color')} />
                <ColorField label='Grow Hover Accent Border (Light)' {...form.getInputProps('light_sidebar_grow_border_color')} />
              </Stack>
            </div>
          )}
        </div>

        <Divider my="sm" color="#111114" />

        {/* 3. Global Icon Pack Selector */}
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
            <FontAwesomeIcon icon={faIcons} style={{ marginRight: '6px' }} />
            Global Icon Pack
          </span>
          <Select
            comboboxProps={{ withinPortal: true, zIndex: 10000 }}
            placeholder="Default (FontAwesome)"
            {...form.getInputProps('sidebar_global_pack')}
            data={[
              { value: 'default', label: 'Default (FontAwesome / Native Panel)' },
              { value: 'heroicons', label: 'Heroicons (heroicons.com)' },
              { value: 'mdi', label: 'MUI Icons (Material UI / mui.com)' },
              { value: 'lineicons', label: 'Lineicons (lineicons.com)' },
              { value: 'lucide', label: 'Lucide Icons (lucide.dev)' },
            ]}
            styles={{
              input: { background: '#141418', border: '1px solid #27272a', color: '#e4e4e7' },
              dropdown: { background: '#141418', border: '1px solid #27272a' },
              option: { color: '#e4e4e7' },
            }}
          />
        </div>

        {/* 4. Custom Icons Configurator */}
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
            <FontAwesomeIcon icon={faIcons} style={{ marginRight: '6px' }} />
            Sidebar Custom Icons & Extension Routes
          </span>
          <span
            style={{
              fontSize: '11px',
              color: '#71717a',
              display: 'block',
              marginBottom: '16px',
              lineHeight: '1.4',
            }}
          >
            <FontAwesomeIcon icon={faInfoCircle} style={{ marginRight: '4px' }} />
            Choose an icon pack, pick an icon graphically, or add custom extension routes below:
          </span>

          {/* Category Accordions */}
          {(() => {
            const renderCategoryHeader = (catKey: string, titleStr: string) => {
              const isOpen = !!openCategories[catKey];
              return (
                <div
                  onClick={() => toggleCategory(catKey)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: '#121216',
                    border: '1px solid #27272a',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    margin: '14px 0 8px 0',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#1a1a22')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#121216')}
                >
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#e4e4e7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{titleStr}</span>
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      style={{
                        fontSize: '10px',
                        color: isOpen ? '#7aa2f7' : '#71717a',
                        transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </span>
                  <span style={{ fontSize: '10px', color: '#71717a' }}>{isOpen ? 'Collapse' : 'Expand'}</span>
                </div>
              );
            };

            return (
              <>
                {renderCategoryHeader('dashboard', 'Dashboard Navigation')}
                {openCategories.dashboard && SIDEBAR_ITEMS.map(renderIconRow)}

                {renderCategoryHeader('admin', 'Admin Sub-Navigation')}
                {openCategories.admin && ADMIN_SUB_ITEMS.map(renderIconRow)}

                {renderCategoryHeader('server', 'Server Console Navigation')}
                {openCategories.server && SERVER_SIDEBAR_ITEMS.map(renderIconRow)}

                {renderCategoryHeader('extensions', 'Extension & Redirect Custom Routes')}
                {openCategories.extensions && (
                  <>
                    {autoExtensionItems.length > 0 && (
                      <div style={{ marginBottom: '16px' }}>
                        <span style={{ fontSize: '11px', color: '#a29bfe', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                          Extension Items & Routes
                        </span>
                        {autoExtensionItems.map((item) => renderIconRow(item))}
                      </div>
                    )}

                    {fetchedRedirects.length > 0 && (
                      <div style={{ marginBottom: '16px' }}>
                        <span style={{ fontSize: '11px', color: '#a29bfe', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                          Auto-fetched Redirects ({fetchedRedirects.length})
                        </span>
                        {fetchedRedirects.map((item) => renderIconRow(item))}
                      </div>
                    )}

                    <Group mb="sm">
                      <TextInput
                        placeholder="e.g. /admin/extensions/my-extension, redirect:Discord, or route path"
                        value={newRoutePath}
                        onChange={(e) => setNewRoutePath(e.currentTarget.value)}
                        style={{ flex: 1 }}
                        styles={{ input: { background: '#141418', border: '1px solid #27272a', color: '#e4e4e7', fontSize: '11px', height: '32px' } }}
                      />
                      <Button
                        size="xs"
                        color="blue"
                        onClick={() => {
                          if (!newRoutePath.trim()) return;
                          const path = newRoutePath.trim();
                          if (!customRouteList.includes(path)) {
                            setCustomRouteList([...customRouteList, path]);
                          }
                          setNewRoutePath('');
                        }}
                        style={{ height: '32px' }}
                      >
                        Add Route Item
                      </Button>
                    </Group>
                    {customRouteList
                      .filter((path) => !autoExtensionItems.some((auto) => auto.key === path) && !fetchedRedirects.some((red) => red.key === path))
                      .map((path) => renderIconRow({ key: path, label: `Custom Route: ${path}` }))}
                  </>
                )}
              </>
            );
          })()}
        </div>
      </Stack>

      {/* Graphical Icon Picker Modal */}
      <Modal
        opened={pickerOpen}
        onClose={() => setPickerOpen(false)}
        withinPortal={true}
        zIndex={10000}
        centered={true}
        className="qunix-modal"
        overlayProps={{ className: 'qunix-overlay', zIndex: 9999 }}
        title={
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#e4e4e7' }}>
            Pick an icon
          </span>
        }
        size='lg'
        styles={{
          content: { background: '#0a0a0c', border: '1px solid #1c1c21', borderRadius: '12px' },
          header: { background: '#0a0a0c', color: '#e4e4e7', borderBottom: '1px solid #1c1c21' },
          close: { color: '#a1a1aa', '&:hover': { background: '#1c1c21' } },
        }}
      >
        <Stack gap='md'>
          <Group justify='space-between' align='center'>
            <span style={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Choose provider
            </span>
            <Group gap='xs'>
              <Button
                size='xs'
                variant={activeProvider === 'fontawesome' ? 'filled' : 'light'}
                color={activeProvider === 'fontawesome' ? 'blue' : 'gray'}
                onClick={() => setActiveProvider('fontawesome')}
                styles={{ root: { height: '24px', fontSize: '10px' } }}
              >
                FontAwesome
              </Button>
              <Button
                size='xs'
                variant={activeProvider === 'heroicons' ? 'filled' : 'light'}
                color={activeProvider === 'heroicons' ? 'blue' : 'gray'}
                onClick={() => setActiveProvider('heroicons')}
                styles={{ root: { height: '24px', fontSize: '10px' } }}
              >
                Heroicons
              </Button>
              <Button
                size='xs'
                variant={activeProvider === 'mdi' ? 'filled' : 'light'}
                color={activeProvider === 'mdi' ? 'blue' : 'gray'}
                onClick={() => setActiveProvider('mdi')}
                styles={{ root: { height: '24px', fontSize: '10px' } }}
              >
                MUI Icons
              </Button>
              <Button
                size='xs'
                variant={activeProvider === 'lineicons' ? 'filled' : 'light'}
                color={activeProvider === 'lineicons' ? 'blue' : 'gray'}
                onClick={() => setActiveProvider('lineicons')}
                styles={{ root: { height: '24px', fontSize: '10px' } }}
              >
                Lineicons
              </Button>
              <Button
                size='xs'
                variant={activeProvider === 'lucide' ? 'filled' : 'light'}
                color={activeProvider === 'lucide' ? 'blue' : 'gray'}
                onClick={() => setActiveProvider('lucide')}
                styles={{ root: { height: '24px', fontSize: '10px' } }}
              >
                Lucide
              </Button>
            </Group>
          </Group>

          <Group justify='space-between' align='center' style={{ borderTop: '1px solid #1c1c21', paddingTop: '8px' }}>
            <span style={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Icon Style
            </span>
            <Group gap='xs'>
              <Button
                size='xs'
                variant={activeStyle === 'outline' ? 'filled' : 'light'}
                color={activeStyle === 'outline' ? 'blue' : 'gray'}
                onClick={() => setActiveStyle('outline')}
                styles={{ root: { height: '24px', fontSize: '10px' } }}
              >
                Outline
              </Button>
              <Button
                size='xs'
                variant={activeStyle === 'solid' ? 'filled' : 'light'}
                color={activeStyle === 'solid' ? 'blue' : 'gray'}
                onClick={() => setActiveStyle('solid')}
                styles={{ root: { height: '24px', fontSize: '10px' } }}
              >
                Solid
              </Button>
            </Group>
          </Group>

          <TextInput
            placeholder='Search icons...'
            leftSection={<FontAwesomeIcon icon={faSearch} style={{ fontSize: '12px', color: '#71717a' }} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            styles={{
              input: { background: '#141418', border: '1px solid #27272a', color: '#e4e4e7' },
            }}
          />

          <ScrollArea h={320} type='hover'>
            <SimpleGrid cols={{ base: 3, sm: 4 }} spacing='xs' style={{ padding: '2px' }}>
              {filteredIcons.map((name) => {
                const fullIconStr = getFullIconName(name);

                return (
                  <button
                    key={name}
                    onClick={() => selectIconFromPicker(name)}
                    style={{
                      background: '#141418',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      padding: '12px 6px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      outline: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--ds-primary-color, #7aa2f7)';
                      e.currentTarget.style.background = '#1c1c24';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#27272a';
                      e.currentTarget.style.background = '#141418';
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--ds-primary-color, #7aa2f7)',
                        fontSize: '18px',
                      }}
                    >
                      <DynamicIcon icon={fullIconStr} />
                    </div>
                    <span
                      style={{
                        fontSize: '9px',
                        color: '#a1a1aa',
                        textAlign: 'center',
                        width: '100%',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={name}
                    >
                      {name}
                    </span>
                  </button>
                );
              })}
            </SimpleGrid>
            {filteredIcons.length === 0 && (
              <span style={{ fontSize: '12px', color: '#71717a', display: 'block', textAlign: 'center', padding: '24px 0' }}>
                No icons found matching search.
              </span>
            )}
          </ScrollArea>

          <Divider my='xs' color='#1c1c21' />
          <Group justify='flex-end' gap='sm'>
            <Button
              variant='filled'
              onClick={() => setPickerOpen(false)}
              style={{ background: '#141418', color: '#e4e4e7', border: '1px solid #27272a' }}
              styles={{ root: { height: '32px', fontSize: '12px' } }}
            >
              Cancel
            </Button>
            <Button
              color='blue'
              onClick={() => {
                if (activeItemKey) {
                  const newIcons = { ...sidebarIcons };
                  delete newIcons[activeItemKey];
                  form.setFieldValue('sidebar_icons', newIcons);
                }
                setPickerOpen(false);
              }}
              styles={{ root: { height: '32px', fontSize: '12px' } }}
            >
              Reset to defaults
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

export default SidebarSettings;
