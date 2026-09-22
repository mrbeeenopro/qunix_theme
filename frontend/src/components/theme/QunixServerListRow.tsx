import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faServer,
  faCopy,
  faMicrochip,
  faMemory,
  faHardDrive,
  faEllipsisVertical,
  faChevronRight,
  faPlay,
  faRotateRight,
  faStop,
  faSkull,
  faCheckCircle,
  faCircleXmark,
  faBan,
  faTriangleExclamation,
  faMinus,
} from '@fortawesome/free-solid-svg-icons';
import Spinner from '@/elements/feedback/Spinner.tsx';
import { useTranslations } from '@/providers/TranslationProvider.tsx';
import { useAuth } from '@/providers/AuthProvider.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useBulkPowerActions } from '@/plugins/server/useBulkPowerActions.ts';
import ConfirmationModal from '@/elements/modals/ConfirmationModal.tsx';
import ContextMenu from '@/elements/overlays/ContextMenu.tsx';
import Tooltip from '@/elements/overlays/Tooltip.tsx';
import ActionIcon from '@/elements/buttons/ActionIcon.tsx';
import { bytesToString, mbToBytes } from '@/lib/format/size.ts';
import { formatAllocation, serverStatusInfo, statusToColor } from '@/lib/domain/server.ts';
import Sparkline from './Sparkline.tsx';

// Sparkline Cache & Component
const metricHistoryCache: Record<string, number[]> = {};

function useServerMetricHistory(serverUuid: string, currentValue: number | undefined, chartType: string) {
  const cacheKey = `${serverUuid}-${chartType}`;
  const [history, setHistory] = useState<number[]>(() => {
    if (metricHistoryCache[cacheKey]) {
      return metricHistoryCache[cacheKey];
    }
    const initialVal = currentValue !== undefined ? currentValue : 0;
    const arr = Array(15).fill(initialVal);
    metricHistoryCache[cacheKey] = arr;
    return arr;
  });

  useEffect(() => {
    if (currentValue === undefined) return;

    let hist = metricHistoryCache[cacheKey];
    if (!hist) {
      hist = Array(15).fill(currentValue);
      metricHistoryCache[cacheKey] = hist;
    }

    if (hist.length === 0 || hist[hist.length - 1] !== currentValue) {
      hist.push(currentValue);
      if (hist.length > 15) {
        hist.shift();
      }
      metricHistoryCache[cacheKey] = hist;
      setHistory([...hist]);
    }
  }, [cacheKey, currentValue]);

  return history;
}

