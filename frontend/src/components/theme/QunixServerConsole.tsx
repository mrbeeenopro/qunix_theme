import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router';
import classNames from 'classnames';
import { Skeleton, Box, Group as MantineGroup, Stack, Text, Badge, Center, Loader, Progress } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrochip,
  faMemory,
  faHardDrive,
  faEthernet,
  faCopy,
  faCheck,
  faFolderOpen,
  faDatabase,
  faBoxArchive,
  faStopwatch,
  faUsers,
  faCog,
  faShieldHalved,
  faServer,
  faLayerGroup,
  faExternalLinkAlt,
  faPlay,
  faRotateRight,
  faStop,
  faArrowsUpDown,
  faCreditCard,
  faGlobe,
  faHeadset,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { ServerCan } from '@/elements/Can.tsx';
import ServerContentContainer from '@/elements/containers/ServerContentContainer.tsx';
import { useNavbarPageHeader } from '@/elements/containers/useNavbarPageHeader.ts';
import Group from '@/elements/layout/Group.tsx';
import Title from '@/elements/typography/Title.tsx';
import { useVisualViewportBottomInset } from '@/plugins/viewport/useVisualViewport.ts';
import { useTranslations } from '@/providers/TranslationProvider.tsx';
import { useAuth } from '@/providers/AuthProvider.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useServerStore } from '@/stores/server.ts';
import { bytesToString, mbToBytes } from '@/lib/format/size.ts';
import { formatAllocation } from '@/lib/domain/server.ts';
import { getBannerUrl, getEggImageUrl } from '../../lib/eggResolver.ts';
import ServerDetails from '@/pages/server/console/stats/ServerDetails.tsx';
import ServerPowerControls from '@/pages/server/console/stats/ServerPowerControls.tsx';
import ServerStats from '@/pages/server/console/stats/ServerStats.tsx';
import Console from '@/pages/server/console/terminal/Console.tsx';
import { QunixServerConsoleSkeleton } from './QunixSkeletonLoader.tsx';
import { loadSavedConsoleLayout, ConsoleModule, getColSpanClass } from '../../lib/dashboardLayout.ts';

/**
 * Qunix Modern Flat Server Console
 * Supports modular drag-and-drop customizable layout synchronized with admin dashboard-layout builder.
 * Incorporates Qunix & Calagopus modular components and configurable height auto-resize options.
 */
