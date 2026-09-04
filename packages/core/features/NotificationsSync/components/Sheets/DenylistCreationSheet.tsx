import { Button, H6, Text, useTheme, View, XStack, Input, YStack } from 'tamagui';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { ArrowLeft, Plus } from '@tamagui/lucide-icons';
import { useDeviceStore } from '@/features/Devices/store/deviceStore';
import { useState } from 'react';
import { useCreateDenylistItem } from '../../hooks/denylist';
import { showToast } from '@/utils/toast';
import { NotificationsSyncDenylistType } from '../../types/denylist.interface';

const DENYLIST_TYPES: NotificationsSyncDenylistType[] = ['text', 'packageIdentifier'];

const DenylistCreationSheet: React.FC<SheetProps<'denylist-creation-sheet'>> = ({ sheetId, payload }) => {
  const theme = useTheme();
  const tailscaleDevices = useDeviceStore((s) => s.devices);

  const [selectedType, setSelectedType] = useState<NotificationsSyncDenylistType>('text');
  const [value, setValue] = useState('');
  const [selectedTailscaleId, setSelectedTailscaleId] = useState<string | undefined>(undefined);
  const createMutation = useCreateDenylistItem();

  const handleAdd = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      showToast({ text1: 'Please enter a value' });
      return;
    } else if (selectedType === 'text' && trimmed.length < 11) {
      showToast({ text1: 'Value too short' });
      return;
    }

    createMutation.mutate(
      {
        type: selectedType,
        text: selectedType === 'text' ? trimmed : undefined,
        packageIdentifier: selectedType === 'packageIdentifier' ? trimmed : undefined,
        tailscaleId: selectedTailscaleId,
      },
      {
        onSuccess: (success) => {
          if (success) {
            setValue('');
            setSelectedTailscaleId(undefined);
            showToast({ text1: 'Item added to denylist' });
            SheetManager.hide(sheetId);
          } else {
            showToast({ text1: 'Failed to add item to denylist' });
          }
        },
        onError: () => {
          showToast({ text1: 'An error occurred while adding the item' });
        },
      }
    );
  };

  return (
    <ActionSheet id={sheetId} gestureEnabled={false} containerStyle={{ backgroundColor: theme.background.val }}>
      <View p={'$4'} gap={'$3'}>
        <View>
          <H6>Add to denylist</H6>
        </View>

        <XStack gap="$3" flexWrap="wrap">
          {DENYLIST_TYPES.map((type) => (
            <Button
              key={type}
              size={'$3'}
              themeInverse={selectedType === type}
              onPress={() => {
                setSelectedType(type);
                setValue('');
              }}
              disabled={createMutation.isPending}>
              <Text>{type}</Text>
            </Button>
          ))}
        </XStack>

        <Input
          placeholder={selectedType === 'text' ? 'Enter text' : 'Enter package identifier'}
          value={value}
          onChangeText={setValue}
          disabled={createMutation.isPending}
        />

        <YStack gap="$2">
          <XStack gap="$3" flexWrap="wrap">
            {(tailscaleDevices || [])
              .filter((f) => f.os === 'android')
              .map((device) => (
                <Button
                  key={device.id}
                  size={'$3'}
                  themeInverse={selectedTailscaleId === device.id}
                  onPress={() => {
                    setSelectedTailscaleId((prev) => (prev === device.id ? undefined : device.id));
                  }}
                  disabled={createMutation.isPending}>
                  <Text>{device?.name?.split('.')[0] || device.id}</Text>
                </Button>
              ))}
          </XStack>
        </YStack>

        <XStack gap="$3">
          <Button
            flex={1}
            icon={ArrowLeft}
            onPress={() => SheetManager.hide(sheetId)}
            disabled={createMutation.isPending}>
            <Text>Cancel</Text>
          </Button>

          <Button flex={1} themeInverse icon={Plus} onPress={handleAdd} disabled={createMutation.isPending}>
            <Text>{createMutation.isPending ? 'Adding...' : 'Add'}</Text>
          </Button>
        </XStack>
      </View>
    </ActionSheet>
  );
};

export default DenylistCreationSheet;
