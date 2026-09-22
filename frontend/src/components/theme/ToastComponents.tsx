import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleCheck,
  faCircleXmark,
  faCircleExclamation,
  faCircleInfo,
} from '@fortawesome/free-solid-svg-icons';

export const CustomToast: React.FC<{
  color?: string;
  onClose?: () => void;
  children: React.ReactNode;
  showTimer?: boolean;
  radius?: number;
  coloredBorder?: boolean;
  backgroundTint?: boolean;
}> = ({ color, onClose, children, showTimer = true, radius = 8, coloredBorder = true, backgroundTint = true }) => {
  let icon = faCircleInfo;
  let accentColor = 'var(--ds-toast-info-color, var(--ds-announcement-info-border, #3b82f6))';
  let toastBg = 'var(--ds-toast-info-bg, rgba(59, 130, 246, 0.15))';

  if (color === 'green' || color === 'success') {
    icon = faCircleCheck;
    accentColor = 'var(--ds-toast-success-color, var(--ds-announcement-success-border, #10b981))';
    toastBg = 'var(--ds-toast-success-bg, rgba(16, 185, 129, 0.15))';
  } else if (color === 'red' || color === 'error') {
    icon = faCircleXmark;
    accentColor = 'var(--ds-toast-error-color, var(--ds-announcement-error-border, #ef4444))';
    toastBg = 'var(--ds-toast-error-bg, rgba(239, 68, 68, 0.15))';
  } else if (color === 'yellow' || color === 'warning') {
    icon = faCircleExclamation;
    accentColor = 'var(--ds-toast-warning-color, var(--ds-announcement-warning-border, #f59e0b))';
    toastBg = 'var(--ds-toast-warning-bg, rgba(245, 158, 11, 0.15))';
  } else if (color === 'blue' || color === 'info') {
    icon = faCircleInfo;
    accentColor = 'var(--ds-toast-info-color, var(--ds-announcement-info-border, #3b82f6))';
    toastBg = 'var(--ds-toast-info-bg, rgba(59, 130, 246, 0.15))';
  }

  return (
    <div
      className={`qunix-custom-toast-container ${coloredBorder ? 'has-colored-border' : ''} ${backgroundTint ? 'has-bg-tint' : ''}`}
      style={
        {
          '--toast-accent': accentColor,
          '--toast-bg': toastBg,
          '--toast-radius': `${radius}px`,
        } as any
      }
    >
      <div className='qunix-custom-toast-content'>
        <div className='qunix-custom-toast-icon-wrapper'>
          <FontAwesomeIcon icon={icon} className='qunix-custom-toast-icon' />
        </div>
        <div className='qunix-custom-toast-message'>{children}</div>
        {onClose && (
          <button onClick={onClose} className='qunix-custom-toast-close'>
            &times;
          </button>
        )}
      </div>
      {showTimer && <div className='qunix-custom-toast-timer-bar' />}
    </div>
  );
};

export const QunixThemeToast: React.FC<{
  color?: string;
  onClose?: () => void;
  children: React.ReactNode;
  showTimer?: boolean;
  radius?: number;
  coloredBorder?: boolean;
  backgroundTint?: boolean;
}> = ({ color, onClose, children, showTimer = true, radius = 8, coloredBorder = true, backgroundTint = true }) => {
  let icon = faCircleInfo;
  let accentColor = 'var(--ds-toast-info-color, var(--ds-announcement-info-border, #3b82f6))';
  let toastBg = 'var(--ds-toast-info-bg, rgba(59, 130, 246, 0.15))';

  if (color === 'green' || color === 'success') {
    icon = faCircleCheck;
    accentColor = 'var(--ds-toast-success-color, var(--ds-announcement-success-border, #10b981))';
    toastBg = 'var(--ds-toast-success-bg, rgba(16, 185, 129, 0.15))';
  } else if (color === 'red' || color === 'error') {
    icon = faCircleXmark;
    accentColor = 'var(--ds-toast-error-color, var(--ds-announcement-error-border, #ef4444))';
    toastBg = 'var(--ds-toast-error-bg, rgba(239, 68, 68, 0.15))';
  } else if (color === 'yellow' || color === 'warning') {
    icon = faCircleExclamation;
    accentColor = 'var(--ds-toast-warning-color, var(--ds-announcement-warning-border, #f59e0b))';
    toastBg = 'var(--ds-toast-warning-bg, rgba(245, 158, 11, 0.15))';
  } else if (color === 'blue' || color === 'info') {
    icon = faCircleInfo;
    accentColor = 'var(--ds-toast-info-color, var(--ds-announcement-info-border, #3b82f6))';
    toastBg = 'var(--ds-toast-info-bg, rgba(59, 130, 246, 0.15))';
  }

  return (
    <div
      className={`qunix-theme-toast-container ${coloredBorder ? 'has-colored-border' : ''} ${backgroundTint ? 'has-bg-tint' : ''}`}
      style={
        {
          '--toast-accent': accentColor,
          '--toast-bg': toastBg,
          '--toast-radius': `${radius}px`,
        } as any
      }
    >
      <div className='qunix-theme-toast-content'>
        <FontAwesomeIcon icon={icon} className='qunix-theme-toast-icon' />
        <div className='qunix-theme-toast-message'>{children}</div>
        {onClose && (
          <button onClick={onClose} className='qunix-theme-toast-close'>
            &times;
          </button>
        )}
      </div>
      {showTimer && <div className='qunix-theme-toast-timer-bar' />}
    </div>
  );
};
