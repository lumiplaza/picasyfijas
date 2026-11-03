import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';

export default function Result() {
  const params = useLocalSearchParams<{
    won?: string;
    secret?: string;
    tries?: string;
  }>();

  const won = params.won === 'true';
  const secret = params.secret ?? '----';
  const tries = params.tries ?? '0';

  const handlePlayAgain = () => {
    router.replace('/game');
  };

  const handleGoHome = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>{won ? '🏆' : '💀'}</Text>

        <Text style={styles.title}>
          {won ? '¡Ganaste!' : 'Mejor suerte la próxima'}
        </Text>

        <Text style={styles.subtitle}>
          {won
            ? `Adivinaste el número en ${tries} ${tries === '1' ? 'intento' : 'intentos'}.`
            : 'No lograste descubrir el número secreto.'}
        </Text>

        <View style={styles.secretCard}>
          <Text style={styles.secretLabel}>El número secreto era</Text>
          <View style={styles.digits}>
            {secret.split('').map((d, i) => (
              <View key={i} style={styles.digitBox}>
                <Text style={styles.digitText}>{d}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={handlePlayAgain}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.primaryText}>Jugar de nuevo</Text>
        </Pressable>

        <Pressable
          onPress={handleGoHome}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryText}>Volver al menú</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: { fontSize: 72, marginBottom: 16 },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  secretCard: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 28,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secretLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  digits: { flexDirection: 'row', gap: 10 },
  digitBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  digitText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  actions: { gap: 12, paddingBottom: 24 },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryText: { color: colors.text, fontSize: 16, fontWeight: '600' },
  pressed: { opacity: 0.7 },
});