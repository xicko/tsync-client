import { Redirect, useRootNavigationState } from 'expo-router';
import { View, Spinner, Button, Text } from 'tamagui';
import { useAuthStore } from '@/store';
import { useEffect, useState } from 'react';
import { canLocalAuthenticate, localAuthenticate } from '@/features/Settings/utils/authUtils';
import { Platform } from 'react-native';
import { Fingerprint } from '@tamagui/lucide-icons';

const RootIndex = () => {
  const isWeb = Platform.OS === 'web';
  const rootNavigationState = useRootNavigationState();

  const localAuth = useAuthStore((s) => s.localAuth);
  const [didAuthenticate, setDidAuthenticate] = useState<boolean | null>(false);

  useEffect(() => {
    (async () => {
      if (localAuth && !isWeb) {
        const canAuth = await canLocalAuthenticate();
        if (canAuth.error) {
          useAuthStore.getState().setLocalAuth(false);
          setDidAuthenticate(true);
          return;
        }

        const result = await localAuthenticate();
        setDidAuthenticate(result ? true : null);
      } else setDidAuthenticate(true);
    })();
  }, [localAuth, isWeb]);

  if (didAuthenticate === null) {
    return (
      <View flex={1} items="center" justify="center" bg="$background">
        <Button
          icon={Fingerprint}
          onPress={async () => {
            const result = await localAuthenticate();
            setDidAuthenticate(result ? true : null);
          }}>
          <Text>Retry biometric</Text>
        </Button>
      </View>
    );
  }

  if (!rootNavigationState?.key || didAuthenticate === false) {
    return (
      <View flex={1} items="center" justify="center" bg="$background">
        <Spinner size="large" />
      </View>
    );
  }

  return <Redirect href="/tabs/devices" />;
};

export default RootIndex;
