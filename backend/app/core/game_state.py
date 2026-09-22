from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass, field
import time

@dataclass
class RoundRecord:
    round_number: int
    pot: int
    multiplier: float
    outcome_type: str  # ALL_COOPERATE, SOLO_BETRAYAL, MUTUAL_BETRAYAL
    choices: Dict[str, str]  # player_id -> "COOPERATE" | "BETRAY"
    deltas: Dict[str, int]   # player_id -> coins awarded
    commentary: str = ""
    timestamp: float = field(default_factory=time.time)

@dataclass
class PlayerState:
    id: str
    nickname: str
    avatar_id: str
    session_token: str
    is_host: bool = False
    is_ready: bool = False
    is_connected: bool = True
    score: int = 0
    current_choice: Optional[str] = None  # None until locked in for round
    lock_time_ms: Optional[int] = None
    
    # Career Stats for Accolades
    cooperations_count: int = 0
    betrayals_count: int = 0
    successful_solo_betrayals: int = 0
    failed_betrayals: int = 0
    largest_single_haul: int = 0

class GameEngine:
    @staticmethod
    def get_pot_and_multiplier(round_number: int, base_pot: int = 100) -> Tuple[int, float]:
        """
        Calculates the effective pot and multiplier for a given round.
        Escalates predictably with dramatic surges on rounds 5, 9, and 10.
        """
        multiplier = 1.0
        if round_number == 5:
            multiplier = 1.5
        elif round_number == 9:
            multiplier = 1.5
        elif round_number >= 10:
            multiplier = 2.0
            
        raw_pot = base_pot * round_number * multiplier
        return int(raw_pot), multiplier

    @staticmethod
    def resolve_round_payoffs(
        pot: int, 
        choices: Dict[str, str]
    ) -> Tuple[str, Dict[str, int]]:
        """
        Resolves the payoff matrix according to core rules:
        - If everyone cooperates (0 betrayals): Pot split equally.
        - If exactly 1 player betrays: Lone betrayer gets 100% of pot, others 0.
        - If 2+ players betray: Mutual greed collapse, all receive 0.
        """
        player_ids = list(choices.keys())
        total_players = len(player_ids)
        if total_players == 0:
            return "ALL_COOPERATE", {}
            
        betrayers = [pid for pid, c in choices.items() if c == "BETRAY"]
        cooperators = [pid for pid, c in choices.items() if c != "BETRAY"]
        
        deltas: Dict[str, int] = {pid: 0 for pid in player_ids}
        
        if len(betrayers) == 0:
            outcome = "ALL_COOPERATE"
            share = pot // total_players
            for pid in player_ids:
                deltas[pid] = share
        elif len(betrayers) == 1:
            outcome = "SOLO_BETRAYAL"
            deltas[betrayers[0]] = pot
            for pid in cooperators:
                deltas[pid] = 0
        else:
            outcome = "MUTUAL_BETRAYAL"
            for pid in player_ids:
                deltas[pid] = 0
                
        return outcome, deltas

    @staticmethod
    def calculate_accolades(players: List[PlayerState]) -> Dict[str, str]:
        """
        Assigns special algorithmic titles to players based on their performance.
        """
        accolades: Dict[str, str] = {}
        if not players:
            return accolades

        sorted_by_score = sorted(players, key=lambda p: p.score, reverse=True)
        winner = sorted_by_score[0]
        accolades[winner.id] = "The Protocol Mastermind"

        for p in players:
            if p.id in accolades:
                continue
            if p.successful_solo_betrayals >= 2:
                accolades[p.id] = "The Shadow Viper"
            elif p.failed_betrayals >= 3:
                accolades[p.id] = "Chaos Architect"
            elif p.cooperations_count >= 8 and p.score < winner.score:
                accolades[p.id] = "The Loyal Martyr"
            elif p.betrayals_count == 0:
                accolades[p.id] = "Pure Pacifist"
            elif p.betrayals_count >= 6:
                accolades[p.id] = "The Renegade"
            else:
                accolades[p.id] = "Cyber Operative"

        return accolades
