import { Redirect, useRootNavigationState } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { View } from 'tamagui';
import { useThemeStore } from '@/store/themeStore';

const RootIndex = () => {
  const rootNavigationState = useRootNavigationState();
  const theme = useThemeStore((state) => state.theme);

  const [wait, setWait] = useState<boolean>(true);
  useEffect(() => {
    (async () => {
      await new Promise((resolve) => setTimeout(resolve, 700));
      setWait(false);
    })();
  }, []);

  if (!rootNavigationState?.key || wait) {
    return (
      <View flex={1} items="center" justify="center" bg={theme === 'light' ? '#fff' : '#000'}>
        <ActivityIndicator color={theme === 'light' ? '#000' : '#fff'} size="large" />
      </View>
    );
  }

  return <Redirect href="/tabs/devices" />;
};

export default RootIndex;
