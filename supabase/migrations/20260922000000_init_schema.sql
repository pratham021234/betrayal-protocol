-- ==========================================================
-- BETRAYAL PROTOCOL: DATABASE SCHEMA & MIGRATIONS
-- Supabase PostgreSQL Schema
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(6) UNIQUE NOT NULL,
    host_player_id UUID,
    status VARCHAR(20) NOT NULL DEFAULT 'LOBBY', -- LOBBY, PLAYING, FINISHED, ABANDONED
    current_round INT NOT NULL DEFAULT 0,
    max_rounds INT NOT NULL DEFAULT 10,
    round_duration_sec INT NOT NULL DEFAULT 15,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);

-- 2. Players Table
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    session_token VARCHAR(64) NOT NULL,
    nickname VARCHAR(32) NOT NULL,
    avatar_id VARCHAR(32) NOT NULL DEFAULT 'cyber_1',
    score INT NOT NULL DEFAULT 0,
    is_host BOOLEAN NOT NULL DEFAULT FALSE,
    is_ready BOOLEAN NOT NULL DEFAULT FALSE,
    is_connected BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_room_session UNIQUE (room_id, session_token)
);
CREATE INDEX IF NOT EXISTS idx_players_room ON players(room_id);
CREATE INDEX IF NOT EXISTS idx_players_session ON players(session_token);

-- 3. Game Rounds Table
CREATE TABLE IF NOT EXISTS game_rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    round_number INT NOT NULL,
    pot_amount INT NOT NULL,
    multiplier FLOAT NOT NULL DEFAULT 1.0,
    outcome_type VARCHAR(30) NOT NULL, -- ALL_COOPERATE, SOLO_BETRAYAL, MUTUAL_BETRAYAL, TIMEOUT_ZERO
    ai_commentary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_room_round UNIQUE (room_id, round_number)
);
CREATE INDEX IF NOT EXISTS idx_rounds_room ON game_rounds(room_id);

-- 4. Player Round Choices Table
CREATE TABLE IF NOT EXISTS player_round_choices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    round_id UUID NOT NULL REFERENCES game_rounds(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    choice VARCHAR(16) NOT NULL, -- COOPERATE, BETRAY, TIMEOUT
    response_time_ms INT DEFAULT 0,
    coins_awarded INT NOT NULL DEFAULT 0,
    accumulated_score INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_round_player UNIQUE (round_id, player_id)
);
CREATE INDEX IF NOT EXISTS idx_choices_round ON player_round_choices(round_id);
CREATE INDEX IF NOT EXISTS idx_choices_player ON player_round_choices(player_id);

-- 5. Replays & Matches Table
CREATE TABLE IF NOT EXISTS match_replays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID UNIQUE NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    room_code VARCHAR(6) NOT NULL,
    winner_nickname VARCHAR(32),
    winning_score INT,
    total_players INT NOT NULL,
    full_replay_log JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_replays_code ON match_replays(room_code);

-- 6. Global Leaderboard (Hall of Fame)
CREATE TABLE IF NOT EXISTS leaderboard_hall_of_fame (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_nickname VARCHAR(32) NOT NULL,
    score INT NOT NULL,
    solo_betrayals INT NOT NULL DEFAULT 0,
    cooperations INT NOT NULL DEFAULT 0,
    room_code VARCHAR(6) NOT NULL,
    match_replay_id UUID REFERENCES match_replays(id) ON DELETE SET NULL,
    achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard_hall_of_fame(score DESC);

-- Enable RLS Policies
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_round_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_replays ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_hall_of_fame ENABLE ROW LEVEL SECURITY;

-- Read-only public policies for anonymous game rooms
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read access to rooms') THEN
        CREATE POLICY "Public read access to rooms" ON rooms FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read access to players') THEN
        CREATE POLICY "Public read access to players" ON players FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read access to rounds') THEN
        CREATE POLICY "Public read access to rounds" ON game_rounds FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read access to choices') THEN
        CREATE POLICY "Public read access to choices" ON player_round_choices FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read access to replays') THEN
        CREATE POLICY "Public read access to replays" ON match_replays FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read access to leaderboard') THEN
        CREATE POLICY "Public read access to leaderboard" ON leaderboard_hall_of_fame FOR SELECT USING (true);
    END IF;
END $$;
