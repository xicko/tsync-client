import { useSocketStore } from '@/store';
import { Text, View, Input, Button, XStack, XGroup, useTheme } from 'tamagui';
import { FlatList, ScrollView } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useEffect, useState } from 'react';
import uuid from 'react-native-uuid';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import dayjs from 'dayjs';
import { Copy } from '@tamagui/lucide-icons';
import { useDeviceStore } from '@/features/Devices/store/deviceStore';
import { MessageType } from '../types/message.interface';

const MessageScreen = () => {
  const tamaguiTheme = useTheme();
  const socket = useSocketStore((s) => s.socket);
  const thisTailscaleDevice = useDeviceStore((s) => s.thisTailscaleDevice);
  const [input, setInput] = useState('');

  const [messages, setMessages] = useState<MessageType[]>([]);

  async function onSend() {
    if (!socket) return;
    if (!input) return;
    if (!thisTailscaleDevice) return;

    const id = uuid.v4();
    const msg: MessageType = {
      id,
      message: input,
      timestamp: Date.now(),
      tailscaleDeviceData: {
        id: thisTailscaleDevice.id,
        name: thisTailscaleDevice.name,
        addresses: thisTailscaleDevice.addresses,
      },
    };
    socket.emit('realtimeNote', JSON.stringify(msg));
    setInput('');
  }

  useEffect(
    function listenToSocket() {
      if (!socket) return;
      const callback = (message: any) => {
        try {
          let parsed: MessageType;
          if (typeof message === 'string') {
            parsed = JSON.parse(message);
          } else if (message?.data && typeof message.data === 'string') {
            parsed = JSON.parse(message.data);
          } else {
            parsed = message;
          }
          if (parsed?.id) setMessages((prev) => [parsed, ...prev]);
        } catch (error) {
          console.error('Failed to parse message', error);
        }
      };
      socket.on('realtimeNote', callback);
      return () => {
        socket.off('realtimeNote', callback);
      };
    },
    [socket]
  );

  async function onCopy(message: string) {
    await Clipboard.setStringAsync(message);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  return (
    <View flex={1} px="$3" pb="$3" bg="$background">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={112}>
        <FlatList
          data={messages}
          inverted
          removeClippedSubviews={false}
          style={{
            flex: 1,
            backgroundColor: tamaguiTheme.color2.val,
            borderRadius: 8,
            overflow: 'hidden',
          }}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          ItemSeparatorComponent={() => <View height={16} />}
          renderItem={({ item }) => {
            const isMe = item.tailscaleDeviceData.id === thisTailscaleDevice?.id;
            return (
              <View rounded={4} bg="transparent" px="$4" py="$4" gap={'$2.5'}>
                <XStack justify="space-between">
                  <Text
                    fontSize={11}
                    opacity={0.7}
                    color={isMe ? tamaguiTheme.brand8 : undefined}
                    fontWeight={isMe ? 'bold' : 'normal'}>
                    {item.tailscaleDeviceData.name?.split('.')[0] || 'Unknown'}
                  </Text>

                  <Text fontSize={11} opacity={0.7}>
                    {dayjs(item.timestamp).format('YY/MM/DD HH:mm')}
                  </Text>
                </XStack>

                <ScrollView style={{ maxHeight: 360 }} nestedScrollEnabled showsVerticalScrollIndicator={true}>
                  <Text select="text">{item.message}</Text>
                </ScrollView>

                <Button
                  self="flex-end"
                  size={'$3'}
                  icon={Copy}
                  bg="transparent"
                  borderWidth={1}
                  borderColor={'$borderColor'}
                  onPress={() => onCopy(item.message)}>
                  <Text>Copy all</Text>
                </Button>
              </View>
            );
          }}
        />

        <XGroup mt={'$4'} maxH={220}>
          <Input
            placeholder="Message..."
            borderWidth={1}
            borderColor={'$borderColor'}
            flex={1}
            value={input}
            multiline
            onChangeText={setInput}
            height="auto"
          />
          <Button height="auto" onPress={onSend} borderWidth={1} borderLeftWidth={0} borderColor={'$borderColor'}>
            Send
          </Button>
        </XGroup>
      </KeyboardAvoidingView>
    </View>
  );
};

export default MessageScreen;
