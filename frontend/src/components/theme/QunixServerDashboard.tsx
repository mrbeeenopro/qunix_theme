import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTerminal,
  faFolderOpen,
  faDatabase,
  faBoxArchive,
  faNetworkWired,
  faStopwatch,
  faPlay,
  faRotateRight,
  faStop,
  faSkull,
  faCog,
  faMicrochip,
  faMemory,
  faHardDrive,
  faEthernet,
  faClock,
  faCopy,
  faCheck,
  faServer,
  faLayerGroup,
  faExternalLinkAlt,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import { Progress, Center, Loader } from '@mantine/core';
import ServerContentContainer from '@/elements/containers/ServerContentContainer.tsx';
import { ServerCan } from '@/elements/Can.tsx';
import ConfirmationModal from '@/elements/modals/ConfirmationModal.tsx';
import { useServerStore } from '@/stores/server.ts';
import { useAuth } from '@/providers/AuthProvider.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useTranslations } from '@/providers/TranslationProvider.tsx';
import { bytesToString, mbToBytes } from '@/lib/format/size.ts';
import { formatMilliseconds } from '@/lib/format/time.ts';
import { formatAllocation, statusToColor } from '@/lib/domain/server.ts';
import { SocketRequest } from '@/plugins/websocket/useWebsocketEvent.ts';
import Console from '@/pages/server/console/terminal/Console.tsx';
import { QunixServerDashboardSkeleton } from './QunixSkeletonLoader.tsx';
import { loadSavedDashboardLayout, DashboardModule, getColSpanClass } from '../../lib/dashboardLayout.ts';
import QunixManagementShortcuts from './QunixManagementShortcuts.tsx';
import QunixSftpDetails from './QunixSftpDetails.tsx';
import QunixEnvironmentSpecs from './QunixEnvironmentSpecs.tsx';
import QunixResourceCharts from './QunixResourceCharts.tsx';
import QunixNetworkAreaChart from './QunixNetworkAreaChart.tsx';

