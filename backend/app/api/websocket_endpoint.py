import logging
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status
from ..core.room_manager import room_manager

logger = logging.getLogger("betrayal_protocol.websocket")
router = APIRouter(tags=["WebSocket"])

@router.websocket("/ws/{room_code}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_code: str,
    token: str = Query(...)
):
    code = room_code.strip().upper()
    resolved = room_manager.resolve_token(token)
    if not resolved:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    resolved_code, player_id = resolved
    if resolved_code != code:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    room = room_manager.get_room(code)
    if not room or player_id not in room.players:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await websocket.accept()
    await room_manager.register_connection(code, player_id, websocket)

    # Send initial state snapshot immediately to this client
    await websocket.send_json({
        "type": "ROOM_STATE_UPDATE",
        "data": room.to_state_dict()
    })

    try:
        while True:
            text_data = await websocket.receive_text()
            try:
                msg = json.loads(text_data)
            except Exception:
                continue

            msg_type = msg.get("type")
            data = msg.get("data", {})

            if msg_type == "PING":
                await websocket.send_json({"type": "PONG"})

            elif msg_type == "PLAYER_READY":
                ready_state = bool(data.get("ready", True))
                await room_manager.set_player_ready(code, player_id, ready_state)

            elif msg_type == "START_GAME":
                try:
                    await room_manager.start_game(code, player_id)
                except ValueError as e:
                    await websocket.send_json({
                        "type": "ERROR",
                        "data": {"message": str(e)}
                    })

            elif msg_type == "SUBMIT_CHOICE":
                choice = data.get("choice", "")
                await room_manager.submit_choice(code, player_id, choice)

            elif msg_type == "SEND_TAUNT":
                taunt_id = data.get("taunt_id", "custom")
                message = data.get("message", "...")
                icon = data.get("icon", "💬")
                await room_manager.send_taunt(code, player_id, taunt_id, message, icon)

            elif msg_type == "REMATCH":
                await room_manager.reset_for_rematch(code, player_id)

            elif msg_type == "REQUEST_SYNC":
                await websocket.send_json({
                    "type": "ROOM_STATE_UPDATE",
                    "data": room.to_state_dict()
                })

    except WebSocketDisconnect:
        logger.info(f"Player {player_id} disconnected from room {code}.")
        await room_manager.remove_connection(code, player_id)
    except Exception as e:
        logger.error(f"WebSocket error in room {code} for player {player_id}: {e}")
        await room_manager.remove_connection(code, player_id)
