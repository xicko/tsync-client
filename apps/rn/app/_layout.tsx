import tsyncnativeModule from '../modules/tsyncnative';
import { useTsyncNativeStore } from '@/store';
import RootLayout from '../layouts/RootLayout';

useTsyncNativeStore.getState().setImpl(tsyncnativeModule);

export default RootLayout;
