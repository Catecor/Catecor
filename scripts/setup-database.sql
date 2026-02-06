-- Create game_rooms table
CREATE TABLE IF NOT EXISTS game_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  join_code TEXT NOT NULL UNIQUE,
  host_id TEXT NOT NULL,
  team_a_name TEXT DEFAULT 'Team A',
  team_b_name TEXT DEFAULT 'Team B',
  active_team TEXT DEFAULT 'A',
  current_card JSONB,
  used_cards JSONB DEFAULT '{"1": [], "2": [], "3": [], "chance": []}'::jsonb,
  game_phase TEXT DEFAULT 'lobby',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  player_id TEXT NOT NULL,
  team TEXT,
  is_host BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_rooms_join_code ON game_rooms(join_code);
CREATE INDEX IF NOT EXISTS idx_players_room_id ON players(room_id);
CREATE INDEX IF NOT EXISTS idx_players_player_id ON players(player_id);

-- Enable Row Level Security
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Create policies for game_rooms
CREATE POLICY "Allow public read access to game_rooms" ON game_rooms
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to game_rooms" ON game_rooms
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to game_rooms" ON game_rooms
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to game_rooms" ON game_rooms
  FOR DELETE USING (true);

-- Create policies for players
CREATE POLICY "Allow public read access to players" ON players
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to players" ON players
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to players" ON players
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to players" ON players
  FOR DELETE USING (true);
