import logging
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
from ..config import settings

logger = logging.getLogger("betrayal_protocol.db")

# In-memory storage fallback for standalone / local dev
_memory_replays: Dict[str, Dict[str, Any]] = {}
_memory_leaderboard: List[Dict[str, Any]] = []

class DatabaseService:
    def __init__(self):
        self.supabase = None
        if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
            try:
                from supabase import create_client, Client
                self.supabase: Client = create_client(
                    settings.SUPABASE_URL, 
                    settings.SUPABASE_SERVICE_ROLE_KEY
                )
                logger.info("Supabase persistence client connected successfully.")
            except Exception as e:
                logger.warning(f"Failed to initialize Supabase client: {e}. Using in-memory store.")

    async def save_match(
        self,
        room_code: str,
        winner_nickname: Optional[str],
        winning_score: int,
        total_players: int,
        replay_log: Dict[str, Any],
        leaderboard_candidates: List[Dict[str, Any]]
    ) -> str:
        """
        Saves completed match replay and appends eligible players to the leaderboard.
        """
        replay_id = str(uuid.uuid4())
        created_at = datetime.utcnow().isoformat()
        
        record = {
            "id": replay_id,
            "room_code": room_code,
            "winner_nickname": winner_nickname,
            "winning_score": winning_score,
            "total_players": total_players,
            "full_replay_log": replay_log,
            "created_at": created_at
        }
        
        # Save to memory
        _memory_replays[room_code] = record
        _memory_replays[replay_id] = record

        # Add to in-memory leaderboard
        for candidate in leaderboard_candidates:
            _memory_leaderboard.append({
                "id": str(uuid.uuid4()),
                "player_nickname": candidate["nickname"],
                "score": candidate["score"],
                "solo_betrayals": candidate.get("solo_betrayals", 0),
                "cooperations": candidate.get("cooperations", 0),
                "room_code": room_code,
                "achieved_at": created_at
            })
        
        # Sort in-memory leaderboard descending by score
        _memory_leaderboard.sort(key=lambda x: x["score"], reverse=True)

        # Attempt Supabase push if client is ready
        if self.supabase:
            try:
                self.supabase.table("match_replays").insert(record).execute()
                for c in leaderboard_candidates:
                    self.supabase.table("leaderboard_hall_of_fame").insert({
                        "player_nickname": c["nickname"],
                        "score": c["score"],
                        "solo_betrayals": c.get("solo_betrayals", 0),
                        "cooperations": c.get("cooperations", 0),
                        "room_code": room_code,
                        "achieved_at": created_at
                    }).execute()
            except Exception as e:
                logger.error(f"Error persisting to Supabase: {e}")

        return replay_id

    async def get_replay(self, identifier: str) -> Optional[Dict[str, Any]]:
        """
        Fetches match replay by room_code or replay_id.
        """
        # Check memory first
        if identifier in _memory_replays:
            return _memory_replays[identifier]

        # Check Supabase
        if self.supabase:
            try:
                res = self.supabase.table("match_replays")\
                    .select("*")\
                    .or_(f"room_code.eq.{identifier},id.eq.{identifier}")\
                    .limit(1)\
                    .execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.error(f"Error reading replay from Supabase: {e}")

        return None

    async def get_leaderboard(self, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Returns top scores from the hall of fame.
        """
        if self.supabase:
            try:
                res = self.supabase.table("leaderboard_hall_of_fame")\
                    .select("*")\
                    .order("score", desc=True)\
                    .limit(limit)\
                    .execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.error(f"Error querying Supabase leaderboard: {e}")

        return _memory_leaderboard[:limit]

db_service = DatabaseService()
