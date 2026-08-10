import { useSocketStore } from '@/store';
import { showToast } from '@/utils/toast';
import androidIcon from '@/assets/images/android600.png';
import {
  ArrowDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CornerDownLeft,
  Home,
  Keyboard,
  Lock,
  Menu,
  Play,
  RotateCcw,
  Send,
  Unlock,
  Volume1,
  Volume2,
  VolumeX,
} from '@tamagui/lucide-icons';
import { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, OpaqueColorValue, Platform } from 'react-native';
import {
  Button,
  Card,
  H4,
  Input,
  Paragraph,
  Separator,
  SizableText,
  Tabs,
  Text,
  View,
  XGroup,
  XStack,
  YStack,
  ScrollView,
  GetThemeValueForKey,
} from 'tamagui';
import { TailscaleDevice } from '@shared/types';
import { SheetManager } from 'react-native-actions-sheet';
import { Image as ExpoImage } from 'expo-image';
import { ShellEventPayload } from '@/types/shell.interface';

const QuickActionButton = ({
  icon,
  label,
  onPress,
  theme,
  bg,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  theme?: any;
  bg?: GetThemeValueForKey<'backgroundColor'> | OpaqueColorValue | null | undefined;
}) => (
  <Button
    aspectRatio={1}
    flex={1}
    icon={icon}
    flexDirection="column"
    height={70}
    p={0}
    theme={theme}
    onPress={onPress}
    bg={bg}
    rounded="$4">
    <Text fontSize="$1" mt={-4}>
      {label}
    </Text>
  </Button>
);

type TabType = 'terminal' | 'actions' | 'tools';

