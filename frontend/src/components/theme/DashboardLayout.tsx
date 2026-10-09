import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faList,
  faTh,
  faArrowRight,
  faGlobe,
  faHeadset,
  faCreditCard,
  faGripVertical,
  faSliders,
  faRotateLeft,
  faCheck,
  faBan,
  faChevronUp,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { Card as MantineCard, Overlay as MantineOverlay, Box as MantineBox } from '@mantine/core';
import { useAuth } from '@/providers/AuthProvider.tsx';
import { useUserSettingsStore } from '@/stores/userSettings.ts';
import {
  QuickLinkItem,
  DEFAULT_QUICK_LINKS,
  parseQuickLinks,
  getQuickLinkIcon,
} from './quickLinksConfig.ts';
import ServerItem from '@/pages/dashboard/home/ServerItem.tsx';
import ServerGroupItem from '@/pages/dashboard/home/ServerGroupItem.tsx';
import DashboardHomeTitle from '@/pages/dashboard/home/DashboardHomeTitle.tsx';
import { DndBoard, DndContainer, SortableItem } from '@/elements/dnd/DragAndDrop.tsx';
import Group from '@/elements/layout/Group.tsx';

import { useServerStats } from '@/plugins/server/useServerStats.ts';
import QunixServerListRow from './QunixServerListRow.tsx';
import { QunixServerGroupItem } from './QunixServerGroupItem.tsx';
import QunixServerGridCard from './QunixServerGridCard.tsx';

// Per-user dashboard persistence helpers
export function getUserDashboardStorageKey(key: string, userUuid?: string | null): string {
  const uid = userUuid || useUserSettingsStore.getState().userUuid;
  return uid ? `qunix_${uid}_${key}` : `qunix_${key}`;
}

export function getUserDashboardItem(key: string, userUuid?: string | null): string | null {
  const uid = userUuid || useUserSettingsStore.getState().userUuid;
  if (uid) {
    const val = localStorage.getItem(`qunix_${uid}_${key}`);
    if (val !== null) return val;
  }
  return localStorage.getItem(`qunix_${key}`) || localStorage.getItem(`qunix-${key}`);
}

export function setUserDashboardItem(key: string, value: string, userUuid?: string | null): void {
  const uid = userUuid || useUserSettingsStore.getState().userUuid;
  if (uid) {
    localStorage.setItem(`qunix_${uid}_${key}`, value);
  } else {
    localStorage.setItem(`qunix_${key}`, value);
  }
}

export function removeUserDashboardItem(key: string, userUuid?: string | null): void {
  const uid = userUuid || useUserSettingsStore.getState().userUuid;
  if (uid) {
    localStorage.removeItem(`qunix_${uid}_${key}`);
  }
  localStorage.removeItem(`qunix_${key}`);
  localStorage.removeItem(`qunix-${key}`);
}

// Shared state across the app runtime for layout
let dashboardLayoutState: 'grid' | 'list' = 'grid';
const layoutListeners = new Set<(layout: string) => void>();

export function setDashboardLayout(layout: 'grid' | 'list', userUuid?: string | null) {
  dashboardLayoutState = layout;
  setUserDashboardItem('dashboard_layout', layout, userUuid);
  localStorage.setItem('qunix-dashboard-layout', layout);
  layoutListeners.forEach((l) => l(layout));
}

