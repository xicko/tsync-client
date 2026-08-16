import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { Button, XGroup, YStack, Text, useTheme } from 'tamagui';
import { getTsyncNative } from '@/store/tsyncNativeStore';

const IgnoreBatteryOptimizationsSheet: React.FC<SheetProps<'ignore-battery-optimizations-sheet'>> = ({ sheetId }) => {
  const theme = useTheme();

  return (
    <ActionSheet
      id={sheetId}
      closable={false}
      snapPoints={[100]}
      containerStyle={{ backgroundColor: theme.background.val }}>
      <YStack p={'$5'} gap={'$4'}>
        <Text>Ignore Battery Optimizations</Text>

        <XGroup gap={'$0.5'}>
          <Button
            flex={1}
            themeInverse
            onPress={async () => {
              await getTsyncNative().disableBatteryOptimizations();

              await new Promise((resolve) => setTimeout(resolve, 8000));

              getTsyncNative().disableOptimizationsRoot();
              getTsyncNative().disableOptimizationsRoot('com.tailscale.ipn');

              const res = getTsyncNative().isIgnoringBatteryOptimizations();
              if (res) {
                getTsyncNative().startConnectionWorker();
                getTsyncNative().startBatteryWorker();
                SheetManager.hide(sheetId);
              }
            }}>
            Proceed
          </Button>
        </XGroup>
      </YStack>
    </ActionSheet>
  );
};

export default IgnoreBatteryOptimizationsSheet;
