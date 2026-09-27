import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { Button, XStack, YStack, Text, useTheme, Switch, Input } from 'tamagui';
import { useWolSettings, useSaveWolSettings } from '../../hooks/settings';
import { useState } from 'react';
import { showToast } from '@/utils/toast';
import { Check, ArrowLeft } from '@tamagui/lucide-icons';
import SheetHeader from '@/components/Sheets/SheetHeader';

const WolSettingsSheet: React.FC<SheetProps<'wol-settings-sheet'>> = ({ sheetId }) => {
  const theme = useTheme();
  const { data, isLoading } = useWolSettings();
  const saveMutation = useSaveWolSettings();

  const [localEnabled, setLocalEnabled] = useState<boolean | null>(null);
  const [localPort, setLocalPort] = useState<string | null>(null);

  const isEnabled = localEnabled ?? data?.enabled ?? true;
  const port = localPort ?? String(data?.port ?? 2500);

  const handleSave = () => {
    const parsedPort = Number(port);

    if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
      showToast({ text1: 'Port must be an integer between 1 and 65535' });
      return;
    }

    saveMutation.mutate(
      { enabled: isEnabled, port: parsedPort },
      {
        onSuccess: (success) => {
          if (success) {
            showToast({ text1: 'Wake-on-LAN settings saved' });
            SheetManager.hide(sheetId);
          } else {
            showToast({ text1: 'Failed to save Wake-on-LAN settings' });
          }
        },
        onError: () => {
          showToast({ text1: 'An error occurred' });
        },
      }
    );
  };

  return (
    <ActionSheet id={sheetId} gestureEnabled containerStyle={{ backgroundColor: theme.background.val }}>
      <YStack p="$5" gap="$4">
        <SheetHeader title="Wake-on-LAN Settings" sheetId={sheetId} />

        <XStack items="center" justify="space-between" py="$2">
          <Text fontSize="$4">Enable</Text>

          <Switch
            themeInverse={isEnabled}
            checked={isEnabled}
            onCheckedChange={setLocalEnabled}
            disabled={isLoading || saveMutation.isPending}>
            <Switch.Thumb animation="medium" />
          </Switch>
        </XStack>

        <YStack gap="$2">
          <Text fontSize="$4">Service Port</Text>

          <Input
            value={port}
            onChangeText={setLocalPort}
            keyboardType="number-pad"
            placeholder="2500"
            editable={!saveMutation.isPending}
          />
        </YStack>

        <XStack gap="$3">
          <Button
            flex={1}
            icon={ArrowLeft}
            onPress={() => SheetManager.hide(sheetId)}
            disabled={saveMutation.isPending}>
            <Text>Cancel</Text>
          </Button>

          <Button
            flex={1}
            icon={Check}
            themeInverse
            onPress={handleSave}
            disabled={isLoading || saveMutation.isPending}>
            <Text>{saveMutation.isPending ? 'Saving...' : 'Save'}</Text>
          </Button>
        </XStack>
      </YStack>
    </ActionSheet>
  );
};

export default WolSettingsSheet;
