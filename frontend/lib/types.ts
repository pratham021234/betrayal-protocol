export type GameStatus = "LOBBY" | "BRIEFING" | "DECISION" | "REVEAL" | "GAME_OVER";

export interface Player {
  id: string;
  nickname: string;
  avatar_id: string;
  score: number;
  is_host: boolean;
  is_ready: boolean;
  is_connected: boolean;
  has_locked_in?: boolean;
}

export interface RoomState {
  room_id: string;
  room_code: string;
  status: GameStatus;
  host_id: string;
  current_round: number;
  max_rounds: number;
  round_duration_sec: number;
  current_pot: number;
  current_multiplier: number;
  round_end_timestamp: number;
  players: Player[];
}

export interface ChoiceRevealItem {
  player_id: string;
  nickname: string;
  avatar_id: string;
  choice: "COOPERATE" | "BETRAY" | "TIMEOUT";
  delta: number;
  new_score: number;
}

export interface RoundRevealData {
  round_number: number;
  pot: number;
  multiplier: number;
  outcome_type: "ALL_COOPERATE" | "SOLO_BETRAYAL" | "MUTUAL_BETRAYAL";
  choices: ChoiceRevealItem[];
  warden_commentary: string;
  is_last_round: boolean;
}

export interface PodiumItem {
  rank: number;
  player_id: string;
  nickname: string;
  avatar_id: string;
  score: number;
  title: string;
  solo_betrayals: number;
  cooperations: number;
}

export interface GameOverData {
  winner: {
    nickname: string;
    score: number;
  };
  podium: PodiumItem[];
  replay_id: string;
}

export interface TauntData {
  player_id: string;
  nickname: string;
  taunt_id: string;
  message: string;
  icon: string;
}

export interface ReplayRound {
  round_number: number;
  pot: number;
  multiplier: number;
  outcome_type: string;
  choices: Record<string, string>;
  deltas: Record<string, number>;
  commentary: string;
}

export interface ReplayLog {
  id: string;
  room_code: string;
  winner_nickname: string;
  winning_score: number;
  total_players: number;
  created_at: string;
  full_replay_log: {
    rounds: ReplayRound[];
    final_standings: PodiumItem[];
  };
}

export interface LeaderboardEntry {
  id: string;
  player_nickname: string;
  score: number;
  solo_betrayals: number;
  cooperations: number;
  room_code: string;
  achieved_at: string;
}
