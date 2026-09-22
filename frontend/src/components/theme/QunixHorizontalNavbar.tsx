import React, { useMemo } from 'react';
import { useLocation, useNavigate, matchPath } from 'react-router';
import { Menu, Button } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faLayerGroup,
  faFolderOpen,
  faCogs,
  faShieldHalved,
  faToolbox,
  faDatabase,
} from '@fortawesome/free-solid-svg-icons';
import DynamicIcon from './DynamicIcon.tsx';
import { useExtTranslations } from '../../translations.ts';

interface LinkItem {
  to: string;
  name: string;
  icon?: any;
  end?: boolean;
  activeMatches?: string[];
  customIcon?: string | null;
}

interface CategoryGroup {
  name: string;
  icon?: any;
  items: LinkItem[];
}

interface QunixHorizontalNavbarProps {
  children?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

// Deep recursive traversal to find all Links and Dividers even if wrapped in ServerCan, Fragment, or custom wrappers
function extractAllLinksAndDividers(nodes: React.ReactNode): Array<{ type: 'link' | 'divider'; props: any }> {
  const result: Array<{ type: 'link' | 'divider'; props: any }> = [];

  function traverse(nodeList: React.ReactNode) {
    React.Children.forEach(nodeList, (node) => {
      if (!React.isValidElement(node)) return;

      const props = (node.props as any) || {};

      // If it is a Link (has props.to and props.name)
      if (props.to && props.name) {
        result.push({
          type: 'link',
          props: {
            to: props.to,
            name: props.name,
            icon: props.icon,
            end: props.end,
            activeMatches: props.activeMatches,
            permission: props.permission,
          },
        });
        return;
      }

      // If it is an explicit Divider with label
      if (props.label !== undefined && props.label !== null && String(props.label).trim() !== '') {
        result.push({
          type: 'divider',
          props: {
            label: String(props.label),
          },
        });
        return;
      }

      // If wrapper node, traverse children (e.g. ServerCan, React.Fragment, div, etc.)
      if (props.children) {
        traverse(props.children);
      }
    });
  }

  traverse(nodes);
  return result;
}

export const QunixHorizontalNavbar: React.FC<QunixHorizontalNavbarProps> = ({ children, header }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t: tExt } = useExtTranslations();

  const [s, setSettings] = React.useState<any>(() => (window as any).qunixThemeSettings);

  React.useEffect(() => {
    const handleLoaded = (e: Event) => {
      setSettings((e as CustomEvent).detail);
    };
    window.addEventListener('qunix-settings-loaded', handleLoaded);
    return () => window.removeEventListener('qunix-settings-loaded', handleLoaded);
  }, []);

  const sidebarIcons = s?.sidebar_icons || s?.sidebarIcons || {};

