import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Switch from '@/elements/input/Switch.tsx';

export interface QunixPrivacyContainerProps {
  requireTwoFactorActivation?: boolean;
}

export const QunixPrivacyContainer: React.FC<QunixPrivacyContainerProps> = () => {
  const [privacyMode, setPrivacyMode] = useState<boolean>(() => {
    const userVal = localStorage.getItem('qunix_user_privacy_mode');
    if (userVal !== null) return userVal === 'true';
    return document.documentElement.getAttribute('data-privacy-blur') === 'true';
  });

  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const handleSync = (e: Event) => {
      const val = (e as CustomEvent).detail;
      setPrivacyMode(Boolean(val));
    };
    window.addEventListener('qunix-privacy-mode-changed', handleSync);
    return () => window.removeEventListener('qunix-privacy-mode-changed', handleSync);
  }, []);

  useEffect(() => {
    let slot = document.getElementById('qunix-privacy-pref-slot');
    let observer: MutationObserver | null = null;

    const attachSlot = () => {
      const prefCard = document.querySelector('.order-55');
      if (!prefCard) return false;

      const stack =
        prefCard.querySelector('.mantine-Stack-root') ||
        prefCard.querySelector('div.p-4 > div') ||
        prefCard.querySelector('div.p-4');
      if (!stack) return false;

      if (!slot) {
        slot = document.createElement('div');
        slot.id = 'qunix-privacy-pref-slot';
      }

      if (!stack.contains(slot)) {
        stack.appendChild(slot);
      }

      setMountNode(slot);

      if (!observer) {
        observer = new MutationObserver(() => {
          const currentPref = document.querySelector('.order-55');
          const currentStack =
            currentPref?.querySelector('.mantine-Stack-root') ||
            currentPref?.querySelector('div.p-4 > div') ||
            currentPref?.querySelector('div.p-4');
          if (currentStack && slot && !currentStack.contains(slot)) {
            currentStack.appendChild(slot);
          }
        });
        observer.observe(stack, { childList: true });
      }

      return true;
    };

    if (!attachSlot()) {
      const interval = setInterval(() => {
        if (attachSlot()) {
          clearInterval(interval);
        }
      }, 50);

      return () => {
        clearInterval(interval);
        if (observer) observer.disconnect();
        if (slot && slot.parentNode) {
          slot.remove();
        }
      };
    }

    return () => {
      if (observer) observer.disconnect();
      if (slot && slot.parentNode) {
        slot.remove();
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.currentTarget.checked;
    setPrivacyMode(checked);
    localStorage.setItem('qunix_user_privacy_mode', String(checked));
    document.documentElement.setAttribute('data-privacy-blur', checked ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('qunix-privacy-mode-changed', { detail: checked }));
  };

  if (!mountNode) return null;

  return createPortal(
    <Switch
      label='Privacy Mode'
      checked={privacyMode}
      onChange={handleChange}
    />,
    mountNode
  );
};

export default QunixPrivacyContainer;
