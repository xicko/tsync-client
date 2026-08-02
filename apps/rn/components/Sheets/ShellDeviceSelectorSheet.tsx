import { useDeviceStore } from '@/features/Devices/store/deviceStore';
import { TailscaleDevice } from '@shared/types';
import { Check } from '@tamagui/lucide-icons';
import { useMemo } from 'react';
import ActionSheet, { SheetProps, ScrollView, SheetManager } from 'react-native-actions-sheet';
import { View, Text, Button, YGroup, XStack, H6, YStack, useTheme } from 'tamagui';

const ShellDeviceSelectorSheet: React.FC<SheetProps<'shell-device-selector-sheet'>> = ({ sheetId, payload }) => {
  const devices = useDeviceStore((s) => s.devices);
  const theme = useTheme();

  const androidDevices = useMemo(
    () =>
      devices.filter(
        (device) => device.os.toLowerCase() === 'android' && device?.androidConfig?.adb?.port !== undefined
      ),
    [devices]
  );

  const constructAdbAddressText = (device: TailscaleDevice) => {
    const address = device.addresses[0];
    const port = device?.androidConfig?.adb?.port;
    if (!address || !port) return 'Not set';
    return `${address}:${port}`;
  };

  return (
    <ActionSheet id={sheetId} gestureEnabled={true} containerStyle={{ backgroundColor: theme.background.val }}>
      <View p={'$4'} gap={'$2'}>
        <View>
          <H6>Select Device</H6>
        </View>

        <ScrollView style={{ maxHeight: 400, borderRadius: 8, overflow: 'hidden' }}>
          <YGroup gap={'$0.5'}>
            {androidDevices.map((device) => (
              <Button
                key={device.id}
                height="auto"
                py={'$3'}
                themeInverse={device.id === payload?.selectedDeviceId}
                onPress={() => {
                  payload?.onSelect(device);
                  SheetManager.hide(sheetId);
                }}>
                <XStack justify={'space-between'} flex={1} items="center">
                  <YStack items={'flex-start'}>
                    <H6>{device.name.split('.')[0] || device.name}</H6>

                    <Text>{constructAdbAddressText(device)}</Text>
                  </YStack>

                  {device.id === payload?.selectedDeviceId && <Check />}
                </XStack>
              </Button>
            ))}
          </YGroup>
        </ScrollView>
      </View>
    </ActionSheet>
  );
};

export default ShellDeviceSelectorSheet;
