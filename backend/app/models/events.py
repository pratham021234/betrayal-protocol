from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class WSEvent(BaseModel):
    type: str
    data: Optional[Dict[str, Any]] = None

# Inbound payloads
class ChoiceSubmitPayload(BaseModel):
    choice: str  # "COOPERATE" or "BETRAY"

class TauntPayload(BaseModel):
    taunt_id: str
    message: str
    icon: str

class ReadyPayload(BaseModel):
    ready: bool

# Outbound data structures
class ChoiceRevealItem(BaseModel):
    player_id: str
    nickname: str
    avatar_id: str
    choice: str  # "COOPERATE", "BETRAY", "TIMEOUT"
    delta: int
    new_score: int

class RoundRevealData(BaseModel):
    round_number: int
    pot: int
    multiplier: float
    outcome_type: str  # "ALL_COOPERATE", "SOLO_BETRAYAL", "MUTUAL_BETRAYAL"
    choices: List[ChoiceRevealItem]
    warden_commentary: str
    is_last_round: bool