export const QunixServerListRow: React.FC<{
  server: any;
  stats: any;
  state: string;
  to?: string;
  isSelected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  sKeyPressedRef?: React.RefObject<boolean>;
  onGroupRemove?: () => void;
  showSelection?: boolean;
  showContextMenu?: boolean;
  bannerUrl?: string | null;
  activeStyle?: string | null;
}> = ({
  server,
  stats,
  state,
  to,
  isSelected = false,
  onSelectionChange,
  sKeyPressedRef,
  onGroupRemove,
  showSelection = true,
  showContextMenu = true,
  bannerUrl,
  activeStyle,
}) => {
  const { t } = useTranslations();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { handleBulkPowerAction, bulkActionLoading } = useBulkPowerActions();

  const [openModal, setOpenModal] = useState<'kill' | null>(null);

  const powerBlocked =
    !!server.status || server.isSuspended || server.isTransferring || server.nodeMaintenanceEnabled;

  const permissionSet = React.useMemo(
    () => new Set([...server.permissions, ...(user?.role?.serverPermissions ?? [])]),
    [server.permissions, user?.role?.serverPermissions],
  );
  const canPower = (action: string) => permissionSet.has('*') || permissionSet.has(action);

  const doPowerAction = (action: any) => handleBulkPowerAction([server.uuid], action);

  const isDark = document.documentElement.getAttribute('data-mantine-color-scheme') !== 'light';
  const color = statusToColor(state as any);

  // Settings Configuration
  const s = (window as any).qunixThemeSettings;
  const chartType = s?.list_layout_chart || s?.listLayoutChart || 'cpu';

  let currentVal: number | undefined;
  let chartColor = '#e0af68';
  if (chartType === 'cpu') {
    currentVal = stats?.cpuAbsolute;
    chartColor = '#e0af68';
  } else if (chartType === 'ram') {
    currentVal = stats?.memoryBytes;
    chartColor = 'var(--ds-primary-color, #7aa2f7)';
  } else if (chartType === 'disk') {
    currentVal = stats?.diskBytes;
    chartColor = '#747d8c';
  } else if (chartType === 'network') {
    currentVal = (stats?.network?.rxBytes || 0) + (stats?.network?.txBytes || 0);
    chartColor = '#2ed573';
  }

  const metricHistory = useServerMetricHistory(server.uuid, currentVal, chartType);

  const diskLimit = server.limits.disk !== 0 ? bytesToString(mbToBytes(server.limits.disk)) : 'Unlimited';
  const memoryLimit = server.limits.memory !== 0 ? bytesToString(mbToBytes(server.limits.memory)) : 'Unlimited';
  const cpuLimit = server.limits.cpu !== 0 ? `${server.limits.cpu}%` : 'Unlimited';

  const ramPercent =
    stats?.memoryBytes && server.limits.memory
      ? Math.min(100, (stats.memoryBytes / mbToBytes(server.limits.memory)) * 100)
      : 0;

  const diskPercent =
    stats?.diskBytes && server.limits.disk
      ? Math.min(100, (stats.diskBytes / mbToBytes(server.limits.disk)) * 100)
      : 0;

  const allocationStr = server.allocation ? formatAllocation(server.allocation, server.egg.separatePort) : 'No Allocation';

  const handleCopyAllocation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const doCopy = () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(allocationStr);
      }

      const textarea = document.createElement('textarea');
      textarea.value = allocationStr;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (successful) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('execCommand copy failed'));
      } catch (err) {
        document.body.removeChild(textarea);
        return Promise.reject(err);
      }
    };

    doCopy()
      .then(() => {
        let msg = 'Copied to clipboard.';
        try {
          msg = t('elements.copyOnClick.toast.copied', {});
        } catch (_) {
          try {
            msg = t('common.toast.copiedToClipboard' as any, { value: allocationStr });
          } catch (__) {}
        }
        addToast(msg, 'success');
      })
      .catch((err) => {
        console.warn('Silent clipboard copy error:', err);
      });
  };

  return (
    <>
      <ConfirmationModal
        opened={openModal === 'kill'}
        onClose={() => setOpenModal(null)}
        title={t('pages.server.console.power.modal.forceStop.title', {})}
        confirm={t('common.button.continue', {})}
        onConfirmed={() => doPowerAction('kill')}
      >
        {t('pages.server.console.power.modal.forceStop.content', {}).md()}
      </ConfirmationModal>

      <ContextMenu
        enabled={showContextMenu !== false}
        items={[
          {
            type: 'action',
            icon: faPlay,
            label: t('common.enum.serverPowerAction.start', {}),
            color: 'gray',
            canAccess: canPower('control.start'),
            disabled: powerBlocked || bulkActionLoading !== null || state !== 'offline',
            onClick: () => doPowerAction('start'),
          },
          {
            type: 'action',
            icon: faRotateRight,
            label: t('common.enum.serverPowerAction.restart', {}),
            canAccess: canPower('control.restart'),
            disabled: powerBlocked || bulkActionLoading !== null || !state,
            onClick: () => doPowerAction('restart'),
          },
          {
            type: 'action',
            icon: faStop,
            label: t('common.enum.serverPowerAction.stop', {}),
            color: 'red',
            canAccess: canPower('control.stop'),
            disabled: powerBlocked || bulkActionLoading !== null || !state || state === 'offline',
            onClick: () => doPowerAction('stop'),
          },
          {
            type: 'action',
            icon: faSkull,
            label: t('common.enum.serverPowerAction.kill', {}),
            color: 'red',
            hidden: state !== 'stopping',
            canAccess: canPower('control.stop'),
            disabled: powerBlocked || bulkActionLoading !== null,
            onClick: () => setOpenModal('kill'),
          },
          ...(onGroupRemove
            ? [
                {
                  type: 'action' as const,
                  icon: faMinus,
                  label: t('pages.account.home.tooltip.removeFromGroup', {}),
                  color: 'red' as const,
                  onClick: onGroupRemove,
                },
              ]
            : []),
        ]}
      >
        {({ items: menuItems, openMenu }) => (
          <NavLink
            to={to ?? `/server/${server.uuidShort}`}
            onClick={(e) => {
              if (sKeyPressedRef?.current) {
                e.preventDefault();
              }
            }}
            onContextMenu={(e) => {
              if (showContextMenu !== false) {
                e.preventDefault();
                openMenu(e.clientX, e.clientY);
              }
            }}
            className='qunix-list-row-link'
          >
            {(() => {
              // Full server status resolution (handles suspended, transferring/moving, installing, maintenance, and power states)
              const isSuspended = Boolean(server.isSuspended);
              const isTransferring = Boolean(server.isTransferring);
              const isMaintenance = Boolean(server.nodeMaintenanceEnabled);
              const rawStatus = server.status;
              const isSpecialStatus = isSuspended || isTransferring || isMaintenance || Boolean(rawStatus);

              let statusKey = (state || 'offline').toLowerCase();
              let statusLabel = state ? ((t as any)(`common.enum.serverState.${state}`, {}) || state) : 'Offline';
              let badgeColorClass = 'bg-gray-500';
              let dotClass = 'is-offline';
              let specialIcon: React.ReactNode = null;
              let specialDescription = '';

              if (isSuspended) {
                statusKey = 'suspended';
                statusLabel = t('common.server.state.suspended', {}) || 'Suspended';
                badgeColorClass = 'bg-red-500';
                dotClass = 'is-suspended';
                specialIcon = <FontAwesomeIcon icon={faBan} style={{ color: '#ff4757', fontSize: '13px' }} />;
                specialDescription = t('elements.screenBlock.serverConflict.contentSuspended', {}) || 'This server is suspended and cannot be accessed.';
              } else if (isTransferring) {
                statusKey = 'transferring';
                statusLabel = t('common.server.state.transferring', {}) || 'Transferring';
                badgeColorClass = 'bg-yellow-500';
                dotClass = 'is-transferring';
                specialIcon = <Spinner size={14} />;
                specialDescription = t('elements.screenBlock.serverConflict.contentTransferring', {}) || 'This server is currently being transferred to another node.';
              } else if (isMaintenance) {
                statusKey = 'maintenance';
                statusLabel = t('common.server.state.nodeMaintenance', {}) || 'Node Maintenance';
                badgeColorClass = 'bg-red-500';
                dotClass = 'is-suspended';
                specialIcon = <FontAwesomeIcon icon={faBan} style={{ color: '#ff4757', fontSize: '13px' }} />;
                specialDescription = t('elements.screenBlock.serverConflict.contentNodeMaintenance', {}) || 'This node is currently under maintenance.';
              } else if (rawStatus) {
                const sInfo = serverStatusInfo[rawStatus as keyof typeof serverStatusInfo];
                if (sInfo) {
                  statusKey = rawStatus;
                  statusLabel = sInfo.label();
                  badgeColorClass = sInfo.failed ? 'bg-red-500' : rawStatus === 'installing' ? 'bg-blue-500' : 'bg-orange-500';
                  dotClass = sInfo.failed ? 'is-suspended' : 'is-installing';
                  specialIcon = sInfo.failed ? (
                    <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: '#ffa502', fontSize: '13px' }} />
                  ) : (
                    <Spinner size={14} />
                  );
                  try {
                    specialDescription = sInfo.blockContent();
                  } catch (_) {
                    specialDescription = '';
                  }
                } else {
                  statusKey = rawStatus;
                  statusLabel = String(rawStatus).replace(/_/g, ' ');
                  badgeColorClass = 'bg-blue-500';
                  dotClass = 'is-installing';
                  specialIcon = <Spinner size={14} />;
                  specialDescription = statusLabel;
                }
              } else {
                // Standard power states
                if (state === 'running') {
                  badgeColorClass = 'bg-green-500';
                  dotClass = 'is-running';
                } else if (state === 'starting' || state === 'stopping') {
                  badgeColorClass = 'bg-yellow-500';
                  dotClass = 'is-starting';
                } else {
                  badgeColorClass = 'bg-gray-500';
                  dotClass = 'is-offline';
                }
              }

              const isRunning = !isSpecialStatus && statusKey === 'running';
              const isStarting = !isSpecialStatus && (statusKey === 'starting' || statusKey === 'stopping');
              const isStatusRed = isSpecialStatus && (isSuspended || isMaintenance || (rawStatus && serverStatusInfo[rawStatus as keyof typeof serverStatusInfo]?.failed));
              const isStatusYellow = isSpecialStatus && isTransferring;
              const isStatusBlue = isSpecialStatus && !isStatusRed && !isStatusYellow;

              const colorClass = isRunning
                ? 'status-green'
                : isStarting || isStatusYellow
                ? 'status-yellow'
                : isStatusBlue
                ? 'status-blue'
                : isStatusRed
                ? 'status-red'
                : 'status-gray';

              const classes = [
                'qunix-list-row',
                isDark ? 'is-dark' : 'is-light',
                `status-${statusKey}`,
                colorClass,
                `badge-${badgeColorClass.replace('bg-', '')}`,
                isSelected ? 'is-selected' : '',
              ];
              const customStyles: React.CSSProperties = {};

              if (bannerUrl && activeStyle !== 'disabled') {
                classes.push('qunix-server-card');
                if (activeStyle === 'right') {
                  classes.push('has-banner-right');
                } else if (activeStyle === 'fade-left') {
                  classes.push('has-banner-left');
                } else if (activeStyle === 'fade-up') {
                  classes.push('has-banner-up');
                } else if (activeStyle === 'fade-down') {
                  classes.push('has-banner-down');
                } else if (activeStyle === 'fade-half') {
                  classes.push('has-banner-fade-half');
                } else {
                  classes.push('has-banner');
                }
                (customStyles as any)['--ds-egg-banner-image'] = `url("${bannerUrl}")`;
              }

              return (
                <div className={classes.filter(Boolean).join(' ')} style={customStyles}>
                  {showSelection !== false && (
                    <div
                      className='qunix-list-select-wrapper'
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    >
                      <Tooltip
                        label={
                          isSelected
                            ? t('pages.account.home.bulkActions.deselect', {})
                            : t('pages.account.home.bulkActions.select', {})
                        }
                      >
                        <ActionIcon
                          size='input-sm'
                          variant={isSelected ? undefined : 'light'}
                          color={isSelected ? 'green' : 'gray'}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onSelectionChange?.(!isSelected);
                          }}
                        >
                          <FontAwesomeIcon icon={isSelected ? faCheckCircle : faCircleXmark} />
                        </ActionIcon>
                      </Tooltip>
                    </div>
                  )}

                  <div className='server-details'>
                    <div className='server-icon-wrapper'>
                      {(bannerUrl || server.egg?.name) && (
                        <img
                          src={bannerUrl || `/banners/${server.egg.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`}
                          alt={server.egg?.name || 'Server'}
                          loading='lazy'
                          decoding='async'
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextElementSibling) {
                              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'inline-block';
                            }
                          }}
                          style={{ width: '22px', height: '22px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      )}
                      <FontAwesomeIcon
                        icon={faServer}
                        style={{ display: (bannerUrl || server.egg?.name) ? 'none' : 'inline-block' }}
                      />
                      <span className={`status-dot ${dotClass}`} />
                    </div>

                    <div className='server-info'>
                      <div className='server-name-row'>
                        <h3 className='server-name'>{server.name}</h3>
                        <span className='server-tag'>{server.egg.name}</span>
                      </div>
                      <span
                        className='server-ip qunix-allocation-copier qunix-privacy-blur'
                        data-privacy-sensitive='true'
                        onClick={handleCopyAllocation}
                        title='Click to copy IP Address'
                      >
                        {allocationStr}
                        <FontAwesomeIcon
                          icon={faCopy}
                          className='copy-icon'
                          style={{ marginLeft: '4px', fontSize: '10px' }}
                        />
                      </span>
                    </div>
                  </div>

                  <div className='server-status'>
                    <div className={`status-badge ${badgeColorClass}`}>{statusLabel}</div>
                  </div>

                  {isSpecialStatus ? (
                    <div className='qunix-list-special-status'>
                      <div className='qunix-list-special-icon'>{specialIcon}</div>
                      <span className='qunix-list-special-status-title'>{statusLabel}</span>
                      {specialDescription && (
                        <span className='qunix-list-special-status-desc'>— {specialDescription}</span>
                      )}
                    </div>
                  ) : (
                    <>
                      {chartType !== 'disabled' && (
                        <div className='sparkline-container'>
                          <Sparkline data={metricHistory} color={chartColor} />
                        </div>
                      )}

                      {/* CPU Metric */}
                      <div className='server-metric'>
                        <FontAwesomeIcon icon={faMicrochip} className='stat-icon' />
                        <div className='metric-progress-wrapper'>
                          <div className='metric-text'>
                            <span className='value'>{stats?.cpuAbsolute?.toFixed(1) || '0.0'}%</span>
                            <span className='limit'>/ {cpuLimit}</span>
                          </div>
                        </div>
                      </div>

                      {/* RAM Metric */}
                      <div className='server-metric'>
                        <FontAwesomeIcon icon={faMemory} className='stat-icon' />
                        <div className='metric-progress-wrapper'>
                          <div className='metric-text'>
                            <span className='value'>{stats ? bytesToString(stats.memoryBytes) : '0 Bytes'}</span>
                            <span className='limit'>/ {memoryLimit}</span>
                          </div>
                          {server.limits.memory !== 0 && (
                            <div className='progress-bar'>
                              <div
                                className='progress-fill'
                                style={{ width: `${ramPercent}%`, backgroundColor: 'var(--ds-primary-color, #7aa2f7)' }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Disk Metric */}
                      <div className='server-metric'>
                        <FontAwesomeIcon icon={faHardDrive} className='stat-icon' />
                        <div className='metric-progress-wrapper'>
                          <div className='metric-text'>
                            <span className='value'>{stats ? bytesToString(stats.diskBytes) : '0 Bytes'}</span>
                            <span className='limit'>/ {diskLimit}</span>
                          </div>
                          {server.limits.disk !== 0 && (
                            <div className='progress-bar'>
                              <div className='progress-fill' style={{ width: `${diskPercent}%`, backgroundColor: '#747d8c' }} />
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {onGroupRemove && (
                    <div
                      className='qunix-list-actions-wrapper'
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    >
                      <Tooltip label={t('pages.account.home.tooltip.removeFromGroup', {})} className='ml-2'>
                        <ActionIcon
                          size='input-sm'
                          color='red'
                          variant='light'
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onGroupRemove();
                          }}
                        >
                          <FontAwesomeIcon icon={faMinus} />
                        </ActionIcon>
                      </Tooltip>
                    </div>
                  )}

                  {showContextMenu !== false &&
                    menuItems.some((item) => !item.hidden && item.canAccess !== false) && (
                      <div
                        className='qunix-list-actions-wrapper'
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                      >
                        <Tooltip label={t('common.form.powerAction', {})} className='ml-2'>
                          <ActionIcon
                            size='input-sm'
                            variant='light'
                            color='gray'
                            loading={bulkActionLoading !== null}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const rect = e.currentTarget.getBoundingClientRect();
                              openMenu(rect.left, rect.bottom);
                            }}
                          >
                            <FontAwesomeIcon icon={faEllipsisVertical} />
                          </ActionIcon>
                        </Tooltip>
                      </div>
                    )}

                  <div className='row-arrow'>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </div>
                </div>
              );
            })()}
          </NavLink>
        )}
      </ContextMenu>
    </>
  );
};

export default QunixServerListRow;