  const resolveLinkCustomIcon = React.useCallback((to: string, name: string): string | null => {
    let cleanTo = (to || '').split('?')[0].split('#')[0].replace(/\/$/, '').replace(/\/\*$/, '');
    const linkName = typeof name === 'string' ? name : '';
    const lowerName = linkName.toLowerCase();

    let key: string | null = null;
    if (cleanTo === '' || cleanTo === '/' || cleanTo === '/grouped') key = 'servers';
    else if (cleanTo === '/admin' || cleanTo === '/admin/') key = 'admin';
    else if (cleanTo.startsWith('/admin/settings')) key = 'admin_settings';
    else if (cleanTo.startsWith('/admin/announcements')) key = 'admin_announcements';
    else if (cleanTo.startsWith('/admin/assets')) key = 'admin_assets';
    else if (cleanTo.startsWith('/admin/extensions')) key = 'admin_extensions';
    else if (cleanTo.startsWith('/admin/users')) key = 'admin_users';
    else if (cleanTo.startsWith('/admin/locations')) key = 'admin_locations';
    else if (cleanTo.startsWith('/admin/nodes')) key = 'admin_nodes';
    else if (cleanTo.startsWith('/admin/servers')) key = 'admin_servers';
    else if (cleanTo.startsWith('/admin/nests')) key = 'admin_nests';
    else if (cleanTo.startsWith('/admin/egg-configurations')) key = 'admin_egg_configurations';
    else if (cleanTo.startsWith('/admin/egg-repositories')) key = 'admin_egg_repositories';
    else if (cleanTo.startsWith('/admin/database-hosts')) key = 'admin_database_hosts';
    else if (cleanTo.startsWith('/admin/database-agent-hosts')) key = 'admin_database_agent_hosts';
    else if (cleanTo.startsWith('/admin/database-agent-templates')) key = 'admin_database_agent_templates';
    else if (cleanTo.startsWith('/admin/oauth-providers')) key = 'admin_oauth_providers';
    else if (cleanTo.startsWith('/admin/backup-configurations')) key = 'admin_backup_configurations';
    else if (cleanTo.startsWith('/admin/mounts')) key = 'admin_mounts';
    else if (cleanTo.startsWith('/admin/roles')) key = 'admin_roles';
    else if (cleanTo.startsWith('/admin/activity')) key = 'admin_activity';
    else if (cleanTo.startsWith('/account/security-keys')) key = 'security_keys';
    else if (cleanTo.startsWith('/account/api-keys')) key = 'api_keys';
    else if (cleanTo.startsWith('/account/ssh-keys')) key = 'ssh_keys';
    else if (cleanTo.startsWith('/account/snippets') || cleanTo.startsWith('/account/command-snippets')) key = 'snippets';
    else if (cleanTo.startsWith('/account/oauth') || cleanTo.startsWith('/account/oauth-links')) key = 'oauth';
    else if (cleanTo.startsWith('/account/sessions')) key = 'sessions';
    else if (cleanTo.startsWith('/account/shortcuts')) key = 'shortcuts';
    else if (cleanTo.startsWith('/account/activity')) key = 'activity';
    else if (cleanTo.startsWith('/account')) key = 'account';
    else if (cleanTo.startsWith('/server/')) {
      const parts = cleanTo.split('/');
      if (parts.length === 3) key = 'server_console';
      else {
        const sub = parts[3];
        if (sub === 'files' || parts.slice(3).join('/').startsWith('files')) key = 'server_files';
        else if (sub === 'databases') key = 'server_databases';
        else if (sub === 'schedules') key = 'server_schedules';
        else if (sub === 'users' || sub === 'subusers') key = 'server_users';
        else if (sub === 'backups') key = 'server_backups';
        else if (sub === 'network') key = 'server_network';
        else if (sub === 'startup') key = 'server_startup';
        else if (sub === 'mounts') key = 'server_mounts';
        else if (sub === 'activity') key = 'server_activity';
        else if (sub === 'settings') key = 'server_settings';
      }
    }

    let serverNormalized = cleanTo;
    let serverSubpath = '';
    if (cleanTo.startsWith('/server/')) {
      const parts = cleanTo.split('/');
      if (parts.length >= 4) {
        serverSubpath = parts.slice(3).join('/');
        serverNormalized = `/server/:id/${serverSubpath}`;
      }
    }

    let icon: string | null = null;
    if (key && sidebarIcons[key]) {
      icon = sidebarIcons[key];
    } else if (linkName && sidebarIcons[`redirect:${linkName}`]) {
      icon = sidebarIcons[`redirect:${linkName}`];
    } else if (lowerName && sidebarIcons[`redirect:${lowerName}`]) {
      icon = sidebarIcons[`redirect:${lowerName}`];
    } else if (linkName && sidebarIcons[linkName]) {
      icon = sidebarIcons[linkName];
    } else if (lowerName && sidebarIcons[lowerName]) {
      icon = sidebarIcons[lowerName];
    } else if (to && sidebarIcons[`redirect:${to}`]) {
      icon = sidebarIcons[`redirect:${to}`];
    } else if (cleanTo && sidebarIcons[`redirect:${cleanTo}`]) {
      icon = sidebarIcons[`redirect:${cleanTo}`];
    } else if (sidebarIcons[to]) {
      icon = sidebarIcons[to];
    } else if (sidebarIcons[cleanTo]) {
      icon = sidebarIcons[cleanTo];
    } else if (serverNormalized && sidebarIcons[serverNormalized]) {
      icon = sidebarIcons[serverNormalized];
    } else if (serverSubpath && sidebarIcons[`/server/${serverSubpath}`]) {
      icon = sidebarIcons[`/server/${serverSubpath}`];
    } else if (serverSubpath && sidebarIcons[serverSubpath]) {
      icon = sidebarIcons[serverSubpath];
    } else {
      const matchedKey = Object.keys(sidebarIcons).find((k) => {
        if (!k) return false;
        const cleanK = k.split('?')[0].split('#')[0].replace(/\/$/, '').replace(/\/\*$/, '');
        if (cleanK === cleanTo || cleanK === serverNormalized) return true;
        if (serverSubpath && (cleanK === `/server/${serverSubpath}` || cleanK === serverSubpath)) return true;
        if (linkName && cleanK.replace(/^redirect:/, '').toLowerCase() === lowerName) return true;
        if (cleanTo && cleanK && cleanTo.endsWith(cleanK)) return true;
        return false;
      });
      if (matchedKey) {
        icon = sidebarIcons[matchedKey];
      }
    }

    return icon;
  }, [sidebarIcons]);

