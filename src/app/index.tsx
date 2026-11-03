
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';

export default function Home() {
  const handleOnline = () => {
    Alert.alert(
      'Próximamente',
      'El modo online estará disponible muy pronto. ¡Estamos trabajando en ello!'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logo}>🎯</Text>
        <Text style={styles.title}>Picas y Fijas</Text>
        <Text style={styles.subtitle}>
          Descubre el número secreto de 4 dígitos
        </Text>
      </View>

      <View style={styles.actions}>
        {/* Jugar solo */}
        <Pressable
          onPress={() => router.push('/game')}
          style={({ pressed }) => [
            styles.button,
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.primaryText}>Jugar solo</Text>
        </Pressable>

        {/* Jugar online */}
        <Pressable
          onPress={handleOnline}
          style={({ pressed }) => [
            styles.button,
            styles.secondaryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.secondaryText}>Jugar online</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Pronto</Text>
          </View>
        </Pressable>

        {/* Cómo jugar */}
        <Pressable
          onPress={() => router.push('/how-to-play')}
          style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}
        >
          <Text style={styles.ghostText}>Cómo jugar</Text>
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
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: { fontSize: 72, marginBottom: 16 },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
  },
  actions: {
    paddingBottom: 24,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: colors.pica,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ghostButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  ghostText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  pressed: { opacity: 0.7 },
});