import asyncio
import random
import string
import time
import uuid
import logging
from typing import Dict, List, Optional, Any
from fastapi import WebSocket
from ..models.schemas import PlayerInfo
from ..models.events import WSEvent
from .game_state import GameEngine, PlayerState, RoundRecord
from .gemini_ai import commentary_engine
from ..db.supabase_client import db_service

logger = logging.getLogger("betrayal_protocol.room_manager")

SAFE_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

class RoomSession:
    def __init__(
        self,
        room_id: str,
        room_code: str,
        host_player_id: str,
        round_duration_sec: int = 15,
        max_rounds: int = 10
    ):
        self.room_id = room_id
        self.room_code = room_code
        self.host_player_id = host_player_id
        self.status = "LOBBY"  # LOBBY, BRIEFING, DECISION, REVEAL, GAME_OVER
        self.round_duration_sec = round_duration_sec
        self.max_rounds = max_rounds
        self.current_round = 0
        
        self.players: Dict[str, PlayerState] = {}
        self.connections: Dict[str, WebSocket] = {}
        self.round_history: List[RoundRecord] = []
        
        self.current_pot = 0
        self.current_multiplier = 1.0
        self.round_end_timestamp: float = 0.0
        
        self.lock = asyncio.Lock()
        self.timer_task: Optional[asyncio.Task] = None

    def get_public_player_list(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": p.id,
                "nickname": p.nickname,
                "avatar_id": p.avatar_id,
                "score": p.score,
                "is_host": p.is_host,
                "is_ready": p.is_ready,
                "is_connected": p.is_connected,
                "has_locked_in": p.current_choice is not None
            }
            for p in self.players.values()
        ]

    def to_state_dict(self) -> Dict[str, Any]:
        return {
            "room_id": self.room_id,
            "room_code": self.room_code,
            "status": self.status,
            "host_id": self.host_player_id,
            "current_round": self.current_round,
            "max_rounds": self.max_rounds,
            "round_duration_sec": self.round_duration_sec,
            "current_pot": self.current_pot,
            "current_multiplier": self.current_multiplier,
            "round_end_timestamp": self.round_end_timestamp,
            "players": self.get_public_player_list()
        }

