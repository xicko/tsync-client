import { DeviceListItem } from '@shared/types';
import { OpaqueColorValue, Platform, TouchableOpacity } from 'react-native';
import { SheetManager } from 'react-native-actions-sheet';
import { Text, View, XStack, Button, YStack, GetThemeValueForKey, useTheme } from 'tamagui';
import { Image as ExpoImage } from 'expo-image';
import { Hotel, Zap } from '@tamagui/lucide-icons';
import { useThemeStore } from '@/store/themeStore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import BatteryInfo from './BatteryInfo';
dayjs.extend(relativeTime);

interface DeviceCardProps {
  item: DeviceListItem;
  onPress: (device: DeviceListItem) => void;
}

function formatLastSeen(lastSeen?: string): string {
  if (!lastSeen) return 'Never';
  const diff = Date.now() - new Date(lastSeen).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ item, onPress }) => {
  const isWeb = Platform.OS === 'web';
  const theme = useThemeStore((s) => s.theme);
  const tamaguiTheme = useTheme();
  const primaryIp = item?.addresses?.[0] ?? '—';
  const hasRoutes = item?.enabledRoutes?.length > 0;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => onPress(item)}
      style={
        isWeb
          ? {
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }
          : undefined
      }>
      <View
        mx={isWeb ? 0 : '$3'}
        my={isWeb ? 0 : '$2'}
        flex={isWeb ? 1 : undefined}
        rounded="$4"
        p="$3"
        bg="$color1"
        borderWidth={1}
        borderColor="$borderColor">
        {/* Header row */}
        <XStack justify="space-between" items="center" mb="$2" gap={'$2'}>
          <View width={24} height={24} m="$2">
            <ExpoImage
              source={(() => {
                if (item?.os === 'windows') return require('@/assets/images/windows600.png');
                if (item?.os === 'macOS' || item.os === 'iOS')
                  return theme === 'light'
                    ? require('@/assets/images/apple600.png')
                    : require('@/assets/images/apple600dark.png');
                if (item?.os === 'android') return require('@/assets/images/android600.png');
                if (item?.os === 'linux') return require('@/assets/images/linux600.png');
                return '';
              })()}
              style={{ width: 24, height: 24 }}
            />

            {item?.isHost === true ? (
              <View position="absolute" b={-6} r={-8} z={100}>
                <Hotel size={12} />
              </View>
            ) : null}
          </View>

          <YStack flex={1} mr="$3">
            <Text fontSize="$5" fontWeight="600" numberOfLines={1}>
              {item?.name?.split('.')[0]}
            </Text>
            <Text fontSize="$2" color="$color10" numberOfLines={1}>
              {item?.user}
            </Text>
          </YStack>

          {/* Active badge */}
          <View rounded="$2" px="$2" py="$1" bg={item?.isActive ? '$green3' : '$color4'}>
            <Text fontSize="$1" fontWeight="400" color={item?.isActive ? '$green10' : '$color10'}>
              {item?.isActive ? 'ONLINE' : 'OFFLINE'}
            </Text>
          </View>
        </XStack>

        {/* Info row */}
        <XStack gap="$3" flexWrap="wrap">
          <InfoChip label="IP" value={primaryIp} />
          <InfoChip label="OS" value={item?.os} />
          <InfoChip label="Seen" value={formatLastSeen(item?.lastSeen)} />
        </XStack>

        {item?.os === 'android' && (
          <InfoChip
            label="ADB identifier"
            value={(() => {
              const address = item.addresses[0];
              const port = item?.androidConfig?.adb?.port;
              if (!address || !port) return 'Not set';
              return `${address}:${port}`;
            })()}
          />
        )}

        {item?.os === 'windows' && (
          <InfoChip label="Windows MAC address" value={item?.windowsConfig?.macAddress || 'Not set'} />
        )}

        {/* Battery info */}
        <BatteryInfo item={item} />

        {/* Footer flags */}
        <XStack mt="$2" gap="$2" flexWrap="wrap">
          {item?.sshEnabled && <Flag label="SSH" color="$blue10" bg="$blue3" />}
          {hasRoutes && <Flag label={`${item?.enabledRoutes?.length} Routes`} color="$blue10" bg="$blue3" />}
          {item?.updateAvailable && <Flag label="Update" color="$red10" bg="$red3" />}
          {item?.isEphemeral && <Flag label="Ephemeral" color="$color10" bg="$color4" />}
          {item?.isThisDevice && <Flag label="This device" color="$blue7" bg="$blue3" />}
        </XStack>

        {isWeb && <View style={{ flexGrow: 1 }} />}

        <Button
          size="$3"
          mt="$4"
          onPress={(e) => {
            e.stopPropagation();

            SheetManager.show('device-control-sheet', {
              payload: {
                device: item,
              },
            });
          }}>
          <Text>Control</Text>
        </Button>
      </View>
    </TouchableOpacity>
  );
};

// ─── Subcomponents ───────────────────────────────────────────────────────────

interface InfoChipProps {
  label: string;
  value: string;
}

function InfoChip({ label, value }: InfoChipProps) {
  return (
    <XStack gap="$1" items="center">
      <Text fontSize="$2" color="$color9">
        {label}:
      </Text>
      <Text fontSize="$2" fontWeight="500">
        {value}
      </Text>
    </XStack>
  );
}

interface FlagProps {
  label: string;
  color: OpaqueColorValue | GetThemeValueForKey<'color'> | undefined;
  bg: OpaqueColorValue | GetThemeValueForKey<'color'> | undefined;
}

function Flag({ label, color, bg }: FlagProps) {
  return (
    <View rounded="$2" px="$2" py="$1" bg={bg}>
      <Text fontSize="$1" color={color}>
        {label ?? ''}
      </Text>
    </View>
  );
}
