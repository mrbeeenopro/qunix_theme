import React, { useState, useEffect } from 'react';
import { UseFormReturnType } from '@mantine/form';
import { z } from 'zod';
import { Badge, Switch, Progress, ScrollArea, Stack, Divider, Card, Overlay, Box } from '@mantine/core';
import { useExtTranslations } from '../../translations.ts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faGripVertical,
  faArrowUp,
  faArrowDown,
  faRotateLeft,
  faServer,
  faMicrochip,
  faMemory,
  faHardDrive,
  faNetworkWired,
  faTerminal,
  faFolderOpen,
  faDatabase,
  faBoxArchive,
  faStopwatch,
  faPlay,
  faRotateRight,
  faStop,
  faSkull,
  faCog,
  faEthernet,
  faCopy,
  faSliders,
  faLayerGroup,
  faExternalLinkAlt,
  faShieldHalved,
  faTv,
  faCreditCard,
  faGlobe,
  faHeadset,
  faComments,
  faSearch,
  faCheck,
  faArrowRight,
  faList,
  faTh,
  faCloud,
} from '@fortawesome/free-solid-svg-icons';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { axiosInstance } from '@/api/axios.ts';
import { qunixThemeSettingsSchema } from '../../lib/schemas.ts';
import {
  DEFAULT_DASHBOARD_MODULES,
  DEFAULT_CONSOLE_MODULES,
  DEFAULT_HOME_MODULES,
  DashboardModule,
  ConsoleModule,
  HomeDashboardModule,
  loadSavedDashboardLayout,
  loadSavedConsoleLayout,
  loadSavedHomeDashboardLayout,
} from '../../lib/dashboardLayout.ts';
import QunixManagementShortcuts from '../theme/QunixManagementShortcuts.tsx';
import QunixSftpDetails from '../theme/QunixSftpDetails.tsx';
import QunixEnvironmentSpecs from '../theme/QunixEnvironmentSpecs.tsx';
import QunixResourceCharts from '../theme/QunixResourceCharts.tsx';

interface QunixCustomLayoutBuilderProps {
  form: UseFormReturnType<z.infer<typeof qunixThemeSettingsSchema>>;
  onSave: () => void;
  onBack: () => void;
  sidebarWidth?: number;
  onResizeStart?: (e: React.MouseEvent) => void;
  onResetWidth?: () => void;
  isResizing?: boolean;
}

