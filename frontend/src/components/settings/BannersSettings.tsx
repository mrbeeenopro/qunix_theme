import React, { useState, useMemo, useEffect } from 'react';
import {
  Stack,
  TextInput,
  Badge,
  Button,
  ActionIcon,
  Modal,
  Group,
} from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { z } from 'zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFolder,
  faFolderOpen,
  faImage,
  faImages,
  faMagnifyingGlass,
  faXmark,
  faWandMagicSparkles,
  faChevronDown,
  faChevronRight,
  faTrash,
  faLayerGroup,
} from '@fortawesome/free-solid-svg-icons';
import { axiosInstance } from '@/api/axios.ts';
import { qunixThemeSettingsSchema } from '../../lib/schemas.ts';

export interface BannerPreset {
  id: string;
  title: string;
  category: string;
  url: string;
  tags: string[];
}

export const BANNER_PRESETS: BannerPreset[] = [
  {
    id: 'mc-hero',
    title: 'Minecraft Hero',
    category: 'minecraft',
    url: 'https://xgamingserver.com/img/game-images/minecraft-hero.webp',
    tags: ['minecraft', 'paper', 'spigot', 'vanilla', 'purpur', 'forge', 'fabric', 'bedrock', 'mc'],
  },
  {
    id: 'mc-caves',
    title: 'Minecraft Caves & Cliffs',
    category: 'minecraft',
    url: 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=1200&auto=format&fit=crop&q=80',
    tags: ['minecraft', 'caves', 'cliffs', 'adventure'],
  },
  {
    id: 'rust',
    title: 'Rust Survival',
    category: 'rust',
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
    tags: ['rust', 'survival', 'pvp', 'fps'],
  },
  {
    id: 'cyber-neon',
    title: 'Cyber Gaming Dark',
    category: 'general',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    tags: ['cyber', 'neon', 'general', 'tech', 'dark'],
  },
  {
    id: 'space-nebula',
    title: 'Deep Space Nebula',
    category: 'general',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200&auto=format&fit=crop&q=80',
    tags: ['space', 'nebula', 'cosmic', 'abstract', 'purple'],
  },
];

interface BannersSettingsProps {
  form: UseFormReturnType<z.infer<typeof qunixThemeSettingsSchema>>;
  nests: any[];
}

