import React, { useEffect, useState } from 'react';
import { Stack, Group, ColorInput, NumberInput, TextInput, Switch, Tabs } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPalette } from '@fortawesome/free-solid-svg-icons';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';
import { httpErrorToHuman, axiosInstance } from '@/api/axios.ts';
import Button from '@/elements/Button.tsx';
import TitleCard from '@/elements/TitleCard.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import { qunixThemeSettingsSchema } from './lib/schemas.ts';

export default function ConfigurationPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

const form = useForm<z.infer<typeof qunixThemeSettingsSchema>>({
    initialValues: {
      background_color: '#1a1b26',
      text_color: '#c0caf5',
      focus_color: 'hsla(261, 84%, 79%, 1)',
      shadow_opacity: 0.25,
      font_family: 'JetBrains Mono',
      sidebar_color: '#16161e',
      card_color: 'rgba(36, 40, 59, 0.74)',
      border_color: 'rgba(154, 165, 233, 0.15)',
      border_radius: 8,
      navbar_color: '#1f2335',
      terminal_color: '#1a1b26',
      terminal_text_color: '#a9b1d6',
      input_color: '#24283b',
      button_radius: 8,
      input_radius: 8,
      card_radius: 8,
      navbar_height: 64,
      sidebar_item_gap: 4,
      sidebar_animation: true,
      background_image: '',
      sidebar_blur: 0,
      wallpaper_blur: 0,
      wallpaper_brightness: 1.0,
      glass_transparency: 20,
      editor_color: '#1a1b26',
      editor_text_color: '#c0caf5',
      listing_color: '#24283b',
      button_color: '#7aa2f7',
      graph_color: '#7dcfff',
    },
    validate: zodResolver(qunixThemeSettingsSchema),
  });

  useEffect(() => {
    axiosInstance
      .get('/api/admin/extensions/dev.qunix.theme/settings')
      .then((res) => {
        const s = res.data.settings;
        form.setValues({
          background_color: s.background_color || s.backgroundColor || '#1a1b26',
          text_color: s.text_color || s.textColor || '#c0caf5',
          focus_color: s.focus_color || s.focusColor || 'hsla(261, 84%, 79%, 1)',
          shadow_opacity:
            s.shadow_opacity !== undefined ? s.shadow_opacity : s.shadowOpacity !== undefined ? s.shadowOpacity : 0.25,
          font_family: s.font_family || s.fontFamily || 'JetBrains Mono',
          sidebar_color: s.sidebar_color || s.sidebarColor || '#16161e',
          card_color: s.card_color || s.cardColor || 'rgba(36, 40, 59, 0.74)',
          border_color: s.border_color || s.borderColor || 'rgba(154, 165, 233, 0.15)',
          border_radius:
            s.border_radius !== undefined ? s.border_radius : s.borderRadius !== undefined ? s.borderRadius : 8,
          navbar_color: s.navbar_color || s.navbarColor || '#1f2335',
          terminal_color: s.terminal_color || s.terminalColor || '#1a1b26',
          terminal_text_color: s.terminal_text_color || s.terminalTextColor || '#a9b1d6',
          input_color: s.input_color || s.inputColor || '#24283b',
          button_radius:
            s.button_radius !== undefined ? s.button_radius : s.buttonRadius !== undefined ? s.buttonRadius : 8,
          input_radius: s.input_radius !== undefined ? s.input_radius : s.inputRadius !== undefined ? s.inputRadius : 8,
          card_radius: s.card_radius !== undefined ? s.card_radius : s.cardRadius !== undefined ? s.cardRadius : 8,
          navbar_height:
            s.navbar_height !== undefined ? s.navbar_height : s.navbarHeight !== undefined ? s.navbarHeight : 64,
          sidebar_item_gap:
            s.sidebar_item_gap !== undefined
              ? s.sidebar_item_gap
              : s.sidebarItemGap !== undefined
                ? s.sidebarItemGap
                : 4,
          sidebar_animation:
            s.sidebar_animation !== undefined
              ? s.sidebar_animation
              : s.sidebarAnimation !== undefined
                ? s.sidebarAnimation
                : true,
          background_image: s.background_image || s.backgroundImage || '',
          sidebar_blur: s.sidebar_blur !== undefined ? s.sidebar_blur : s.sidebarBlur !== undefined ? s.sidebarBlur : 0,
          wallpaper_blur:
            s.wallpaper_blur !== undefined ? s.wallpaper_blur : s.wallpaperBlur !== undefined ? s.wallpaperBlur : 0,
          wallpaper_brightness:
            s.wallpaper_brightness !== undefined
              ? s.wallpaper_brightness
              : s.wallpaperBrightness !== undefined
                ? s.wallpaperBrightness
                : 1.0,
          glass_transparency:
            s.glass_transparency !== undefined
              ? s.glass_transparency
              : s.glassTransparency !== undefined
                ? s.glassTransparency
                : 20,
          editor_color: s.editor_color || s.editorColor || '#000000',
          editor_text_color: s.editor_text_color || s.editorTextColor || '#ffffff',
          listing_color: s.listing_color || s.listingColor || '#0a0a0a',
          button_color: s.button_color || s.buttonColor || '#0a72ef',
        });
      })
      .catch((err) => addToast(httpErrorToHuman(err), 'error'));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const s = form.values;
    if (s.background_color) root.style.setProperty('--ds-background', s.background_color);
    if (s.text_color) root.style.setProperty('--ds-gray-900', s.text_color);
    if (s.focus_color) root.style.setProperty('--ds-focus-color', s.focus_color);
    if (s.shadow_opacity !== undefined) {
      root.style.setProperty('--ds-shadow-border', `0px 0px 0px 1px rgba(255, 255, 255, ${s.shadow_opacity})`);
    }
    if (s.sidebar_color) root.style.setProperty('--ds-sidebar-bg', s.sidebar_color);
    if (s.card_color) root.style.setProperty('--ds-card-bg', s.card_color);
    if (s.border_color) root.style.setProperty('--ds-border-color', s.border_color);
    if (s.border_radius !== undefined) root.style.setProperty('--ds-border-radius', `${s.border_radius}px`);
    if (s.navbar_color) root.style.setProperty('--ds-navbar-bg', s.navbar_color);
    if (s.terminal_color) root.style.setProperty('--ds-terminal-bg', s.terminal_color);
    if (s.terminal_text_color) root.style.setProperty('--ds-terminal-text', s.terminal_text_color);
    if (s.input_color) root.style.setProperty('--ds-input-bg', s.input_color);
    if (s.button_radius !== undefined) root.style.setProperty('--ds-button-radius', `${s.button_radius}px`);
    if (s.input_radius !== undefined) root.style.setProperty('--ds-input-radius', `${s.input_radius}px`);
    if (s.card_radius !== undefined) root.style.setProperty('--ds-card-radius', `${s.card_radius}px`);
    if (s.navbar_height !== undefined) root.style.setProperty('--ds-navbar-height', `${s.navbar_height}px`);
    if (s.sidebar_item_gap !== undefined) root.style.setProperty('--ds-sidebar-item-gap', `${s.sidebar_item_gap}px`);
    if (s.sidebar_animation !== undefined)
      root.style.setProperty('--ds-sidebar-animation', s.sidebar_animation ? '1' : '0');
    if (s.background_image !== undefined)
      root.style.setProperty('--ds-background-image', s.background_image ? `url(${s.background_image})` : 'none');
    if (s.sidebar_blur !== undefined) {
      const sbNum = Number(s.sidebar_blur);
      root.style.setProperty('--ds-sidebar-blur', `${sbNum}px`);
      root.style.setProperty('--ds-sidebar-blur-active', sbNum === 0 ? 'none' : `blur(${sbNum}px)`);
    }
    if (s.wallpaper_blur !== undefined) root.style.setProperty('--ds-wallpaper-blur', `${s.wallpaper_blur}px`);
    if (s.wallpaper_brightness !== undefined)
      root.style.setProperty('--ds-wallpaper-brightness', `${s.wallpaper_brightness}`);
    if (s.glass_transparency !== undefined)
      root.style.setProperty('--ds-glass-transparency', `${s.glass_transparency}%`);
    if (s.editor_color) root.style.setProperty('--ds-editor-bg', s.editor_color);
    if (s.editor_text_color) root.style.setProperty('--ds-editor-text', s.editor_text_color);
    if (s.listing_color) root.style.setProperty('--ds-listing-bg', s.listing_color);
    if (s.button_color) root.style.setProperty('--ds-primary-color', s.button_color);
  }, [
    form.values.background_color,
    form.values.text_color,
    form.values.focus_color,
    form.values.shadow_opacity,
    form.values.sidebar_color,
    form.values.card_color,
    form.values.border_color,
    form.values.border_radius,
    form.values.navbar_color,
    form.values.terminal_color,
    form.values.terminal_text_color,
    form.values.input_color,
    form.values.button_radius,
    form.values.input_radius,
    form.values.card_radius,
    form.values.navbar_height,
    form.values.sidebar_item_gap,
    form.values.sidebar_animation,
    form.values.background_image,
    form.values.sidebar_blur,
    form.values.wallpaper_blur,
    form.values.wallpaper_brightness,
    form.values.glass_transparency,
    form.values.editor_color,
    form.values.editor_text_color,
    form.values.listing_color,
    form.values.button_color,
  ]);

  const doSave = () => {
    const payload = {
      background_color: form.values.background_color,
      text_color: form.values.text_color,
      focus_color: form.values.focus_color,
      shadow_opacity: form.values.shadow_opacity,
      sidebar_color: form.values.sidebar_color,
      card_color: form.values.card_color,
      border_color: form.values.border_color,
      border_radius: form.values.border_radius,
      navbar_color: form.values.navbar_color,
      terminal_color: form.values.terminal_color,
      terminal_text_color: form.values.terminal_text_color,
      input_color: form.values.input_color,
      button_radius: form.values.button_radius,
      input_radius: form.values.input_radius,
      card_radius: form.values.card_radius,
      navbar_height: form.values.navbar_height,
      sidebar_item_gap: form.values.sidebar_item_gap,
      sidebar_animation: form.values.sidebar_animation,
      background_image: form.values.background_image,
      sidebar_blur: form.values.sidebar_blur,
      wallpaper_blur: form.values.wallpaper_blur,
      wallpaper_brightness: form.values.wallpaper_brightness,
      glass_transparency: form.values.glass_transparency,
      editor_color: form.values.editor_color,
      editor_text_color: form.values.editor_text_color,
      listing_color: form.values.listing_color,
      button_color: form.values.button_color,
    };

    console.log('QUNIX_THEME: Attempting to save settings:', payload);
    setLoading(true);
    axiosInstance
      .put('/api/admin/extensions/dev.qunix.theme/settings', payload)
      .then((res) => {
        console.log('QUNIX_THEME: Save successful:', res.data);
        addToast('Theme settings saved. Refresh the page to apply.', 'success');
      })
      .catch((err) => {
        console.error('QUNIX_THEME: Save failed:', err);
        addToast(httpErrorToHuman(err), 'error');
      })
      .finally(() => setLoading(false));
  };

  return (
    <TitleCard title='Qunix Theme Settings' icon={<FontAwesomeIcon icon={faPalette} size='sm' />}>
      <form onSubmit={form.onSubmit(doSave)}>
        <Tabs defaultValue='global' variant='outline' classNames={{ panel: 'pt-4' }}>
          <Tabs.List>
            <Tabs.Tab value='global'>Global</Tabs.Tab>
            <Tabs.Tab value='menu'>Menu & Sidebar</Tabs.Tab>
            <Tabs.Tab value='card'>Cards & Inputs</Tabs.Tab>
            <Tabs.Tab value='lists'>Lists & Tables</Tabs.Tab>
            <Tabs.Tab value='terminal'>Terminal</Tabs.Tab>
            <Tabs.Tab value='editor'>Code Editor</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value='global'>
            <Stack gap='md'>
              <Group grow>
                <ColorInput
                  label='Background Color'
                  description='The main background color of the panel.'
                  {...form.getInputProps('background_color')}
                />
                <ColorInput
                  label='Text Color'
                  description='The primary text color.'
                  {...form.getInputProps('text_color')}
                />
              </Group>
              <Group grow>
                <ColorInput
                  label='Focus Color'
                  description='Color used for focus rings and active elements.'
                  {...form.getInputProps('focus_color')}
                />
                <NumberInput
                  label='Shadow Opacity'
                  description='Opacity of the shadow-borders (0.0 to 1.0).'
                  min={0}
                  max={1}
                  step={0.01}
                  decimalScale={3}
                  {...form.getInputProps('shadow_opacity')}
                />
              </Group>
              <Group grow>
                <ColorInput
                  label='Border Color'
                  description='The color of borders throughout the panel.'
                  {...form.getInputProps('border_color')}
                />
                <TextInput
                  label='Background Image URL'
                  description='URL for a custom background image. This will be applied globally.'
                  placeholder='https://example.com/background.jpg'
                  {...form.getInputProps('background_image')}
                />
              </Group>
              <Group grow>
                <NumberInput
                  label='Wallpaper Blur'
                  description='Background image blur intensity (0-50px).'
                  min={0}
                  max={50}
                  {...form.getInputProps('wallpaper_blur')}
                />
                <NumberInput
                  label='Wallpaper Brightness'
                  description='Blend background image with theme color (0.0 to 1.0).'
                  min={0}
                  max={1}
                  step={0.1}
                  decimalScale={1}
                  {...form.getInputProps('wallpaper_brightness')}
                />
                <NumberInput
                  label='Glass Transparency'
                  description='Card/list transparency when using background image (0-100%).'
                  min={0}
                  max={100}
                  {...form.getInputProps('glass_transparency')}
                />
              </Group>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='menu'>
            <Stack gap='md'>
              <Group grow>
                <ColorInput
                  label='Menu / Navbar Color'
                  description='The background color of the top navigation bar and dropdown menus.'
                  {...form.getInputProps('navbar_color')}
                />
                <NumberInput
                  label='Navbar Height'
                  description='The height of the top navigation bar (in px).'
                  min={32}
                  max={200}
                  {...form.getInputProps('navbar_height')}
                />
              </Group>
              <Group grow>
                <ColorInput
                  label='Sidebar (Mobile) Color'
                  description='The background color of the sidebar.'
                  {...form.getInputProps('sidebar_color')}
                />
                <NumberInput
                  label='Sidebar Item Gap'
                  description='Spacing between elements in the sidebar (in px).'
                  min={0}
                  max={100}
                  {...form.getInputProps('sidebar_item_gap')}
                />
              </Group>
              <Group grow>
                <NumberInput
                  label='Sidebar / Menu Blur'
                  description='Glassmorphism blur intensity (0-50px).'
                  min={0}
                  max={50}
                  {...form.getInputProps('sidebar_blur')}
                />
              </Group>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='card'>
            <Stack gap='md'>
              <Group grow>
                <ColorInput
                  label='Card Color'
                  description='The background color of cards and segments.'
                  {...form.getInputProps('card_color')}
                />
                <NumberInput
                  label='Card Radius'
                  description='Corner radius for cards (in px).'
                  min={0}
                  max={100}
                  {...form.getInputProps('card_radius')}
                />
              </Group>
              <Group grow>
                <ColorInput
                  label='Input Background'
                  description='The background color for text inputs.'
                  {...form.getInputProps('input_color')}
                />
                <NumberInput
                  label='Input Radius'
                  description='Corner radius for text inputs (in px).'
                  min={0}
                  max={100}
                  {...form.getInputProps('input_radius')}
                />
              </Group>
              <Group grow>
                <ColorInput
                  label='Button Color'
                  description='The primary color for buttons.'
                  {...form.getInputProps('button_color')}
                />
                <NumberInput
                  label='Button Radius'
                  description='Corner radius for buttons (in px).'
                  min={0}
                  max={100}
                  {...form.getInputProps('button_radius')}
                />
              </Group>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='lists'>
            <Stack gap='md'>
              <Group grow>
                <ColorInput
                  label='Listing Color'
                  description='The background color for lists and tables (Nodes, Users, Files, etc.).'
                  {...form.getInputProps('listing_color')}
                />
              </Group>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='terminal'>
            <Stack gap='md'>
              <Group grow>
                <ColorInput
                  label='Terminal Background'
                  description='The background color for terminals.'
                  {...form.getInputProps('terminal_color')}
                />
                <ColorInput
                  label='Terminal Text'
                  description='The text color for terminals.'
                  {...form.getInputProps('terminal_text_color')}
                />
              </Group>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='editor'>
            <Stack gap='md'>
              <Group grow>
                <ColorInput
                  label='Editor Background'
                  description='The background color for code editors (File Manager).'
                  {...form.getInputProps('editor_color')}
                />
                <ColorInput
                  label='Editor Text'
                  description='The text color for code editors.'
                  {...form.getInputProps('editor_text_color')}
                />
              </Group>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <div className='mt-6'>
          <Button type='submit' loading={loading} className='w-fit!'>
            Save Settings
          </Button>
        </div>
      </form>
    </TitleCard>
  );
}