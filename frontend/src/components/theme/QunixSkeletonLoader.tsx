import React from 'react';
import { Skeleton, Box, Stack, Group, SimpleGrid } from '@mantine/core';

/**
 * Server Card Skeleton for Grid view (Desktop & Mobile)
 */
export const QunixServerCardSkeleton: React.FC<{ count?: number; wrapInGrid?: boolean }> = ({
  count = 6,
  wrapInGrid = true,
}) => {
  const cards = Array.from({ length: count }).map((_, i) => (
    <Box
      key={i}
      className='qunix-server-card qunix-card-flat'
      p='md'
      style={{
        minHeight: '170px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 'var(--ds-card-radius, 8px)',
        border: '1px solid var(--ds-border-color, rgba(255, 255, 255, 0.08))',
        backgroundColor: 'var(--ds-card-bg, #12141a)',
      }}
    >
      {/* Header Row */}
      <div>
        <Group justify='space-between' align='center' mb='xs'>
          <Group gap='xs'>
            <Skeleton height={28} width={28} radius='sm' animate />
            <div>
              <Skeleton height={16} width={130} radius='sm' mb={4} animate />
              <Skeleton height={11} width={80} radius='sm' animate />
            </div>
          </Group>
          <Skeleton height={20} width={64} radius='xl' animate />
        </Group>

        {/* Description placeholder */}
        <Skeleton height={12} width='70%' radius='sm' mt='xs' mb='md' animate />
      </div>

      {/* Metrics & Footer */}
      <div>
        <Group justify='space-between' mb={6}>
          <Skeleton height={10} width={45} radius='sm' animate />
          <Skeleton height={10} width={50} radius='sm' animate />
          <Skeleton height={10} width={45} radius='sm' animate />
        </Group>
        <Skeleton height={6} radius='xl' mb='sm' animate />

        <Group justify='space-between' align='center' pt='xs' style={{ borderTop: '1px solid var(--ds-border-color, rgba(255, 255, 255, 0.06))' }}>
          <Skeleton height={12} width={100} radius='sm' animate />
          <Skeleton height={24} width={24} radius='sm' animate />
        </Group>
      </div>
    </Box>
  ));

  if (wrapInGrid) {
    return <div className='gap-4 grid md:grid-cols-2'>{cards}</div>;
  }

  return <>{cards}</>;
};

/**
 * Server Row Skeleton for List view
 */
export const QunixServerListRowSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <Stack gap='xs' w='100%'>
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          className='qunix-list-row qunix-card-flat'
          p='md'
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 'var(--ds-card-radius, 8px)',
            border: '1px solid var(--ds-border-color, rgba(255, 255, 255, 0.08))',
            backgroundColor: 'var(--ds-card-bg, #12141a)',
            minHeight: '68px',
          }}
        >
          <Group gap='md' align='center' style={{ flex: '1 1 auto' }}>
            <Skeleton height={14} width={14} radius='xl' animate />
            <Skeleton height={34} width={34} radius='sm' animate />
            <div>
              <Skeleton height={16} width={160} radius='sm' mb={4} animate />
              <Skeleton height={11} width={100} radius='sm' animate />
            </div>
          </Group>

          <Group gap='xl' visibleFrom='sm'>
            <Skeleton height={14} width={80} radius='sm' animate />
            <Skeleton height={14} width={90} radius='sm' animate />
            <Skeleton height={14} width={80} radius='sm' animate />
          </Group>

          <Group gap='sm'>
            <Skeleton height={28} width={28} radius='sm' animate />
            <Skeleton height={28} width={28} radius='sm' animate />
          </Group>
        </Box>
      ))}
    </Stack>
  );
};

/**
 * Server Dashboard Skeleton for the server overview page
 */
