"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { RoomState, RoundRevealData, GameOverData, TauntData } from "@/lib/types";
import { useWebSocket } from "@/hooks/useWebSocket";
import { sound } from "@/lib/audio";
import { generateRandomNickname, AVATARS, getApiBaseUrl } from "@/lib/utils";
import GameHUD from "@/components/GameHUD";
import DecisionPanel from "@/components/DecisionPanel";
import RevealSequence from "@/components/RevealSequence";
import AIWardenDebrief from "@/components/AIWardenDebrief";
import LobbyView from "@/components/LobbyView";
import PodiumView from "@/components/PodiumView";
import RoundTransitionOverlay from "@/components/RoundTransitionOverlay";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function RoomPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const roomCode = resolvedParams.code.toUpperCase();
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinNickname, setJoinNickname] = useState("");
  const [joinAvatar, setJoinAvatar] = useState("cyber_1");
  const [joinError, setJoinError] = useState("");

  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [myChoice, setMyChoice] = useState<string | null>(null);
  const [hasLockedIn, setHasLockedIn] = useState(false);
  const [revealData, setRevealData] = useState<RoundRevealData | null>(null);
  const [gameOverData, setGameOverData] = useState<GameOverData | null>(null);
  const [activeTaunts, setActiveTaunts] = useState<TauntData[]>([]);
  const [transitionData, setTransitionData] = useState<{
    roundNumber: number;
    maxRounds: number;
    pot: number;
    multiplier: number;
  } | null>(null);

  // Load existing credentials on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(`token_${roomCode}`);
    const savedPlayerId = localStorage.getItem(`player_${roomCode}`);
    if (savedToken && savedPlayerId) {
      setToken(savedToken);
      setPlayerId(savedPlayerId);
    } else {
      setIsJoining(true);
      setJoinNickname(localStorage.getItem("last_nickname") || generateRandomNickname());
    }
  }, [roomCode]);

  // Handle incoming WebSocket messages
  const handleMessage = useCallback((event: { type: string; data?: any }) => {
    const { type, data } = event;

    if (type === "ROOM_STATE_UPDATE") {
      setRoomState(data);
      if (data.status === "LOBBY") {
        setRevealData(null);
        setGameOverData(null);
        setMyChoice(null);
        setHasLockedIn(false);
        setTransitionData(null);
      }
    } else if (type === "ROUND_START") {
      setRevealData(null);
      setMyChoice(null);
      setHasLockedIn(false);
      setTransitionData({
        roundNumber: data.round_number,
        maxRounds: data.max_rounds || 10,
        pot: data.pot,
        multiplier: data.multiplier || 1.0
      });
      sound.playLockIn();
    } else if (type === "PLAYER_LOCKED_IN") {
      sound.playTick();
    } else if (type === "ROUND_REVEAL") {
      setRevealData(data);
      setTransitionData(null);
    } else if (type === "GAME_OVER") {
      setGameOverData(data);
      setTransitionData(null);
    } else if (type === "TAUNT_BROADCAST") {
      sound.playClick();
      setActiveTaunts(prev => [...prev.slice(-3), data]);
      setTimeout(() => {
        setActiveTaunts(prev => prev.filter(t => t !== data));
      }, 3800);
    }
  }, []);

  const { isConnected, send } = useWebSocket({
    roomCode,
    token: token || "",
    onMessage: handleMessage,
    autoConnect: !!token
  });

  const handleQuickJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinNickname.trim()) return;
    setJoinError("");

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/rooms/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_code: roomCode,
          nickname: joinNickname.trim(),
          avatar_id: joinAvatar
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to join room.");
      }

      localStorage.setItem(`token_${data.room_code}`, data.session_token);
      localStorage.setItem(`player_${data.room_code}`, data.player_id);
      localStorage.setItem("last_nickname", joinNickname);

      setToken(data.session_token);
      setPlayerId(data.player_id);
      setIsJoining(false);
    } catch (err: any) {
      setJoinError(err.message || "Failed to join room.");
    }
  };

  const handleToggleReady = (ready: boolean) => {
    send("PLAYER_READY", { ready });
  };

  const handleStartGame = () => {
    send("START_GAME");
  };

  const handleSelectChoice = (choice: "COOPERATE" | "BETRAY") => {
    setMyChoice(choice);
    setHasLockedIn(true);
    send("SUBMIT_CHOICE", { choice });
  };

  const handleSendTaunt = (taunt_id: string, message: string, icon: string) => {
    send("SEND_TAUNT", { taunt_id, message, icon });
  };

  const handleRematch = () => {
    send("REMATCH");
  };

  if (isJoining) {
    return (
      <main className="container-max" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div className="glass-panel" style={{ width: "100%", maxWidth: "440px", padding: "30px", borderTop: "3px solid var(--cyan-tron)" }}>
          <h2 className="font-display" style={{ fontSize: "1.55rem", fontWeight: 800, color: "var(--cyan-tron)", textAlign: "center", marginBottom: "6px" }}>
            SYNCHRONIZE TO ROOM {roomCode}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", textAlign: "center", marginBottom: "22px" }}>
            Identify your operative call-sign to join this live match.
          </p>

          {joinError && (
            <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,0,85,0.15)", color: "#FF6688", fontSize: "0.85rem", marginBottom: "18px" }}>
              {joinError}
            </div>
          )}

          <form onSubmit={handleQuickJoin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px" }}>
                Operative Call-sign
              </label>
              <input
                type="text"
                maxLength={20}
                value={joinNickname}
                onChange={e => setJoinNickname(e.target.value)}
                placeholder="Operative name"
                style={{
                  width: "100%",
                  padding: "14px",
                  fontSize: "1rem",
                  background: "rgba(0,0,0,0.5)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  color: "var(--text-primary)",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "10px" }}>
                Cyber Crest
              </label>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                {AVATARS.map(av => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setJoinAvatar(av.id)}
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      background: joinAvatar === av.id ? "rgba(0, 240, 255, 0.2)" : "rgba(255,255,255,0.04)",
                      border: `2px solid ${joinAvatar === av.id ? av.color : "rgba(255,255,255,0.08)"}`,
                      fontSize: "1.2rem",
                      cursor: "pointer"
                    }}
                  >
                    {av.icon}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="cyber-btn cyber-btn-cyan" style={{ width: "100%", marginTop: "10px" }}>
              CONNECT TO ROOM
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (!roomState) {
    return (
      <main className="container-max" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "50%", border: "3px solid var(--cyan-tron)", borderTopColor: "transparent", margin: "0 auto 16px auto" }} className="animate-spin" />
          <div className="font-display" style={{ fontSize: "1.2rem", color: "var(--cyan-tron)", letterSpacing: "1.5px" }}>
            SYNCHRONIZING WITH PROTOCOL {roomCode}...
          </div>
        </div>
      </main>
    );
  }

  const isHost = roomState.host_id === playerId;

  return (
    <main className="container-max" style={{ minHeight: "100vh", padding: "20px 16px 40px 16px", position: "relative" }}>
      
      {/* Cinematic Round Transition Curtain */}
      {transitionData && (
        <RoundTransitionOverlay
          roundNumber={transitionData.roundNumber}
          maxRounds={transitionData.maxRounds}
          pot={transitionData.pot}
          multiplier={transitionData.multiplier}
          onComplete={() => setTransitionData(null)}
        />
      )}

      {/* Floating Tactical Taunt Bubbles */}
      <div style={{
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        zIndex: 100,
        pointerEvents: "none",
        width: "90%",
        maxWidth: "440px"
      }}>
        {activeTaunts.map((taunt, idx) => (
          <div
            key={idx}
            className="animate-taunt-float glass-panel"
            style={{
              padding: "12px 18px",
              background: "rgba(10, 15, 26, 0.95)",
              border: "1.5px solid var(--cyan-tron)",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.8), 0 0 20px var(--cyan-glow)"
            }}
          >
            <span style={{ fontSize: "1.3rem" }}>{taunt.icon}</span>
            <div style={{ fontSize: "0.9rem" }}>
              <span style={{ fontWeight: 800, color: "var(--cyan-tron)", marginRight: "8px" }}>
                {taunt.nickname}:
              </span>
              <span style={{ color: "var(--text-primary)" }}>
                {taunt.message}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* PHASE 1: LOBBY */}
      {roomState.status === "LOBBY" && (
        <LobbyView
          roomState={roomState}
          currentPlayerId={playerId || ""}
          isHost={isHost}
          onToggleReady={handleToggleReady}
          onStartGame={handleStartGame}
        />
      )}

      {/* PHASE 2: DECISION */}
      {roomState.status === "DECISION" && (
        <div>
          <GameHUD roomState={roomState} isConnected={isConnected} />
          <DecisionPanel
            currentChoice={myChoice}
            hasLockedIn={hasLockedIn}
            onSelectChoice={handleSelectChoice}
            onSendTaunt={handleSendTaunt}
            potAmount={roomState.current_pot}
            totalPlayers={roomState.players.length}
          />
        </div>
      )}

      {/* PHASE 3: REVEAL & AI DEBRIEF */}
      {roomState.status === "REVEAL" && revealData && (
        <div>
          <GameHUD roomState={roomState} isConnected={isConnected} />
          <RevealSequence revealData={revealData} />
          <AIWardenDebrief
            commentary={revealData.warden_commentary}
            outcomeType={revealData.outcome_type}
          />
        </div>
      )}

      {/* PHASE 4: GAME OVER & PODIUM */}
      {roomState.status === "GAME_OVER" && gameOverData && (
        <PodiumView
          gameOverData={gameOverData}
          isHost={isHost}
          onRematch={handleRematch}
        />
      )}

    </main>
  );
}
