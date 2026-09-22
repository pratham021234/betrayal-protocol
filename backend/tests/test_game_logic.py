import pytest
import asyncio
from app.core.game_state import GameEngine, PlayerState
from app.core.room_manager import RoomManager

def test_pot_scaling():
    # Base pot 100
    pot1, mult1 = GameEngine.get_pot_and_multiplier(1)
    assert pot1 == 100
    assert mult1 == 1.0

    pot4, mult4 = GameEngine.get_pot_and_multiplier(4)
    assert pot4 == 400
    assert mult4 == 1.0

    # Round 5 has 1.5x multiplier
    pot5, mult5 = GameEngine.get_pot_and_multiplier(5)
    assert pot5 == 750
    assert mult5 == 1.5

    # Round 9 has 1.5x multiplier
    pot9, mult9 = GameEngine.get_pot_and_multiplier(9)
    assert pot9 == 1350
    assert mult9 == 1.5

    # Round 10 has 2.0x multiplier
    pot10, mult10 = GameEngine.get_pot_and_multiplier(10)
    assert pot10 == 2000
    assert mult10 == 2.0

def test_all_cooperate_payoff():
    pot = 600
    choices = {
        "p1": "COOPERATE",
        "p2": "COOPERATE",
        "p3": "COOPERATE"
    }
    outcome, deltas = GameEngine.resolve_round_payoffs(pot, choices)
    assert outcome == "ALL_COOPERATE"
    assert deltas["p1"] == 200
    assert deltas["p2"] == 200
    assert deltas["p3"] == 200

def test_solo_betrayal_payoff():
    pot = 600
    choices = {
        "p1": "COOPERATE",
        "p2": "BETRAY",
        "p3": "COOPERATE"
    }
    outcome, deltas = GameEngine.resolve_round_payoffs(pot, choices)
    assert outcome == "SOLO_BETRAYAL"
    assert deltas["p2"] == 600
    assert deltas["p1"] == 0
    assert deltas["p3"] == 0

def test_mutual_betrayal_payoff():
    pot = 600
    choices = {
        "p1": "BETRAY",
        "p2": "BETRAY",
        "p3": "COOPERATE"
    }
    outcome, deltas = GameEngine.resolve_round_payoffs(pot, choices)
    assert outcome == "MUTUAL_BETRAYAL"
    assert deltas["p1"] == 0
    assert deltas["p2"] == 0
    assert deltas["p3"] == 0

def test_accolades_assignment():
    players = [
        PlayerState(id="p1", nickname="Alpha", avatar_id="cyber_1", session_token="s1", score=1200, successful_solo_betrayals=2),
        PlayerState(id="p2", nickname="Beta", avatar_id="cyber_2", session_token="s2", score=400, cooperations_count=9),
        PlayerState(id="p3", nickname="Gamma", avatar_id="cyber_3", session_token="s3", score=0, failed_betrayals=4)
    ]
    accolades = GameEngine.calculate_accolades(players)
    assert accolades["p1"] == "The Protocol Mastermind"
    assert accolades["p2"] == "The Loyal Martyr"
    assert accolades["p3"] == "Chaos Architect"

@pytest.mark.asyncio
async def test_room_lifecycle():
    mgr = RoomManager()
    room, host = await mgr.create_room("HostOperative", avatar_id="cyber_1", round_duration_sec=2, max_rounds=2)
    assert room.room_code in mgr.rooms
    assert host.is_host is True

    # Join second player
    room, p2 = await mgr.join_room(room.room_code, "GuestOperative", avatar_id="cyber_2")
    assert len(room.players) == 2

    # Check ready
    await mgr.set_player_ready(room.room_code, p2.id, True)
    assert room.players[p2.id].is_ready is True
