import {
  faCreditCard,
  faGlobe,
  faHeadset,
  faServer,
  faBook,
  faShieldHalved,
  faBolt,
  faUsers,
  faHeart,
  faStar,
  faTerminal,
  faGear,
  faCircleQuestion,
  faEnvelope,
  faComments,
  faLink,
  faBan,
  faCoins,
  faFolder,
  faRotateLeft,
  faPen,
  faPlus,
  faTrash,
  faArrowUp,
  faArrowDown,
} from '@fortawesome/free-solid-svg-icons';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';

export interface QuickLinkItem {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  icon: string;
  color: string;
  isPrimary?: boolean;
  enabled?: boolean;     // default true; if false, hidden from regular view
  linkEnabled?: boolean; // default true; if false, link navigation is disabled
  members?: string;
}

export const DEFAULT_QUICK_LINKS: QuickLinkItem[] = [
  {
    id: 'billing',
    title: 'Billing',
    subtitle: 'Invoices, plans and payment.',
    url: '/billing',
    icon: 'credit-card',
    color: '#0284c7',
    isPrimary: true,
    enabled: true,
    linkEnabled: true,
  },
  {
    id: 'discord',
    title: 'Discord',
    subtitle: 'Get help and talk to the community.',
    url: 'https://discord.gg',
    icon: 'discord',
    color: '#5865F2',
    members: '605 Members Online',
    enabled: true,
    linkEnabled: true,
  },
  {
    id: 'website',
    title: 'Website',
    subtitle: 'Everything we host, and what it costs.',
    url: '/',
    icon: 'globe',
    color: '#6366f1',
    enabled: true,
    linkEnabled: true,
  },
  {
    id: 'support',
    title: 'Contact support',
    subtitle: 'Open a ticket with a human.',
    url: '/support',
    icon: 'headset',
    color: '#ec4899',
    enabled: true,
    linkEnabled: true,
  },
];

export const QUICK_LINK_ICON_OPTIONS = [
  { value: 'credit-card', label: 'Credit Card / Billing' },
  { value: 'discord', label: 'Discord' },
  { value: 'globe', label: 'Globe / Website' },
  { value: 'headset', label: 'Headset / Support' },
  { value: 'server', label: 'Server / Node' },
  { value: 'book', label: 'Book / Documentation' },
  { value: 'shield', label: 'Shield / Security' },
  { value: 'bolt', label: 'Bolt / Fast Actions' },
  { value: 'users', label: 'Users / Community' },
  { value: 'coins', label: 'Coins / Pricing' },
  { value: 'heart', label: 'Heart / Favorites' },
  { value: 'star', label: 'Star / Featured' },
  { value: 'terminal', label: 'Terminal / Console' },
  { value: 'gear', label: 'Gear / Settings' },
  { value: 'comments', label: 'Comments / Forum' },
  { value: 'envelope', label: 'Envelope / Mail' },
  { value: 'folder', label: 'Folder / Files' },
  { value: 'question', label: 'Question / FAQ' },
];

export function parseQuickLinks(raw?: string | null): QuickLinkItem[] {
  if (!raw) return DEFAULT_QUICK_LINKS;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item, idx) => ({
        id: item.id || `link-${idx}-${Date.now()}`,
        title: item.title ?? 'Link',
        subtitle: item.subtitle ?? '',
        url: item.url ?? '',
        icon: item.icon || 'globe',
        color: item.color || '#38bdf8',
        isPrimary: Boolean(item.isPrimary),
        enabled: item.enabled !== false,
        linkEnabled: item.linkEnabled !== false,
        members: item.members,
      }));
    }
  } catch (_) {}
  return DEFAULT_QUICK_LINKS;
}

export function getQuickLinkIcon(iconName?: string): any {
  switch ((iconName || '').toLowerCase().trim()) {
    case 'discord':
      return faDiscord;
    case 'credit-card':
    case 'billing':
    case 'card':
      return faCreditCard;
    case 'globe':
    case 'website':
    case 'web':
      return faGlobe;
    case 'headset':
    case 'support':
    case 'help':
      return faHeadset;
    case 'server':
      return faServer;
    case 'book':
    case 'docs':
      return faBook;
    case 'shield':
    case 'security':
      return faShieldHalved;
    case 'bolt':
    case 'lightning':
      return faBolt;
    case 'users':
    case 'community':
      return faUsers;
    case 'coins':
      return faCoins;
    case 'heart':
      return faHeart;
    case 'star':
      return faStar;
    case 'terminal':
    case 'console':
      return faTerminal;
    case 'gear':
    case 'settings':
      return faGear;
    case 'comments':
    case 'chat':
      return faComments;
    case 'envelope':
    case 'mail':
      return faEnvelope;
    case 'folder':
      return faFolder;
    case 'question':
      return faCircleQuestion;
    default:
      return faGlobe;
  }
}
