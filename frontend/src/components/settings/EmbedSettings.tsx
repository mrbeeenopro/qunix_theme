import React from 'react';
import { Stack, TextInput, Textarea, Paper, Text, Badge, NumberInput, Divider } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareNodes, faEye, faImage, faHeading, faBolt } from '@fortawesome/free-solid-svg-icons';
import { ColorField } from './ColorField.tsx';

interface EmbedSettingsProps {
  form: UseFormReturnType<any>;
}

export function EmbedSettings({ form }: EmbedSettingsProps) {
  const embedTitle = form.values.embed_title || 'Qunix Panel — High Performance Game Servers';
  const embedDesc = form.values.embed_description || 'Manage game servers, nodes, allocations and system resources with an ultra-responsive panel interface.';
  const embedColor = form.values.embed_color || '#6c5ce7';
  const embedImage = form.values.embed_image || '';
  const embedSiteName = form.values.embed_site_name || 'Qunix™';

  return (
    <Stack gap="md" style={{ width: '100%' }}>
      {/* 1. Website Preloader & Boot Screen Settings */}
      <div>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'block',
            color: '#a29bfe',
            marginBottom: '4px',
          }}
        >
          <FontAwesomeIcon icon={faBolt} style={{ marginRight: '6px' }} />
          Website Preloader & Boot Screen
        </span>
        <Text size="xs" c="dimmed" style={{ lineHeight: '1.4', marginBottom: '12px' }}>
          Customize the startup boot screen animation displayed on initial panel load.
        </Text>

        <Stack gap='sm'>
          <NumberInput
            label='Preloader Minimum Load Time (ms)'
            description='How long the initial preloader screen stays visible before fading out (e.g. 1500 = 1.5s)'
            min={0}
            max={10000}
            step={250}
            {...form.getInputProps('preloader_delay')}
          />

          <TextInput
            label='Preloader Custom Logo URL'
            description='Custom logo image displayed in center of preloader screen'
            placeholder='/login_bg.png or https://...'
            {...form.getInputProps('preloader_logo')}
          />

          <ColorField
            label='Preloader Background Color'
            description='Background color for boot screen'
            {...form.getInputProps('preloader_bg_color')}
          />

          <TextInput
            label='Preloader Background Image URL'
            description='Wallpaper background image on preloader screen'
            placeholder='https://...'
            {...form.getInputProps('preloader_bg_image')}
          />
        </Stack>
      </div>

      <Divider my="sm" color="#111114" />

      {/* 2. Social Meta Tags & Embeds */}
      <div>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'block',
            color: '#a29bfe',
            marginBottom: '4px',
          }}
        >
          <FontAwesomeIcon icon={faShareNodes} style={{ marginRight: '6px' }} />
          Social Meta Tags & Discord Embeds
        </span>
        <Text size="xs" c="dimmed" style={{ lineHeight: '1.4' }}>
          Configure OpenGraph metadata rendered when sharing panel links on Discord, Twitter, Facebook, or iMessage.
        </Text>
      </div>

      <Stack gap="sm">
        <TextInput
          label="Embed Site / Author Name"
          description="Site brand or author name displayed at the top of the embed"
          placeholder="Qunix™"
          leftSection={<FontAwesomeIcon icon={faShareNodes} style={{ fontSize: '12px', color: '#64748b' }} />}
          {...form.getInputProps('embed_site_name')}
        />

        <TextInput
          label="Embed Title"
          description="Heading title shown on social media embed cards"
          placeholder="Qunix Panel — High Performance Game Servers"
          leftSection={<FontAwesomeIcon icon={faHeading} style={{ fontSize: '12px', color: '#64748b' }} />}
          {...form.getInputProps('embed_title')}
        />

        <Textarea
          label="Embed Description"
          description="Summary text paragraph rendered inside social embed cards"
          placeholder="Manage game servers, nodes, allocations and system resources..."
          rows={3}
          {...form.getInputProps('embed_description')}
        />

        <ColorField
          label="Embed Theme Color"
          description="Left accent border color used by Discord & browser headers"
          {...form.getInputProps('embed_color')}
        />

        <TextInput
          label="Embed Image URL"
          description="Large banner preview image URL for social media link previews"
          placeholder="https://example.com/banner.png"
          leftSection={<FontAwesomeIcon icon={faImage} style={{ fontSize: '12px', color: '#64748b' }} />}
          {...form.getInputProps('embed_image')}
        />
      </Stack>

      {/* Live Preview Section */}
      <Stack gap="xs" style={{ marginTop: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FontAwesomeIcon icon={faEye} style={{ color: '#a29bfe', fontSize: '12px' }} />
          <Text size="xs" fw={700} c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Live Discord Embed Preview
          </Text>
        </div>

        <Paper
          p="sm"
          radius="md"
          style={{
            background: '#2b2d31',
            border: '1px solid #1e1f22',
            color: '#dbdee1',
            fontFamily: 'gg sans, "Noto Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '12px',
                color: '#fff',
                flexShrink: 0,
              }}
            >
              Q
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Text size="xs" fw={600} c="#f2f3f5">
                  Qunix
                </Text>
                <Badge size="xs" variant="filled" color="indigo" radius="xs" style={{ height: '13px', fontSize: '8px', padding: '0 3px' }}>
                  APP
                </Badge>
                <Text size="xs" c="#949ba4" style={{ fontSize: '10px' }}>
                  Today at 12:00 PM
                </Text>
              </div>
            </div>
          </div>

          {/* Discord Embed Container */}
          <div
            style={{
              background: '#2b2d31',
              borderLeft: `4px solid ${embedColor}`,
              borderRadius: '4px',
              padding: '10px 12px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            {/* Provider / Site Name */}
            <Text size="xs" c="#949ba4" fw={500} style={{ marginBottom: '2px', fontSize: '11px' }}>
              {embedSiteName}
            </Text>

            {/* Title */}
            <Text
              size="xs"
              fw={700}
              style={{
                color: '#00a8fc',
                cursor: 'pointer',
                marginBottom: '4px',
                lineHeight: '1.3',
                fontSize: '13px',
              }}
            >
              {embedTitle}
            </Text>

            {/* Description */}
            <Text
              size="xs"
              c="#dbdee1"
              style={{
                lineHeight: '1.4',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontSize: '11px',
                marginBottom: embedImage ? '8px' : '0',
              }}
            >
              {embedDesc}
            </Text>

            {/* Large Image Preview */}
            {embedImage && (
              <div
                style={{
                  marginTop: '6px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  maxHeight: '160px',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <img
                  src={embedImage}
                  alt="Embed Preview"
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '160px',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </Paper>
      </Stack>
    </Stack>
  );
}

export default EmbedSettings;
