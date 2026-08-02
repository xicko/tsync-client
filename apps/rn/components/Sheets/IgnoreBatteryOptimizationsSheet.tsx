import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { Button, XGroup, YStack, Text, useTheme } from 'tamagui';
import tsyncnativeModule from '@/modules/tsyncnative';

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
              await tsyncnativeModule.disableBatteryOptimizations();

              await new Promise((resolve) => setTimeout(resolve, 8000));

              tsyncnativeModule.disableOptimizationsRoot();
              tsyncnativeModule.disableOptimizationsRoot('com.tailscale.ipn');

              const res = tsyncnativeModule.isIgnoringBatteryOptimizations();
              if (res) {
                tsyncnativeModule.startConnectionWorker();
                tsyncnativeModule.startBatteryWorker();
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
