/* eslint-disable import/no-unresolved */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import path from 'path';

// https://vitejs.dev/config
export default defineConfig({
  envDir: path.resolve(__dirname, '.'),
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    react(),
  ],
  build: {
    rolldownOptions: {
      // RN packages ship untranspiled `.js` files containing JSX (and are tagged with an
      // `@flow` pragma rolldown/oxc can't parse). Forcing `.js` to the `jsx` module type
      // bypasses oxc's automatic Flow-pragma sniffing and parses everything as plain JSX/JS.
      moduleTypes: {
        '.js': 'jsx',
      },
    },
  },
  define: {
    'process.env': {},
    global: 'window',
  },
  optimizeDeps: {
    esbuildOptions: {
      resolveExtensions: ['.web.tsx', '.tsx', '.web.ts', '.ts', '.web.jsx', '.jsx', '.web.js', '.js'],
      loader: {
        '.js': 'jsx',
      },
    },
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': path.resolve(__dirname, '../../packages/core'),
      '@shared/core': path.resolve(__dirname, '../../packages/core/index.ts'),
      'react-native/Libraries/Renderer/shims/ReactFabric': 'react-native-web',
      'react-native/Libraries/Renderer/shims/ReactNativeViewConfigRegistry': path.resolve(
        __dirname,
        'src/utils/rn-dummy.ts'
      ),
      'react-native/Libraries/ReactNative/ReactFabricPublicInstance/ReactFabricPublicInstance': path.resolve(
        __dirname,
        'src/utils/rn-dummy.ts'
      ),
      'react-native/Libraries/Renderer/shims/ReactNative': path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
      'react-native/Libraries/Utilities/codegenNativeComponent': path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
      'react-native/Libraries/Pressability/PressabilityDebug': path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
      'react-native/Libraries/Image/resolveAssetSource': path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
      'react-native/Libraries/ReactNative/AppContainer': path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
      'react-native-screens/experimental': path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
      'react-native-screens': path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
      'react-native': path.resolve(__dirname, 'src/utils/react-native-web-proxy.ts'),
      'react-native-mmkv': path.resolve(__dirname, 'src/utils/mmkv-mock.ts'),
      'expo-image': path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
      'expo-location': path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
      'expo-haptics': path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
      'expo-notifications': path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
      'expo-clipboard': path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
      'expo-intent-launcher': path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
      'expo-application': path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
      'expo-device': path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
      'expo-constants': path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
      'expo-linking': path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
      'expo-secure-store': path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
      'expo-updates': path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
      'expo-file-system': path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
      'expo-audio': path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
      'expo-camera': path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
      'expo-media-library': path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
      'expo-network': path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
      'expo-blur': path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
      'expo-system-ui': path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
      'expo-web-browser': path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
      'expo-router': path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
      expo: path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
      'expo-modules-core': path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
      'expo-file-system/legacy': path.resolve(__dirname, 'src/utils/rn-dummy.ts'),
    },
    extensions: ['.web.tsx', '.tsx', '.web.ts', '.ts', '.web.jsx', '.jsx', '.web.js', '.js'],
  },
});