export function useDashboardLayout(userUuid?: string | null) {
  const [layout, setLayout] = useState<'grid' | 'list'>(() => {
    const saved = getUserDashboardItem('dashboard_layout', userUuid);
    return saved === 'list' || saved === 'grid' ? saved : (dashboardLayoutState as 'grid' | 'list');
  });

  useEffect(() => {
    const saved = getUserDashboardItem('dashboard_layout', userUuid);
    if (saved === 'list' || saved === 'grid') {
      setLayout(saved);
      dashboardLayoutState = saved;
    }
  }, [userUuid]);

  useEffect(() => {
    const handler = (l: string) => setLayout(l as 'grid' | 'list');
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
  isGrouped: boolean,
  userUuid?: string | null
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
          return overlayEl ? transformDashboardElements(overlayEl, activeLayout, isGrouped, userUuid) : null;
        } : undefined,
        children: typeof originalChildren === 'function' ? (items: any) => {
          const result = originalChildren(items);
          return transformDashboardElements(result, activeLayout, isGrouped, userUuid);
        } : transformDashboardElements(originalChildren, activeLayout, isGrouped, userUuid),
      } as any);
    }

    // Intercept SortableItem's renderItem prop
    if (childEl.type === SortableItem) {
      const originalRenderItem = childEl.props.renderItem;
      return React.cloneElement(child, {
        renderItem: originalRenderItem ? (args: any) => {
          const result = typeof originalRenderItem === 'function' ? originalRenderItem(args) : originalRenderItem;
          return transformDashboardElements(result, activeLayout, isGrouped, userUuid);
        } : undefined,
      } as any);
    }

    if (childEl.props && childEl.props.children && typeof childEl.props.children !== 'function') {
      let kids = childEl.props.children;
      if (Array.isArray(kids)) {
        const hasServerItems = kids.some(
          (c: any) =>
            c?.type === ServerItem ||
            c?.type?.name === 'ServerItem' ||
            c?.props?.server ||
            (typeof c?.type === 'object' && c?.type?.type === ServerItem)
        );
        if (hasServerItems) {
          let orderArr: string[] = [];
          try {
            const saved = getUserDashboardItem('server_order', userUuid);
            if (saved) orderArr = JSON.parse(saved);
          } catch (_) { }
          if (orderArr.length > 0) {
            kids = [...kids].sort((a: any, b: any) => {
              const uuidA = a?.props?.server?.uuid;
              const uuidB = b?.props?.server?.uuid;
              if (!uuidA || !uuidB) return 0;
              const idxA = orderArr.indexOf(uuidA);
              const idxB = orderArr.indexOf(uuidB);
              if (idxA === -1 && idxB === -1) return 0;
              if (idxA === -1) return 1;
              if (idxB === -1) return -1;
              return idxA - idxB;
            });
          }
        }
      }
      return React.cloneElement(child, {
        children: transformDashboardElements(kids, activeLayout, isGrouped, userUuid),
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


import { getBannerUrl, getEggImageUrl } from '../../lib/eggResolver.ts';
export { getBannerUrl, getEggImageUrl };

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
    window.addEventListener('qunix-theme-settings-changed', handleLoaded);
    return () => {
      window.removeEventListener('qunix-settings-loaded', handleLoaded);
      window.removeEventListener('qunix-theme-settings-changed', handleLoaded);
    };
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
  const { user } = useAuth();

  const eggImageUrl = getEggImageUrl(props.server, settings);
  const bannerUrl = getBannerUrl(props.server, settings) || eggImageUrl;
  const isList = props.layout === 'list';
  const currentSettings = settings || (typeof window !== 'undefined' && (window as any).qunixThemeSettings);
  const gridBannerStyle = currentSettings?.grid_banner_style || currentSettings?.gridBannerStyle || 'right';
  const listBannerStyle = currentSettings?.list_banner_style || currentSettings?.listBannerStyle || 'right';
  const activeStyle = isList ? listBannerStyle : gridBannerStyle;
  const gridStyle = currentSettings?.server_grid_style || currentSettings?.serverGridStyle || 'default';
  const listStyle = currentSettings?.server_list_style || currentSettings?.serverListStyle || 'default';

  useEffect(() => {
    if (!cardRef.current) return;
    const allocBtns = cardRef.current.querySelectorAll('div[class*="@md:justify-end"] button');
    allocBtns.forEach((btn) => {
      btn.classList.add('qunix-privacy-blur');
      btn.setAttribute('data-privacy-sensitive', 'true');
    });

    // Ensure any previously injected egg avatar is removed so banner remains on card, not on icon/title
    const nameContainer = cardRef.current.querySelector('span.text-xl.font-medium');
    if (nameContainer) {
      const existingImg = nameContainer.querySelector('.qunix-server-egg-icon');
      if (existingImg) existingImg.remove();
    }

    const cardEl = cardRef.current.querySelector('.mantine-Card-root') as HTMLElement | null;
    if (cardEl) {
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
        } else if (activeStyle === 'fade-left' || activeStyle === 'left') {
          cardEl.classList.add('has-banner-left');
        } else if (activeStyle === 'fade-up' || activeStyle === 'up') {
          cardEl.classList.add('has-banner-up');
        } else if (activeStyle === 'fade-down' || activeStyle === 'down') {
          cardEl.classList.add('has-banner-down');
        } else if (activeStyle === 'fade-half') {
          cardEl.classList.add('has-banner-fade-half');
        } else {
          cardEl.classList.add('has-banner');
        }
        cardEl.style.setProperty('--ds-egg-banner-image', `url("${bannerUrl}")`);
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
        cardEl.style.removeProperty('--ds-egg-banner-image');
      }
    }
  });

  const handleDragStart = (e: React.DragEvent) => {
    if (!props.server?.uuid) return;
    e.dataTransfer.setData('text/qunix-server-uuid', props.server.uuid);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('text/qunix-server-uuid')) {
      e.preventDefault();
      if (cardRef.current) {
        cardRef.current.style.outline = '2px dashed #6c5ce7';
        cardRef.current.style.borderRadius = '12px';
      }
    }
  };

  const handleDragLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.outline = 'none';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (cardRef.current) {
      cardRef.current.style.outline = 'none';
    }
    const draggedUuid = e.dataTransfer.getData('text/qunix-server-uuid');
    const targetUuid = props.server?.uuid;
    if (!draggedUuid || !targetUuid || draggedUuid === targetUuid) return;

    let currentOrder: string[] = [];
    try {
      const saved = getUserDashboardItem('server_order', user?.uuid);
      if (saved) currentOrder = JSON.parse(saved);
    } catch (_) { }

    const mapKeys = Array.from((window as any).qunixRenderedServersMap?.keys() || []) as string[];
    mapKeys.forEach((k) => {
      if (!currentOrder.includes(k)) currentOrder.push(k);
    });

    if (!currentOrder.includes(draggedUuid)) currentOrder.push(draggedUuid);
    if (!currentOrder.includes(targetUuid)) currentOrder.push(targetUuid);

    const fromIdx = currentOrder.indexOf(draggedUuid);
    const toIdx = currentOrder.indexOf(targetUuid);
    if (fromIdx !== -1 && toIdx !== -1) {
      currentOrder.splice(fromIdx, 1);
      currentOrder.splice(toIdx, 0, draggedUuid);
      setUserDashboardItem('server_order', JSON.stringify(currentOrder), user?.uuid);
      window.dispatchEvent(new CustomEvent('qunix-server-order-changed'));
    }
  };

  const cardContent = isList ? (
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
      eggImageUrl={eggImageUrl}
      activeStyle={activeStyle}
      listStyle={listStyle}
    />
  ) : gridStyle === 'vanilla' ? (
    <ServerItem {...props} />
  ) : (
    <QunixServerGridCard
      server={props.server}
      to={props.to}
      isSelected={props.isSelected}
      onSelectionChange={props.onSelectionChange}
      onClick={props.onClick}
      showSelection={props.showSelection}
      showContextMenu={props.showContextMenu}
      bannerUrl={bannerUrl}
      eggImageUrl={eggImageUrl}
      activeStyle={activeStyle}
      gridStyle={gridStyle}
      onGroupRemove={props.onGroupRemove}
      sKeyPressedRef={props.sKeyPressedRef}
    />
  );

  return (
    <div
      ref={cardRef}
      draggable={true}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`qunix-server-card-outer h-full min-w-0 ${isList ? 'w-full' : ''}`}
      data-server-grid-style={gridStyle}
      data-grid-style={gridStyle}
      style={{ cursor: 'grab', transition: 'outline 0.15s ease' }}
    >
      {cardContent}
    </div>
  );
};

