import React from 'react';
import { Image as ExpoImage, ImageProps } from 'expo-image';
import { useThemeStore } from '@/store/themeStore';
import androidIcon from '@/assets/images/android600.png';
import appleIcon from '@/assets/images/apple600.png';
import appleDarkIcon from '@/assets/images/apple600dark.png';
import windowsIcon from '@/assets/images/windows600.png';
import linuxIcon from '@/assets/images/linux600.png';

export function getPlatformIconSource(platform?: string | null, theme: 'light' | 'dark' = 'dark') {
  const normalized = platform?.toLowerCase();
  if (normalized === 'windows') return windowsIcon;
  if (normalized === 'macos' || normalized === 'ios' || normalized === 'darwin')
    return theme === 'light' ? appleIcon : appleDarkIcon;
  if (normalized === 'android') return androidIcon;
  if (normalized === 'linux') return linuxIcon;
  return null;
}

export interface PlatformIconProps extends Omit<ImageProps, 'source'> {
  platform?: string | null;
  size?: number;
}

export const PlatformIcon: React.FC<PlatformIconProps> = ({ platform, size = 24, style, ...props }) => {
  const theme = useThemeStore((s) => s.theme);
  const source = getPlatformIconSource(platform, theme);

  if (!source) return null;

  return <ExpoImage source={source} style={[{ width: size, height: size }, style]} {...props} />;
};

export default PlatformIcon;
