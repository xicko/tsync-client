import React from 'react';
import { Alert, Platform } from 'react-native';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { Button, H6, Spinner, Text, View, XStack, YStack, useTheme } from 'tamagui';
import { Download, Trash2 } from '@tamagui/lucide-icons';
import { formatFileSize, getFileTypeInfo } from '../../utils/storageUtils';
import { downloadFile } from '../../controller/storageController';
import { useDeleteFile } from '../../hooks/storage';
import { showToast } from '@/utils/toast';

const StorageFileActionsSheet: React.FC<SheetProps<'storage-file-actions-sheet'>> = ({ sheetId, payload }) => {
  const file = payload?.file;
  const theme = useTheme();
  const deleteMutation = useDeleteFile();

  if (!file) return null;

  const { Icon, color, bgColor } = getFileTypeInfo(file.name, file.mimetype);

  const handleDownload = async () => {
    showToast({ text1: `Starting download for ${file.name}` });
    const success = await downloadFile(file._id, file.name);
    if (!success) {
      showToast({ text1: 'Failed to download file' });
    }
    SheetManager.hide(sheetId);
  };

  const executeDelete = () => {
    deleteMutation.mutate(file._id, {
      onSuccess: (success) => {
        if (success) {
          showToast({ text1: `${file.name} deleted` });
          SheetManager.hide(sheetId);
        } else {
          showToast({ text1: 'Failed to delete file' });
        }
      },
      onError: () => {
        showToast({ text1: 'Failed to delete file' });
      },
    });
  };

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      const confirmed =
        typeof window !== 'undefined' ? window.confirm(`Are you sure you want to delete "${file.name}"?`) : true;
      if (confirmed) {
        executeDelete();
      }
      return;
    }

    Alert.alert('Delete file', `Are you sure you want to delete "${file.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: executeDelete,
      },
    ]);
  };

  return (
    <ActionSheet
      id={sheetId}
      gestureEnabled={!deleteMutation.isPending}
      containerStyle={{ backgroundColor: theme.background.val }}>
      <View p="$5" gap="$3">
        <XStack items="center" gap="$3" pb="$2">
          <View width={44} height={44} bg={bgColor} rounded={8} items="center" justify="center">
            <Icon size={22} color={color} />
          </View>

          <YStack flex={1} minW={0}>
            <H6 numberOfLines={1} ellipsizeMode="tail">
              {file.name}
            </H6>
            <Text color="$color9" fontSize="$2" numberOfLines={1}>
              {formatFileSize(file.sizeBytes)}
              {file.mimetype ? ` • ${file.mimetype}` : ''}
            </Text>
          </YStack>
        </XStack>

        {/* Actions */}
        <Button
          icon={Download}
          justify="flex-start"
          themeInverse
          disabled={deleteMutation.isPending}
          onPress={handleDownload}>
          <Text>Download</Text>
        </Button>

        <Button
          icon={deleteMutation.isPending ? <Spinner color="$red10" /> : Trash2}
          justify="flex-start"
          theme="red"
          disabled={deleteMutation.isPending}
          onPress={handleDelete}>
          <Text color="$red10">{deleteMutation.isPending ? 'Deleting...' : 'Delete'}</Text>
        </Button>

        <View height={24} />
      </View>
    </ActionSheet>
  );
};

export default StorageFileActionsSheet;
