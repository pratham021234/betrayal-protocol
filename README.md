# ⚡ Betrayal Protocol

> **Competition-Quality Real-Time Multiplayer Social Dilemma Game**  
> Built for the Handshake *"Create a Multiplayer Game"* challenge.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15+-000000.svg?logo=next.js&logoColor=white)](https://nextjs.org)
[![WebSockets](https://img.shields.io/badge/WebSockets-Real--Time-00F0FF.svg)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
[![Gemini](https://img.shields.io/badge/Gemini_API-Commentary_AI-9D00FF.svg?logo=google&logoColor=white)](https://ai.google.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg?logo=supabase&logoColor=white)](https://supabase.com)
[![Render](https://img.shields.io/badge/Render-Backend-46E3B7.svg?logo=render&logoColor=white)](https://render.com)
[![Vercel](https://img.shields.io/badge/Vercel-Frontend-000000.svg?logo=vercel&logoColor=white)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🎮 Game Concept & Rules

**Betrayal Protocol** is a fast-paced, 10-round psychological battle of trust, bluffing, and sudden treachery. Players join from any phone or laptop via a 4-letter room code or QR scan—**no registration or login required**.

### The Payoff Matrix:
- **🛡️ All Cooperate (Shield)**: Everyone shares the round pot equally. Stable, communal growth.
- **🗡️ Lone Betrayal (Breach)**: If exactly one operative betrays, they execute a solo heist and **steal 100% of the pot**. Cooperators receive 0!
- **💀 Mutual Collapse (Greed Collision)**: If 2 or more operatives betray in the same round, their breach signatures collide: **the pot is incinerated, and everyone gets 0**.

| Scenario | Operative Choices | Outcome / Payout |
| :--- | :--- | :--- |
| **Universal Trust** | 100% Cooperate | Round Pot divided equally among all players |
| **Solo Heist** | Exactly 1 Betrayer, others Cooperate | Betrayer takes **100% of Pot**; Cooperators get **0** |
| **Greed Collision** | 2 or more Betrayers | **Pot destroyed (0 coins)**; All players get **0** |

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
handshake/
├── backend/                  # FastAPI + WebSockets + Python 3.11
│   ├── app/
│   │   ├── api/              # REST & WebSocket endpoints
│   │   ├── core/             # State machine, room manager, Gemini AI, timers
│   │   ├── db/               # Supabase persistence & memory fallback
│   │   ├── models/           # Pydantic schemas & event contracts
│   │   └── main.py           # FastAPI entrypoint & lifespan management
│   ├── tests/                # Automated pytest suite
│   ├── Dockerfile            # Production container specification (Render / Docker)
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Environment variable template
├── frontend/                 # Next.js 15 (App Router) + React 19 + TypeScript
│   ├── app/                  # App router (Home, Room, Replay, Leaderboard)
│   ├── components/           # Decision panel, HUD, reveals, Warden debrief, podium
│   ├── hooks/                # Resilient useWebSocket connection hook
│   ├── lib/                  # Procedural audio engine, types, utility helpers
│   ├── globals.css           # Cyberpunk dark glassmorphism design system
│   ├── package.json          # Node dependencies & scripts
│   └── vercel.json           # Vercel deployment configuration
└── supabase/
    └── migrations/           # PostgreSQL schema, RLS policies, indexes
```

---

## ⚡ Quickstart (Local Development)

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** and **npm**

### 1. Run Backend (FastAPI)

```bash
cd backend
python -m venv venv

# Activate Virtual Environment:
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On macOS / Linux:
source venv/bin/activate

pip install -r requirements.txt

# Run development server on port 8000
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

*Backend runs at `http://localhost:8000` (Health check: `/health`, Interactive API docs: `/docs`).*

### 2. Run Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

*Frontend runs at `http://localhost:3000`.*

---

## 🧪 Automated Testing

To run the backend test suite verifying the payoff matrix, room management, countdown timers, and event contracts:

```bash
cd backend
pytest tests/ -v
```

All 6 test suites validate:
- Pot progression & multiplier rounds
- 0-betrayal shared pot calculation
- 1-betrayal solo heist award
- N-betrayal collision pot destruction
- Room lifecycle, reconnect resilience, and tie-breaker sorting

---

## 🚢 Production Deployment

The production deployment uses a decoupled cloud architecture:
- **Backend**: Hosted on **Render** as a high-concurrency Web Service (supporting persistent HTTP/1.1 and WSS WebSocket connections).
- **Frontend**: Hosted on **Vercel** with Next.js 15 Edge and static asset optimization.

```
┌─────────────────────────┐               ┌───────────────────────────────┐
│     Vercel Frontend     │  HTTPS / REST │        Render Backend         │
│  (Next.js 15 + React 19)│──────────────>│   (FastAPI + WebSockets)      │
│                         │   WSS Stream  │                               │
│  *.vercel.app           │<═════════════>│   *.onrender.com              │
└─────────────────────────┘               └──────────────┬────────────────┘
                                                         │
                                        ┌────────────────┴────────────────┐
                                        │        External Services        │
                                        │  • Google Gemini (Warden AI)    │
                                        │  • Supabase (PostgreSQL / RLS)  │
                                        └─────────────────────────────────┘
```

---

### Part 1: Deploy Backend on Render

Render provides native Python and Docker runtime environments with seamless support for HTTP and persistent WebSockets.

#### Option A: Native Python Web Service (Recommended)

1. Log into your [Render Dashboard](https://dashboard.render.com/) and click **New + > Web Service**.
2. Connect your Git repository (`handshake`).
3. Configure service parameters:
   - **Name**: `betrayal-protocol-api` (or your preferred slug)
   - **Region**: Select the region closest to your target audience (e.g., `Oregon (US West)` or `Frankfurt (EU Central)`)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**:
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command**:
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Instance Type**: `Free` or `Starter`

#### Option B: Docker Web Service

Render automatically detects the `backend/Dockerfile`:
1. Select **Docker** as the runtime.
2. Set **Root Directory** to `backend`.
3. Render will build the container using `backend/Dockerfile` and route incoming traffic to `${PORT:-8000}`.

#### Backend Environment Variables (Render)

Under the **Environment** tab of your Render Web Service, add the following variables:

| Variable | Required | Default / Recommended | Description |
| :--- | :---: | :--- | :--- |
| `ENVIRONMENT` | **Yes** | `production` | Sets runtime mode |
| `HOST` | **Yes** | `0.0.0.0` | Network binding interface |
| `PORT` | Auto | Render manages `$PORT` | Internal port assigned dynamically by Render |
| `GEMINI_API_KEY` | Optional | `AIzaSy...` | Google Gemini API key for dynamic Protocol Warden commentary |
| `GEMINI_MODEL` | Optional | `gemini-1.5-flash` | Gemini model variant |
| `SUPABASE_URL` | Optional | `https://xyz.supabase.co` | Supabase project URL for persistent replay & leaderboard |
| `SUPABASE_SERVICE_ROLE_KEY`| Optional | `eyJh...` | Supabase service role secret |

> [!NOTE]
> `GEMINI_API_KEY`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` are optional. If omitted, the game automatically runs with **rich procedural AI commentary fallbacks** and **high-performance in-memory state persistence**.

#### Health-Check Verification

Render monitors application liveness via HTTP polling. Configure:
- **Health Check Path**: `/health` (or `/api/health`)

Once the deployment transitions to **Live**, verify your backend from your terminal or browser:

```bash
curl -i https://betrayal-protocol-api.onrender.com/health
```

**Expected JSON Response (`200 OK`):**
```json
{
  "status": "healthy",
  "service": "Betrayal Protocol Backend",
  "environment": "production"
}
```

Interactive OpenAPI documentation is also accessible at:
```
https://<your-render-service>.onrender.com/docs
```

---

### Part 2: Deploy Frontend on Vercel

1. Log into [Vercel](https://vercel.com/) and click **Add New > Project**.
2. Import the `handshake` repository.
3. Configure the build and project settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click *Edit* and select `frontend`
   - **Build Command**: `npm run build` (Default)
   - **Output Directory**: `.next` (Default)
   - **Install Command**: `npm install` (Default)
4. Add the **Environment Variable**:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://betrayal-protocol-api.onrender.com` | Base URL of your deployed Render backend (**NO** trailing slash) |

> [!IMPORTANT]
> The `NEXT_PUBLIC_API_URL` must start with `https://`. The frontend WebSocket utility automatically converts `https://` to `wss://` for secure, encrypted real-time communication.

5. Click **Deploy**. Vercel will build and publish your frontend to a production URL (e.g., `https://betrayal-protocol.vercel.app`).

---

## ⚙️ Environment Variables Reference

### Backend (`backend/.env`)

```env
# System Configuration
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=production

# Protocol Warden AI Commentary (Optional)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Persistent Replays & Global Hall of Fame (Optional)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### Frontend (`frontend/.env.local`)

```env
# Render backend endpoint in production; localhost in development
NEXT_PUBLIC_API_URL=https://betrayal-protocol-api.onrender.com
```

---

## ✅ Deployment Verification Checklist

Use this checklist to ensure your production deployment is fully operational:

- [ ] **Render Service Status**: Render Web Service reports status **Live** with zero crash loops.
- [ ] **Health Check Verification**: Visiting `https://<render-service>.onrender.com/health` returns `{"status": "healthy", ...}` with HTTP `200`.
- [ ] **API Documentation Accessible**: OpenAPI Swagger UI loads at `https://<render-service>.onrender.com/docs`.
- [ ] **Vercel Build Success**: Next.js 15 build succeeds on Vercel without TypeScript or ESLint errors.
- [ ] **Environment Variable Bound**: `NEXT_PUBLIC_API_URL` is set in Vercel (Production, Preview, and Development).
- [ ] **Room Creation**: Home page loads on Vercel, and clicking "Host Operation" instantly provisions a 4-letter room code (e.g. `CYBR`).
- [ ] **WebSocket Protocol Upgrade**: Browser Network tab verifies HTTP `101 Switching Protocols` to `wss://<render-service>.onrender.com/ws/<ROOM>?token=...`.
- [ ] **Cross-Device Handshake**: Joining from a mobile phone via room code or QR scan successfully adds the second operative into the lobby.
- [ ] **Round Execution & Timer Sync**: Synchronized countdown clocks tick down identically on host and client screens.
- [ ] **Resolution & Commentary**: Post-round reveal animates coin deltas, triggers Web Audio sound effects, and displays the Protocol Warden debrief.

---

## 🔧 Troubleshooting

### 1. CORS Issues (Cross-Origin Resource Sharing)

- **Symptom**: Browser console displays:
  `Access to fetch at 'https://...onrender.com/api/rooms' from origin 'https://...vercel.app' has been blocked by CORS policy`.
- **Cause**: Backend CORS middleware rejected the origin or frontend is pointing to an incorrect protocol/hostname.
- **Solution**:
  1. The backend (`backend/app/main.py`) includes permissive CORS by default:
     ```python
     app.add_middleware(
         CORSMiddleware,
         allow_origins=["*"],
         allow_credentials=True,
         allow_methods=["*"],
         allow_headers=["*"],
     )
     ```
  2. Verify that your frontend is querying `https://` and not unencrypted `http://`, which modern browsers block as mixed content.
  3. Ensure `NEXT_PUBLIC_API_URL` has no trailing slash (e.g., `https://my-app.onrender.com`, not `https://my-app.onrender.com/`).

### 2. WebSocket Connection Failures

- **Symptom**: Game HUD shows *"Connecting..."* or console logs `WebSocket connection to 'wss://.../ws/...' failed: WebSocket is closed before the connection is established (code 1006)`.
- **Cause**: Free-tier server spin-down, protocol mismatch, or reverse proxy buffering.
- **Solution**:
  1. **Render Free Tier Cold Start**: Free Render instances spin down after 15 minutes of inactivity. The initial spin-up can take 30–50 seconds. Ping `https://<render-service>.onrender.com/health` in your browser first to wake the container.
  2. **Check Protocol Conversion**: In `frontend/lib/utils.ts`, WebSocket URLs derive dynamically:
     ```typescript
     const wsProtocol = apiBase.startsWith("https") ? "wss:" : "ws:";
     ```
     Ensure `NEXT_PUBLIC_API_URL` starts with `https://` in production so secure WebSockets (`wss://`) are used.
  3. **No Trailing Slash**: If `NEXT_PUBLIC_API_URL` is set to `https://my-api.onrender.com/`, the double slash `//ws/` can cause gateway rejection.

### 3. Missing Environment Variables

- **Symptom**: Frontend attempts to connect to `http://localhost:8000` even when loaded on `https://*.vercel.app`.
- **Cause**: `NEXT_PUBLIC_API_URL` was not defined prior to the Vercel build, or was modified without triggering a redeploy.
- **Solution**:
  1. In Next.js, variables prefixed with `NEXT_PUBLIC_` are baked into client-side JavaScript bundles at **build time**.
  2. Go to **Vercel Project Settings > Environment Variables** and ensure `NEXT_PUBLIC_API_URL` is added for **Production** and **Preview** environments.
  3. Go to **Deployments**, click the three dots on your latest deployment, and select **Redeploy** (do not use cached build) to bake in the new variable.

### 4. Build Failures

- **Frontend (Vercel)**:
  - *Error*: `Module not found` or `TypeScript error`.
  - *Solution*: Verify `frontend` is set as the Root Directory in Vercel settings. Ensure `npm run build` runs cleanly locally before pushing to `main`.
- **Backend (Render)**:
  - *Error*: `pip: command not found` or `ModuleNotFoundError: No module named 'app'`.
  - *Solution*: 
    - Verify **Root Directory** is set to `backend` in the Render dashboard.
    - Check that the Start Command is `uvicorn app.main:app --host 0.0.0.0 --port $PORT` (this executes inside the `backend` directory where `app/` is a direct module).

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).
