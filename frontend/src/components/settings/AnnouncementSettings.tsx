import React from 'react';
import { Stack, Group, TextInput, NumberInput, Switch, Select, Divider } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { z } from 'zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullhorn, faLink, faBell } from '@fortawesome/free-solid-svg-icons';
import { qunixThemeSettingsSchema } from '../../lib/schemas.ts';
import { ColorField } from './ColorField.tsx';

interface AnnouncementSettingsProps {
  form: UseFormReturnType<z.infer<typeof qunixThemeSettingsSchema>>;
}

export function AnnouncementSettings({ form }: AnnouncementSettingsProps) {
  return (
    <>
      <Stack gap="md">
        {/* 1. Announcement Banner Settings */}
        <div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 'bold',
              display: 'block',
              color: '#a29bfe',
              marginBottom: '12px',
            }}
          >
            <FontAwesomeIcon icon={faBullhorn} style={{ marginRight: '6px' }} />
            Dashboard Announcements
          </span>

          <Stack gap='sm'>
            <Select
              label='Announcement Display Mode'
              comboboxProps={{ withinPortal: true, zIndex: 10000 }}
              data={[
                { value: 'notifications', label: 'Notification Bell Drawer (Optimized Space)' },
                { value: 'banner', label: 'Inline Page Banners (Classic)' },
                { value: 'both', label: 'Both Banners & Notification Bell' },
              ]}
              value={form.values.announcement_display_mode || 'notifications'}
              onChange={(val) => form.setFieldValue('announcement_display_mode', val || 'notifications')}
              styles={{
                input: { background: '#141418', border: '1px solid #27272a', color: '#e4e4e7' },
                dropdown: { background: '#141418', border: '1px solid #27272a' },
                option: { color: '#e4e4e7' },
              }}
            />

            <Group grow>
              <NumberInput
                label='Announcement Blur (px)'
                min={0}
                max={100}
                {...form.getInputProps('announcement_blur')}
              />
              <NumberInput
                label='Announcement Radius (px)'
                min={0}
                max={100}
                {...form.getInputProps('announcement_radius')}
              />
            </Group>

            <ColorField label='Default Announcement BG (Dark)' {...form.getInputProps('announcement_bg')} />
            <ColorField label='Default Announcement BG (Light)' {...form.getInputProps('light_announcement_bg')} />
            <ColorField
              label='Default Announcement Accent Color (Dark)'
              {...form.getInputProps('announcement_border_color')}
            />
            <ColorField
              label='Default Announcement Accent Color (Light)'
              {...form.getInputProps('light_announcement_border_color')}
            />

            <Group grow>
              <ColorField label='Info BG' {...form.getInputProps('announcement_info_bg')} />
              <ColorField label='Info Accent' {...form.getInputProps('announcement_info_border')} />
            </Group>
            <Group grow>
              <ColorField label='Success BG' {...form.getInputProps('announcement_success_bg')} />
              <ColorField label='Success Accent' {...form.getInputProps('announcement_success_border')} />
            </Group>
            <Group grow>
              <ColorField label='Warning BG' {...form.getInputProps('announcement_warning_bg')} />
              <ColorField label='Warning Accent' {...form.getInputProps('announcement_warning_border')} />
            </Group>
            <Group grow>
              <ColorField label='Error BG' {...form.getInputProps('announcement_error_bg')} />
              <ColorField label='Error Accent' {...form.getInputProps('announcement_error_border')} />
            </Group>
          </Stack>
        </div>

        <Divider my="sm" color="#111114" />

        {/* 2. Announcement Call-To-Action (CTA) Buttons */}
        <div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 'bold',
              display: 'block',
              color: '#a29bfe',
              marginBottom: '12px',
            }}
          >
            <FontAwesomeIcon icon={faLink} style={{ marginRight: '6px' }} />
            Call-To-Action (CTA) Button
          </span>

          <Stack gap='sm'>
            <Switch
              label='Enable CTA Action Button'
              checked={form.values.announcement_cta}
              onChange={(event) => form.setFieldValue('announcement_cta', event.currentTarget.checked)}
              styles={{
                label: { color: '#e4e4e7', fontSize: '11px', fontWeight: 600 },
              }}
            />
            <TextInput
              label='CTA Button Text'
              placeholder='Go to link...'
              {...form.getInputProps('announcement_cta_text')}
            />
            <TextInput
              label='CTA Button Link URL'
              placeholder='https://discord.gg/...'
              {...form.getInputProps('announcement_cta_link')}
            />
            <Group grow>
              <ColorField label='CTA BG (Dark)' {...form.getInputProps('announcement_cta_bg')} />
              <ColorField label='CTA BG (Light)' {...form.getInputProps('light_announcement_cta_bg')} />
            </Group>
            <Group grow>
              <ColorField label='CTA Text (Dark)' {...form.getInputProps('announcement_cta_color')} />
              <ColorField label='CTA Text (Light)' {...form.getInputProps('light_announcement_cta_color')} />
            </Group>
            <NumberInput
              label='CTA Button Radius (px)'
              min={0}
              max={100}
              {...form.getInputProps('announcement_cta_radius')}
            />
          </Stack>
        </div>

        <Divider my="sm" color="#111114" />

        {/* 3. System Notification Popups / Toasts */}
        <div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 'bold',
              display: 'block',
              color: '#a29bfe',
              marginBottom: '12px',
            }}
          >
            <FontAwesomeIcon icon={faBell} style={{ marginRight: '6px' }} />
            System Notification Popups (Toasts)
          </span>

          <Stack gap='sm'>
            <Select
              label='Toast Style'
              comboboxProps={{ withinPortal: true, zIndex: 10000 }}
              data={[
                { value: 'qunix', label: 'System Qunix Theme' },
                { value: 'blur', label: 'Blur (Glassmorphism)' },
              ]}
              {...form.getInputProps('toast_style')}
              styles={{
                input: { background: '#141418', border: '1px solid #27272a', color: '#e4e4e7' },
                dropdown: { background: '#141418', border: '1px solid #27272a' },
                option: { color: '#e4e4e7' },
              }}
            />

            <NumberInput
              label='Toast Radius (px)'
              min={0}
              max={100}
              {...form.getInputProps('toast_radius')}
            />

            <Group grow>
              <Switch
                label='Enable Toast Timer'
                checked={form.values.toast_timer}
                onChange={(event) => form.setFieldValue('toast_timer', event.currentTarget.checked)}
                styles={{
                  label: { color: '#e4e4e7', fontSize: '11px' },
                }}
              />
              <Switch
                label='Colored Border'
                checked={form.values.toast_colored_border}
                onChange={(event) => form.setFieldValue('toast_colored_border', event.currentTarget.checked)}
                styles={{
                  label: { color: '#e4e4e7', fontSize: '11px' },
                }}
              />
            </Group>
            <Switch
              label='Background Tint'
              checked={form.values.toast_background_tint}
              onChange={(event) => form.setFieldValue('toast_background_tint', event.currentTarget.checked)}
              styles={{
                label: { color: '#e4e4e7', fontSize: '11px' },
              }}
            />
          </Stack>
        </div>
      </Stack>
    </>
  );
}

export default AnnouncementSettings;