class RoomManager:
    def __init__(self):
        self.rooms: Dict[str, RoomSession] = {}
        self._token_to_player: Dict[str, tuple[str, str]] = {}  # token -> (room_code, player_id)

    def _generate_room_code(self) -> str:
        for _ in range(100):
            code = "".join(random.choices(SAFE_CODE_CHARS, k=4))
            if code not in self.rooms:
                return code
        return "".join(random.choices(SAFE_CODE_CHARS, k=6))

    async def create_room(
        self,
        nickname: str,
        avatar_id: str = "cyber_1",
        round_duration_sec: int = 15,
        max_rounds: int = 10
    ) -> tuple[RoomSession, PlayerState]:
        room_code = self._generate_room_code()
        room_id = str(uuid.uuid4())
        player_id = str(uuid.uuid4())
        session_token = str(uuid.uuid4())

        room = RoomSession(
            room_id=room_id,
            room_code=room_code,
            host_player_id=player_id,
            round_duration_sec=round_duration_sec,
            max_rounds=max_rounds
        )
        
        host_player = PlayerState(
            id=player_id,
            nickname=nickname,
            avatar_id=avatar_id,
            session_token=session_token,
            is_host=True,
            is_ready=True,
            is_connected=False
        )

        room.players[player_id] = host_player
        self.rooms[room_code] = room
        self._token_to_player[session_token] = (room_code, player_id)

        logger.info(f"Room {room_code} created by host '{nickname}' ({player_id}).")
        return room, host_player

    async def join_room(
        self,
        room_code: str,
        nickname: str,
        avatar_id: str = "cyber_1"
    ) -> tuple[RoomSession, PlayerState]:
        code = room_code.strip().upper()
        if code not in self.rooms:
            raise ValueError(f"Protocol room '{code}' does not exist.")

        room = self.rooms[code]
        async with room.lock:
            if room.status != "LOBBY":
                raise ValueError("Match is already in progress. Infiltration locked.")
            if len(room.players) >= 8:
                raise ValueError("Room is at maximum capacity (8 operatives).")

            player_id = str(uuid.uuid4())
            session_token = str(uuid.uuid4())
            player = PlayerState(
                id=player_id,
                nickname=nickname,
                avatar_id=avatar_id,
                session_token=session_token,
                is_host=False,
                is_ready=False,
                is_connected=False
            )
            room.players[player_id] = player
            self._token_to_player[session_token] = (code, player_id)

        await self.broadcast(code, {
            "type": "ROOM_STATE_UPDATE",
            "data": room.to_state_dict()
        })

        return room, player

    def get_room(self, room_code: str) -> Optional[RoomSession]:
        return self.rooms.get(room_code.strip().upper())

    def resolve_token(self, token: str) -> Optional[tuple[str, str]]:
        return self._token_to_player.get(token)

    async def register_connection(self, room_code: str, player_id: str, ws: WebSocket):
        code = room_code.strip().upper()
        room = self.rooms.get(code)
        if not room or player_id not in room.players:
            return

        async with room.lock:
            room.connections[player_id] = ws
            room.players[player_id].is_connected = True

        await self.broadcast(code, {
            "type": "ROOM_STATE_UPDATE",
            "data": room.to_state_dict()
        })

    async def remove_connection(self, room_code: str, player_id: str):
        code = room_code.strip().upper()
        room = self.rooms.get(code)
        if not room:
            return

        async with room.lock:
            if player_id in room.connections:
                del room.connections[player_id]
            if player_id in room.players:
                room.players[player_id].is_connected = False

        await self.broadcast(code, {
            "type": "ROOM_STATE_UPDATE",
            "data": room.to_state_dict()
        })

    async def broadcast(self, room_code: str, payload: Dict[str, Any]):
        code = room_code.strip().upper()
        room = self.rooms.get(code)
        if not room:
            return

        dead_connections = []
        for pid, ws in list(room.connections.items()):
            try:
                await ws.send_json(payload)
            except Exception as e:
                logger.warning(f"Error sending message to player {pid}: {e}")
                dead_connections.append(pid)

        for pid in dead_connections:
            if pid in room.connections:
                del room.connections[pid]

    async def set_player_ready(self, room_code: str, player_id: str, ready: bool):
        room = self.get_room(room_code)
        if not room or room.status != "LOBBY":
            return

        async with room.lock:
            if player_id in room.players:
                room.players[player_id].is_ready = ready

        await self.broadcast(room_code, {
            "type": "ROOM_STATE_UPDATE",
            "data": room.to_state_dict()
        })

    async def start_game(self, room_code: str, player_id: str):
        room = self.get_room(room_code)
        if not room:
            raise ValueError("Room not found.")
        if room.host_player_id != player_id:
            raise ValueError("Only the Host can initiate the Protocol.")
        if len(room.players) < 2:
            raise ValueError("Minimum 2 operatives required to initiate Protocol.")
        if room.status != "LOBBY":
            raise ValueError("Game is already active.")

        async with room.lock:
            room.current_round = 0
            room.round_history.clear()
            for p in room.players.values():
                p.score = 0
                p.cooperations_count = 0
                p.betrayals_count = 0
                p.successful_solo_betrayals = 0
                p.failed_betrayals = 0
                p.largest_single_haul = 0

        # Start Round 1
        await self._advance_to_next_round(room)

    async def _advance_to_next_round(self, room: RoomSession):
        async with room.lock:
            room.current_round += 1
            room.status = "DECISION"
            
            # Reset choices
            for p in room.players.values():
                p.current_choice = None
                p.lock_time_ms = None

            pot, mult = GameEngine.get_pot_and_multiplier(room.current_round)
            room.current_pot = pot
            room.current_multiplier = mult
            room.round_end_timestamp = time.time() + room.round_duration_sec

        # Broadcast ROUND_START
        await self.broadcast(room.room_code, {
            "type": "ROUND_START",
            "data": {
                "round_number": room.current_round,
                "max_rounds": room.max_rounds,
                "pot": room.current_pot,
                "multiplier": room.current_multiplier,
                "duration_sec": room.round_duration_sec,
                "end_timestamp": room.round_end_timestamp
            }
        })
        await self.broadcast(room.room_code, {
            "type": "ROOM_STATE_UPDATE",
            "data": room.to_state_dict()
        })

        # Launch timer task
        if room.timer_task and not room.timer_task.done():
            room.timer_task.cancel()
        room.timer_task = asyncio.create_task(self._round_timer(room))

    async def _round_timer(self, room: RoomSession):
        try:
            await asyncio.sleep(room.round_duration_sec)
            await self._finalize_round(room)
        except asyncio.CancelledError:
            pass  # Early resolution when all locked in

    async def submit_choice(self, room_code: str, player_id: str, choice: str):
        room = self.get_room(room_code)
        if not room or room.status != "DECISION":
            return

        choice_clean = choice.upper()
        if choice_clean not in ["COOPERATE", "BETRAY"]:
            return

        should_resolve_early = False
        async with room.lock:
            player = room.players.get(player_id)
            if not player:
                return

            player.current_choice = choice_clean
            player.lock_time_ms = int(time.time() * 1000)

            # Count total locked in
            locked_count = sum(1 for p in room.players.values() if p.current_choice is not None and p.is_connected)
            connected_count = sum(1 for p in room.players.values() if p.is_connected)

            if locked_count >= connected_count and connected_count >= 2:
                should_resolve_early = True

        # Broadcast locked-in indicator
        await self.broadcast(room_code, {
            "type": "PLAYER_LOCKED_IN",
            "data": {
                "player_id": player_id,
                "total_locked": locked_count,
                "total_players": connected_count
            }
        })
        await self.broadcast(room_code, {
            "type": "ROOM_STATE_UPDATE",
            "data": room.to_state_dict()
        })

        if should_resolve_early:
            if room.timer_task and not room.timer_task.done():
                room.timer_task.cancel()
            await self._finalize_round(room)

    async def send_taunt(self, room_code: str, player_id: str, taunt_id: str, message: str, icon: str):
        room = self.get_room(room_code)
        if not room or player_id not in room.players:
            return

        player = room.players[player_id]
        await self.broadcast(room_code, {
            "type": "TAUNT_BROADCAST",
            "data": {
                "player_id": player_id,
                "nickname": player.nickname,
                "taunt_id": taunt_id,
                "message": message[:80],
                "icon": icon[:8]
            }
        })

    async def _finalize_round(self, room: RoomSession):
        async with room.lock:
            if room.status != "DECISION":
                return
            room.status = "REVEAL"

            # Fill defaults for anyone who didn't submit
            choices_map = {}
            for p in room.players.values():
                if p.is_connected:
                    if not p.current_choice:
                        p.current_choice = "COOPERATE"  # Default fallback
                    choices_map[p.id] = p.current_choice

            outcome, deltas = GameEngine.resolve_round_payoffs(room.current_pot, choices_map)

            # Apply points & track stats
            choices_list = []
            for pid, choice in choices_map.items():
                player = room.players[pid]
                gain = deltas.get(pid, 0)
                player.score += gain
                if gain > player.largest_single_haul:
                    player.largest_single_haul = gain

                if choice == "COOPERATE":
                    player.cooperations_count += 1
                else:
                    player.betrayals_count += 1
                    if outcome == "SOLO_BETRAYAL":
                        player.successful_solo_betrayals += 1
                    else:
                        player.failed_betrayals += 1

                choices_list.append({
                    "player_id": pid,
                    "nickname": player.nickname,
                    "avatar_id": player.avatar_id,
                    "choice": choice,
                    "delta": gain,
                    "new_score": player.score
                })

            # AI Commentary
            commentary = commentary_engine.generate_commentary(
                round_number=room.current_round,
                total_rounds=room.max_rounds,
                pot=room.current_pot,
                outcome_type=outcome,
                choices=choices_list
            )

            # Record in history
            record = RoundRecord(
                round_number=room.current_round,
                pot=room.current_pot,
                multiplier=room.current_multiplier,
                outcome_type=outcome,
                choices=choices_map,
                deltas=deltas,
                commentary=commentary
            )
            room.round_history.append(record)

            is_last_round = room.current_round >= room.max_rounds

        # Broadcast ROUND_REVEAL
        await self.broadcast(room.room_code, {
            "type": "ROUND_REVEAL",
            "data": {
                "round_number": room.current_round,
                "pot": room.current_pot,
                "multiplier": room.current_multiplier,
                "outcome_type": outcome,
                "choices": choices_list,
                "warden_commentary": commentary,
                "is_last_round": is_last_round
            }
        })
        await self.broadcast(room.room_code, {
            "type": "ROOM_STATE_UPDATE",
            "data": room.to_state_dict()
        })

        # Pause to let players absorb the drama and commentary (5s)
        await asyncio.sleep(5.0)

        if not is_last_round:
            await self._advance_to_next_round(room)
        else:
            await self._conclude_game(room)

    async def _conclude_game(self, room: RoomSession):
        async with room.lock:
            room.status = "GAME_OVER"
            accolades = GameEngine.calculate_accolades(list(room.players.values()))

            sorted_players = sorted(room.players.values(), key=lambda p: p.score, reverse=True)
            winner = sorted_players[0] if sorted_players else None

            podium = [
                {
                    "rank": idx + 1,
                    "player_id": p.id,
                    "nickname": p.nickname,
                    "avatar_id": p.avatar_id,
                    "score": p.score,
                    "title": accolades.get(p.id, "Cyber Operative"),
                    "solo_betrayals": p.successful_solo_betrayals,
                    "cooperations": p.cooperations_count
                }
                for idx, p in enumerate(sorted_players)
            ]

            # Assemble replay log
            replay_log = {
                "rounds": [
                    {
                        "round_number": r.round_number,
                        "pot": r.pot,
                        "multiplier": r.multiplier,
                        "outcome_type": r.outcome_type,
                        "choices": r.choices,
                        "deltas": r.deltas,
                        "commentary": r.commentary
                    }
                    for r in room.round_history
                ],
                "final_standings": podium
            }

            leaderboard_candidates = [
                {
                    "nickname": p.nickname,
                    "score": p.score,
                    "solo_betrayals": p.successful_solo_betrayals,
                    "cooperations": p.cooperations_count
                }
                for p in sorted_players
            ]

        # Persist match
        replay_id = await db_service.save_match(
            room_code=room.room_code,
            winner_nickname=winner.nickname if winner else "None",
            winning_score=winner.score if winner else 0,
            total_players=len(room.players),
            replay_log=replay_log,
            leaderboard_candidates=leaderboard_candidates
        )

        # Broadcast GAME_OVER
        await self.broadcast(room.room_code, {
            "type": "GAME_OVER",
            "data": {
                "winner": {
                    "nickname": winner.nickname if winner else "None",
                    "score": winner.score if winner else 0
                },
                "podium": podium,
                "replay_id": replay_id
            }
        })
        await self.broadcast(room.room_code, {
            "type": "ROOM_STATE_UPDATE",
            "data": room.to_state_dict()
        })

    async def reset_for_rematch(self, room_code: str, player_id: str):
        room = self.get_room(room_code)
        if not room or room.host_player_id != player_id:
            return

        async with room.lock:
            room.status = "LOBBY"
            room.current_round = 0
            room.round_history.clear()
            for p in room.players.values():
                p.score = 0
                p.is_ready = p.is_host
                p.current_choice = None
                p.cooperations_count = 0
                p.betrayals_count = 0
                p.successful_solo_betrayals = 0
                p.failed_betrayals = 0
                p.largest_single_haul = 0

        await self.broadcast(room_code, {
            "type": "ROOM_STATE_UPDATE",
            "data": room.to_state_dict()
        })

room_manager = RoomManager()
