import ActionSheet, { SheetProps } from 'react-native-actions-sheet';
import { H6, Text, View, Input, Button, useTheme } from 'tamagui';
import { useState } from 'react';

const SetWindowsMacAddressSheet: React.FC<SheetProps<'set-windows-mac-address-sheet'>> = ({ sheetId, payload }) => {
  const theme = useTheme();

  const [macAddress, setMacAddress] = useState<string>('');

  return (
    <ActionSheet id={sheetId} gestureEnabled containerStyle={{ backgroundColor: theme.background.val }}>
      <View p="$5" gap="$3">
        <H6>Set Windows MAC address</H6>
        <Input placeholder="MAC address" value={macAddress} onChangeText={setMacAddress} />
        <Button onPress={() => payload?.onSelect(macAddress)}>
          <Text>Set</Text>
        </Button>
      </View>
    </ActionSheet>
  );
};

export default SetWindowsMacAddressSheet;
