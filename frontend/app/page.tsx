"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SoundToggle from "@/components/SoundToggle";
import { sound } from "@/lib/audio";
import { generateRandomNickname, AVATARS, getApiBaseUrl } from "@/lib/utils";
import { Dices, Award, HelpCircle, ArrowRight, Zap, Shield, Sword } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"JOIN" | "CREATE">("JOIN");
  const [roomCode, setRoomCode] = useState("");
  const [nickname, setNickname] = useState(generateRandomNickname());
  const [selectedAvatar, setSelectedAvatar] = useState("cyber_1");
  const [roundDuration, setRoundDuration] = useState(15);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showRules, setShowRules] = useState(false);

  const handleRandomizeName = () => {
    sound.playClick();
    setNickname(generateRandomNickname());
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      setErrorMsg("Please enter a valid 4-letter room code.");
      return;
    }
    if (!nickname.trim()) {
      setErrorMsg("Please enter an operative call-sign.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    sound.playClick();

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/rooms/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_code: roomCode.trim().toUpperCase(),
          nickname: nickname.trim(),
          avatar_id: selectedAvatar
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to join room.");
      }

      localStorage.setItem(`token_${data.room_code}`, data.session_token);
      localStorage.setItem(`player_${data.room_code}`, data.player_id);
      localStorage.setItem("last_nickname", nickname);

      router.push(`/room/${data.room_code}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Network error. Please try again.");
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setErrorMsg("Please enter an operative call-sign.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    sound.playClick();

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nickname.trim(),
          avatar_id: selectedAvatar,
          round_duration_sec: roundDuration,
          max_rounds: 10
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to create room.");
      }

      localStorage.setItem(`token_${data.room_code}`, data.session_token);
      localStorage.setItem(`player_${data.room_code}`, data.player_id);
      localStorage.setItem("last_nickname", nickname);

      router.push(`/room/${data.room_code}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="container-max" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "24px 16px" }}>
      
      {/* Top Dystopian Surveillance Bar */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Squid Game Shape Motifs */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span className="shape-circle" style={{ width: "18px", height: "18px", fontSize: "0.65rem" }}>○</span>
            <span className="shape-triangle" style={{ borderBottomWidth: "14px", borderLeftWidth: "8px", borderRightWidth: "8px" }} />
            <span className="shape-square" style={{ width: "16px", height: "16px", fontSize: "0.65rem" }}>□</span>
          </div>

          <span className="font-display" style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "1.5px", color: "var(--text-primary)" }}>
            BETRAYAL PROTOCOL
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => {
              sound.playClick();
              setShowRules(true);
            }}
            className="cyber-btn cyber-btn-outline"
            style={{ padding: "6px 14px", fontSize: "0.75rem" }}
          >
            <HelpCircle size={14} />
            <span>HOW TO PLAY</span>
          </button>
          <SoundToggle />
        </div>
      </header>

      {/* Hero Title Section */}
      <div style={{ textAlign: "center", margin: "20px 0 32px 0" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "5px 14px",
          borderRadius: "999px",
          background: "rgba(0, 240, 255, 0.08)",
          border: "1px solid rgba(0, 240, 255, 0.3)",
          color: "var(--cyan-tron)",
          fontSize: "0.75rem",
          fontWeight: 800,
          letterSpacing: "1.5px",
          marginBottom: "16px",
          boxShadow: "0 0 20px rgba(0, 240, 255, 0.15)"
        }}>
          <Zap size={14} />
          <span>AUTONOMOUS MULTIPLAYER SOCIAL DILEMMA</span>
        </div>

        <h1 className="font-display" style={{
          fontSize: "clamp(2.6rem, 7vw, 4.4rem)",
          fontWeight: 800,
          letterSpacing: "2.5px",
          lineHeight: "1.05",
          background: "linear-gradient(180deg, #FFFFFF 20%, #94A3B8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 0 40px rgba(0, 240, 255, 0.2)"
        }}>
          BETRAYAL PROTOCOL
        </h1>

        <p style={{
          color: "var(--text-secondary)",
          fontSize: "clamp(0.95rem, 2vw, 1.15rem)",
          maxWidth: "600px",
          margin: "14px auto 0 auto",
          lineHeight: "1.55"
        }}>
          10 rounds. Secret decisions. Unanimous cooperation splits the prize. A solo betrayer steals 100%. Mutual greed collapses the vault to zero.
        </p>
      </div>

      {/* Main Glassmorphic Interactive Console */}
      <div className="glass-panel" style={{ width: "100%", maxWidth: "480px", margin: "0 auto", padding: "30px" }}>
        
        {/* Tab Switcher */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          background: "rgba(0,0,0,0.5)",
          padding: "4px",
          borderRadius: "12px",
          marginBottom: "24px",
          border: "1px solid rgba(255,255,255,0.07)"
        }}>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab("JOIN");
              setErrorMsg("");
            }}
            style={{
              padding: "11px",
              borderRadius: "10px",
              border: "none",
              background: activeTab === "JOIN" ? "linear-gradient(135deg, rgba(0, 240, 255, 0.25), rgba(0, 136, 255, 0.15))" : "transparent",
              color: activeTab === "JOIN" ? "var(--cyan-tron)" : "var(--text-muted)",
              fontWeight: 800,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: activeTab === "JOIN" ? "0 0 15px rgba(0, 240, 255, 0.2)" : "none"
            }}
          >
            JOIN ROOM
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab("CREATE");
              setErrorMsg("");
            }}
            style={{
              padding: "11px",
              borderRadius: "10px",
              border: "none",
              background: activeTab === "CREATE" ? "linear-gradient(135deg, rgba(255, 0, 85, 0.25), rgba(184, 0, 54, 0.15))" : "transparent",
              color: activeTab === "CREATE" ? "var(--crimson-squid)" : "var(--text-muted)",
              fontWeight: 800,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: activeTab === "CREATE" ? "0 0 15px rgba(255, 0, 85, 0.2)" : "none"
            }}
          >
            CREATE ROOM
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            padding: "12px 16px",
            borderRadius: "10px",
            background: "rgba(255, 0, 85, 0.15)",
            border: "1px solid rgba(255, 0, 85, 0.35)",
            color: "#FF6688",
            fontSize: "0.85rem",
            marginBottom: "18px"
          }}>
            {errorMsg}
          </div>
        )}

        {/* JOIN ROOM FORM */}
        {activeTab === "JOIN" ? (
          <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px" }}>
                Enter 4-Letter Room Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                placeholder="e.g. CYBR"
                className="font-display"
                style={{
                  width: "100%",
                  padding: "15px",
                  fontSize: "1.4rem",
                  letterSpacing: "6px",
                  textAlign: "center",
                  background: "rgba(0,0,0,0.5)",
                  border: "2px solid var(--cyan-tron)",
                  borderRadius: "12px",
                  color: "var(--cyan-tron)",
                  outline: "none",
                  boxShadow: "0 0 20px var(--cyan-glow)"
                }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1.5px" }}>
                  Operative Call-sign
                </label>
                <button
                  type="button"
                  onClick={handleRandomizeName}
                  style={{ background: "none", border: "none", color: "var(--cyan-tron)", cursor: "pointer", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <Dices size={13} />
                  <span>Randomize</span>
                </button>
              </div>
              <input
                type="text"
                maxLength={20}
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="Your call-sign"
                style={{
                  width: "100%",
                  padding: "14px",
                  fontSize: "1rem",
                  background: "rgba(0,0,0,0.5)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "var(--text-primary)",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "10px" }}>
                Select Cyber Crest
              </label>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                {AVATARS.map(av => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedAvatar(av.id);
                    }}
                    style={{
                      width: "46px",
                      height: "46px",
                      borderRadius: "12px",
                      background: selectedAvatar === av.id ? "rgba(0, 240, 255, 0.18)" : "rgba(255,255,255,0.03)",
                      border: `2px solid ${selectedAvatar === av.id ? av.color : "rgba(255,255,255,0.08)"}`,
                      fontSize: "1.25rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s",
                      boxShadow: selectedAvatar === av.id ? `0 0 15px ${av.color}55` : "none"
                    }}
                  >
                    {av.icon}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cyber-btn cyber-btn-cyan"
              style={{ width: "100%", marginTop: "10px" }}
            >
              <span>{loading ? "AUTHENTICATING..." : "SYNCHRONIZE & JOIN"}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          /* CREATE ROOM FORM */
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1.5px" }}>
                  Host Call-sign
                </label>
                <button
                  type="button"
                  onClick={handleRandomizeName}
                  style={{ background: "none", border: "none", color: "var(--crimson-squid)", cursor: "pointer", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <Dices size={13} />
                  <span>Randomize</span>
                </button>
              </div>
              <input
                type="text"
                maxLength={20}
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="Host operative name"
                style={{
                  width: "100%",
                  padding: "14px",
                  fontSize: "1rem",
                  background: "rgba(0,0,0,0.5)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "var(--text-primary)",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "10px" }}>
                Round Decision Speed
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                {[
                  { dur: 10, label: "Blitz" },
                  { dur: 15, label: "Standard" },
                  { dur: 20, label: "Deliberate" }
                ].map(item => (
                  <button
                    key={item.dur}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setRoundDuration(item.dur);
                    }}
                    style={{
                      padding: "10px 4px",
                      borderRadius: "10px",
                      border: `1.5px solid ${roundDuration === item.dur ? "var(--crimson-squid)" : "rgba(255,255,255,0.08)"}`,
                      background: roundDuration === item.dur ? "rgba(255, 0, 85, 0.18)" : "rgba(0,0,0,0.4)",
                      color: roundDuration === item.dur ? "var(--crimson-squid)" : "var(--text-secondary)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center"
                    }}
                  >
                    <span style={{ fontSize: "0.95rem", fontWeight: 800 }}>{item.dur}s</span>
                    <span style={{ fontSize: "0.65rem", textTransform: "uppercase", opacity: 0.8 }}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "10px" }}>
                Select Cyber Crest
              </label>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                {AVATARS.map(av => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedAvatar(av.id);
                    }}
                    style={{
                      width: "46px",
                      height: "46px",
                      borderRadius: "12px",
                      background: selectedAvatar === av.id ? "rgba(255, 0, 85, 0.18)" : "rgba(255,255,255,0.03)",
                      border: `2px solid ${selectedAvatar === av.id ? av.color : "rgba(255,255,255,0.08)"}`,
                      fontSize: "1.25rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s",
                      boxShadow: selectedAvatar === av.id ? `0 0 15px ${av.color}55` : "none"
                    }}
                  >
                    {av.icon}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cyber-btn cyber-btn-crimson"
              style={{ width: "100%", marginTop: "10px" }}
            >
              <span>{loading ? "INITIALIZING..." : "INITIATE PROTOCOL ROOM"}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        )}
      </div>

      {/* Footer Navigation */}
      <footer style={{ display: "flex", justifyContent: "center", gap: "24px", marginTop: "36px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
        <Link href="/leaderboard" style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--amber-gold)", textDecoration: "none", fontWeight: 700 }}>
          <Award size={16} />
          <span>Hall of Fame Leaderboard</span>
        </Link>
      </footer>

      {/* How To Play Modal */}
      {showRules && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(3, 5, 8, 0.88)",
          backdropFilter: "blur(16px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          zIndex: 9999
        }}>
          <div className="glass-panel" style={{ width: "100%", maxWidth: "580px", padding: "30px", maxHeight: "90vh", overflowY: "auto", borderTop: "3px solid var(--cyan-tron)" }}>
            <h2 className="font-display" style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--cyan-tron)", marginBottom: "16px", letterSpacing: "1px" }}>
              PROTOCOL RULES & PAYOFF MATRIX
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.6" }}>
              <div style={{ padding: "14px", background: "rgba(0, 240, 255, 0.08)", borderRadius: "12px", border: "1px solid rgba(0, 240, 255, 0.25)" }}>
                <strong style={{ color: "var(--cyan-tron)", fontSize: "1rem" }}>🛡️ Case 1: Unanimous Cooperation (All Shield)</strong>
                <p style={{ marginTop: "4px" }}>Every operative shares the round vault equally. The safest, most disciplined path to steady accumulation.</p>
              </div>

              <div style={{ padding: "14px", background: "rgba(255, 184, 0, 0.08)", borderRadius: "12px", border: "1px solid rgba(255, 184, 0, 0.25)" }}>
                <strong style={{ color: "var(--amber-gold)", fontSize: "1rem" }}>🗡️ Case 2: Solo Betrayal (One Rogue Breaches)</strong>
                <p style={{ marginTop: "4px" }}>The single rogue executes an unauthorized heist and steals 100% of the pot! Cooperators receive zero.</p>
              </div>

              <div style={{ padding: "14px", background: "rgba(255, 0, 85, 0.08)", borderRadius: "12px", border: "1px solid rgba(255, 0, 85, 0.25)" }}>
                <strong style={{ color: "var(--crimson-squid)", fontSize: "1rem" }}>💀 Case 3: Mutual Greed Collapse (2+ Breach)</strong>
                <p style={{ marginTop: "4px" }}>Breach signatures collide at the vault gate. Emergency mainframe incinerator burns all coins to zero.</p>
              </div>

              <p style={{ marginTop: "8px" }}>
                Matches last 10 rounds with exponential pot surges on Rounds 5, 9, and 10. Highest score after Round 10 wins the crown.
              </p>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setShowRules(false);
              }}
              className="cyber-btn cyber-btn-cyan"
              style={{ width: "100%", marginTop: "24px" }}
            >
              <span>UNDERSTOOD</span>
            </button>
          </div>
        </div>
      )}

    </main>
  );
}
