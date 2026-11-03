

import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { generateSecret, evaluateGuess } from '@/utils/gameLogic';
import { supabase } from '@/lib/supabase';
import { getGameById, type Game } from '@/lib/gameService';
import { NumberPad } from '@/components/NumberPad';
import { AttemptRow } from '@/components/AttemptRow';
import { colors } from '@/constants/colors';

type Attempt = { guess: string; picas: number; fijas: number };

type GuessRow = {
  id: string;
  game_id: string;
  player_id: string;
  guess: string;
  picas: number;
  fijas: number;
  created_at: string;
};

const MAX_ATTEMPTS_LOCAL = 10;

export default function Game() {
  const params = useLocalSearchParams<{
    gameId?: string;
    roomCode?: string;
    mode?: string;
  }>();

  const isOnline = params.mode === 'online';
  const gameId = params.gameId;
  const roomCode = params.roomCode;

  // === Estado común ===
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigatedRef = useRef(false);
  const myAttemptsRef = useRef<Attempt[]>([]);

  // === Estado modo local ===
  const [secret] = useState(generateSecret);
  const [localAttempts, setLocalAttempts] = useState<Attempt[]>([]);

  // === Estado modo online ===
  const [myId, setMyId] = useState<string | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [myAttempts, setMyAttempts] = useState<Attempt[]>([]);
  const [opponentAttempts, setOpponentAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(isOnline);

  // === Derivados ===
  const attempts = isOnline ? myAttempts : localAttempts;
  const myTurn = isOnline ? game?.current_turn_id === myId : true;
  const isWaiting = isOnline && game?.status === 'waiting';
  const remaining = isOnline ? null : MAX_ATTEMPTS_LOCAL - localAttempts.length;

  const navigateToResult = (won: boolean, finalSecret: string, tries: number) => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    router.replace({
      pathname: '/result',
      params: {
        won: won ? 'true' : 'false',
        secret: finalSecret,
        tries: String(tries),
        ...(isOnline && { mode: 'online' }),
      },
    });
  };

  // === Carga + suscripción realtime (online) ===
  useEffect(() => {
    if (!isOnline || !gameId) return;

    let mounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No hay sesión activa');
        if (!mounted) return;
        setMyId(user.id);

        const g = await getGameById(gameId);
        if (!mounted) return;
        if (!g) throw new Error('Partida no encontrada');
        if (g.player1_id !== user.id && g.player2_id !== user.id) {
          throw new Error('No tenés acceso a esta partida');
        }
        setGame(g);

        // Cargar intentos existentes
        const { data: guesses, error: gErr } = await supabase
          .from('guesses')
          .select('*')
          .eq('game_id', gameId)
          .order('created_at', { ascending: false });
        if (gErr) throw gErr;
        if (!mounted) return;

        const mine: Attempt[] = [];
        const theirs: Attempt[] = [];
        (guesses as GuessRow[]).forEach((row) => {
          const a = { guess: row.guess, picas: row.picas, fijas: row.fijas };
          if (row.player_id === user.id) mine.push(a);
          else theirs.push(a);
        });
        setMyAttempts(mine);
        myAttemptsRef.current = mine;
        setOpponentAttempts(theirs);

        // Si la partida ya terminó (p.ej. reload), ir directo a resultado
        if (g.status === 'finished') {
          const won = g.winner_id === user.id;
          const oppSecret = g.player1_id === user.id ? g.player2_secret : g.player1_secret;
          navigateToResult(won, oppSecret ?? '', mine.length);
          return;
        }

        setLoading(false);

        // Suscripción realtime
        channel = supabase
          .channel(`game_${gameId}`)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'guesses', filter: `game_id=eq.${gameId}` },
            (payload) => {
              const row = payload.new as GuessRow;
              if (row.player_id === user.id) return; // propio, ya manejado localmente
              setOpponentAttempts((prev) => [
                { guess: row.guess, picas: row.picas, fijas: row.fijas },
                ...prev,
              ]);
            }
          )
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
            (payload) => {
              const updated = payload.new as Game;
              setGame(updated);

              if (updated.status === 'finished' && !navigatedRef.current) {
                const won = updated.winner_id === user.id;
                const oppSecret = updated.player1_id === user.id
                  ? updated.player2_secret
                  : updated.player1_secret;
                navigateToResult(won, oppSecret ?? '', myAttemptsRef.current.length);
              }
            }
          )
          .subscribe();
      } catch (e) {
        if (mounted) {
          Alert.alert('Error', e instanceof Error ? e.message : 'Error desconocido');
          router.replace('/lobby');
        }
      }
    })();

    return () => {
      mounted = false;
      if (channel) supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, gameId]);

  // === Enviar intento ===
  const handleSubmit = async () => {
    if (gameOver || submitting || currentGuess.length !== 4) return;

    // ---------- Modo LOCAL ----------
    if (!isOnline) {
      const result = evaluateGuess(secret, currentGuess);
      const newAttempts = [{ guess: currentGuess, ...result }, ...localAttempts];
      setLocalAttempts(newAttempts);
      setCurrentGuess('');

      const isWin = result.fijas === 4;
      const isLoss = !isWin && newAttempts.length >= MAX_ATTEMPTS_LOCAL;

      if (isWin) {
        setGameOver(true);
        router.push({
          pathname: '/result',
          params: { won: 'true', secret, tries: String(newAttempts.length) },
        });
      } else if (isLoss) {
        setGameOver(true);
        router.push({
          pathname: '/result',
          params: { won: 'false', secret, tries: String(newAttempts.length) },
        });
      }
      return;
    }

    // ---------- Modo ONLINE ----------
    if (!game || !myId) return;
    if (game.current_turn_id !== myId) {
      Alert.alert('Esperá tu turno', 'Todavía no es tu turno de jugar.');
      return;
    }

    setSubmitting(true);
    try {
      const oppSecret = game.player1_id === myId ? game.player2_secret : game.player1_secret;
      if (!oppSecret) throw new Error('Falta el secreto del oponente');

      const result = evaluateGuess(oppSecret, currentGuess);

      // 1. Insertar el intento
      const { error: insErr } = await supabase.from('guesses').insert({
        game_id: gameId!,
        player_id: myId,
        guess: currentGuess,
        picas: result.picas,
        fijas: result.fijas,
      });
      if (insErr) throw insErr;

      // 2. Actualizar estado local
      const newAttempts = [{ guess: currentGuess, ...result }, ...myAttempts];
      setMyAttempts(newAttempts);
      myAttemptsRef.current = newAttempts;
      setCurrentGuess('');

      if (result.fijas === 4) {
        // Gané: cerrar partida
        const { error: upErr } = await supabase
          .from('games')
          .update({
            status: 'finished',
            winner_id: myId,
            current_turn_id: null,
          })
          .eq('id', gameId);
        if (upErr) throw upErr;
        navigateToResult(true, oppSecret, newAttempts.length);
      } else {
        // Cambio de turno
        const oppId = game.player1_id === myId ? game.player2_id : game.player1_id;
        const { error: upErr } = await supabase
          .from('games')
          .update({ current_turn_id: oppId })
          .eq('id', gameId);
        if (upErr) throw upErr;
      }
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCode = async () => {
    if (!roomCode) return;
    try {
      await Clipboard.setStringAsync(roomCode);
      Alert.alert('Copiado', 'El código se copió al portapapeles.');
    } catch {
      // fallback silencioso
    }
  };

  const handleExit = () => {
    if (isOnline && game?.status === 'playing' && myId) {
      Alert.alert(
        'Abandonar partida',
        'Si salís ahora, perderás la partida. ¿Continuar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Salir',
            style: 'destructive',
            onPress: async () => {
              const oppId = game.player1_id === myId ? game.player2_id : game.player1_id;
              await supabase
                .from('games')
                .update({ status: 'finished', winner_id: oppId, current_turn_id: null })
                .eq('id', game.id);
              router.replace('/');
            },
          },
        ]
      );
    } else {
      router.replace('/');
    }
  };

  // === Loading ===
  if (isOnline && loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando partida...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // === Sala de espera ===
  if (isWaiting) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.replace('/')}>
            <Text style={styles.backText}>← Salir</Text>
          </Pressable>
          <Text style={styles.title}>Sala de espera</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.waitingTitle}>Esperando oponente...</Text>
          <Text style={styles.waitingSubtitle}>
            Compartí este código con tu rival para que se una:
          </Text>
          <Pressable onPress={handleCopyCode} style={styles.codeCard}>
            <Text style={styles.codeText}>{roomCode}</Text>
            <Text style={styles.copyHint}>Toca para copiar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // === Juego ===
  const remainingColor =
    remaining !== null
      ? remaining <= 2
        ? colors.danger
        : remaining <= 5
        ? colors.pica
        : colors.textMuted
      : colors.textMuted;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleExit}>
          <Text style={styles.backText}>← Salir</Text>
        </Pressable>
        <Text style={styles.title}>Picas y Fijas</Text>
        {isOnline ? (
          <Text style={[styles.counter, { color: myTurn ? colors.fija : colors.textMuted }]}>
            {myTurn ? 'Tu turno' : 'Esperando'}
          </Text>
        ) : (
          <Text style={[styles.counter, { color: remainingColor }]}>
            {remaining}/{MAX_ATTEMPTS_LOCAL}
          </Text>
        )}
      </View>

      {isOnline && (
        <View style={styles.opponentInfo}>
          <Text style={styles.opponentLabel}>
            Oponente: {opponentAttempts.length}{' '}
            {opponentAttempts.length === 1 ? 'intento' : 'intentos'}
          </Text>
        </View>
      )}

      <View style={styles.currentBox}>
        <Text style={styles.currentLabel}>
          {isOnline && !myTurn ? 'Esperando al oponente' : 'Tu intento'}
        </Text>
        <Text style={[styles.currentDigits, isOnline && !myTurn && { opacity: 0.3 }]}>
          {currentGuess.padEnd(4, '·').split('').join(' ')}
        </Text>
        {!isOnline && remaining === 1 && !gameOver && (
          <Text style={styles.warningText}>¡Último intento!</Text>
        )}
      </View>

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
          <Text style={styles.empty}>
            {isOnline ? 'Aún no hiciste intentos.' : 'Aún no hay intentos. ¡Adivina el número!'}
          </Text>
        }
      />

      <NumberPad
        value={currentGuess}
        onChange={setCurrentGuess}
        onSubmit={handleSubmit}
        disabled={gameOver || submitting || (isOnline && !myTurn)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 16 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  loadingText: { color: colors.textMuted, fontSize: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backText: { color: colors.textMuted, fontSize: 15 },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
  counter: { fontSize: 15, fontWeight: '700', minWidth: 70, textAlign: 'right' },
  opponentInfo: {
    alignItems: 'center',
    paddingBottom: 4,
  },
  opponentLabel: { color: colors.textMuted, fontSize: 12 },
  currentBox: { alignItems: 'center', paddingVertical: 12 },
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
  waitingTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },
  waitingSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  codeCard: {
    marginTop: 12,
    paddingVertical: 20,
    paddingHorizontal: 36,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  codeText: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 6,
  },
  copyHint: { color: colors.textMuted, fontSize: 11, marginTop: 6 },
});