export const QunixCustomLayoutBuilder: React.FC<QunixCustomLayoutBuilderProps> = ({
  form,
  onBack,
  sidebarWidth = 380,
  onResizeStart,
  onResetWidth,
  isResizing = false,
}) => {
  const { t: tExt } = useExtTranslations();
  const [activeTab, setActiveTab] = useState<'home' | 'dashboard' | 'console'>('home');

  // Home Dashboard Modules State
  const [homeModules, setHomeModules] = useState<HomeDashboardModule[]>(() => {
    try {
      const formVal = form.values.custom_dashboard_layout;
      if (formVal && formVal.trim().length > 2) {
        const parsed = JSON.parse(formVal);
        const list = Array.isArray(parsed?.main_dashboard) ? parsed.main_dashboard : null;
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
    } catch (_) { }
    return loadSavedHomeDashboardLayout();
  });

  // Dashboard Modules State
  const [modules, setModules] = useState<DashboardModule[]>(() => {
    try {
      const formVal = form.values.custom_dashboard_layout;
      if (formVal && formVal.trim().length > 2) {
        const parsed = JSON.parse(formVal);
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
    } catch (_) { }
    return loadSavedDashboardLayout();
  });

  // Console Modules State
  const [consoleModules, setConsoleModules] = useState<ConsoleModule[]>(() => {
    try {
      const formVal = form.values.custom_dashboard_layout;
      if (formVal && formVal.trim().length > 2) {
        const parsed = JSON.parse(formVal);
        const list = !Array.isArray(parsed) && Array.isArray(parsed?.console) ? parsed.console : null;
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
    } catch (_) { }
    return loadSavedConsoleLayout();
  });

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const themeAccent = form.values.button_color || form.values.focus_color || '#6c5ce7';
  const accentTextColor = `color-mix(in srgb, ${themeAccent} 80%, white)`;

  const syncAll = (
    nextDash: DashboardModule[],
    nextConsole: ConsoleModule[],
    nextHome?: HomeDashboardModule[],
    nextConsoleStyle?: string
  ) => {
    setModules(nextDash);
    setConsoleModules(nextConsole);
    const currentHome = nextHome || homeModules;
    if (nextHome) {
      setHomeModules(nextHome);
    }

    const payload = {
      main_dashboard: currentHome,
      dashboard: nextDash,
      console: nextConsole,
    };
    const jsonStr = JSON.stringify(payload);

    if (nextConsoleStyle !== undefined) {
      form.setFieldValue('console_style', nextConsoleStyle);
    }
    form.setFieldValue('custom_dashboard_layout', jsonStr);

    try {
      localStorage.setItem('qunix_custom_dashboard_layout', JSON.stringify(nextDash));
      localStorage.setItem('qunix_custom_console_layout', JSON.stringify(nextConsole));
      localStorage.setItem('qunix_dashboard_section_order', JSON.stringify(currentHome.map((m) => m.id)));

      const consoleFlags: Record<string, boolean> = {};
      nextConsole.forEach((m) => {
        consoleFlags[m.id] = m.enabled;
      });
      localStorage.setItem('qunix_custom_console_components', JSON.stringify(consoleFlags));

      const terminalMod = nextConsole.find((m) => m.id === 'console_terminal');
      if (terminalMod?.height && terminalMod.height > 100) {
        localStorage.setItem('qunix_custom_console_height', String(terminalMod.height));
      } else {
        localStorage.removeItem('qunix_custom_console_height');
      }

      if ((window as any).qunixThemeSettings) {
        (window as any).qunixThemeSettings.custom_dashboard_layout = jsonStr;
        if (nextConsoleStyle !== undefined) {
          (window as any).qunixThemeSettings.console_style = nextConsoleStyle;
        }
      }

      if (typeof document !== 'undefined' && nextConsoleStyle !== undefined) {
        document.documentElement.setAttribute('data-console-style', nextConsoleStyle);
      }

      window.dispatchEvent(new CustomEvent('qunix-custom-layout-updated', { detail: nextDash }));
      window.dispatchEvent(new CustomEvent('qunix-custom-console-updated', { detail: nextConsole }));
      window.dispatchEvent(new CustomEvent('qunix-dashboard-sections-updated', { detail: currentHome.map((m) => m.id) }));
      if (nextConsoleStyle !== undefined) {
        window.dispatchEvent(new CustomEvent('qunix-theme-settings-changed', {
          detail: { ...((window as any).qunixThemeSettings || {}), console_style: nextConsoleStyle },
        }));
      }
    } catch (_) { }
  };

  // Home Dashboard Handlers
  const handleHomeToggle = (id: string, enabled: boolean) => {
    const next = homeModules.map((m) => (m.id === id ? { ...m, enabled } : m));
    syncAll(modules, consoleModules, next);
  };

  const moveHomeModule = (from: number, to: number) => {
    if (to < 0 || to >= homeModules.length || from === to) return;
    const next = [...homeModules];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    syncAll(modules, consoleModules, next);
  };

  const handleResetHomeDefaults = () => {
    syncAll(modules, consoleModules, DEFAULT_HOME_MODULES);
  };

  // Live editor terminal height resizing state
  const [editorResizingModId, setEditorResizingModId] = useState<string | null>(null);
  const [editorLiveHeight, setEditorLiveHeight] = useState<number | null>(null);

  const handleConsoleHeightChange = (id: string, height: number | undefined) => {
    const next = consoleModules.map((m) => (m.id === id ? { ...m, height } : m));
    syncAll(modules, next);
  };

  const handleEditorResizeStart = (e: React.MouseEvent, currentHeight: number, modId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setEditorResizingModId(modId);
    const startY = e.clientY;
    const initialHeight = currentHeight || 320;
    let latestHeight = initialHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const delta = moveEvent.clientY - startY;
      latestHeight = Math.max(220, Math.min(1000, Math.round(initialHeight + delta)));
      setEditorLiveHeight(latestHeight);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      setEditorResizingModId(null);
      setEditorLiveHeight(null);
      handleConsoleHeightChange(modId, latestHeight);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Dashboard handlers
  const handleDashToggle = (id: string, enabled: boolean) => {
    const next = modules.map((m) => (m.id === id ? { ...m, enabled } : m));
    syncAll(next, consoleModules);
  };

  const handleDashWidthChange = (id: string, width: number) => {
    const next = modules.map((m) => (m.id === id ? { ...m, width } : m));
    syncAll(next, consoleModules);
  };

  const moveDashModule = (from: number, to: number) => {
    if (to < 0 || to >= modules.length || from === to) return;
    const next = [...modules];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    syncAll(next, consoleModules);
  };

  const handleResetDashDefaults = () => {
    syncAll(DEFAULT_DASHBOARD_MODULES, consoleModules);
  };

  // Console handlers
  const handleConsoleToggle = (id: string, enabled: boolean) => {
    const next = consoleModules.map((m) => (m.id === id ? { ...m, enabled } : m));
    syncAll(modules, next);
  };

  const handleConsoleWidthChange = (id: string, width: number) => {
    const next = consoleModules.map((m) => (m.id === id ? { ...m, width } : m));
    syncAll(modules, next);
  };

  const moveConsoleModule = (from: number, to: number) => {
    if (to < 0 || to >= consoleModules.length || from === to) return;
    const next = [...consoleModules];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    syncAll(modules, next);
  };

  const handleResetConsoleDefaults = () => {
    syncAll(modules, DEFAULT_CONSOLE_MODULES);
  };

  const isConsoleModular = (form.values.console_style || 'default') === 'custom';

  const handleToggleConsoleModular = (enabled: boolean) => {
    const nextStyle = enabled ? 'custom' : 'default';
    syncAll(modules, consoleModules, undefined, nextStyle);
  };

  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'server':
        return faServer;
      case 'microchip':
        return faMicrochip;
      case 'sliders':
        return faSliders;
      case 'shield':
        return faShieldHalved;
      case 'layer-group':
        return faLayerGroup;
      case 'terminal':
        return faTerminal;
      case 'tv':
        return faTv;
      case 'credit-card':
        return faCreditCard;
      case 'globe':
        return faGlobe;
      default:
        return faServer;
    }
  };

  const renderModuleMiniVisual = (id: string) => {
    switch (id) {
      case 'welcome':
        return (
          <div style={{ background: '#090a0f', borderRadius: '8px', padding: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', fontWeight: 700 }}>U</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '10px' }}>Welcome back, User</div>
                <div style={{ color: '#22c55e', fontSize: '8px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#22c55e' }} />
                  Passkey Security Active
                </div>
              </div>
            </div>
          </div>
        );
      case 'quick_links':
      case 'quick_links_widget':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '8px', padding: '6px 2px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#38bdf8' }}><FontAwesomeIcon icon={faCreditCard} /></div>
              <div style={{ fontSize: '8px', color: '#e2e8f0', fontWeight: 600, marginTop: '2px' }}>Billing</div>
            </div>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: '8px', padding: '6px 2px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#818cf8' }}><FontAwesomeIcon icon={faDiscord} /></div>
              <div style={{ fontSize: '8px', color: '#e2e8f0', fontWeight: 600, marginTop: '2px' }}>Discord</div>
            </div>
            <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '8px', padding: '6px 2px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#c084fc' }}><FontAwesomeIcon icon={faGlobe} /></div>
              <div style={{ fontSize: '8px', color: '#e2e8f0', fontWeight: 600, marginTop: '2px' }}>Website</div>
            </div>
            <div style={{ background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.25)', borderRadius: '8px', padding: '6px 2px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#f472b6' }}><FontAwesomeIcon icon={faHeadset} /></div>
              <div style={{ fontSize: '8px', color: '#e2e8f0', fontWeight: 600, marginTop: '2px' }}>Support</div>
            </div>
          </div>
        );
      case 'toolbar':
        return (
          <div style={{ background: '#090a0f', borderRadius: '8px', padding: '6px 8px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '3px', background: 'rgba(255, 255, 255, 0.05)', padding: '2px', borderRadius: '6px' }}>
              <span style={{ color: '#fff', background: '#6366f1', padding: '2px 6px', borderRadius: '4px', fontSize: '8px', fontWeight: 600 }}>All (6)</span>
              <span style={{ color: '#94a3b8', padding: '2px 6px', fontSize: '8px' }}>Running</span>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '2px 8px', fontSize: '8px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FontAwesomeIcon icon={faSearch} style={{ fontSize: '7px' }} />
              <span>Search...</span>
            </div>
          </div>
        );
      case 'servers':
        return (
          <div style={{ background: '#090a0f', borderRadius: '8px', padding: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                <span style={{ color: '#f8fafc', fontWeight: 650, fontSize: '9px' }}>Minecraft SMP</span>
              </div>
              <span style={{ color: '#22c55e', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '1px 5px', borderRadius: '4px', fontSize: '7px', fontWeight: 700 }}>ONLINE</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.03)', borderRadius: '4px', padding: '3px 4px', fontSize: '7px', color: '#94a3b8' }}>CPU <span style={{ color: '#38bdf8', fontWeight: 700 }}>18%</span></div>
              <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.03)', borderRadius: '4px', padding: '3px 4px', fontSize: '7px', color: '#94a3b8' }}>RAM <span style={{ color: '#c084fc', fontWeight: 700 }}>1.4 GB</span></div>
              <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.03)', borderRadius: '4px', padding: '3px 4px', fontSize: '7px', color: '#94a3b8' }}>IP <span style={{ color: '#f8fafc', fontWeight: 700 }}>:25565</span></div>
            </div>
          </div>
        );
      case 'hero_header':
      case 'hero_banner':
        return (
          <div style={{ background: '#090a0f', borderRadius: '8px', padding: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '10px' }}>Production Node 01</div>
                <div style={{ color: '#64748b', fontSize: '8px' }}>127.0.0.1:25565</div>
              </div>
              <span style={{ color: '#22c55e', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '1px 6px', borderRadius: '10px', fontSize: '8px', fontWeight: 700 }}>RUNNING</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3px' }}>
              <div style={{ background: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.4)', color: '#4ade80', padding: '2px 0', borderRadius: '4px', textAlign: 'center', fontSize: '7px', fontWeight: 700 }}>START</div>
              <div style={{ background: 'rgba(234, 179, 8, 0.2)', border: '1px solid rgba(234, 179, 8, 0.4)', color: '#facc15', padding: '2px 0', borderRadius: '4px', textAlign: 'center', fontSize: '7px', fontWeight: 700 }}>RESTART</div>
              <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', padding: '2px 0', borderRadius: '4px', textAlign: 'center', fontSize: '7px', fontWeight: 700 }}>STOP</div>
              <div style={{ background: 'rgba(239, 68, 68, 0.3)', border: '1px solid rgba(239, 68, 68, 0.6)', color: '#ff6b6b', padding: '2px 0', borderRadius: '4px', textAlign: 'center', fontSize: '7px', fontWeight: 700 }}>KILL</div>
            </div>
          </div>
        );
      case 'metrics_stats':
      case 'compact_sparklines':
        return (
          <div style={{ background: '#090a0f', borderRadius: '8px', padding: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', padding: '5px 6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px' }}><span style={{ color: '#94a3b8' }}>CPU (Gauge)</span><span style={{ color: '#38bdf8', fontWeight: 700 }}>24.2%</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '14px', marginTop: '2px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #38bdf8', borderBottomColor: 'transparent', transform: 'rotate(-45deg)' }} />
                  <div style={{ flex: 1, height: '2px', background: 'rgba(56, 189, 248, 0.25)', position: 'relative' }}>
                    <div style={{ width: '40%', height: '100%', background: '#38bdf8' }} />
                  </div>
                </div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', padding: '5px 6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px' }}><span style={{ color: '#94a3b8' }}>RAM (Matrix)</span><span style={{ color: '#c084fc', fontWeight: 700 }}>3.2 GB</span></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1.5px', height: '12px', marginTop: '3px' }}>
                  {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8].map((h, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column-reverse', gap: '1px', height: '100%' }}>
                      <div style={{ height: '3px', background: '#c084fc', borderRadius: '0.5px' }} />
                      {h > 0.4 && <div style={{ height: '3px', background: '#c084fc', borderRadius: '0.5px' }} />}
                      {h > 0.7 && <div style={{ height: '3px', background: '#c084fc', borderRadius: '0.5px' }} />}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', padding: '5px 6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px' }}><span style={{ color: '#94a3b8' }}>DISK (Donut)</span><span style={{ color: '#34d399', fontWeight: 700 }}>45%</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2.5px solid #34d399', borderRightColor: 'rgba(255, 255, 255, 0.1)' }} />
                  <div style={{ fontSize: '7px', color: '#64748b' }}>239M / 1G</div>
                </div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', padding: '5px 6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px' }}><span style={{ color: '#94a3b8' }}>NET</span><span style={{ color: '#fbbf24', fontWeight: 700 }}>48 MB/s</span></div>
                <div style={{ fontSize: '7px', color: '#64748b', marginTop: '2px' }}>↑ 12MB/s ↓ 36MB/s</div>
              </div>
            </div>
          </div>
        );
      case 'management_shortcuts':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
            {['Console', 'Files', 'Databases', 'Backups', 'Network', 'Schedules', 'Startup', 'Settings'].map((item) => (
              <div key={item} style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '6px', padding: '4px 2px', textAlign: 'center' }}>
                <div style={{ fontSize: '9px', color: '#c4b5fd' }}><FontAwesomeIcon icon={faCog} /></div>
                <div style={{ fontSize: '7px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item}</div>
              </div>
            ))}
          </div>
        );
      case 'sftp_details':
        return (
          <div style={{ background: '#090a0f', borderRadius: '8px', padding: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#f8fafc' }}>SFTP Connection</span>
              <span style={{ fontSize: '7px', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '1px 5px', borderRadius: '4px' }}>Port 2022</span>
            </div>
            <div style={{ fontSize: '8px', color: '#94a3b8', fontFamily: 'monospace', background: 'rgba(255, 255, 255, 0.03)', padding: '4px 6px', borderRadius: '4px' }}>
              sftp://user@127.0.0.1:2022
            </div>
          </div>
        );
      case 'environment_specs':
        return (
          <div style={{ background: '#090a0f', borderRadius: '8px', padding: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#94a3b8', marginBottom: '2px' }}>
              <span>Node</span><span style={{ color: '#f8fafc', fontWeight: 600 }}>tesst (Debian 12)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#94a3b8', marginBottom: '2px' }}>
              <span>Egg / Template</span><span style={{ color: '#38bdf8', fontWeight: 600 }}>Debian Generic</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#94a3b8' }}>
              <span>Container</span><span style={{ color: '#c084fc', fontFamily: 'monospace', fontSize: '7px' }}>example.com</span>
            </div>
          </div>
        );
      case 'terminal':
      case 'terminal_console':
      case 'console_terminal':
        return (
          <div style={{ background: '#050608', borderRadius: '8px', padding: '6px 8px', border: '1px solid rgba(255, 255, 255, 0.08)', fontFamily: 'monospace', fontSize: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '4px', borderBottom: '1px solid #1a1d24', paddingBottom: '3px' }}>
              <span style={{ color: '#64748b', fontSize: '7px' }}>xterm.js v5.3</span>
            </div>
            <div style={{ color: '#22c55e' }}>root@server:~# ./run.sh</div>
            <div style={{ color: '#94a3b8' }}>[Server] Loaded 45 recipes. Listening on :25565</div>
          </div>
        );
      case 'console_infobar':
        return (
          <div style={{ background: '#090a0f', borderRadius: '8px', padding: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#f8fafc' }}>Console Infobar</span>
              <span style={{ fontSize: '7px', color: '#22c55e', background: 'rgba(34, 197, 94, 0.15)', padding: '1px 5px', borderRadius: '4px' }}>Uptime 4d 12h</span>
            </div>
            <div style={{ display: 'flex', gap: '3px' }}>
              <div style={{ flex: 1, background: '#16a34a', color: '#fff', textAlign: 'center', borderRadius: '3px', fontSize: '7px', padding: '2px 0', fontWeight: 700 }}>Start</div>
              <div style={{ flex: 1, background: '#eab308', color: '#000', textAlign: 'center', borderRadius: '3px', fontSize: '7px', padding: '2px 0', fontWeight: 700 }}>Restart</div>
              <div style={{ flex: 1, background: '#dc2626', color: '#fff', textAlign: 'center', borderRadius: '3px', fontSize: '7px', padding: '2px 0', fontWeight: 700 }}>Stop</div>
            </div>
          </div>
        );
      case 'server_details':
      case 'stats':
        return (
          <div style={{ background: '#090a0f', borderRadius: '8px', padding: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#94a3b8', marginBottom: '2px' }}>
              <span>Host</span><span style={{ color: '#f8fafc' }}>127.0.0.1</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#94a3b8', marginBottom: '2px' }}>
              <span>SFTP Port</span><span style={{ color: '#38bdf8' }}>2022</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#94a3b8' }}>
              <span>Node</span><span style={{ color: '#a78bfa' }}>Node-01</span>
            </div>
          </div>
        );
      case 'power_actions':
      case 'control_buttons':
        return (
          <div style={{ display: 'flex', gap: '4px', fontSize: '8px' }}>
            <div style={{ flex: 1, background: '#16a34a', color: '#fff', padding: '3px 0', borderRadius: '3px', textAlign: 'center', fontWeight: 600 }}>Start</div>
            <div style={{ flex: 1, background: '#475569', color: '#fff', padding: '3px 0', borderRadius: '3px', textAlign: 'center', fontWeight: 600 }}>Restart</div>
            <div style={{ flex: 1, background: '#dc2626', color: '#fff', padding: '3px 0', borderRadius: '3px', textAlign: 'center', fontWeight: 600 }}>Stop</div>
          </div>
        );
      default:
        return (
          <div style={{ background: '#090a0f', borderRadius: '8px', padding: '6px 8px', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '8px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6c5ce7' }} />
            <span>Interactive Phone Widget</span>
          </div>
        );
    }
  };

  // Server Presentation Variables (Clean demo placeholders)
  const serverName = 'server-node-01';
  const serverDescription = 'Production Node instance running debian container.';
  const serverId = '00000000-0000-0000-0000-000000000000';
  const serverShortId = 'srv-node';
  const serverAllocation = '127.0.0.1:25565';
  const sftpAddress = '127.0.0.1:2022';
  const sftpUsername = 'user.srv1';
  const serverNode = 'Node-01';
  const serverEgg = 'debian';
  const serverDocker = 'ghcr.io/example/image:latest';

  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        height: '100%',
        maxHeight: '100dvh',
        overflow: 'hidden',
        background: '#070708',
      }}
    >
      {/* 1. Left Sidebar: Component Catalog & Toggles (Synced with other settings tabs) */}
      <div
        style={{
          width: `${sidebarWidth}px`,
          minWidth: '300px',
          maxWidth: '850px',
          height: '100%',
          maxHeight: '100dvh',
          overflow: 'hidden',
          flexShrink: 0,
          background: '#070708',
          borderRight: '1px solid #111114',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Title pane - 100% synced with other tabs */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #111114',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0, color: '#f8fafc' }}>
              {tExt('admin.tabs.dashboardLayout.title', { defaultValue: 'Dashboard & Console' })}
            </h2>
          </div>
        </div>

        <ScrollArea style={{ flex: 1, padding: '24px' }} type='auto'>
          <form onSubmit={(e) => e.preventDefault()}>
            <Stack gap='md' style={{ paddingBottom: '32px' }}>
              {/* 1. Mode Switcher */}
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
                  <FontAwesomeIcon icon={faLayerGroup} style={{ marginRight: '6px' }} />
                  Dashboard & Console Layout Mode
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
                  Select which modular page to customize: Home Dashboard, Server Overview, or Server Console.
                </span>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    background: '#111114',
                    padding: '3px',
                    borderRadius: '8px',
                    border: '1px solid #1e1f24',
                    gap: '2px',
                  }}
                >
                  <button
                    type='button'
                    onClick={() => setActiveTab('home')}
                    style={{
                      background: activeTab === 'home' ? '#6c5ce7' : 'transparent',
                      color: activeTab === 'home' ? '#ffffff' : '#71717a',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '7px 4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <FontAwesomeIcon icon={faLayerGroup} style={{ fontSize: '10px' }} />
                    Home
                  </button>
                  <button
                    type='button'
                    onClick={() => setActiveTab('dashboard')}
                    style={{
                      background: activeTab === 'dashboard' ? '#6c5ce7' : 'transparent',
                      color: activeTab === 'dashboard' ? '#ffffff' : '#71717a',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '7px 4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <FontAwesomeIcon icon={faTv} style={{ fontSize: '10px' }} />
                    Overview
                  </button>
                  <button
                    type='button'
                    onClick={() => setActiveTab('console')}
                    style={{
                      background: activeTab === 'console' ? '#6c5ce7' : 'transparent',
                      color: activeTab === 'console' ? '#ffffff' : '#71717a',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '7px 4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <FontAwesomeIcon icon={faTerminal} style={{ fontSize: '10px' }} />
                    Console
                  </button>
                </div>
              </div>

              <Divider my='xs' color='#111114' />

              {/* 2. Console Options */}
              {activeTab === 'console' && (
                <>
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
                      Modular Console Layout
                    </span>
                    <div
                      style={{
                        background: '#0a0a0c',
                        border: isConsoleModular ? '1px solid #6c5ce7' : '1px solid #1c1c21',
                        borderRadius: '8px',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: isConsoleModular ? '#a29bfe' : '#e2e8f0' }}>
                          Enable Modular Console
                        </div>
                        <div style={{ fontSize: '11px', color: '#71717a', marginTop: '2px', lineHeight: '1.4' }}>
                          {isConsoleModular
                            ? 'Modular layout active on /server/:id/console.'
                            : 'Standard layout used. Toggle on to activate modular cards.'}
                        </div>
                      </div>
                      <Switch
                        checked={isConsoleModular}
                        onChange={(e) => handleToggleConsoleModular(e.currentTarget.checked)}
                        color='grape'
                        size='sm'
                      />
                    </div>

                    {/* Disable Console Auto-Resize / Height Stretch (Synced with Layout Settings) */}
                    <div
                      style={{
                        marginTop: '8px',
                        background: '#0a0a0c',
                        border: '1px solid #1c1c21',
                        borderRadius: '8px',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>
                          Disable Console Height Stretch
                        </div>
                        <div style={{ fontSize: '11px', color: '#71717a', marginTop: '2px', lineHeight: '1.4' }}>
                          Keeps proportional console height instead of stretching to window height.
                        </div>
                      </div>
                      <Switch
                        checked={!!form.values.disable_console_auto_resize}
                        onChange={(e) => form.setFieldValue('disable_console_auto_resize', e.currentTarget.checked)}
                        color='grape'
                        size='sm'
                      />
                    </div>
                  </div>

                  <Divider my='xs' color='#111114' />
                </>
              )}

              {/* 3. Component Catalog */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: '#a29bfe',
                    }}
                  >
                    <FontAwesomeIcon icon={faSliders} style={{ marginRight: '6px' }} />
                    {activeTab === 'home'
                      ? 'Home Dashboard Sections'
                      : activeTab === 'dashboard'
                        ? 'Overview Component Catalog'
                        : 'Console Component Catalog'}
                  </span>
                  <button
                    type='button'
                    onClick={
                      activeTab === 'home'
                        ? handleResetHomeDefaults
                        : activeTab === 'dashboard'
                          ? handleResetDashDefaults
                          : handleResetConsoleDefaults
                    }
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid #1e1f24',
                      borderRadius: '6px',
                      color: '#a29bfe',
                      fontSize: '10px',
                      fontWeight: 500,
                      padding: '3px 8px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.borderColor = '#6c5ce7';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#a29bfe';
                      e.currentTarget.style.borderColor = '#1e1f24';
                    }}
                  >
                    <FontAwesomeIcon icon={faRotateLeft} style={{ fontSize: '9px' }} />
                    Reset
                  </button>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    color: '#71717a',
                    display: 'block',
                    marginBottom: '12px',
                    lineHeight: '1.4',
                  }}
                >
                  {activeTab === 'home'
                    ? 'Toggle and reorder sections (Welcome Header, Quick Links, Filters, Servers) for the main client dashboard.'
                    : activeTab === 'dashboard'
                      ? 'Toggle and reorder cards for the server dashboard overview.'
                      : 'Toggle and arrange terminal and info modules for server console.'}
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeTab === 'home'
                    ? homeModules.map((mod, idx) => (
                      <div
                        key={mod.id}
                        style={{
                          background: mod.enabled ? '#0f1118' : '#090a0e',
                          border: mod.enabled
                            ? '1px solid rgba(255, 255, 255, 0.12)'
                            : '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '14px',
                          padding: '12px',
                          boxShadow: 'none',
                          opacity: mod.enabled ? 1 : 0.65,
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      >
                        {/* Widget Header: Icon, Title, Subtitle, Reorder Buttons & Action Button */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '9px',
                                background: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: mod.enabled ? '#e2e8f0' : '#71717a',
                                flexShrink: 0,
                                boxShadow: 'none',
                              }}
                            >
                              <FontAwesomeIcon icon={getModuleIcon(mod.iconName)} style={{ fontSize: '13px' }} />
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <span
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 650,
                                  color: mod.enabled ? '#f8fafc' : '#71717a',
                                  display: 'block',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {mod.name}
                              </span>
                              <div style={{ fontSize: '9px', color: '#64748b', marginTop: '1px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                                Widget Preview
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            <div style={{ display: 'flex', gap: '2px' }}>
                              <button
                                type='button'
                                disabled={idx === 0}
                                onClick={() => moveHomeModule(idx, idx - 1)}
                                style={{
                                  background: 'rgba(255, 255, 255, 0.04)',
                                  border: '1px solid rgba(255, 255, 255, 0.06)',
                                  borderRadius: '6px',
                                  width: '24px',
                                  height: '24px',
                                  color: idx === 0 ? '#334155' : '#94a3b8',
                                  cursor: idx === 0 ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '10px',
                                }}
                                title='Move up'
                              >
                                <FontAwesomeIcon icon={faArrowUp} />
                              </button>
                              <button
                                type='button'
                                disabled={idx === homeModules.length - 1}
                                onClick={() => moveHomeModule(idx, idx + 1)}
                                style={{
                                  background: 'rgba(255, 255, 255, 0.04)',
                                  border: '1px solid rgba(255, 255, 255, 0.06)',
                                  borderRadius: '6px',
                                  width: '24px',
                                  height: '24px',
                                  color: idx === homeModules.length - 1 ? '#334155' : '#94a3b8',
                                  cursor: idx === homeModules.length - 1 ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '10px',
                                }}
                                title='Move down'
                              >
                                <FontAwesomeIcon icon={faArrowDown} />
                              </button>
                            </div>

                            {/* Phone Widget Action Button */}
                            <button
                              type='button'
                              onClick={() => handleHomeToggle(mod.id, !mod.enabled)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '16px',
                                fontSize: '11px',
                                fontWeight: 650,
                                border: mod.enabled
                                  ? '1px solid rgba(255, 255, 255, 0.16)'
                                  : '1px solid rgba(255, 255, 255, 0.08)',
                                background: mod.enabled
                                  ? 'rgba(255, 255, 255, 0.08)'
                                  : 'rgba(255, 255, 255, 0.03)',
                                color: mod.enabled ? '#f8fafc' : '#94a3b8',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              {mod.enabled ? (
                                <>
                                  <FontAwesomeIcon icon={faCheck} style={{ color: '#ffffff', fontSize: '9px' }} /> Added
                                </>
                              ) : (
                                <>
                                  <span style={{ fontSize: '11px' }}>+</span> Add
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Real Phone Component Visual inside Widget Window */}
                        <div
                          style={{
                            background: '#06070a',
                            borderRadius: '10px',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            padding: '8px',
                            overflow: 'hidden',
                          }}
                        >
                          {renderModuleMiniVisual(mod.id)}
                        </div>
                      </div>
                    ))
                    : activeTab === 'dashboard'
                      ? modules.map((mod, idx) => (
                        <div
                          key={mod.id}
                          style={{
                            background: mod.enabled ? '#0f1118' : '#090a0e',
                            border: mod.enabled
                              ? '1px solid rgba(255, 255, 255, 0.12)'
                              : '1px solid rgba(255, 255, 255, 0.06)',
                            borderRadius: '14px',
                            padding: '12px',
                            boxShadow: 'none',
                            opacity: mod.enabled ? 1 : 0.65,
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                        >
                          {/* Widget Header: Icon, Title, Reorder & Action Button */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                              <div
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '9px',
                                  background: 'rgba(255, 255, 255, 0.04)',
                                  border: '1px solid rgba(255, 255, 255, 0.08)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: mod.enabled ? '#e2e8f0' : '#71717a',
                                  flexShrink: 0,
                                  boxShadow: 'none',
                                }}
                              >
                                <FontAwesomeIcon icon={getModuleIcon(mod.iconName)} style={{ fontSize: '13px' }} />
                              </div>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <span
                                  style={{
                                    fontSize: '12px',
                                    fontWeight: 650,
                                    color: mod.enabled ? '#f8fafc' : '#71717a',
                                    display: 'block',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {mod.name}
                                </span>
                                <div style={{ fontSize: '9px', color: '#64748b', marginTop: '1px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                                  Widget Preview
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                              <div style={{ display: 'flex', gap: '2px' }}>
                                <button
                                  type='button'
                                  disabled={idx === 0}
                                  onClick={() => moveDashModule(idx, idx - 1)}
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    border: '1px solid rgba(255, 255, 255, 0.06)',
                                    borderRadius: '6px',
                                    width: '24px',
                                    height: '24px',
                                    color: idx === 0 ? '#334155' : '#94a3b8',
                                    cursor: idx === 0 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10px',
                                  }}
                                  title='Move up'
                                >
                                  <FontAwesomeIcon icon={faArrowUp} />
                                </button>
                                <button
                                  type='button'
                                  disabled={idx === modules.length - 1}
                                  onClick={() => moveDashModule(idx, idx + 1)}
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    border: '1px solid rgba(255, 255, 255, 0.06)',
                                    borderRadius: '6px',
                                    width: '24px',
                                    height: '24px',
                                    color: idx === modules.length - 1 ? '#334155' : '#94a3b8',
                                    cursor: idx === modules.length - 1 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10px',
                                  }}
                                  title='Move down'
                                >
                                  <FontAwesomeIcon icon={faArrowDown} />
                                </button>
                              </div>

                              {/* Phone Widget Action Button */}
                              <button
                                type='button'
                                onClick={() => handleDashToggle(mod.id, !mod.enabled)}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '16px',
                                  fontSize: '11px',
                                  fontWeight: 650,
                                  border: mod.enabled
                                    ? '1px solid rgba(255, 255, 255, 0.16)'
                                    : '1px solid rgba(255, 255, 255, 0.08)',
                                  background: mod.enabled
                                    ? 'rgba(255, 255, 255, 0.08)'
                                    : 'rgba(255, 255, 255, 0.03)',
                                  color: mod.enabled ? '#f8fafc' : '#94a3b8',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                {mod.enabled ? (
                                  <>
                                    <FontAwesomeIcon icon={faCheck} style={{ color: '#ffffff', fontSize: '9px' }} /> Added
                                  </>
                                ) : (
                                  <>
                                    <span style={{ fontSize: '11px' }}>+</span> Add
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Real Phone Component Visual inside Widget Window */}
                          <div
                            style={{
                              background: '#06070a',
                              borderRadius: '10px',
                              border: '1px solid rgba(255, 255, 255, 0.05)',
                              padding: '8px',
                              overflow: 'hidden',
                            }}
                          >
                            {renderModuleMiniVisual(mod.id)}
                          </div>

                          {/* Widget Size Selector Segment */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <span style={{ fontSize: '10px', color: '#64748b' }}>Widget Size</span>
                            <div style={{ display: 'flex', gap: '3px', background: 'rgba(255, 255, 255, 0.03)', padding: '2px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                              <button
                                type='button'
                                onClick={() => handleDashWidthChange(mod.id, 6)}
                                style={{
                                  background: mod.width === 6 ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                  border: mod.width === 6 ? '1px solid rgba(255, 255, 255, 0.18)' : '1px solid transparent',
                                  color: mod.width === 6 ? '#f8fafc' : '#64748b',
                                  borderRadius: '6px',
                                  padding: '2px 8px',
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                2x2 Half
                              </button>
                              <button
                                type='button'
                                onClick={() => handleDashWidthChange(mod.id, 12)}
                                style={{
                                  background: mod.width === 12 ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                  border: mod.width === 12 ? '1px solid rgba(255, 255, 255, 0.18)' : '1px solid transparent',
                                  color: mod.width === 12 ? '#f8fafc' : '#64748b',
                                  borderRadius: '6px',
                                  padding: '2px 8px',
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                4x2 Full
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                      : consoleModules.map((mod, idx) => (
                        <div
                          key={mod.id}
                          style={{
                            background: mod.enabled ? '#0f1118' : '#090a0e',
                            border: mod.enabled
                              ? '1px solid rgba(255, 255, 255, 0.12)'
                              : '1px solid rgba(255, 255, 255, 0.06)',
                            borderRadius: '14px',
                            padding: '12px',
                            boxShadow: 'none',
                            opacity: mod.enabled ? 1 : 0.65,
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                        >
                          {/* Widget Header: Icon, Title, Reorder & Action Button */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                              <div
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '9px',
                                  background: 'rgba(255, 255, 255, 0.04)',
                                  border: '1px solid rgba(255, 255, 255, 0.08)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: mod.enabled ? '#e2e8f0' : '#71717a',
                                  flexShrink: 0,
                                  boxShadow: 'none',
                                }}
                              >
                                <FontAwesomeIcon icon={getModuleIcon(mod.iconName)} style={{ fontSize: '13px' }} />
                              </div>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <span
                                  style={{
                                    fontSize: '12px',
                                    fontWeight: 650,
                                    color: mod.enabled ? '#f8fafc' : '#71717a',
                                    display: 'block',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {mod.name}
                                </span>
                                <div style={{ fontSize: '9px', color: '#64748b', marginTop: '1px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                                  Widget Preview
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                              <div style={{ display: 'flex', gap: '2px' }}>
                                <button
                                  type='button'
                                  disabled={idx === 0}
                                  onClick={() => moveConsoleModule(idx, idx - 1)}
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    border: '1px solid rgba(255, 255, 255, 0.06)',
                                    borderRadius: '6px',
                                    width: '24px',
                                    height: '24px',
                                    color: idx === 0 ? '#334155' : '#94a3b8',
                                    cursor: idx === 0 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10px',
                                  }}
                                  title='Move up'
                                >
                                  <FontAwesomeIcon icon={faArrowUp} />
                                </button>
                                <button
                                  type='button'
                                  disabled={idx === consoleModules.length - 1}
                                  onClick={() => moveConsoleModule(idx, idx + 1)}
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    border: '1px solid rgba(255, 255, 255, 0.06)',
                                    borderRadius: '6px',
                                    width: '24px',
                                    height: '24px',
                                    color: idx === consoleModules.length - 1 ? '#334155' : '#94a3b8',
                                    cursor: idx === consoleModules.length - 1 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10px',
                                  }}
                                  title='Move down'
                                >
                                  <FontAwesomeIcon icon={faArrowDown} />
                                </button>
                              </div>

                              {/* Phone Widget Action Button */}
                              <button
                                type='button'
                                onClick={() => handleConsoleToggle(mod.id, !mod.enabled)}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '16px',
                                  fontSize: '11px',
                                  fontWeight: 650,
                                  border: mod.enabled
                                    ? '1px solid rgba(108, 92, 231, 0.6)'
                                    : '1px solid rgba(255, 255, 255, 0.12)',
                                  background: mod.enabled
                                    ? 'rgba(108, 92, 231, 0.22)'
                                    : 'rgba(255, 255, 255, 0.05)',
                                  color: mod.enabled ? '#e0e7ff' : '#94a3b8',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                {mod.enabled ? (
                                  <>
                                    <FontAwesomeIcon icon={faCheck} style={{ color: '#a5b4fc', fontSize: '9px' }} /> Added
                                  </>
                                ) : (
                                  <>
                                    <span style={{ fontSize: '11px' }}>+</span> Add
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Real Phone Component Visual inside Widget Window */}
                          <div
                            style={{
                              background: '#06070a',
                              borderRadius: '10px',
                              border: '1px solid rgba(255, 255, 255, 0.05)',
                              padding: '8px',
                              overflow: 'hidden',
                            }}
                          >
                            {renderModuleMiniVisual(mod.id)}
                          </div>

                          {/* Widget Size Selector Segment */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <span style={{ fontSize: '10px', color: '#64748b' }}>Widget Size</span>
                            <div style={{ display: 'flex', gap: '3px', background: 'rgba(255, 255, 255, 0.03)', padding: '2px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                              <button
                                type='button'
                                onClick={() => handleConsoleWidthChange(mod.id, 6)}
                                style={{
                                  background: mod.width === 6 ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                  border: mod.width === 6 ? '1px solid rgba(255, 255, 255, 0.18)' : '1px solid transparent',
                                  color: mod.width === 6 ? '#f8fafc' : '#64748b',
                                  borderRadius: '6px',
                                  padding: '2px 8px',
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                2x2 Half
                              </button>
                              <button
                                type='button'
                                onClick={() => handleConsoleWidthChange(mod.id, 12)}
                                style={{
                                  background: mod.width === 12 ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                  border: mod.width === 12 ? '1px solid rgba(255, 255, 255, 0.18)' : '1px solid transparent',
                                  color: mod.width === 12 ? '#f8fafc' : '#64748b',
                                  borderRadius: '6px',
                                  padding: '2px 8px',
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                4x2 Full
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                </div>
              </div>
            </Stack>
          </form>
        </ScrollArea>

        {/* Horizontal Resize Drag Handle for Settings Sidebar */}
        {onResizeStart && (
          <div
            onMouseDown={onResizeStart}
            onDoubleClick={onResetWidth}
            title="Drag to resize settings sidebar • Double-click to reset (380px)"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '6px',
              height: '100%',
              cursor: 'col-resize',
              zIndex: 30,
              background: isResizing ? '#6c5ce7' : 'transparent',
              transition: 'background 0.15s ease',
            }}
            className="hover:bg-indigo-500/30"
          />
        )}
      </div>

      {/* 2. Right Canvas Area: Wrapped in the exact same preview frame as all other settings tabs */}
      <div
        id='qunix-preview-container'
        style={{
          flex: 1,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          background: '#000000',
          height: '100%',
          overflow: 'hidden',
          pointerEvents: isResizing ? 'none' : 'auto',
        }}
      >
        {/* Top Browser / Canvas Window Bar */}
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

        {/* Window Content Canvas */}
        <div
          style={{
            flex: 1,
            border: '1px solid #111114',
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px',
            background: 'var(--ds-background, #10121d)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 0, 0, 0.2)',
            overflowY: 'auto',
            padding: '24px 28px 80px 28px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          <div style={{ maxWidth: '1240px', width: '100%', margin: '0 auto' }}>
            {/* Top Status Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
                paddingBottom: '12px',
                borderBottom: '1px solid var(--ds-border-color, rgba(255, 255, 255, 0.08))',
              }}
            >
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#f8fafc' }}>
                  {activeTab === 'home'
                    ? 'Main Client Dashboard (Drag sections to reorder)'
                    : activeTab === 'dashboard'
                      ? 'Server Overview Dashboard (Drag cards to reorder)'
                      : 'Server Console Page (Drag cards to reorder)'}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                  {activeTab === 'home'
                    ? 'Live client home layout. Reorder Welcome Header, Quick Links, Search Toolbar, and Server Cards.'
                    : activeTab === 'dashboard'
                      ? 'Live server overview page layout. Drag cards or change width to arrange components.'
                      : 'Live server console page layout. Drag terminal, details, and stats cards to configure terminal view.'}
                </div>
              </div>
            </div>

            {/* HOME DASHBOARD CANVAS */}
            {activeTab === 'home' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
                {homeModules.map((mod, index) => {
                  const isDragging = draggedIndex === index;
                  const isOver = dragOverIndex === index;

                  return (
                    <div
                      key={mod.id}
                      draggable
                      onDragStart={(e) => {
                        setDraggedIndex(index);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        if (dragOverIndex !== index) {
                          setDragOverIndex(index);
                        }
                      }}
                      onDragLeave={() => {
                        if (dragOverIndex === index) {
                          setDragOverIndex(null);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedIndex !== null && draggedIndex !== index) {
                          moveHomeModule(draggedIndex, index);
                        }
                        setDraggedIndex(null);
                        setDragOverIndex(null);
                      }}
                      onDragEnd={() => {
                        setDraggedIndex(null);
                        setDragOverIndex(null);
                      }}
                      style={{
                        background: mod.enabled ? 'var(--ds-card-bg, #161827)' : 'rgba(22, 24, 39, 0.4)',
                        border: isOver
                          ? `2px solid ${themeAccent}`
                          : isDragging
                            ? `2px dashed ${themeAccent}`
                            : mod.enabled
                              ? '1px solid var(--ds-border-color, rgba(255, 255, 255, 0.08))'
                              : '1px dashed rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        padding: '16px',
                        opacity: isDragging ? 0.35 : mod.enabled ? 1 : 0.45,
                        boxShadow: mod.enabled ? '0 4px 20px rgba(0, 0, 0, 0.25)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        position: 'relative',
                        transition: 'border-color 0.15s, opacity 0.15s',
                        cursor: 'grab',
                        userSelect: 'none',
                      }}
                    >
                      {/* Header Bar: Drag Handle, Title, Source, Controls */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingBottom: '10px',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FontAwesomeIcon icon={faGripVertical} style={{ color: '#64748b', fontSize: '13px' }} />
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>{mod.name}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ display: 'flex', gap: '3px' }}>
                            <button
                              type='button'
                              disabled={index === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                moveHomeModule(index, index - 1);
                              }}
                              style={{
                                background: '#1e293b',
                                border: '1px solid #334155',
                                color: index === 0 ? '#475569' : '#f8fafc',
                                borderRadius: '4px',
                                padding: '2px 6px',
                                cursor: index === 0 ? 'not-allowed' : 'pointer',
                                fontSize: '10px',
                              }}
                              title='Move section up'
                            >
                              <FontAwesomeIcon icon={faArrowUp} />
                            </button>
                            <button
                              type='button'
                              disabled={index === homeModules.length - 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                moveHomeModule(index, index + 1);
                              }}
                              style={{
                                background: '#1e293b',
                                border: '1px solid #334155',
                                color: index === homeModules.length - 1 ? '#475569' : '#f8fafc',
                                borderRadius: '4px',
                                padding: '2px 6px',
                                cursor: index === homeModules.length - 1 ? 'not-allowed' : 'pointer',
                                fontSize: '10px',
                              }}
                              title='Move section down'
                            >
                              <FontAwesomeIcon icon={faArrowDown} />
                            </button>
                          </div>
                          <Switch
                            checked={mod.enabled}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleHomeToggle(mod.id, e.currentTarget.checked);
                            }}
                            size='xs'
                            color='violet'
                          />
                        </div>
                      </div>

                      {/* Section Body */}
                      <div>
                        {/* 1. Welcome Header */}
                        {mod.id === 'welcome' && (
                          <div style={{ padding: '8px 4px' }}>
                            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#f8fafc' }}>
                              Welcome back, User
                            </h1>
                            <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: 'rgba(255, 255, 255, 0.65)' }}>
                              để thuận tiện cho việc login sau này bạn có thể tạo passkey ở khoá bảo mật
                            </p>
                          </div>
                        )}

                        {/* 2. Quick Links */}
                        {mod.id === 'quick_links' && (
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                              gap: '16px',
                            }}
                          >
                            {[
                              {
                                title: 'Billing',
                                sub: 'Invoices, plans and payment.',
                                icon: faCreditCard,
                                watermark: true,
                              },
                              {
                                title: 'Discord',
                                sub: 'Get help and talk to the community.',
                                icon: faDiscord,
                              },
                              {
                                title: 'Website',
                                sub: 'Everything we host, and what it costs.',
                                icon: faGlobe,
                              },
                              {
                                title: 'Contact support',
                                sub: 'Open a ticket with a human.',
                                icon: faHeadset,
                              },
                            ].map((l) => (
                              <Card
                                key={l.title}
                                withBorder
                                radius='md'
                                p='md'
                                style={{
                                  background: '#12141f',
                                  borderColor: 'rgba(255, 255, 255, 0.08)',
                                  minHeight: '110px',
                                  position: 'relative',
                                  overflow: 'hidden',
                                }}
                              >
                                <Overlay
                                  color='#000000'
                                  opacity={0.35}
                                  zIndex={1}
                                />
                                {l.watermark && (
                                  <div
                                    style={{
                                      position: 'absolute',
                                      right: '-10px',
                                      bottom: '-20px',
                                      width: '130px',
                                      height: '130px',
                                      opacity: 0.15,
                                      pointerEvents: 'none',
                                      color: '#38bdf8',
                                      zIndex: 2,
                                    }}
                                  >
                                    <svg viewBox='0 0 100 100' fill='none' stroke='currentColor' strokeWidth='2' style={{ width: '100%', height: '100%' }}>
                                      <circle cx='50' cy='50' r='45' />
                                      <ellipse cx='50' cy='50' rx='22' ry='45' />
                                      <line x1='5' y1='50' x2='95' y2='50' />
                                      <line x1='15' y1='28' x2='85' y2='28' />
                                      <line x1='15' y1='72' x2='85' y2='72' />
                                    </svg>
                                  </div>
                                )}
                                <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                                      <FontAwesomeIcon icon={l.icon} style={{ fontSize: '12px', color: '#a29bfe' }} />
                                      <span>{l.sub}</span>
                                    </div>
                                    <div style={{ fontSize: '17px', fontWeight: 700, color: '#f8fafc' }}>{l.title}</div>
                                  </div>
                                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#38bdf8', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span>Visit</span>
                                    <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '10px' }} />
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}

                        {/* 3. Toolbar */}
                        {mod.id === 'toolbar' && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '12px',
                              padding: '8px 0',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div
                                style={{
                                  background: '#1c1d24',
                                  border: '1px solid #2e303c',
                                  borderRadius: '8px',
                                  padding: '4px 12px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  color: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                              >
                                <FontAwesomeIcon icon={faServer} style={{ color: '#a29bfe' }} />
                                <span>All Servers</span>
                              </div>
                              <div style={{ fontSize: '12px', color: '#71717a', padding: '4px 8px', cursor: 'pointer' }}>
                                Grouped Servers
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div
                                style={{
                                  background: '#101116',
                                  border: '1px solid #1f2029',
                                  borderRadius: '8px',
                                  padding: '6px 12px',
                                  fontSize: '12px',
                                  color: '#71717a',
                                  minWidth: '160px',
                                }}
                              >
                                Search...
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
                                <Switch size='xs' color='violet' defaultChecked={false} />
                                <span>Show other user's servers</span>
                              </div>
                              <div style={{ display: 'flex', gap: '2px', background: '#101116', padding: '2px', borderRadius: '6px', border: '1px solid #1f2029' }}>
                                <div style={{ padding: '4px 8px', borderRadius: '4px', color: '#71717a', fontSize: '11px' }}><FontAwesomeIcon icon={faList} /></div>
                                <div style={{ padding: '4px 8px', borderRadius: '4px', background: '#6c5ce7', color: '#ffffff', fontSize: '11px' }}><FontAwesomeIcon icon={faTh} /></div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 4. Servers Grid */}
                        {mod.id === 'servers' && (
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                              gap: '16px',
                            }}
                          >
                            {[
                              { name: 'production-01', tag: 'DEBIAN', ip: '127.0.0.1:25565', disk: '1.24 GiB' },
                              { name: 'staging-02', tag: 'NODEJS', ip: '127.0.0.1:3000', disk: '456.89 MiB' },
                            ].map((srv) => (
                              <Card
                                key={srv.name}
                                withBorder
                                radius='md'
                                p={0}
                                style={{
                                  background: '#10121a',
                                  borderColor: 'rgba(255, 255, 255, 0.08)',
                                  position: 'relative',
                                  overflow: 'hidden',
                                  minHeight: '140px',
                                }}
                              >
                                {/* Background Banner with Shader Fade */}
                                <Box
                                  style={{
                                    position: 'absolute',
                                    inset: 0,
                                    backgroundImage:
                                      'url(https://images.unsplash.com/photo-1627856014754-2907e2355d54?auto=format&fit=crop&w=900&q=80)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    opacity: 0.35,
                                    zIndex: 0,
                                  }}
                                >
                                  <Overlay
                                    color='rgba(16, 18, 26, 0.85)'
                                    zIndex={1}
                                  />
                                </Box>

                                {/* Card Content */}
                                <div style={{ position: 'relative', zIndex: 2, padding: '16px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <div
                                        style={{
                                          width: '32px',
                                          height: '32px',
                                          borderRadius: '6px',
                                          background: 'rgba(255, 255, 255, 0.06)',
                                          border: '1px solid rgba(255, 255, 255, 0.1)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          color: '#38bdf8',
                                        }}
                                      >
                                        <FontAwesomeIcon icon={faServer} style={{ fontSize: '13px' }} />
                                      </div>
                                      <div>
                                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>{srv.name}</div>
                                        <Badge size='xs' variant='outline' color='gray' style={{ marginTop: '2px' }}>
                                          {srv.tag}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                                      <span style={{ fontSize: '11px', color: '#64748b' }}>&gt;_</span>
                                    </div>
                                  </div>

                                  {/* Metrics bar */}
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      fontSize: '11px',
                                      color: '#94a3b8',
                                      padding: '6px 10px',
                                      background: 'rgba(0, 0, 0, 0.3)',
                                      borderRadius: '6px',
                                      marginBottom: '10px',
                                    }}
                                  >
                                    <span>
                                      <FontAwesomeIcon icon={faMicrochip} style={{ fontSize: '9px', marginRight: '4px' }} />
                                      CPU: 0%
                                    </span>
                                    <span>RAM: 0 MB</span>
                                    <span>Disk: {srv.disk}</span>
                                  </div>

                                  {/* Footer IP */}
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                                    <span>
                                      <FontAwesomeIcon icon={faCloud} style={{ fontSize: '9px', marginRight: '4px' }} />
                                      {srv.ip}
                                    </span>
                                    <span style={{ color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <span>Manage</span>
                                      <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '9px' }} />
                                    </span>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 12-Column Drag & Drop Layout Grid for DASHBOARD OVERVIEW */}
            {activeTab === 'dashboard' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(12, 1fr)',
                  gap: '16px',
                  width: '100%',
                }}
              >
                {modules.map((mod, index) => {
                  const isDragging = draggedIndex === index;
                  const isOver = dragOverIndex === index;

                  return (
                    <div
                      key={mod.id}
                      draggable
                      onDragStart={(e) => {
                        setDraggedIndex(index);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        if (dragOverIndex !== index) {
                          setDragOverIndex(index);
                        }
                      }}
                      onDragLeave={() => {
                        if (dragOverIndex === index) {
                          setDragOverIndex(null);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedIndex !== null && draggedIndex !== index) {
                          moveDashModule(draggedIndex, index);
                        }
                        setDraggedIndex(null);
                        setDragOverIndex(null);
                      }}
                      onDragEnd={() => {
                        setDraggedIndex(null);
                        setDragOverIndex(null);
                      }}
                      style={{
                        gridColumn: `span ${mod.width}`,
                        background: mod.enabled ? 'var(--ds-card-bg, #161827)' : 'rgba(22, 24, 39, 0.4)',
                        border: isOver
                          ? `2px solid ${themeAccent}`
                          : isDragging
                            ? `2px dashed ${themeAccent}`
                            : mod.enabled
                              ? '1px solid var(--ds-border-color, rgba(255, 255, 255, 0.08))'
                              : '1px dashed rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        padding: '16px',
                        opacity: isDragging ? 0.35 : mod.enabled ? 1 : 0.45,
                        boxShadow: mod.enabled ? '0 4px 20px rgba(0, 0, 0, 0.25)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        position: 'relative',
                        transition: 'border-color 0.15s, opacity 0.15s',
                        cursor: 'grab',
                        userSelect: 'none',
                      }}
                    >
                      {/* Card Header Bar: Drag Handle, Title, Width, Controls */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          paddingBottom: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                          <div
                            style={{
                              cursor: 'grab',
                              color: '#64748b',
                              padding: '2px 4px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title='Drag to reorder'
                          >
                            <FontAwesomeIcon icon={faGripVertical} style={{ fontSize: '13px' }} />
                          </div>
                          <Badge size='xs' variant='outline' color='gray'>
                            #{index + 1}
                          </Badge>
                          <span
                            style={{
                              fontSize: '13px',
                              fontWeight: 600,
                              color: mod.enabled ? '#ffffff' : '#64748b',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {mod.name}
                          </span>
                        </div>

                        {/* Width selector & quick reorder */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                          <div
                            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span style={{ fontSize: '10px', color: '#94a3b8' }}>Width:</span>
                            <select
                              value={mod.width}
                              onChange={(e) => handleDashWidthChange(mod.id, parseInt(e.target.value, 10))}
                              style={{
                                background: '#1c1f33',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '4px',
                                color: '#e2e8f0',
                                fontSize: '11px',
                                padding: '2px 6px',
                                cursor: 'pointer',
                              }}
                            >
                              <option value={12}>Full (12 cols)</option>
                              <option value={8}>2/3 Width (8 cols)</option>
                              <option value={6}>Half Width (6 cols)</option>
                              <option value={4}>1/3 Width (4 cols)</option>
                            </select>
                          </div>

                          <div style={{ display: 'flex', gap: '2px' }} onClick={(e) => e.stopPropagation()}>
                            <button
                              type='button'
                              disabled={index === 0}
                              onClick={() => moveDashModule(index, index - 1)}
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: 'none',
                                borderRadius: '4px',
                                color: index === 0 ? '#334155' : '#94a3b8',
                                width: '20px',
                                height: '20px',
                                cursor: index === 0 ? 'default' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                              }}
                            >
                              <FontAwesomeIcon icon={faArrowUp} />
                            </button>
                            <button
                              type='button'
                              disabled={index === modules.length - 1}
                              onClick={() => moveDashModule(index, index + 1)}
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: 'none',
                                borderRadius: '4px',
                                color: index === modules.length - 1 ? '#334155' : '#94a3b8',
                                width: '20px',
                                height: '20px',
                                cursor: index === modules.length - 1 ? 'default' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                              }}
                            >
                              <FontAwesomeIcon icon={faArrowDown} />
                            </button>
                          </div>

                          <div onClick={(e) => e.stopPropagation()}>
                            <Switch
                              checked={mod.enabled}
                              onChange={(e) => handleDashToggle(mod.id, e.currentTarget.checked)}
                              color='indigo'
                              size='xs'
                            />
                          </div>
                        </div>
                      </div>

                      {/* REAL DASHBOARD PREVIEW COMPONENTS */}
                      <div style={{ width: '100%' }}>
                        {/* 1. Hero Header & Power Actions */}
                        {mod.id === 'hero_header' && (
                          <div
                            style={{
                              background: '#12141f',
                              border: '1px solid rgba(255, 255, 255, 0.06)',
                              borderRadius: '8px',
                              padding: '16px 20px',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#747d8c', display: 'inline-block' }} />
                                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>
                                    {serverName}
                                  </span>
                                  <span
                                    style={{
                                      background: 'rgba(255, 255, 255, 0.08)',
                                      color: '#94a3b8',
                                      fontSize: '10px',
                                      fontWeight: 600,
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      textTransform: 'uppercase',
                                    }}
                                  >
                                    OFFLINE
                                  </span>
                                  <span
                                    style={{
                                      background: 'rgba(255, 255, 255, 0.04)',
                                      color: '#cbd5e1',
                                      fontSize: '11px',
                                      fontFamily: 'monospace',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                    }}
                                  >
                                    {serverEgg}
                                  </span>
                                </div>
                              </div>

                              {/* Power Actions */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                  type='button'
                                  style={{
                                    background: 'var(--ds-power-start-bg, #40c057)',
                                    color: '#ffffff',
                                    border: '1px solid color-mix(in srgb, var(--ds-power-start-bg, #40c057) 80%, white)',
                                    borderRadius: '6px',
                                    padding: '6px 14px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <FontAwesomeIcon icon={faPlay} style={{ fontSize: '10px' }} />
                                  Start
                                </button>
                                <button
                                  type='button'
                                  style={{
                                    background: 'var(--ds-power-restart-bg, #868e96)',
                                    color: '#ffffff',
                                    border: '1px solid color-mix(in srgb, var(--ds-power-restart-bg, #868e96) 80%, white)',
                                    borderRadius: '6px',
                                    padding: '6px 12px',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                  }}
                                >
                                  <FontAwesomeIcon icon={faRotateRight} style={{ fontSize: '10px' }} />
                                  Restart
                                </button>
                                <button
                                  type='button'
                                  style={{
                                    background: 'var(--ds-power-stop-bg, #fa5252)',
                                    color: '#ffffff',
                                    border: '1px solid color-mix(in srgb, var(--ds-power-stop-bg, #fa5252) 80%, white)',
                                    borderRadius: '6px',
                                    padding: '6px 12px',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                  }}
                                >
                                  <FontAwesomeIcon icon={faStop} style={{ fontSize: '10px' }} />
                                  Stop
                                </button>
                                <button
                                  type='button'
                                  style={{
                                    background: 'color-mix(in srgb, var(--ds-power-stop-bg, #fa5252) 70%, black)',
                                    color: '#ff8787',
                                    border: '1px solid color-mix(in srgb, var(--ds-power-stop-bg, #fa5252) 60%, black)',
                                    borderRadius: '6px',
                                    padding: '6px 12px',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                  }}
                                >
                                  <FontAwesomeIcon icon={faSkull} style={{ fontSize: '10px' }} />
                                  Kill
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 2. System Metrics Cards (Matching Image 2) */}
                        {mod.id === 'metrics_stats' && (
                          <div style={{ width: '100%' }}>
                            <QunixResourceCharts previewMode={true} />
                          </div>
                        )}

                        {/* 3. Management Shortcuts */}
                        {mod.id === 'management_shortcuts' && (
                          <QunixManagementShortcuts isDemo width={mod.width} />
                        )}

                        {/* 4. SFTP Details Card */}
                        {mod.id === 'sftp_details' && (
                          <QunixSftpDetails
                            isDemo
                            sftpHost={sftpAddress.split(':')[0] || '127.0.0.1'}
                            sftpPort={sftpAddress.split(':')[1] || 2022}
                            sftpUsername={sftpUsername}
                            sftpUrl={`sftp://${sftpUsername}@${sftpAddress}`}
                          />
                        )}

                        {/* 5. Environment & Specifications Card */}
                        {mod.id === 'environment_specs' && (
                          <QunixEnvironmentSpecs
                            isDemo
                            serverUuid={serverId}
                            hostNode={serverNode}
                            eggName={serverEgg}
                            dockerImage={serverDocker}
                          />
                        )}

                        {/* 6. Embedded Terminal Console */}
                        {mod.id === 'terminal_console' && (
                          <div
                            style={{
                              background: '#090a10',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              borderRadius: '8px',
                              padding: '12px 16px',
                              fontFamily: 'monospace',
                              fontSize: '11px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                                paddingBottom: '8px',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FontAwesomeIcon icon={faTerminal} style={{ color: '#38bdf8', fontSize: '11px' }} />
                                <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '12px' }}>
                                  Console Terminal (xterm.js)
                                </span>
                                <span
                                  style={{
                                    background: 'rgba(56, 189, 248, 0.15)',
                                    color: '#38bdf8',
                                    fontSize: '9px',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    fontWeight: 600,
                                  }}
                                >
                                  24ms
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '11px' }}>
                                <span>Font: 14px</span>
                                <span>•</span>
                                <span>xterm-v6</span>
                              </div>
                            </div>

                            <div
                              style={{
                                background: '#040508',
                                borderRadius: '4px',
                                padding: '10px 12px',
                                color: '#94a3b8',
                                lineHeight: '1.6',
                                minHeight: '120px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                              }}
                            >
                              <div style={{ color: '#22c55e' }}>[Pterodactyl Daemon]: Server marked as RUNNING...</div>
                              <div style={{ color: '#64748b' }}>[Server] Loading environment configurations...</div>
                              <div style={{ color: '#cbd5e1' }}>[Server] Active on allocation 127.0.0.1:25565</div>                            </div>

                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                borderRadius: '6px',
                                padding: '6px 10px',
                              }}
                            >
                              <span style={{ color: '#38bdf8', fontWeight: 700 }}>❯</span>
                              <span style={{ color: '#64748b', fontStyle: 'italic', flex: 1 }}>Type a command...</span>
                              <span
                                style={{
                                  background: 'rgba(56, 189, 248, 0.2)',
                                  color: '#38bdf8',
                                  fontSize: '10px',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontWeight: 600,
                                }}
                              >
                                Send
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 12-Column Drag & Drop Layout Grid for SERVER CONSOLE */}
            {activeTab === 'console' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(12, 1fr)',
                  gap: '16px',
                  width: '100%',
                }}
              >
                {consoleModules.map((mod, index) => {
                  const isDragging = draggedIndex === index;
                  const isOver = dragOverIndex === index;

                  return (
                    <div
                      key={mod.id}
                      draggable
                      onDragStart={(e) => {
                        setDraggedIndex(index);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        if (dragOverIndex !== index) {
                          setDragOverIndex(index);
                        }
                      }}
                      onDragLeave={() => {
                        if (dragOverIndex === index) {
                          setDragOverIndex(null);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedIndex !== null && draggedIndex !== index) {
                          moveConsoleModule(draggedIndex, index);
                        }
                        setDraggedIndex(null);
                        setDragOverIndex(null);
                      }}
                      onDragEnd={() => {
                        setDraggedIndex(null);
                        setDragOverIndex(null);
                      }}
                      style={{
                        gridColumn: `span ${mod.width}`,
                        background: mod.enabled ? 'var(--ds-card-bg, #161827)' : 'rgba(22, 24, 39, 0.4)',
                        border: isOver
                          ? `2px solid ${themeAccent}`
                          : isDragging
                            ? `2px dashed ${themeAccent}`
                            : mod.enabled
                              ? '1px solid var(--ds-border-color, rgba(255, 255, 255, 0.08))'
                              : '1px dashed rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        padding: '16px',
                        opacity: isDragging ? 0.35 : mod.enabled ? 1 : 0.45,
                        boxShadow: mod.enabled ? '0 4px 20px rgba(0, 0, 0, 0.25)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        position: 'relative',
                        transition: 'border-color 0.15s, opacity 0.15s',
                        cursor: 'grab',
                        userSelect: 'none',
                      }}
                    >
                      {/* Header Bar */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          paddingBottom: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                          <div
                            style={{
                              cursor: 'grab',
                              color: '#64748b',
                              padding: '2px 4px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title='Drag to reorder'
                          >
                            <FontAwesomeIcon icon={faGripVertical} style={{ fontSize: '13px' }} />
                          </div>
                          <Badge size='xs' variant='outline' color='gray'>
                            #{index + 1}
                          </Badge>
                          <span
                            style={{
                              fontSize: '13px',
                              fontWeight: 600,
                              color: mod.enabled ? '#ffffff' : '#64748b',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {mod.name}
                          </span>
                        </div>

                        {/* Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                          <div
                            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span style={{ fontSize: '10px', color: '#94a3b8' }}>Width:</span>
                            <select
                              value={mod.width}
                              onChange={(e) => handleConsoleWidthChange(mod.id, parseInt(e.target.value, 10))}
                              style={{
                                background: '#1c1f33',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '4px',
                                color: '#e2e8f0',
                                fontSize: '11px',
                                padding: '2px 6px',
                                cursor: 'pointer',
                              }}
                            >
                              <option value={12}>Full (12 cols)</option>
                              <option value={8}>2/3 Width (8 cols)</option>
                              <option value={6}>Half Width (6 cols)</option>
                              <option value={4}>1/3 Width (4 cols)</option>
                            </select>
                          </div>

                          <div style={{ display: 'flex', gap: '2px' }} onClick={(e) => e.stopPropagation()}>
                            <button
                              type='button'
                              disabled={index === 0}
                              onClick={() => moveConsoleModule(index, index - 1)}
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: 'none',
                                borderRadius: '4px',
                                color: index === 0 ? '#334155' : '#94a3b8',
                                width: '20px',
                                height: '20px',
                                cursor: index === 0 ? 'default' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                              }}
                            >
                              <FontAwesomeIcon icon={faArrowUp} />
                            </button>
                            <button
                              type='button'
                              disabled={index === consoleModules.length - 1}
                              onClick={() => moveConsoleModule(index, index + 1)}
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: 'none',
                                borderRadius: '4px',
                                color: index === consoleModules.length - 1 ? '#334155' : '#94a3b8',
                                width: '20px',
                                height: '20px',
                                cursor: index === consoleModules.length - 1 ? 'default' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                              }}
                            >
                              <FontAwesomeIcon icon={faArrowDown} />
                            </button>
                          </div>

                          <div onClick={(e) => e.stopPropagation()}>
                            <Switch
                              checked={mod.enabled}
                              onChange={(e) => handleConsoleToggle(mod.id, e.currentTarget.checked)}
                              color='indigo'
                              size='xs'
                            />
                          </div>
                        </div>
                      </div>

                      {/* REAL CONSOLE PREVIEW COMPONENTS */}
                      <div style={{ width: '100%' }}>
                        {/* 1. Infobar & Power Controls */}
                        {mod.id === 'console_infobar' && (
                          <div
                            style={{
                              background: '#12141f',
                              border: '1px solid rgba(255, 255, 255, 0.06)',
                              borderRadius: '8px',
                              padding: '12px 18px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '12px',
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>
                                {serverName}
                              </div>
                              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                                {serverDescription}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                type='button'
                                style={{
                                  background: 'var(--ds-power-start-bg, #40c057)',
                                  color: '#ffffff',
                                  border: '1px solid color-mix(in srgb, var(--ds-power-start-bg, #40c057) 80%, white)',
                                  borderRadius: '6px',
                                  padding: '6px 12px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                              >
                                <FontAwesomeIcon icon={faPlay} style={{ fontSize: '9px' }} />
                                Start
                              </button>
                              <button
                                type='button'
                                style={{
                                  background: 'var(--ds-power-restart-bg, #868e96)',
                                  color: '#ffffff',
                                  border: '1px solid color-mix(in srgb, var(--ds-power-restart-bg, #868e96) 80%, white)',
                                  borderRadius: '6px',
                                  padding: '6px 12px',
                                  fontSize: '11px',
                                  fontWeight: 500,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                              >
                                <FontAwesomeIcon icon={faRotateRight} style={{ fontSize: '9px' }} />
                                Restart
                              </button>
                              <button
                                type='button'
                                style={{
                                  background: 'var(--ds-power-stop-bg, #fa5252)',
                                  color: '#ffffff',
                                  border: '1px solid color-mix(in srgb, var(--ds-power-stop-bg, #fa5252) 80%, white)',
                                  borderRadius: '6px',
                                  padding: '6px 12px',
                                  fontSize: '11px',
                                  fontWeight: 500,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                              >
                                <FontAwesomeIcon icon={faStop} style={{ fontSize: '9px' }} />
                                Stop
                              </button>
                              <button
                                type='button'
                                style={{
                                  background: 'color-mix(in srgb, var(--ds-power-stop-bg, #fa5252) 70%, black)',
                                  color: '#ff8787',
                                  border: '1px solid color-mix(in srgb, var(--ds-power-stop-bg, #fa5252) 60%, black)',
                                  borderRadius: '6px',
                                  padding: '6px 10px',
                                  fontSize: '11px',
                                  fontWeight: 500,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                              >
                                <FontAwesomeIcon icon={faSkull} style={{ fontSize: '9px' }} />
                                Kill
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 2. Interactive Terminal with Live Editor Resizing */}
                        {mod.id === 'console_terminal' && (() => {
                          const effectiveHeight = editorResizingModId === mod.id && editorLiveHeight
                            ? editorLiveHeight
                            : (mod.height || 320);

                          return (
                            <div
                              style={{
                                background: '#090a10',
                                border: editorResizingModId === mod.id ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '8px',
                                padding: '12px 16px',
                                fontFamily: 'monospace',
                                fontSize: '11px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                height: `${effectiveHeight}px`,
                                minHeight: '220px',
                                position: 'relative',
                                transition: editorResizingModId === mod.id ? 'none' : 'height 0.15s ease, border-color 0.15s ease',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                                  paddingBottom: '8px',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <FontAwesomeIcon icon={faTerminal} style={{ color: '#38bdf8', fontSize: '11px' }} />
                                  <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '12px' }}>
                                    Console Terminal (xterm.js)
                                  </span>
                                  <span
                                    style={{
                                      background: 'rgba(56, 189, 248, 0.15)',
                                      color: '#38bdf8',
                                      fontSize: '9px',
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      fontWeight: 600,
                                    }}
                                  >
                                    Connected
                                  </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span
                                    style={{
                                      background: mod.height ? 'rgba(56, 189, 248, 0.12)' : 'rgba(168, 85, 247, 0.12)',
                                      color: mod.height ? '#38bdf8' : '#c084fc',
                                      border: mod.height ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(168, 85, 247, 0.3)',
                                      borderRadius: '4px',
                                      padding: '2px 8px',
                                      fontSize: '10px',
                                      fontWeight: 600,
                                      fontFamily: 'monospace',
                                    }}
                                  >
                                    {mod.height ? `Height: ${mod.height}px` : 'Auto-scale'}
                                  </span>
                                  {mod.height && (
                                    <button
                                      type='button'
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleConsoleHeightChange(mod.id, undefined);
                                      }}
                                      style={{
                                        background: 'rgba(255, 255, 255, 0.06)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '4px',
                                        color: '#94a3b8',
                                        fontSize: '10px',
                                        padding: '2px 8px',
                                        cursor: 'pointer',
                                      }}
                                      title='Reset to auto-scale with server stats'
                                    >
                                      Reset
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div
                                style={{
                                  background: '#040508',
                                  borderRadius: '4px',
                                  padding: '12px 14px',
                                  color: '#94a3b8',
                                  lineHeight: '1.6',
                                  flex: 1,
                                  minHeight: 0,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'center',
                                  overflow: 'hidden',
                                }}
                              >
                                <div style={{ color: '#22c55e' }}>[Daemon]: Container initialized with 4 Cores, 4096 MiB RAM</div>
                                <div style={{ color: '#64748b' }}>[System]: Mounting volumes and initializing xterm buffer...</div>
                                <div style={{ color: '#cbd5e1' }}>[Process]: Server listening on 127.0.0.1:25565</div>
                                <div style={{ color: '#38bdf8' }}>admin@server:~$ _</div>
                              </div>

                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  background: 'rgba(255, 255, 255, 0.03)',
                                  border: '1px solid rgba(255, 255, 255, 0.06)',
                                  borderRadius: '6px',
                                  padding: '6px 10px',
                                }}
                              >
                                <span style={{ color: '#38bdf8', fontWeight: 700 }}>❯</span>
                                <span style={{ color: '#64748b', fontStyle: 'italic', flex: 1 }}>Type a server command...</span>
                                <span
                                  style={{
                                    background: 'rgba(56, 189, 248, 0.2)',
                                    color: '#38bdf8',
                                    fontSize: '10px',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontWeight: 600,
                                  }}
                                >
                                  Send
                                </span>
                              </div>

                              {/* Live Resize Drag Handle in Layout Editor */}
                              <div
                                onMouseDown={(e) => handleEditorResizeStart(e, effectiveHeight, mod.id)}
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  handleConsoleHeightChange(mod.id, undefined);
                                }}
                                title='Drag to resize console preview • Double-click to reset to Auto-scale'
                                style={{
                                  width: '100%',
                                  padding: '6px 0',
                                  cursor: 'row-resize',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '3px',
                                  userSelect: 'none',
                                  borderTop: '1px dashed rgba(255, 255, 255, 0.1)',
                                  background: editorResizingModId === mod.id ? 'rgba(56, 189, 248, 0.14)' : 'rgba(56, 189, 248, 0.04)',
                                  borderRadius: '0 0 6px 6px',
                                  transition: 'background 0.15s ease',
                                }}
                              >
                                <div
                                  style={{
                                    width: '44px',
                                    height: '4px',
                                    borderRadius: '2px',
                                    background: editorResizingModId === mod.id ? '#38bdf8' : 'rgba(255, 255, 255, 0.25)',
                                  }}
                                />
                                <span
                                  style={{
                                    fontSize: '10px',
                                    color: editorResizingModId === mod.id ? '#38bdf8' : '#94a3b8',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  ↕ Drag to Resize Console ({effectiveHeight}px)
                                </span>
                              </div>
                            </div>
                          );
                        })()}

                        {/* 3. Server Details */}
                        {mod.id === 'server_details' && (
                          <div
                            style={{
                              background: '#12141f',
                              border: '1px solid rgba(255, 255, 255, 0.06)',
                              borderRadius: '8px',
                              padding: '16px 18px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px',
                            }}
                          >
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <FontAwesomeIcon icon={faLayerGroup} style={{ color: '#38bdf8' }} />
                              Server Information
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '4px' }}>
                                <span style={{ color: '#94a3b8' }}>Node</span>
                                <span style={{ fontFamily: 'monospace', color: '#f1f5f9' }}>{serverNode}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '4px' }}>
                                <span style={{ color: '#94a3b8' }}>Allocation</span>
                                <span style={{ fontFamily: 'monospace', color: '#f1f5f9' }}>{serverAllocation}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '4px' }}>
                                <span style={{ color: '#94a3b8' }}>Template</span>
                                <span style={{ fontFamily: 'monospace', color: '#f1f5f9' }}>{serverEgg}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#94a3b8' }}>SFTP</span>
                                <span style={{ fontFamily: 'monospace', color: '#f1f5f9' }}>{sftpAddress}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 4. Server Stats */}
                        {mod.id === 'server_stats' && (
                          <div
                            style={{
                              background: '#12141f',
                              border: '1px solid rgba(255, 255, 255, 0.06)',
                              borderRadius: '8px',
                              padding: '16px 20px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FontAwesomeIcon icon={faMicrochip} style={{ color: '#60a5fa' }} />
                                Resource Graphs & Utilization
                              </span>
                              <span style={{ fontSize: '10px', color: '#64748b' }}>Live Poll: 2s</span>
                            </div>

                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                gap: '12px',
                              }}
                            >
                              <div style={{ background: '#0a0b12', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                                <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>CPU Load</div>
                                <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'monospace', color: accentTextColor, margin: '4px 0' }}>0.0%</div>
                                <Progress value={0} size='xs' color={themeAccent} />
                              </div>

                              <div style={{ background: '#0a0b12', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                                <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Memory</div>
                                <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'monospace', color: '#c084fc', margin: '4px 0' }}>420 MiB</div>
                                <Progress value={10} size='xs' color='grape' />
                              </div>

                              <div style={{ background: '#0a0b12', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                                <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Disk Space</div>
                                <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'monospace', color: '#34d399', margin: '4px 0' }}>456 MiB</div>
                                <Progress value={1} size='xs' color='teal' />
                              </div>

                              <div style={{ background: '#0a0b12', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                                <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Network In/Out</div>
                                <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'monospace', color: '#fbbf24', margin: '4px 0' }}>0 B / 0 B</div>
                                <Progress value={0} size='xs' color='yellow' />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 5. Qunix 4-Stat Metrics Cards */}
                        {mod.id === 'qunix_metrics_grid' && (
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                              gap: '12px',
                            }}
                          >
                            <div style={{ background: '#12141f', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '12px 14px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '10px', fontWeight: 600, color: accentTextColor, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <FontAwesomeIcon icon={faMicrochip} /> CPU
                                </span>
                                <span style={{ fontSize: '10px', color: '#64748b' }}>400%</span>
                              </div>
                              <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'monospace', color: '#f8fafc', margin: '4px 0' }}>0.0%</div>
                              <Progress value={0} size='xs' color={themeAccent} />
                            </div>
                            <div style={{ background: '#12141f', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '12px 14px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '10px', fontWeight: 600, color: '#c084fc', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <FontAwesomeIcon icon={faMemory} /> MEMORY
                                </span>
                                <span style={{ fontSize: '10px', color: '#64748b' }}>4 GiB</span>
                              </div>
                              <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'monospace', color: '#f8fafc', margin: '4px 0' }}>0 B</div>
                              <Progress value={0} size='xs' color='grape' />
                            </div>
                            <div style={{ background: '#12141f', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '12px 14px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '10px', fontWeight: 600, color: '#34d399', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <FontAwesomeIcon icon={faHardDrive} /> DISK
                                </span>
                                <span style={{ fontSize: '10px', color: '#64748b' }}>50 GiB</span>
                              </div>
                              <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'monospace', color: '#f8fafc', margin: '4px 0' }}>456 MiB</div>
                              <Progress value={1} size='xs' color='teal' />
                            </div>
                            <div style={{ background: '#12141f', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '12px 14px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '10px', fontWeight: 600, color: '#fbbf24', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <FontAwesomeIcon icon={faEthernet} /> NETWORK
                                </span>
                                <span style={{ fontSize: '10px', color: '#64748b' }}>Total</span>
                              </div>
                              <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'monospace', color: '#f8fafc', margin: '4px 0' }}>0 B</div>
                              <Progress value={0} size='xs' color='yellow' />
                            </div>
                          </div>
                        )}

                        {/* 6. Qunix Navigation Shortcuts */}
                        {mod.id === 'qunix_quick_actions' && (
                          <div
                            style={{
                              background: '#12141f',
                              border: '1px solid rgba(255, 255, 255, 0.06)',
                              borderRadius: '8px',
                              padding: '14px 18px',
                            }}
                          >
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <FontAwesomeIcon icon={faSliders} style={{ color: '#a855f7' }} />
                              Qunix Navigation Shortcuts
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px' }}>
                              {[
                                { label: 'Files', icon: faFolderOpen, color: '#60a5fa' },
                                { label: 'Databases', icon: faDatabase, color: '#c084fc' },
                                { label: 'Backups', icon: faBoxArchive, color: '#34d399' },
                                { label: 'Schedules', icon: faStopwatch, color: '#fbbf24' },
                                { label: 'Configuration', icon: faCog, color: '#94a3b8' },
                              ].map((btn) => (
                                <div
                                  key={btn.label}
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.06)',
                                    borderRadius: '6px',
                                    padding: '8px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '11px',
                                    color: '#cbd5e1',
                                  }}
                                >
                                  <FontAwesomeIcon icon={btn.icon} style={{ color: btn.color }} />
                                  <span>{btn.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 7. SFTP Details */}
                        {mod.id === 'sftp_details' && (
                          <div
                            style={{
                              background: '#12141f',
                              border: '1px solid rgba(255, 255, 255, 0.06)',
                              borderRadius: '8px',
                              padding: '14px 18px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FontAwesomeIcon icon={faShieldHalved} /> SFTP Connection
                              </span>
                              <span style={{ fontSize: '10px', color: '#64748b' }}>Port 2022</span>
                            </div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '4px' }}>
                              <span>Host</span>
                              <span style={{ fontFamily: 'monospace', color: '#f8fafc' }}>{sftpAddress}</span>
                            </div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                              <span>User</span>
                              <span style={{ fontFamily: 'monospace', color: '#f8fafc' }}>{sftpUsername}</span>
                            </div>
                          </div>
                        )}

                        {/* 8. Environment & Specifications */}
                        {mod.id === 'environment_specs' && (
                          <div
                            style={{
                              background: '#12141f',
                              border: '1px solid rgba(255, 255, 255, 0.06)',
                              borderRadius: '8px',
                              padding: '14px 18px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px',
                            }}
                          >
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <FontAwesomeIcon icon={faLayerGroup} /> Environment Specs
                            </div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '4px' }}>
                              <span>Node</span>
                              <span style={{ fontFamily: 'monospace', color: '#f8fafc' }}>{serverNode}</span>
                            </div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                              <span>Image</span>
                              <span style={{ fontFamily: 'monospace', color: '#f8fafc' }}>{serverDocker.slice(0, 24)}...</span>
                            </div>
                          </div>
                        )}

                        {/* 9. Hero Banner */}
                        {mod.id === 'hero_banner' && (
                          <div
                            style={{
                              background: '#181926',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              borderRadius: '8px',
                              padding: '16px 20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '12px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(108, 92, 231, 0.2)', border: '1px solid rgba(108, 92, 231, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a29bfe' }}>
                                <FontAwesomeIcon icon={faServer} style={{ fontSize: '18px' }} />
                              </div>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>{serverName}</span>
                                  <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', fontSize: '9px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px' }}>RUNNING</span>
                                </div>
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{serverDescription}</span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button type='button' style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 12px', fontSize: '11px', fontWeight: 600 }}>Start</button>
                              <button type='button' style={{ background: '#64748b', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 10px', fontSize: '11px' }}>Restart</button>
                              <button type='button' style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 10px', fontSize: '11px' }}>Stop</button>
                            </div>
                          </div>
                        )}

                        {/* 10. Compact Sparklines */}
                        {mod.id === 'compact_sparklines' && (
                          <div
                            style={{
                              background: '#12141f',
                              border: '1px solid rgba(255, 255, 255, 0.06)',
                              borderRadius: '8px',
                              padding: '12px 16px',
                              display: 'grid',
                              gridTemplateColumns: 'repeat(4, 1fr)',
                              gap: '12px',
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: accentTextColor, marginBottom: '4px' }}>
                                <span>CPU</span><span>24%</span>
                              </div>
                              <Progress value={24} size='xs' color={themeAccent} />
                            </div>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#c084fc', marginBottom: '4px' }}>
                                <span>RAM</span><span>1.2 GiB</span>
                              </div>
                              <Progress value={30} size='xs' color='grape' />
                            </div>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#34d399', marginBottom: '4px' }}>
                                <span>DISK</span><span>14 GiB</span>
                              </div>
                              <Progress value={28} size='xs' color='teal' />
                            </div>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#fbbf24', marginBottom: '4px' }}>
                                <span>NET</span><span>↓ 42 KiB</span>
                              </div>
                              <Progress value={12} size='xs' color='yellow' />
                            </div>
                          </div>
                        )}

                        {/* 11. Quick Links Widget */}
                        {mod.id === 'quick_links_widget' && (
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(4, 1fr)',
                              gap: '12px',
                            }}
                          >
                            {[
                              { title: 'Billing', sub: 'Invoices & plans', color: '#38bdf8' },
                              { title: 'Discord', sub: 'Community & help', color: '#818cf8' },
                              { title: 'Website', sub: 'Pricing & docs', color: '#a78bfa' },
                              { title: 'Support', sub: 'Open a ticket', color: '#f472b6' },
                            ].map((l) => (
                              <div
                                key={l.title}
                                style={{
                                  background: 'rgba(255, 255, 255, 0.03)',
                                  border: '1px solid rgba(255, 255, 255, 0.08)',
                                  borderRadius: '8px',
                                  padding: '12px 14px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  minHeight: '70px',
                                }}
                              >
                                <div>
                                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>{l.sub}</span>
                                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>{l.title}</div>
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: 600, color: l.color, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span>Visit</span>
                                  <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '9px' }} />
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QunixCustomLayoutBuilder;
