import React from 'react';
import { TamaguiProvider } from 'tamagui';
import { createRoot } from 'react-dom/client';
import { tamaguiConfig } from './theme/tamagui.config';
import './index.css';
import { useDomainStore, useTsyncNativeStore, queryClient, Sheets } from '@shared/core';
import { tsyncNativeElectronImpl } from './tsyncNative';
import { createRouter, createHashHistory, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { QueryClientProvider } from '@tanstack/react-query';
import { SheetProvider } from 'react-native-actions-sheet';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';

(function initializeRoot() {
  useDomainStore
    .getState()
    .initDomain((import.meta as unknown as { env: { VITE_BASE_API_URL: string } }).env.VITE_BASE_API_URL);
  useTsyncNativeStore.getState().setImpl(tsyncNativeElectronImpl);
})();

const hashHistory = createHashHistory();

const router = createRouter({
  routeTree,
  history: hashHistory,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <KeyboardProvider>
            <TamaguiProvider config={tamaguiConfig}>
              <SheetProvider>
                <RouterProvider router={router} />

                <Sheets />
              </SheetProvider>
            </TamaguiProvider>
          </KeyboardProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}
