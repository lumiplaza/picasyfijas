/*import { ExpoConfig, ConfigContext } from 'expo/config';
import * as dotenv from 'dotenv';

// Carga las variables de .env en tiempo de compilación.
// EAS también las lee, así que esto funciona igual en local y en la nube.
dotenv.config();

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'picasyfijas',
  slug: 'picasyfijas',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'picasyfijas',
  userInterfaceStyle: 'dark',

  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.lumiplaza.picasyfijas',
  },

  android: {
    package: 'com.lumiplaza.picasyfijas',
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#05060A',
    },
  },

  web: {
    bundler: 'metro',
    output: 'single',
    favicon: './assets/images/favicon.png',
  },

  plugins: [
    'expo-router',
    'expo-font',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#05060A',
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
      },
    ],
  ],

  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },

  extra: {
    // ⬇️ Variables de Supabase (se embeben en el bundle)
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,

    // ⬇️ Project ID de EAS
    eas: {
      projectId: '32c34424-bced-4954-a84c-d1811964adae',
    },
  },
}); */

import { ExpoConfig, ConfigContext } from 'expo/config';
import * as dotenv from 'dotenv';

dotenv.config();

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'picasyfijas',
  slug: 'picasyfijas',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'picasyfijas',
  userInterfaceStyle: 'dark',

  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.lumiplaza.picasyfijas',
  },

  android: {
    package: 'com.lumiplaza.picasyfijas',
  },

  web: {
    bundler: 'metro',
    output: 'single',
  },

  plugins: [
    'expo-router',
    'expo-font',
  ],

  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },

  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    eas: {
      projectId: '32c34424-bced-4954-a84c-d1811964adae',
    },
  },
});