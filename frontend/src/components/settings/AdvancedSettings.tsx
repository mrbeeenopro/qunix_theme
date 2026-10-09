import React from 'react';
import { Group, Button, FileButton, Switch } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { z } from 'zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDatabase, faDownload, faUpload, faRotateLeft, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { qunixThemeSettingsSchema } from '../../lib/schemas.ts';
import { useExtTranslations } from '../../translations.ts';

interface AdvancedSettingsProps {
  form: UseFormReturnType<z.infer<typeof qunixThemeSettingsSchema>>;
  handleExportFile: () => void;
  handleImportFile: (file: File | null) => void;
  handleReset: () => void;
}

export function AdvancedSettings({
  form,
  handleExportFile,
  handleImportFile,
  handleReset,
}: AdvancedSettingsProps) {
  const { t: tExt } = useExtTranslations();
  const themeAccent = form.values.button_color || form.values.focus_color || '#6c5ce7';
  const accentTextColor = `color-mix(in srgb, ${themeAccent} 80%, white)`;

  return (
    <>
      {/* Backup & Restore */}
      <div>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'block',
            color: accentTextColor,
            marginBottom: '8px',
          }}
        >
          <FontAwesomeIcon icon={faDatabase} style={{ marginRight: '6px' }} />
          {tExt('admin.advanced.exportTitle', {})}
        </span>
        <Group gap='sm'>
          <Button
            onClick={handleExportFile}
            size='xs'
            leftSection={<FontAwesomeIcon icon={faDownload} />}
            style={{
              fontSize: '11px',
              height: '32px',
              background: `color-mix(in srgb, ${themeAccent} 15%, transparent)`,
              color: accentTextColor,
              border: `1px solid color-mix(in srgb, ${themeAccent} 35%, transparent)`,
            }}
          >
            {tExt('admin.advanced.exportButton', {})}
          </Button>

          <FileButton onChange={handleImportFile} accept='application/json'>
            {(props) => (
              <Button
                {...props}
                size='xs'
                leftSection={<FontAwesomeIcon icon={faUpload} />}
                style={{
                  fontSize: '11px',
                  height: '32px',
                  background: `color-mix(in srgb, ${themeAccent} 15%, transparent)`,
                  color: accentTextColor,
                  border: `1px solid color-mix(in srgb, ${themeAccent} 35%, transparent)`,
                }}
              >
                {tExt('admin.advanced.importButton', {})}
              </Button>
            )}
          </FileButton>
        </Group>
      </div>

      {/* Anonymous Telemetry */}
      <div style={{ borderTop: '1px solid #111114', paddingTop: '16px', marginTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 'bold',
                display: 'block',
                color: accentTextColor,
                marginBottom: '4px',
              }}
            >
              <FontAwesomeIcon icon={faChartLine} style={{ marginRight: '6px' }} />
              {tExt('admin.advanced.telemetryTitle', { defaultValue: 'Anonymous Extension Telemetry' })}
            </span>
            <span style={{ fontSize: '11px', color: '#888899', display: 'block', maxWidth: '480px', lineHeight: 1.4 }}>
              {tExt('admin.advanced.telemetryDescription', {
                defaultValue:
                  'Allow anonymous telemetry reporting (panel version, container type, and theme version) to help improve compatibility and resolve issues. No personal or sensitive data is collected.',
              })}
            </span>
          </div>
          <Switch
            checked={form.values.enable_telemetry !== false}
            onChange={(event) => form.setFieldValue('enable_telemetry', event.currentTarget.checked)}
            color={themeAccent}
            size='sm'
          />
        </div>
      </div>

      {/* Reset Settings */}
      <div style={{ borderTop: '1px solid #111114', paddingTop: '16px', marginTop: '16px' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'block',
            color: '#ff4757',
            marginBottom: '8px',
          }}
        >
          <FontAwesomeIcon icon={faRotateLeft} style={{ marginRight: '6px' }} />
          {tExt('admin.advanced.resetTitle', {})}
        </span>
        <Button
          onClick={handleReset}
          variant='outline'
          color='red'
          size='xs'
          leftSection={<FontAwesomeIcon icon={faRotateLeft} />}
          styles={{ root: { fontSize: '11px', height: '32px' } }}
        >
          {tExt('admin.advanced.resetButton', {})}
        </Button>
      </div>
    </>
  );
}
