"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getApiBaseUrl } from "@/lib/utils";
import { LeaderboardEntry } from "@/lib/types";
import { Trophy, Award, ArrowLeft, Shield, Sword, Zap } from "lucide-react";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/leaderboard`);
        if (res.ok) {
          const data = await res.json();
          setEntries(data);
        }
      } catch (err) {
        console.error("Failed to load leaderboard", err);
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, []);

  return (
    <main className="container-max" style={{ minHeight: "100vh", padding: "28px 16px 56px 16px" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <Link href="/" className="cyber-btn cyber-btn-outline" style={{ padding: "8px 18px", fontSize: "0.8rem" }}>
          <ArrowLeft size={16} />
          <span>RETURN HOME</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Trophy size={22} color="var(--amber-gold)" />
          <span className="font-display" style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--amber-gold)", letterSpacing: "1px" }}>
            HALL OF FAME
          </span>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="glass-panel" style={{ padding: "32px", textAlign: "center", marginBottom: "28px", borderTop: "3px solid var(--amber-gold)" }}>
        <h1 className="font-display" style={{ fontSize: "clamp(1.8rem, 5vw, 2.5rem)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "2px" }}>
          GLOBAL OPERATIVE ARCHIVES
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "560px", margin: "10px auto 0 auto", lineHeight: "1.5" }}>
          The highest single-match vault hauls and most notorious infiltrations in Betrayal Protocol history.
        </p>
      </div>

      {/* Leaderboard Ledger Cards */}
      <div className="glass-panel" style={{ padding: "24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", border: "3px solid var(--amber-gold)", borderTopColor: "transparent", margin: "0 auto 16px auto" }} className="animate-spin" />
            <span className="font-mono" style={{ color: "var(--text-muted)", fontSize: "0.85rem", letterSpacing: "1px" }}>QUERYING MAINFRAME LEDGER...</span>
          </div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
            <Award size={48} style={{ margin: "0 auto 16px auto", opacity: 0.3 }} />
            <p style={{ fontSize: "1.05rem", fontWeight: 700 }}>No completed matches recorded yet.</p>
            <p style={{ fontSize: "0.85rem", marginTop: "6px" }}>Initiate a match now to claim the #1 spot!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {entries.map((entry, idx) => {
              const isTop3 = idx < 3;
              let badgeColor = "var(--cyan-tron)";
              let cardBorder = "rgba(255, 255, 255, 0.06)";
              let cardBg = "rgba(255, 255, 255, 0.02)";

              if (idx === 0) {
                badgeColor = "var(--amber-gold)";
                cardBorder = "rgba(255, 184, 0, 0.3)";
                cardBg = "rgba(255, 184, 0, 0.05)";
              } else if (idx === 1) {
                badgeColor = "#C0C0C0";
                cardBorder = "rgba(192, 192, 192, 0.25)";
                cardBg = "rgba(192, 192, 192, 0.04)";
              } else if (idx === 2) {
                badgeColor = "#CD7F32";
                cardBorder = "rgba(205, 127, 50, 0.25)";
                cardBg = "rgba(205, 127, 50, 0.04)";
              }

              return (
                <div
                  key={entry.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 20px",
                    borderRadius: "14px",
                    background: cardBg,
                    border: `1px solid ${cardBorder}`,
                    boxShadow: isTop3 ? `0 0 20px ${badgeColor}15` : "none",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                    <span className="font-mono" style={{ fontSize: "1.3rem", fontWeight: 800, color: badgeColor, width: "34px" }}>
                      #{idx + 1}
                    </span>

                    <div>
                      <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--text-primary)" }}>
                        {entry.player_nickname}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "8px", marginTop: "3px", fontFamily: "monospace" }}>
                        <span>ROOM: {entry.room_code}</span>
                        <span>•</span>
                        <span>{new Date(entry.achieved_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "22px" }}>
                    <div style={{ display: "flex", gap: "14px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      <span title="Solo Heists" style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--crimson-squid)", fontWeight: 700 }}>
                        <Sword size={14} /> {entry.solo_betrayals}
                      </span>
                      <span title="Cooperations" style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--cyan-tron)", fontWeight: 700 }}>
                        <Shield size={14} /> {entry.cooperations}
                      </span>
                    </div>

                    <div className="font-mono" style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--amber-gold)" }}>
                      {entry.score.toLocaleString()} 🪙
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </main>
  );
}
