import React, { useState, useMemo, useCallback } from 'react';
import ActionSheet, { SheetProps, SheetManager, FlatList } from 'react-native-actions-sheet';
import { Button, Input, XStack, YStack, Text, H6, useTheme, Spinner, useWindowDimensions } from 'tamagui';
import { ClipboardCopy, Search, X } from '@tamagui/lucide-icons';
import { getTsyncNative } from '@/store/tsyncNativeStore';
import * as Clipboard from 'expo-clipboard';
import { showToast } from '@/utils/toast';
import { Platform, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

interface AppInfo {
  name: string;
  packageName: string;
}

const AppItem = React.memo(
  ({
    app,
    onCopy,
    isFirst,
    isLast,
  }: {
    app: AppInfo;
    onCopy: (pkg: string, name: string) => void;
    isFirst: boolean;
    isLast: boolean;
  }) => {
    return (
      <Button
        height="auto"
        py="$3"
        px="$4"
        justify="flex-start"
        onPress={() => onCopy(app.packageName, app.name)}
        style={{
          borderTopLeftRadius: isFirst ? undefined : 0,
          borderTopRightRadius: isFirst ? undefined : 0,
          borderBottomLeftRadius: isLast ? undefined : 0,
          borderBottomRightRadius: isLast ? undefined : 0,
        }}>
        <XStack flex={1} justify="space-between" items="center">
          <YStack flex={1} items="flex-start" gap="$0.5">
            <Text fontSize="$4" fontWeight="600" numberOfLines={1}>
              {app.name}
            </Text>
            <Text fontSize="$2" color="$color9" numberOfLines={1}>
              {app.packageName}
            </Text>
          </YStack>
          <Button
            size="$2.5"
            aspectRatio={1}
            icon={ClipboardCopy}
            chromeless
            onPress={(e) => {
              e.stopPropagation();
              onCopy(app.packageName, app.name);
            }}
          />
        </XStack>
      </Button>
    );
  }
);

const InstalledAppsSheet: React.FC<SheetProps<'installed-apps-sheet'>> = ({ sheetId }) => {
  const theme = useTheme();
  const dimensions = useWindowDimensions();
  const [search, setSearch] = useState('');

  const isAndroid = Platform.OS === 'android';

  const {
    data: apps = [],
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['installed-apps'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const res = getTsyncNative().retrieveApps();
      if (!res) return [];
      const parsed: AppInfo[] = JSON.parse(res);
      parsed.sort((a, b) => a.name.localeCompare(b.name));
      return parsed;
    },
    enabled: isAndroid,
    staleTime: 1000 * 60 * 5,
  });

  const displayError = useMemo(() => {
    if (!isAndroid) {
      return 'Installed apps query is only supported on Android.';
    }
    if (queryError) {
      return queryError instanceof Error ? queryError.message : String(queryError);
    }
    return null;
  }, [isAndroid, queryError]);

  const filteredApps = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return apps;
    return apps.filter(
      (app) => app.name.toLowerCase().includes(query) || app.packageName.toLowerCase().includes(query)
    );
  }, [search, apps]);

  const handleCopyPackageName = useCallback(async (pkg: string, name: string) => {
    await Clipboard.setStringAsync(pkg);
    showToast({
      text1: 'Copied Package Name',
      text2: `${name} (${pkg})`,
    });
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: AppInfo; index: number }) => {
      const isFirst = index === 0;
      const isLast = index === filteredApps.length - 1;
      return <AppItem app={item} onCopy={handleCopyPackageName} isFirst={isFirst} isLast={isLast} />;
    },
    [handleCopyPackageName, filteredApps.length]
  );

  return (
    <ActionSheet id={sheetId} gestureEnabled={false} containerStyle={{ backgroundColor: theme.background.val }}>
      <YStack p="$5" gap="$3" maxH={dimensions.height * 0.84}>
        <XStack justify="space-between" items="center">
          <H6>Installed Applications</H6>
          <Button size="$2" icon={X} aspectRatio={1} chromeless onPress={() => SheetManager.hide(sheetId)} />
        </XStack>

        {displayError ? (
          <YStack p="$4" items="center" justify="center">
            <Text color="$red7" style={{ textAlign: 'center' }}>
              {displayError}
            </Text>
          </YStack>
        ) : isLoading ? (
          <YStack p="$8" items="center" justify="center" gap="$2">
            <Spinner size="large" />
            <Text color="$color9">Fetching installed apps...</Text>
          </YStack>
        ) : (
          <>
            <XStack items="center" px="$3" py="$1" rounded="$4" borderWidth={1} borderColor="$borderColor">
              <Search size={18} color="$color9" />
              <Input
                flex={1}
                placeholder="Search app or package name..."
                placeholderTextColor="$color9"
                value={search}
                onChangeText={setSearch}
                autoCorrect={false}
                autoComplete="off"
                autoCapitalize="none"
                px="$3"
                py="$2"
                borderColor={'transparent'}
                borderWidth={0}
                bg="transparent"
              />
              {search.length > 0 && (
                <Button size="$2" aspectRatio={1} icon={X} chromeless onPress={() => setSearch('')} />
              )}
            </XStack>

            <FlatList
              data={filteredApps}
              keyExtractor={(item) => item.packageName}
              renderItem={renderItem}
              style={{ borderRadius: 8, overflow: 'hidden' }}
              initialNumToRender={15}
              maxToRenderPerBatch={15}
              windowSize={10}
              removeClippedSubviews={Platform.OS === 'android'}
              ListEmptyComponent={
                <YStack p="$6" items="center" justify="center">
                  <Text color="$color9">No applications found</Text>
                </YStack>
              }
              ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
            />
          </>
        )}
      </YStack>
    </ActionSheet>
  );
};

export default InstalledAppsSheet;
