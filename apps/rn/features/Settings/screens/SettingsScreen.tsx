import { useThemeStore } from '@/store/themeStore';
import { SheetManager } from 'react-native-actions-sheet';
import { Button, Text, View, YGroup } from 'tamagui';
import { useAlertSettings } from '../hooks/settings';
import Section from '@/components/Section';

const SettingsScreen = () => {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const { data } = useAlertSettings();

  return (
    <View flex={1} bg="$background" p="$3" gap="$4">
      <Section label="General">
        <YGroup gap="$0.5">
          <Button onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            <Text>Toggle Theme</Text>
          </Button>

          <Button onPress={() => SheetManager.show('domain-change-sheet')}>
            <Text>Change Domain</Text>
          </Button>
        </YGroup>
      </Section>

      <Section label="Alerts">
        <YGroup gap="$0.5">
          <Button onPress={() => SheetManager.show('alert-toggle-sheet')}>
            <Text>
              {(() => {
                if (data?.data === undefined) return '-';
                return data.data?.enabled ? 'Enabled' : 'Disabled';
              })()}
            </Text>
          </Button>

          <Button onPress={() => SheetManager.show('alert-denylist-editor-sheet')}>
            <Text>Denylist</Text>
          </Button>
        </YGroup>
      </Section>
    </View>
  );
};

export default SettingsScreen;
