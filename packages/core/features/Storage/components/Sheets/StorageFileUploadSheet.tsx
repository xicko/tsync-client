import React, { useState } from 'react';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { Button, H6, Text, View, XStack, YStack, useTheme, Spinner } from 'tamagui';
import { ArrowLeft, FileUp, Upload, X } from '@tamagui/lucide-icons';
import * as DocumentPicker from 'expo-document-picker';
import { showToast } from '@/utils/toast';
import { useUploadFile } from '../../hooks/storage';
import { formatFileSize, getFileTypeInfo } from '../../utils/storageUtils';

const StorageFileUploadSheet: React.FC<SheetProps<'storage-file-upload-sheet'>> = ({ sheetId }) => {
  const theme = useTheme();
  const [selectedAsset, setSelectedAsset] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const uploadMutation = useUploadFile();

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedAsset(result.assets[0]);
      }
    } catch (error) {
      if (__DEV__) console.log('Document pick error', error);
      showToast({ text1: 'Failed to pick file' });
    }
  };

  const handleUpload = () => {
    if (!selectedAsset) {
      showToast({ text1: 'Please select a file to upload' });
      return;
    }

    uploadMutation.mutate(
      {
        uri: selectedAsset.uri,
        name: selectedAsset.name,
        type: selectedAsset.mimeType,
        size: selectedAsset.size,
        file: selectedAsset.file,
      },
      {
        onSuccess: (success) => {
          if (success) {
            showToast({ text1: 'File uploaded successfully' });
            setSelectedAsset(null);
            SheetManager.hide(sheetId);
          } else {
            showToast({ text1: 'Failed to upload file' });
          }
        },
        onError: () => {
          showToast({ text1: 'An error occurred during upload' });
        },
      }
    );
  };

  const fileInfo = selectedAsset ? getFileTypeInfo(selectedAsset.name, selectedAsset.mimeType) : null;

  return (
    <ActionSheet
      id={sheetId}
      gestureEnabled={!uploadMutation.isPending}
      containerStyle={{ backgroundColor: theme.background.val }}>
      <View p="$5" gap="$4">
        <H6>Upload File</H6>

        {selectedAsset && fileInfo ? (
          <XStack items="center" gap="$3">
            <View width={44} height={44} bg={fileInfo.bgColor} rounded={8} items="center" justify="center">
              <fileInfo.Icon size={22} color={fileInfo.color} />
            </View>

            <YStack flex={1} minW={0}>
              <Text fontSize="$4" fontWeight="500" numberOfLines={1} ellipsizeMode="tail">
                {selectedAsset.name}
              </Text>

              <Text color="$color8" fontSize="$2" numberOfLines={1}>
                {formatFileSize(selectedAsset.size)}
                {selectedAsset.mimeType ? ` • ${selectedAsset.mimeType}` : ''}
              </Text>
            </YStack>

            <Button
              size="$2"
              chromeless
              aspectRatio={1}
              icon={<X size={16} />}
              onPress={() => setSelectedAsset(null)}
              disabled={uploadMutation.isPending}
            />
          </XStack>
        ) : (
          <Button
            height={160}
            borderWidth={1}
            borderStyle="dashed"
            borderColor="$borderColor"
            bg="$color1"
            onPress={handlePickDocument}
            disabled={uploadMutation.isPending}
            items="center"
            justify="center">
            <YStack items="center" gap="$2">
              <FileUp size={24} color="$color10" />

              <Text color="$color10" fontSize="$3" fontWeight="500">
                Tap to select a file
              </Text>
            </YStack>
          </Button>
        )}

        <XStack gap="$3" mt="$2">
          <Button icon={ArrowLeft} onPress={() => SheetManager.hide(sheetId)} disabled={uploadMutation.isPending}>
            <Text>Cancel</Text>
          </Button>

          <Button
            flex={1}
            themeInverse
            icon={uploadMutation.isPending ? <Spinner color="$color1" /> : <Upload />}
            onPress={handleUpload}
            disabled={!selectedAsset || uploadMutation.isPending}>
            <Text>{uploadMutation.isPending ? 'Uploading...' : 'Upload'}</Text>
          </Button>
        </XStack>

        <View height={16} />
      </View>
    </ActionSheet>
  );
};

export default StorageFileUploadSheet;
