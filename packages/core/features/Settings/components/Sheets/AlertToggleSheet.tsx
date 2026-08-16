import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { Button, XStack, YStack, Text, useTheme, Switch, H6 } from 'tamagui';
import { useAlertSettings, useSaveAlertSettings } from '../../hooks/settings';
import { useState } from 'react';
import { showToast } from '@/utils/toast';

const AlertToggleSheet: React.FC<SheetProps<'alert-toggle-sheet'>> = ({ sheetId }) => {
  const theme = useTheme();
  const { data, isLoading } = useAlertSettings();
  const saveMutation = useSaveAlertSettings();

  const [localEnabled, setLocalEnabled] = useState<boolean | null>(null);
  const isEnabled = localEnabled ?? data?.data?.enabled ?? false;

  const handleSave = () => {
    saveMutation.mutate(
      { enabled: isEnabled },
      {
        onSuccess: (success) => {
          if (success) {
            showToast({ text1: `Alerts ${isEnabled ? 'enabled' : 'disabled'} successfully` });
            SheetManager.hide(sheetId);
          } else {
            showToast({ text1: 'Failed to update alert settings' });
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
        <H6>Alert Settings</H6>
        <XStack items="center" justify="space-between" py="$2">
          <Text fontSize="$4">Enable Global Alerts</Text>
          <Switch
            size="$3"
            themeInverse
            checked={isEnabled}
            onCheckedChange={setLocalEnabled}
            disabled={isLoading || saveMutation.isPending}>
            <Switch.Thumb animation="medium" />
          </Switch>
        </XStack>

        <XStack gap="$3">
          <Button flex={1} onPress={() => SheetManager.hide(sheetId)} disabled={saveMutation.isPending}>
            <Text>Cancel</Text>
          </Button>
          <Button flex={1} themeInverse onPress={handleSave} disabled={isLoading || saveMutation.isPending}>
            <Text>{saveMutation.isPending ? 'Saving...' : 'Save'}</Text>
          </Button>
        </XStack>
      </YStack>
    </ActionSheet>
  );
};

export default AlertToggleSheet;
