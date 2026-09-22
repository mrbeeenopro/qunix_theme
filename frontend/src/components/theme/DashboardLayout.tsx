import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faTh } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/providers/AuthProvider.tsx';
import ServerItem from '@/pages/dashboard/home/ServerItem.tsx';
import ServerGroupItem from '@/pages/dashboard/home/ServerGroupItem.tsx';
import DashboardHomeTitle from '@/pages/dashboard/home/DashboardHomeTitle.tsx';
import { DndBoard, DndContainer, SortableItem } from '@/elements/dnd/DragAndDrop.tsx';
import Group from '@/elements/layout/Group.tsx';
import { useServerStats } from '@/plugins/server/useServerStats.ts';
import QunixServerListRow from './QunixServerListRow.tsx';
import { QunixServerGroupItem } from './QunixServerGroupItem.tsx';

// Shared state across the app runtime for layout
let dashboardLayoutState = localStorage.getItem('qunix-dashboard-layout') || 'grid';
const layoutListeners = new Set<(layout: string) => void>();

export function setDashboardLayout(layout: 'grid' | 'list') {
  dashboardLayoutState = layout;
  localStorage.setItem('qunix-dashboard-layout', layout);
  layoutListeners.forEach((l) => l(layout));
}

export function useDashboardLayout() {
  const [layout, setLayout] = useState(dashboardLayoutState);
  useEffect(() => {
    const handler = (l: string) => setLayout(l);
    layoutListeners.add(handler);
    return () => {
      layoutListeners.delete(handler);
    };
  }, []);
  return layout;
}

// Helper to transform dashboard component elements (ServerItem, ServerGroupItem, etc.)
export function transformDashboardElements(
  element: React.ReactNode,
  activeLayout: 'grid' | 'list',
  isGrouped: boolean
): React.ReactNode {
  return React.Children.map(element, (child) => {
    if (!React.isValidElement(child)) return child;

    const childEl = child as any;

    // Intercept ServerItem (Memoized or Direct)
    const isServerItem =
      childEl.type === ServerItem ||
      (typeof childEl.type === 'object' && childEl.type !== null && childEl.type.type === ServerItem) ||
      childEl.type?.name === 'ServerItem' ||
      childEl.type?.type?.name === 'ServerItem';
    if (isServerItem) {
      return <QunixServerItemWrapper {...(childEl.props || {})} layout={activeLayout} />;
    }

    // Intercept ServerGroupItem
    const isServerGroupItem =
      childEl.type === ServerGroupItem ||
      (typeof childEl.type === 'object' && childEl.type !== null && childEl.type.type === ServerGroupItem) ||
      childEl.type?.name === 'ServerGroupItem' ||
      childEl.type?.type?.name === 'ServerGroupItem' ||
      childEl.type?.displayName === 'ServerGroupItem' ||
      childEl.type?.type?.displayName === 'ServerGroupItem';
    if (isServerGroupItem) {
      return <QunixServerGroupItemWrapper {...(childEl.props || {})} layout={activeLayout} />;
    }

    // Intercept DndContainer and DndBoard to process dynamically loaded items and overlays
    if (childEl.type === DndContainer || childEl.type === DndBoard) {
      const originalChildren = childEl.props.children;
      const originalRenderOverlay = childEl.props.renderOverlay;
      return React.cloneElement(child, {
        renderOverlay: originalRenderOverlay ? (arg: any) => {
          const overlayEl = typeof originalRenderOverlay === 'function' ? originalRenderOverlay(arg) : originalRenderOverlay;
          return overlayEl ? transformDashboardElements(overlayEl, activeLayout, isGrouped) : null;
        } : undefined,
        children: typeof originalChildren === 'function' ? (items: any) => {
          const result = originalChildren(items);
          return transformDashboardElements(result, activeLayout, isGrouped);
        } : transformDashboardElements(originalChildren, activeLayout, isGrouped),
      } as any);
    }

    // Intercept SortableItem's renderItem prop
    if (childEl.type === SortableItem) {
      const originalRenderItem = childEl.props.renderItem;
      return React.cloneElement(child, {
        renderItem: originalRenderItem ? (args: any) => {
          const result = typeof originalRenderItem === 'function' ? originalRenderItem(args) : originalRenderItem;
          return transformDashboardElements(result, activeLayout, isGrouped);
        } : undefined,
      } as any);
    }

    if (childEl.props && childEl.props.children && typeof childEl.props.children !== 'function') {
      return React.cloneElement(child, {
        children: transformDashboardElements(childEl.props.children, activeLayout, isGrouped),
      } as any);
    }

    return child;
  });
}

