import { createTamagui } from 'tamagui';
import { createAnimations } from '@tamagui/animations-css';
import { sharedConfig } from '@shared/theme';

export const tamaguiConfig = createTamagui({
  ...sharedConfig,
  animations: createAnimations({
    fast: 'ease-in 150ms',
    medium: 'ease-in 300ms',
    slow: 'ease-in 450ms',
  }),
});

export default tamaguiConfig;
export type Conf = typeof tamaguiConfig;
declare module 'tamagui' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface TamaguiCustomConfig extends Conf {}
}
