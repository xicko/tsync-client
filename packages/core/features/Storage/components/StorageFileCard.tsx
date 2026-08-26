import React from 'react';
import { Platform } from 'react-native';
import { Button, Text, View, YStack } from 'tamagui';
import { SheetManager } from 'react-native-actions-sheet';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { StorageFile } from '../types/storage-file.interface';
import { formatFileSize, getFileTypeInfo } from '../utils/storageUtils';

dayjs.extend(relativeTime);

interface StorageFileCardProps {
  file: StorageFile;
  onPress?: (file: StorageFile) => void;
}

export const StorageFileCard: React.FC<StorageFileCardProps> = ({ file, onPress }) => {
  const isWeb = Platform.OS === 'web';
  const now = dayjs();
  const timestamp = dayjs(file.createdAt || file.updatedAt);
  let format = 'MM/DD - HH:mm:ss';
  if (timestamp.year() !== now.year()) format = 'YYYY/MM/DD - HH:mm:ss';

  const { Icon, color, bgColor } = getFileTypeInfo(file.name, file.mimetype);

  return (
    <Button
      key={file._id}
      height={'auto'}
      py="$3"
      px="$3"
      flexDirection="column"
      items="flex-start"
      justify="flex-start"
      gap="$2"
      rounded={8}
      width={isWeb ? '100%' : '48.5%'}
      overflow="hidden"
      onPress={(e) => {
        e.stopPropagation();
        if (onPress) {
          onPress(file);
        } else {
          SheetManager.show('storage-file-actions-sheet', {
            payload: {
              file,
            },
          });
        }
      }}
      style={{
        flexGrow: isWeb ? 0 : 1,
        textAlign: 'left',
        minWidth: 0,
        maxWidth: '100%',
      }}>
      <View width={40} height={40} bg={bgColor} rounded={8} items="center" justify="center">
        <Icon size={20} color={color} />
      </View>

      <YStack
        flex={1}
        width="100%"
        minW={0}
        maxW="100%"
        items="flex-start"
        gap="$1"
        style={{ minWidth: 0, maxWidth: '100%' }}>
        <Text
          fontSize={'$4'}
          fontWeight={600}
          numberOfLines={2}
          ellipsizeMode="tail"
          width="100%"
          style={{
            textAlign: 'left',
            wordBreak: 'break-all',
            overflowWrap: 'anywhere',
          }}>
          {file.name}
        </Text>

        <Text
          color="$color8"
          fontSize={'$3'}
          numberOfLines={1}
          ellipsizeMode="tail"
          width="100%"
          style={{
            textAlign: 'left',
            wordBreak: 'break-all',
          }}>
          {formatFileSize(file.sizeBytes)}
          {file.mimetype ? ` • ${file.mimetype}` : ''}
        </Text>

        <Text
          color="$color8"
          fontSize={'$2'}
          numberOfLines={2}
          width="100%"
          style={{
            textAlign: 'left',
          }}>
          {timestamp.format(format)} ({timestamp.fromNow()})
        </Text>
      </YStack>
    </Button>
  );
};
