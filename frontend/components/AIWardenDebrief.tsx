"use client";

import React, { useEffect, useState } from "react";
import { Bot, Terminal, Cpu } from "lucide-react";

interface AIWardenDebriefProps {
  commentary: string;
  outcomeType: string;
}

export default function AIWardenDebrief({ commentary, outcomeType }: AIWardenDebriefProps) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    if (!commentary) return;

    let idx = 0;
    const interval = setInterval(() => {
      idx += 1;
      setDisplayedText(commentary.slice(0, idx));
      if (idx >= commentary.length) {
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [commentary]);

  const getWardenTheme = () => {
    if (outcomeType === "ALL_COOPERATE") {
      return {
        color: "var(--cyan-tron)",
        glow: "var(--cyan-glow)",
        border: "rgba(0, 240, 255, 0.35)",
        status: "SURVEILLANCE // HARMONY DETECTED"
      };
    } else if (outcomeType === "SOLO_BETRAYAL") {
      return {
        color: "var(--amber-gold)",
        glow: "var(--amber-glow)",
        border: "rgba(255, 184, 0, 0.35)",
        status: "INTRUSION // HEIST CATALOGED"
      };
    } else {
      return {
        color: "var(--crimson-squid)",
        glow: "var(--crimson-glow)",
        border: "rgba(255, 0, 85, 0.35)",
        status: "COLLISION // EMERGENCY LOCKDOWN"
      };
    }
  };

  const theme = getWardenTheme();

  return (
    <div
      className="glass-panel"
      style={{
        padding: "22px 26px",
        width: "100%",
        maxWidth: "860px",
        margin: "18px auto 0 auto",
        border: `1.5px solid ${theme.border}`,
        boxShadow: `0 10px 35px -5px ${theme.glow}`,
        position: "relative"
      }}
    >
      {/* Overseer Ocular Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        paddingBottom: "14px",
        marginBottom: "16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          
          {/* Animated Robotic Ocular Sensor */}
          <div style={{
            position: "relative",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: `2px solid ${theme.color}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.6)",
            boxShadow: `0 0 15px ${theme.glow}`
          }}>
            {/* Inner Pupil Lens */}
            <div
              className="animate-pulse"
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: theme.color,
                boxShadow: `0 0 10px ${theme.color}`
              }}
            />
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="font-display" style={{ fontSize: "1.05rem", fontWeight: 800, color: theme.color, letterSpacing: "1.5px" }}>
                PROTOCOL WARDEN
              </span>
              <span className="shape-square" style={{ width: "16px", height: "16px", fontSize: "0.65rem" }}>□</span>
            </div>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
              [AUTONOMOUS SURVEILLANCE OVERSEER]
            </span>
          </div>
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(0,0,0,0.5)",
          padding: "5px 12px",
          borderRadius: "8px",
          fontSize: "0.7rem",
          fontFamily: "monospace",
          color: theme.color,
          border: `1px solid ${theme.border}`
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: theme.color }} className="animate-pulse" />
          <span>{theme.status}</span>
        </div>
      </div>

      {/* Terminal Roast Dialogue */}
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.95rem",
        color: "var(--text-primary)",
        lineHeight: "1.65",
        minHeight: "48px",
        display: "flex",
        alignItems: "center"
      }}>
        <span style={{ color: "var(--text-muted)", marginRight: "10px", fontWeight: 700 }}>&gt;</span>
        <span>
          {displayedText}
          <span className="animate-pulse" style={{ color: theme.color, fontWeight: 800 }}>_</span>
        </span>
      </div>
    </div>
  );
}
