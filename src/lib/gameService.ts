import { supabase } from './supabase';
import { generateSecret } from '@/utils/gameLogic';

export type Game = {
  id: string;
  room_code: string;
  status: 'waiting' | 'playing' | 'finished';
  player1_id: string;
  player2_id: string | null;
  player1_secret: string;
  player2_secret: string | null;
  current_turn_id: string | null;
  winner_id: string | null;
};

async function getMyId(): Promise<string> {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw new Error(`Error de sesión: ${error.message}`);
  if (!session?.user) throw new Error('No hay sesión activa');
  return session.user.id;
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function createGame(): Promise<Game> {
  console.log('[createGame] inicio');
  const myId = await getMyId();
  const roomCode = generateRoomCode();
  const secret = generateSecret();
  console.log('[createGame] roomCode:', roomCode);

  const { data, error } = await supabase
    .from('games')
    .insert({
      room_code: roomCode,
      player1_id: myId,
      player1_secret: secret,
      status: 'waiting',
    })
    .select()
    .single();

  if (error) {
    console.error('[createGame] error:', error);
    throw new Error(`No se pudo crear la partida: ${error.message}`);
  }
  console.log('[createGame] OK');
  return data as Game;
}

export async function joinGame(roomCode: string): Promise<Game> {
  console.log('[joinGame] inicio, code:', roomCode);
  const myId = await getMyId();
  console.log('[joinGame] myId:', myId);

  const { data, error } = await supabase.rpc('join_game', {
    p_room_code: roomCode.trim().toUpperCase(),
    p_player2_secret: generateSecret(),
  });

  if (error) {
    console.error('[joinGame] error:', error);
    throw new Error(error.message);
  }
  console.log('[joinGame] OK');
  return data as Game;
}

export async function getGameById(gameId: string): Promise<Game | null> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Game | null;
}