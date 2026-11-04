import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { colors, gradients, mono } from '@/constants/colors';

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['rgba(0,229,255,0.15)', 'rgba(123,92,255,0.06)', 'transparent']}
        style={styles.ambientGlow}
        pointerEvents="none"
      />

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>◆ MASTERMIND 1V1</Text>
        <View style={styles.titleRow}>
          <Text style={styles.title}>PICAS</Text>
          <Text style={[styles.title, { color: colors.primary }]}>Y</Text>
          <Text style={[styles.title, { color: colors.magenta }]}>FIJAS</Text>
        </View>
        <View style={styles.underline} />
        <Text style={styles.subtitle}>Adivina el código. Descifra al rival.</Text>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={() => router.push('/game')}>
          {({ pressed }) => (
            <LinearGradient
              colors={gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.btn, styles.btnGlow, pressed && styles.pressed]}
            >
              <Text style={styles.btnPrimaryText}>JUGAR SOLO</Text>
            </LinearGradient>
          )}
        </Pressable>

        <Pressable onPress={() => router.push('/lobby')}>
          <LinearGradient
            colors={gradients.full}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btnBorder}
          >
            <View style={styles.btnOutlineInner}>
              <Text style={styles.btnOutlineText}>JUGAR ONLINE</Text>
              <View style={styles.dot} />
            </View>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={() => router.push('/how-to-play')}
          style={({ pressed }) => [styles.btnGhost, pressed && styles.pressed]}
        >
          <Text style={styles.btnGhostText}>CÓMO JUGAR</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24 },
  ambientGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320,
  },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  eyebrow: {
    color: colors.primary,
    fontFamily: mono,
    fontSize: 11,
    letterSpacing: 3,
    marginBottom: 8,
  },
  titleRow: { flexDirection: 'row', gap: 8, alignItems: 'baseline' },
  title: {
    color: colors.text,
    fontSize: 40,
    fontFamily: mono,
    fontWeight: '800',
    letterSpacing: 2,
  },
  underline: {
    height: 2,
    width: 80,
    backgroundColor: colors.primary,
    borderRadius: 1,
    marginTop: 4,
    shadowColor: colors.primary,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: mono,
    fontSize: 12,
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 8,
  },
  actions: { paddingBottom: 32, gap: 14 },
  btn: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGlow: {
    shadowColor: colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  btnPrimaryText: {
    color: colors.background,
    fontFamily: mono,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  btnBorder: {
    borderRadius: 8,
    padding: 1,
  },
  btnOutlineInner: {
    backgroundColor: colors.background,
    borderRadius: 7,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  btnOutlineText: {
    color: colors.primary,
    fontFamily: mono,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.magenta,
    shadowColor: colors.magenta,
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  btnGhost: { paddingVertical: 14, alignItems: 'center' },
  btnGhostText: {
    color: colors.textMuted,
    fontFamily: mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  pressed: { opacity: 0.7 },
});