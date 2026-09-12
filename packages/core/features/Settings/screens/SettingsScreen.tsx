import { useThemeStore } from '@/store/themeStore';
import { SheetManager } from 'react-native-actions-sheet';
import { Button, Text, View, YGroup } from 'tamagui';
import { useAlertSettings } from '../hooks/settings';
import { Section } from '@/components';
import { Platform } from 'react-native';
import { Ban, Check, Fingerprint, Globe, Key, Minus, Palette, X } from '@tamagui/lucide-icons';
import { canLocalAuthenticate, localAuthenticate } from '../utils/authUtils';
import { useAuthStore } from '@/store';
import { showToast } from '@/utils';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

const SettingsScreen = () => {
  const isWeb = Platform.OS === 'web';
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const localAuth = useAuthStore((s) => s.localAuth);
  const setLocalAuth = useAuthStore((s) => s.setLocalAuth);

  const { data } = useAlertSettings();

  const [canLocalAuth, setCanLocalAuth] = useState<boolean>(false);
  const onLocalAuth = async () => {
    const canAuth = await canLocalAuthenticate();
    if (!canAuth.success) {
      if (canAuth.error)
        showToast({
          text1: canAuth.error,
        });
      return;
    }

    const authenticated = await localAuthenticate();
    if (authenticated) setLocalAuth(!localAuth);
  };
  useFocusEffect(
    useCallback(() => {
      (async () => {
        if (isWeb) return;
        const canAuth = await canLocalAuthenticate();
        setCanLocalAuth(canAuth.success);
        if (canAuth.error) setLocalAuth(false);
      })();
    }, [])
  );

  return (
    <View flex={1} bg="$background" p="$3" gap="$4">
      <Section label="General">
        <YGroup gap="$0.5">
          <Button justify="flex-start" icon={Palette} onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            <Text>Toggle Theme</Text>
          </Button>

          <Button justify="flex-start" icon={Globe} onPress={() => SheetManager.show('domain-change-sheet')}>
            <Text>Change Domain</Text>
          </Button>
        </YGroup>
      </Section>

      <Section label="Alerts">
        <YGroup gap="$0.5">
          <Button
            justify="flex-start"
            icon={(() => {
              if (data?.data === undefined) return Minus;
              return data.data?.enabled ? Check : X;
            })()}
            onPress={() => SheetManager.show('alert-toggle-sheet')}>
            <Text>
              {(() => {
                if (data?.data === undefined) return 'No data';
                return data.data?.enabled ? 'Enabled' : 'Disabled';
              })()}
            </Text>
          </Button>

          <Button justify="flex-start" icon={Ban} onPress={() => SheetManager.show('alert-denylist-editor-sheet')}>
            <Text>Denylist</Text>
          </Button>
        </YGroup>
      </Section>

      {!isWeb ? (
        <Section label="Security">
          <YGroup gap="$0.5">
            <Button justify="flex-start" icon={Fingerprint} onPress={onLocalAuth}>
              <Text>Biometric lock: {!canLocalAuth ? 'Unsupported' : localAuth ? 'Enabled' : 'Disabled'}</Text>
            </Button>
          </YGroup>
        </Section>
      ) : null}
    </View>
  );
};

export default SettingsScreen;
