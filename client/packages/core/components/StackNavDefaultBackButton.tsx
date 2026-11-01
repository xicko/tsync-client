import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { ArrowLeft } from '@tamagui/lucide-icons';

export const StackNavDefaultBackButton = (overrideCallback?: () => void, overridePadding?: number) => {
  const router = useRouter();

  const onPress = () => {
    if (overrideCallback) {
      overrideCallback();
      return;
    }

    const canGoBack = router.canGoBack();

    if (canGoBack) {
      router.back();
      return;
    }

    router.replace('/tabs/devices');
  };

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      style={{
        padding: overridePadding ?? 10,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onPress={onPress}>
      <ArrowLeft size={22} self={'center'} justify="center" items="center" />
    </TouchableOpacity>
  );
};
