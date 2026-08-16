import { Outlet, createRootRoute, useRouter, useRouterState } from '@tanstack/react-router';
import { YStack, Tabs, SizableText, View } from 'tamagui';
import { useSocketStore, useDeviceStore, DevicesHeaderRight, useDevices } from '@shared/core';
import { useEffect, useRef, useState } from 'react';
import { AppStateStatus } from '../types/types';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const router = useRouter();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  useDevices();
  const thisTailscaleDevice = useDeviceStore((s) => s.thisTailscaleDevice);
  const lastDeviceUpdate = useDeviceStore((s) => s.lastDeviceUpdate);
  const socket = useSocketStore((s) => s.socket);
  const connectSocket = useSocketStore((s) => s.connectSocket);
  const disconnectSocket = useSocketStore((s) => s.disconnectSocket);
  const deviceId = thisTailscaleDevice?.id;
  const deviceRef = useRef(thisTailscaleDevice);
  useEffect(() => {
    deviceRef.current = thisTailscaleDevice;
  }, [thisTailscaleDevice]);
  useEffect(
    function initConnectSocket() {
      const currentDevice = deviceRef.current;
      if (currentDevice) connectSocket(currentDevice);
      return () => {
        disconnectSocket();
      };
    },
    [deviceId, connectSocket, disconnectSocket]
  );

  const [appState, setAppState] = useState<AppStateStatus>('active');
  useEffect(() => {
    window.electronAPI?.appState.get().then((initialState) => {
      setAppState(initialState);
    });

    const unsubscribe = window.electronAPI?.appState.subscribe((nextState) => {
      setAppState(nextState);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(
    function () {
      if (appState === 'active') useDeviceStore.getState().updateBatteryStatus();
    },
    [appState]
  );

  return (
    <YStack flex={1} height="100vh" maxH="100vh" overflow="hidden" bg="$background">
      <Tabs
        value={currentPath}
        onValueChange={(val) => router.navigate({ to: val })}
        orientation="horizontal"
        flexDirection="column"
        width="100%">
        <Tabs.List borderColor="$borderColor" borderBottomWidth={1} borderRadius={0} bg="$background">
          <Tabs.Tab value="/">
            <SizableText>Home</SizableText>
          </Tabs.Tab>
          <Tabs.Tab value="/notifications">
            <SizableText>Notifications</SizableText>
          </Tabs.Tab>
          <Tabs.Tab value="/crons">
            <SizableText>Crons</SizableText>
          </Tabs.Tab>
          <Tabs.Tab value="/app-control">
            <SizableText>App Control</SizableText>
          </Tabs.Tab>
          <Tabs.Tab value="/message">
            <SizableText>Message</SizableText>
          </Tabs.Tab>
          <Tabs.Tab value="/shell">
            <SizableText>Shell</SizableText>
          </Tabs.Tab>
          <Tabs.Tab value="/settings">
            <SizableText>Settings</SizableText>
          </Tabs.Tab>

          <View style={{ flex: 1 }} />

          <DevicesHeaderRight socket={socket} lastDeviceUpdate={lastDeviceUpdate} />
        </Tabs.List>
      </Tabs>

      <YStack flex={1} style={{ overflowY: 'auto' }}>
        <Outlet />
      </YStack>
    </YStack>
  );
}
