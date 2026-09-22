"use client";

import React, { useEffect, useState } from "react";
import { sound } from "@/lib/audio";
import { Zap, AlertTriangle } from "lucide-react";

interface RoundTransitionOverlayProps {
  roundNumber: number;
  maxRounds: number;
  pot: number;
  multiplier: number;
  onComplete: () => void;
}

export default function RoundTransitionOverlay({
  roundNumber,
  maxRounds,
  pot,
  multiplier,
  onComplete
}: RoundTransitionOverlayProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    sound.playRoundSting();

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 400); // Allow fade-out animation
    }, 2200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: "rgba(3, 5, 8, 0.94)",
        backdropFilter: "blur(24px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease-out",
        pointerEvents: visible ? "auto" : "none"
      }}
      className="scanlines"
    >
      {/* Tron Center Energy Beam */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: "2px",
          background: "linear-gradient(180deg, transparent, var(--cyan-tron), transparent)",
          opacity: 0.6
        }}
      />

      {/* Squid Game Geometric Motifs Banner */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "20px", alignItems: "center" }}>
        <div className="shape-circle" style={{ width: "26px", height: "26px" }}>○</div>
        <div className="shape-triangle" style={{ borderBottomWidth: "22px" }} />
        <div className="shape-square" style={{ width: "24px", height: "24px" }}>□</div>
      </div>

      {/* Main Round Title */}
      <div style={{ textAlign: "center", zIndex: 10, padding: "0 20px" }}>
        <span
          className="font-mono"
          style={{
            fontSize: "0.85rem",
            color: "var(--cyan-tron)",
            letterSpacing: "3px",
            textTransform: "uppercase",
            display: "block",
            marginBottom: "8px"
          }}
        >
          // INITIATING DIRECTIVE //
        </span>

        <h1
          className="font-display"
          style={{
            fontSize: "clamp(2.5rem, 7vw, 4.5rem)",
            fontWeight: 800,
            letterSpacing: "3px",
            color: "#FFF",
            textShadow: "0 0 40px var(--cyan-glow)"
          }}
        >
          ROUND {roundNumber.toString().padStart(2, "0")}
          <span style={{ color: "var(--text-muted)", fontSize: "clamp(1.2rem, 3vw, 2rem)", marginLeft: "8px" }}>
            / {maxRounds}
          </span>
        </h1>

        {/* Pot & Surge Announcement */}
        <div
          style={{
            marginTop: "20px",
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 24px",
            borderRadius: "999px",
            background: "rgba(255, 184, 0, 0.12)",
            border: "1px solid rgba(255, 184, 0, 0.4)",
            boxShadow: "0 0 30px var(--amber-glow)"
          }}
        >
          <Zap size={20} color="var(--amber-gold)" />
          <span className="font-display" style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--amber-gold)" }}>
            POT VAULT: {pot.toLocaleString()} COINS
          </span>
        </div>

        {/* Hazard Surge Warning if multiplier > 1.0 */}
        {multiplier > 1.0 && (
          <div
            className="hazard-stripes"
            style={{
              marginTop: "16px",
              padding: "8px 20px",
              borderRadius: "8px",
              border: "1px solid var(--crimson-squid)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              color: "var(--crimson-squid)",
              fontWeight: 800,
              fontSize: "0.85rem",
              letterSpacing: "1.5px"
            }}
          >
            <AlertTriangle size={16} />
            <span>WARNING: {multiplier}x HIGH-STAKES ESCALATION</span>
          </div>
        )}
      </div>

    </div>
  );
}
