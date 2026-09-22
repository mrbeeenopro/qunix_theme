import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useLocation } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faThumbtack,
  faXmark,
  faCheckDouble,
  faTrash,
  faInfoCircle,
  faExclamationTriangle,
  faCheckCircle,
  faBan,
} from '@fortawesome/free-solid-svg-icons';
import { useGlobalStore } from '@/stores/global.ts';
import { useTranslations } from '@/providers/TranslationProvider.tsx';

/**
 * Lightweight Markdown & Link Parser Helper
 * Converts [text](url) markdown links and raw https:// URLs into clickable <a> tags.
 */
function renderMarkdown(text: string) {
  if (!text) return null;

  const parts: React.ReactNode[] = [];
  const combinedRegex = /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)|(https?:\/\/[^\s<]+)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = combinedRegex.exec(text)) !== null) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      parts.push(text.slice(lastIndex, matchIndex));
    }

    if (match[1] && match[2]) {
      // Markdown link [text](url)
      const label = match[1];
      const url = match[2];
      parts.push(
        <a
          key={matchIndex}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-indigo-400 underline hover:text-indigo-300 transition-colors font-medium break-all"
          style={{ color: '#818cf8', textDecoration: 'underline', cursor: 'pointer' }}
        >
          {label}
        </a>
      );
    } else if (match[3]) {
      // Raw URL
      const url = match[3];
      parts.push(
        <a
          key={matchIndex}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-indigo-400 underline hover:text-indigo-300 transition-colors font-medium break-all"
          style={{ color: '#818cf8', textDecoration: 'underline', cursor: 'pointer' }}
        >
          {url}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export function NotificationCenter() {
  const announcements = useGlobalStore((state) => state.announcements) || [];
  const { language } = useTranslations();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'system'>('all');
  const [mountContainers, setMountContainers] = useState<HTMLElement[]>([]);

  useEffect(() => {
    let rafId: number | null = null;
    let debounceTimer: any = null;

    const syncMountSlot = () => {
      // Remove any stale floating fallback slots
      const staleFallback = document.getElementById('qunix-bell-fallback-slot');
      if (staleFallback) staleFallback.remove();

      const rawCards = Array.from(
        document.querySelectorAll(
          '#sidebar-account-card, .qunix-account-card, .mantine-Navbar-root .mantine-Card-root, .mantine-AppShell-navbar .mantine-Card-root, .mantine-Drawer-content .mantine-Card-root, nav .mantine-Card-root, aside .mantine-Card-root'
        )
      );

      const accountCards = rawCards.filter(
        (card) =>
          card.id === 'sidebar-account-card' ||
          card.classList.contains('qunix-account-card') ||
          card.querySelector('a[href="/account"]') ||
          card.querySelector('a[href*="/account"]') ||
          card.querySelector('.mantine-Avatar-root') ||
          card.querySelector('[data-account-card]')
      );

      const slots: HTMLElement[] = [];

      // 1. Process account cards (for wide sidebar and mobile drawer)
      accountCards.forEach((card) => {
        let slot = card.querySelector('.qunix-bell-slot') as HTMLElement;
        if (!slot) {
          slot = document.createElement('div');
          slot.className = 'qunix-bell-slot flex items-center shrink-0 mr-1 select-none';
          const menuTarget = card.querySelector('.mantine-Menu-target') || card.lastElementChild;
          if (menuTarget) {
            card.insertBefore(slot, menuTarget);
          } else {
            card.appendChild(slot);
          }
        }
        if (slot && document.body.contains(slot) && !slots.includes(slot)) {
          slots.push(slot);
        }
      });

      // 2. Process standalone icon sidebar slot right before #sidebar-account-card in footer
      const desktopSidebar = document.getElementById('sidebar-desktop');
      const accountCard = document.getElementById('sidebar-account-card') || document.querySelector('.qunix-account-card');
      
      if (accountCard && accountCard.parentElement) {
        const parent = accountCard.parentElement;
        let iconSlot = parent.querySelector('.qunix-icon-sidebar-bell-slot') as HTMLElement;
        if (!iconSlot) {
          iconSlot = document.createElement('div');
          iconSlot.className = 'qunix-icon-sidebar-bell-slot';
          parent.insertBefore(iconSlot, accountCard);
        }
        if (iconSlot && document.body.contains(iconSlot) && !slots.includes(iconSlot)) {
          slots.push(iconSlot);
        }
      } else if (desktopSidebar) {
        // Fallback if accountCard not yet in DOM: find footer or append to sidebar-content
        const footer = desktopSidebar.querySelector('#sidebar-content > div.shrink-0:last-child') || desktopSidebar.querySelector('.shrink-0:last-child');
        if (footer) {
          let iconSlot = footer.querySelector('.qunix-icon-sidebar-bell-slot') as HTMLElement;
          if (!iconSlot) {
            iconSlot = document.createElement('div');
            iconSlot.className = 'qunix-icon-sidebar-bell-slot';
            footer.appendChild(iconSlot);
          }
          if (iconSlot && document.body.contains(iconSlot) && !slots.includes(iconSlot)) {
            slots.push(iconSlot);
          }
        }
      }

      setMountContainers((prev) => {
        const valid = slots.filter((el) => document.body.contains(el));
        if (prev.length === valid.length && prev.every((el, idx) => el === valid[idx])) {
          return prev;
        }
        return valid;
      });
    };

    const debouncedSync = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (rafId !== null) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(syncMountSlot);
      }, 150);
    };

    syncMountSlot();

    // Async retries for initial auth load
    const t1 = setTimeout(syncMountSlot, 100);
    const t2 = setTimeout(syncMountSlot, 350);
    const t3 = setTimeout(syncMountSlot, 900);

    // Observe sidebar container with subtree: true so React footer re-renders trigger sync
    const targetEl = document.getElementById('sidebar-desktop') || document.getElementById('root') || document.body;
    const observer = new MutationObserver(debouncedSync);
    observer.observe(targetEl, { childList: true, subtree: true });

    window.addEventListener('popstate', debouncedSync);
    window.addEventListener('hashchange', debouncedSync);
    window.addEventListener('resize', debouncedSync);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (debounceTimer) clearTimeout(debounceTimer);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      observer.disconnect();
      window.removeEventListener('popstate', debouncedSync);
      window.removeEventListener('hashchange', debouncedSync);
      window.removeEventListener('resize', debouncedSync);
    };
  }, [location.pathname]);

  // Dismissed UUIDs (hidden from notification drawer and page)
  const [dismissedUuids, setDismissedUuids] = useState<string[]>(() => {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('announcement_')) {
          keys.push(k.replace('announcement_', ''));
        }
      }
      return keys;
    } catch {
      return [];
    }
  });

  // Read UUIDs (marked as read, clears unread badge count)
  const [readUuids, setReadUuids] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('qunix_read_announcements');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveReadUuids = (newRead: string[]) => {
    setReadUuids(newRead);
    try {
      localStorage.setItem('qunix_read_announcements', JSON.stringify(newRead));
    } catch {}
  };

  const s = (window as any).qunixThemeSettings;
  const ctaEnabled = s?.announcement_cta !== false && s?.announcementCta !== false;
  const ctaLink = s?.announcement_cta_link || s?.announcementCtaLink;
  const ctaText = s?.announcement_cta_text || s?.announcementCtaText || 'Go to link...';

  // Filter active announcements (not dismissed)
  const activeAnnouncements = announcements.filter((a) => !dismissedUuids.includes(a.uuid));

  // Calculate unread count (active and not marked as read)
  const unreadAnnouncements = activeAnnouncements.filter((a) => !readUuids.includes(a.uuid));
  const unreadCount = unreadAnnouncements.length;

  const handleDismiss = (uuid: string, dismissible: boolean) => {
    if (dismissible) {
      try {
        localStorage.setItem(`announcement_${uuid}`, 'null');
        setDismissedUuids((prev) => [...prev, uuid]);
      } catch {}
    }
    if (!readUuids.includes(uuid)) {
      saveReadUuids([...readUuids, uuid]);
    }
  };

  const handleMarkAllRead = () => {
    const allActiveUuids = activeAnnouncements.map((a) => a.uuid);
    const combined = Array.from(new Set([...readUuids, ...allActiveUuids]));
    saveReadUuids(combined);
  };

  const handleClearAll = () => {
    const newDismissed = [...dismissedUuids];
    announcements.forEach((a) => {
      if (a.dismissible && !newDismissed.includes(a.uuid)) {
        try {
          localStorage.setItem(`announcement_${a.uuid}`, 'null');
        } catch {}
        newDismissed.push(a.uuid);
      }
    });
    setDismissedUuids(newDismissed);
    handleMarkAllRead();
  };

  const settings = (window as any).qunixThemeSettings;
  const displayMode = settings?.announcement_display_mode || settings?.announcementDisplayMode || 'notifications';

  if (displayMode === 'banner') {
    return null;
  }

  // Safe Hex Color Parser
  const parseHex = (val: any, fallback: string): string => {
    if (!val || typeof val !== 'string') return fallback;
    const trimmed = val.trim();
    if (trimmed.startsWith('#')) {
      if (trimmed.length === 4) {
        return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`;
      }
      if (trimmed.length >= 7) return trimmed.slice(0, 7);
    }
    return fallback;
  };

  const isLightMode = typeof document !== 'undefined' && document.documentElement.getAttribute('data-mantine-color-scheme') === 'light';
  const dark7 = isLightMode ? '#ffffff' : (settings?.dark_7_color || settings?.dark7Color || '#141418');
  const dark6 = isLightMode ? '#f8fafc' : (settings?.dark_6_color || settings?.dark6Color || '#1a1a20');
  const primaryColorHex = parseHex(
    settings?.button_color || settings?.buttonColor || settings?.toast_info_color || settings?.toastInfoColor || settings?.announcement_info_border,
    isLightMode ? '#2563eb' : '#6c5ce7'
  );
  const primaryBgColor = `${primaryColorHex}22`;
  const primaryBorderColor = `${primaryColorHex}55`;
  const borderRadius = `${settings?.toast_radius ?? 12}px`;

  const displayedList = activeAnnouncements.filter((a) => {
    if (activeTab === 'unread') return !readUuids.includes(a.uuid);
    if (activeTab === 'system') return a.type === 'error' || a.type === 'warning';
    return true;
  });

  const renderBellButton = (containerKey: number) => (
    <button
      key={containerKey}
      onClick={() => setIsOpen(!isOpen)}
      type="button"
      data-no-qunix-replace="true"
      className="relative w-7 h-7 flex items-center justify-center rounded-md transition-all duration-200 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 qunix-bell-btn"
      style={{
        backgroundColor: isOpen ? primaryBgColor : 'transparent',
        color: primaryColorHex,
      }}
      title="Notifications & Announcements"
    >
      <svg
        className="w-3.5 h-3.5"
        viewBox="0 0 448 512"
        fill="currentColor"
        style={{ color: primaryColorHex, width: '14px', height: '14px', display: 'inline-block' }}
        data-no-qunix-replace="true"
      >
        <path d="M224 512c35.32 0 63.97-28.65 63.97-64H160.03c0 35.35 28.65 64 63.97 64zm215.39-149.71c-19.32-20.76-55.47-51.98-55.47-154.29 0-77.7-54.48-139.9-127.94-155.16V32c0-17.67-14.32-32-31.98-32s-31.98 14.33-31.98 32v20.84C118.56 69.9 64.08 132.1 64.08 208c0 102.31-36.15 133.53-55.47 154.29-6 6.45-8.61 14.99-8.61 23.71 0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32 0-8.72-2.61-17.26-8.61-23.71z" />
      </svg>
      {unreadCount > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 text-[9px] font-extrabold text-white rounded-full flex items-center justify-center shadow-md animate-pulse"
          style={{ backgroundColor: primaryColorHex }}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );

  return (
    <>
      {/* Portal Bell button into Account card container */}
      {mountContainers
        .filter((c) => c && document.body.contains(c))
        .map((container, idx) => ReactDOM.createPortal(renderBellButton(idx), container))}

      {/* Notifications Drawer Flyout */}
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex justify-end bg-black/50 backdrop-blur-xs transition-opacity">
          {/* Backdrop click to close */}
          <div className="flex-1 select-none" onClick={() => setIsOpen(false)} />

          {/* Right Flyout Panel */}
          <div
            className="w-full max-w-md h-full border-l border-neutral-200 dark:border-neutral-800/80 flex flex-col shadow-2xl overflow-hidden animate-slide-in select-text"
            style={{ backgroundColor: dark7, userSelect: 'text' }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800/80 select-none"
              style={{ backgroundColor: dark6 }}
            >
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faBell} style={{ color: primaryColorHex }} />
                <h3 className="font-bold text-base" style={{ color: 'var(--ds-gray-900, #0f172a)' }}>Notifications</h3>
                {unreadCount > 0 && (
                  <span
                    className="px-2 py-0.5 text-xs font-semibold rounded-full border border-purple-500/30"
                    style={{ backgroundColor: primaryBgColor, color: primaryColorHex }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/50 text-xs select-none">
              <div className="flex items-center gap-1">
                {(['all', 'unread', 'system'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="px-3 py-1 rounded-md font-medium capitalize transition-colors cursor-pointer"
                    style={{
                      backgroundColor: activeTab === tab ? primaryColorHex : 'transparent',
                      color: activeTab === tab ? '#ffffff' : (isLightMode ? '#475569' : '#a1a1aa'),
                    }}
                  >
                    {tab}
                    {tab === 'unread' && unreadCount > 0 && ` (${unreadCount})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 select-text" style={{ userSelect: 'text' }}>
              {displayedList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-neutral-500 text-sm gap-2 select-none">
                  <FontAwesomeIcon icon={faBell} className="w-8 h-8 opacity-40" />
                  <span>No notifications right now</span>
                </div>
              ) : (
                displayedList.map((item) => {
                  const titleText = item.titleTranslations?.[language] || item.title;
                  const contentText = item.contentTranslations?.[language] || item.content;
                  const isPinned = (titleText && localStorage.getItem(`qunix_announcement_important_${titleText}`) === 'true') ||
                    (item.uuid && localStorage.getItem(`qunix_announcement_important_${item.uuid}`) === 'true') ||
                    (titleText && (titleText.includes('[Important]') || titleText.includes('[IMPORTANT]')));
                  const isUnread = !readUuids.includes(item.uuid);

                  const typeAccentColorMap: Record<string, string> = {
                    info: settings?.announcement_info_border || '#3b82f6',
                    success: settings?.announcement_success_border || '#10b981',
                    warning: settings?.announcement_warning_border || '#f59e0b',
                    error: settings?.announcement_error_border || '#ef4444',
                  };
                  const accentColor = isPinned ? primaryColorHex : (typeAccentColorMap[item.type] || '#3b82f6');

                  const typeColorMap = {
                    info: 'border-blue-500/50 bg-blue-500/10 text-blue-500 dark:text-blue-400',
                    success: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                    warning: 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400',
                    error: 'border-red-500/50 bg-red-500/10 text-red-500 dark:text-red-400',
                  };

                  const typeIconMap = {
                    info: faInfoCircle,
                    success: faCheckCircle,
                    warning: faExclamationTriangle,
                    error: faBan,
                  };

                  return (
                    <div
                      key={item.uuid}
                      onClick={() => {
                        if (isUnread) saveReadUuids([...readUuids, item.uuid]);
                      }}
                      className="p-3.5 border flex flex-col gap-2 relative transition-all shadow-sm overflow-hidden max-w-full select-text"
                      style={{
                        backgroundColor: isLightMode ? '#ffffff' : dark6,
                        border: '1px solid var(--ds-border-color, rgba(63, 63, 70, 0.4))',
                        borderLeft: `4px solid ${accentColor}`,
                        borderRadius: borderRadius,
                        userSelect: 'text',
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 select-none">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border shrink-0 ${
                              typeColorMap[item.type] || typeColorMap.info
                            }`}
                          >
                            <FontAwesomeIcon icon={typeIconMap[item.type] || faInfoCircle} className="mr-1" />
                            {item.type}
                          </span>

                          {/* Pinned Icon for Non-Dismissible / Important Announcements */}
                          {isPinned && (
                            <span
                              className="flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded border shrink-0"
                              style={{
                                backgroundColor: primaryBgColor,
                                borderColor: primaryBorderColor,
                                color: primaryColorHex,
                              }}
                              title="Pinned announcement (Cannot be dismissed from page)"
                            >
                              <FontAwesomeIcon icon={faThumbtack} className="text-[10px]" />
                              Pinned
                            </span>
                          )}

                          {isUnread && (
                            <span className="w-2 h-2 rounded-full animate-pulse shrink-0" style={{ backgroundColor: primaryColorHex }} title="Unread" />
                          )}
                        </div>

                        {/* HIDE Close button for Non-Dismissible announcements */}
                        {item.dismissible && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDismiss(item.uuid, item.dismissible);
                            }}
                            className="text-neutral-400 hover:text-red-500 p-1 transition-colors shrink-0 cursor-pointer"
                            title="Dismiss notification"
                          >
                            <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <h4 className="font-semibold text-sm break-words max-w-full select-text" style={{ color: 'var(--ds-gray-900, #0f172a)', userSelect: 'text' }}>
                        {renderMarkdown(titleText)}
                      </h4>
                      <p className="text-xs leading-relaxed break-words whitespace-pre-wrap max-h-60 overflow-y-auto pr-1 max-w-full select-text" style={{ color: 'var(--ds-gray-800, #475569)', userSelect: 'text' }}>
                        {renderMarkdown(contentText)}
                      </p>

                      {ctaLink && ctaEnabled && (
                        <div className="mt-1 select-none">
                          <a
                            href={ctaLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white transition-colors shadow-sm break-all cursor-pointer"
                            style={{ backgroundColor: primaryColorHex, borderRadius: borderRadius }}
                          >
                            {ctaText}
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2 select-none" style={{ backgroundColor: dark6 }}>
              <button
                onClick={handleMarkAllRead}
                className="flex-1 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 active:bg-neutral-300 dark:active:bg-neutral-700 rounded-lg border border-neutral-300 dark:border-neutral-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FontAwesomeIcon icon={faCheckDouble} />
                Mark All as Read
              </button>
              <button
                onClick={handleClearAll}
                className="py-2 px-3 text-xs font-semibold text-red-500 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 rounded-lg border border-red-500/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FontAwesomeIcon icon={faTrash} />
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default NotificationCenter;
