import { useStorageFilesList } from '../hooks/storage';
import { StorageFileCard } from '../components/StorageFileCard';
import { useCallback, useEffect, useMemo } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Platform, RefreshControl } from 'react-native';
import { useFocusEffect, useGlobalSearchParams } from 'expo-router';
import { Button, ScrollView, Spinner, Text, View, YGroup } from 'tamagui';
import { Upload } from '@tamagui/lucide-icons';
import { SheetManager } from 'react-native-actions-sheet';
import { useSocketStore } from '@/store';
import { StorageFile } from '../types/storage-file.interface';
import { queryClient } from '@/utils';
import { InfiniteData } from '@tanstack/react-query';

const StorageScreen = () => {
  const isWeb = Platform.OS === 'web';
  const socket = useSocketStore((s) => s.socket);

  const { data, refetch, fetchNextPage, hasNextPage, isFetchingNextPage, isRefetching, isLoading } =
    useStorageFilesList();

  const fileList = useMemo(() => {
    return data?.pages?.flatMap((p) => p?.data || []) || [];
  }, [data]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
    if (isCloseToBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const onRefresh = () => {
    refetch();
  };

  useEffect(
    function listenToSocket() {
      if (!socket) return;
      const callback = (action: 'upload' | 'delete', data?: unknown) => {
        const queryKey = ['storage-files-list', undefined];

        if (action === 'delete') {
          const deletedId = data as string;
          if (typeof deletedId === 'string')
            queryClient.setQueryData<InfiniteData<{ data: StorageFile[] }>>(queryKey, (oldData) => {
              if (!oldData) return undefined;
              return {
                ...oldData,
                pages: oldData.pages.map((page) => ({
                  ...page,
                  data: page?.data?.filter((file) => file?._id !== deletedId) || [],
                })),
              };
            });
          return;
        } else if (action === 'upload') {
          const newFile = data as StorageFile;
          if (newFile?._id)
            queryClient.setQueryData<InfiniteData<{ data: StorageFile[] }>>(queryKey, (oldData) => {
              if (!oldData) return undefined;
              return {
                ...oldData,
                pages: oldData?.pages?.map((page, index) =>
                  index === 0 ? { ...page, data: [newFile, ...(page?.data || [])] } : page
                ),
              };
            });
        }
      };
      socket.on('storage', callback);
      return () => {
        socket.off('storage', callback);
      };
    },
    [socket]
  );

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  return (
    <View flex={1} bg="$background" gap="$3" px="$3">
      <View flex={1} gap="$2">
        <ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}>
          {fileList.length === 0 && !isLoading ? (
            <View justify="center" items="center" py="$8">
              <Text color="$color9">No files.</Text>
            </View>
          ) : (
            <View
              {...(isWeb
                ? {
                    style: {
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                      gap: 12,
                      width: '100%',
                    },
                  }
                : {
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: '$2',
                    width: '100%',
                  })}>
              {fileList.map((file) => (
                <StorageFileCard key={file._id} file={file} />
              ))}
            </View>
          )}

          {isFetchingNextPage ? (
            <View height={160} width={'100%'} justify="center" items="center">
              <Spinner size={'large'} color="$color10" />
            </View>
          ) : (
            <View height={160} />
          )}
        </ScrollView>

        {isLoading || isRefetching ? (
          <View
            position="absolute"
            t={0}
            b={0}
            l={0}
            r={0}
            justify={'center'}
            items="center"
            bg={'$background'}
            opacity={0.3}
            pointerEvents="none">
            <Spinner color={'$color12'} size="large" />
          </View>
        ) : null}
      </View>

      <YGroup position="absolute" r={24} b={24}>
        <Button
          themeInverse
          aspectRatio={1}
          icon={<Upload scale={isWeb ? 2 : undefined} />}
          onPress={(e) => {
            e.stopPropagation();
            SheetManager.show('storage-file-upload-sheet');
          }}
        />
      </YGroup>
    </View>
  );
};

export default StorageScreen;
