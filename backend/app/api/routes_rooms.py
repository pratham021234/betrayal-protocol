from fastapi import APIRouter, HTTPException, status
from ..models.schemas import (
    RoomCreateRequest, RoomCreateResponse,
    RoomJoinRequest, RoomJoinResponse,
    RoomInfoResponse
)
from ..core.room_manager import room_manager

router = APIRouter(prefix="/api/rooms", tags=["Rooms"])

@router.post("", response_model=RoomCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_room(req: RoomCreateRequest):
    try:
        room, host_player = await room_manager.create_room(
            nickname=req.nickname,
            avatar_id=req.avatar_id,
            round_duration_sec=req.round_duration_sec,
            max_rounds=req.max_rounds
        )
        return RoomCreateResponse(
            room_code=room.room_code,
            room_id=room.room_id,
            player_id=host_player.id,
            session_token=host_player.session_token,
            is_host=True
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/join", response_model=RoomJoinResponse)
async def join_room(req: RoomJoinRequest):
    try:
        room, player = await room_manager.join_room(
            room_code=req.room_code,
            nickname=req.nickname,
            avatar_id=req.avatar_id
        )
        return RoomJoinResponse(
            room_code=room.room_code,
            room_id=room.room_id,
            player_id=player.id,
            session_token=player.session_token,
            is_host=False,
            status=room.status
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to join room: {str(e)}")

@router.get("/{room_code}", response_model=RoomInfoResponse)
async def get_room_info(room_code: str):
    room = room_manager.get_room(room_code)
    if not room:
        return RoomInfoResponse(
            exists=False,
            status="NOT_FOUND",
            player_count=0,
            max_players=8,
            current_round=0,
            max_rounds=10
        )
    return RoomInfoResponse(
        exists=True,
        status=room.status,
        player_count=len(room.players),
        max_players=8,
        current_round=room.current_round,
        max_rounds=room.max_rounds
    )
