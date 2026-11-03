
import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { generateSecret, evaluateGuess } from '@/utils/gameLogic';
import { NumberPad } from '@/components/NumberPad';
import { AttemptRow } from '@/components/AttemptRow';
import { colors } from '@/constants/colors';

type Attempt = { guess: string; picas: number; fijas: number };

const MAX_ATTEMPTS = 10;

export default function Game() {
  const [secret] = useState(generateSecret);
  const [currentGuess, setCurrentGuess] = useState('');
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [gameOver, setGameOver] = useState(false);

  const remaining = MAX_ATTEMPTS - attempts.length;

  const handleSubmit = () => {
    if (gameOver) return;
    if (currentGuess.length !== 4) return;

    const result = evaluateGuess(secret, currentGuess);
    const newAttempts = [{ guess: currentGuess, ...result }, ...attempts];
    setAttempts(newAttempts);
    setCurrentGuess('');

    const isWin = result.fijas === 4;
    const isLoss = !isWin && newAttempts.length >= MAX_ATTEMPTS;

    if (isWin) {
      setGameOver(true);
      router.push({
        pathname: '/result',
        params: {
          won: 'true',
          secret,
          tries: String(newAttempts.length),
        },
      });
    } else if (isLoss) {
      setGameOver(true);
      router.push({
        pathname: '/result',
        params: {
          won: 'false',
          secret,
          tries: String(newAttempts.length),
        },
      });
    }
  };

  const remainingColor =
    remaining <= 2 ? colors.danger : remaining <= 5 ? colors.pica : colors.textMuted;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/')}>
          <Text style={styles.backText}>← Salir</Text>
        </Pressable>
        <Text style={styles.title}>Picas y Fijas</Text>
        <Text style={[styles.counter, { color: remainingColor }]}>
          {remaining}/{MAX_ATTEMPTS}
        </Text>
      </View>

      {/* Intento actual */}
      <View style={styles.currentBox}>
        <Text style={styles.currentLabel}>Tu intento</Text>
        <Text style={styles.currentDigits}>
          {currentGuess.padEnd(4, '·').split('').join(' ')}
        </Text>
        {remaining === 1 && !gameOver && (
          <Text style={styles.warningText}>¡Último intento!</Text>
        )}
      </View>

      {/* Historial */}
      <FlatList
        data={attempts}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item, index }) => (
          <AttemptRow
            index={attempts.length - 1 - index}
            guess={item.guess}
            picas={item.picas}
            fijas={item.fijas}
          />
        )}
        style={styles.list}
        contentContainerStyle={{ paddingVertical: 8 }}
        ListEmptyComponent={
          <Text style={styles.empty}>Aún no hay intentos. ¡Adivina el número!</Text>
        }
      />

      {/* Teclado */}
      <NumberPad
        value={currentGuess}
        onChange={setCurrentGuess}
        onSubmit={handleSubmit}
        disabled={gameOver || remaining === 0}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backText: { color: colors.textMuted, fontSize: 15 },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
  counter: { fontSize: 15, fontWeight: '700', minWidth: 50, textAlign: 'right' },
  currentBox: { alignItems: 'center', paddingVertical: 16 },
  currentLabel: { color: colors.textMuted, fontSize: 12, marginBottom: 8 },
  currentDigits: {
    color: colors.text,
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: 4,
  },
  warningText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  list: { flex: 1 },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
  },
});