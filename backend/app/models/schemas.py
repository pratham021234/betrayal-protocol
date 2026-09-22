from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class RoomCreateRequest(BaseModel):
    nickname: str = Field(..., min_length=2, max_length=24)
    avatar_id: str = Field(default="cyber_1")
    round_duration_sec: int = Field(default=15, ge=5, le=60)
    max_rounds: int = Field(default=10, ge=3, le=20)

class RoomCreateResponse(BaseModel):
    room_code: str
    room_id: str
    player_id: str
    session_token: str
    is_host: bool = True

class RoomJoinRequest(BaseModel):
    room_code: str = Field(..., min_length=4, max_length=8)
    nickname: str = Field(..., min_length=2, max_length=24)
    avatar_id: str = Field(default="cyber_1")

class RoomJoinResponse(BaseModel):
    room_code: str
    room_id: str
    player_id: str
    session_token: str
    is_host: bool = False
    status: str

class PlayerInfo(BaseModel):
    id: str
    nickname: str
    avatar_id: str
    score: int
    is_host: bool
    is_ready: bool
    is_connected: bool
    has_locked_in: bool = False

class RoomInfoResponse(BaseModel):
    exists: bool
    status: str
    player_count: int
    max_players: int = 8
    current_round: int = 0
    max_rounds: int = 10

class LeaderboardEntry(BaseModel):
    id: str
    player_nickname: str
    score: int
    solo_betrayals: int
    cooperations: int
    room_code: str
    achieved_at: str

class ReplayDetailResponse(BaseModel):
    room_code: str
    winner_nickname: Optional[str]
    winning_score: Optional[int]
    total_players: int
    created_at: str
    rounds: List[Dict[str, Any]]
    final_standings: List[Dict[str, Any]]
