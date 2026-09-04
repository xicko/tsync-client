import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { H6, Text, View, Input, Button, useTheme, XStack } from 'tamagui';
import { ArrowLeft, Check } from '@tamagui/lucide-icons';
import { useState } from 'react';

const SetWindowsMacAddressSheet: React.FC<SheetProps<'set-windows-mac-address-sheet'>> = ({ sheetId, payload }) => {
  const theme = useTheme();

  const [macAddress, setMacAddress] = useState<string>('');

  return (
    <ActionSheet id={sheetId} gestureEnabled containerStyle={{ backgroundColor: theme.background.val }}>
      <View p="$5" gap="$3">
        <H6>Set Windows MAC address</H6>
        <Input placeholder="MAC address" value={macAddress} onChangeText={setMacAddress} />
        <XStack gap="$3">
          <Button flex={1} icon={ArrowLeft} onPress={() => SheetManager.hide(sheetId)}>
            <Text>Cancel</Text>
          </Button>
          <Button
            flex={1}
            themeInverse
            icon={Check}
            onPress={() => {
              payload?.onSelect(macAddress);
              SheetManager.hide(sheetId);
            }}>
            <Text>Set</Text>
          </Button>
        </XStack>
      </View>
    </ActionSheet>
  );
};

export default SetWindowsMacAddressSheet;
