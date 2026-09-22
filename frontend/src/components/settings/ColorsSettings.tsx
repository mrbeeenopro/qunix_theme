import React from 'react';
import { Stack, Group, Tabs } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { z } from 'zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPalette,
  faCogs,
  faRoute,
  faSliders,
  faBolt,
  faTerminal,
  faChartLine,
} from '@fortawesome/free-solid-svg-icons';
import { useToast } from '@/providers/ToastProvider.tsx';
import { qunixThemeSettingsSchema } from '../../lib/schemas.ts';
import { ColorField } from './ColorField.tsx';
import { hslToHex, PRESETS } from './colorUtils.ts';
import { useExtTranslations } from '../../translations.ts';

interface ColorsSettingsProps {
  form: UseFormReturnType<z.infer<typeof qunixThemeSettingsSchema>>;
}

export function ColorsSettings({ form }: ColorsSettingsProps) {
  const { addToast } = useToast();
  const { t: tExt } = useExtTranslations();
  const [activeTab, setActiveTab] = React.useState<string>('dark');

  const applyPreset = (preset: any) => {
    const normalizedPreset: any = {};
    if (preset.values) {
      for (const k in preset.values) {
        normalizedPreset[k] = typeof preset.values[k] === 'string' ? hslToHex(preset.values[k]) : preset.values[k];
      }
    }
    if (preset.lightValues) {
      for (const k in preset.lightValues) {
        normalizedPreset[k] = typeof preset.lightValues[k] === 'string' ? hslToHex(preset.lightValues[k]) : preset.lightValues[k];
      }
    }
    form.setValues({
      ...form.values,
      ...normalizedPreset,
    });
    addToast(tExt('admin.toasts.presetApplied', { name: preset.name }), 'success');
  };

  return (
    <>
      {/* Presets */}
      <div
        style={{ background: '#0b0b0d', padding: '16px', borderRadius: '8px', border: '1px solid #141418' }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'block',
            marginBottom: '10px',
            color: '#a29bfe',
          }}
        >
          <FontAwesomeIcon icon={faCogs} style={{ marginRight: '6px' }} />
          {tExt('admin.colors.presets', {})}
        </span>
        <Group gap='xs' className='presets-group'>
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type='button'
              onClick={() => applyPreset(preset)}
              title={preset.name}
              style={{
                padding: '6px 8px',
                fontSize: '10px',
                border: '1px solid #2d2d30',
                borderRadius: '6px',
                background: '#09090a',
                color: '#e2e8f0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span style={{ display: 'flex', gap: '2px' }}>
                {preset.colors.map((c, idx) => (
                  <span
                    key={idx}
                    style={{ width: '6px', height: '6px', background: c, borderRadius: '50%' }}
                  />
                ))}
              </span>
              {preset.name}
            </button>
          ))}
        </Group>
      </div>

      <Tabs value={activeTab} onChange={(val) => setActiveTab(val || 'dark')} variant='pills' classNames={{ list: 'mb-3' }}>
        <Tabs.List>
          <Tabs.Tab value='dark'>{tExt('admin.colors.darkTab', {})}</Tabs.Tab>
          <Tabs.Tab value='light'>{tExt('admin.colors.lightTab', {})}</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value='dark'>
          <Stack gap='md'>
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
                <FontAwesomeIcon icon={faPalette} style={{ marginRight: '6px' }} />
                {tExt('admin.colors.baseColors', {})}
              </span>
              <Stack gap='xs'>
                <ColorField label={tExt('admin.colors.fields.background', {})} {...form.getInputProps('background_color')} />
                <ColorField label={tExt('admin.colors.fields.text', {})} {...form.getInputProps('text_color')} />
                <ColorField label={tExt('admin.colors.fields.focusAccent', {})} {...form.getInputProps('focus_color')} />
                <ColorField label={tExt('admin.colors.fields.cardBgDark6', {})} {...form.getInputProps('dark_6_color')} />
                <ColorField label={tExt('admin.colors.fields.overlayBgDark7', {})} {...form.getInputProps('dark_7_color')} />
                <ColorField label={tExt('admin.colors.fields.border', {})} {...form.getInputProps('border_color')} />
              </Stack>
            </div>

            {/* Subheading: Navigation Menu */}
            <div style={{ borderTop: '1px solid #141418', paddingTop: '12px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'block',
                  color: '#a29bfe',
                  marginBottom: '8px',
                }}
              >
                <FontAwesomeIcon icon={faRoute} style={{ marginRight: '6px' }} />
                {tExt('admin.colors.navigationMenu', {})}
              </span>
              <Stack gap='xs'>
                <ColorField label={tExt('admin.colors.fields.sidebarBg', {})} {...form.getInputProps('sidebar_color')} />
                <ColorField label={tExt('admin.colors.fields.navbarBg', {})} {...form.getInputProps('navbar_color')} />
                <ColorField label={tExt('admin.colors.fields.chromeToolbar', {})} {...form.getInputProps('chrome_toolbar_color')} />
                <ColorField label={tExt('admin.colors.fields.activeLinkText', {})} {...form.getInputProps('sidebar_active_color')} />
                <ColorField label={tExt('admin.colors.fields.activeLinkBg', {})} {...form.getInputProps('sidebar_active_bg')} />
                <ColorField label={tExt('admin.colors.fields.quickActionsBg', {})} {...form.getInputProps('quick_actions_bg')} />
                <ColorField label={tExt('admin.colors.fields.quickActionsText', {})} {...form.getInputProps('quick_actions_text_color')} />
                <ColorField label={tExt('admin.colors.fields.quickActionsBorder', {})} {...form.getInputProps('quick_actions_border_color')} />
              </Stack>
            </div>

            {/* Subheading: UI Cards & Controls */}
            <div style={{ borderTop: '1px solid #141418', paddingTop: '12px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'block',
                  color: '#a29bfe',
                  marginBottom: '8px',
                }}
              >
                <FontAwesomeIcon icon={faSliders} style={{ marginRight: '6px' }} />
                {tExt('admin.colors.uiCardsControls', {})}
              </span>
              <Stack gap='xs'>
                <ColorField label={tExt('admin.colors.fields.cardBg', {})} {...form.getInputProps('card_color')} />
                <ColorField label={tExt('admin.colors.fields.miniCardBg', {})} {...form.getInputProps('mini_card_bg_color')} />
                <ColorField label={tExt('admin.colors.fields.popupWindowBorder', {})} {...form.getInputProps('popup_window_border_color')} />
                <ColorField label={tExt('admin.colors.fields.inputBg', {})} {...form.getInputProps('input_color')} />
                <ColorField label={tExt('admin.colors.fields.buttonBg', {})} {...form.getInputProps('button_color')} />
                <ColorField label={tExt('admin.colors.fields.listingBg', {})} {...form.getInputProps('listing_color')} />
              </Stack>
            </div>

            {/* Subheading: Interactive & Server Actions */}
            <div style={{ borderTop: '1px solid #141418', paddingTop: '12px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'block',
                  color: '#a29bfe',
                  marginBottom: '8px',
                }}
              >
                <FontAwesomeIcon icon={faBolt} style={{ marginRight: '6px' }} />
                {tExt('admin.colors.serverActions', {})}
              </span>
              <Stack gap='xs'>
                <ColorField label={tExt('admin.colors.fields.consoleActionBg', {})} {...form.getInputProps('server_action_bg')} />
                <ColorField label={tExt('admin.colors.fields.consoleStart', {})} {...form.getInputProps('power_start_bg')} />
                <ColorField label={tExt('admin.colors.fields.consoleRestart', {})} {...form.getInputProps('power_restart_bg')} />
                <ColorField label={tExt('admin.colors.fields.consoleStop', {})} {...form.getInputProps('power_stop_bg')} />
              </Stack>
            </div>

            {/* Subheading: Console & Code Editor */}
            <div style={{ borderTop: '1px solid #141418', paddingTop: '12px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'block',
                  color: '#a29bfe',
                  marginBottom: '8px',
                }}
              >
                <FontAwesomeIcon icon={faTerminal} style={{ marginRight: '6px' }} />
                {tExt('admin.colors.consoleEditor', {})}
              </span>
              <Stack gap='xs'>
                <ColorField label={tExt('admin.colors.fields.terminalBg', {})} {...form.getInputProps('terminal_color')} />
                <ColorField label={tExt('admin.colors.fields.terminalText', {})} {...form.getInputProps('terminal_text_color')} />
                <ColorField label={tExt('admin.colors.fields.terminalCursor', {})} {...form.getInputProps('terminal_cursor_color')} />
                <ColorField
                  label={tExt('admin.colors.fields.terminalSelection', {})}
                  {...form.getInputProps('terminal_selection_color')}
                />
                <ColorField label={tExt('admin.colors.fields.editorBg', {})} {...form.getInputProps('editor_color')} />
                <ColorField label={tExt('admin.colors.fields.editorText', {})} {...form.getInputProps('editor_text_color')} />
              </Stack>
            </div>

            {/* Subheading: Console Charts */}
            <div style={{ borderTop: '1px solid #141418', paddingTop: '12px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'block',
                  color: '#a29bfe',
                  marginBottom: '8px',
                }}
              >
                <FontAwesomeIcon icon={faChartLine} style={{ marginRight: '6px' }} />
                {tExt('admin.colors.consoleCharts', {})}
              </span>
              <Stack gap='xs'>
                <ColorField
                  label={tExt('admin.colors.fields.chartSeries1Border', {})}
                  {...form.getInputProps('chart_series_1_border')}
                />
                <ColorField label={tExt('admin.colors.fields.chartSeries1Fill', {})} {...form.getInputProps('chart_series_1_fill')} />
                <ColorField
                  label={tExt('admin.colors.fields.chartSeries2Border', {})}
                  {...form.getInputProps('chart_series_2_border')}
                />
                <ColorField label={tExt('admin.colors.fields.chartSeries2Fill', {})} {...form.getInputProps('chart_series_2_fill')} />
              </Stack>
            </div>

            {/* Subheading: Terminal ANSI Colors */}
            <div style={{ borderTop: '1px solid #141418', paddingTop: '12px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'block',
                  color: '#a29bfe',
                  marginBottom: '8px',
                }}
              >
                <FontAwesomeIcon icon={faPalette} style={{ marginRight: '6px' }} />
                {tExt('admin.colors.terminalAnsi', {})}
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                <ColorField label={tExt('admin.colors.fields.ansiBlack', {})} {...form.getInputProps('terminal_ansi_black')} />
                <ColorField label={tExt('admin.colors.fields.ansiRed', {})} {...form.getInputProps('terminal_ansi_red')} />
                <ColorField label={tExt('admin.colors.fields.ansiGreen', {})} {...form.getInputProps('terminal_ansi_green')} />
                <ColorField label={tExt('admin.colors.fields.ansiYellow', {})} {...form.getInputProps('terminal_ansi_yellow')} />
                <ColorField label={tExt('admin.colors.fields.ansiBlue', {})} {...form.getInputProps('terminal_ansi_blue')} />
                <ColorField label={tExt('admin.colors.fields.ansiMagenta', {})} {...form.getInputProps('terminal_ansi_magenta')} />
                <ColorField label={tExt('admin.colors.fields.ansiCyan', {})} {...form.getInputProps('terminal_ansi_cyan')} />
                <ColorField label={tExt('admin.colors.fields.ansiWhite', {})} {...form.getInputProps('terminal_ansi_white')} />
              </div>
            </div>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value='light'>
          <Stack gap='md'>
            {/* Subheading: Base Colors */}
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
                <FontAwesomeIcon icon={faPalette} style={{ marginRight: '6px' }} />
                {tExt('admin.colors.baseColorsLight', {})}
              </span>
              <Stack gap='xs'>
                <ColorField label={tExt('admin.colors.fields.background', {})} {...form.getInputProps('light_background_color')} />
                <ColorField label={tExt('admin.colors.fields.text', {})} {...form.getInputProps('light_text_color')} />
                <ColorField label={tExt('admin.colors.fields.focusAccent', {})} {...form.getInputProps('light_focus_color')} />
                <ColorField label={tExt('admin.colors.fields.cardBgDark6', {})} {...form.getInputProps('light_dark_6_color')} />
                <ColorField label={tExt('admin.colors.fields.overlayBgDark7', {})} {...form.getInputProps('light_dark_7_color')} />
                <ColorField label={tExt('admin.colors.fields.border', {})} {...form.getInputProps('light_border_color')} />
              </Stack>
            </div>

            {/* Subheading: Navigation Menu */}
            <div style={{ borderTop: '1px solid #141418', paddingTop: '12px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'block',
                  color: '#a29bfe',
                  marginBottom: '8px',
                }}
              >
                <FontAwesomeIcon icon={faRoute} style={{ marginRight: '6px' }} />
                {tExt('admin.colors.navigationMenuLight', {})}
              </span>
              <Stack gap='xs'>
                <ColorField label={tExt('admin.colors.fields.sidebarBg', {})} {...form.getInputProps('light_sidebar_color')} />
                <ColorField label={tExt('admin.colors.fields.navbarBg', {})} {...form.getInputProps('light_navbar_color')} />
                <ColorField label={tExt('admin.colors.fields.chromeToolbar', {})} {...form.getInputProps('light_chrome_toolbar_color')} />
                <ColorField
                  label={tExt('admin.colors.fields.activeLinkText', {})}
                  {...form.getInputProps('light_sidebar_active_color')}
                />
                <ColorField label={tExt('admin.colors.fields.activeLinkBg', {})} {...form.getInputProps('light_sidebar_active_bg')} />
                <ColorField label={tExt('admin.colors.fields.quickActionsBg', {})} {...form.getInputProps('light_quick_actions_bg')} />
                <ColorField label={tExt('admin.colors.fields.quickActionsText', {})} {...form.getInputProps('light_quick_actions_text_color')} />
                <ColorField label={tExt('admin.colors.fields.quickActionsBorder', {})} {...form.getInputProps('light_quick_actions_border_color')} />
              </Stack>
            </div>

            {/* Subheading: UI Cards & Controls */}
            <div style={{ borderTop: '1px solid #141418', paddingTop: '12px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'block',
                  color: '#a29bfe',
                  marginBottom: '8px',
                }}
              >
                <FontAwesomeIcon icon={faSliders} style={{ marginRight: '6px' }} />
                {tExt('admin.colors.uiCardsControlsLight', {})}
              </span>
              <Stack gap='xs'>
                <ColorField label={tExt('admin.colors.fields.cardBg', {})} {...form.getInputProps('light_card_color')} />
                <ColorField label={tExt('admin.colors.fields.miniCardBg', {})} {...form.getInputProps('light_mini_card_bg_color')} />
                <ColorField label={tExt('admin.colors.fields.popupWindowBorder', {})} {...form.getInputProps('light_popup_window_border_color')} />
                <ColorField label={tExt('admin.colors.fields.inputBg', {})} {...form.getInputProps('light_input_color')} />
                <ColorField label={tExt('admin.colors.fields.buttonBg', {})} {...form.getInputProps('light_button_color')} />
                <ColorField label={tExt('admin.colors.fields.listingBg', {})} {...form.getInputProps('light_listing_color')} />
              </Stack>
            </div>

            {/* Subheading: Interactive & Server Actions */}
            <div style={{ borderTop: '1px solid #141418', paddingTop: '12px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'block',
                  color: '#a29bfe',
                  marginBottom: '8px',
                }}
              >
                <FontAwesomeIcon icon={faBolt} style={{ marginRight: '6px' }} />
                {tExt('admin.colors.serverActionsLight', {})}
              </span>
              <Stack gap='xs'>
                <ColorField label={tExt('admin.colors.fields.consoleActionBg', {})} {...form.getInputProps('light_server_action_bg')} />
                <ColorField label={tExt('admin.colors.fields.consoleStart', {})} {...form.getInputProps('light_power_start_bg')} />
                <ColorField label={tExt('admin.colors.fields.consoleRestart', {})} {...form.getInputProps('light_power_restart_bg')} />
                <ColorField label={tExt('admin.colors.fields.consoleStop', {})} {...form.getInputProps('light_power_stop_bg')} />
              </Stack>
            </div>

            {/* Subheading: Console & Code Editor */}
            <div style={{ borderTop: '1px solid #141418', paddingTop: '12px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'block',
                  color: '#a29bfe',
                  marginBottom: '8px',
                }}
              >
                <FontAwesomeIcon icon={faTerminal} style={{ marginRight: '6px' }} />
                {tExt('admin.colors.consoleEditorLight', {})}
              </span>
              <Stack gap='xs'>
                <ColorField label={tExt('admin.colors.fields.terminalBg', {})} {...form.getInputProps('light_terminal_color')} />
                <ColorField label={tExt('admin.colors.fields.terminalText', {})} {...form.getInputProps('light_terminal_text_color')} />
                <ColorField
                  label={tExt('admin.colors.fields.terminalCursor', {})}
                  {...form.getInputProps('light_terminal_cursor_color')}
                />
                <ColorField
                  label={tExt('admin.colors.fields.terminalSelection', {})}
                  {...form.getInputProps('light_terminal_selection_color')}
                />
                <ColorField label={tExt('admin.colors.fields.editorBg', {})} {...form.getInputProps('light_editor_color')} />
                <ColorField label={tExt('admin.colors.fields.editorText', {})} {...form.getInputProps('light_editor_text_color')} />
              </Stack>
            </div>

            {/* Subheading: Console Charts (Light) */}
            <div style={{ borderTop: '1px solid #141418', paddingTop: '12px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'block',
                  color: '#a29bfe',
                  marginBottom: '8px',
                }}
              >
                <FontAwesomeIcon icon={faChartLine} style={{ marginRight: '6px' }} />
                {tExt('admin.colors.consoleChartsLight', {})}
              </span>
              <Stack gap='xs'>
                <ColorField
                  label={tExt('admin.colors.fields.chartSeries1Border', {})}
                  {...form.getInputProps('light_chart_series_1_border')}
                />
                <ColorField
                  label={tExt('admin.colors.fields.chartSeries1Fill', {})}
                  {...form.getInputProps('light_chart_series_1_fill')}
                />
                <ColorField
                  label={tExt('admin.colors.fields.chartSeries2Border', {})}
                  {...form.getInputProps('light_chart_series_2_border')}
                />
                <ColorField
                  label={tExt('admin.colors.fields.chartSeries2Fill', {})}
                  {...form.getInputProps('light_chart_series_2_fill')}
                />
              </Stack>
            </div>

            {/* Subheading: Terminal ANSI Colors */}
            <div style={{ borderTop: '1px solid #141418', paddingTop: '12px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'block',
                  color: '#a29bfe',
                  marginBottom: '8px',
                }}
              >
                <FontAwesomeIcon icon={faPalette} style={{ marginRight: '6px' }} />
                {tExt('admin.colors.terminalAnsiLight', {})}
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                <ColorField label={tExt('admin.colors.fields.ansiBlack', {})} {...form.getInputProps('light_terminal_ansi_black')} />
                <ColorField label={tExt('admin.colors.fields.ansiRed', {})} {...form.getInputProps('light_terminal_ansi_red')} />
                <ColorField label={tExt('admin.colors.fields.ansiGreen', {})} {...form.getInputProps('light_terminal_ansi_green')} />
                <ColorField label={tExt('admin.colors.fields.ansiYellow', {})} {...form.getInputProps('light_terminal_ansi_yellow')} />
                <ColorField label={tExt('admin.colors.fields.ansiBlue', {})} {...form.getInputProps('light_terminal_ansi_blue')} />
                <ColorField label={tExt('admin.colors.fields.ansiMagenta', {})} {...form.getInputProps('light_terminal_ansi_magenta')} />
                <ColorField label={tExt('admin.colors.fields.ansiCyan', {})} {...form.getInputProps('light_terminal_ansi_cyan')} />
                <ColorField label={tExt('admin.colors.fields.ansiWhite', {})} {...form.getInputProps('light_terminal_ansi_white')} />
              </div>
            </div>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </>
  );
}
