import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { createGame, joinGame } from '@/lib/gameService';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, mono } from '@/constants/colors';

export default function Lobby() {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState<'create' | 'join' | null>(null);
  const [error, setError] = useState<string | null>(null);

 const handleCreate = async () => {
  setError(null);
  setLoading('create');
  try {
    const game = await createGame();
    router.push({ pathname: '/game', params: { gameId: game.id, roomCode: game.room_code, mode: 'online' } });
  } catch (e) {
    setError(e instanceof Error ? e.message : 'Error desconocido');
  } finally {
    setLoading(null);
  }
};

const handleJoin = async () => {
  if (roomCode.trim().length !== 6) {
    setError('El código debe tener 6 caracteres.');
    return;
  }
  setError(null);
  setLoading('join');
  try {
    const game = await joinGame(roomCode);
    router.push({ pathname: '/game', params: { gameId: game.id, roomCode: game.room_code, mode: 'online' } });
  } catch (e) {
    setError(e instanceof Error ? e.message : 'Error desconocido');
  } finally {
    setLoading(null);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.backText}>← Volver</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Multijugador</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        {/* Crear partida */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Crear partida</Text>
          <Text style={styles.sectionDesc}>
            Generá un código y compartilo con tu oponente para que se una.
          </Text>
          <Pressable onPress={handleCreate} disabled={loading !== null}>
            {({ pressed }) =>
              loading === 'create' ? (
                <View style={styles.primaryButton}>
                  <ActivityIndicator color={colors.background} />
                </View>
              ) : (
                <LinearGradient
                  colors={gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.primaryButton, styles.primaryButtonGlow, pressed && styles.pressed]}
                >
                  <Text style={styles.primaryText}>CREAR PARTIDA</Text>
                </LinearGradient>
              )
            }
          </Pressable>
        </View>

        {/* Separador */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Unirse */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Unirse a partida</Text>
          <Text style={styles.sectionDesc}>
            Ingresá el código de 6 caracteres que te compartió tu oponente.
          </Text>
          <TextInput
            value={roomCode}
            onChangeText={(t) => setRoomCode(t.toUpperCase())}
            placeholder="ABC123"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
            style={styles.input}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}


          <Pressable
              onPress={handleJoin}
              disabled={loading !== null || roomCode.length !== 6}
            >
              {({ pressed }) => (
                <LinearGradient
                  colors={gradients.accent}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.secondaryBorder,
                    (loading !== null || roomCode.length !== 6) && styles.disabledWrap,
                  ]}
                >
                  <View style={[styles.secondaryInner, pressed && styles.pressed]}>
                    {loading === 'join' ? (
                      <ActivityIndicator color={colors.text} />
                    ) : (
                      <Text style={styles.secondaryText}>UNIRSE</Text>
                    )}
                  </View>
                </LinearGradient>
              )}
            </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backText: { color: colors.textMuted,
    fontFamily: mono,
    fontSize: 12,
    letterSpacing: 1,},
  headerTitle: { color: colors.text,
    fontFamily: mono,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 3, },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24, gap: 32 },
  section: { gap: 10 },
  sectionTitle: { color: colors.text,
    fontFamily: mono,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2, },
  sectionDesc: { color: colors.textMuted,
    fontFamily: mono,
    fontSize: 11,
    lineHeight: 18,
    letterSpacing: 0.5, },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  primaryButtonGlow: {
  shadowColor: colors.primary,
  shadowOpacity: 0.5,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 6,
  },
  primaryText: { color: colors.background,
  fontFamily: mono,
  fontSize: 14,
  fontWeight: '800',
  letterSpacing: 2,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  secondaryText: { color: colors.text,
  fontFamily: mono,
  fontSize: 14,
  fontWeight: '800',
  letterSpacing: 2,
  },
  disabledWrap: { opacity: 0.4 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.25)',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: colors.primary,
    fontFamily: mono,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 8,
    textAlign: 'center',
  },
  secondaryBorder: {
  borderRadius: 8,
  padding: 1,
  marginTop: 6,
  },
  secondaryInner: {
  backgroundColor: colors.background,
  borderRadius: 7,
  paddingVertical: 15,
  alignItems: 'center',
  justifyContent: 'center',
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textMuted,
    fontFamily: mono,
    fontSize: 11,
    letterSpacing: 2, },
  pressed: { opacity: 0.6 },

  errorText: { color: colors.danger,
    fontFamily: mono,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,},
});