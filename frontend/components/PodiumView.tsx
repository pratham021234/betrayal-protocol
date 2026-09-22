"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { GameOverData } from "@/lib/types";
import { sound } from "@/lib/audio";
import { Trophy, Award, RotateCcw, Film, Home, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

interface PodiumViewProps {
  gameOverData: GameOverData;
  isHost: boolean;
  onRematch: () => void;
}

export default function PodiumView({
  gameOverData,
  isHost,
  onRematch
}: PodiumViewProps) {
  useEffect(() => {
    sound.playVictoryFanfare();

    // Multi-stage neon confetti burst
    const end = Date.now() + 2.5 * 1000;
    const colors = ["#00F0FF", "#FF0055", "#FFB800", "#A855F7", "#10B981"];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  const firstPlace = gameOverData.podium[0];
  const secondPlace = gameOverData.podium[1];
  const thirdPlace = gameOverData.podium[2];

  return (
    <div style={{ width: "100%", maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
      
      {/* Climax Header */}
      <div className="glass-panel" style={{ padding: "30px", textAlign: "center", borderTop: "3px solid var(--amber-gold)" }}>
        <div style={{
          display: "inline-flex",
          padding: "14px",
          borderRadius: "50%",
          background: "rgba(255, 184, 0, 0.12)",
          marginBottom: "14px",
          border: "2px solid var(--amber-gold)",
          boxShadow: "0 0 30px var(--amber-glow)"
        }}>
          <Trophy size={40} color="var(--amber-gold)" />
        </div>
        
        <h1 className="font-display" style={{ fontSize: "clamp(2rem, 5vw, 2.8rem)", fontWeight: 800, color: "#FFF", letterSpacing: "2px" }}>
          PROTOCOL TERMINATED
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem", marginTop: "6px" }}>
          10-round social dilemma completed. All vault siphons indexed.
        </p>
      </div>

      {/* 3D-Styled Illuminated Pedestals */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        gap: "18px",
        minHeight: "280px",
        padding: "0 10px",
        position: "relative"
      }}>
        
        {/* 2nd Place Pedestal */}
        {secondPlace && (
          <div style={{ flex: 1, maxWidth: "230px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "8px", textAlign: "center" }}>
              {secondPlace.nickname}
            </div>
            <div style={{ fontSize: "0.95rem", color: "var(--cyan-tron)", fontWeight: 700, marginBottom: "10px", fontFamily: "monospace" }}>
              {secondPlace.score.toLocaleString()} 🪙
            </div>
            <div
              className="glass-panel"
              style={{
                width: "100%",
                height: "150px",
                borderTop: "4px solid #C0C0C0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(180deg, rgba(192, 192, 192, 0.18) 0%, rgba(10, 15, 26, 0.95) 100%)",
                boxShadow: "0 0 30px rgba(192, 192, 192, 0.2)"
              }}
            >
              <span className="font-display" style={{ fontSize: "2.2rem", fontWeight: 800, color: "#C0C0C0" }}>
                2ND
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", textAlign: "center", padding: "0 8px" }}>
                {secondPlace.title}
              </span>
            </div>
          </div>
        )}

        {/* 1st Place (The Champion) */}
        {firstPlace && (
          <div style={{ flex: 1.25, maxWidth: "270px", display: "flex", flexDirection: "column", alignItems: "center", zIndex: 10 }}>
            <div style={{
              background: "linear-gradient(135deg, #FFB800, #FF0055)",
              color: "#000",
              fontWeight: 800,
              fontSize: "0.8rem",
              padding: "4px 14px",
              borderRadius: "999px",
              marginBottom: "10px",
              letterSpacing: "1.5px"
            }}>
              OVERALL CHAMPION
            </div>
            <div style={{ fontSize: "1.45rem", fontWeight: 800, marginBottom: "6px", textAlign: "center", color: "var(--amber-gold)", textShadow: "0 0 20px var(--amber-glow)" }}>
              {firstPlace.nickname}
            </div>
            <div style={{ fontSize: "1.15rem", color: "var(--amber-gold)", fontWeight: 800, marginBottom: "12px", fontFamily: "monospace" }}>
              {firstPlace.score.toLocaleString()} 🪙
            </div>
            <div
              className="glass-panel"
              style={{
                width: "100%",
                height: "205px",
                borderTop: "5px solid var(--amber-gold)",
                boxShadow: "0 0 45px var(--amber-glow), inset 0 0 20px rgba(255, 184, 0, 0.15)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(180deg, rgba(255, 184, 0, 0.25) 0%, rgba(12, 17, 28, 0.98) 100%)"
              }}
            >
              <Trophy size={36} color="var(--amber-gold)" style={{ marginBottom: "6px" }} />
              <span className="font-display" style={{ fontSize: "2.8rem", fontWeight: 800, color: "var(--amber-gold)" }}>
                1ST
              </span>
              <span style={{ fontSize: "0.85rem", color: "var(--amber-gold)", fontWeight: 700, marginTop: "4px", textAlign: "center", padding: "0 8px" }}>
                {firstPlace.title}
              </span>
            </div>
          </div>
        )}

        {/* 3rd Place Pedestal */}
        {thirdPlace && (
          <div style={{ flex: 1, maxWidth: "230px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "8px", textAlign: "center" }}>
              {thirdPlace.nickname}
            </div>
            <div style={{ fontSize: "0.95rem", color: "var(--crimson-squid)", fontWeight: 700, marginBottom: "10px", fontFamily: "monospace" }}>
              {thirdPlace.score.toLocaleString()} 🪙
            </div>
            <div
              className="glass-panel"
              style={{
                width: "100%",
                height: "125px",
                borderTop: "4px solid #CD7F32",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(180deg, rgba(205, 127, 50, 0.18) 0%, rgba(10, 15, 26, 0.95) 100%)",
                boxShadow: "0 0 25px rgba(205, 127, 50, 0.2)"
              }}
            >
              <span className="font-display" style={{ fontSize: "2.2rem", fontWeight: 800, color: "#CD7F32" }}>
                3RD
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", textAlign: "center", padding: "0 8px" }}>
                {thirdPlace.title}
              </span>
            </div>
          </div>
        )}

      </div>

      {/* Standings & Accolade Breakdown */}
      <div className="glass-panel" style={{ padding: "26px" }}>
        <h3 className="font-display" style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "18px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Award size={20} color="var(--cyan-tron)" />
          <span>OFFICIAL PROTOCOL ACCREDITATION</span>
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {gameOverData.podium.map(p => (
            <div
              key={p.player_id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <span className="font-mono" style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--cyan-tron)", width: "32px" }}>
                  #{p.rank}
                </span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "1rem" }}>{p.nickname}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--cyan-tron)" }}>{p.title}</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textAlign: "right" }}>
                  <span>{p.solo_betrayals} Solo Heists</span>
                  <span style={{ margin: "0 8px" }}>•</span>
                  <span>{p.cooperations} Shields</span>
                </div>

                <div className="font-mono" style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--amber-gold)" }}>
                  {p.score.toLocaleString()} 🪙
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "14px" }}>
        {gameOverData.replay_id && (
          <Link
            href={`/replay/${gameOverData.replay_id}`}
            className="cyber-btn cyber-btn-cyan"
            style={{ padding: "16px 28px" }}
          >
            <Film size={20} />
            <span>INTERACTIVE ROUND REPLAY</span>
          </Link>
        )}

        {isHost && (
          <button
            onClick={() => {
              sound.playClick();
              onRematch();
            }}
            className="cyber-btn cyber-btn-crimson"
            style={{ padding: "16px 28px" }}
          >
            <RotateCcw size={20} />
            <span>REMATCH WITH SAME ROOM</span>
          </button>
        )}

        <Link
          href="/"
          className="cyber-btn cyber-btn-outline"
          style={{ padding: "16px 28px" }}
        >
          <Home size={20} />
          <span>RETURN TO HOME</span>
        </Link>
      </div>

    </div>
  );
}