export const QunixServerDashboardSkeleton: React.FC = () => {
  return (
    <Stack gap='md' w='100%' p='md'>
      {/* Top Header Card */}
      <Box
        className='qunix-card-flat'
        p='lg'
        style={{
          borderRadius: 'var(--ds-card-radius, 8px)',
          border: '1px solid var(--ds-border-color, rgba(255, 255, 255, 0.08))',
          backgroundColor: 'var(--ds-card-bg, #12141a)',
        }}
      >
        <Group justify='space-between' align='flex-start' wrap='wrap' gap='md'>
          <div>
            <Group gap='xs' mb='xs'>
              <Skeleton height={28} width={220} radius='sm' animate />
              <Skeleton height={22} width={70} radius='xl' animate />
            </Group>
            <Skeleton height={14} width={320} radius='sm' mb='xs' animate />
            <Group gap='md' mt='xs'>
              <Skeleton height={12} width={110} radius='sm' animate />
              <Skeleton height={12} width={140} radius='sm' animate />
              <Skeleton height={12} width={90} radius='sm' animate />
            </Group>
          </div>

          {/* Power Controls Skeleton */}
          <Group gap='xs'>
            <Skeleton height={36} width={85} radius='sm' animate />
            <Skeleton height={36} width={85} radius='sm' animate />
            <Skeleton height={36} width={85} radius='sm' animate />
            <Skeleton height={36} width={85} radius='sm' animate />
          </Group>
        </Group>
      </Box>

      {/* 4 Stat Metric Cards Bento Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing='md'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Box
            key={i}
            className='qunix-card-flat'
            p='md'
            style={{
              borderRadius: 'var(--ds-card-radius, 8px)',
              border: '1px solid var(--ds-border-color, rgba(255, 255, 255, 0.08))',
              backgroundColor: 'var(--ds-card-bg, #12141a)',
            }}
          >
            <Group justify='space-between' mb='xs'>
              <Skeleton height={14} width={80} radius='sm' animate />
              <Skeleton height={20} width={20} radius='sm' animate />
            </Group>
            <Skeleton height={28} width={110} radius='sm' my='xs' animate />
            <Skeleton height={6} radius='xl' mb='xs' animate />
            <Group justify='space-between'>
              <Skeleton height={10} width={60} radius='sm' animate />
              <Skeleton height={10} width={50} radius='sm' animate />
            </Group>
          </Box>
        ))}
      </SimpleGrid>

      {/* Quick Navigation Bento Grid */}
      <SimpleGrid cols={{ base: 2, sm: 4, lg: 8 }} spacing='sm'>
        {Array.from({ length: 8 }).map((_, i) => (
          <Box
            key={i}
            className='qunix-card-flat'
            p='sm'
            style={{
              borderRadius: 'var(--ds-card-radius, 8px)',
              border: '1px solid var(--ds-border-color, rgba(255, 255, 255, 0.08))',
              backgroundColor: 'var(--ds-card-bg, #12141a)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Skeleton height={28} width={28} radius='md' animate />
            <Skeleton height={12} width={55} radius='sm' animate />
          </Box>
        ))}
      </SimpleGrid>

      {/* Two Column Layout: Specifications & Connection Info */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
        <Box
          className='qunix-card-flat'
          p='lg'
          style={{
            borderRadius: 'var(--ds-card-radius, 8px)',
            border: '1px solid var(--ds-border-color, rgba(255, 255, 255, 0.08))',
            backgroundColor: 'var(--ds-card-bg, #12141a)',
          }}
        >
          <Skeleton height={20} width={150} radius='sm' mb='md' animate />
          <Stack gap='sm'>
            <Skeleton height={14} width='90%' radius='sm' animate />
            <Skeleton height={14} width='75%' radius='sm' animate />
            <Skeleton height={14} width='85%' radius='sm' animate />
            <Skeleton height={14} width='60%' radius='sm' animate />
          </Stack>
        </Box>

        <Box
          className='qunix-card-flat'
          p='lg'
          style={{
            borderRadius: 'var(--ds-card-radius, 8px)',
            border: '1px solid var(--ds-border-color, rgba(255, 255, 255, 0.08))',
            backgroundColor: 'var(--ds-card-bg, #12141a)',
          }}
        >
          <Skeleton height={20} width={140} radius='sm' mb='md' animate />
          <Stack gap='sm'>
            <Skeleton height={14} width='80%' radius='sm' animate />
            <Skeleton height={14} width='70%' radius='sm' animate />
            <Skeleton height={14} width='95%' radius='sm' animate />
            <Skeleton height={14} width='65%' radius='sm' animate />
          </Stack>
        </Box>
      </SimpleGrid>
    </Stack>
  );
};

/**
 * Server Console Skeleton for terminal view
 */
export const QunixServerConsoleSkeleton: React.FC = () => {
  return (
    <Stack gap='md' w='100%' p='md'>
      {/* Console Infobar Header */}
      <Box
        className='qunix-card-flat'
        p='md'
        style={{
          borderRadius: 'var(--ds-card-radius, 8px)',
          border: '1px solid var(--ds-border-color, rgba(255, 255, 255, 0.08))',
          backgroundColor: 'var(--ds-card-bg, #12141a)',
        }}
      >
        <Group justify='space-between' align='center'>
          <div>
            <Skeleton height={24} width={180} radius='sm' mb={4} animate />
            <Skeleton height={12} width={120} radius='sm' animate />
          </div>
          <Group gap='xs'>
            <Skeleton height={32} width={75} radius='sm' animate />
            <Skeleton height={32} width={75} radius='sm' animate />
            <Skeleton height={32} width={75} radius='sm' animate />
          </Group>
        </Group>
      </Box>

      {/* Main Terminal Window Skeleton & Details */}
      <SimpleGrid cols={{ base: 1, xl: 4 }} spacing='md'>
        <Box style={{ gridColumn: 'span 3' }}>
          <Skeleton height={420} radius='md' animate />
        </Box>
        <Box>
          <Stack gap='sm'>
            <Skeleton height={90} radius='md' animate />
            <Skeleton height={90} radius='md' animate />
            <Skeleton height={90} radius='md' animate />
            <Skeleton height={90} radius='md' animate />
          </Stack>
        </Box>
      </SimpleGrid>
    </Stack>
  );
};
