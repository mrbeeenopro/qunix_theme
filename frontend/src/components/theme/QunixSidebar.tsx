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

  return (
    <>
      {/* Mobile Sidebar Toggle Button */}
      <Card className='lg:hidden! sticky! top-5 z-50 flex-row! justify-end -ml-1 my-4 w-16 rounded-l-none!' p='xs'>
        <ActionIcon onClick={() => setIsMobileMenuOpen(true)} variant='subtle'>
          <FontAwesomeIcon size='lg' icon={faBars} />
        </ActionIcon>
      </Card>

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
        className='my-2 ml-2 top-2 sticky! hidden! lg:block! h-[calc(100vh-16px)] w-64! overflow-hidden transition-[width] duration-200 ease-in-out'
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
      </Card>
    </>
  );
};

export default QunixSidebar;
