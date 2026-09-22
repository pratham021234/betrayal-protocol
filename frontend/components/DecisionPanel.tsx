"use client";

import React, { useState } from "react";
import { sound } from "@/lib/audio";
import { Shield, Sword, Lock, CheckCircle2, MessageSquare, Zap } from "lucide-react";

interface DecisionPanelProps {
  currentChoice: string | null;
  hasLockedIn: boolean;
  onSelectChoice: (choice: "COOPERATE" | "BETRAY") => void;
  onSendTaunt: (tauntId: string, message: string, icon: string) => void;
  potAmount: number;
  totalPlayers: number;
}

const TAUNTS = [
  { id: "trust", label: "Trust Me", icon: "🤝", message: "Trust the protocol. Shields up!" },
  { id: "greed", label: "I Smell Greed", icon: "🐍", message: "Someone is getting greedy..." },
  { id: "shield", label: "Shields Up", icon: "🛡️", message: "Pledging cooperation. Don't ruin this." },
  { id: "warning", label: "Don't Do It", icon: "⚠️", message: "If 2 breach, we all get zero!" },
  { id: "reaper", label: "Mutual Ruin", icon: "💀", message: "Try me. I will take us both down." }
];

export default function DecisionPanel({
  currentChoice,
  hasLockedIn,
  onSelectChoice,
  onSendTaunt,
  potAmount,
  totalPlayers
}: DecisionPanelProps) {
  const [selected, setSelected] = useState<"COOPERATE" | "BETRAY" | null>(
    (currentChoice as "COOPERATE" | "BETRAY") || null
  );

  const handleSelect = (choice: "COOPERATE" | "BETRAY") => {
    setSelected(choice);
    if (choice === "COOPERATE") {
      sound.playShieldSelect();
    } else {
      sound.playBreachSelect();
    }
  };

  const handleConfirm = () => {
    if (!selected) return;
    sound.playLockIn();
    onSelectChoice(selected);
  };

  const estimatedShare = Math.floor(potAmount / Math.max(1, totalPlayers));

  return (
    <div style={{ width: "100%", maxWidth: "840px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Title & Surveillance Notice */}
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "0.75rem", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "6px" }}>
          <span>// CLASSIFIED DIRECTIVE LOCKDOWN //</span>
        </div>
        <h2 className="font-display" style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "1px", color: "#FFF" }}>
          TRANSMIT TACTICAL DIRECTIVE
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "4px" }}>
          All decisions are sealed in cryptographic escrow until countdown completion.
        </p>
      </div>

      {/* Decision Cards Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px"
      }}>
        
        {/* SHIELD (COOPERATE) CARD */}
        <div
          onClick={() => handleSelect("COOPERATE")}
          className={`decision-card cooperate ${selected === "COOPERATE" ? "selected" : ""}`}
        >
          {/* Squid Game Circle Motif */}
          <div style={{ position: "absolute", top: "18px", right: "20px" }}>
            <span className="shape-circle">○</span>
          </div>

          <div style={{
            background: "rgba(0, 240, 255, 0.08)",
            padding: "18px",
            borderRadius: "50%",
            marginBottom: "16px",
            border: "1px solid rgba(0, 240, 255, 0.35)",
            boxShadow: "0 0 20px rgba(0, 240, 255, 0.2)"
          }}>
            <Shield size={44} color="var(--cyan-tron)" />
          </div>

          <h3 className="font-display" style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--cyan-tron)", marginBottom: "6px", letterSpacing: "1px" }}>
            SHIELD PROTOCOL
          </h3>

          <span style={{
            background: "rgba(0, 240, 255, 0.15)",
            color: "var(--cyan-tron)",
            fontSize: "0.75rem",
            fontWeight: 800,
            padding: "4px 12px",
            borderRadius: "999px",
            marginBottom: "16px",
            letterSpacing: "1px",
            border: "1px solid rgba(0, 240, 255, 0.3)"
          }}>
            COOPERATE
          </span>

          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", textAlign: "center", lineHeight: "1.5" }}>
            Pool resources into the mainframe vault. If <strong>all operatives</strong> shield, the vault is shared equally.
          </p>

          <div style={{
            marginTop: "18px",
            padding: "10px 18px",
            borderRadius: "10px",
            background: "rgba(0, 240, 255, 0.06)",
            border: "1px solid rgba(0, 240, 255, 0.25)",
            color: "var(--cyan-tron)",
            fontWeight: 700,
            fontSize: "0.95rem",
            fontFamily: "monospace"
          }}>
            +{estimatedShare.toLocaleString()} Coins Each
          </div>
        </div>

        {/* BREACH (BETRAY) CARD */}
        <div
          onClick={() => handleSelect("BETRAY")}
          className={`decision-card betray ${selected === "BETRAY" ? "selected" : ""}`}
        >
          {/* Squid Game Triangle Motif */}
          <div style={{ position: "absolute", top: "18px", right: "20px" }}>
            <span className="shape-triangle" />
          </div>

          <div style={{
            background: "rgba(255, 0, 85, 0.08)",
            padding: "18px",
            borderRadius: "50%",
            marginBottom: "16px",
            border: "1px solid rgba(255, 0, 85, 0.35)",
            boxShadow: "0 0 20px rgba(255, 0, 85, 0.2)"
          }}>
            <Sword size={44} color="var(--crimson-squid)" />
          </div>

          <h3 className="font-display" style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--crimson-squid)", marginBottom: "6px", letterSpacing: "1px" }}>
            BREACH PROTOCOL
          </h3>

          <span style={{
            background: "rgba(255, 0, 85, 0.15)",
            color: "var(--crimson-squid)",
            fontSize: "0.75rem",
            fontWeight: 800,
            padding: "4px 12px",
            borderRadius: "999px",
            marginBottom: "16px",
            letterSpacing: "1px",
            border: "1px solid rgba(255, 0, 85, 0.3)"
          }}>
            BETRAY
          </span>

          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", textAlign: "center", lineHeight: "1.5" }}>
            Execute an unauthorized intrusion. If you are the <strong>lone betrayer</strong>, you take the entire pot! If 2+ betray: <strong>ZERO</strong>.
          </p>

          <div style={{
            marginTop: "18px",
            padding: "10px 18px",
            borderRadius: "10px",
            background: "rgba(255, 0, 85, 0.06)",
            border: "1px solid rgba(255, 0, 85, 0.25)",
            color: "var(--crimson-squid)",
            fontWeight: 700,
            fontSize: "0.95rem",
            fontFamily: "monospace"
          }}>
            +{potAmount.toLocaleString()} Solo / 0 Collide
          </div>
        </div>

      </div>

      {/* Confirmation Lock-In Button */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
        <button
          onClick={handleConfirm}
          disabled={!selected}
          className={`cyber-btn ${selected === "BETRAY" ? "cyber-btn-crimson" : "cyber-btn-cyan"}`}
          style={{
            minWidth: "300px",
            padding: "18px 40px",
            fontSize: "1rem",
            opacity: selected ? 1 : 0.35,
            cursor: selected ? "pointer" : "not-allowed"
          }}
        >
          {hasLockedIn ? (
            <>
              <CheckCircle2 size={22} />
              <span>DIRECTIVE SEALED (CLICK TO REVISE)</span>
            </>
          ) : (
            <>
              <Lock size={22} />
              <span>TRANSMIT & SEAL DIRECTIVE</span>
            </>
          )}
        </button>

        {hasLockedIn && (
          <span style={{ fontSize: "0.8rem", color: "var(--emerald-safe)", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--emerald-safe)" }} />
            Sealed in mainframe. You can modify until the countdown ends.
          </span>
        )}
      </div>

      {/* Psychological Warfare Taunt Matrix */}
      <div className="glass-panel" style={{ padding: "16px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "var(--text-muted)", fontSize: "0.75rem", letterSpacing: "1.5px", textTransform: "uppercase" }}>
          <MessageSquare size={14} />
          <span>PSYCHOLOGICAL WARFARE TACTICAL PINGS</span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
          {TAUNTS.map(t => (
            <button
              key={t.id}
              onClick={() => {
                sound.playClick();
                onSendTaunt(t.id, t.message, t.icon);
              }}
              className="cyber-btn cyber-btn-outline"
              style={{
                fontSize: "0.8rem",
                padding: "8px 16px",
                borderRadius: "10px"
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
