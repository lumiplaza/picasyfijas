import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, gradients, mono } from '@/constants/colors';

export default function Result() {
  const params = useLocalSearchParams<{
    won?: string;
    secret?: string;
    tries?: string;
    mode?: string;
  }>();

  const won = params.won === 'true';
  const secret = params.secret ?? '----';
  const tries = params.tries ?? '0';
  const mode = params.mode;

  const handlePlayAgain = () => {
    if (mode === 'online') {
      router.replace('/lobby');
    } else {
      router.replace('/game');
    }
  };

  const handleGoHome = () => {
    router.replace('/');
  };

  const glowColor = won ? colors.primary : colors.magenta;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <LinearGradient
          colors={won ? gradients.primary : gradients.accent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.badge, { shadowColor: glowColor }]}
        >
          <Text style={styles.badgeEmoji}>{won ? '🏆' : '💀'}</Text>
        </LinearGradient>

        <Text style={styles.title}>
          {won ? '¡GANASTE!' : 'DERROTA'}
        </Text>

        <Text style={styles.subtitle}>
          {won
            ? `Adivinaste el código en ${tries} ${tries === '1' ? 'intento' : 'intentos'}.`
            : 'No lograste descifrar el código enemigo.'}
        </Text>

        <LinearGradient
          colors={gradients.full}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.secretBorder}
        >
          <View style={styles.secretInner}>
            <Text style={styles.secretLabel}>EL CÓDIGO ERA</Text>
            <View style={styles.digits}>
              {secret.split('').map((d, i) => (
                <View key={i} style={styles.digitBox}>
                  <Text style={styles.digitText}>{d}</Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={handlePlayAgain}>
          {({ pressed }) => (
            <LinearGradient
              colors={gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.primaryButton, styles.primaryGlow, pressed && styles.pressed]}
            >
              <Text style={styles.primaryText}>
                {mode === 'online' ? 'VOLVER AL LOBBY' : 'JUGAR DE NUEVO'}
              </Text>
            </LinearGradient>
          )}
        </Pressable>

        <Pressable
          onPress={handleGoHome}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryText}>VOLVER AL MENÚ</Text>
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
  badge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  badgeEmoji: { fontSize: 60 },
  title: {
    color: colors.text,
    fontFamily: mono,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: mono,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
    letterSpacing: 0.5,
    lineHeight: 18,
  },
  secretBorder: {
    borderRadius: 14,
    padding: 1,
    marginBottom: 32,
  },
  secretInner: {
    backgroundColor: colors.surface,
    borderRadius: 13,
    paddingVertical: 24,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  secretLabel: {
    color: colors.textMuted,
    fontFamily: mono,
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 12,
  },
  digits: { flexDirection: 'row', gap: 10 },
  digitBox: {
    width: 48,
    height: 56,
    borderRadius: 8,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.4)',
  },
  digitText: {
    color: colors.primary,
    fontFamily: mono,
    fontSize: 24,
    fontWeight: '800',
  },
  actions: { gap: 12, paddingBottom: 24 },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryGlow: {
    shadowColor: colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  primaryText: {
    color: colors.background,
    fontFamily: mono,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderBright,
  },
  secondaryText: {
    color: colors.text,
    fontFamily: mono,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  pressed: { opacity: 0.7 },
});