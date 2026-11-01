import { StyleProp, TextStyle } from 'react-native';
import Toast from 'react-native-toast-message';

export function showToast(options: {
  text1: string;
  text1Style?: StyleProp<TextStyle>;
  text2?: string;
  text2Style?: StyleProp<TextStyle>;
  duration?: number;
}) {
  Toast.show({
    type: 'customToast',
    swipeable: true,
    text1: options.text1,
    text1Style: options.text1Style,
    text2: options.text2,
    text2Style: options.text2Style,
    position: 'top',
    visibilityTime: options.duration,
  });
}