export const QunixDashboardQuickLinks: React.FC = () => {
  const [enabled, setEnabled] = useState<boolean>(() => {
    try {
      const s = (window as any).qunixThemeSettings;
      if (s && 'enable_dashboard_quick_links' in s) return s.enable_dashboard_quick_links !== false;
      const local = localStorage.getItem('qunix_enable_dashboard_quick_links');
      if (local !== null) return local === 'true';
    } catch (_) {}
    return true;
  });

  const [links, setLinks] = useState<QuickLinkItem[]>(() => {
    try {
      const s = (window as any).qunixThemeSettings;
      const raw = s?.dashboard_quick_links || localStorage.getItem('qunix_dashboard_quick_links');
      if (raw) return parseQuickLinks(raw);
    } catch (_) { }
    return DEFAULT_QUICK_LINKS;
  });

  useEffect(() => {
    const handleSettingsLoaded = (e: any) => {
      const detail = e?.detail || (window as any).qunixThemeSettings;
      if (detail && 'enable_dashboard_quick_links' in detail) {
        setEnabled(detail.enable_dashboard_quick_links !== false);
      }
      if (detail && 'dashboard_quick_links' in detail) {
        setLinks(parseQuickLinks(detail.dashboard_quick_links));
      }
    };
    window.addEventListener('qunix-settings-loaded', handleSettingsLoaded);
    return () => window.removeEventListener('qunix-settings-loaded', handleSettingsLoaded);
  }, []);

  if (!enabled) return null;

  const visibleLinks = links.filter((l) => l.enabled !== false);
  if (visibleLinks.length === 0) return null;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '12px',
        marginBottom: '20px',
      }}
      className='px-4 lg:px-6'
    >
      {visibleLinks.map((link) => {
        const isPrimary = Boolean(link.isPrimary || link.id === 'billing');
        const isLinkActive = link.linkEnabled !== false && Boolean(link.url);

        return (
          <MantineCard
            component={(isLinkActive ? 'a' : 'div') as any}
            key={link.id}
            href={isLinkActive ? link.url : undefined}
            target={isLinkActive && link.url.startsWith('http') ? '_blank' : undefined}
            rel={isLinkActive && link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
            withBorder
            radius='md'
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '104px',
              padding: '14px 16px',
              textDecoration: 'none',
              cursor: isLinkActive ? 'pointer' : 'default',
              overflow: 'hidden',
              transition: 'border-color 0.15s ease, background-color 0.15s ease',
              background: isPrimary
                ? 'var(--ds-button-color, #2563eb)'
                : 'var(--ds-card-bg, #12141d)',
              borderColor: isPrimary ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              color: '#ffffff',
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
              if (isLinkActive) {
                e.currentTarget.style.borderColor = isPrimary ? '#93c5fd' : (link.color || '#a29bfe');
              }
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.borderColor = isPrimary ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)';
            }}
          >
            {/* Globe Watermark Map SVG for Primary card */}
            {isPrimary && (
              <svg
                style={{
                  position: 'absolute',
                  right: '-15px',
                  bottom: '-20px',
                  width: '120px',
                  height: '120px',
                  opacity: 0.22,
                  pointerEvents: 'none',
                  color: '#ffffff',
                  zIndex: 1,
                }}
                viewBox='0 0 100 100'
                fill='currentColor'
              >
                <circle cx='50' cy='50' r='45' stroke='currentColor' strokeWidth='2' fill='none' />
                <path d='M50 5 A45 45 0 0 0 50 95 A45 45 0 0 0 50 5 Z' stroke='currentColor' strokeWidth='1.5' fill='none' />
                <path d='M5 50 H95' stroke='currentColor' strokeWidth='1.5' />
                <ellipse cx='50' cy='50' rx='25' ry='45' stroke='currentColor' strokeWidth='1.5' fill='none' />
              </svg>
            )}

            <div className='relative z-10'>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <FontAwesomeIcon
                  icon={getQuickLinkIcon(link.icon)}
                  style={{
                    fontSize: '13px',
                    color: isPrimary ? 'rgba(255, 255, 255, 0.9)' : (link.color || '#a29bfe'),
                  }}
                />
                <span
                  style={{
                    fontSize: '11px',
                    color: isPrimary ? 'rgba(255, 255, 255, 0.9)' : '#94a3b8',
                    fontWeight: 500,
                  }}
                >
                  {link.subtitle}
                </span>
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#ffffff',
                  letterSpacing: '-0.01em',
                }}
              >
                {link.title}
              </div>
            </div>

            <div
              className='relative z-10'
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                marginTop: '10px',
                fontSize: '11px',
                fontWeight: 600,
                color: isLinkActive
                  ? (isPrimary ? '#ffffff' : '#38bdf8')
                  : '#64748b',
              }}
            >
              {isLinkActive ? (
                <>
                  <span>Visit</span>
                  <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '9px' }} />
                </>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: 0.8 }}>
                  <FontAwesomeIcon icon={faBan} style={{ fontSize: '9px' }} />
                  Link Disabled
                </span>
              )}
            </div>
          </MantineCard>
        );
      })}
    </div>
  );
};

