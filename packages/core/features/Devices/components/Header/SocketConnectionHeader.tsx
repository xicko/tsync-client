import { XStack } from 'tamagui';
import { CheckCircle2, XCircle } from '@tamagui/lucide-icons';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import LastUpdateCounter from './LastUpdateCounter';

const DevicesHeaderRight: React.FC<{
  socket: Socket<DefaultEventsMap, DefaultEventsMap> | null;
  lastDeviceUpdate: Date | null;
}> = ({ socket, lastDeviceUpdate }) => {
  return (
    <XStack mr="$4" items="center" justify="center">
      <LastUpdateCounter lastDeviceUpdate={lastDeviceUpdate} />
      {socket && socket?.connected ? <CheckCircle2 color="$green8" /> : <XCircle color="red" />}
    </XStack>
  );
};

export default DevicesHeaderRight;
