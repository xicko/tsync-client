import { Button, H6, Text, useTheme, View, YGroup, YStack } from 'tamagui';
import ActionSheet, { ScrollView, SheetManager, SheetProps } from 'react-native-actions-sheet';
import { Plus } from '@tamagui/lucide-icons';
import { useDeviceStore } from '@/features/Devices/store/deviceStore';
import { useMemo } from 'react';
import { useDenylistList, useDeleteDenylistItem } from '../../hooks/denylist';
import { NativeScrollEvent, NativeSyntheticEvent, RefreshControl, Alert, Platform } from 'react-native';
import { showToast } from '@/utils/toast';

const DenylistListSheet: React.FC<SheetProps<'denylist-list-sheet'>> = ({ sheetId, payload }) => {
  const theme = useTheme();
  const tailscaleDevices = useDeviceStore((s) => s.devices);

  const { data, isLoading, hasNextPage, isFetchingNextPage, isRefetching, fetchNextPage, refetch } = useDenylistList();
  const deleteMutation = useDeleteDenylistItem();

  const denylist = useMemo(() => {
    return data?.pages.flatMap((f) => f?.data || []) || [];
  }, [data]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
    if (isCloseToBottom && hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  const performDelete = (itemId: string) => {
    deleteMutation.mutate(itemId, {
      onSuccess: (success) => {
        if (success) {
          showToast({ text1: 'Item deleted from denylist' });
        } else {
          showToast({ text1: 'Failed to delete item' });
        }
      },
      onError: () => {
        showToast({ text1: 'An error occurred while deleting' });
      },
    });
  };

  const handleLongPress = (item: any) => {
    const displayValue = item.type === 'text' ? item.text : item.packageIdentifier;

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to delete "${displayValue}" from the denylist?`);
      if (confirmed) {
        performDelete(item._id);
      }
    } else {
      Alert.alert('Delete Denylist Item', `Are you sure you want to delete "${displayValue}" from the denylist?`, [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => performDelete(item._id),
        },
      ]);
    }
  };

  return (
    <ActionSheet id={sheetId} gestureEnabled={false} containerStyle={{ backgroundColor: theme.background.val }}>
      <View p={'$4'} gap={'$3'}>
        <View>
          <H6>Denylist</H6>
        </View>

        <ScrollView
          style={{ borderRadius: 8, overflow: 'hidden' }}
          onScroll={onScroll}
          refreshControl={<RefreshControl refreshing={isLoading || isRefetching} onRefresh={refetch} />}>
          <YGroup gap={'$0.5'}>
            {denylist.map((item) => (
              <Button
                key={item._id}
                height="auto"
                py={'$3'}
                onLongPress={() => handleLongPress(item)}
                disabled={deleteMutation.isPending}>
                <YStack items="flex-start" flex={1}>
                  <Text>{item.type}</Text>

                  {item.text || item.packageIdentifier ? (
                    <Text>
                      {(() => {
                        if (item.type === 'text') return item.text || '';
                        if (item.type === 'packageIdentifier') return item.packageIdentifier || '';
                      })()}
                    </Text>
                  ) : null}

                  {item.tailscaleId ? (
                    <Text>{tailscaleDevices.find((d) => d.id === item.tailscaleId)?.name?.split('.')[0] || ''}</Text>
                  ) : null}
                </YStack>
              </Button>
            ))}
          </YGroup>
        </ScrollView>

        <Button
          themeInverse
          icon={Plus}
          onPress={() => SheetManager.show('denylist-creation-sheet')}
          disabled={deleteMutation.isPending}>
          <Text>Add</Text>
        </Button>
      </View>
    </ActionSheet>
  );
};

export default DenylistListSheet;
