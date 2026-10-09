import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { NavLink } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faRotateRight,
  faStop,
  faSkull,
  faEllipsisVertical,
  faMicrochip,
  faMemory,
  faHardDrive,
  faEthernet,
  faCopy,
  faCheck,
  faChevronRight,
  faServer,
  faTerminal,
} from '@fortawesome/free-solid-svg-icons';
import { Progress, Card, Overlay, Box } from '@mantine/core';
import { z } from 'zod';
import { serverPowerAction, serverSchema } from '@/lib/schemas/server/server.ts';
import { useBulkPowerActions } from '@/plugins/server/useBulkPowerActions.ts';
import { useServerStats } from '@/plugins/server/useServerStats.ts';
import { useAuth } from '@/providers/AuthProvider.tsx';
import { useTranslations } from '@/providers/TranslationProvider.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import { formatAllocation, statusToColor } from '@/lib/domain/server.ts';
import { bytesToString, mbToBytes } from '@/lib/format/size.ts';
import ConfirmationModal from '@/elements/modals/ConfirmationModal.tsx';
import ContextMenu, { ContextMenuItem } from '@/elements/overlays/ContextMenu.tsx';
import { getBannerUrl, getEggImageUrl } from '../../lib/eggResolver.ts';

export interface QunixServerGridCardProps {
  server: z.infer<typeof serverSchema>;
  to?: string;
  isSelected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  onClick?: (event: React.MouseEvent) => void;
  showSelection?: boolean;
  showContextMenu?: boolean;
  bannerUrl?: string | null;
  eggImageUrl?: string | null;
  activeStyle?: string | null;
  gridStyle?: string | null;
  onGroupRemove?: () => void;
  sKeyPressedRef?: React.RefObject<boolean>;
}

