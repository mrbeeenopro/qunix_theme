import React, { useState, useEffect } from 'react';
import { useLocation, NavLink } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import ActionIcon from '@/elements/buttons/ActionIcon.tsx';
import Card from '@/elements/data-display/Card.tsx';
import CloseButton from '@/elements/buttons/CloseButton.tsx';
import Drawer from '@/elements/overlays/Drawer.tsx';
import AppIcon from '@/elements/AppIcon.tsx';
import QuickActionsTrigger from '@/elements/quickActions/QuickActionsTrigger.tsx';
import ServerStatusIndicator from '@/elements/ServerStatusIndicator.tsx';
import Sidebar from '@/elements/navigation/Sidebar.tsx';
import Title from '@/elements/typography/Title.tsx';
import Text from '@/elements/typography/Text.tsx';
import { useRelativePageStore } from '@/stores/relativePage.ts';
import QunixHorizontalNavbar from './QunixHorizontalNavbar.tsx';

export type SidebarProps = {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
};

function extractServerStatus(header: React.ReactNode): React.ReactNode {
  let found: React.ReactNode = null;

  function traverse(nodes: React.ReactNode) {
    React.Children.forEach(nodes, (node) => {
      if (!React.isValidElement(node) || found) return;

      const props = (node.props as any) || {};
      const compName = (node.type as any)?.displayName || (node.type as any)?.name || '';

      if (
        node.type === ServerStatusIndicator ||
        compName.includes('ServerStatus') ||
        props.id?.includes('server-status') ||
        String(props.className).includes('server-status')
      ) {
        found = node;
        return;
      }

      if (props.children) {
        traverse(props.children);
      }
    });
  }

  traverse(header);
  return found;
}

