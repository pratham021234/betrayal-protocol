"use client";

import React, { useEffect, useState } from "react";
import { RoomState } from "@/lib/types";
import { sound } from "@/lib/audio";
import SoundToggle from "./SoundToggle";
import { Zap, Shield, Users, Wifi } from "lucide-react";

interface GameHUDProps {
  roomState: RoomState;
  isConnected: boolean;
}

export default function GameHUD({ roomState, isConnected }: GameHUDProps) {
  const [timeLeft, setTimeLeft] = useState(roomState.round_duration_sec);
  const totalDuration = roomState.round_duration_sec || 15;

  useEffect(() => {
    if (roomState.status !== "DECISION" || !roomState.round_end_timestamp) {
      return;
    }

    const updateTimer = () => {
      const now = Date.now() / 1000;
      const remaining = Math.max(0, Math.ceil(roomState.round_end_timestamp - now));
      setTimeLeft(remaining);

      // Play dramatic heartbeat and tick below 5s
      if (remaining > 0 && remaining <= 5) {
        sound.playHeartbeat();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 500);
    return () => clearInterval(interval);
  }, [roomState.status, roomState.round_end_timestamp]);

  const lockedCount = roomState.players.filter(p => p.has_locked_in && p.is_connected).length;
  const connectedCount = roomState.players.filter(p => p.is_connected).length;

  // SVG Circular progress math
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = Math.min(1, Math.max(0, timeLeft / totalDuration));
  const strokeDashoffset = circumference - progressPercent * circumference;

  let timerColor = "var(--cyan-tron)";
  let timerGlow = "var(--cyan-glow)";
  if (timeLeft <= 5) {
    timerColor = "var(--crimson-squid)";
    timerGlow = "var(--crimson-glow)";
  } else if (timeLeft <= 8) {
    timerColor = "var(--amber-gold)";
    timerGlow = "var(--amber-glow)";
  }

  return (
    <header
      className="glass-panel"
      style={{
        padding: "16px 22px",
        marginBottom: "24px",
        borderTop: "2px solid var(--border-accent)",
        background: "rgba(10, 15, 26, 0.85)"
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
        
        {/* Left: Round Badge & Sync Status */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              background: "rgba(0, 240, 255, 0.06)",
              padding: "6px 14px",
              borderRadius: "10px",
              border: "1px solid rgba(0, 240, 255, 0.25)",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1.5px" }}>
              DIRECTIVE
            </span>
            <span className="font-display" style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--cyan-tron)" }}>
              ROUND {roomState.current_round} <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 500 }}>/ {roomState.max_rounds}</span>
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: isConnected ? "var(--emerald-safe)" : "var(--crimson-squid)",
                boxShadow: isConnected ? "0 0 10px var(--emerald-safe)" : "0 0 10px var(--crimson-squid)"
              }}
            />
            <span className="font-mono" style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              {isConnected ? "MAINFRAME SYNCED" : "DESYNCHRONIZED"}
            </span>
          </div>
        </div>

        {/* Center: Glowing Vault Pot Display */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Zap size={22} color="var(--amber-gold)" className="animate-pulse" />
            <span
              className="font-display"
              style={{
                fontSize: "1.9rem",
                fontWeight: 800,
                color: "var(--amber-gold)",
                textShadow: "0 0 24px var(--amber-glow)",
                letterSpacing: "1px"
              }}
            >
              {roomState.current_pot.toLocaleString()}
            </span>
            <span style={{ fontSize: "0.85rem", color: "var(--amber-gold)", fontWeight: 700, letterSpacing: "0.5px" }}>
              COINS
            </span>

            {roomState.current_multiplier > 1.0 && (
              <span
                style={{
                  background: "linear-gradient(135deg, #FF0055, #9D00FF)",
                  color: "#FFF",
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  padding: "3px 9px",
                  borderRadius: "999px",
                  letterSpacing: "1px",
                  boxShadow: "0 0 15px var(--crimson-glow)"
                }}
              >
                {roomState.current_multiplier}x SURGE
              </span>
            )}
          </div>
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", letterSpacing: "1px", textTransform: "uppercase" }}>
            Autonomous Vault Reserve
          </span>
        </div>

        {/* Right: Circular SVG Radial Timer & Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          
          {/* Circular Countdown Ring */}
          {roomState.status === "DECISION" && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ position: "relative", width: "56px", height: "56px" }}>
                <svg width="56" height="56" style={{ transform: "rotate(-90deg)" }}>
                  {/* Background Track */}
                  <circle
                    cx="28"
                    cy="28"
                    r={radius}
                    fill="transparent"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="4"
                  />
                  {/* Dynamic Progress Arc */}
                  <circle
                    cx="28"
                    cy="28"
                    r={radius}
                    fill="transparent"
                    stroke={timerColor}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{
                      transition: "stroke-dashoffset 0.4s ease, stroke 0.3s ease",
                      filter: `drop-shadow(0 0 6px ${timerGlow})`
                    }}
                  />
                </svg>

                {/* Digital Seconds Inside Ring */}
                <div
                  className="font-mono"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.95rem",
                    fontWeight: 800,
                    color: timerColor
                  }}
                >
                  {timeLeft}s
                </div>
              </div>
            </div>
          )}

          {/* Operatives Lock-in Dot Matrix */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
              <Users size={14} />
              <span className="font-mono">{lockedCount}/{connectedCount} Locked</span>
            </div>
            
            {/* Visual Dots */}
            <div style={{ display: "flex", gap: "4px" }}>
              {roomState.players.map((p, i) => (
                <div
                  key={p.id || i}
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: p.has_locked_in ? "var(--emerald-safe)" : "rgba(255,255,255,0.15)",
                    boxShadow: p.has_locked_in ? "0 0 8px var(--emerald-safe)" : "none",
                    transition: "all 0.2s"
                  }}
                />
              ))}
            </div>
          </div>

          <SoundToggle />
        </div>

      </div>
    </header>
  );
}
