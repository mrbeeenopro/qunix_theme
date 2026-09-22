import React from 'react';
import { Group, Button, FileButton } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { z } from 'zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDatabase, faDownload, faUpload, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { qunixThemeSettingsSchema } from '../../lib/schemas.ts';
import { useExtTranslations } from '../../translations.ts';

interface AdvancedSettingsProps {
  form: UseFormReturnType<z.infer<typeof qunixThemeSettingsSchema>>;
  handleExportFile: () => void;
  handleImportFile: (file: File | null) => void;
  handleReset: () => void;
}

export function AdvancedSettings({
  form: _form,
  handleExportFile,
  handleImportFile,
  handleReset,
}: AdvancedSettingsProps) {
  const { t: tExt } = useExtTranslations();

  return (
    <>
      {/* Backup & Restore */}
      <div>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'block',
            color: '#a29bfe',
            marginBottom: '8px',
          }}
        >
          <FontAwesomeIcon icon={faDatabase} style={{ marginRight: '6px' }} />
          {tExt('admin.advanced.exportTitle', {})}
        </span>
        <Group gap='sm'>
          <Button
            onClick={handleExportFile}
            variant='light'
            color='indigo'
            size='xs'
            leftSection={<FontAwesomeIcon icon={faDownload} />}
            styles={{ root: { fontSize: '11px', height: '32px' } }}
          >
            {tExt('admin.advanced.exportButton', {})}
          </Button>

          <FileButton onChange={handleImportFile} accept='application/json'>
            {(props) => (
              <Button
                {...props}
                variant='light'
                color='violet'
                size='xs'
                leftSection={<FontAwesomeIcon icon={faUpload} />}
                styles={{ root: { fontSize: '11px', height: '32px' } }}
              >
                {tExt('admin.advanced.importButton', {})}
              </Button>
            )}
          </FileButton>
        </Group>
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
