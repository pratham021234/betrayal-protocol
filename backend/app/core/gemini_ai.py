import random
import logging
from typing import List, Dict, Any, Optional
from ..config import settings

logger = logging.getLogger("betrayal_protocol.gemini")

PROCEDURAL_ROASTS = {
    "ALL_COOPERATE": [
        "A rare moment of synthetic harmony. All operatives held the line. How quaint.",
        "Shields aligned, vault shared equally. But how long can this fragile peace endure?",
        "Unanimous cooperation detected. The Protocol Warden yawns at your lack of ambition.",
        "Mutual trust held firm. You all earned a crust, but left the grand prize on the table.",
        "A peaceful round in a ruthless city. Don't get too comfortable, operatives."
    ],
    "SOLO_BETRAYAL": [
        "{betrayer} walked through the front door and took everything while the rest kept their eyes shut.",
        "Ruthless precision! {betrayer} siphoned {pot} coins clean. Total trust is total foolishness.",
        "One dagger, zero defenses. {betrayer} leaves {duped} clutching empty air.",
        "A masterclass in betrayal. {betrayer} just bought the round at everyone else's expense.",
        "{betrayer} strikes while {duped} play choir boys. Greed 1, Friendship 0."
    ],
    "MUTUAL_BETRAYAL": [
        "Multiple greed signatures collided! {betrayers} tried to steal the same crown and broke it instead.",
        "Mutual breach detected! The mainframe incinerates all {pot} coins. Nobody gets a single dime.",
        "When everyone wants to be the villain, everyone ends up a clown. Total vault lockout.",
        "Greed overload: {betrayers} clashed in the vault door. The Warden thanks you for the free energy.",
        "An exquisite spectacle of mutual destruction. Zero payout. The house always wins."
    ]
}

class GeminiCommentaryEngine:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.client = None
        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel(
                    model_name="gemini-1.5-flash",
                    system_instruction=(
                        "You are the 'Protocol Warden', an omniscient, sarcastic, cutting, and darkly witty cyberpunk AI "
                        "overseeing a high-stakes social dilemma game called 'Betrayal Protocol'. "
                        "Keep your commentary punchy: 1 to 2 sharp sentences maximum. Call out players by nickname. "
                        "Roast betrayers, mock the naïve, or laugh at mutual destruction."
                    )
                )
                logger.info("Gemini AI commentary initialized with Google Generative AI.")
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini client: {e}. Using procedural fallback.")

    def generate_commentary(
        self,
        round_number: int,
        total_rounds: int,
        pot: int,
        outcome_type: str,
        choices: List[Dict[str, Any]]
    ) -> str:
        """
        Generates punchy commentary for a completed round.
        Uses Gemini if available, falling back smoothly to procedural commentary.
        """
        betrayers = [c["nickname"] for c in choices if c["choice"] == "BETRAY"]
        cooperators = [c["nickname"] for c in choices if c["choice"] != "BETRAY"]

        # Try Gemini if API key is active
        if self.api_key and hasattr(self, 'model'):
            try:
                prompt = (
                    f"Round {round_number} of {total_rounds} complete. Pot was {pot} coins.\n"
                    f"Outcome: {outcome_type}.\n"
                    f"Betrayers: {', '.join(betrayers) if betrayers else 'None'}.\n"
                    f"Cooperators: {', '.join(cooperators) if cooperators else 'None'}.\n"
                    f"Give a 1-2 sentence scathing or amused critique of this outcome."
                )
                response = self.model.generate_content(prompt)
                if response and response.text:
                    return response.text.strip().replace('"', '')
            except Exception as e:
                logger.warning(f"Gemini generation call failed: {e}. Falling back to procedural.")

        # Context-aware procedural fallback
        if outcome_type == "ALL_COOPERATE":
            template = random.choice(PROCEDURAL_ROASTS["ALL_COOPERATE"])
            return template.format(pot=pot)
        elif outcome_type == "SOLO_BETRAYAL" and betrayers:
            template = random.choice(PROCEDURAL_ROASTS["SOLO_BETRAYAL"])
            duped_str = ", ".join(cooperators[:2]) if cooperators else "the rest"
            return template.format(betrayer=betrayers[0], duped=duped_str, pot=pot)
        elif outcome_type == "MUTUAL_BETRAYAL":
            template = random.choice(PROCEDURAL_ROASTS["MUTUAL_BETRAYAL"])
            betrayers_str = " & ".join(betrayers[:2]) if betrayers else "The traitors"
            return template.format(betrayers=betrayers_str, pot=pot)

        return f"Round {round_number} finalized. The mainframe adapts."

commentary_engine = GeminiCommentaryEngine()
