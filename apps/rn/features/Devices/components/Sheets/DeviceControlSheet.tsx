import { Button, H6, Text, View, XGroup, YStack, useTheme } from 'tamagui';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { setAdbDeviceIdentifier } from '@/features/Devices/controller/adbController';
import { showToast } from '@/utils/toast';
import * as Linking from 'expo-linking';
import * as IntentLauncher from 'expo-intent-launcher';
import { Image as ExpoImage } from 'expo-image';
import { ClipboardCopy, IdCard, Power, ScreenShare, Terminal } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import { wakeOnLan, setWindowsMacAddress } from '@/features/Devices/controller/devicesController';
import { eventEmit } from '@/utils/eventEmit';
import * as Clipboard from 'expo-clipboard';
import { useThemeStore } from '@/store/themeStore';

const DeviceControlSheet: React.FC<SheetProps<'device-control-sheet'>> = ({ sheetId, payload }) => {
  const device = payload?.device!;

  const theme = useThemeStore((s) => s.theme);
  const tamaguiTheme = useTheme();

  const onWOL = async () => {
    const tailscaleId = device.id;
    if (!tailscaleId) return;
    const res = await wakeOnLan(tailscaleId);
    if (res) {
      showToast({
        text1: 'Device waking up, wait 30-60 seconds',
      });
    } else {
      showToast({
        text1: 'Failed to wake up device',
      });
    }

    SheetManager.hide(sheetId);
  };

  const openAndroidApp = async (packageName: string) => {
    try {
      await IntentLauncher.startActivityAsync('android.intent.action.MAIN', {
        packageName,
        flags: 0x10000000, // FLAG_ACTIVITY_NEW_TASK
        category: 'android.intent.category.LAUNCHER',
      });
    } catch {
      showToast({ text1: 'Could not open app', text2: 'Make sure it is installed.' });
    }
  };

  const openPlayStore = async (packageName: string) => {
    const url = `market://details?id=${packageName}`;
    const fallback = `https://play.google.com/store/apps/details?id=${packageName}`;

    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      await Linking.openURL(fallback);
    }
  };

  const openIOSApp = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      showToast({ text1: 'Could not open app', text2: 'Make sure it is installed.' });
    }
  };

  const onRemoteDesktop = () => {
    if (device.os === 'windows') {
      openPlayStore('com.microsoft.rdc.androidx');
    } else if (device.os === 'macOS') {
      openPlayStore('com.realvnc.viewer.android');
    }
  };

  const onSetAdbDeviceIdentifier = () => {
    if (device.id)
      SheetManager.show('set-adb-device-identifier-sheet', {
        payload: {
          selectedDeviceId: device.id,
          onSelect: async (identifier: string | null) => {
            // only send port
            const selectedPort = identifier ? identifier.split(':')[1] : null;
            const res = await setAdbDeviceIdentifier(device.id, selectedPort);

            if (res) {
              showToast({
                text1: 'ADB device identifier set successfully',
              });
              eventEmit.emit('refreshDevices');
              SheetManager.hide(sheetId);
            } else {
              showToast({
                text1: 'Failed to set ADB device identifier',
              });
            }
          },
        },
      });
  };

  const onSetWindowsMacAddress = () => {
    if (device.id)
      SheetManager.show('set-windows-mac-address-sheet', {
        payload: {
          selectedDeviceId: device.id,
          onSelect: async (macAddress: string | null) => {
            const res = await setWindowsMacAddress(device.id, macAddress);

            if (res) {
              showToast({
                text1: 'Windows MAC address set successfully',
              });
              eventEmit.emit('refreshDevices');
              SheetManager.hide(sheetId);
            } else {
              showToast({
                text1: 'Failed to set Windows MAC address',
              });
            }
          },
        },
      });
  };

  const onCopyIp = async (ip: string) => {
    const res = await Clipboard.setStringAsync(ip);
    if (res) {
      showToast({
        text1: 'IP copied to clipboard',
      });
      SheetManager.hide(sheetId);
    }
  };

  return (
    <ActionSheet id={sheetId} gestureEnabled containerStyle={{ backgroundColor: tamaguiTheme.background.val }}>
      <View p="$5" gap="$3">
        <XGroup p="$2" items="center" gap="$2">
          <ExpoImage
            source={(() => {
              if (device.os === 'windows') return require('@/assets/images/windows600.png');
              if (device.os === 'macOS')
                return theme === 'light'
                  ? require('@/assets/images/apple600.png')
                  : require('@/assets/images/apple600dark.png');
              if (device.os === 'android') return require('@/assets/images/android600.png');
              if (device.os === 'linux') return require('@/assets/images/linux600.png');
              return '';
            })()}
            style={{ width: 28, height: 28, margin: 8 }}
          />

          <YStack flex={1}>
            <H6 numberOfLines={1} ellipsizeMode="tail" maxW={'84%'} overflow="hidden">
              {device.name}
            </H6>

            <Text>
              {device.os} - {device.addresses[0]}
            </Text>

            {device.os === 'android' && (
              <Text>
                ADB identifier:{' '}
                {(() => {
                  const address = device.addresses[0];
                  const port = device?.androidConfig?.adb?.port;
                  if (!address || !port) return 'Not set';
                  return `${address}:${port}`;
                })()}
              </Text>
            )}
          </YStack>
        </XGroup>

        <Button icon={ClipboardCopy} justify={'flex-start'} onPress={() => onCopyIp(device.addresses[0])}>
          <Text>Copy IP</Text>
        </Button>

        {/* Wake on LAN Windows */}
        {device.os === 'windows' && !device.isActive && (
          <Button icon={Power} justify={'flex-start'} onPress={onWOL}>
            <Text>Wake on LAN</Text>
          </Button>
        )}

        {device.os === 'macOS' || device.os === 'windows' ? (
          <Button icon={ScreenShare} justify={'flex-start'} onPress={onRemoteDesktop}>
            <Text>Open Remote Desktop</Text>
          </Button>
        ) : null}

        {device.os === 'android' ? (
          <Button icon={IdCard} justify={'flex-start'} onPress={onSetAdbDeviceIdentifier}>
            Set adb device identifier
          </Button>
        ) : null}

        {device.os === 'windows' ? (
          <Button icon={IdCard} justify={'flex-start'} onPress={onSetWindowsMacAddress}>
            Set Windows MAC address
          </Button>
        ) : null}

        {device.os === 'android' ? (
          <Button
            icon={Terminal}
            justify={'flex-start'}
            onPress={() => {
              router.push({
                pathname: '/tabs/shell',
              });
              SheetManager.hideAll(sheetId);
            }}>
            Open Shell
          </Button>
        ) : null}

        <View height={100} />
      </View>
    </ActionSheet>
  );
};

export default DeviceControlSheet;
