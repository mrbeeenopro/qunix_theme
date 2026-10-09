import { axiosInstance } from '@/api/axios.ts';
import pkg from '../../package.json';

const TELEMETRY_URL = 'https://telemetry-qunix.mrbeenopro.workers.dev/api/telemetry';
const LAST_PING_KEY = 'qunix_last_telemetry_ping';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export async function sendTelemetryPing(force = false): Promise<boolean> {
  // Check if disabled by settings
  const rawSettings = (window as any).qunixThemeSettings || (() => {
    try {
      return JSON.parse(localStorage.getItem('qunix_theme_settings') || '{}');
    } catch (_) {
      return {};
    }
  })();

  if (rawSettings && rawSettings.enable_telemetry === false) {
    return false;
  }

  // 24-hour throttling
  const lastPing = localStorage.getItem(LAST_PING_KEY);
  if (!force && lastPing && Date.now() - parseInt(lastPing, 10) < ONE_DAY_MS) {
    return false;
  }

  let panelVersion = 'unknown';
  let containerType = 'none';
  let panelUuid = '';

  // 1. Fetch exact panel instance data via panel admin telemetry endpoint
  try {
    const res = await axiosInstance.get('/api/admin/system/telemetry');
    if (res.data?.telemetry) {
      panelUuid = res.data.telemetry.uuid || '';
      if (res.data.telemetry.panel) {
        panelVersion = res.data.telemetry.panel.version || 'unknown';
        containerType = res.data.telemetry.panel.container_type || 'none';
      }
    }
  } catch (_) {
    // 2. Fallback to system overview if telemetry endpoint fails
    try {
      const ovRes = await axiosInstance.get('/api/admin/system/overview');
      if (ovRes.data) {
        panelVersion = ovRes.data.version || 'unknown';
        containerType = ovRes.data.containerType || 'none';
      }
    } catch (__) {
      panelVersion = (window as any).Calagopus?.version || 'unknown';
    }
  }

  // Stable anonymous UUID fallback
  if (!panelUuid) {
    panelUuid = localStorage.getItem('qunix_panel_uuid') || '';
    if (!panelUuid) {
      panelUuid =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : '00000000-0000-4000-8000-' + Math.random().toString(16).substring(2, 14);
      try {
        localStorage.setItem('qunix_panel_uuid', panelUuid);
      } catch (_) {}
    }
  }

  // Strictly minimal payload: only panel version, panel container type, and qunix version
  const payload = {
    uuid: panelUuid,
    panel: {
      version: panelVersion,
      container_type: containerType,
    },
    extension: {
      package_name: 'dev.qunix.theme',
      name: 'Qunix Theme',
      version: pkg.version || '1.5.0',
    },
  };

  try {
    const workerRes = await fetch(TELEMETRY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (workerRes.ok) {
      try {
        localStorage.setItem(LAST_PING_KEY, Date.now().toString());
      } catch (_) {}
      return true;
    }
  } catch (_) {
    // Silently handle any network errors
  }

  return false;
}
