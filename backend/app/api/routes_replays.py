from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from ..db.supabase_client import db_service
from ..models.schemas import LeaderboardEntry

router = APIRouter(prefix="/api", tags=["Replays & Leaderboard"])

@router.get("/replays/{identifier}")
async def get_replay(identifier: str):
    record = await db_service.get_replay(identifier)
    if not record:
        raise HTTPException(status_code=404, detail="Replay not found.")
    return record

@router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(limit: int = 20):
    records = await db_service.get_leaderboard(limit=limit)
    return records
