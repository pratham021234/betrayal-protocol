"use client";

import React, { useEffect } from "react";
import { RoundRevealData } from "@/lib/types";
import { sound } from "@/lib/audio";
import { Shield, Sword, AlertTriangle, CheckCircle, Flame } from "lucide-react";

interface RevealSequenceProps {
  revealData: RoundRevealData;
}

export default function RevealSequence({ revealData }: RevealSequenceProps) {
  useEffect(() => {
    if (revealData.outcome_type === "ALL_COOPERATE") {
      sound.playCoinShower();
    } else if (revealData.outcome_type === "SOLO_BETRAYAL") {
      sound.playLockIn();
      setTimeout(() => sound.playCoinShower(), 250);
    } else if (revealData.outcome_type === "MUTUAL_BETRAYAL") {
      sound.playAlarm();
    }
  }, [revealData.outcome_type]);

  const getOutcomeDetails = () => {
    switch (revealData.outcome_type) {
      case "ALL_COOPERATE":
        return {
          stamp: "[ VAULT SECURED // FULL HARMONY ]",
          subtitle: "All operatives pledged shield energy. The vault is shared equally.",
          color: "var(--cyan-tron)",
          border: "rgba(0, 240, 255, 0.4)",
          bg: "rgba(0, 240, 255, 0.08)",
          icon: <CheckCircle size={36} color="var(--cyan-tron)" />
        };
      case "SOLO_BETRAYAL":
        return {
          stamp: "[ SOLO HEIST EXECUTED ]",
          subtitle: "A lone rogue breached the perimeter and siphoned the entire vault! Cooperators receive zero.",
          color: "var(--amber-gold)",
          border: "rgba(255, 184, 0, 0.5)",
          bg: "rgba(255, 184, 0, 0.1)",
          icon: <Sword size={36} color="var(--amber-gold)" />
        };
      case "MUTUAL_BETRAYAL":
      default:
        return {
          stamp: "[ PROTOCOL COLLAPSE // INCINERATED ]",
          subtitle: "Multiple breach signatures collided! Vault emergency lockout incinerated all coins to zero.",
          color: "var(--crimson-squid)",
          border: "rgba(255, 0, 85, 0.5)",
          bg: "rgba(255, 0, 85, 0.12)",
          icon: <Flame size={36} color="var(--crimson-squid)" />
        };
    }
  };

  const outcome = getOutcomeDetails();

  return (
    <div style={{ width: "100%", maxWidth: "860px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Stamped Outcome Banner */}
      <div
        className="glass-panel"
        style={{
          padding: "26px 24px",
          textAlign: "center",
          border: `2px solid ${outcome.border}`,
          background: outcome.bg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          boxShadow: `0 0 40px -10px ${outcome.border}`
        }}
      >
        <div style={{ marginBottom: "2px" }}>{outcome.icon}</div>
        
        {/* Squid Game-style Slam Stamp Badge */}
        <div className="stamp-badge" style={{ color: outcome.color, fontSize: "clamp(1.1rem, 3.5vw, 1.6rem)" }}>
          {outcome.stamp}
        </div>

        <p style={{ color: "var(--text-primary)", fontSize: "0.95rem", maxWidth: "620px", marginTop: "4px" }}>
          {outcome.subtitle}
        </p>
      </div>

      {/* Operatives Reveal Cards Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
        gap: "16px"
      }}>
        {revealData.choices.map((player, idx) => {
          const isBetray = player.choice === "BETRAY";
          const cardColor = isBetray ? "var(--crimson-squid)" : "var(--cyan-tron)";
          const cardGlow = isBetray ? "var(--crimson-glow)" : "var(--cyan-glow)";

          return (
            <div
              key={player.player_id}
              className="glass-panel"
              style={{
                padding: "22px 18px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                border: `1.5px solid ${cardColor}`,
                boxShadow: `0 8px 25px -4px ${cardGlow}`,
                animation: `floatEmote 0.5s ${idx * 0.1}s cubic-bezier(0.16, 1, 0.3, 1) both`
              }}
            >
              {/* Geometric Shape Tag */}
              <div style={{ position: "absolute", top: "14px", right: "16px" }}>
                {isBetray ? <span className="shape-triangle" /> : <span className="shape-circle">○</span>}
              </div>

              {/* Call-sign */}
              <div style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "14px", color: "var(--text-primary)" }}>
                {player.nickname}
              </div>

              {/* Directive Pill */}
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 18px",
                borderRadius: "999px",
                background: isBetray ? "rgba(255, 0, 85, 0.2)" : "rgba(0, 240, 255, 0.2)",
                border: `1px solid ${cardColor}`,
                color: cardColor,
                fontWeight: 800,
                fontSize: "0.85rem",
                letterSpacing: "1.5px",
                marginBottom: "16px"
              }}>
                {isBetray ? <Sword size={16} /> : <Shield size={16} />}
                <span>{isBetray ? "BREACH DIRECTIVE" : "SHIELD DIRECTIVE"}</span>
              </div>

              {/* Coin Delta */}
              <div
                className="font-display"
                style={{
                  fontSize: "1.45rem",
                  fontWeight: 800,
                  color: player.delta > 0 ? "var(--amber-gold)" : "var(--text-muted)",
                  marginBottom: "6px",
                  textShadow: player.delta > 0 ? "0 0 15px var(--amber-glow)" : "none"
                }}
              >
                {player.delta > 0 ? `+${player.delta.toLocaleString()} Coins` : "+0 Coins"}
              </div>

              {/* Cumulative Score */}
              <div className="font-mono" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Accumulated: {player.new_score.toLocaleString()} 🪙
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
