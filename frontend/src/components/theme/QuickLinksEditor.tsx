import React, { useState } from 'react';
import {
  Stack,
  Group,
  TextInput,
  Switch,
  Select,
  Button,
  ActionIcon,
  Badge,
  Divider,
  Text,
  Card as MantineCard,
  Tooltip,
} from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faTrash,
  faArrowUp,
  faArrowDown,
  faRotateLeft,
  faBan,
  faPen,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import {
  QuickLinkItem,
  DEFAULT_QUICK_LINKS,
  QUICK_LINK_ICON_OPTIONS,
  getQuickLinkIcon,
} from './quickLinksConfig.ts';

interface QuickLinksEditorProps {
  links: QuickLinkItem[];
  onChange: (updated: QuickLinkItem[]) => void;
}

export const QuickLinksEditor: React.FC<QuickLinksEditorProps> = ({ links, onChange }) => {
  const [expandedId, setExpandedId] = useState<string | null>(links[0]?.id || null);

  const handleUpdate = (id: string, patch: Partial<QuickLinkItem>) => {
    const next = links.map((item) => (item.id === id ? { ...item, ...patch } : item));
    onChange(next);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= links.length) return;
    const next = [...links];
    const [moved] = next.splice(index, 1);
    next.splice(targetIdx, 0, moved);
    onChange(next);
  };

  const handleDelete = (id: string) => {
    const next = links.filter((l) => l.id !== id);
    onChange(next);
    if (expandedId === id) {
      setExpandedId(next[0]?.id || null);
    }
  };

  const handleAdd = () => {
    const newId = `quick-link-${Date.now()}`;
    const newItem: QuickLinkItem = {
      id: newId,
      title: 'New Quick Link',
      subtitle: 'Short description of this link.',
      url: '/',
      icon: 'globe',
      color: '#38bdf8',
      isPrimary: false,
      enabled: true,
      linkEnabled: true,
    };
    onChange([...links, newItem]);
    setExpandedId(newId);
  };

  const handleReset = () => {
    onChange([...DEFAULT_QUICK_LINKS]);
    setExpandedId(DEFAULT_QUICK_LINKS[0]?.id || null);
  };

  return (
    <Stack gap='sm'>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text size='xs' c='dimmed'>
          {links.length} card{links.length === 1 ? '' : 's'} configured. Toggle visibility or link state per card.
        </Text>
        <Group gap='xs'>
          <Button
            size='xs'
            variant='subtle'
            color='gray'
            leftSection={<FontAwesomeIcon icon={faRotateLeft} />}
            onClick={handleReset}
          >
            Reset Defaults
          </Button>
          <Button
            size='xs'
            variant='light'
            color='indigo'
            leftSection={<FontAwesomeIcon icon={faPlus} />}
            onClick={handleAdd}
          >
            Add Card
          </Button>
        </Group>
      </div>

      <Stack gap='xs'>
        {links.map((link, idx) => {
          const isExpanded = expandedId === link.id;
          const isEnabled = link.enabled !== false;
          const isLinkEnabled = link.linkEnabled !== false;

          return (
            <MantineCard
              key={link.id}
              withBorder
              radius='md'
              p='xs'
              style={{
                background: isExpanded ? 'rgba(30, 32, 45, 0.7)' : 'rgba(18, 20, 29, 0.5)',
                borderColor: isExpanded ? '#6c5ce7' : 'rgba(255, 255, 255, 0.08)',
                opacity: isEnabled ? 1 : 0.6,
                transition: 'all 0.15s ease',
              }}
            >
              {/* Card Summary Header Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={() => setExpandedId(isExpanded ? null : link.id)}
              >
                <Group gap='xs' style={{ flex: 1, minWidth: 0 }}>
                  <Group gap={4}>
                    <ActionIcon
                      size='xs'
                      variant='subtle'
                      color='gray'
                      disabled={idx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMove(idx, 'up');
                      }}
                    >
                      <FontAwesomeIcon icon={faArrowUp} style={{ fontSize: 10 }} />
                    </ActionIcon>
                    <ActionIcon
                      size='xs'
                      variant='subtle'
                      color='gray'
                      disabled={idx === links.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMove(idx, 'down');
                      }}
                    >
                      <FontAwesomeIcon icon={faArrowDown} style={{ fontSize: 10 }} />
                    </ActionIcon>
                  </Group>

                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      background: 'rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: link.color || '#38bdf8',
                    }}
                  >
                    <FontAwesomeIcon icon={getQuickLinkIcon(link.icon)} style={{ fontSize: 12 }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className='truncate' style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
                      {link.title || '(Untitled)'}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#94a3b8',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {link.subtitle || link.url || 'No URL'}
                    </div>
                  </div>

                  <Group gap={6}>
                    {link.isPrimary && (
                      <Badge
                        size='xs'
                        variant='light'
                        style={{
                          background: 'color-mix(in srgb, var(--ds-primary-color, var(--admin-accent, #6c5ce7)) 15%, transparent)',
                          color: 'color-mix(in srgb, var(--ds-primary-color, var(--admin-accent, #6c5ce7)) 85%, white)',
                          border: '1px solid color-mix(in srgb, var(--ds-primary-color, var(--admin-accent, #6c5ce7)) 35%, transparent)',
                        }}
                      >
                        Featured
                      </Badge>
                    )}
                    {!isEnabled && (
                      <Badge size='xs' color='red' variant='light'>
                        Card Hidden
                      </Badge>
                    )}
                    {!isLinkEnabled && (
                      <Badge size='xs' color='yellow' variant='light'>
                        Link Disabled
                      </Badge>
                    )}
                  </Group>
                </Group>

                <Group gap='xs' onClick={(e) => e.stopPropagation()}>
                  <Tooltip label={isEnabled ? 'Card is visible on dashboard' : 'Card is hidden on dashboard'}>
                    <Switch
                      size='xs'
                      color='teal'
                      checked={isEnabled}
                      onChange={(e) => handleUpdate(link.id, { enabled: e.currentTarget.checked })}
                    />
                  </Tooltip>

                  <ActionIcon
                    size='sm'
                    variant='subtle'
                    color={isExpanded ? 'indigo' : 'gray'}
                    onClick={() => setExpandedId(isExpanded ? null : link.id)}
                  >
                    <FontAwesomeIcon icon={faPen} style={{ fontSize: 11 }} />
                  </ActionIcon>

                  <ActionIcon
                    size='sm'
                    variant='subtle'
                    color='red'
                    onClick={() => handleDelete(link.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} style={{ fontSize: 11 }} />
                  </ActionIcon>
                </Group>
              </div>

              {/* Expanded Edit Form */}
              {isExpanded && (
                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <Stack gap='xs'>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <TextInput
                        label='Card Title'
                        size='xs'
                        placeholder='e.g. Billing'
                        value={link.title}
                        onChange={(e) => handleUpdate(link.id, { title: e.currentTarget.value })}
                      />
                      <TextInput
                        label='Target URL'
                        size='xs'
                        placeholder='e.g. /billing or https://...'
                        value={link.url}
                        onChange={(e) => handleUpdate(link.id, { url: e.currentTarget.value })}
                      />
                    </div>

                    <TextInput
                      label='Subtitle / Description'
                      size='xs'
                      placeholder='e.g. Invoices, plans and payment.'
                      value={link.subtitle}
                      onChange={(e) => handleUpdate(link.id, { subtitle: e.currentTarget.value })}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <Select
                        label='Icon'
                        size='xs'
                        data={QUICK_LINK_ICON_OPTIONS}
                        value={link.icon || 'globe'}
                        onChange={(val) => handleUpdate(link.id, { icon: val || 'globe' })}
                        allowDeselect={false}
                        comboboxProps={{ withinPortal: true, zIndex: 10001 }}
                      />
                      <TextInput
                        label='Accent Color'
                        size='xs'
                        placeholder='#0284c7'
                        value={link.color || '#38bdf8'}
                        onChange={(e) => handleUpdate(link.id, { color: e.currentTarget.value })}
                      />
                    </div>

                    <Divider my={4} color='rgba(255, 255, 255, 0.06)' />

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                      <Switch
                        size='xs'
                        color='teal'
                        label='Card Visible on Dashboard'
                        description='If disabled, this card is hidden from normal view'
                        checked={isEnabled}
                        onChange={(e) => handleUpdate(link.id, { enabled: e.currentTarget.checked })}
                      />

                      <Switch
                        size='xs'
                        color='indigo'
                        label='Link Clickable'
                        description='If disabled, card is informational only (no link navigation)'
                        checked={isLinkEnabled}
                        onChange={(e) => handleUpdate(link.id, { linkEnabled: e.currentTarget.checked })}
                      />

                      <Switch
                        size='xs'
                        color='var(--ds-primary-color, var(--admin-accent, #6c5ce7))'
                        label='Featured Card'
                        description='Highlights card as primary featured action'
                        checked={Boolean(link.isPrimary)}
                        onChange={(e) => handleUpdate(link.id, { isPrimary: e.currentTarget.checked })}
                      />
                    </div>
                  </Stack>
                </div>
              )}
            </MantineCard>
          );
        })}
      </Stack>
    </Stack>
  );
};
