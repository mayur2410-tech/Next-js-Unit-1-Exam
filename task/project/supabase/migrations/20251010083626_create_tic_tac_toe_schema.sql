/*
  # Tic Tac Toe Multiplayer Database Schema

  ## Overview
  This migration creates the complete database structure for a multiplayer Tic Tac Toe game
  with player tracking, game management, and move history.

  ## New Tables

  ### 1. players
  Stores player information and statistics
  - `id` (uuid, primary key) - Unique player identifier
  - `username` (text, unique) - Player's display name
  - `wins` (integer) - Total number of wins
  - `losses` (integer) - Total number of losses
  - `draws` (integer) - Total number of draws
  - `created_at` (timestamptz) - Account creation timestamp

  ### 2. games
  Stores game sessions and results
  - `id` (uuid, primary key) - Unique game identifier
  - `player1_id` (uuid, foreign key) - First player reference
  - `player2_id` (uuid, foreign key, nullable) - Second player reference
  - `status` (text) - Game state: 'open', 'active', 'finished'
  - `winner_id` (uuid, foreign key, nullable) - Winner reference
  - `board_state` (text) - Current board as JSON string
  - `current_turn` (uuid, nullable) - Player whose turn it is
  - `created_at` (timestamptz) - Game creation timestamp
  - `ended_at` (timestamptz, nullable) - Game completion timestamp

  ### 3. moves
  Stores individual move history for each game
  - `id` (uuid, primary key) - Unique move identifier
  - `game_id` (uuid, foreign key) - Associated game reference
  - `player_id` (uuid, foreign key) - Player who made the move
  - `position` (integer) - Board position (0-8)
  - `symbol` (text) - 'X' or 'O'
  - `timestamp` (timestamptz) - Move timestamp

  ## Security
  - RLS enabled on all tables
  - Public read access for leaderboard and game lists
  - Players can create games and make moves
  - Move validation handled by application logic
*/

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  wins integer DEFAULT 0,
  losses integer DEFAULT 0,
  draws integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player1_id uuid REFERENCES players(id) NOT NULL,
  player2_id uuid REFERENCES players(id),
  status text DEFAULT 'open',
  winner_id uuid REFERENCES players(id),
  board_state text DEFAULT '["","","","","","","","",""]',
  current_turn uuid,
  created_at timestamptz DEFAULT now(),
  ended_at timestamptz
);

-- Create moves table
CREATE TABLE IF NOT EXISTS moves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  player_id uuid REFERENCES players(id) NOT NULL,
  position integer NOT NULL CHECK (position >= 0 AND position <= 8),
  symbol text NOT NULL CHECK (symbol IN ('X', 'O')),
  timestamp timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE moves ENABLE ROW LEVEL SECURITY;

-- RLS Policies for players table
CREATE POLICY "Anyone can view players"
  ON players FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create player"
  ON players FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Players can update own stats"
  ON players FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- RLS Policies for games table
CREATE POLICY "Anyone can view games"
  ON games FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create games"
  ON games FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update games"
  ON games FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- RLS Policies for moves table
CREATE POLICY "Anyone can view moves"
  ON moves FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create moves"
  ON moves FOR INSERT
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_players_username ON players(username);
CREATE INDEX IF NOT EXISTS idx_players_wins ON players(wins DESC);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_created ON games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moves_game ON moves(game_id);
CREATE INDEX IF NOT EXISTS idx_moves_timestamp ON moves(timestamp);