export default function QunixServerDashboard() {
  const { t } = useTranslations();
  const { user } = useAuth();
  const { addToast } = useToast();

  const server = useServerStore((state) => state.server);
  const stats = useServerStore((state) => state.stats);
  const serverState = useServerStore((state) => state.state);
  const socketInstance = useServerStore((state) => state.socketInstance);

  const [killModalOpen, setKillModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Dynamic layout modules state synced with custom layout builder & theme settings
  const [layoutModules, setLayoutModules] = useState<DashboardModule[]>(loadSavedDashboardLayout);

  useEffect(() => {
    const handleLayoutUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setLayoutModules(e.detail);
      } else {
        setLayoutModules(loadSavedDashboardLayout());
      }
    };
    window.addEventListener('qunix-custom-layout-updated', handleLayoutUpdate);
    return () => {
      window.removeEventListener('qunix-custom-layout-updated', handleLayoutUpdate);
    };
  }, []);

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

  const handlePowerAction = (action: 'start' | 'restart' | 'stop' | 'kill') => {
    if (action === 'kill') {
      setKillModalOpen(true);
      return;
    }

    if (socketInstance) {
      socketInstance.send(SocketRequest.SET_STATE, action);
      addToast(`Server signal sent: ${action}`, 'info');
    }
  };

  const confirmKillAction = () => {
    setKillModalOpen(false);
    if (socketInstance) {
      socketInstance.send(SocketRequest.SET_STATE, 'kill');
      addToast('Server force stopped (kill signal sent)', 'error');
    }
  };

  // Status mapping
  const currentState = stats?.state || serverState || 'offline';

  // CPU calculation
  const cpuAbsolute = stats?.cpuAbsolute || 0;
  const cpuLimit = server?.limits?.cpu || 0;
  const cpuPercent = cpuLimit > 0 ? Math.min(100, Math.round((cpuAbsolute / cpuLimit) * 100)) : Math.round(cpuAbsolute);

  // Memory calculation
  const memoryBytes = stats?.memoryBytes || 0;
  const memoryLimitMb = server?.limits?.memory || 0;
  const memoryLimitBytes = memoryLimitMb > 0 ? mbToBytes(memoryLimitMb) : 0;
  const memoryPercent = memoryLimitBytes > 0 ? Math.min(100, Math.round((memoryBytes / memoryLimitBytes) * 100)) : 0;

  // Disk calculation
  const diskBytes = stats?.diskBytes || 0;
  const diskLimitMb = server?.limits?.disk || 0;
  const diskLimitBytes = diskLimitMb > 0 ? mbToBytes(diskLimitMb) : 0;
  const diskPercent = diskLimitBytes > 0 ? Math.min(100, Math.round((diskBytes / diskLimitBytes) * 100)) : 0;

  // Network calculation
  const rxBytes = stats?.network?.rxBytes || 0;
  const txBytes = stats?.network?.txBytes || 0;

  const allocationStr = server?.allocation
    ? formatAllocation(server.allocation, server?.egg?.separatePort)
    : 'No allocation assigned';

  const sftpHost: string = server?.sftpHost || window.location.hostname;
  const sftpPort: number = server?.sftpPort || 2022;
  const sftpUsername = user?.username ? `${user.username}.${server?.uuidShort || server?.uuid?.slice(0, 8)}` : '';
  const sftpUrl = `sftp://${sftpUsername}@${sftpHost}:${sftpPort}`;
  const hostNode: string = server?.nodeName || 'Local Node';
  const eggName: string = server?.egg?.name || 'Standard';
  const dockerImage: string = server?.image || 'Default container';

  if (!server || !server.uuid) {
    const s = (window as any).qunixThemeSettings;
    const useSkeleton = s?.enable_skeleton_loader !== false;
    return (
      <ServerContentContainer title='Server Dashboard' hideTitleComponent>
        {useSkeleton ? (
          <QunixServerDashboardSkeleton />
        ) : (
          <Center py='xl'>
            <Loader color={s?.spinner_color || '#6c5ce7'} size={36} type={s?.spinner_type || 'oval'} />
          </Center>
        )}
      </ServerContentContainer>
    );
  }

  // 1. Hero Header & Power Actions
  const renderHeroHeader = () => (
    <div className='qunix-card-flat qunix-dashboard-hero p-4 lg:p-6'>
      <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4'>
        <div className='flex flex-col gap-1.5 min-w-0'>
          <div className='flex items-center gap-2.5 flex-wrap'>
            <span className={`qunix-status-indicator qunix-status-${currentState}`} />
            <h1 className='text-xl lg:text-2xl font-bold tracking-tight text-(--ds-text-color) truncate m-0'>
              {server.name}
            </h1>
            <span className='qunix-flat-badge text-xs uppercase font-semibold'>
              {currentState}
            </span>
            {server.egg?.name && (
              <span className='qunix-flat-badge-subtle text-xs font-mono'>
                {server.egg.name}
              </span>
            )}
          </div>

          {server.description && (
            <p className='text-sm text-neutral-400 m-0 max-w-2xl line-clamp-1'>
              {server.description}
            </p>
          )}

          <div className='flex items-center gap-3 mt-1 flex-wrap text-xs text-neutral-400'>
            <div
              className='flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors'
              onClick={() => copyToClipboard(server.uuid, 'Server UUID')}
              title='Click to copy Server UUID'
            >
              <FontAwesomeIcon icon={faServer} className='text-neutral-500 text-[11px]' />
              <span className='font-mono font-medium'>{server.uuidShort || server.uuid.slice(0, 8)}</span>
              <FontAwesomeIcon icon={copiedField === 'Server UUID' ? faCheck : faCopy} className='text-[10px] text-neutral-500' />
            </div>

            <span className='text-neutral-600'>•</span>

            <div
              className='flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors'
              onClick={() => copyToClipboard(allocationStr, 'Allocation')}
              title='Click to copy IP & Port'
            >
              <FontAwesomeIcon icon={faEthernet} className='text-neutral-500 text-[11px]' />
              <span className='font-mono font-medium'>{allocationStr}</span>
              <FontAwesomeIcon icon={copiedField === 'Allocation' ? faCheck : faCopy} className='text-[10px] text-neutral-500' />
            </div>

            {stats?.uptime ? (
              <>
                <span className='text-neutral-600'>•</span>
                <div className='flex items-center gap-1.5'>
                  <FontAwesomeIcon icon={faClock} className='text-neutral-500 text-[11px]' />
                  <span>Up {formatMilliseconds(stats.uptime)}</span>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* POWER ACTIONS TOOLBAR */}
        <ServerCan action={['control.start', 'control.stop', 'control.restart']} matchAny>
          <div className='flex items-center gap-2 w-full lg:w-auto shrink-0 flex-wrap'>
            <button
              type='button'
              onClick={() => handlePowerAction('start')}
              disabled={currentState === 'running' || currentState === 'starting'}
              className='qunix-btn-flat qunix-btn-start flex-1 lg:flex-none'
              title='Start server'
            >
              <FontAwesomeIcon icon={faPlay} />
              <span>Start</span>
            </button>

            <button
              type='button'
              onClick={() => handlePowerAction('restart')}
              disabled={currentState === 'offline'}
              className='qunix-btn-flat qunix-btn-restart flex-1 lg:flex-none'
              title='Restart server'
            >
              <FontAwesomeIcon icon={faRotateRight} />
              <span>Restart</span>
            </button>

            <button
              type='button'
              onClick={() => handlePowerAction('stop')}
              disabled={currentState === 'offline' || currentState === 'stopping'}
              className='qunix-btn-flat qunix-btn-stop flex-1 lg:flex-none'
              title='Stop server'
            >
              <FontAwesomeIcon icon={faStop} />
              <span>Stop</span>
            </button>

            <button
              type='button'
              onClick={() => handlePowerAction('kill')}
              disabled={currentState === 'offline'}
              className='qunix-btn-flat qunix-btn-kill'
              title='Force kill server process'
            >
              <FontAwesomeIcon icon={faSkull} />
              <span className='hidden sm:inline'>Kill</span>
            </button>
          </div>
        </ServerCan>
      </div>
    </div>
  );

  // 2. Resource Charts Grid (Matching Image 2)
  const renderMetricsStats = () => (
    <QunixResourceCharts
      cpuAbsolute={cpuAbsolute}
      cpuLimit={cpuLimit}
      memoryBytes={memoryBytes}
      memoryLimitMb={memoryLimitMb}
      diskBytes={diskBytes}
      diskLimitMb={diskLimitMb}
      rxBytes={rxBytes}
      txBytes={txBytes}
      serverUuid={server.uuid}
    />
  );

  // 6. Interactive Terminal Console Box (Calagopus xterm.js)
  const renderTerminalConsole = () => (
    <div className='qunix-card-flat p-2 flex flex-col h-[520px] min-h-[420px] rounded-lg overflow-hidden'>
      <Console />
    </div>
  );

  const renderModuleContent = (id: string, width?: number) => {
    switch (id) {
      case 'hero_header':
        return renderHeroHeader();
      case 'metrics_stats':
        return renderMetricsStats();
      case 'network_chart':
        return (
          <QunixNetworkAreaChart
            serverUuid={server.uuid}
            rxBytes={rxBytes}
            txBytes={txBytes}
          />
        );
      case 'management_shortcuts':
        return (
          <QunixManagementShortcuts
            serverUuid={server.uuidShort || server.uuid.slice(0, 8)}
            width={width}
          />
        );
      case 'sftp_details':
        return (
          <QunixSftpDetails
            sftpHost={sftpHost}
            sftpPort={sftpPort}
            sftpUsername={sftpUsername}
            sftpUrl={sftpUrl}
            onCopy={copyToClipboard}
            copiedField={copiedField}
          />
        );
      case 'environment_specs':
        return (
          <QunixEnvironmentSpecs
            serverUuid={server.uuidShort || server.uuid.slice(0, 8)}
            hostNode={hostNode}
            eggName={eggName}
            dockerImage={dockerImage}
            onCopy={copyToClipboard}
          />
        );
      case 'terminal_console':
        return renderTerminalConsole();
      default:
        return null;
    }
  };

  return (
    <ServerContentContainer title={`${server.name} — Dashboard`} hideTitleComponent>
      {/* Confirmation modal for force kill */}
      <ConfirmationModal
        opened={killModalOpen}
        onClose={() => setKillModalOpen(false)}
        title='Force Stop Server'
        confirm='Force Kill'
        onConfirmed={confirmKillAction}
      >
        Force stopping a server immediately halts all processes and may result in corrupted data or save files. Are you sure you want to proceed?
      </ConfirmationModal>

      {/* DYNAMIC RESPONSIVE 12-COLUMN MODULES GRID */}
      <div className='qunix-server-dashboard-container py-2 px-1 lg:px-2 grid grid-cols-12 gap-4'>
        {layoutModules
          .filter((mod) => mod.enabled)
          .map((mod) => (
            <div key={mod.id} className={getColSpanClass(mod.width)}>
              {renderModuleContent(mod.id, mod.width)}
            </div>
          ))}
      </div>
    </ServerContentContainer>
  );
}