// Helper to extract Title and Filter controls from the React children tree
export function extractAndReplace(
  children: React.ReactNode,
  extracted: { title: React.ReactElement | null; filters: React.ReactElement | null }
): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;

    const childEl = child as any;

    const isTitle =
      childEl.type === DashboardHomeTitle ||
      (typeof childEl.type === 'object' && childEl.type !== null && childEl.type.type === DashboardHomeTitle);
    if (isTitle) {
      extracted.title = childEl;
      return null;
    }

    const isFilters = childEl.type === Group && childEl.props && childEl.props.mb === 'md';
    if (isFilters) {
      extracted.filters = childEl;
      return null;
    }

    if (childEl.props && childEl.props.children && typeof childEl.props.children !== 'function') {
      return React.cloneElement(child, {
        children: extractAndReplace(childEl.props.children, extracted),
      } as any);
    }

    return child;
  });
}


export const getBannerUrl = (server: any, settings?: any) => {
  const currentSettings = settings || (typeof window !== 'undefined' && (window as any).qunixThemeSettings);
  if (!server || !server.egg || !currentSettings) return null;
  const eggBanners = currentSettings.egg_banners || currentSettings.eggBanners || {};
  const egg = server.egg;
  const nest = server.nest;
  const custom =
    eggBanners[egg.uuid] ||
    (egg.uuid && eggBanners[egg.uuid.toLowerCase()]) ||
    eggBanners[egg.name] ||
    (egg.name && eggBanners[egg.name.toLowerCase()]) ||
    (egg.id && eggBanners[egg.id]) ||
    (nest?.uuid && eggBanners[nest.uuid]) ||
    (nest?.uuid && eggBanners[nest.uuid.toLowerCase()]) ||
    (nest?.name && eggBanners[nest.name]) ||
    (egg.nestUuid && eggBanners[egg.nestUuid]) ||
    (egg.nest_uuid && eggBanners[egg.nest_uuid]);
  if (custom) return custom;

  // Default Minecraft banner
  const eggName = (egg.name || '').toLowerCase();
  const nestName = (nest?.name || '').toLowerCase();
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
  if (mcKeywords.some((k) => eggName.includes(k) || nestName.includes(k))) {
    return 'https://xgamingserver.com/img/game-images/minecraft-hero.webp';
  }

  return null;
};

export const QunixServerGroupItemWrapper: React.FC<any> = (props) => {
  return <QunixServerGroupItem {...props} />;
};

// Replaced wrapper for ServerItem to handle list vs grid
export const QunixServerItemWrapper: React.FC<any> = (props) => {
  const stats = useServerStats(props.server);
  const state = stats?.state || 'offline';
  const [settings, setSettings] = useState<any>(() => (window as any).qunixThemeSettings);

  useEffect(() => {
    const handleLoaded = (e: Event) => {
      setSettings((e as CustomEvent).detail);
    };
    window.addEventListener('qunix-settings-loaded', handleLoaded);
    return () => window.removeEventListener('qunix-settings-loaded', handleLoaded);
  }, []);

  useEffect(() => {
    if (props.server) {
      if (!(window as any).qunixRenderedServersMap) {
        (window as any).qunixRenderedServersMap = new Map<string, any>();
      }
      const map = (window as any).qunixRenderedServersMap;
      map.set(props.server.uuid.toLowerCase(), props.server);
      if (props.server.uuidShort) {
        map.set(props.server.uuidShort.toLowerCase(), props.server);
      }
    }
    window.dispatchEvent(new CustomEvent('qunix-server-rendered'));
  }, [props.server]);

  const cardRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const allocBtns = cardRef.current.querySelectorAll('div[class*="@md:justify-end"] button');
    allocBtns.forEach((btn) => {
      btn.classList.add('qunix-privacy-blur');
      btn.setAttribute('data-privacy-sensitive', 'true');
    });
  });

  const bannerUrl = getBannerUrl(props.server, settings);

  const isList = props.layout === 'list';
  const currentSettings = settings || (typeof window !== 'undefined' && (window as any).qunixThemeSettings);
  const gridBannerStyle = currentSettings?.grid_banner_style || currentSettings?.gridBannerStyle || 'cover';
  const listBannerStyle = currentSettings?.list_banner_style || currentSettings?.listBannerStyle || 'right';
  const activeStyle = isList ? listBannerStyle : gridBannerStyle;

  if (isList) {
    return (
      <QunixServerListRow
        server={props.server}
        stats={stats}
        state={state}
        to={props.to}
        isSelected={props.isSelected}
        onSelectionChange={props.onSelectionChange}
        sKeyPressedRef={props.sKeyPressedRef}
        onGroupRemove={props.onGroupRemove}
        showSelection={props.showSelection}
        showContextMenu={props.showContextMenu}
        bannerUrl={bannerUrl}
        activeStyle={activeStyle}
      />
    );
  }

  const wrapperClasses = ['qunix-grid-card-wrapper', 'qunix-server-card'];
  const customStyles: React.CSSProperties = {
    width: '100%',
    height: 'auto',
  };

  if (bannerUrl && activeStyle !== 'disabled') {
    if (activeStyle === 'right') {
      wrapperClasses.push('has-banner-right');
    } else if (activeStyle === 'fade-left') {
      wrapperClasses.push('has-banner-left');
    } else if (activeStyle === 'fade-up') {
      wrapperClasses.push('has-banner-up');
    } else if (activeStyle === 'fade-down') {
      wrapperClasses.push('has-banner-down');
    } else if (activeStyle === 'fade-half') {
      wrapperClasses.push('has-banner-fade-half');
    } else {
      wrapperClasses.push('has-banner');
    }
    (customStyles as any)['--ds-egg-banner-image'] = `url("${bannerUrl}")`;
  }

  return (
    <div ref={cardRef} className={wrapperClasses.join(' ')} style={customStyles}>
      <ServerItem {...props} />
    </div>
  );
};