export const QunixServerGridCard: React.FC<QunixServerGridCardProps> = ({
  server,
  to,
  isSelected = false,
  onSelectionChange,
  onClick,
  showSelection = true,
  showContextMenu = true,
  bannerUrl,
  eggImageUrl,
  activeStyle,
  gridStyle,
  onGroupRemove,
  sKeyPressedRef,
}) => {
  const { t } = useTranslations();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { handleBulkPowerAction, bulkActionLoading } = useBulkPowerActions();

  const [openModal, setOpenModal] = useState<'kill' | null>(null);
  const [copied, setCopied] = useState(false);

  const [themeSettings, setThemeSettings] = useState(() =>
    typeof window !== 'undefined' ? (window as any).qunixThemeSettings : null
  );

  useEffect(() => {
    const handleSettingsChange = (e: any) => {
      setThemeSettings({
        ...((window as any).qunixThemeSettings || {}),
        ...(e.detail || {}),
      });
    };
    window.addEventListener('qunix-theme-settings-changed', handleSettingsChange);
    return () => {
      window.removeEventListener('qunix-theme-settings-changed', handleSettingsChange);
    };
  }, []);

  const stats = useServerStats(server);
  const state = stats?.state || 'offline';

  // Register in global server map for fast O(1) lookup
  useEffect(() => {
    if (server) {
      if (!(window as any).qunixRenderedServersMap) {
        (window as any).qunixRenderedServersMap = new Map<string, any>();
      }
      const map = (window as any).qunixRenderedServersMap;
      map.set(server.uuid.toLowerCase(), server);
      if (server.uuidShort) {
        map.set(server.uuidShort.toLowerCase(), server);
      }
      window.dispatchEvent(new CustomEvent('qunix-server-rendered'));
    }
  }, [server]);

  const powerBlocked =
    !!server.status || server.isSuspended || server.isTransferring || server.nodeMaintenanceEnabled;

  const permissionSet = useMemo(
    () => new Set([...server.permissions, ...(user?.role?.serverPermissions ?? [])]),
    [server.permissions, user?.role?.serverPermissions],
  );

  const canPower = useCallback(
    (action: string) => permissionSet.has('*') || permissionSet.has(action),
    [permissionSet],
  );

  const doPowerAction = useCallback(
    (action: z.infer<typeof serverPowerAction>) => handleBulkPowerAction([server.uuid], action),
    [handleBulkPowerAction, server.uuid],
  );

  const diskLimit = server.limits.disk !== 0 ? bytesToString(mbToBytes(server.limits.disk)) : 'Unlimited';
  const memoryLimit = server.limits.memory !== 0 ? bytesToString(mbToBytes(server.limits.memory)) : 'Unlimited';
  const cpuLimit = server.limits.cpu !== 0 ? `${server.limits.cpu}%` : 'Unlimited';

  const ramPercent =
    stats?.memoryBytes && server.limits.memory
      ? Math.min(100, Math.round((stats.memoryBytes / mbToBytes(server.limits.memory)) * 100))
      : 0;

  const diskPercent =
    stats?.diskBytes && server.limits.disk
      ? Math.min(100, Math.round((stats.diskBytes / mbToBytes(server.limits.disk)) * 100))
      : 0;

  const cpuPercent =
    stats?.cpuAbsolute !== undefined && server.limits.cpu
      ? Math.min(100, Math.round((stats.cpuAbsolute / server.limits.cpu) * 100))
      : Math.round(stats?.cpuAbsolute || 0);

  const allocationStr = server.allocation
    ? formatAllocation(server.allocation, server.egg?.separatePort)
    : 'No allocation';

  const handleCopyAllocation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(allocationStr);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = allocationStr;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    setCopied(true);
    addToast('Allocation copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const contextMenuItems: ContextMenuItem[] = useMemo(
    () => [
      {
        type: 'action' as const,
        icon: faPlay,
        label: t('common.enum.serverPowerAction.start', {}),
        color: 'gray',
        canAccess: canPower('control.start'),
        disabled: powerBlocked || bulkActionLoading !== null || state !== 'offline',
        onClick: () => doPowerAction('start'),
      },
      {
        type: 'action' as const,
        icon: faRotateRight,
        label: t('common.enum.serverPowerAction.restart', {}),
        canAccess: canPower('control.restart'),
        disabled: powerBlocked || bulkActionLoading !== null || !state,
        onClick: () => doPowerAction('restart'),
      },
      {
        type: 'action' as const,
        icon: faStop,
        label: t('common.enum.serverPowerAction.stop', {}),
        color: 'red',
        canAccess: canPower('control.stop'),
        disabled: powerBlocked || bulkActionLoading !== null || !state || state === 'offline',
        onClick: () => doPowerAction('stop'),
      },
      {
        type: 'action' as const,
        icon: faSkull,
        label: t('common.enum.serverPowerAction.kill', {}),
        color: 'red',
        hidden: state !== 'stopping',
        canAccess: canPower('control.restart') || canPower('control.stop'),
        disabled: powerBlocked || bulkActionLoading !== null,
        onClick: () => setOpenModal('kill'),
      },
    ],
    [canPower, doPowerAction, powerBlocked, bulkActionLoading, state, t],
  );

  const destination = to || `/server/${server.uuidShort || server.uuid.slice(0, 8)}`;

  const s = themeSettings || (typeof window !== 'undefined' ? (window as any).qunixThemeSettings : null);
  const resolvedActiveStyle = activeStyle || s?.grid_banner_style || s?.gridBannerStyle || 'right';
  const resolvedEggImageUrl = eggImageUrl || getEggImageUrl(server, s);
  const resolvedBannerUrl = bannerUrl || getBannerUrl(server, s) || resolvedEggImageUrl;
  const resolvedOverlayStyle =
    s?.component_overlay_style ||
    s?.componentOverlayStyle ||
    (typeof document !== 'undefined' ? document.documentElement.getAttribute('data-component-overlay') : null) ||
    'fade';

  const bannerClasses: string[] = [];
  const bannerStyles: React.CSSProperties = {};
  if (resolvedBannerUrl && resolvedActiveStyle !== 'disabled') {
    (bannerStyles as any)['--ds-egg-banner-image'] = `url("${resolvedBannerUrl}")`;
    bannerClasses.push('qunix-server-card');
    if (resolvedActiveStyle === 'right') {
      bannerClasses.push('has-banner-right');
    } else if (resolvedActiveStyle === 'fade-left' || resolvedActiveStyle === 'left') {
      bannerClasses.push('has-banner-left');
    } else if (resolvedActiveStyle === 'fade-up' || resolvedActiveStyle === 'up') {
      bannerClasses.push('has-banner-up');
    } else if (resolvedActiveStyle === 'fade-down' || resolvedActiveStyle === 'down') {
      bannerClasses.push('has-banner-down');
    } else if (resolvedActiveStyle === 'fade-half') {
      bannerClasses.push('has-banner-fade-half');
    } else {
      bannerClasses.push('has-banner');
    }
  }

  return (
    <>
      <ConfirmationModal
        opened={openModal === 'kill'}
        onClose={() => setOpenModal(null)}
        title='Force Stop Server'
        confirm='Force Kill'
        onConfirmed={() => doPowerAction('kill')}
      >
        Force stopping a server immediately halts all processes and may corrupt data. Are you sure you want to proceed?
      </ConfirmationModal>

      <ContextMenu enabled={showContextMenu !== false} items={contextMenuItems}>
        {({ openMenu }) => {
          const isDark = typeof document !== 'undefined' ? document.documentElement.getAttribute('data-mantine-color-scheme') !== 'light' : true;
          const fadeBaseColor = isDark ? 'rgba(11, 12, 22, ' : 'rgba(244, 245, 247, ';

          const getShaderFadeGradient = (style: string): string => {
            switch (style) {
              case 'fade-left':
              case 'left':
                return `linear-gradient(to left, ${fadeBaseColor}0.85) 0%, ${fadeBaseColor}0.50) 50%, ${fadeBaseColor}0.10) 100%)`;
              case 'fade-up':
              case 'up':
                return `linear-gradient(to top, ${fadeBaseColor}0.85) 0%, ${fadeBaseColor}0.45) 50%, ${fadeBaseColor}0.10) 100%)`;
              case 'fade-down':
              case 'down':
                return `linear-gradient(to bottom, ${fadeBaseColor}0.85) 0%, ${fadeBaseColor}0.45) 50%, ${fadeBaseColor}0.10) 100%)`;
              case 'fade-half':
                return `linear-gradient(to right, ${fadeBaseColor}0.80) 0%, ${fadeBaseColor}0.45) 50%, ${fadeBaseColor}0.10) 100%)`;
              case 'radial':
              case 'vignette':
                return `radial-gradient(circle at center, ${fadeBaseColor}0.20) 0%, ${fadeBaseColor}0.75) 100%)`;
              case 'glass':
                return isDark
                  ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)'
                  : 'linear-gradient(135deg, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.01) 100%)';
              case 'cover':
                return `linear-gradient(180deg, ${fadeBaseColor}0.35) 0%, ${fadeBaseColor}0.75) 100%)`;
              case 'right':
              default:
                return `linear-gradient(to right, ${fadeBaseColor}0.85) 0%, ${fadeBaseColor}0.50) 50%, ${fadeBaseColor}0.10) 100%)`;
            }
          };

          const getOverlayProps = (overlayStyle: string, bannerFadeStyle: string) => {
            switch (overlayStyle) {
              case 'glass':
                return {
                  blur: 12,
                  gradient: isDark
                    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(14, 18, 27, 0.70) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.50) 0%, rgba(240, 242, 245, 0.70) 100%)',
                  opacity: 1,
                };
              case 'solid':
                return {
                  blur: undefined,
                  gradient: isDark
                    ? 'linear-gradient(180deg, rgba(11, 13, 20, 0.90) 0%, rgba(11, 13, 20, 0.95) 100%)'
                    : 'linear-gradient(180deg, rgba(244, 245, 247, 0.90) 0%, rgba(244, 245, 247, 0.95) 100%)',
                  opacity: 1,
                };
              case 'radial':
                return {
                  blur: undefined,
                  gradient: isDark
                    ? 'radial-gradient(circle at 75% 40%, rgba(11, 12, 22, 0.35) 0%, rgba(11, 12, 22, 0.88) 75%)'
                    : 'radial-gradient(circle at 75% 40%, rgba(244, 245, 247, 0.35) 0%, rgba(244, 245, 247, 0.88) 75%)',
                  opacity: 1,
                };
              case 'none':
                return null;
              case 'fade':
              default:
                return {
                  blur: undefined,
                  gradient: getShaderFadeGradient(bannerFadeStyle),
                  opacity: 1,
                };
            }
          };

          const overlayProps = getOverlayProps(resolvedOverlayStyle, resolvedActiveStyle);

          const resolvedGridStyle =
            gridStyle ||
            s?.server_grid_style ||
            (typeof window !== 'undefined' && (window as any).qunixThemeSettings?.server_grid_style) ||
            'default';

          return (
            <Card
              className={`qunix-server-grid-card qunix-card-flat qunix-grid-style-${resolvedGridStyle} qunix-server-status-${state} ${isSelected ? 'is-selected' : ''} ${bannerClasses.join(' ')}`}
              style={{
                ...bannerStyles,
                position: 'relative',
                overflow: 'hidden',
              }}
              data-grid-style={resolvedGridStyle}
              data-component-overlay={resolvedOverlayStyle}
              onClick={onClick}
              onContextMenu={(e) => {
                if (showContextMenu !== false) {
                  e.preventDefault();
                  openMenu(e.clientX, e.clientY);
                }
              }}
              withBorder
              radius='md'
              p={0}
            >
              {/* Mantine Banner Overlay with Selected Component Overlay Effect */}
              {resolvedBannerUrl && resolvedActiveStyle !== 'disabled' && (
                <Box
                  className='qunix-banner-shader-container'
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url("${resolvedBannerUrl}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    pointerEvents: 'none',
                    zIndex: 0,
                  }}
                >
                  {overlayProps && (
                    <Overlay
                      gradient={overlayProps.gradient}
                      opacity={overlayProps.opacity}
                      zIndex={1}
                      blur={overlayProps.blur}
                    />
                  )}
                </Box>
              )}

              {/* Mantine Subtle Card Surface Depth Shader (Only when glass is active and no banner) */}
              {!resolvedBannerUrl && resolvedOverlayStyle === 'glass' && (
                <Overlay
                  blur={8}
                  opacity={isDark ? 0.2 : 0.05}
                  color={isDark ? '#000000' : '#ffffff'}
                  zIndex={1}
                  style={{ pointerEvents: 'none' }}
                />
              )}

              {/* DESKTOP & TABLET CARD LAYOUT (Clean, Flat, Modern) */}
              <div className='qunix-grid-card-inner relative z-10'>
          {/* Header Row: Status, Title, Egg, Selection & Menu */}
          <div className='flex items-start justify-between gap-2.5 mb-3'>
            <div className='flex items-center gap-3 min-w-0 flex-1'>
              {/* Optional Selection Checkbox */}
              {showSelection && onSelectionChange && (
                <input
                  type='checkbox'
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation();
                    onSelectionChange(e.target.checked);
                  }}
                  className='qunix-checkbox-flat shrink-0 mr-0.5'
                  aria-label='Select server'
                />
              )}

              {/* Server Icon with Status Indicator dot */}
              <div className='qunix-server-icon-box relative shrink-0 w-10 h-10 rounded-lg bg-neutral-800/80 border border-neutral-700/60 shadow-sm flex items-center justify-center text-neutral-300 overflow-hidden'>
                <FontAwesomeIcon icon={faServer} className='text-sm text-neutral-300' />
                <span
                  className={`qunix-status-indicator qunix-status-${state} absolute bottom-1 right-1 ring-2 ring-neutral-900`}
                  style={{ width: '8px', height: '8px' }}
                />
              </div>

              <div className='flex flex-col min-w-0 flex-1'>
                <NavLink
                  to={destination}
                  className='text-base font-bold text-neutral-100 hover:text-blue-400 transition-colors no-underline truncate block leading-tight'
                >
                  {server.name}
                </NavLink>
                <div className='flex items-center gap-1.5 text-xs text-neutral-400 mt-1'>
                  {server.egg?.name && (
                    <span className='qunix-flat-badge-subtle text-[10px] uppercase font-mono truncate max-w-[130px]'>
                      {server.egg.name}
                    </span>
                  )}
                  {(server.node as any)?.name && (
                    <span className='text-[11px] text-neutral-500 font-mono truncate'>
                      • {(server.node as any).name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions (Console Shortcut + Context Menu) */}
            <div className='flex items-center gap-1 shrink-0' onClick={(e) => e.stopPropagation()}>
              <NavLink
                to={`/server/${server.uuidShort || server.uuid.slice(0, 8)}/console`}
                className='p-1.5 text-neutral-400 hover:text-blue-400 hover:bg-neutral-800/80 rounded transition-colors'
                title='Open Console'
              >
                <FontAwesomeIcon icon={faTerminal} className='text-xs' />
              </NavLink>

              {showContextMenu && (
                <button
                  type='button'
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openMenu(e.clientX, e.clientY);
                  }}
                  className='p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80 rounded transition-colors cursor-pointer'
                  aria-label='Server options'
                  title='Server options'
                >
                  <FontAwesomeIcon icon={faEllipsisVertical} className='text-xs' />
                </button>
              )}
            </div>
          </div>

          {/* Description (if present) */}
          {server.description && (
            <p className='text-xs text-neutral-400 mb-3 line-clamp-1 m-0'>
              {server.description}
            </p>
          )}

          {/* Metrics Section: 3-column Flat Progress & Stats */}
          <div className='qunix-grid-metrics-row mb-3 pt-2 border-t border-neutral-800/70'>
            {/* CPU */}
            <div className='flex flex-col gap-1'>
              <div className='flex justify-between items-center text-[11px] font-mono'>
                <span className='text-neutral-400 flex items-center gap-1'>
                  <FontAwesomeIcon icon={faMicrochip} className='text-[10px] text-blue-400' />
                  CPU
                </span>
                <span className='font-bold text-neutral-200'>{stats?.cpuAbsolute?.toFixed(0) || 0}%</span>
              </div>
              <Progress
                value={cpuPercent}
                size={4}
                radius='xs'
                color={cpuPercent > 90 ? 'red' : 'blue'}
                className='qunix-flat-progress'
              />
            </div>

            {/* RAM */}
            <div className='flex flex-col gap-1'>
              <div className='flex justify-between items-center text-[11px] font-mono'>
                <span className='text-neutral-400 flex items-center gap-1'>
                  <FontAwesomeIcon icon={faMemory} className='text-[10px] text-purple-400' />
                  RAM
                </span>
                <span className='font-bold text-neutral-200'>
                  {stats?.memoryBytes ? bytesToString(stats.memoryBytes) : '0 MB'}
                </span>
              </div>
              <Progress
                value={ramPercent}
                size={4}
                radius='xs'
                color={ramPercent > 90 ? 'red' : 'grape'}
                className='qunix-flat-progress'
              />
            </div>

            {/* Disk */}
            <div className='flex flex-col gap-1'>
              <div className='flex justify-between items-center text-[11px] font-mono'>
                <span className='text-neutral-400 flex items-center gap-1'>
                  <FontAwesomeIcon icon={faHardDrive} className='text-[10px] text-emerald-400' />
                  Disk
                </span>
                <span className='font-bold text-neutral-200'>
                  {stats?.diskBytes ? bytesToString(stats.diskBytes) : '0 MB'}
                </span>
              </div>
              <Progress
                value={diskPercent}
                size={4}
                radius='xs'
                color={diskPercent > 90 ? 'red' : 'teal'}
                className='qunix-flat-progress'
              />
            </div>
          </div>

          {/* Footer Row: Allocation with 1-click copy + Link */}
          <div className='qunix-grid-card-footer flex items-center justify-between pt-2 border-t border-neutral-800/70 text-xs'>
            <div
              className='flex items-center gap-1.5 font-mono text-neutral-400 hover:text-white cursor-pointer transition-colors'
              onClick={handleCopyAllocation}
              title='Copy connection IP & Port'
            >
              <FontAwesomeIcon icon={faEthernet} className='text-[11px] text-neutral-500' />
              <span className='truncate max-w-[170px] sm:max-w-[200px]'>{allocationStr}</span>
              <FontAwesomeIcon
                icon={copied ? faCheck : faCopy}
                className={`text-[10px] ${copied ? 'text-emerald-400' : 'text-neutral-500'}`}
              />
            </div>

            <NavLink
              to={destination}
              className='text-neutral-400 hover:text-blue-400 flex items-center gap-1 font-medium transition-colors no-underline text-[11px]'
            >
              <span>Manage</span>
              <FontAwesomeIcon icon={faChevronRight} className='text-[9px]' />
            </NavLink>
          </div>
        </div>

        {/* MOBILE SPECIFIC OPTIMIZED COMPACT ROW (Shown only on small mobile viewports) */}
        <div className='qunix-grid-mobile-compact-view relative z-10'>
          <div className='flex items-center justify-between gap-2 mb-2'>
            <div className='flex items-center gap-2.5 min-w-0'>
              <div className='relative shrink-0 w-7 h-7 rounded-md bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center text-neutral-300 overflow-hidden'>
                <FontAwesomeIcon icon={faServer} className='text-[11px] text-neutral-300' />
                <span
                  className={`qunix-status-indicator qunix-status-${state} absolute bottom-0.5 right-0.5 ring-1 ring-neutral-900`}
                  style={{ width: '6px', height: '6px' }}
                />
              </div>
              <NavLink
                to={destination}
                className='text-sm font-bold text-neutral-100 truncate no-underline'
              >
                {server.name}
              </NavLink>
            </div>
            <span className='qunix-flat-badge text-[10px] uppercase font-bold shrink-0'>
              {state}
            </span>
          </div>

          {/* Compact Chips Row */}
          <div className='flex items-center gap-2 text-[11px] font-mono text-neutral-400 mb-2 flex-wrap'>
            <span className='bg-neutral-800/80 px-2 py-0.5 rounded border border-neutral-700/60'>
              CPU: <strong className='text-neutral-200'>{stats?.cpuAbsolute?.toFixed(0) || 0}%</strong>
            </span>
            <span className='bg-neutral-800/80 px-2 py-0.5 rounded border border-neutral-700/60'>
              RAM: <strong className='text-neutral-200'>{stats?.memoryBytes ? bytesToString(stats.memoryBytes) : '0 MB'}</strong>
            </span>
            <span className='bg-neutral-800/80 px-2 py-0.5 rounded border border-neutral-700/60'>
              Disk: <strong className='text-neutral-200'>{stats?.diskBytes ? bytesToString(stats.diskBytes) : '0 MB'}</strong>
            </span>
          </div>

          {/* Allocation & Quick Link */}
          <div className='flex items-center justify-between text-xs pt-1.5 border-t border-neutral-800/70'>
            <span
              className='font-mono text-neutral-400 text-[11px] truncate cursor-pointer hover:text-white'
              onClick={handleCopyAllocation}
            >
              {allocationStr}
            </span>
            <div className='flex items-center gap-2'>
              {showContextMenu && (
                <button
                  type='button'
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openMenu(e.clientX, e.clientY);
                  }}
                  className='p-1 text-neutral-400 hover:text-neutral-200 cursor-pointer'
                  title='Server options'
                  aria-label='Server options'
                >
                  <FontAwesomeIcon icon={faEllipsisVertical} className='text-xs' />
                </button>
              )}
              <NavLink
                to={destination}
                className='text-blue-400 font-medium text-xs flex items-center gap-1 no-underline'
              >
                <span>Manage</span>
                <FontAwesomeIcon icon={faChevronRight} className='text-[10px]' />
              </NavLink>
            </div>
          </div>
        </div>
      </Card>
    );
  }}
</ContextMenu>
    </>
  );
};

export default QunixServerGridCard;
