import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircle,
  faServer,
  faFolder,
  faDatabase,
  faCalendar,
  faUsers,
  faBoxArchive,
  faGlobe,
  faPlay,
  faSliders,
  faClock,
  faTerminal,
  faGear,
  faKey,
  faCode,
  faFileText,
  faLink,
  faShieldHalved,
  faUser,
  faHardDrive,
  faMemory,
  faMicrochip,
  faCopy,
  faTrash,
  faList,
  faTh,
  faCheckCircle,
  faBan,
  faSearch,
  faRobot,
  faGamepad,
  faCloud,
  faRocket,
  faFire,
  faBolt,
  faHeart,
  faStar,
  faLock,
  faLockOpen,
  faEye,
  faBookmark,
  faBook,
  faCoins,
  faDesktop,
  faLaptop,
  faHeadphones,
  faNetworkWired,
  faWrench,
  faScrewdriver,
  faFolderTree,
  faArrowUpRightFromSquare,
  faShareNodes,
  faRotate,
  faFilter,
  faPalette,
  faCrown,
  faMedal,
  faTrophy,
  faBell,
  faBellSlash,
  faEnvelope,
  faPaperPlane,
  faComments,
  faCircleQuestion,
  faCircleInfo,
  faTriangleExclamation,
  faCircleExclamation,
  faCircleXmark,
  faXmark,
  faBars,
  faEllipsisVertical,
  faGaugeHigh,
} from '@fortawesome/free-solid-svg-icons';

interface DynamicIconProps {
  icon: string | null | undefined;
  fallback?: any;
  className?: string;
  style?: React.CSSProperties;
}

const FA_ICON_MAP: Record<string, any> = {
  faserver: faServer,
  server: faServer,
  fafolder: faFolder,
  folder: faFolder,
  fadatabase: faDatabase,
  database: faDatabase,
  facalendar: faCalendar,
  calendar: faCalendar,
  fausers: faUsers,
  users: faUsers,
  faboxarchive: faBoxArchive,
  boxarchive: faBoxArchive,
  archive: faBoxArchive,
  faglobe: faGlobe,
  globe: faGlobe,
  faplay: faPlay,
  play: faPlay,
  fasliders: faSliders,
  sliders: faSliders,
  faclock: faClock,
  clock: faClock,
  faterminal: faTerminal,
  terminal: faTerminal,
  fagear: faGear,
  gear: faGear,
  facog: faGear,
  cog: faGear,
  fakey: faKey,
  key: faKey,
  facode: faCode,
  code: faCode,
  fafiletext: faFileText,
  filetext: faFileText,
  falink: faLink,
  link: faLink,
  fashieldcheck: faShieldHalved,
  fashieldhalved: faShieldHalved,
  shieldhalved: faShieldHalved,
  shield: faShieldHalved,
  fauser: faUser,
  user: faUser,
  faharddrive: faHardDrive,
  harddrive: faHardDrive,
  famemory: faMemory,
  memory: faMemory,
  famicrochip: faMicrochip,
  microchip: faMicrochip,
  cpu: faMicrochip,
  facopy: faCopy,
  copy: faCopy,
  fatrash: faTrash,
  trash: faTrash,
  falist: faList,
  list: faList,
  fath: faTh,
  th: faTh,
  facheckcircle: faCheckCircle,
  checkcircle: faCheckCircle,
  faban: faBan,
  ban: faBan,
  fasearch: faSearch,
  search: faSearch,
  magnifyingglass: faSearch,
  farobot: faRobot,
  robot: faRobot,
  fagamepad: faGamepad,
  gamepad: faGamepad,
  facloud: faCloud,
  cloud: faCloud,
  farocket: faRocket,
  rocket: faRocket,
  fafire: faFire,
  fire: faFire,
  fabolt: faBolt,
  bolt: faBolt,
  faheart: faHeart,
  heart: faHeart,
  fastar: faStar,
  star: faStar,
  falock: faLock,
  lock: faLock,
  falockopen: faLockOpen,
  lockopen: faLockOpen,
  unlock: faLockOpen,
  faeye: faEye,
  eye: faEye,
  fabookmark: faBookmark,
  bookmark: faBookmark,
  fabook: faBook,
  book: faBook,
  facoins: faCoins,
  coins: faCoins,
  fadesktop: faDesktop,
  desktop: faDesktop,
  falaptop: faLaptop,
  laptop: faLaptop,
  faheadphones: faHeadphones,
  headphones: faHeadphones,
  headset: faHeadphones,
  fanetworkwired: faNetworkWired,
  networkwired: faNetworkWired,
  fawrench: faWrench,
  wrench: faWrench,
  fascrewdriver: faScrewdriver,
  screwdriver: faScrewdriver,
  fafoldertree: faFolderTree,
  foldertree: faFolderTree,
  faarrowuprightfromsquare: faArrowUpRightFromSquare,
  arrowuprightfromsquare: faArrowUpRightFromSquare,
  fasharenodes: faShareNodes,
  sharenodes: faShareNodes,
  share: faShareNodes,
  farotate: faRotate,
  rotate: faRotate,
  fafilter: faFilter,
  filter: faFilter,
  fapalette: faPalette,
  palette: faPalette,
  facrown: faCrown,
  crown: faCrown,
  famedal: faMedal,
  medal: faMedal,
  fatrophy: faTrophy,
  trophy: faTrophy,
  fabell: faBell,
  bell: faBell,
  fabellslash: faBellSlash,
  bellslash: faBellSlash,
  faenvelope: faEnvelope,
  envelope: faEnvelope,
  fapaperplane: faPaperPlane,
  paperplane: faPaperPlane,
  facomments: faComments,
  comments: faComments,
  facirclequestion: faCircleQuestion,
  circlequestion: faCircleQuestion,
  facircleinfo: faCircleInfo,
  circleinfo: faCircleInfo,
  fatriangleexclamation: faTriangleExclamation,
  triangleexclamation: faTriangleExclamation,
  facircleexclamation: faCircleExclamation,
  circleexclamation: faCircleExclamation,
  facirclexmark: faCircleXmark,
  circlexmark: faCircleXmark,
  faxmark: faXmark,
  xmark: faXmark,
  fabars: faBars,
  bars: faBars,
  faellipsisvertical: faEllipsisVertical,
  ellipsisvertical: faEllipsisVertical,
  fagaugehigh: faGaugeHigh,
  gaugehigh: faGaugeHigh,
  gauge: faGaugeHigh,
};