  // Extract links and divider categories from children and header
  const { directLinks, categoryGroups } = useMemo(() => {
    const rawItems = extractAllLinksAndDividers(children);
    const headerItems = extractAllLinksAndDividers(header);

    const direct: LinkItem[] = [];
    const allLinks: LinkItem[] = [];

    // Scan header for top navigation links (like Servers / Admin / View in Admin Area / Back)
    headerItems.forEach((item) => {
      if (item.type === 'link') {
        direct.push({
          to: item.props.to,
          name: item.props.name,
          icon: item.props.icon,
          end: item.props.end,
          activeMatches: item.props.activeMatches,
          customIcon: resolveLinkCustomIcon(item.props.to, item.props.name),
        });
      }
    });

    let hasExplicitDividers = false;
    const dividerGroups: CategoryGroup[] = [];
    let currentGroup: CategoryGroup | null = null;

    // Scan children
    rawItems.forEach((item) => {
      if (item.type === 'divider') {
        hasExplicitDividers = true;
        currentGroup = {
          name: item.props.label,
          items: [],
        };
        dividerGroups.push(currentGroup);
        return;
      }

      if (item.type === 'link') {
        const link: LinkItem = {
          to: item.props.to,
          name: item.props.name,
          icon: item.props.icon,
          end: item.props.end,
          activeMatches: item.props.activeMatches,
          customIcon: resolveLinkCustomIcon(item.props.to, item.props.name),
        };

        if (currentGroup) {
          currentGroup.items.push(link);
        } else {
          allLinks.push(link);
        }
      }
    });

    // If explicit dividers existed from router, use them
    if (hasExplicitDividers && dividerGroups.some((g) => g.items.length > 0)) {
      return {
        directLinks: direct,
        categoryGroups: dividerGroups.filter((g) => g.items.length > 0),
      };
    }

    // Otherwise, perform intelligent automatic category classification
    const groups: CategoryGroup[] = [];
    const unclassifiedDirect: LinkItem[] = [...direct];

    const isServerView = pathname.startsWith('/server/');
    const isAccountView = pathname.startsWith('/account') || pathname === '/' || pathname === '/grouped';
    const isAdminView = pathname.startsWith('/admin');

    if (isServerView) {
      const generalItems: LinkItem[] = [];
      const managementItems: LinkItem[] = [];
      const configItems: LinkItem[] = [];

      allLinks.forEach((link) => {
        const path = link.to.toLowerCase();

        // Check if direct top-level link
        if (path === '/' || path === '/admin' || path.startsWith('/admin/servers/')) {
          if (!unclassifiedDirect.some((d) => d.to === link.to)) {
            unclassifiedDirect.push(link);
          }
          return;
        }

        if (
          path.endsWith('/settings') ||
          path.endsWith('/activity') ||
          path.endsWith('/settings/timezone') ||
          path.match(/\/server\/[^/]+$/) ||
          path.endsWith('/console')
        ) {
          generalItems.push(link);
        } else if (
          path.includes('/files') ||
          path.includes('/databases') ||
          path.includes('/schedules') ||
          path.includes('/users') ||
          path.includes('/backups') ||
          path.includes('/network')
        ) {
          managementItems.push(link);
        } else if (path.includes('/startup') || path.includes('/mounts') || path.includes('/extensions')) {
          configItems.push(link);
        } else {
          configItems.push(link);
        }
      });

      if (generalItems.length > 0) {
        groups.push({
          name: tExt('admin.categories.general', {}) || 'General',
          icon: faLayerGroup,
          items: generalItems,
        });
      }
      if (managementItems.length > 0) {
        groups.push({
          name: tExt('admin.categories.management', {}) || 'Management',
          icon: faFolderOpen,
          items: managementItems,
        });
      }
      if (configItems.length > 0) {
        groups.push({
          name: tExt('admin.categories.configuration', {}) || 'Configuration',
          icon: faCogs,
          items: configItems,
        });
      }
    } else if (isAdminView) {
      const managementItems: LinkItem[] = [];
      const nestsItems: LinkItem[] = [];
      const databasesItems: LinkItem[] = [];
      const systemItems: LinkItem[] = [];

      allLinks.forEach((link) => {
        const path = link.to.toLowerCase();

        // Direct links
        if (path === '/' || path === '/admin') {
          if (!unclassifiedDirect.some((d) => d.to === link.to)) {
            unclassifiedDirect.push(link);
          }
          return;
        }

        if (
          path.includes('/admin/users') ||
          path.includes('/admin/locations') ||
          path.includes('/admin/nodes') ||
          path.includes('/admin/servers')
        ) {
          managementItems.push(link);
        } else if (path.includes('/admin/nests') || path.includes('/admin/egg')) {
          nestsItems.push(link);
        } else if (
          path.includes('/admin/database') ||
          path.includes('/admin/backup') ||
          path.includes('/admin/mounts')
        ) {
          databasesItems.push(link);
        } else {
          systemItems.push(link);
        }
      });

      if (managementItems.length > 0) {
        groups.push({
          name: tExt('admin.categories.management', {}) || 'Management',
          icon: faFolderOpen,
          items: managementItems,
        });
      }
      if (nestsItems.length > 0) {
        groups.push({
          name: tExt('admin.categories.nestsEggs', {}) || 'Nests & Eggs',
          icon: faCogs,
          items: nestsItems,
        });
      }
      if (databasesItems.length > 0) {
        groups.push({
          name: tExt('admin.categories.databasesBackups', {}) || 'Databases & Backups',
          icon: faDatabase,
          items: databasesItems,
        });
      }
      if (systemItems.length > 0) {
        groups.push({
          name: tExt('admin.categories.systemSecurity', {}) || 'System & Security',
          icon: faShieldHalved,
          items: systemItems,
        });
      }
    } else if (isAccountView) {
      const generalItems: LinkItem[] = [];
      const securityItems: LinkItem[] = [];
      const toolItems: LinkItem[] = [];

      allLinks.forEach((link) => {
        const path = link.to.toLowerCase();

        // Direct links
        if (path === '/' || path === '/admin') {
          if (!unclassifiedDirect.some((d) => d.to === link.to)) {
            unclassifiedDirect.push(link);
          }
          return;
        }

        if (
          path === '/account' ||
          path.includes('/account/activity') ||
          path.includes('/account/sessions') ||
          path.includes('/account/shortcuts')
        ) {
          generalItems.push(link);
        } else if (
          path.includes('/account/security') ||
          path.includes('/account/api-keys') ||
          path.includes('/account/ssh-keys') ||
          path.includes('/account/oauth')
        ) {
          securityItems.push(link);
        } else if (path.includes('/account/command-snippets') || path.includes('/account/')) {
          toolItems.push(link);
        } else {
          unclassifiedDirect.push(link);
        }
      });

      if (generalItems.length > 0) {
        groups.push({
          name: tExt('admin.categories.general', {}) || 'General',
          icon: faLayerGroup,
          items: generalItems,
        });
      }
      if (securityItems.length > 0) {
        groups.push({
          name: tExt('admin.categories.securityKeys', {}) || 'Security & Keys',
          icon: faShieldHalved,
          items: securityItems,
        });
      }
      if (toolItems.length > 0) {
        groups.push({
          name: tExt('admin.categories.tools', {}) || 'Tools',
          icon: faToolbox,
          items: toolItems,
        });
      }
    } else {
      if (allLinks.length > 5) {
        groups.push({
          name: tExt('admin.categories.general', {}) || 'General',
          icon: faLayerGroup,
          items: allLinks,
        });
      } else {
        unclassifiedDirect.push(...allLinks);
      }
    }

    return {
      directLinks: unclassifiedDirect,
      categoryGroups: groups,
    };
  }, [children, header, pathname, tExt]);

