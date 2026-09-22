# ⚡ Betrayal Protocol

> **Competition-Quality Real-Time Multiplayer Social Dilemma Game**  
> Built for the Handshake *"Create a Multiplayer Game"* challenge.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15+-000000.svg?logo=next.js&logoColor=white)](https://nextjs.org)
[![WebSockets](https://img.shields.io/badge/WebSockets-Real--Time-00F0FF.svg)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
[![Gemini](https://img.shields.io/badge/Gemini_API-Commentary_AI-9D00FF.svg?logo=google&logoColor=white)](https://ai.google.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg?logo=supabase&logoColor=white)](https://supabase.com)

---

## 🎮 Game Concept & Rules

**Betrayal Protocol** is a fast-paced, 10-round psychological battle of trust, bluffing, and sudden treachery. Players join from any phone or laptop via a 4-letter room code or QR scan—**no registration or login required**.

### The Payoff Matrix:
- **🛡️ All Cooperate (Shield)**: Everyone shares the round pot equally. Stable, communal growth.
- **🗡️ Lone Betrayal (Breach)**: If exactly one operative betrays, they execute a solo heist and **steal 100% of the pot**. Cooperators receive 0!
- **💀 Mutual Collapse (Greed Collision)**: If 2 or more operatives betray in the same round, their breach signatures collide: **the pot is incinerated, and everyone gets 0**.

### Escalation:
- Pots scale from **100 coins in Round 1** up to **2,000 coins in Round 10** with high-voltage surges on rounds 5, 9, and 10.
- Operative with the highest coin total after 10 rounds wins.

---

## 🚀 Key Features

1. **Seamless Cross-Device Real-Time Sync**: Instant WebSocket communication between phones, tablets, and laptops.
2. **Zero-Friction Access**: Instant 4-character room codes (`CYBR`) + auto-generated QR codes and 1-click clipboard links.
3. **AI-Powered "Protocol Warden"**: Google Gemini-powered real-time commentary after every round that roasts betrayers, mocks mutual greed, and celebrates selfless fools.
4. **Tactical Psychological Warfare**: Real-time quick-ping emotes and taunts during the secret decision phase (*"Trust Me"*, *"I Smell Greed"*, *"Mutual Ruin"*).
5. **Interactive Match Replay**: Step-by-step round scrubber (`/replay/[id]`) replaying every choice, coin delta, and AI roast.
6. **Hall of Fame Leaderboard**: Global ranking table tracking top coin hauls, solo heist records, and loyalty badges.
7. **Procedural Web Audio Engine**: Zero-asset audio synthesizer using Web Audio API for tactile clicks, alarms, and coin showers.

---

## 🛠️ Architecture & Monorepo Layout

```
d:/handshake/
├── backend/                  # FastAPI + WebSockets + Python 3.11
│   ├── app/
│   │   ├── api/              # REST & WebSocket endpoints
│   │   ├── core/             # State machine, room manager, Gemini AI, timers
│   │   ├── db/               # Supabase persistence & memory fallback
│   │   ├── models/           # Pydantic schemas & event contracts
│   │   └── main.py           # FastAPI entrypoint
│   ├── tests/                # Automated pytest suite
│   ├── Dockerfile            # Railway production container spec
│   └── requirements.txt
├── frontend/                 # Next.js 15 + React 19 + TypeScript
│   ├── app/                  # App router (Home, Room, Replay, Leaderboard)
│   ├── components/           # Decision panel, HUD, reveals, Warden debrief, podium
│   ├── hooks/                # Resilient useWebSocket hook
│   ├── lib/                  # Procedural audio engine, types, utils
│   └── globals.css           # Cyberpunk dark glassmorphism design system
└── supabase/
    └── migrations/           # PostgreSQL schema, RLS policies, indexes
```

---

## ⚡ Quickstart (Local Development)

### 1. Run Backend (FastAPI)

```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
pip install -r requirements.txt

# Run server on port 8000
uvicorn app.main:app --reload --port 8000
```

*Backend runs at `http://localhost:8000` (Health check: `/health`, Docs: `/docs`).*

### 2. Run Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

*Frontend runs at `http://localhost:3000`.*

---

## 🧪 Automated Testing

To run the backend game logic, payoff matrix, and lifecycle tests:

```bash
cd backend
.\venv\Scripts\pytest.exe tests/
```

All 6 test suites validate pot scaling, 0-betrayal, 1-betrayal, and N-betrayal outcomes, tie-breakers, and room manager concurrency.

---

## 🚢 Production Deployment

### Backend (Railway)
1. Link the `/backend` folder to your Railway project.
2. Railway detects `Dockerfile` automatically and binds to `PORT=8000`.
3. Set environment variables:
   - `GEMINI_API_KEY`: (Optional) Your Google Gemini API key.
   - `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`: (Optional) Supabase credentials.

### Frontend (Vercel)
1. Deploy `/frontend` to Vercel.
2. Set Environment Variable:
   - `NEXT_PUBLIC_API_URL`: URL of your deployed Railway backend (e.g. `https://your-railway-app.up.railway.app`).