const inMemoryIconCache: Record<string, string> = {};

export const DynamicIcon: React.FC<DynamicIconProps> = React.memo(({ icon, fallback, className, style }) => {
  const cleanIcon = icon ? icon.trim() : '';

  let prefix = '';
  let name = cleanIcon;

  if (cleanIcon.includes(':')) {
    const parts = cleanIcon.split(':');
    prefix = parts[0];
    name = parts.slice(1).join(':');
  } else if (cleanIcon.includes('/')) {
    const parts = cleanIcon.split('/');
    prefix = parts[0];
    name = parts.slice(1).join('/');
  }

  let apiPrefix = prefix;
  let cleanName = name;
  const isSolidRequested = cleanIcon.includes('solid') || cleanIcon.includes('filled');

  const isFa = prefix === 'fa' || prefix === 'fontawesome' || prefix === 'fa6-solid';
  const rawFaName = isFa
    ? name.replace(/^fa-/, '').replace(/-/g, '').toLowerCase()
    : null;
  const localFa = rawFaName ? (FA_ICON_MAP[rawFaName] || FA_ICON_MAP[`fa${rawFaName}`]) : null;

  if (isFa) {
    apiPrefix = 'fa6-solid';
    cleanName = name.replace(/^fa-/, '');
  } else if (prefix === 'heroicons' || prefix === 'heroicons-outline' || prefix === 'heroicons-solid') {
    apiPrefix = isSolidRequested ? 'heroicons-solid' : 'heroicons';
    cleanName = name.replace(/-solid$/, '').replace(/-outline$/, '');
  } else if (prefix === 'lineicons') {
    cleanName = name.replace(/-filled$/, '').replace(/-solid$/, '').replace(/-outline$/, '');
    if (isSolidRequested) {
      cleanName = `${cleanName}-filled`;
    }
  } else if (prefix === 'lucide') {
    cleanName = name.replace(/-outline$/, '').replace(/-solid$/, '').replace(/-filled$/, '');
  } else if (prefix === 'mdi') {
    cleanName = name.replace(/-outline$/, '').replace(/-filled$/, '');
    if (!isSolidRequested && !name.endsWith('-outline')) {
      cleanName = `${cleanName}-outline`;
    }
  }

  const cacheKey = `qunix-icon-json-${apiPrefix}-${cleanName}`;

  const [svgContent, setSvgContent] = useState<string>(() => {
    if (!cleanIcon || localFa) return '';
    if (inMemoryIconCache[cacheKey]) return inMemoryIconCache[cacheKey];
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        inMemoryIconCache[cacheKey] = cached;
        return cached;
      }
    } catch (_) {}
    return '';
  });

  useEffect(() => {
    let initialValue = '';
    if (cleanIcon && !localFa) {
      if (inMemoryIconCache[cacheKey]) {
        initialValue = inMemoryIconCache[cacheKey];
      } else {
        try {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            inMemoryIconCache[cacheKey] = cached;
            initialValue = cached;
          }
        } catch (_) {}
      }
    }
    setSvgContent(initialValue);
  }, [cacheKey, cleanIcon, localFa]);

  useEffect(() => {
    if (!cleanIcon || localFa || svgContent) return;
    if (!apiPrefix || !cleanName) return;

    let isMounted = true;

    const tryFetch = async () => {
      const candidatePrefixes = [apiPrefix];
      if (apiPrefix === 'heroicons-solid') candidatePrefixes.push('heroicons');
      if (apiPrefix === 'heroicons') candidatePrefixes.push('heroicons-solid');

      for (const pref of candidatePrefixes) {
        const candidateNames = [cleanName];
        if (pref === 'heroicons-solid' && !cleanName.endsWith('-solid')) {
          candidateNames.unshift(`${cleanName}-solid`);
        }
        if (pref === 'heroicons' && !cleanName.endsWith('-solid')) {
          candidateNames.push(`${cleanName}-solid`);
        }

        for (const cand of candidateNames) {
          try {
            const jsonUrl = `https://api.iconify.design/${pref}.json?icons=${encodeURIComponent(cand)}`;
            const res = await fetch(jsonUrl);
            if (!res.ok) continue;
            const data = await res.json();
            if (!data) continue;

            let iconData = data.icons ? (data.icons[cand] || data.icons[cleanName] || data.icons[name]) : null;

            if (!iconData && data.aliases) {
              const alias = data.aliases[cand] || data.aliases[cleanName] || data.aliases[name];
              const parentName = typeof alias === 'string' ? alias : alias?.parent;
              if (parentName && data.icons && data.icons[parentName]) {
                iconData = data.icons[parentName];
              }
            }

            if (iconData && iconData.body && isMounted) {
              const width = iconData.width || data.width || 24;
              const height = iconData.height || data.height || 24;
              const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ${width} ${height}">${iconData.body}</svg>`;
              inMemoryIconCache[cacheKey] = svg;
              setSvgContent(svg);
              try {
                localStorage.setItem(cacheKey, svg);
              } catch (_) {}
              return;
            }
          } catch (_) {}
        }
      }
    };

    tryFetch();

    return () => {
      isMounted = false;
    };
  }, [cleanIcon, localFa, apiPrefix, cleanName, name, cacheKey, svgContent]);

  if (!cleanIcon) {
    return <FontAwesomeIcon icon={fallback || faCircle} className={className} style={style as any} />;
  }

  if (localFa) {
    return <FontAwesomeIcon icon={localFa} className={className} style={style as any} />;
  }

  if (!svgContent) {
    return <FontAwesomeIcon icon={fallback || faCircle} className={className} style={style as any} />;
  }

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '1.2em',
        height: '1.2em',
        color: 'currentColor',
        verticalAlign: 'middle',
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
});

export default DynamicIcon;
