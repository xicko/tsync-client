import ActionSheet, { ScrollView, SheetManager, SheetProps } from 'react-native-actions-sheet';
import {
  Button,
  H6,
  Text,
  useTheme,
  View,
  YGroup,
  YStack,
  Switch,
  XStack,
  Spinner,
  useWindowDimensions,
} from 'tamagui';
import { useAlertSettings, useSaveAlertSettings } from '../../hooks/settings';
import { useDevices } from '@/features/Devices/hooks/devices';
import { useDeviceStore } from '@/features/Devices/store/deviceStore';
import { useState } from 'react';
import { showToast } from '@/utils/toast';
import { RefreshControl } from 'react-native';
import { ArrowLeft, Check } from '@tamagui/lucide-icons';

const AlertDenylistEditorSheet: React.FC<SheetProps<'alert-denylist-editor-sheet'>> = ({ sheetId }) => {
  const theme = useTheme();
  const dimensions = useWindowDimensions();

  const {
    data: alertSettings,
    isLoading: isAlertSettingsLoading,
    isRefetching: isAlertSettingsRefetching,
    refetch: refetchSettings,
  } = useAlertSettings();
  const { isLoading: isDevicesLoading, isRefetching: isDevicesRefetching, refetch: refetchDevices } = useDevices();
  const tailscaleDevices = useDeviceStore((s) => s.devices);
  const saveMutation = useSaveAlertSettings();

  const [localDenylist, setLocalDenylist] = useState<string[] | null>(null);
  const denylist = localDenylist ?? alertSettings?.data?.denylist ?? [];

  const handleToggleDevice = (deviceId: string, isChecked: boolean) => {
    const nextDenylist = isChecked
      ? denylist.includes(deviceId)
        ? denylist
        : [...denylist, deviceId]
      : denylist.filter((id) => id !== deviceId);
    setLocalDenylist(nextDenylist);
  };

  const handleSave = () => {
    saveMutation.mutate(
      { denylist },
      {
        onSuccess: (success) => {
          if (success) {
            showToast({ text1: 'Denylist updated successfully' });
            SheetManager.hide(sheetId);
          } else {
            showToast({ text1: 'Failed to update denylist' });
          }
        },
        onError: () => {
          showToast({ text1: 'An error occurred' });
        },
      }
    );
  };

  const isRefreshing = isAlertSettingsRefetching || isDevicesRefetching;
  const isLoading = isAlertSettingsLoading || isDevicesLoading;

  const handleRefresh = async () => {
    await Promise.all([refetchSettings(), refetchDevices()]);
  };

  return (
    <ActionSheet id={sheetId} gestureEnabled={false} containerStyle={{ backgroundColor: theme.background.val }}>
      <View p="$4" gap="$3" height={dimensions.height * 0.84}>
        <View>
          <H6>Alert Denylist (Muted Devices)</H6>
        </View>

        {isLoading && tailscaleDevices.length === 0 ? (
          <View flex={1} items="center" justify="center">
            <Spinner size="large" />
          </View>
        ) : (
          <ScrollView
            style={{ borderRadius: 8, overflow: 'hidden', flex: 1 }}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}>
            <YGroup gap="$0.5">
              {tailscaleDevices.map((device) => {
                const isDenylisted = denylist.includes(device.id);
                return (
                  <Button
                    key={device.id}
                    items="center"
                    justify="space-between"
                    height={'auto'}
                    py="$3"
                    onPress={() => handleToggleDevice(device.id, !isDenylisted)}>
                    <YStack gap="$2">
                      <Text fontWeight="bold" self="flex-start">
                        {device.name.split('.')[0]}
                      </Text>
                      <Text fontSize="$2" color="$color9" self="flex-start">
                        {device.os} • {device.addresses[0]}
                      </Text>
                    </YStack>
                    <Switch
                      themeInverse={isDenylisted}
                      pointerEvents="none"
                      checked={isDenylisted}
                      onCheckedChange={(checked) => handleToggleDevice(device.id, checked)}
                      disabled={saveMutation.isPending}>
                      <Switch.Thumb animation="medium" />
                    </Switch>
                  </Button>
                );
              })}
              {tailscaleDevices.length === 0 && (
                <View py="$4" items="center">
                  <Text>No devices found</Text>
                </View>
              )}
            </YGroup>
          </ScrollView>
        )}

        <XStack gap="$3">
          <Button
            flex={1}
            icon={ArrowLeft}
            onPress={() => SheetManager.hide(sheetId)}
            disabled={saveMutation.isPending}>
            <Text>Cancel</Text>
          </Button>
          <Button
            flex={1}
            themeInverse
            icon={Check}
            onPress={handleSave}
            disabled={isLoading || saveMutation.isPending}>
            <Text>{saveMutation.isPending ? 'Saving...' : 'Save'}</Text>
          </Button>
        </XStack>
      </View>
    </ActionSheet>
  );
};

export default AlertDenylistEditorSheet;
