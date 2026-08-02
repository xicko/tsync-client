import { useEffect, useState } from 'react';
import { Text } from 'tamagui';

const LastUpdateCounter: React.FC<{ lastDeviceUpdate: Date | null }> = ({ lastDeviceUpdate }) => {
  const [elapsed, setElapsed] = useState<number>(() =>
    lastDeviceUpdate ? Math.floor((Date.now() - lastDeviceUpdate.getTime()) / 1000) : 0
  );

  useEffect(() => {
    if (!lastDeviceUpdate) return;

    setElapsed(Math.floor((Date.now() - lastDeviceUpdate.getTime()) / 1000));

    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - lastDeviceUpdate.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(id);
  }, [lastDeviceUpdate]);

  if (!lastDeviceUpdate) return null;

  return <Text mr="$2">{elapsed}s</Text>;
};

export default LastUpdateCounter;
