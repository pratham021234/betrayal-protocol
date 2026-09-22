"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { getApiBaseUrl } from "@/lib/utils";
import { sound } from "@/lib/audio";
import { Film, Trophy, ArrowLeft, ArrowRight, Shield, Sword, AlertTriangle, CheckCircle, Home } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ReplayPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const replayId = resolvedParams.id;

  const [replay, setReplay] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);

  useEffect(() => {
    async function loadReplay() {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/replays/${replayId}`);
        if (!res.ok) throw new Error("Replay record not found.");
        const data = await res.json();
        setReplay(data);
      } catch (err: any) {
        setError(err.message || "Failed to load replay.");
      } finally {
        setLoading(false);
      }
    }
    loadReplay();
  }, [replayId]);

  if (loading) {
    return (
      <main className="container-max" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", border: "3px solid var(--cyan-neon)", borderTopColor: "transparent", margin: "0 auto 12px auto" }} className="animate-spin" />
          <div className="font-display" style={{ color: "var(--cyan-neon)" }}>LOADING REPLAY ARCHIVE...</div>
        </div>
      </main>
    );
  }

  if (error || !replay) {
    return (
      <main className="container-max" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="glass-panel" style={{ padding: "32px", textAlign: "center", maxWidth: "440px" }}>
          <div style={{ color: "var(--crimson-neon)", fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px" }}>
            Replay Unavailable
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "20px" }}>
            {error || "The requested match archive could not be retrieved."}
          </p>
          <Link href="/" className="cyber-btn cyber-btn-cyan" style={{ padding: "10px 20px" }}>
            <Home size={16} />
            <span>Return Home</span>
          </Link>
        </div>
      </main>
    );
  }

  const rounds = replay.full_replay_log?.rounds || [];
  const currentRound = rounds[currentRoundIdx];

  return (
    <main className="container-max" style={{ minHeight: "100vh", padding: "24px 16px 48px 16px" }}>
      
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <Link href="/" className="cyber-btn cyber-btn-outline" style={{ padding: "8px 16px", fontSize: "0.8rem" }}>
          <ArrowLeft size={16} />
          <span>BACK HOME</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Film size={18} color="var(--cyan-neon)" />
          <span className="font-display" style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
            MATCH ARCHIVE: {replay.room_code}
          </span>
        </div>
      </div>

      {/* Match Overview Card */}
      <div className="glass-panel" style={{ padding: "20px 24px", marginBottom: "24px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        <div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>CHAMPION</span>
          <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--amber-neon)" }}>
            🏆 {replay.winner_nickname} ({replay.winning_score?.toLocaleString()} 🪙)
          </div>
        </div>

        <div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>OPERATIVES</span>
          <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>
            {replay.total_players} Players
          </div>
        </div>

        <div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>DATE RECORDED</span>
          <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontFamily: "monospace" }}>
            {new Date(replay.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Round Stepper Scrubber */}
      <div className="glass-panel" style={{ padding: "20px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 className="font-display" style={{ fontSize: "1.1rem", fontWeight: 700 }}>
            TIMELINE SCRUBBER
          </h3>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => {
                sound.playClick();
                setCurrentRoundIdx(Math.max(0, currentRoundIdx - 1));
              }}
              disabled={currentRoundIdx === 0}
              className="cyber-btn cyber-btn-outline"
              style={{ padding: "6px 12px", fontSize: "0.75rem", opacity: currentRoundIdx === 0 ? 0.3 : 1 }}
            >
              <ArrowLeft size={14} />
              <span>PREV</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setCurrentRoundIdx(Math.min(rounds.length - 1, currentRoundIdx + 1));
              }}
              disabled={currentRoundIdx === rounds.length - 1}
              className="cyber-btn cyber-btn-outline"
              style={{ padding: "6px 12px", fontSize: "0.75rem", opacity: currentRoundIdx === rounds.length - 1 ? 0.3 : 1 }}
            >
              <span>NEXT</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Round Pills Grid */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {rounds.map((r: any, idx: number) => {
            const isSelected = idx === currentRoundIdx;
            const isBetray = r.outcome_type === "SOLO_BETRAYAL";
            const isMutual = r.outcome_type === "MUTUAL_BETRAYAL";

            let pillColor = "var(--cyan-neon)";
            if (isBetray) pillColor = "var(--amber-neon)";
            if (isMutual) pillColor = "var(--crimson-neon)";

            return (
              <button
                key={idx}
                onClick={() => {
                  sound.playClick();
                  setCurrentRoundIdx(idx);
                }}
                style={{
                  flex: "1 0 50px",
                  padding: "10px",
                  borderRadius: "8px",
                  border: isSelected ? `2px solid ${pillColor}` : "1px solid rgba(255,255,255,0.08)",
                  background: isSelected ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.3)",
                  color: isSelected ? pillColor : "var(--text-secondary)",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer"
                }}
              >
                R{r.round_number}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Round Detail */}
      {currentRound && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Round Header */}
          <div className="glass-panel" style={{ padding: "20px 24px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
            <div>
              <span className="font-display" style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--cyan-neon)" }}>
                ROUND {currentRound.round_number}
              </span>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Vault Pot: <strong>{currentRound.pot} Coins</strong> {currentRound.multiplier > 1 && `(${currentRound.multiplier}x Surge)`}
              </div>
            </div>

            <div style={{
              padding: "6px 14px",
              borderRadius: "999px",
              fontSize: "0.8rem",
              fontWeight: 700,
              background: currentRound.outcome_type === "ALL_COOPERATE" ? "rgba(0, 240, 255, 0.15)" : currentRound.outcome_type === "SOLO_BETRAYAL" ? "rgba(255, 184, 0, 0.15)" : "rgba(255, 0, 85, 0.15)",
              color: currentRound.outcome_type === "ALL_COOPERATE" ? "var(--cyan-neon)" : currentRound.outcome_type === "SOLO_BETRAYAL" ? "var(--amber-neon)" : "var(--crimson-neon)",
              border: "1px solid currentColor"
            }}>
              {currentRound.outcome_type.replace("_", " ")}
            </div>
          </div>

          {/* AI Roast Terminal */}
          {currentRound.commentary && (
            <div className="glass-panel" style={{ padding: "16px 20px", borderLeft: "4px solid var(--purple-neon)" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--purple-neon)", fontWeight: 700, letterSpacing: "1px" }}>
                PROTOCOL WARDEN COMMENTARY:
              </span>
              <p style={{ fontFamily: "monospace", fontSize: "0.95rem", color: "var(--text-primary)", marginTop: "6px" }}>
                &gt; {currentRound.commentary}
              </p>
            </div>
          )}

          {/* Player Choices */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "14px"
          }}>
            {Object.entries(currentRound.choices || {}).map(([pid, choice]: [string, any]) => {
              const delta = currentRound.deltas?.[pid] || 0;
              const isBetray = choice === "BETRAY";

              return (
                <div
                  key={pid}
                  className="glass-panel"
                  style={{
                    padding: "16px",
                    border: `1px solid ${isBetray ? "var(--crimson-neon)" : "var(--cyan-neon)"}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                    Operative {pid.slice(0, 6)}
                  </span>
                  
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 12px",
                    borderRadius: "999px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: isBetray ? "var(--crimson-neon)" : "var(--cyan-neon)",
                    background: isBetray ? "rgba(255, 0, 85, 0.15)" : "rgba(0, 240, 255, 0.15)"
                  }}>
                    {isBetray ? <Sword size={14} /> : <Shield size={14} />}
                    <span>{choice}</span>
                  </div>

                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: delta > 0 ? "var(--amber-neon)" : "var(--text-muted)" }}>
                    {delta > 0 ? `+${delta} Coins` : "+0 Coins"}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </main>
  );
}
