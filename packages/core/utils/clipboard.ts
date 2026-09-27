import * as Clipboard from 'expo-clipboard';
import { showToast } from './toast';

export async function onCopy(text: string) {
  const res = await Clipboard.setStringAsync(text);
  if (!res) {
    showToast({
      text1: 'Failed to copy',
    });
    return;
  }

  showToast({
    text1: 'Copied to clipboard',
  });
}