const ShellScreen = () => {
  const socket = useSocketStore((s) => s.socket);

  const [selectedDevice, setSelectedDevice] = useState<TailscaleDevice | null>(null);
  const [selectedTab, setSelectedTab] = useState<TabType>('terminal');

  const [input, setInput] = useState<string>('');
  const [unlockPassword, setUnlockPassword] = useState<string>('');
  const [quickText, setQuickText] = useState<string>('');
  const [results, setResults] = useState<{ text: string; id: string; timestamp: Date }[]>([]);
  const flatListRef = useRef<FlatList>(null);

  const onSendAdbCommand = (cmd: string = input) => {
    if (!cmd.trim() || !selectedDevice?.id || !cmd.startsWith('adb ')) return;

    const payload: ShellEventPayload = {
      deviceId: selectedDevice.id,
      type: 'ADB',
      command: cmd.split('adb ')[1] || '',
    };

    socket?.emit('message', JSON.stringify(payload));
    if (cmd === input) setInput('');
  };

  const onUnlock = () => {
    if (!unlockPassword.trim() || !selectedDevice?.id) return;
    socket?.emit('message', `adb_unlock:${selectedDevice.id}:${unlockPassword}`);
    setUnlockPassword('');
    showToast({
      text1: 'Unlocking...',
    });
  };

  const sendKey = (keycode: number | string) => {
    if (!selectedDevice?.id) return;

    const payload: ShellEventPayload = {
      deviceId: selectedDevice.id,
      type: 'ADB',
      command: `shell input keyevent ${keycode}`,
    };

    socket?.emit('message', JSON.stringify(payload));
  };

  const sendSwipe = (direction: 'up' | 'down' | 'left' | 'right' | 'statusbar') => {
    if (!selectedDevice?.id) return;

    const commands = {
      up: '500 1500 500 500',
      down: '500 500 500 1500',
      left: '800 1000 200 1000',
      right: '200 1000 800 1000',
      statusbar: '500 0 500 1500',
    } as const;

    const payload: ShellEventPayload = {
      deviceId: selectedDevice.id,
      type: 'ADB',
      command: `shell input swipe ${commands[direction]}`,
    };

    socket?.emit('message', JSON.stringify(payload));
  };

  useEffect(() => {
    if (!socket) return;
    const callback = (res: string) => {
      setResults((prev) => [
        {
          text: res || 'Empty response',
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date(),
        },
        ...prev,
      ]);
    };
    socket.on('shell_stdout', callback);
    return () => {
      socket.off('shell_stdout', callback);
    };
  }, [socket]);

  const onDeviceSelector = () => {
    SheetManager.show('shell-device-selector-sheet', {
      payload: {
        onSelect: (device: TailscaleDevice) => {
          setSelectedDevice(device);
        },
        selectedDeviceId: selectedDevice?.id,
      },
    });
  };

  const onSendQuickText = () => {
    if (quickText) {
      onSendAdbCommand(`adb shell input text "${quickText}"`);
      setQuickText('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={100}>
      <View flex={1} bg="$background">
        {/* Device Selector */}
        <Button
          chromeless
          rounded={0}
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
          size="$3"
          justify="center"
          items="center"
          py={'$2'}
          pressStyle={{
            bg: '$backgroundHover',
          }}
          onPress={onDeviceSelector}>
          <XStack gap={'$2'} items="center">
            <ExpoImage source={androidIcon} style={{ width: 18, height: 18 }} />
            <Text>{selectedDevice?.name?.split('.')[0] || 'Select Device'}</Text>
          </XStack>
        </Button>

        <Tabs
          defaultValue="terminal"
          flexDirection="column"
          orientation="horizontal"
          flex={1}
          activationMode="manual"
          onValueChange={(val) => setSelectedTab(val as TabType)}>
          <Tabs.List bg="$background" rounded={0} borderBottomWidth={1} borderBottomColor="$borderColor">
            <Tabs.Tab
              value="terminal"
              flex={1}
              pressStyle={{ bg: 'transparent' }}
              borderBottomWidth={selectedTab === 'terminal' ? 1 : 0}
              borderBottomColor="$color12">
              <SizableText>Terminal</SizableText>
            </Tabs.Tab>
            <Tabs.Tab
              value="actions"
              flex={1}
              pressStyle={{ bg: 'transparent' }}
              borderBottomWidth={selectedTab === 'actions' ? 1 : 0}
              borderBottomColor="$color12">
              <SizableText>Actions</SizableText>
            </Tabs.Tab>
            <Tabs.Tab
              value="tools"
              flex={1}
              pressStyle={{ bg: 'transparent' }}
              borderBottomWidth={selectedTab === 'tools' ? 1 : 0}
              borderBottomColor="$color12">
              <SizableText>Tools</SizableText>
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Content value="terminal" flex={1} pt={0} px="$3" pb="$3">
            <YStack flex={1} gap="$4">
              <FlatList
                ref={flatListRef}
                data={results}
                inverted
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ gap: 10, paddingBottom: 10 }}
                renderItem={({ item }) => (
                  <Card p="$3" bg="$backgroundHover" bordered elevate={false} borderRadius="$3">
                    <XStack justify="space-between" mb="$1">
                      <Text fontSize="$1" color="$colorFocus" opacity={0.6}>
                        {item.timestamp.toLocaleTimeString()}
                      </Text>
                    </XStack>
                    <Text fontSize="$3">{item.text}</Text>
                  </Card>
                )}
                ListEmptyComponent={
                  <View flex={1} items="center" justify="center" py="$10" opacity={0.5}>
                    <Text>No output yet. Start by sending a command.</Text>
                  </View>
                }
              />

              <XStack gap="$2" items="center">
                <XGroup flex={1} bordered bg="$backgroundFocus">
                  <Input
                    placeholder="Enter ADB command..."
                    flex={1}
                    value={input}
                    borderWidth={0}
                    onChangeText={setInput}
                    onSubmitEditing={() => onSendAdbCommand()}
                  />
                  <Button icon={Send} chromeless onPress={() => onSendAdbCommand()} />
                </XGroup>
              </XStack>
            </YStack>
          </Tabs.Content>

          <Tabs.Content value="actions" flex={1}>
            <ScrollView p="$3">
              <YStack gap="$5">
                {/* SYSTEM */}
                <YStack gap="$2">
                  <H4 size="$4">System</H4>

                  <XStack gap="$2">
                    <QuickActionButton icon={Lock} label="Lock" onPress={() => sendKey(223)} />

                    <QuickActionButton
                      icon={ArrowDown}
                      label="Open status bar"
                      onPress={() => sendSwipe('statusbar')}
                    />
                  </XStack>
                </YStack>

                <Separator />

                {/* MEDIA */}
                <YStack gap="$2">
                  <H4 size="$4">Media</H4>

                  <XStack gap="$2">
                    <QuickActionButton icon={VolumeX} label="Mute" onPress={() => sendKey(164)} />
                    <QuickActionButton icon={Volume2} label="Vol Up" onPress={() => sendKey(24)} />
                  </XStack>

                  <XStack gap="$2">
                    <QuickActionButton icon={Play} label="Play/Pause" onPress={() => sendKey(85)} />
                    <QuickActionButton icon={Volume1} label="Vol Down" onPress={() => sendKey(25)} />
                  </XStack>
                </YStack>

                {/* NAVIGATION/JOYSTICK */}
                <YStack gap="$2">
                  <H4 size="$4">Navigation</H4>

                  {/* Joystick */}
                  <>
                    <XStack gap="$2">
                      <QuickActionButton label="" icon={<View />} onPress={() => {}} bg={'transparent'} />
                      <QuickActionButton icon={ChevronUp} label="Up" onPress={() => sendKey(19)} />
                      <QuickActionButton label="" icon={<View />} onPress={() => {}} bg={'transparent'} />
                    </XStack>

                    <XStack gap="$2">
                      <QuickActionButton icon={ChevronLeft} label="Left" onPress={() => sendKey(21)} />

                      <QuickActionButton icon={CornerDownLeft} label="Enter" onPress={() => sendKey(66)} />

                      <QuickActionButton icon={ChevronRight} label="Right" onPress={() => sendKey(22)} />
                    </XStack>

                    <XStack gap="$2">
                      <QuickActionButton label="" icon={<View />} onPress={() => {}} bg={'transparent'} />
                      <QuickActionButton icon={ChevronDown} label="Down" onPress={() => sendKey(20)} />
                      <QuickActionButton label="" icon={<View />} onPress={() => {}} bg={'transparent'} />
                    </XStack>
                  </>

                  <XStack gap="$2">
                    <QuickActionButton icon={RotateCcw} label="Back" onPress={() => sendKey(4)} />
                    <QuickActionButton icon={Home} label="Home" onPress={() => sendKey(3)} />
                    <QuickActionButton icon={Menu} label="Recents" onPress={() => sendKey(187)} />
                  </XStack>
                </YStack>

                <Separator />

                {/* SWIPE */}
                <YStack gap="$2">
                  <H4 size="$4">Swipes</H4>
                  <XStack gap="$2">
                    <QuickActionButton label="" icon={<View />} onPress={() => {}} bg={'transparent'} />
                    <QuickActionButton icon={ChevronUp} label="Up" onPress={() => sendSwipe('up')} />
                    <QuickActionButton label="" icon={<View />} onPress={() => {}} bg={'transparent'} />
                  </XStack>

                  <XStack gap="$2">
                    <QuickActionButton icon={ChevronLeft} label="Left" onPress={() => sendSwipe('left')} />

                    <QuickActionButton icon={<View />} label="" onPress={() => {}} bg={'transparent'} />

                    <QuickActionButton icon={ChevronRight} label="Right" onPress={() => sendSwipe('right')} />
                  </XStack>

                  <XStack gap="$2">
                    <QuickActionButton label="" icon={<View />} onPress={() => {}} bg={'transparent'} />
                    <QuickActionButton icon={ChevronDown} label="Down" onPress={() => sendSwipe('down')} />
                    <QuickActionButton label="" icon={<View />} onPress={() => {}} bg={'transparent'} />
                  </XStack>
                </YStack>

                <View height={72} />
              </YStack>
            </ScrollView>
          </Tabs.Content>

          <Tabs.Content value="tools" flex={1}>
            <ScrollView p="$3">
              <YStack gap="$4">
                <Card padded bordered>
                  <YStack gap="$3">
                    <XStack items="center" gap="$2">
                      <Unlock size={20} />
                      <H4 size="$5">Remote Unlock</H4>
                    </XStack>

                    <Paragraph size="$2">Enter the device PIN or password to remotely unlock the device.</Paragraph>

                    <XStack gap="$2">
                      <Input
                        flex={1}
                        placeholder="Device Password..."
                        secureTextEntry
                        value={unlockPassword}
                        onChangeText={setUnlockPassword}
                        onKeyPress={(e) => {
                          if (e.nativeEvent.key === 'Enter' && Platform.OS === 'web') onUnlock();
                        }}
                        onSubmitEditing={onUnlock}
                      />
                      <Button themeInverse onPress={onUnlock}>
                        Unlock
                      </Button>
                    </XStack>
                  </YStack>
                </Card>

                <Card padded bordered>
                  <YStack gap="$3">
                    <XStack items="center" gap="$2">
                      <Keyboard size={20} />
                      <H4 size="$5">Send Text</H4>
                    </XStack>

                    <Paragraph size="$2">Send text input to the device&apos;s focused field.</Paragraph>

                    <XStack gap="$2">
                      <Input flex={1} placeholder="Text to type..." value={quickText} onChangeText={setQuickText} />

                      <Button onPress={onSendQuickText}>Type</Button>
                    </XStack>
                  </YStack>
                </Card>
              </YStack>
            </ScrollView>
          </Tabs.Content>
        </Tabs>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ShellScreen;
