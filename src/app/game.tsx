

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
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, mono } from '@/constants/colors';

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

          <LinearGradient
            colors={gradients.full}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.codeCardBorder}
          >
          
            <Pressable onPress={handleCopyCode} style={styles.codeCardInner}>
             <Text style={styles.codeText}>{roomCode}</Text>
             <Text style={styles.copyHint}>Toca para copiar</Text>
            </Pressable>
           </LinearGradient>
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
      <LinearGradient
        colors={['rgba(0,229,255,0.6)', 'rgba(123,92,255,0.4)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerUnderline}
      />

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
              {isOnline
                ? 'Aún no hiciste intentos.'
                : `Aún no hay intentos. Tenés ${MAX_ATTEMPTS_LOCAL} intentos para lograrlo.`}
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
  loadingText: { color: colors.textMuted, fontFamily: mono, fontSize: 12, letterSpacing: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  headerUnderline: { height: 1 },
  backText: { color: colors.textMuted, fontFamily: mono, fontSize: 12, letterSpacing: 1 },
  title: {
    color: colors.text,
    fontFamily: mono,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 3,
  },
  counter: {
    fontFamily: mono,
    fontSize: 12,
    fontWeight: '700',
    minWidth: 70,
    textAlign: 'right',
    letterSpacing: 1,
  },
  opponentInfo: { alignItems: 'center', paddingTop: 10 },
  opponentLabel: {
    color: colors.violet,
    fontFamily: mono,
    fontSize: 11,
    letterSpacing: 1,
  },
  currentBox: { alignItems: 'center', paddingVertical: 18 },
  currentLabel: {
    color: colors.textMuted,
    fontFamily: mono,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  currentDigits: {
    color: colors.text,
    fontFamily: mono,
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 8,
    textShadowColor: colors.primary,
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 0 },
  },
  warningText: {
    color: colors.danger,
    fontFamily: mono,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 10,
    letterSpacing: 2,
  },
  list: { flex: 1 },
  empty: {
    color: colors.textMuted,
    fontFamily: mono,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 24,
    letterSpacing: 1,
  },
  waitingTitle: {
    color: colors.text,
    fontFamily: mono,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 2,
  },
  waitingSubtitle: {
    color: colors.textMuted,
    fontFamily: mono,
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: 16,
    letterSpacing: 0.5,
  },
  codeCardBorder: { borderRadius: 12, padding: 1, marginTop: 16 },
  codeCardInner: {
    borderRadius: 11,
    paddingVertical: 24,
    paddingHorizontal: 40,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  codeText: {
    color: colors.primary,
    fontFamily: mono,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 10,
    textShadowColor: colors.primary,
    textShadowRadius: 16,
    textShadowOffset: { width: 0, height: 0 },
  },
  copyHint: {
    color: colors.textMuted,
    fontFamily: mono,
    fontSize: 10,
    marginTop: 8,
    letterSpacing: 1,
  },
});