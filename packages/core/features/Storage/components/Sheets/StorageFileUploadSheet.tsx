import React, { useState } from 'react';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { Button, H6, Text, View, XStack, YStack, useTheme, Spinner, Switch } from 'tamagui';
import { ArrowLeft, FileUp, Upload, X } from '@tamagui/lucide-icons';
import * as DocumentPicker from 'expo-document-picker';
import { showToast } from '@/utils/toast';
import { useUploadFile } from '../../hooks/storage';
import { formatFileSize, getFileTypeInfo } from '../../utils/storageUtils';
import dayjs from 'dayjs';
import DatePicker from 'react-native-date-picker';
import { Platform } from 'react-native';
import { useThemeStore } from '@/store';
import * as Crypto from 'expo-crypto';
import { File } from 'expo-file-system';
import SparkMD5 from 'spark-md5';

const StorageFileUploadSheet: React.FC<SheetProps<'storage-file-upload-sheet'>> = ({ sheetId }) => {
  const isWeb = Platform.OS === 'web';
  const theme = useTheme();
  const themeState = useThemeStore((s) => s.theme);
  const [selectedAsset, setSelectedAsset] = useState<
    (DocumentPicker.DocumentPickerAsset & { sha256: string; md5: string }) | null
  >(null);
  const [doesExpire, setDoesExpire] = useState<boolean>(!isWeb);
  const [selectedDate, setSelectedDate] = useState<Date>(dayjs().add(3, 'day').toDate());
  const uploadMutation = useUploadFile();

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        let sha256 = null;
        let md5 = null;

        if (!isWeb) {
          const file = new File(result.assets[0].uri);
          const info = file.info({ md5: true });
          if (info.md5) md5 = info.md5 || null;
        }

        const arrayBuffer = await (async () => {
          if (isWeb) return await result.assets[0].file?.arrayBuffer?.();
          const file = new File(result.assets[0].uri);
          return await file.arrayBuffer();
        })();

        if (arrayBuffer) {
          if (!md5) md5 = SparkMD5.ArrayBuffer.hash(arrayBuffer);

          const uint8 = new Uint8Array(arrayBuffer);
          const digest = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, uint8);
          sha256 = Array.from(new Uint8Array(digest))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
        }

        if (!sha256 || !md5) {
          showToast({
            text1: 'Failed to compute hashes of the file',
          });
          return;
        }

        setSelectedAsset({
          ...result.assets[0],
          sha256,
          md5,
        });
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

    if (doesExpire) {
      const now = dayjs().unix();
      const date = dayjs(selectedDate).unix();
      if (date <= now) {
        showToast({ text1: 'Date must be in future' });
        return;
      }
    }

    uploadMutation.mutate(
      {
        fileInput: {
          uri: selectedAsset.uri,
          name: selectedAsset.name,
          type: selectedAsset.mimeType,
          size: selectedAsset.size,
          file: selectedAsset.file,
        },
        sha256: selectedAsset.sha256,
        md5: selectedAsset.md5,
        expiry: doesExpire ? selectedDate : undefined,
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

        {selectedAsset ? (
          <View width="100%" justify="center" items="center" bg="$color2" rounded="$4">
            <XStack
              my="$3"
              px="$4"
              justify="space-between"
              items="center"
              gap="$4"
              width={'100%'}
              onPress={() => setDoesExpire((prev) => !prev)}>
              <Text>Expiry</Text>

              <Switch
                self="flex-end"
                themeInverse={doesExpire}
                checked={doesExpire}
                onCheckedChange={(v) => setDoesExpire(v)}>
                <Switch.Thumb animation="medium" />
              </Switch>
            </XStack>

            {doesExpire ? (
              <>
                {!isWeb ? (
                  <DatePicker
                    mode="datetime"
                    date={selectedDate}
                    onDateChange={setSelectedDate}
                    minimumDate={new Date()}
                  />
                ) : (
                  <XStack width="100%" px="$4" pb="$3" justify="center">
                    <input
                      type="datetime-local"
                      value={dayjs(selectedDate).format('YYYY-MM-DDTHH:mm')}
                      min={dayjs().format('YYYY-MM-DDTHH:mm')}
                      onChange={(e) => {
                        if (e.target.value) setSelectedDate(dayjs(e.target.value).toDate());
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: `1px solid ${theme.borderColor?.val || '#ccc'}`,
                        backgroundColor: theme.background?.val || 'transparent',
                        color: theme.color?.val || 'inherit',
                        fontSize: 14,
                        outline: 'none',
                        colorScheme: themeState,
                      }}
                    />
                  </XStack>
                )}
              </>
            ) : null}
          </View>
        ) : null}

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
