import React from 'react';
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
  faCog,
  faCompass,
} from '@fortawesome/free-solid-svg-icons';

export interface ShortcutItem {
  id: string;
  label: string;
  path: string;
  icon: any;
  color: string;
  bg: string;
}

export const QUNIX_SHORTCUT_ITEMS: ShortcutItem[] = [
  { id: 'console', label: 'Console', path: '/console', icon: faTerminal, color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.12)' },
  { id: 'files', label: 'Files', path: '/files', icon: faFolderOpen, color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.12)' },
  { id: 'databases', label: 'Databases', path: '/databases', icon: faDatabase, color: '#34d399', bg: 'rgba(52, 211, 153, 0.12)' },
  { id: 'backups', label: 'Backups', path: '/backups', icon: faBoxArchive, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)' },
  { id: 'network', label: 'Network', path: '/network', icon: faNetworkWired, color: '#818cf8', bg: 'rgba(129, 140, 248, 0.12)' },
  { id: 'schedules', label: 'Schedules', path: '/schedules', icon: faStopwatch, color: '#f472b6', bg: 'rgba(244, 114, 182, 0.12)' },
  { id: 'startup', label: 'Startup', path: '/startup', icon: faPlay, color: '#fb7185', bg: 'rgba(251, 113, 133, 0.12)' },
  { id: 'settings', label: 'Settings', path: '/settings', icon: faCog, color: '#cbd5e1', bg: 'rgba(203, 213, 225, 0.12)' },
];

export interface QunixManagementShortcutsProps {
  serverUuid?: string;
  width?: number;
  isDemo?: boolean;
}

export default function QunixManagementShortcuts({
  serverUuid = '',
  width = 4,
  isDemo = false,
}: QunixManagementShortcutsProps) {
  // Adaptive grid layout based on 12-col card width:
  // width <= 4 (1/3 width): 3-column grid (3 rows: 3-3-2) matching demo preview
  // width <= 6 (half width): 4-column grid (2 rows: 4-4)
  // width > 6 (full or 2/3 width): responsive 2/4/8 column grid
  const gridClass =
    width <= 4
      ? 'grid-cols-3'
      : width <= 6
      ? 'grid-cols-4'
      : 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-8';

  return (
    <div className='qunix-card-flat p-4 lg:p-5 flex flex-col justify-between h-full'>
      <div>
        <div className='flex items-center justify-between mb-3'>
          <h3 className='text-xs font-bold uppercase tracking-wider text-neutral-400 m-0 flex items-center gap-2'>
            <FontAwesomeIcon icon={faCompass} className='text-indigo-400' />
            Management Shortcuts
          </h3>
        </div>

        <div className={`grid ${gridClass} gap-2.5`}>
          {QUNIX_SHORTCUT_ITEMS.map((item) => {
            const tileContent = (
              <>
                <div
                  className='qunix-nav-tile-icon'
                  style={{
                    backgroundColor: item.bg,
                    color: item.color,
                  }}
                >
                  <FontAwesomeIcon icon={item.icon} />
                </div>
                <span className='qunix-nav-tile-label'>{item.label}</span>
              </>
            );

            if (isDemo) {
              return (
                <div
                  key={item.id}
                  className='qunix-nav-tile'
                  style={{ cursor: 'pointer' }}
                >
                  {tileContent}
                </div>
              );
            }

            return (
              <NavLink
                key={item.id}
                to={`/server/${serverUuid}${item.path}`}
                className='qunix-nav-tile'
              >
                {tileContent}
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}