export const QunixSidebar: React.FC<SidebarProps> = ({ children, header, footer }) => {
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pageHeader = useRelativePageStore((state) => state.pageHeader);
  const setHasMobileNavbar = useRelativePageStore((state) => state.setHasMobileNavbar);

  useEffect(() => {
    setHasMobileNavbar(true);
    return () => setHasMobileNavbar(false);
  }, []);

  const [dashboardLayout, setDashboardLayout] = useState<string>(() => {
    return (
      document.documentElement.getAttribute('data-dashboard-layout') ||
      (window as any).qunixThemeSettings?.dashboard_layout ||
      'default'
    );
  });

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const updateLayout = () => {
      const current =
        document.documentElement.getAttribute('data-dashboard-layout') ||
        (window as any).qunixThemeSettings?.dashboard_layout ||
        'default';
      setDashboardLayout(current);
    };

    updateLayout();

    const observer = new MutationObserver(updateLayout);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-dashboard-layout'],
    });

    window.addEventListener('qunix-settings-loaded', updateLayout);

    return () => {
      observer.disconnect();
      window.removeEventListener('qunix-settings-loaded', updateLayout);
    };
  }, []);

  const isHorizontal = dashboardLayout === 'horizontal';
  const serverStatus = extractServerStatus(header);

  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    try {
      const local = localStorage.getItem('qunix_sidebar_width');
      if (local) return parseInt(local, 10);
    } catch (_) {}
    const s = (window as any).qunixThemeSettings;
    return s?.sidebar_width !== undefined ? s.sidebar_width : 256;
  });
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);

  useEffect(() => {
    if (sidebarWidth) {
      document.documentElement.style.setProperty('--ds-sidebar-width', `${sidebarWidth}px`);
    }
  }, [sidebarWidth]);

  const handleSidebarResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingSidebar(true);
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.max(180, Math.min(450, Math.round(startWidth + delta)));
      setSidebarWidth(newWidth);
      document.documentElement.style.setProperty('--ds-sidebar-width', `${newWidth}px`);
      try {
        localStorage.setItem('qunix_sidebar_width', String(newWidth));
      } catch (_) {}
      if ((window as any).qunixThemeSettings) {
        (window as any).qunixThemeSettings.sidebar_width = newWidth;
      }
    };

    const onMouseUp = () => {
      setIsResizingSidebar(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.dispatchEvent(new Event('resize'));
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleSidebarResetWidth = () => {
    const defaultWidth = 256;
    setSidebarWidth(defaultWidth);
    document.documentElement.style.setProperty('--ds-sidebar-width', `${defaultWidth}px`);
    try {
      localStorage.removeItem('qunix_sidebar_width');
    } catch (_) {}
    if ((window as any).qunixThemeSettings) {
      (window as any).qunixThemeSettings.sidebar_width = defaultWidth;
    }
    window.dispatchEvent(new Event('resize'));
  };

  return (
    <>
      {/* Mobile Sidebar Toggle Button & Header */}
      <Card
        className='lg:hidden! sticky! top-5 z-50 flex-row! items-center justify-end -ml-1 mt-5 h-12 w-16 rounded-l-none! qunix-mobile-toggle-card'
        p='xs'
      >
        <ActionIcon onClick={() => setIsMobileMenuOpen(true)} variant='subtle' aria-label='Open Navigation Menu'>
          <FontAwesomeIcon size='lg' icon={faBars} />
        </ActionIcon>
      </Card>

      <div className='lg:hidden -mt-12 mb-4 ml-20 mr-4 h-12 flex flex-col justify-center min-w-0 pointer-events-none'>
        {pageHeader && (
          <>
            <Title order={3} lineClamp={1}>
              {pageHeader.title}
            </Title>
            {pageHeader.subtitle && (
              <Text size='xs' c='dimmed' truncate>
                {pageHeader.subtitle}
              </Text>
            )}
          </>
        )}
      </div>

      {/* Mobile Drawer (Always standard vertical drawer) */}
      <Drawer
        opened={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        withCloseButton={false}
        maw='16rem'
        className='qunix-sidebar-mobile-drawer'
        styles={{ body: { height: '100%' } }}
      >
        <CloseButton
          size='xl'
          className='absolute! top-3.5 right-3.5 z-20 qunix-sidebar-mobile-close'
          onClick={() => setIsMobileMenuOpen(false)}
        />

        <div id='sidebar-content' className='h-full flex flex-col qunix-sidebar-mobile-content'>
          {header && <div className='shrink-0 qunix-sidebar-mobile-header'>{header}</div>}
          <div className='flex flex-col flex-1 overflow-y-auto min-h-0'>{children}</div>
          {footer && <div className='shrink-0 pt-2'>{footer}</div>}
        </div>
      </Drawer>

      {/* Desktop Navigation */}
      <Card
        className='my-2 ml-2 top-2 sticky! hidden! lg:block! h-[calc(100vh-16px)] overflow-hidden transition-[width] duration-150 ease-in-out relative group/sidebar'
        p='sm'
        id='sidebar-desktop'
      >
        <div id='sidebar-content' className='h-full flex flex-col'>
          {isHorizontal ? (
            <>
              {/* Row 1: Header (Left Brand, Center QuickActions Search, Right Power Actions & Profile) */}
              <div className='qunix-horizontal-top-row shrink-0'>
                <div className='qunix-horizontal-brand'>
                  <NavLink to='/' className='qunix-horizontal-brand-link'>
                    <AppIcon />
                  </NavLink>
                </div>

                <div className='qunix-horizontal-center'>
                  <QuickActionsTrigger />
                </div>

                <div className='qunix-horizontal-right'>
                  {serverStatus}
                  <Sidebar.Footer />
                </div>
              </div>

              {/* Row 2: Category Folders Navigation Bar */}
              <div className='flex flex-col flex-1 overflow-y-auto min-h-0'>
                <QunixHorizontalNavbar header={header} footer={footer}>
                  {children}
                </QunixHorizontalNavbar>
              </div>
            </>
          ) : (
            <>
              {header && <div className='shrink-0'>{header}</div>}
              <div className='flex flex-col flex-1 overflow-y-auto min-h-0'>{children}</div>
              {footer && <div className='shrink-0 pt-2'>{footer}</div>}
            </>
          )}
        </div>

        {/* Interactive Desktop Sidebar Horizontal Resize Handle */}
        {!isHorizontal && (
          <div
            onMouseDown={handleSidebarResizeStart}
            onDoubleClick={handleSidebarResetWidth}
            title='Drag to resize sidebar width • Double-click to reset (256px)'
            className='absolute top-0 right-0 w-2.5 h-full cursor-col-resize z-40 flex items-center justify-center select-none hover:bg-indigo-500/15 transition-colors group'
          >
            <div className={`w-0.5 h-8 rounded-full ${isResizingSidebar ? 'bg-indigo-400' : 'bg-white/10 group-hover:bg-white/30'} transition-colors`} />
          </div>
        )}
      </Card>
    </>
  );
};

export default QunixSidebar;
