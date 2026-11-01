import StorageScreen from '@/features/Storage/screens/StorageScreen';
import { StorageFile } from '@/features/Storage/types/storage-file.interface';
import { router, useGlobalSearchParams } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { SheetManager } from 'react-native-actions-sheet';

const StorageScreenImpl: React.FC = () => {
  const { file: fileRawStr }: { file?: string } = useGlobalSearchParams();

  const notificationFile = useMemo(() => {
    try {
      return JSON.parse(fileRawStr!) as StorageFile;
    } catch {
      return null;
    }
  }, [fileRawStr]);

  useEffect(
    function handleSheetRoute() {
      if (!notificationFile) return;
      SheetManager.show('storage-file-actions-sheet', {
        payload: {
          file: notificationFile,
        },
      });
      router.setParams({ file: undefined });
    },
    [notificationFile]
  );

  return <StorageScreen />;
};

export default StorageScreenImpl;
