import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Player {
  id: string
  username: string
  wins: number
  losses: number
  draws: number
  created_at: string
}

export interface Game {
  id: string
  player1_id: string
  player2_id: string | null
  status: 'open' | 'active' | 'finished'
  winner_id: string | null
  board_state: string
  current_turn: string | null
  created_at: string
  ended_at: string | null
}

export interface Move {
  id: string
  game_id: string
  player_id: string
  position: number
  symbol: 'X' | 'O'
  timestamp: string
}

export interface GameWithPlayers extends Game {
  player1: Player
  player2: Player | null
  winner: Player | null
}
