import React from 'react';
import { ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname } from 'expo-router';
import { View, Text, XStack, YStack as TamaguiYStack, Circle, useTheme, ScrollView } from 'tamagui';
import Animated, { withTiming, LinearTransition } from 'react-native-reanimated';
import { Bell, Box, Clock, Layers2, MessageCircle, MonitorSmartphone, TerminalSquare } from '@tamagui/lucide-icons';
import { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs/types';

interface CustomTabBarProps extends BottomTabBarProps {}

const EnteringHeight = (targetValues: any) => {
  'worklet';
  return {
    initialValues: { height: 0 },
    animations: { height: withTiming(targetValues.targetHeight, { duration: 300 }) },
  };
};

const ExitingHeight = (values: any) => {
  'worklet';
  return {
    initialValues: { height: values.currentHeight },
    animations: { height: withTiming(0, { duration: 300 }) },
  };
};

const AnimatedYStack = Animated.createAnimatedComponent(TamaguiYStack);

const TabItem = ({
  label,
  icon,
  activeIcon,
  isActive,
  onPress,
  badgeCount,
  isLoading,
}: {
  label: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  isActive: boolean;
  onPress: () => void;
  badgeCount?: number;
  isLoading?: boolean;
}) => {
  const theme = useTheme({ inverse: false });

  return (
    <AnimatedYStack
      layout={LinearTransition.duration(300)}
      flex={1}
      items="center"
      justify="center"
      width={'$4'}
      py="$3"
      gap={4}
      pressStyle={{ opacity: 0.7 }}
      onPress={onPress}
      position="relative">
      <View position="relative">
        {isActive ? activeIcon : icon}

        {/* Badge Indicator */}
        {badgeCount !== undefined && badgeCount > 0 && (
          <Circle position="absolute" t={-4} r={-8} size={18} bg="$red6" items="center" justify="center" z={10}>
            <Text color="white" fontWeight="500" fontSize="$1">
              {badgeCount}
            </Text>
          </Circle>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <Circle
            position="absolute"
            t={-8}
            r={-8}
            size={24}
            bg="$background"
            opacity={0.9}
            items="center"
            justify="center"
            z={10}
            scale={0.75}>
            <ActivityIndicator size="small" color={String(theme.color8.get())} />
          </Circle>
        )}
      </View>

      {isActive && (
        <Animated.View entering={EnteringHeight} exiting={ExitingHeight} style={{ overflow: 'hidden' }}>
          <Text
            fontSize={11}
            fontWeight={isActive ? '400' : '300'}
            color={isActive ? '$color' : '$color8'}
            numberOfLines={1}
            style={{
              alignSelf: 'center',
              textAlign: 'center',
            }}>
            {label}
          </Text>
        </Animated.View>
      )}
    </AnimatedYStack>
  );
};

const CustomTabBar: React.FC<CustomTabBarProps> = ({ state, navigation }) => {
  const tamaguiTheme = useTheme();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const getActiveTab = () => {
    const pathToTab = {
      '/tabs/devices': 'devices',
      '/tabs/notifications': 'notifications',
      '/tabs/appcontrol': 'appcontrol',
      '/tabs/shell': 'shell',
      '/tabs/message': 'message',
      '/tabs/storage': 'storage',
      '/tabs/crons': 'crons',
    } as const;
    return pathToTab[pathname as keyof typeof pathToTab] || state.routeNames[state.index];
  };

  const activeTab = getActiveTab();
  const handleTabPress = (tabName: string) => {
    const routeName = tabName === 'devices' ? 'devices' : tabName;
    const tabIndex = state.routes.findIndex((route) => route.name === routeName);
    if (tabIndex !== -1) {
      navigation.navigate(state.routes[tabIndex].name);
    }
  };

  return (
    <ScrollView horizontal style={{ flexGrow: 0, borderTopWidth: 1, borderColor: tamaguiTheme.color3.val }}>
      <XStack
        bg="$background"
        pb={insets.bottom > 0 ? insets.bottom : '$4'}
        items="center"
        justify="space-between"
        px="$3"
        gap="$5"
        elevation="$2">
        <TabItem
          label="Devices"
          icon={<MonitorSmartphone strokeWidth={1.3} color={'$color7'} />}
          activeIcon={<MonitorSmartphone />}
          isActive={activeTab === 'devices'}
          onPress={() => handleTabPress('devices')}
        />

        <TabItem
          label="Notifications"
          icon={<Bell strokeWidth={1.3} color={'$color7'} />}
          activeIcon={<Bell />}
          isActive={activeTab === 'notifications'}
          onPress={() => handleTabPress('notifications')}
        />

        <TabItem
          label="App Control"
          icon={<Layers2 strokeWidth={1.3} color={'$color7'} />}
          activeIcon={<Layers2 />}
          isActive={activeTab === 'appcontrol'}
          onPress={() => handleTabPress('appcontrol')}
        />

        <TabItem
          label="Shell"
          icon={<TerminalSquare strokeWidth={1.3} color={'$color7'} />}
          activeIcon={<TerminalSquare />}
          isActive={activeTab === 'shell'}
          onPress={() => handleTabPress('shell')}
        />

        <TabItem
          label="Message"
          icon={<MessageCircle strokeWidth={1.3} color={'$color7'} />}
          activeIcon={<MessageCircle />}
          isActive={activeTab === 'message'}
          onPress={() => handleTabPress('message')}
        />

        <TabItem
          label="Storage"
          icon={<Box strokeWidth={1.3} color={'$color7'} />}
          activeIcon={<Box />}
          isActive={activeTab === 'storage'}
          onPress={() => handleTabPress('storage')}
        />

        <TabItem
          label="Crons"
          icon={<Clock strokeWidth={1.3} color={'$color7'} />}
          activeIcon={<Clock />}
          isActive={activeTab === 'crons'}
          onPress={() => handleTabPress('crons')}
        />
      </XStack>
    </ScrollView>
  );
};

export default CustomTabBar;
