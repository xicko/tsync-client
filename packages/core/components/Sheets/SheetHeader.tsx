import React from 'react';
import { SheetManager } from 'react-native-actions-sheet';
import { Button, H6, Text, XStack, YStack, XStackProps } from 'tamagui';
import { X } from '@tamagui/lucide-icons';

export interface SheetHeaderProps extends XStackProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  sheetId?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
  rightAction?: React.ReactNode;
}

export const SheetHeader: React.FC<SheetHeaderProps> = ({
  title,
  subtitle,
  sheetId,
  showCloseButton,
  onClose,
  rightAction,
  ...props
}) => {
  const hasCloseAction = Boolean(onClose || sheetId);
  const shouldShowClose = showCloseButton ?? (hasCloseAction && showCloseButton !== false);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (sheetId) {
      SheetManager.hide(sheetId);
    }
  };

  return (
    <XStack justify="space-between" items="center" width="100%" {...props}>
      <YStack flex={1} justify="center">
        {typeof title === 'string' ? <H6 numberOfLines={1}>{title}</H6> : title}
        {typeof subtitle === 'string' ? (
          <Text fontSize="$2" color="$color9" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : (
          subtitle
        )}
      </YStack>

      {rightAction ? (
        rightAction
      ) : shouldShowClose && hasCloseAction ? (
        <Button size="$2" icon={X} aspectRatio={1} chromeless onPress={handleClose} />
      ) : null}
    </XStack>
  );
};

export default SheetHeader;
