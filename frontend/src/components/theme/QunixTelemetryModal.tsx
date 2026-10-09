import React, { useState, useEffect } from 'react';
import { Modal, Button, Checkbox, Text, Group, Stack, ThemeIcon, Paper, Badge } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/providers/AuthProvider.tsx';
import { isAdmin } from '@/lib/auth/permissions.ts';
import { axiosInstance } from '@/api/axios.ts';
import { sendTelemetryPing } from '../../lib/telemetry.ts';
import pkg from '../../../package.json';

export function QunixTelemetryModal() {
  const { user } = useAuth();
  const [opened, setOpened] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only check and show for administrator accounts
    if (!user || !isAdmin(user)) {
      return;
    }

    // Check localStorage dismissal first to avoid flickering
    if (localStorage.getItem('qunix_telemetry_prompt_dismissed') === 'true') {
      return;
    }

    const checkConsent = (settings: any) => {
      if (!settings) return;
      // If the database has already saved prompt dismissal, do not show
      if (settings.telemetry_prompt_dismissed === true) {
        try {
          localStorage.setItem('qunix_telemetry_prompt_dismissed', 'true');
        } catch (_) {}
        // If enabled, attempt daily background ping
        if (settings.enable_telemetry !== false) {
          sendTelemetryPing();
        }
        return;
      }

      // Database has NOT saved data yet -> show popup message
      setOpened(true);
    };

    // Check if settings already loaded in window
    if ((window as any).qunixThemeSettings) {
      checkConsent((window as any).qunixThemeSettings);
    } else {
      // Listen for settings load or query directly
      const handleLoaded = (e: CustomEvent) => {
        checkConsent(e.detail);
      };
      window.addEventListener('qunix-settings-loaded', handleLoaded as EventListener);

      axiosInstance
        .get('/api/dev.qunix.theme/settings')
        .then((res) => {
          if (res.data?.settings) {
            checkConsent(res.data.settings);
          }
        })
        .catch(() => {});

      return () => {
        window.removeEventListener('qunix-settings-loaded', handleLoaded as EventListener);
      };
    }
  }, [user]);

  if (!user || !isAdmin(user)) {
    return null;
  }

  const handleContinue = async () => {
    setLoading(true);
    try {
      let currentSettings = (window as any).qunixThemeSettings;
      if (!currentSettings || Object.keys(currentSettings).length === 0) {
        try {
          const res = await axiosInstance.get('/api/dev.qunix.theme/settings');
          currentSettings = res.data?.settings || {};
        } catch (_) {
          currentSettings = {};
        }
      }

      const updatedSettings = {
        ...currentSettings,
        enable_telemetry: enabled,
        telemetry_prompt_dismissed: true,
      };

      // Save choice to panel database (Admin API with fallback to public API)
      try {
        await axiosInstance.put('/api/admin/extensions/dev.qunix.theme/settings', updatedSettings);
      } catch (err) {
        try {
          await axiosInstance.put('/api/dev.qunix.theme/settings', updatedSettings);
        } catch (_) {}
      }

      // Update local storage and in-memory cache
      try {
        localStorage.setItem('qunix_telemetry_prompt_dismissed', 'true');
        localStorage.setItem('qunix_theme_settings', JSON.stringify(updatedSettings));
      } catch (_) {}
      (window as any).qunixThemeSettings = updatedSettings;
      window.dispatchEvent(new CustomEvent('qunix-settings-loaded', { detail: updatedSettings }));

      // If user agreed (checked), send telemetry ping immediately
      if (enabled) {
        await sendTelemetryPing(true);
      }

      setOpened(false);
    } catch (err) {
      console.error('Failed to save telemetry preference:', err);
      setOpened(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {}}
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
      centered
      size='md'
      title={
        <Group gap='xs'>
          <ThemeIcon color='violet' variant='light' size='md' radius='md'>
            <FontAwesomeIcon icon={faChartLine} />
          </ThemeIcon>
          <Text size='sm' fw={700} style={{ color: '#f4f4f5' }}>
            Qunix Extension Telemetry & Terms
          </Text>
        </Group>
      }
      styles={{
        header: {
          background: '#121217',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          color: '#f4f4f5',
          padding: '14px 18px',
        },
        content: {
          background: '#0d0d12',
          border: '1px solid rgba(108, 92, 231, 0.3)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          borderRadius: '14px',
          overflow: 'hidden',
          color: '#f4f4f5',
        },
        body: {
          padding: '18px',
        },
      }}
    >
      <Stack gap='md'>
        <Text size='xs' c='dimmed' style={{ lineHeight: 1.5 }}>
          We have added anonymous telemetry to the Qunix Theme extension. It helps us proactively diagnose compatibility issues across panel updates, fix bugs, improve performance, and make your panel experience better.
        </Text>

        <Paper
          p='sm'
          radius='md'
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Text size='xs' fw={700} c='violet.3' mb={6}>
            Anonymous Telemetry Policy (TOS)
          </Text>
          <Text size='xs' c='dimmed' mb={8}>
            To keep Calagopus fast and bug-free, only the following minimal technical metadata is collected:
          </Text>
          <Stack gap={6}>
            <Group gap='xs'>
              <Badge size='xs' variant='dot' color='blue'>Panel Version</Badge>
              <Text size='xs' c='dimmed'>Detects panel version updates & compatibility</Text>
            </Group>
            <Group gap='xs'>
              <Badge size='xs' variant='dot' color='teal'>Panel Type</Badge>
              <Text size='xs' c='dimmed'>Container deployment environment (e.g. docker, none)</Text>
            </Group>
            <Group gap='xs'>
              <Badge size='xs' variant='dot' color='grape'>Qunix Version</Badge>
              <Text size='xs' c='dimmed'>Extension version ({pkg.version || '1.5.0'})</Text>
            </Group>
          </Stack>
          <Text size='xs' c='dimmed' mt={8} style={{ fontSize: '10.5px' }}>
            🔒 <strong>Zero Personal Data:</strong> No passwords, IP addresses, server names, or user details are ever collected.
          </Text>
        </Paper>

        <Checkbox
          label={
            <Text size='xs' fw={600} style={{ color: '#f4f4f5' }}>
              Enable Anonymous Telemetry
            </Text>
          }
          description={
            <Text size='xs' c='dimmed' style={{ fontSize: '11px', marginTop: '2px' }}>
              You can turn this on or off anytime under Qunix Settings &gt; Backup &amp; Maintenance (Export / Import).
            </Text>
          }
          checked={enabled}
          onChange={(e) => setEnabled(e.currentTarget.checked)}
          color='violet'
          styles={{
            body: { alignItems: 'flex-start' },
          }}
        />

        <Button
          fullWidth
          onClick={handleContinue}
          loading={loading}
          color='violet'
          size='sm'
          radius='md'
          style={{
            background: '#6c5ce7',
            fontWeight: 600,
            marginTop: '4px',
          }}
        >
          Continue
        </Button>
      </Stack>
    </Modal>
  );
}
