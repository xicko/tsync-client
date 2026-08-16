import { DeviceListItem } from '@shared/types';
import { Zap } from '@tamagui/lucide-icons';
import dayjs from 'dayjs';
import { useTheme, XStack, Text, View } from 'tamagui';

interface Props {
  item: DeviceListItem;
}

const BatteryInfo: React.FC<Props> = ({ item }) => {
  const tamaguiTheme = useTheme();
  const now = dayjs();

  const level = Math.min(Math.max(item?.battery?.level ?? 0, 0), 100);
  const isHealthy = level > 30;
  const timestamp = Number(item.battery?.timestamp);
  const isRecent = !isNaN(timestamp) && now.diff(timestamp, 'day') < 2;
  const fillColor = isRecent ? (isHealthy ? tamaguiTheme.green5 : tamaguiTheme.red5) : tamaguiTheme.blue5;
  const textColor = isRecent ? (isHealthy ? '$green11' : '$red11') : '$blue11';

  if (!item?.battery) return null;

  return (
    <View mt="$2" mb="$1.5" rounded="$2" overflow="hidden" bg="$color2">
      {/* Progress fill */}
      <View position="absolute" t={0} l={0} b={0} width={`${level}%`} bg={fillColor} opacity={0.35} rounded="$3" />

      {/* Content */}
      <XStack items="center" gap="$2" px="$3" py="$2">
        {/* Battery level */}
        <Text fontSize="$2" fontWeight="600" color={textColor}>
          {item.battery.level != null ? `${item.battery.level}%` : '—'}
        </Text>

        {/* Charging indicator */}
        {item.battery.isPlugged && <Zap strokeWidth={1.4} size={14} />}

        {/* Separator dot */}
        <Text fontSize="$1" color="$color8">
          ·
        </Text>

        {/* Timestamp */}
        <Text fontSize="$1" color="$color9">
          {(() => {
            const time = dayjs(item.battery.timestamp);
            if (item.battery.timestamp) return `${time.format('HH:mm:ss')} (${time.fromNow(false)})`;
            return '-';
          })()}
        </Text>
      </XStack>
    </View>
  );
};

export default BatteryInfo;
