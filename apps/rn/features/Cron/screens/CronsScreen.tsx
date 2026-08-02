import { FlatList, RefreshControl, Alert, Platform } from 'react-native';
import { Button, Spinner, Text, View, XStack, YStack, Switch, YGroup } from 'tamagui';
import dayjs from 'dayjs';
import { useCrons, useToggleCron, useTriggerCron, useDeleteCron, useReinitCrons } from '@/features/Cron/hooks/crons';
import { CronJobInfo } from '@/features/Cron/controller/cronController';
import { showToast } from '@/utils/toast';
import { SheetManager } from 'react-native-actions-sheet';
import { Plus, RefreshCcw } from '@tamagui/lucide-icons';

export default function CronsScreen() {
  const { data: crons = [], isLoading, isRefetching, refetch } = useCrons();
  const toggleCronMutation = useToggleCron();
  const triggerCronMutation = useTriggerCron();
  const deleteCronMutation = useDeleteCron();
  const reinitMutation = useReinitCrons();

  const isWeb = Platform.OS === 'web';

  const onRefresh = () => {
    refetch();
  };

  const toggleCron = async (cron: CronJobInfo) => {
    toggleCronMutation.mutate(cron, {
      onError: () => {
        showToast({
          text1: `Failed to toggle job ${cron.name}`,
        });
      },
    });
  };

  const triggerCron = async (cronName: string) => {
    triggerCronMutation.mutate(cronName, {
      onSuccess: () => {
        showToast({ text1: `Job ${cronName} triggered successfully` });
      },
      onError: () => {
        showToast({ text1: `Failed to trigger job ${cronName}` });
      },
    });
  };

  const deleteCron = async (cronName: string) => {
    Alert.alert('Delete', `Are you sure you want to delete ${cronName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteCronMutation.mutate(cronName, {
            onSuccess: () => showToast({ text1: `${cronName} deleted` }),
            onError: () => showToast({ text1: `Failed to delete ${cronName}` }),
          });
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View flex={1} justify="center" items="center" bg="$background">
        <Spinner size="large" />
      </View>
    );
  }

  return (
    <View flex={1} bg="$background">
      <FlatList
        data={crons}
        keyExtractor={(item) => item.name}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 13, gap: 13 }}
        ListFooterComponent={<View height={120} />}
        renderItem={({ item }) => (
          <YStack bg="$background" borderColor={'$borderColor'} borderWidth={1} p="$4" rounded="$4" gap="$2">
            <XStack justify="space-between" items="center">
              <Text fontWeight="bold" fontSize="$5">
                {item.name}
              </Text>
              <Switch size="$3" themeInverse checked={item.isActive} onCheckedChange={() => toggleCron(item)}>
                <Switch.Thumb animation="medium" />
              </Switch>
            </XStack>
            <XStack gap="$2">
              <Text color="$color10" fontSize="$3">
                Type: {item.type}
              </Text>
              <Text color="$color10" fontSize="$3">
                Int: {item.cronExpression}
              </Text>
            </XStack>
            <Text color="$color10" fontSize="$2" numberOfLines={2}>
              Data: {JSON.stringify(item.data)}
            </Text>

            {item.lastLog && (
              <XStack items="center" gap="$2" mt="$2">
                <Text color={item.lastLog.status === 'SUCCESS' ? '$green9' : '$red9'}>{item.lastLog.status}</Text>
                <Text color="$color10" fontSize="$2" flex={1}>
                  {dayjs(item.lastLog.createdAt).format('YYYY-MM-DD HH:mm:ss')} ({item.lastLog.durationMs}ms)
                </Text>
              </XStack>
            )}

            <XStack justify="flex-end" gap="$2" mt="$2">
              <Button size="$3" bg="transparent" color="$red9" onPress={() => deleteCron(item.name)}>
                Delete
              </Button>
              <Button size="$3" themeInverse onPress={() => triggerCron(item.name)}>
                Run
              </Button>
            </XStack>
          </YStack>
        )}
      />

      <YGroup position="absolute" r={24} b={24}>
        <Button
          themeInverse
          aspectRatio={1}
          icon={<RefreshCcw scale={isWeb ? 2 : undefined} />}
          onPress={() => {
            Alert.alert('Re-init System', 'Are you sure you want to re-init system crons?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Re-init',
                style: 'destructive',
                onPress: () => {
                  reinitMutation.mutate(undefined, {
                    onSuccess: () => showToast({ text1: 'System Crons Reinitialized' }),
                    onError: () => showToast({ text1: 'System Reinit failed' }),
                  });
                },
              },
            ]);
          }}
        />

        <Button
          themeInverse
          aspectRatio={1}
          icon={<Plus scale={isWeb ? 2 : undefined} />}
          onPress={() => SheetManager.show('cron-create-sheet')}
        />
      </YGroup>
    </View>
  );
}