export function BannersSettings({ form, nests }: BannersSettingsProps) {
  const [internalNests, setInternalNests] = useState<any[]>(nests);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedNests, setCollapsedNests] = useState<Record<string, boolean>>({});

  // Synchronize with parent nests prop
  useEffect(() => {
    if (nests && nests.length > 0) {
      setInternalNests(nests);
    }
  }, [nests]);

  // If internalNests is empty or any nest lacks eggs, fetch missing eggs automatically
  useEffect(() => {
    let isMounted = true;

    const loadEggsIfNeeded = async () => {
      if (!internalNests || internalNests.length === 0) {
        try {
          const res = await axiosInstance.get('/api/admin/nests', { params: { per_page: 100 } });
          const nestList = res.data?.nests?.data || res.data?.nests || [];
          const full = await Promise.all(
            nestList.map(async (nest: any) => {
              try {
                const eggsRes = await axiosInstance.get(`/api/admin/nests/${nest.uuid}/eggs`, { params: { per_page: 100 } });
                const eggs = eggsRes.data?.eggs?.data || eggsRes.data?.eggs || [];
                return { nest, eggs };
              } catch {
                return { nest, eggs: [] };
              }
            }),
          );
          if (isMounted && full.length > 0) {
            setInternalNests(full);
          }
        } catch (e) {
          console.error('Failed to load nests in BannersSettings:', e);
        }
        return;
      }

      const needsEggs = internalNests.some((n: any) => !n.eggs || n.eggs.length === 0);
      if (needsEggs) {
        const enriched = await Promise.all(
          internalNests.map(async (n: any) => {
            if (n.eggs && n.eggs.length > 0) return n;
            try {
              const eggsRes = await axiosInstance.get(`/api/admin/nests/${n.nest.uuid}/eggs`, { params: { per_page: 100 } });
              const eggs = eggsRes.data?.eggs?.data || eggsRes.data?.eggs || [];
              return { ...n, eggs };
            } catch {
              return n;
            }
          }),
        );
        if (isMounted) {
          setInternalNests(enriched);
        }
      }
    };

    loadEggsIfNeeded();
    return () => {
      isMounted = false;
    };
  }, [internalNests.length]);

  // Preset picker modal state
  const [pickerTarget, setPickerTarget] = useState<{ id: string; name: string } | null>(null);
  const [pickerCategory, setPickerCategory] = useState<string>('all');
  const [pickerSearch, setPickerSearch] = useState('');

  const toggleNestCollapse = (nestUuid: string) => {
    setCollapsedNests((prev) => ({
      ...prev,
      [nestUuid]: !prev[nestUuid],
    }));
  };

  const handleSetBanner = (id: string, url: string) => {
    const updated = { ...(form.values.egg_banners || {}) };
    if (!url || !url.trim()) {
      delete updated[id];
    } else {
      updated[id] = url.trim();
    }
    form.setFieldValue('egg_banners', updated);
  };

  const handleClearBanner = (id: string) => {
    handleSetBanner(id, '');
  };

  // Filter nests and eggs by search query
  const filteredNests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return internalNests;

    return internalNests
      .map((n) => {
        const nestMatch = n.nest?.name?.toLowerCase().includes(q) || n.nest?.uuid?.toLowerCase().includes(q);
        const matchedEggs = (n.eggs || []).filter(
          (e: any) =>
            e.name?.toLowerCase().includes(q) ||
            e.uuid?.toLowerCase().includes(q) ||
            (e.description && e.description.toLowerCase().includes(q)),
        );
        if (nestMatch) return n;
        if (matchedEggs.length > 0) {
          return { ...n, eggs: matchedEggs };
        }
        return null;
      })
      .filter(Boolean);
  }, [internalNests, searchQuery]);

  // Count configured eggs
  const { totalEggs, configuredEggs } = useMemo(() => {
    let total = 0;
    let configured = 0;
    const eggBanners = form.values.egg_banners || {};
    for (const n of internalNests) {
      for (const e of n.eggs || []) {
        total++;
        if (eggBanners[e.uuid] || eggBanners[n.nest?.uuid]) {
          configured++;
        }
      }
    }
    return { totalEggs: total, configuredEggs: configured };
  }, [internalNests, form.values.egg_banners]);

  // Filter presets for modal
  const filteredPresets = useMemo(() => {
    return BANNER_PRESETS.filter((p) => {
      const matchCat = pickerCategory === 'all' || p.category === pickerCategory;
      const matchQuery =
        !pickerSearch.trim() ||
        p.title.toLowerCase().includes(pickerSearch.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(pickerSearch.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [pickerCategory, pickerSearch]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    BANNER_PRESETS.forEach((p) => cats.add(p.category));
    return ['all', ...Array.from(cats)];
  }, []);

  return (
    <>
      {/* Header bar without redundant buttons */}
      <div
        style={{
          background: 'linear-gradient(145deg, rgba(24, 24, 27, 0.7) 0%, rgba(15, 15, 18, 0.9) 100%)',
          border: '1px solid #27272a',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '20px',
        }}
      >
        <Group justify='space-between' align='center' wrap='wrap' gap='md'>
          <div>
            <Group gap='xs' align='center'>
              <span style={{ color: '#818cf8', fontSize: '15px' }}>
                <FontAwesomeIcon icon={faImages} />
              </span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#f4f4f5' }}>
                Egg Banners
              </span>
              <Badge
                variant='light'
                color={configuredEggs > 0 ? 'indigo' : 'gray'}
                size='sm'
                style={{ fontWeight: 600 }}
              >
                {configuredEggs} / {totalEggs} Configured
              </Badge>
            </Group>
            <span style={{ fontSize: '12px', color: '#a1a1aa', display: 'block', marginTop: '4px' }}>
              Assign custom banner images to eggs and nests. Supported on server cards and console header.
            </span>
          </div>
        </Group>

        {/* Search Input */}
        <div style={{ marginTop: '14px' }}>
          <TextInput
            placeholder='Search eggs or nests by name or UUID...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            leftSection={<FontAwesomeIcon icon={faMagnifyingGlass} style={{ color: '#71717a', fontSize: '12px' }} />}
            rightSection={
              searchQuery ? (
                <ActionIcon size='xs' variant='transparent' onClick={() => setSearchQuery('')}>
                  <FontAwesomeIcon icon={faXmark} style={{ color: '#a1a1aa' }} />
                </ActionIcon>
              ) : null
            }
            styles={{
              input: {
                background: '#121215',
                border: '1px solid #27272a',
                color: '#f4f4f5',
                fontSize: '12px',
                height: '36px',
              },
            }}
          />
        </div>
      </div>

      {/* Nest List */}
      {filteredNests.length === 0 ? (
        <div
          style={{
            padding: '36px 20px',
            textAlign: 'center',
            background: '#121215',
            border: '1px dashed #27272a',
            borderRadius: '10px',
          }}
        >
          <FontAwesomeIcon icon={faFolder} style={{ fontSize: '24px', color: '#52525b', marginBottom: '8px' }} />
          <div style={{ fontSize: '13px', color: '#a1a1aa' }}>
            {internalNests.length === 0 ? 'No nests loaded from API' : 'No nests or eggs match your search'}
          </div>
        </div>
      ) : (
        <Stack gap='md'>
          {filteredNests.map((n: any) => {
            const nestUuid = n.nest.uuid;
            const nestName = n.nest.name;
            const isCollapsed = !!collapsedNests[nestUuid];
            const nestBannerUrl = form.values.egg_banners?.[nestUuid] || '';

            const nestConfiguredCount = (n.eggs || []).filter(
              (e: any) => form.values.egg_banners?.[e.uuid] || nestBannerUrl,
            ).length;

            return (
              <div
                key={nestUuid}
                style={{
                  background: '#121215',
                  border: '1px solid #27272a',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease',
                }}
              >
                {/* Nest Header - simple click to expand/collapse */}
                <div
                  style={{
                    padding: '12px 16px',
                    background: '#18181b',
                    borderBottom: isCollapsed ? 'none' : '1px solid #27272a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                  onClick={() => toggleNestCollapse(nestUuid)}
                >
                  <Group gap='sm' align='center'>
                    <span style={{ color: '#818cf8', fontSize: '13px' }}>
                      <FontAwesomeIcon icon={isCollapsed ? faFolder : faFolderOpen} />
                    </span>
                    <Group gap='xs' align='center'>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#f4f4f5' }}>
                        {nestName}
                      </span>
                      <Badge size='xs' variant='outline' color='gray' style={{ fontWeight: 500 }}>
                        {n.eggs?.length || 0} {n.eggs?.length === 1 ? 'Egg' : 'Eggs'}
                      </Badge>
                      {nestConfiguredCount > 0 && (
                        <Badge size='xs' variant='light' color='indigo' style={{ fontWeight: 500 }}>
                          {nestConfiguredCount} configured
                        </Badge>
                      )}
                    </Group>
                  </Group>

                  <FontAwesomeIcon
                    icon={isCollapsed ? faChevronRight : faChevronDown}
                    style={{ color: '#71717a', fontSize: '12px' }}
                  />
                </div>

                {/* Nest Content */}
                {!isCollapsed && (
                  <div style={{ padding: '16px' }}>
                    {/* Nest Default Banner Section */}
                    <div
                      style={{
                        background: 'rgba(24, 24, 27, 0.6)',
                        border: '1px solid #27272a',
                        borderRadius: '8px',
                        padding: '12px 14px',
                        marginBottom: '16px',
                      }}
                    >
                      <Group justify='space-between' align='center' mb='xs' wrap='wrap'>
                        <Group gap='xs' align='center'>
                          <FontAwesomeIcon icon={faLayerGroup} style={{ color: '#a29bfe', fontSize: '12px' }} />
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#e4e4e7' }}>
                            Nest Default Banner
                          </span>
                          <span style={{ fontSize: '11px', color: '#71717a' }}>
                            (Optional fallback for all eggs in {nestName})
                          </span>
                        </Group>

                        {nestBannerUrl && (
                          <ActionIcon
                            size='sm'
                            variant='subtle'
                            color='red'
                            onClick={() => handleClearBanner(nestUuid)}
                            title='Clear nest banner'
                          >
                            <FontAwesomeIcon icon={faTrash} style={{ fontSize: '11px' }} />
                          </ActionIcon>
                        )}
                      </Group>

                      <Group align='center' gap='sm'>
                        <TextInput
                          placeholder='https://example.com/nest-banner.jpg'
                          value={nestBannerUrl}
                          onChange={(e) => handleSetBanner(nestUuid, e.currentTarget.value)}
                          style={{ flex: 1 }}
                          rightSection={
                            nestBannerUrl ? (
                              <ActionIcon size='xs' variant='transparent' onClick={() => handleClearBanner(nestUuid)}>
                                <FontAwesomeIcon icon={faXmark} style={{ color: '#71717a', fontSize: '11px' }} />
                              </ActionIcon>
                            ) : null
                          }
                          styles={{
                            input: {
                              background: '#0e0e11',
                              border: '1px solid #27272a',
                              color: '#f4f4f5',
                              fontSize: '11px',
                              height: '32px',
                            },
                          }}
                        />
                        <Button
                          size='xs'
                          variant='default'
                          leftSection={<FontAwesomeIcon icon={faWandMagicSparkles} style={{ fontSize: '10px' }} />}
                          onClick={() => setPickerTarget({ id: nestUuid, name: `${nestName} (Nest Default)` })}
                          style={{ fontSize: '11px', height: '32px', background: '#1f1f23', borderColor: '#3f3f46' }}
                        >
                          Presets
                        </Button>
                        {nestBannerUrl && (
                          <div
                            style={{
                              width: '48px',
                              height: '32px',
                              borderRadius: '4px',
                              backgroundImage: `url("${nestBannerUrl}")`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              border: '1px solid #3f3f46',
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </Group>
                    </div>

                    {/* Eggs List in this Nest */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      {(n.eggs || []).length === 0 ? (
                        <div
                          style={{
                            textAlign: 'center',
                            padding: '16px',
                            color: '#71717a',
                            fontSize: '11px',
                            background: '#151518',
                            borderRadius: '6px',
                            border: '1px dashed #27272a',
                          }}
                        >
                          No eggs in this nest
                        </div>
                      ) : (
                        (n.eggs || []).map((e: any) => {
                          const eggBannerUrl = form.values.egg_banners?.[e.uuid] || '';
                          const activeBannerUrl = eggBannerUrl || nestBannerUrl || '';
                          const isInherited = !eggBannerUrl && !!nestBannerUrl;

                          return (
                            <div
                              key={e.uuid}
                              style={{
                                background: '#151518',
                                border: '1px solid #27272a',
                                borderRadius: '8px',
                                padding: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                              }}
                            >
                              {/* Egg Header */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#f4f4f5' }}>
                                  {e.name}
                                </span>

                                <div>
                                  {eggBannerUrl ? (
                                    <Badge size='xs' variant='filled' color='indigo'>
                                      Custom
                                    </Badge>
                                  ) : isInherited ? (
                                    <Badge size='xs' variant='light' color='teal'>
                                      Nest Default
                                    </Badge>
                                  ) : (
                                    <Badge size='xs' variant='outline' color='gray'>
                                      None
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Banner Visual Preview Box */}
                              {activeBannerUrl ? (
                                <div
                                  style={{
                                    height: '68px',
                                    width: '100%',
                                    borderRadius: '6px',
                                    border: '1px solid #27272a',
                                    backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.25) 100%), url("${activeBannerUrl}")`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    padding: '8px 10px',
                                    overflow: 'hidden',
                                  }}
                                >
                                  <div>
                                    <span
                                      style={{
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        color: '#ffffff',
                                        textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                                        display: 'block',
                                      }}
                                    >
                                      {e.name}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: '9px',
                                        color: isInherited ? '#5eead4' : '#a5b4fc',
                                        textShadow: '0 1px 2px rgba(0,0,0,0.9)',
                                      }}
                                    >
                                      {isInherited ? 'Inherited from Nest Default' : 'Custom Egg Banner'}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  style={{
                                    height: '42px',
                                    width: '100%',
                                    borderRadius: '6px',
                                    border: '1px dashed #27272a',
                                    backgroundColor: '#0e0e11',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                  }}
                                >
                                  <FontAwesomeIcon icon={faImage} style={{ fontSize: '12px', color: '#3f3f46' }} />
                                  <span style={{ fontSize: '10px', color: '#52525b' }}>No banner configured</span>
                                </div>
                              )}

                              {/* URL Input & Single Presets Button */}
                              <Group gap='xs' align='center'>
                                <TextInput
                                  placeholder='https://.../banner.webp'
                                  value={eggBannerUrl}
                                  onChange={(event) => handleSetBanner(e.uuid, event.currentTarget.value)}
                                  style={{ flex: 1 }}
                                  rightSection={
                                    eggBannerUrl ? (
                                      <ActionIcon
                                        size='xs'
                                        variant='transparent'
                                        onClick={() => handleClearBanner(e.uuid)}
                                      >
                                        <FontAwesomeIcon icon={faXmark} style={{ color: '#71717a', fontSize: '11px' }} />
                                      </ActionIcon>
                                    ) : null
                                  }
                                  styles={{
                                    input: {
                                      background: '#0e0e11',
                                      border: '1px solid #27272a',
                                      color: '#f4f4f5',
                                      fontSize: '11px',
                                      height: '32px',
                                    },
                                  }}
                                />
                                <Button
                                  size='xs'
                                  variant='default'
                                  leftSection={<FontAwesomeIcon icon={faWandMagicSparkles} style={{ fontSize: '10px' }} />}
                                  onClick={() => setPickerTarget({ id: e.uuid, name: e.name })}
                                  style={{
                                    fontSize: '11px',
                                    height: '32px',
                                    padding: '0 10px',
                                    background: '#1f1f23',
                                    borderColor: '#3f3f46',
                                  }}
                                >
                                  Presets
                                </Button>
                              </Group>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </Stack>
      )}

      {/* Preset Picker Modal in clean English */}
      <Modal
        opened={!!pickerTarget}
        onClose={() => {
          setPickerTarget(null);
          setPickerSearch('');
        }}
        title={
          <Group gap='xs'>
            <FontAwesomeIcon icon={faImages} style={{ color: '#818cf8' }} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>
              Select Banner for {pickerTarget?.name || 'Egg'}
            </span>
          </Group>
        }
        size='lg'
        styles={{
          header: { background: '#18181b', borderBottom: '1px solid #27272a', color: '#f4f4f5' },
          content: { background: '#121215', border: '1px solid #27272a', color: '#f4f4f5' },
          body: { padding: '16px' },
        }}
      >
        <Stack gap='sm'>
          {/* Category Tabs & Search in Modal */}
          <Group justify='space-between' align='center' wrap='wrap' gap='xs'>
            <Group gap='4px'>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type='button'
                  onClick={() => setPickerCategory(cat)}
                  style={{
                    background: pickerCategory === cat ? '#818cf8' : '#1f1f23',
                    color: pickerCategory === cat ? '#ffffff' : '#a1a1aa',
                    border: '1px solid',
                    borderColor: pickerCategory === cat ? '#818cf8' : '#27272a',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat}
                </button>
              ))}
            </Group>

            <TextInput
              placeholder='Search presets...'
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.currentTarget.value)}
              size='xs'
              style={{ width: '180px' }}
              styles={{
                input: { background: '#18181b', border: '1px solid #27272a', color: '#f4f4f5' },
              }}
            />
          </Group>

          {/* Presets Grid */}
          {filteredPresets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: '#71717a', fontSize: '12px' }}>
              No matching banner presets found.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '10px',
                maxHeight: '420px',
                overflowY: 'auto',
                paddingRight: '4px',
                marginTop: '6px',
              }}
            >
              {filteredPresets.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => {
                    if (pickerTarget) {
                      handleSetBanner(pickerTarget.id, preset.url);
                      setPickerTarget(null);
                      setPickerSearch('');
                    }
                  }}
                  style={{
                    background: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#818cf8';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#27272a';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div
                    style={{
                      height: '90px',
                      width: '100%',
                      backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 60%), url("${preset.url}")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'flex-end',
                      padding: '8px',
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#ffffff', textShadow: '0 1px 2px #000' }}>
                      {preset.title}
                    </span>
                  </div>
                  <div style={{ padding: '6px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Badge size='xs' variant='outline' color='gray'>
                      {preset.category}
                    </Badge>
                    <span style={{ fontSize: '10px', color: '#818cf8', fontWeight: 500 }}>Select</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Stack>
      </Modal>
    </>
  );
}
