import { Extension, ExtensionContext } from 'shared';
import type { MantineThemeOverride } from '@mantine/core';
import { axiosInstance } from '@/api/axios.ts';
import ConfigurationPage from './ConfigurationPage.tsx';
import './app.css';

class QunixThemeExtension extends Extension {
  public cardConfigurationPage = ConfigurationPage;
  public cardComponent = null;

  public initialize(ctx: ExtensionContext): void {
    console.log('Qunix Theme Extension initialized!');

    // Fetch settings from the public endpoint and apply them
    axiosInstance
      .get('/api/dev.qunix.theme/settings')
      .then((res) => {
        const s = res.data.settings;
        const root = document.documentElement;

        // Handle both snake_case and camelCase (axios transformation)
        const backgroundColor = s.background_color || s.backgroundColor;
        const textColor = s.text_color || s.textColor;
        const focusColor = s.focus_color || s.focusColor;
        const shadowOpacity = s.shadow_opacity !== undefined ? s.shadow_opacity : s.shadowOpacity;
        const fontFamily = s.font_family || s.fontFamily;
        const sidebarColor = s.sidebar_color || s.sidebarColor;
        const cardColor = s.card_color || s.cardColor;
        const borderColor = s.border_color || s.borderColor;
        const borderRadius = s.border_radius !== undefined ? s.border_radius : s.borderRadius;
        const navbarColor = s.navbar_color || s.navbarColor;
        const terminalColor = s.terminal_color || s.terminalColor;
        const terminalTextColor = s.terminal_text_color || s.terminalTextColor;
        const inputColor = s.input_color || s.inputColor;
        const buttonRadius = s.button_radius !== undefined ? s.button_radius : s.buttonRadius;
        const inputRadius = s.input_radius !== undefined ? s.input_radius : s.inputRadius;
        const cardRadius = s.card_radius !== undefined ? s.card_radius : s.cardRadius;
        const navbarHeight = s.navbar_height !== undefined ? s.navbar_height : s.navbarHeight;
        const sidebarItemGap = s.sidebar_item_gap !== undefined ? s.sidebar_item_gap : s.sidebarItemGap;
        const backgroundImage = s.background_image || s.backgroundImage;
        const sidebarBlur = s.sidebar_blur !== undefined ? s.sidebar_blur : s.sidebarBlur;
        const wallpaperBlur = s.wallpaper_blur !== undefined ? s.wallpaper_blur : s.wallpaperBlur;
        const wallpaperBrightness =
          s.wallpaper_brightness !== undefined ? s.wallpaper_brightness : s.wallpaperBrightness;
        const glassTransparency = s.glass_transparency !== undefined ? s.glass_transparency : s.glassTransparency;
        const editorColor = s.editor_color || s.editorColor;
        const editorTextColor = s.editor_text_color || s.editorTextColor;
        const listingColor = s.listing_color || s.listingColor;
        const sidebarAnimation = s.sidebar_animation !== undefined ? s.sidebar_animation : s.sidebarAnimation;
        const buttonColor = s.button_color || s.buttonColor;

        if (backgroundColor) root.style.setProperty('--ds-background', backgroundColor);
        if (textColor) root.style.setProperty('--ds-gray-900', textColor);
        if (focusColor) root.style.setProperty('--ds-focus-color', focusColor);
        if (buttonColor) root.style.setProperty('--ds-primary-color', buttonColor);
        if (sidebarColor) root.style.setProperty('--ds-sidebar-bg', sidebarColor);
        if (cardColor) root.style.setProperty('--ds-card-bg', cardColor);
        if (borderColor) root.style.setProperty('--ds-border-color', borderColor);
        if (borderRadius !== undefined) root.style.setProperty('--ds-border-radius', `${borderRadius}px`);
        if (navbarColor) root.style.setProperty('--ds-navbar-bg', navbarColor);
        if (terminalColor) root.style.setProperty('--ds-terminal-bg', terminalColor);
        if (terminalTextColor) root.style.setProperty('--ds-terminal-text', terminalTextColor);
        if (inputColor) root.style.setProperty('--ds-input-bg', inputColor);
        if (buttonRadius !== undefined) root.style.setProperty('--ds-button-radius', `${buttonRadius}px`);
        if (inputRadius !== undefined) root.style.setProperty('--ds-input-radius', `${inputRadius}px`);
        if (cardRadius !== undefined) root.style.setProperty('--ds-card-radius', `${cardRadius}px`);
        if (navbarHeight !== undefined) root.style.setProperty('--ds-navbar-height', `${navbarHeight}px`);
        if (sidebarItemGap !== undefined) root.style.setProperty('--ds-sidebar-item-gap', `${sidebarItemGap}px`);
        if (backgroundImage) {
          root.style.setProperty('--ds-background-image', `url(${backgroundImage})`);
          root.classList.add('has-bg-image');
          document.body.classList.add('has-bg-image');
        } else {
          root.style.setProperty('--ds-background-image', 'none');
          root.classList.remove('has-bg-image');
          document.body.classList.remove('has-bg-image');
        }
        if (sidebarBlur !== undefined) {
          const sbNum = Number(sidebarBlur);
          root.style.setProperty('--ds-sidebar-blur', `${sbNum}px`);
          root.style.setProperty('--ds-sidebar-blur-active', sbNum === 0 ? 'none' : `blur(${sbNum}px)`);
        }
        if (wallpaperBlur !== undefined) root.style.setProperty('--ds-wallpaper-blur', `${wallpaperBlur}px`);
        if (wallpaperBrightness !== undefined)
          root.style.setProperty('--ds-wallpaper-brightness', `${wallpaperBrightness}`);
        if (glassTransparency !== undefined) {
          root.style.setProperty('--ds-glass-transparency', `${glassTransparency}%`);
        }
        if (editorColor) root.style.setProperty('--ds-editor-bg', editorColor);
        if (editorTextColor) root.style.setProperty('--ds-editor-text', editorTextColor);
        if (listingColor) root.style.setProperty('--ds-listing-bg', listingColor);
        if (sidebarAnimation !== undefined) {
          root.style.setProperty('--ds-sidebar-animation', sidebarAnimation ? '1' : '0');
        }

        if (shadowOpacity !== undefined) {
          root.style.setProperty('--ds-shadow-border', `0px 0px 0px 1px rgba(255, 255, 255, ${shadowOpacity})`);
        }

        if (fontFamily && fontFamily !== 'Inter' && fontFamily !== 'Geist') {
          const formattedFont = fontFamily
            .split(/[\s-]+/)
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');

          console.log(`QUNIX_THEME: Loading Google Font: ${formattedFont}`);
          const link = document.createElement('link');
          link.href = `https://fonts.googleapis.com/css2?family=${formattedFont.replace(/\s+/g, '+')}:wght@400;500;600;700&display=swap`;
          link.rel = 'stylesheet';
          document.head.appendChild(link);

          root.style.setProperty('--ds-font-family', `"${formattedFont}", 'JetBrains Mono', monospace`);
        } else {
          root.style.setProperty('--ds-font-family', "'JetBrains Mono', monospace");
        }
      })
      .catch((err) => console.error('Failed to load theme settings:', err));

    // Global mousemove listener for sidebar glow animation
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', (e) => {
        if (document.documentElement.style.getPropertyValue('--ds-sidebar-animation') !== '1') return;

        const cards = document.querySelectorAll('.mantine-NavLink-root');
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i] as HTMLElement;
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);
        }
      });
    }
  }

  public initializeMantineTheme(_ctx: ExtensionContext): MantineThemeOverride {
    return {
      fontFamily: 'var(--ds-font-family), "JetBrains Mono", monospace',
      fontFamilyMonospace: 'JetBrains Mono, monospace',
      black: '#000000',
      white: '#ffffff',
      primaryColor: 'blue',
      defaultRadius: 8,
      colors: {
        dark: [
          '#ffffff', // 0
          '#ebebeb', // 1
          '#808080', // 2
          '#666666', // 3
          '#4d4d4d', // 4
          '#333333', // 5
          '#111111', // 6
          '#0a0a0a', // 7
          '#050505', // 8
          '#000000', // 9
        ],
        blue: [
          '#ebf5ff', // 0
          '#d1e9ff', // 1
          '#a3d3ff', // 2
          '#75bdff', // 3
          '#47a7ff', // 4
          '#1991ff', // 5
          '#0a72ef', // 6 (Develop Blue)
          '#0059c1', // 7
          '#004293', // 8
          '#002b65', // 9
        ],
        pink: [
          '#fff0f6',
          '#ffdeeb',
          '#fcc2d7',
          '#faa2c1',
          '#f783ac',
          '#f06595',
          '#de1d8d', // Preview Pink
          '#c2255c',
          '#a61e4d',
          '#861841',
        ],
        red: [
          '#fff5f5',
          '#ffe3e3',
          '#ffc9c9',
          '#ffa8a8',
          '#ff8787',
          '#ff6b6b',
          '#ff5b4f', // Ship Red
          '#e03131',
          '#c92a2a',
          '#a61d24',
        ],
      },
      headings: {
        fontWeight: '600',
        fontFamily: 'var(--ds-font-family), "JetBrains Mono", monospace',
      },
    };
  }
}

export default new QunixThemeExtension();