// Dashboard Container Wrapper to transform original page layout dynamically
export const QunixDashboardContainerWrapper: React.FC<{
  props: any;
  isGrouped: boolean;
  originalElement: React.ReactElement;
}> = ({ props: componentProps, isGrouped, originalElement }) => {
  const { user } = useAuth();
  const layout = useDashboardLayout(user?.uuid);
  const s = (window as any).qunixThemeSettings;
  const enableLayoutToggle = s?.enable_layout_toggle !== false && s?.enableLayoutToggle !== false;
  const [, setOrderTick] = useState(0);

  useEffect(() => {
    const handleOrderChange = () => setOrderTick((t) => t + 1);
    window.addEventListener('qunix-server-order-changed', handleOrderChange);
    return () => window.removeEventListener('qunix-server-order-changed', handleOrderChange);
  }, []);

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
  const transformedChildren = transformDashboardElements(cleanedChildren, activeLayout as 'grid' | 'list', isGrouped, user?.uuid);

  const isDark = document.documentElement.getAttribute('data-mantine-color-scheme') !== 'light';

  const welcomeMessage = s?.welcome_subtitle || s?.welcomeSubtitle || '';
  const showWelcomeSubtitle =
    welcomeMessage &&
    welcomeMessage !== 'chagne me!!!!!!!!' &&
    welcomeMessage.trim() !== '';

  // Customizable Section Order State
  const defaultSections = ['welcome', 'quick_links', 'toolbar', 'servers'];
  const [sectionOrder, setSectionOrder] = useState<string[]>(() => {
    try {
      const saved = getUserDashboardItem('dashboard_section_order', user?.uuid);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter((id: string) => defaultSections.includes(id));
          defaultSections.forEach((d) => {
            if (!valid.includes(d)) valid.push(d);
          });
          return valid;
        }
      }
      if (s?.custom_dashboard_layout) {
        const parsed = JSON.parse(s.custom_dashboard_layout);
        if (Array.isArray(parsed?.main_dashboard) && parsed.main_dashboard.length > 0) {
          return parsed.main_dashboard.map((m: any) => (typeof m === 'string' ? m : m.id));
        }
      }
    } catch (_) { }
    return defaultSections;
  });

  const [disabledSections, setDisabledSections] = useState<string[]>(() => {
    try {
      const saved = getUserDashboardItem('dashboard_disabled_sections', user?.uuid);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      if (s?.custom_dashboard_layout) {
        const parsed = JSON.parse(s.custom_dashboard_layout);
        if (Array.isArray(parsed?.main_dashboard)) {
          return parsed.main_dashboard
            .filter((m: any) => typeof m === 'object' && m.enabled === false)
            .map((m: any) => m.id);
        }
      }
    } catch (_) { }
    return [];
  });

  // Sync settings when user logs in or switches
  useEffect(() => {
    if (!user?.uuid) return;
    try {
      const saved = getUserDashboardItem('dashboard_section_order', user.uuid);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter((id: string) => defaultSections.includes(id));
          defaultSections.forEach((d) => {
            if (!valid.includes(d)) valid.push(d);
          });
          setSectionOrder(valid);
        }
      }
      const savedDisabled = getUserDashboardItem('dashboard_disabled_sections', user.uuid);
      if (savedDisabled) {
        const parsed = JSON.parse(savedDisabled);
        if (Array.isArray(parsed)) setDisabledSections(parsed);
      }
    } catch (_) { }
  }, [user?.uuid]);

  useEffect(() => {
    const handler = (e: any) => {
      if (Array.isArray(e.detail)) {
        setSectionOrder(e.detail);
      }
    };
    window.addEventListener('qunix-dashboard-sections-updated', handler);
    return () => window.removeEventListener('qunix-dashboard-sections-updated', handler);
  }, []);

  const [isCustomizeMode, setIsCustomizeMode] = useState(false);
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);

  const handleSectionDragStart = (id: string, e: React.DragEvent) => {
    e.dataTransfer.setData('text/qunix-dashboard-section-id', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedSectionId(id);
  };

  const handleSectionDrop = (targetId: string, e: React.DragEvent) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/qunix-dashboard-section-id') || draggedSectionId;
    if (!sourceId || sourceId === targetId) {
      setDragOverSectionId(null);
      setDraggedSectionId(null);
      return;
    }

    const next = [...sectionOrder];
    const fromIdx = next.indexOf(sourceId);
    const toIdx = next.indexOf(targetId);
    if (fromIdx !== -1 && toIdx !== -1) {
      const [item] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, item);
      setSectionOrder(next);
      setUserDashboardItem('dashboard_section_order', JSON.stringify(next), user?.uuid);
      window.dispatchEvent(new CustomEvent('qunix-dashboard-sections-updated', { detail: next }));
    }
    setDraggedSectionId(null);
    setDragOverSectionId(null);
  };

  const moveSection = (id: string, direction: -1 | 1) => {
    const next = [...sectionOrder];
    const idx = next.indexOf(id);
    const newIdx = idx + direction;
    if (idx === -1 || newIdx < 0 || newIdx >= next.length) return;
    const [item] = next.splice(idx, 1);
    next.splice(newIdx, 0, item);
    setSectionOrder(next);
    setUserDashboardItem('dashboard_section_order', JSON.stringify(next), user?.uuid);
    window.dispatchEvent(new CustomEvent('qunix-dashboard-sections-updated', { detail: next }));
  };

  const toggleSectionVisibility = (id: string) => {
    const next = disabledSections.includes(id)
      ? disabledSections.filter((sId) => sId !== id)
      : [...disabledSections, id];
    setDisabledSections(next);
    setUserDashboardItem('dashboard_disabled_sections', JSON.stringify(next), user?.uuid);
  };

  const handleResetSections = () => {
    setSectionOrder(defaultSections);
    setDisabledSections([]);
    removeUserDashboardItem('dashboard_section_order', user?.uuid);
    removeUserDashboardItem('dashboard_disabled_sections', user?.uuid);
    removeUserDashboardItem('server_order', user?.uuid);
    window.dispatchEvent(new CustomEvent('qunix-dashboard-sections-updated', { detail: defaultSections }));
    window.dispatchEvent(new CustomEvent('qunix-server-order-changed'));
  };

  const getSectionTitle = (id: string) => {
    switch (id) {
      case 'welcome':
        return 'Welcome Header';
      case 'quick_links':
        return 'Quick Action Links';
      case 'toolbar':
        return 'Server Filters & Toolbar';
      case 'servers':
        return 'Server Grid / List Cards';
      default:
        return id;
    }
  };

  const renderSectionContent = (id: string) => {
    switch (id) {
      case 'welcome':
        return (
          <div style={{ marginBottom: '16px' }} className='px-4 lg:px-6 lg:mt-6 mt-2'>
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
        );
      case 'quick_links':
        return <QunixDashboardQuickLinks />;
      case 'toolbar':
        return (
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
                    onClick={() => setDashboardLayout('list', user?.uuid)}
                    className={`qunix-layout-toggle-btn ${activeLayout === 'list' ? 'active' : ''}`}
                    title='List View'
                  >
                    <FontAwesomeIcon icon={faList} />
                  </button>
                  <button
                    onClick={() => setDashboardLayout('grid', user?.uuid)}
                    className={`qunix-layout-toggle-btn ${activeLayout === 'grid' ? 'active' : ''}`}
                    title='Grid View'
                  >
                    <FontAwesomeIcon icon={faTh} />
                  </button>
                  <button
                    onClick={() => setIsCustomizeMode(!isCustomizeMode)}
                    className={`qunix-layout-toggle-btn qunix-customize-btn ${isCustomizeMode ? 'active' : ''}`}
                    title='Customize Dashboard Layout (Drag & Drop)'
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '0 10px',
                      fontSize: '11px',
                      color: isCustomizeMode ? '#ffffff' : undefined,
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faSliders}
                      style={{
                        width: '12px',
                        height: '12px',
                        fontSize: '12px',
                        display: 'inline-block',
                        flexShrink: 0,
                      }}
                    />
                    <span>Customize</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      case 'servers':
        return (
          <div>
            {React.cloneElement(originalElement, {
              children: transformedChildren,
            } as any)}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Customization Mode Notification Banner */}
      {isCustomizeMode && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            margin: '12px 16px',
            background: 'rgba(108, 92, 231, 0.12)',
            border: '1px dashed #6c5ce7',
            borderRadius: '10px',
            color: '#e4e4e7',
            fontSize: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FontAwesomeIcon icon={faSliders} style={{ color: '#a29bfe' }} />
            <span>
              <strong>Customize Dashboard Layout</strong>: Drag sections by their handle to rearrange layout order. Drag server cards or quick action links to reorder items.
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleResetSections}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#e4e4e7',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <FontAwesomeIcon icon={faRotateLeft} style={{ fontSize: '9px' }} />
              <span>Reset</span>
            </button>
            <button
              onClick={() => setIsCustomizeMode(false)}
              style={{
                background: '#6c5ce7',
                border: 'none',
                color: '#ffffff',
                borderRadius: '6px',
                padding: '4px 12px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <FontAwesomeIcon icon={faCheck} style={{ fontSize: '10px' }} />
              <span>Done</span>
            </button>
          </div>
        </div>
      )}

      {/* Render modular sections in customized order */}
      {sectionOrder.map((secId) => {
        if (!isCustomizeMode && disabledSections.includes(secId)) {
          return null;
        }
        return (
          <div
            key={secId}
            draggable={isCustomizeMode}
            onDragStart={(e) => handleSectionDragStart(secId, e)}
            onDragOver={(e) => {
              if (isCustomizeMode) {
                e.preventDefault();
                setDragOverSectionId(secId);
              }
            }}
            onDragLeave={() => setDragOverSectionId(null)}
            onDrop={(e) => handleSectionDrop(secId, e)}
            style={{
              position: 'relative',
              transition: 'all 0.15s ease',
              outline: isCustomizeMode
                ? dragOverSectionId === secId
                  ? '2px dashed #6c5ce7'
                  : '1px dashed rgba(255, 255, 255, 0.15)'
                : 'none',
              borderRadius: isCustomizeMode ? '10px' : '0',
              margin: isCustomizeMode ? '4px 0' : '0',
              padding: isCustomizeMode ? '4px 0' : '0',
              background: isCustomizeMode && dragOverSectionId === secId ? 'rgba(108, 92, 231, 0.08)' : 'transparent',
            }}
          >
            {isCustomizeMode && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 16px',
                  marginBottom: '4px',
                  fontSize: '11px',
                  color: '#a29bfe',
                  cursor: 'grab',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '6px',
                  margin: '0 16px 8px 16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <FontAwesomeIcon icon={faGripVertical} style={{ width: '10px', height: '12px' }} />
                  <span>{getSectionTitle(secId)}</span>
                  {disabledSections.includes(secId) && (
                    <span style={{ color: '#ef4444', fontSize: '10px', fontWeight: 500, padding: '1px 6px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px' }}>
                      Hidden
                    </span>
                  )}
                  <span style={{ color: '#71717a', fontSize: '10px', fontWeight: 'normal' }}>
                    • Drag to reorder
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <button
                    type='button'
                    onClick={() => toggleSectionVisibility(secId)}
                    style={{
                      background: disabledSections.includes(secId) ? 'rgba(239, 68, 68, 0.2)' : '#1c1d24',
                      border: `1px solid ${disabledSections.includes(secId) ? '#ef4444' : '#2e303c'}`,
                      color: disabledSections.includes(secId) ? '#fca5a5' : '#e4e4e7',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      cursor: 'pointer',
                      fontSize: '10px',
                      fontWeight: 500,
                    }}
                    title={disabledSections.includes(secId) ? 'Show section on dashboard' : 'Hide section on dashboard'}
                  >
                    {disabledSections.includes(secId) ? 'Show' : 'Hide'}
                  </button>
                  <button
                    type='button'
                    onClick={() => moveSection(secId, -1)}
                    disabled={sectionOrder.indexOf(secId) === 0}
                    style={{
                      background: '#1c1d24',
                      border: '1px solid #2e303c',
                      color: '#e4e4e7',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      cursor: 'pointer',
                      fontSize: '10px',
                      opacity: sectionOrder.indexOf(secId) === 0 ? 0.4 : 1,
                    }}
                    title='Move up'
                  >
                    <FontAwesomeIcon icon={faChevronUp} style={{ fontSize: '9px' }} />
                  </button>
                  <button
                    type='button'
                    onClick={() => moveSection(secId, 1)}
                    disabled={sectionOrder.indexOf(secId) === sectionOrder.length - 1}
                    style={{
                      background: '#1c1d24',
                      border: '1px solid #2e303c',
                      color: '#e4e4e7',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      cursor: 'pointer',
                      fontSize: '10px',
                      opacity: sectionOrder.indexOf(secId) === sectionOrder.length - 1 ? 0.4 : 1,
                    }}
                    title='Move down'
                  >
                    <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: '9px' }} />
                  </button>
                </div>
              </div>
            )}
            <div style={{ opacity: isCustomizeMode && disabledSections.includes(secId) ? 0.45 : 1 }}>
              {renderSectionContent(secId)}
            </div>
          </div>
        );
      })}
    </div>
  );
};
