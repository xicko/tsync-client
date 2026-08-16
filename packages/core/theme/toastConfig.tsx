import React from 'react';
import { TouchableOpacity } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import Toast, { BaseToastProps, ToastConfig } from 'react-native-toast-message';
import { Text, View, YStack } from 'tamagui';

interface CustomToastProps extends BaseToastProps {
  insets?: EdgeInsets;
}

const ToastLayout = ({ text1, text2, onPress, insets }: CustomToastProps) => {
  return (
    <View pointerEvents="box-none" maxW="100%" items="center" justify="center" mt={insets?.top ? insets.top / 2 : 12}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          onPress?.();
          setTimeout(() => Toast.hide(), 750);
        }}
        style={{ width: '100%', alignItems: 'center' }}>
        <YStack width="92%" bg={'$blue7' as any} rounded={8} px={16} py={14} gap={4}>
          {!!text1 && (
            <Text fontWeight="500" fontSize={16} letterSpacing={0.2} color="white">
              {String(text1)}
            </Text>
          )}
          {!!text2 && (
            <Text fontWeight="400" fontSize={14} opacity={0.9} color="white">
              {String(text2)}
            </Text>
          )}
        </YStack>
      </TouchableOpacity>
    </View>
  );
};

export const toastConfig: ToastConfig = {
  customToast: (props: CustomToastProps) => <ToastLayout {...props} />,
};