export default function QunixServerConsole() {
  const { t } = useTranslations();
  const { user } = useAuth();
  const { addToast } = useToast();
  const server = useServerStore((state) => state.server);
  const stats = useServerStore((state) => state.stats);
  const keyboardInset = useVisualViewportBottomInset();
  const titleHoisted = useNavbarPageHeader({ title: server.name, subtitle: server.description || undefined });

  const infobarRef = useRef<HTMLDivElement>(null);
  const [infobarStuck, setInfobarStuck] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [consoleModules, setConsoleModules] = useState<ConsoleModule[]>(loadSavedConsoleLayout);

  const copyToClipboard = (text: string, label: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedField(label);
    addToast(`Copied ${label} to clipboard`, 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setConsoleModules(e.detail);
      } else {
        setConsoleModules(loadSavedConsoleLayout());
      }
    };
    window.addEventListener('qunix-custom-console-updated', handleUpdate);
    return () => {
      window.removeEventListener('qunix-custom-console-updated', handleUpdate);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const updateStuckState = () => {
      const scrollY =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;

      let isStuck = scrollY > 15;
      if (!isStuck && infobarRef.current) {
        const rect = infobarRef.current.getBoundingClientRect();
        if (rect.top <= 2 && scrollY > 0) {
          isStuck = true;
        }
      }

      setInfobarStuck(isStuck);
      if (infobarRef.current) {
        if (isStuck) {
          infobarRef.current.classList.add('qunix-infobar-stuck');
          document.documentElement.classList.add('qunix-infobar-stuck');
        } else {
          infobarRef.current.classList.remove('qunix-infobar-stuck');
          document.documentElement.classList.remove('qunix-infobar-stuck');
        }
      }
    };

    window.addEventListener('scroll', updateStuckState, { capture: true, passive: true });
    document.addEventListener('scroll', updateStuckState, { capture: true, passive: true });
    window.addEventListener('resize', updateStuckState, { passive: true });
    window.addEventListener('touchmove', updateStuckState, { passive: true });

    updateStuckState();

    return () => {
      document.documentElement.classList.remove('qunix-infobar-stuck');
      window.removeEventListener('scroll', updateStuckState, { capture: true } as any);
      document.removeEventListener('scroll', updateStuckState, { capture: true } as any);
      window.removeEventListener('resize', updateStuckState);
      window.removeEventListener('touchmove', updateStuckState);
    };
  }, []);

  const [settings, setSettings] = useState<any>(() => {
    if (typeof window !== 'undefined' && (window as any).qunixThemeSettings) {
      return (window as any).qunixThemeSettings;
    }
    try {
      const cached = localStorage.getItem('qunix_theme_settings');
      if (cached) return JSON.parse(cached);
    } catch (_) { }
    return null;
  });

  useEffect(() => {
    const handleSettingsUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setSettings(detail);
      } else if (typeof window !== 'undefined' && (window as any).qunixThemeSettings) {
        setSettings((window as any).qunixThemeSettings);
      }
    };
    window.addEventListener('qunix-settings-loaded', handleSettingsUpdate);
    window.addEventListener('qunix-theme-settings-changed', handleSettingsUpdate);
    return () => {
      window.removeEventListener('qunix-settings-loaded', handleSettingsUpdate);
      window.removeEventListener('qunix-theme-settings-changed', handleSettingsUpdate);
    };
  }, []);

  const s = settings || (typeof window !== 'undefined' ? (window as any).qunixThemeSettings : null);
  const resolvedConsoleStyle =
    s?.console_style ||
    s?.consoleStyle ||
    (typeof document !== 'undefined' ? document.documentElement.getAttribute('data-console-style') : null) ||
    'default';
  const isDefaultStyle = resolvedConsoleStyle === 'default';
  const isCustom = resolvedConsoleStyle === 'custom';
  const disableAutoResize = s?.disable_console_auto_resize === true || s?.disableConsoleAutoResize === true;

  if (!server?.uuid) {
    const useSkeleton = s?.enable_skeleton_loader !== false;
    return (
      <ServerContentContainer
        title={t('pages.server.console.title', {})}
        hideTitleComponent
        registry={(window as any).extensionContext?.extensionRegistry?.pages?.server?.console?.container}
      >
        {useSkeleton ? (
          <QunixServerConsoleSkeleton />
        ) : (
          <Center py='xl'>
            <Loader color={s?.spinner_color || '#6c5ce7'} size={36} type={s?.spinner_type || 'oval'} />
          </Center>
        )}
      </ServerContentContainer>
    );
  }

  const renderInfobar = () => (
    <div
      ref={infobarRef}
      id='console-infobar'
      className={classNames(
        isDefaultStyle
          ? 'sticky z-20 bg-(--mantine-color-body) mb-4 py-2 -mx-4 lg:-mx-6 pr-4 lg:px-6 transition-[padding] duration-150 border-b border-[var(--ds-border-color,rgba(255,255,255,0.06))]'
          : 'relative z-10 mb-4',
        isDefaultStyle ? 'top-0' : '',
        isDefaultStyle && infobarStuck ? 'qunix-infobar-stuck' : '',
      )}
    >
      <Group
        justify={isDefaultStyle ? 'center' : 'space-between'}
        align='center'
        className={classNames(
          'w-full',
          { 'min-h-12 lg:min-h-0': isDefaultStyle && titleHoisted },
          isDefaultStyle ? 'lg:justify-between!' : '',
        )}
      >
        <div
          className={classNames(
            'min-w-0 flex-1 mr-2 flex-col justify-center',
            isDefaultStyle ? 'hidden lg:flex!' : 'flex',
          )}
        >
          <Title
            order={1}
            lineClamp={1}
            className='truncate text-xl! lg:text-3xl!'
          >
            {server.name}
          </Title>
          {server.description && (
            <p className='text-sm text-(--mantine-color-dimmed)! truncate hidden sm:block'>{server.description}</p>
          )}
        </div>
        <div
          className={classNames(
            'shrink-0 flex items-center',
            isDefaultStyle ? 'justify-center w-full lg:w-auto' : 'w-full sm:w-auto justify-end',
          )}
        >
          <ServerCan action={['control.start', 'control.stop', 'control.restart']} matchAny>
            <ServerPowerControls />
          </ServerCan>
        </div>
      </Group>
    </div>
  );

  const terminalWrapperRef = useRef<HTMLDivElement>(null);
  const terminalMod = consoleModules.find((m) => m.id === 'console_terminal');
  const configuredTerminalHeight = terminalMod?.height || (() => {
    try {
      const saved = localStorage.getItem('qunix_custom_console_height');
      return saved ? parseInt(saved, 10) : null;
    } catch (_) {
      return null;
    }
  })();

  const renderTerminal = () => {
    const hasCustomHeight = typeof configuredTerminalHeight === 'number' && configuredTerminalHeight > 100;
    const computedHeight = hasCustomHeight
      ? `${configuredTerminalHeight}px`
      : disableAutoResize
        ? '520px'
        : isCustom
          ? '100%'
          : 'min(750px, calc(100vh - 220px))';

    return (
      <div
        ref={terminalWrapperRef}
        className={classNames(
          'qunix-console-terminal-wrapper flex flex-col w-full relative',
          isCustom && !hasCustomHeight ? 'flex-1 h-full min-h-[460px]' : ''
        )}
        style={{
          height: computedHeight,
          minHeight: '360px',
          ...(keyboardInset > 0 ? { height: `max(8rem, min(60vh, calc(100dvh - ${keyboardInset}px - 7rem)))` } : {}),
        }}
      >
        <div className='flex-1 min-h-0 w-full overflow-hidden flex flex-col'>
          <Console />
        </div>
      </div>
    );
  };

  const renderDetails = () => (
    <div className='flex flex-col min-w-0'>
      <ServerDetails />
    </div>
  );

  const renderStats = () => <ServerStats />;

  const renderMetricsGrid = () => {
    const cpuAbsolute = stats?.cpuAbsolute || 0;
    const cpuLimit = server?.limits?.cpu || 0;
    const cpuPercent = cpuLimit > 0 ? Math.min(100, Math.round((cpuAbsolute / cpuLimit) * 100)) : Math.round(cpuAbsolute);

    const memoryBytes = stats?.memoryBytes || 0;
    const memoryLimitMb = server?.limits?.memory || 0;
    const memoryLimitBytes = memoryLimitMb > 0 ? mbToBytes(memoryLimitMb) : 0;
    const memoryPercent = memoryLimitBytes > 0 ? Math.min(100, Math.round((memoryBytes / memoryLimitBytes) * 100)) : 0;

    const diskBytes = stats?.diskBytes || 0;
    const diskLimitMb = server?.limits?.disk || 0;
    const diskLimitBytes = diskLimitMb > 0 ? mbToBytes(diskLimitMb) : 0;
    const diskPercent = diskLimitBytes > 0 ? Math.min(100, Math.round((diskBytes / diskLimitBytes) * 100)) : 0;

    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
        {/* CPU */}
        <div className='qunix-card-flat p-3.5 flex flex-col justify-between min-h-[105px]'>
          <div className='flex justify-between items-center mb-1'>
            <span className='text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5'>
              <FontAwesomeIcon icon={faMicrochip} className='text-blue-400' />
              CPU Load
            </span>
            <span className='text-xs font-mono text-neutral-400'>
              {cpuLimit > 0 ? `${cpuLimit}%` : 'Unl.'}
            </span>
          </div>
          <div className='text-xl font-bold font-mono tracking-tight text-white my-0.5'>
            {cpuAbsolute.toFixed(1)}%
          </div>
          <div>
            <Progress value={cpuPercent} color={cpuPercent > 90 ? 'red' : cpuPercent > 75 ? 'yellow' : 'blue'} size='xs' radius='xs' />
            <div className='flex justify-between text-[10px] text-neutral-500 mt-1 font-mono'>
              <span>Usage</span>
              <span>{cpuPercent}%</span>
            </div>
          </div>
        </div>

        {/* Memory */}
        <div className='qunix-card-flat p-3.5 flex flex-col justify-between min-h-[105px]'>
          <div className='flex justify-between items-center mb-1'>
            <span className='text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5'>
              <FontAwesomeIcon icon={faMemory} className='text-purple-400' />
              Memory
            </span>
            <span className='text-xs font-mono text-neutral-400'>
              {memoryLimitMb > 0 ? bytesToString(memoryLimitBytes) : 'Unl.'}
            </span>
          </div>
          <div className='text-xl font-bold font-mono tracking-tight text-white my-0.5'>
            {bytesToString(memoryBytes)}
          </div>
          <div>
            <Progress value={memoryPercent} color={memoryPercent > 90 ? 'red' : memoryPercent > 75 ? 'yellow' : 'grape'} size='xs' radius='xs' />
            <div className='flex justify-between text-[10px] text-neutral-500 mt-1 font-mono'>
              <span>Allocated</span>
              <span>{memoryPercent}%</span>
            </div>
          </div>
        </div>

        {/* Disk */}
        <div className='qunix-card-flat p-3.5 flex flex-col justify-between min-h-[105px]'>
          <div className='flex justify-between items-center mb-1'>
            <span className='text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5'>
              <FontAwesomeIcon icon={faHardDrive} className='text-emerald-400' />
              Disk Space
            </span>
            <span className='text-xs font-mono text-neutral-400'>
              {diskLimitMb > 0 ? bytesToString(diskLimitBytes) : 'Unl.'}
            </span>
          </div>
          <div className='text-xl font-bold font-mono tracking-tight text-white my-0.5'>
            {bytesToString(diskBytes)}
          </div>
          <div>
            <Progress value={diskPercent} color={diskPercent > 90 ? 'red' : diskPercent > 75 ? 'yellow' : 'teal'} size='xs' radius='xs' />
            <div className='flex justify-between text-[10px] text-neutral-500 mt-1 font-mono'>
              <span>Capacity</span>
              <span>{diskPercent}%</span>
            </div>
          </div>
        </div>

        {/* Network */}
        <div className='qunix-card-flat p-3.5 flex flex-col justify-between min-h-[105px]'>
          <div className='flex justify-between items-center mb-1'>
            <span className='text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5'>
              <FontAwesomeIcon icon={faEthernet} className='text-amber-400' />
              Network
            </span>
            <span className='text-xs font-mono text-neutral-400'>Total</span>
          </div>
          <div className='text-lg font-bold font-mono tracking-tight text-white my-0.5'>
            {bytesToString((stats?.network?.rxBytes || 0) + (stats?.network?.txBytes || 0))}
          </div>
          <div className='flex justify-between text-[10px] text-neutral-400 font-mono pt-1 border-t border-white/5'>
            <span>↓ {bytesToString(stats?.network?.rxBytes || 0)}</span>
            <span>↑ {bytesToString(stats?.network?.txBytes || 0)}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderQuickActions = () => {
    const serverId = server.uuidShort || server.uuid;
    const quickActions = [
      { name: 'Files', icon: faFolderOpen, path: `/server/${serverId}/files`, color: '#60a5fa' },
      { name: 'Databases', icon: faDatabase, path: `/server/${serverId}/databases`, color: '#c084fc' },
      { name: 'Backups', icon: faBoxArchive, path: `/server/${serverId}/backups`, color: '#34d399' },
      { name: 'Schedules', icon: faStopwatch, path: `/server/${serverId}/schedules`, color: '#fbbf24' },
      { name: 'Users', icon: faUsers, path: `/server/${serverId}/users`, color: '#f472b6' },
      { name: 'Settings', icon: faCog, path: `/server/${serverId}/settings`, color: '#94a3b8' },
    ];
    return (
      <div className='qunix-card-flat p-3.5'>
        <div className='text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2.5 flex items-center gap-2'>
          <FontAwesomeIcon icon={faLayerGroup} className='text-violet-400' />
          Quick Navigation
        </div>
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2'>
          {quickActions.map((qa) => (
            <NavLink
              key={qa.name}
              to={qa.path}
              className='flex items-center gap-2 px-3 py-2 rounded-md bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-medium text-neutral-300 hover:text-white transition-all'
            >
              <FontAwesomeIcon icon={qa.icon} style={{ color: qa.color }} className='text-xs' />
              <span>{qa.name}</span>
            </NavLink>
          ))}
        </div>
      </div>
    );
  };

  const renderSftpDetails = () => {
    const sftpHost: string = server?.sftpHost || window.location.hostname;
    const sftpPort: number = server?.sftpPort || 2022;
    const sftpUsername = user?.username ? `${user.username}.${server?.uuidShort || server?.uuid?.slice(0, 8)}` : '';
    const sftpUrl = `sftp://${sftpUsername}@${sftpHost}:${sftpPort}`;

    return (
      <div className='qunix-card-flat p-4 flex flex-col justify-between gap-3 h-full'>
        <div className='flex items-center justify-between'>
          <span className='text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2'>
            <FontAwesomeIcon icon={faShieldHalved} className='text-sky-400' />
            SFTP Details
          </span>
          <span className='text-[10px] font-mono text-neutral-500'>SSH / SFTP</span>
        </div>
        <div className='flex flex-col gap-2 text-xs'>
          <div className='flex justify-between items-center py-1 border-b border-white/[0.05]'>
            <span className='text-neutral-400'>Host / Port</span>
            <span
              className='font-mono text-neutral-200 cursor-pointer hover:text-white flex items-center gap-1.5'
              onClick={() => copyToClipboard(`${sftpHost}:${sftpPort}`, 'SFTP Address')}
              title='Click to copy'
            >
              {sftpHost}:{sftpPort}
              <FontAwesomeIcon icon={copiedField === 'SFTP Address' ? faCheck : faCopy} className='text-[10px] text-neutral-500' />
            </span>
          </div>
          <div className='flex justify-between items-center py-1 border-b border-white/[0.05]'>
            <span className='text-neutral-400'>Username</span>
            <span
              className='font-mono text-neutral-200 cursor-pointer hover:text-white flex items-center gap-1.5'
              onClick={() => copyToClipboard(sftpUsername, 'SFTP Username')}
              title='Click to copy'
            >
              {sftpUsername}
              <FontAwesomeIcon icon={copiedField === 'SFTP Username' ? faCheck : faCopy} className='text-[10px] text-neutral-500' />
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderEnvSpecs = () => {
    const allocationStr = server?.allocation
      ? formatAllocation(server.allocation, server?.egg?.separatePort)
      : 'No allocation';
    return (
      <div className='qunix-card-flat p-4 flex flex-col justify-between gap-3 h-full'>
        <div className='flex items-center justify-between'>
          <span className='text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2'>
            <FontAwesomeIcon icon={faLayerGroup} className='text-purple-400' />
            Environment & Specs
          </span>
          <span className='text-[10px] font-mono text-neutral-500'>{server.uuidShort || server.uuid.slice(0, 8)}</span>
        </div>
        <div className='flex flex-col gap-2 text-xs'>
          <div className='flex justify-between items-center py-1 border-b border-white/[0.05]'>
            <span className='text-neutral-400'>Node</span>
            <span className='font-mono text-neutral-200'>{server.nodeName || 'Local Node'}</span>
          </div>
          <div className='flex justify-between items-center py-1 border-b border-white/[0.05]'>
            <span className='text-neutral-400'>Template</span>
            <span className='font-mono text-neutral-200'>{server.egg?.name || 'Default'}</span>
          </div>
          <div className='flex justify-between items-center py-1'>
            <span className='text-neutral-400'>Allocation</span>
            <span className='font-mono text-neutral-200'>{allocationStr}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderHeroBanner = () => {
    const bannerUrl = getBannerUrl(server, s);
    const eggImageUrl = getEggImageUrl(server, s);
    const isRunning = stats?.state === 'running';

    return (
      <div
        className='qunix-card-flat relative overflow-hidden rounded-xl p-5 border border-white/10 mb-2'
        style={
          bannerUrl
            ? {
              backgroundImage: `linear-gradient(to right, rgba(10, 10, 16, 0.94) 30%, rgba(10, 10, 16, 0.6) 70%, rgba(10, 10, 16, 0.2) 100%), url("${bannerUrl}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'right center',
            }
            : undefined
        }
      >
        <div className='flex items-center justify-between flex-wrap gap-4 relative z-10'>
          <div className='flex items-center gap-4'>
            {eggImageUrl ? (
              <img src={eggImageUrl} alt='Egg' className='w-12 h-12 rounded-lg object-contain bg-white/5 p-1 border border-white/10' />
            ) : (
              <div className='w-12 h-12 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400'>
                <FontAwesomeIcon icon={faServer} className='text-xl' />
              </div>
            )}
            <div>
              <div className='flex items-center gap-2.5 flex-wrap'>
                <h2 className='text-xl font-bold text-white tracking-tight m-0'>{server.name}</h2>
                <Badge size='sm' color={isRunning ? 'green' : 'gray'} variant='filled'>
                  {stats?.state ? stats.state.toUpperCase() : 'OFFLINE'}
                </Badge>
                {server.nodeName && (
                  <span className='text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-neutral-300'>
                    {server.nodeName}
                  </span>
                )}
              </div>
              <p className='text-xs text-neutral-400 mt-1 max-w-xl line-clamp-1'>
                {server.description || 'Calagopus managed instance'}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <ServerCan action={['control.start', 'control.stop', 'control.restart']} matchAny>
              <ServerPowerControls />
            </ServerCan>
          </div>
        </div>
      </div>
    );
  };

  const renderCompactSparklines = () => {
    const cpuAbsolute = stats?.cpuAbsolute || 0;
    const cpuLimit = server?.limits?.cpu || 0;
    const cpuPercent = cpuLimit > 0 ? Math.min(100, Math.round((cpuAbsolute / cpuLimit) * 100)) : Math.round(cpuAbsolute);

    const memoryBytes = stats?.memoryBytes || 0;
    const memoryLimitMb = server?.limits?.memory || 0;
    const memoryLimitBytes = memoryLimitMb > 0 ? mbToBytes(memoryLimitMb) : 0;
    const memoryPercent = memoryLimitBytes > 0 ? Math.min(100, Math.round((memoryBytes / memoryLimitBytes) * 100)) : 0;

    const diskBytes = stats?.diskBytes || 0;
    const diskLimitMb = server?.limits?.disk || 0;
    const diskLimitBytes = diskLimitMb > 0 ? mbToBytes(diskLimitMb) : 0;
    const diskPercent = diskLimitBytes > 0 ? Math.min(100, Math.round((diskBytes / diskLimitBytes) * 100)) : 0;

    return (
      <div className='qunix-card-flat p-3 rounded-lg border border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-3'>
        <div className='flex flex-col gap-1'>
          <div className='flex justify-between text-[11px] font-mono text-neutral-400'>
            <span className='flex items-center gap-1.5 text-blue-400 font-semibold'>
              <FontAwesomeIcon icon={faMicrochip} /> CPU
            </span>
            <span>{cpuAbsolute.toFixed(1)}%</span>
          </div>
          <Progress value={cpuPercent} color={cpuPercent > 90 ? 'red' : 'blue'} size='xs' radius='xs' />
        </div>
        <div className='flex flex-col gap-1'>
          <div className='flex justify-between text-[11px] font-mono text-neutral-400'>
            <span className='flex items-center gap-1.5 text-purple-400 font-semibold'>
              <FontAwesomeIcon icon={faMemory} /> RAM
            </span>
            <span>{bytesToString(memoryBytes)}</span>
          </div>
          <Progress value={memoryPercent} color={memoryPercent > 90 ? 'red' : 'grape'} size='xs' radius='xs' />
        </div>
        <div className='flex flex-col gap-1'>
          <div className='flex justify-between text-[11px] font-mono text-neutral-400'>
            <span className='flex items-center gap-1.5 text-emerald-400 font-semibold'>
              <FontAwesomeIcon icon={faHardDrive} /> DISK
            </span>
            <span>{bytesToString(diskBytes)}</span>
          </div>
          <Progress value={diskPercent} color={diskPercent > 90 ? 'red' : 'teal'} size='xs' radius='xs' />
        </div>
        <div className='flex flex-col gap-1'>
          <div className='flex justify-between text-[11px] font-mono text-neutral-400'>
            <span className='flex items-center gap-1.5 text-amber-400 font-semibold'>
              <FontAwesomeIcon icon={faEthernet} /> NET
            </span>
            <span>{bytesToString((stats?.network?.rxBytes || 0) + (stats?.network?.txBytes || 0))}</span>
          </div>
          <div className='flex justify-between text-[10px] text-neutral-400 font-mono'>
            <span>↓ {bytesToString(stats?.network?.rxBytes || 0)}</span>
            <span>↑ {bytesToString(stats?.network?.txBytes || 0)}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderQuickLinksWidget = () => {
    if (s?.enable_dashboard_quick_links === false) return null;
    let links: Array<{ title: string; subtitle: string; url: string; icon: string; color: string; badge?: string }> = [];
    try {
      const customLinks = s?.dashboard_quick_links ? JSON.parse(s.dashboard_quick_links) : null;
      if (Array.isArray(customLinks) && customLinks.length > 0) {
        links = customLinks;
      }
    } catch (_) { }

    if (links.length === 0) {
      links = [
        { title: 'Billing', subtitle: 'Invoices, plans and payment.', url: '/billing', icon: 'credit-card', color: '#38bdf8' },
        { title: 'Discord', subtitle: 'Get help and talk to the community.', url: 'https://discord.gg', icon: 'discord', color: '#818cf8', badge: 'Community' },
        { title: 'Website', subtitle: 'Everything we host, and what it costs.', url: '/', icon: 'globe', color: '#a78bfa' },
        { title: 'Contact support', subtitle: 'Open a ticket with a human.', url: '/support', icon: 'headset', color: '#f472b6' },
      ];
    }

    const visibleLinks = links.filter((link: any) => link.enabled !== false);
    if (visibleLinks.length === 0) return null;

    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
        {visibleLinks.map((link: any, idx) => {
          const isLinkActive = link.linkEnabled !== false && Boolean(link.url);
          return (
            <div
              key={idx}
              onClick={() => {
                if (isLinkActive) {
                  if (link.url.startsWith('http')) {
                    window.open(link.url, '_blank', 'noopener,noreferrer');
                  } else {
                    window.location.href = link.url;
                  }
                }
              }}
              style={{ cursor: isLinkActive ? 'pointer' : 'default' }}
              className='qunix-card-flat p-3.5 rounded-xl border border-white/10 hover:border-indigo-500/50 hover:bg-white/[0.04] transition-all flex flex-col justify-between min-h-[90px] group no-underline'
            >
              <div>
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-xs font-semibold text-neutral-400 flex items-center gap-2'>
                    <FontAwesomeIcon
                      icon={link.icon === 'discord' ? faDiscord : link.icon === 'credit-card' ? faCreditCard : link.icon === 'globe' ? faGlobe : faHeadset}
                      style={{ color: link.color }}
                    />
                    {link.subtitle}
                  </span>
                  {link.badge && (
                    <Badge size='xs' variant='outline' color='indigo'>{link.badge}</Badge>
                  )}
                </div>
                <div className='text-base font-bold text-white group-hover:text-indigo-300 transition-colors'>
                  {link.title}
                </div>
              </div>
              <div className='text-xs font-semibold mt-2' style={{ color: isLinkActive ? link.color : '#64748b' }}>
                {isLinkActive ? (
                  <>
                    <span>Visit</span>
                    <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '9px', marginLeft: '4px' }} />
                  </>
                ) : (
                  'Link Disabled'
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderConsoleModule = (id: string) => {
    switch (id) {
      case 'console_infobar':
        return renderInfobar();
      case 'console_terminal':
        return renderTerminal();
      case 'server_details':
        return renderDetails();
      case 'server_stats':
        return renderStats();
      case 'qunix_metrics_grid':
        return renderMetricsGrid();
      case 'qunix_quick_actions':
        return renderQuickActions();
      case 'sftp_details':
        return renderSftpDetails();
      case 'environment_specs':
        return renderEnvSpecs();
      case 'hero_banner':
        return renderHeroBanner();
      case 'compact_sparklines':
        return renderCompactSparklines();
      case 'quick_links_widget':
        return renderQuickLinksWidget();
      default:
        return null;
    }
  };

  // Modular Custom Drag & Drop Layout Mode
  if (isCustom) {
    return (
      <ServerContentContainer
        title={t('pages.server.console.title', {})}
        hideTitleComponent
        registry={(window as any).extensionContext?.extensionRegistry?.pages?.server?.console?.container}
      >
        <div className='qunix-custom-console-container grid grid-cols-12 gap-4 mb-4' style={disableAutoResize ? { alignItems: 'start' } : undefined}>
          {consoleModules
            .filter((mod) => mod.enabled)
            .map((mod) => (
              <div
                key={mod.id}
                className={classNames(
                  getColSpanClass(mod.width),
                  mod.id === 'console_terminal' || mod.id === 'server_details' ? 'flex flex-col h-full min-h-0' : ''
                )}
              >
                {renderConsoleModule(mod.id)}
              </div>
            ))}
        </div>
      </ServerContentContainer>
    );
  }

  // Built-in Standard Layout Mode
  let customComponents: any = {};
  try {
    customComponents = JSON.parse(localStorage.getItem('qunix_custom_console_components') || '{}');
  } catch (_) { }
  const showTerminal = customComponents.terminal_console !== false;
  const showDetails = customComponents.server_info !== false;
  const showStats = customComponents.statistics !== false;

  return (
    <ServerContentContainer
      title={t('pages.server.console.title', {})}
      hideTitleComponent
      registry={(window as any).extensionContext?.extensionRegistry?.pages?.server?.console?.container}
    >
      {renderInfobar()}

      {(showTerminal || showDetails) && (
        <div className='grid xl:grid-cols-4 gap-4 mb-4' style={disableAutoResize ? { alignItems: 'start' } : undefined}>
          {showTerminal && (
            <div className={classNames(showDetails ? 'xl:col-span-3' : 'xl:col-span-4', 'flex flex-col')}>
              {renderTerminal()}
            </div>
          )}

          {showDetails && (
            <div className={classNames(showTerminal ? 'flex flex-col min-w-0' : 'xl:col-span-4')}>
              <ServerDetails />
            </div>
          )}
        </div>
      )}

      {showStats && <ServerStats />}
    </ServerContentContainer>
  );
}
