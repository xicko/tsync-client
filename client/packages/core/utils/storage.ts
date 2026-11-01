import { MMKV, Mode } from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'root',
  mode: Mode.MULTI_PROCESS,
});
