import { createTamagui } from 'tamagui';
import { createAnimations } from '@tamagui/animations-moti';
import { sharedConfig } from '@shared/theme';

export const tamaguiConfig = createTamagui({
  ...sharedConfig,
  animations: createAnimations({
    fast: { type: 'timing', duration: 100 },
    medium: { type: 'timing', duration: 160 },
    slow: { type: 'timing', duration: 220 },
  }),
});

export default tamaguiConfig;
export type Conf = typeof tamaguiConfig;
declare module 'tamagui' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends Conf {}
}
