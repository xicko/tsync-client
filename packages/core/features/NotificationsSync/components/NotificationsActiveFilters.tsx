'use client';

import { useNotificationsSyncListFilterStore } from '@/features/NotificationsSync/store/notificationsSyncListFilterStore';
import { useDeviceStore } from '@/features/Devices/store/deviceStore';
import { Button, ScrollView, Text, XStack } from 'tamagui';
import { X } from '@tamagui/lucide-icons';
import dayjs from 'dayjs';

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, onRemove }) => {
  return (
    <Button size={'$3'} items="center">
      <Text fontSize="$3" color="$color">
        {label}
      </Text>

      <Button
        size="$1.5"
        icon={X}
        p={0}
        chromeless
        bg={'transparent'}
        onPress={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      />
    </Button>
  );
};

export const NotificationsActiveFilters: React.FC = () => {
  const activeFilters = useNotificationsSyncListFilterStore((s) => s.activeFilters);
  const setActiveFilters = useNotificationsSyncListFilterStore((s) => s.setActiveFilters);
  const resetFilters = useNotificationsSyncListFilterStore((s) => s.resetFilters);
  const devices = useDeviceStore((s) => s.devices);

  const hasActiveFilters =
    activeFilters.search !== '' ||
    activeFilters.os !== 'all' ||
    activeFilters.tailscaleId.length > 0 ||
    activeFilters.startDate !== null ||
    activeFilters.endDate !== null;

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{
        flexGrow: 0,
      }}>
      <XStack gap="$2.5" items="center">
        {activeFilters.search !== '' && (
          <FilterChip
            label={`Search: "${activeFilters.search}"`}
            onRemove={() => setActiveFilters({ ...activeFilters, search: '' })}
          />
        )}

        {activeFilters.os !== 'all' && (
          <FilterChip
            label={`OS: ${activeFilters.os.toUpperCase()}`}
            onRemove={() => setActiveFilters({ ...activeFilters, os: 'all' })}
          />
        )}

        {activeFilters.tailscaleId.map((id) => {
          const device = devices.find((d) => d.id === id);
          const displayName = device ? device.name?.split('.')[0] || device.name : id;
          return (
            <FilterChip
              key={id}
              label={`Device: ${displayName}`}
              onRemove={() => {
                setActiveFilters({
                  ...activeFilters,
                  tailscaleId: activeFilters.tailscaleId.filter((dId) => dId !== id),
                });
              }}
            />
          );
        })}

        {activeFilters.startDate !== null && (
          <FilterChip
            label={`After: ${dayjs(activeFilters.startDate).format('MM/DD/YYYY')}`}
            onRemove={() => setActiveFilters({ ...activeFilters, startDate: null })}
          />
        )}

        {activeFilters.endDate !== null && (
          <FilterChip
            label={`Before: ${dayjs(activeFilters.endDate).format('MM/DD/YYYY')}`}
            onRemove={() => setActiveFilters({ ...activeFilters, endDate: null })}
          />
        )}

        <Button size="$2" chromeless onPress={resetFilters}>
          Clear All
        </Button>
      </XStack>
    </ScrollView>
  );
};