  const isLinkActive = (item: LinkItem) => {
    return (
      matchPath({ path: item.to, end: !!item.end }, pathname) !== null ||
      (item.activeMatches?.some((p) => matchPath({ path: p, end: false }, pathname) !== null) ?? false)
    );
  };

  return (
    <div
      id='qunix-horizontal-navbar-root'
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        width: '100%',
        height: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollbarWidth: 'none',
      }}
    >
      {/* 1. Direct Links (e.g. Servers / Back / Admin View) */}
      {directLinks.map((link) => {
        const isActive = isLinkActive(link);
        return (
          <Button
            key={link.to}
            variant='subtle'
            size='xs'
            onClick={() => (link.to.startsWith('http://') || link.to.startsWith('https://')) ? window.open(link.to, '_blank') : navigate(link.to)}
            leftSection={
              <div style={{ width: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DynamicIcon icon={link.customIcon || null} fallback={link.icon} style={{ fontSize: '13px' }} />
              </div>
            }
            styles={{
              root: {
                height: '32px',
                padding: '0 12px',
                fontSize: '12px',
                fontWeight: isActive ? 600 : 500,
                borderRadius: '6px',
                backgroundColor: isActive ? 'var(--ds-sidebar-active-bg)' : 'transparent',
                color: isActive ? 'var(--ds-sidebar-active-color)' : 'var(--ds-gray-900)',
                border: isActive ? '1px solid var(--ds-sidebar-active-color)' : '1px solid transparent',
                transition: 'all 0.15s ease',
                flexShrink: 0,
                whiteSpace: 'nowrap',
                '&:hover': {
                  backgroundColor: isActive
                    ? 'var(--ds-sidebar-active-bg)'
                    : 'var(--ds-nav-hover-bg, rgba(255, 255, 255, 0.06))',
                  color: 'var(--ds-nav-hover-color, inherit)',
                },
              },
            }}
          >
            {link.name}
          </Button>
        );
      })}

      {/* Separator between direct links and category dropdowns */}
      {directLinks.length > 0 && categoryGroups.length > 0 && (
        <div
          style={{
            width: '1px',
            height: '18px',
            backgroundColor: 'var(--ds-border-color, rgba(255, 255, 255, 0.15))',
            margin: '0 4px',
            flexShrink: 0,
          }}
        />
      )}

      {/* 2. Category Dropdown Folders (General ⌄, Management ⌄, Configuration ⌄, etc.) */}
      {categoryGroups.map((group) => {
        const hasActiveChild = group.items.some((item) => isLinkActive(item));

        return (
          <Menu
            key={group.name}
            shadow='xl'
            width={220}
            position='bottom-start'
            offset={6}
            withinPortal
            transitionProps={{ transition: 'pop-top-left', duration: 150 }}
          >
            <Menu.Target>
              <Button
                variant='subtle'
                size='xs'
                rightSection={
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    style={{ fontSize: '9px', opacity: hasActiveChild ? 0.9 : 0.6, marginLeft: '2px' }}
                  />
                }
                styles={{
                  root: {
                    height: '32px',
                    padding: '0 12px',
                    fontSize: '12px',
                    fontWeight: hasActiveChild ? 600 : 500,
                    borderRadius: '6px',
                    backgroundColor: hasActiveChild
                      ? 'var(--ds-sidebar-active-bg)'
                      : 'transparent',
                    color: hasActiveChild ? 'var(--ds-sidebar-active-color)' : 'var(--ds-gray-900)',
                    border: hasActiveChild
                      ? '1px solid var(--ds-sidebar-active-color)'
                      : '1px solid transparent',
                    transition: 'all 0.15s ease',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      backgroundColor: hasActiveChild
                        ? 'var(--ds-sidebar-active-bg)'
                        : 'var(--ds-nav-hover-bg, rgba(255, 255, 255, 0.06))',
                      color: 'var(--ds-nav-hover-color, inherit)',
                    },
                  },
                }}
              >
                {group.name}
              </Button>
            </Menu.Target>

            <Menu.Dropdown
              style={{
                background: 'var(--ds-dropdown-bg, var(--ds-navbar-bg, #ffffff))',
                border: '1px solid var(--ds-border-color, rgba(255, 255, 255, 0.1))',
                borderRadius: 'var(--ds-card-radius, 8px)',
                padding: '6px',
                boxShadow: 'var(--ds-dropdown-shadow, 0 16px 36px rgba(0, 0, 0, 0.25))',
                minWidth: '200px',
                zIndex: 2000,
              }}
            >
              {group.items.map((item) => {
                const isActive = isLinkActive(item);
                return (
                  <Menu.Item
                    key={item.to}
                    onClick={() => (item.to.startsWith('http://') || item.to.startsWith('https://')) ? window.open(item.to, '_blank') : navigate(item.to)}
                    leftSection={
                      <div
                        style={{
                          width: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isActive ? 'var(--ds-sidebar-active-color)' : 'inherit',
                        }}
                      >
                        <DynamicIcon icon={item.customIcon || null} fallback={item.icon} style={{ fontSize: '14px' }} />
                      </div>
                    }
                    style={{
                      fontSize: '12px',
                      fontWeight: isActive ? 600 : 500,
                      borderRadius: '6px',
                      padding: '8px 12px',
                      marginBottom: '2px',
                      backgroundColor: isActive
                        ? 'var(--ds-sidebar-active-bg)'
                        : 'transparent',
                      color: isActive ? 'var(--ds-sidebar-active-color)' : 'var(--ds-gray-900)',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    {item.name}
                  </Menu.Item>
                );
              })}
            </Menu.Dropdown>
          </Menu>
        );
      })}
    </div>
  );
};

export default QunixHorizontalNavbar;
