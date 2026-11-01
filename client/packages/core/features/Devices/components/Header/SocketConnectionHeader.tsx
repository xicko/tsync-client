import { XStack } from 'tamagui';
import { CheckCircle2, XCircle } from '@tamagui/lucide-icons';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import LastUpdateCounter from './LastUpdateCounter';
import { useSocketStore } from '@/store';

const DevicesHeaderRight: React.FC<{
  socket?: Socket<DefaultEventsMap, DefaultEventsMap> | null;
  lastDeviceUpdate: Date | number | null;
}> = ({ socket: propSocket, lastDeviceUpdate }) => {
  const storeSocket = useSocketStore((s) => s.socket);
  const isConnected = useSocketStore((s) => s.isConnected);

  const socket = propSocket ?? storeSocket;
  const connected = isConnected || (socket?.connected ?? false);

  return (
    <XStack mr="$4" items="center" justify="center">
      <LastUpdateCounter lastDeviceUpdate={lastDeviceUpdate} />
      {socket && connected ? <CheckCircle2 color="$green8" /> : <XCircle color="red" />}
    </XStack>
  );
};

export default DevicesHeaderRight;