// Dashboard Container Wrapper to transform original page layout dynamically
export const QunixDashboardContainerWrapper: React.FC<{
  props: any;
  isGrouped: boolean;
  originalElement: React.ReactElement;
}> = ({ props: componentProps, isGrouped, originalElement }) => {
  const layout = useDashboardLayout();
  const s = (window as any).qunixThemeSettings;
  const enableLayoutToggle = s?.enable_layout_toggle !== false && s?.enableLayoutToggle !== false;
  const { user } = useAuth();

  const activeLayout = enableLayoutToggle ? layout : 'grid';

  useEffect(() => {
    const root = document.documentElement;
    if (activeLayout === 'list') {
      root.classList.add('qunix-layout-list');
      root.classList.remove('qunix-layout-grid');
    } else {
      root.classList.add('qunix-layout-grid');
      root.classList.remove('qunix-layout-list');
    }
  }, [activeLayout]);

  const extracted = { title: null as React.ReactElement | null, filters: null as React.ReactElement | null };
  const cleanedChildren = extractAndReplace((originalElement.props as any)?.children, extracted);
  const transformedChildren = transformDashboardElements(cleanedChildren, activeLayout as 'grid' | 'list', isGrouped);

  const isDark = document.documentElement.getAttribute('data-mantine-color-scheme') !== 'light';

  const welcomeMessage = s?.welcome_subtitle || s?.welcomeSubtitle || '';
  const showWelcomeSubtitle =
    welcomeMessage &&
    welcomeMessage !== 'chagne me!!!!!!!!' &&
    welcomeMessage.trim() !== '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* 1. Welcome Message */}
      <div style={{ marginBottom: '24px' }} className='px-4 lg:px-6 lg:mt-6 mt-2'>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700 }}>
          Welcome back, {user?.username || 'User'}
        </h1>
        {showWelcomeSubtitle && (
          <p
            style={{
              margin: '8px 0 0 0',
              fontSize: '15px',
              color: isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)',
            }}
          >
            {welcomeMessage}
          </p>
        )}
      </div>

      {/* 2. Custom header row containing tabs and controls side by side */}
      <div className='qunix-dashboard-header-toolbar px-4 lg:px-6'>
        {/* Tabs (DashboardHomeTitle) on the left */}
        <div className='qunix-dashboard-tabs-wrapper'>
          {extracted.title}
        </div>

        {/* Filters and Layout Toggle on the right */}
        <div className='qunix-dashboard-controls-wrapper'>
          {extracted.filters && (
            <div className='qunix-dashboard-filters-inner'>
              {(extracted.filters.props as any)?.children}
            </div>
          )}
          {enableLayoutToggle && (
            <div className='qunix-layout-toggle-group'>
              <button
                onClick={() => setDashboardLayout('list')}
                className={`qunix-layout-toggle-btn ${activeLayout === 'list' ? 'active' : ''}`}
                title='List View'
              >
                <FontAwesomeIcon icon={faList} />
              </button>
              <button
                onClick={() => setDashboardLayout('grid')}
                className={`qunix-layout-toggle-btn ${activeLayout === 'grid' ? 'active' : ''}`}
                title='Grid View'
              >
                <FontAwesomeIcon icon={faTh} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. The remaining page body */}
      {React.cloneElement(originalElement, {
        children: transformedChildren,
      } as any)}
    </div>
  );
};
