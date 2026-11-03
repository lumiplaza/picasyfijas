/* import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="game" />
      <Stack.Screen name="result" />
      <Stack.Screen name="how-to-play" />
    </Stack>
  );
} */

  import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ensureAnonymousSession } from '@/lib/auth';
import { colors } from '@/constants/colors';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await ensureAnonymousSession();
      } catch (e) {
        if (mounted) {
          setError(e instanceof Error ? e.message : 'Error desconocido');
        }
      } finally {
        if (mounted) setIsReady(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Preparando la partida...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorTitle}>No se pudo iniciar sesión</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorHint}>
          Revisá tu conexión y las variables de entorno en el archivo .env.
        </Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="game" />
        <Stack.Screen name="result" />
        <Stack.Screen name="how-to-play" />
        <Stack.Screen name="lobby" />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  errorTitle: {
    color: colors.danger,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorText: {
    color: colors.text,
    fontSize: 14,
    textAlign: 'center',
  },
  errorHint: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});