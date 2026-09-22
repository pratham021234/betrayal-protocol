"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { RoomState } from "@/lib/types";
import { sound } from "@/lib/audio";
import { copyText, getAvatar } from "@/lib/utils";
import { Crown, Copy, QrCode, Play, Check, Shield, Users, Radio } from "lucide-react";

interface LobbyViewProps {
  roomState: RoomState;
  currentPlayerId: string;
  isHost: boolean;
  onToggleReady: (ready: boolean) => void;
  onStartGame: () => void;
}

export default function LobbyView({
  roomState,
  currentPlayerId,
  isHost,
  onToggleReady,
  onStartGame
}: LobbyViewProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const me = roomState.players.find(p => p.id === currentPlayerId);
  const canStart = isHost && roomState.players.length >= 2;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const joinUrl = `${window.location.origin}/room/${roomState.room_code}`;
      QRCode.toDataURL(joinUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: "#00F0FF",
          light: "#030508"
        }
      }).then(url => {
        setQrDataUrl(url);
      }).catch(err => {
        console.error("Failed to generate QR code", err);
      });
    }
  }, [roomState.room_code]);

  const handleCopyLink = async () => {
    sound.playClick();
    if (typeof window !== "undefined") {
      const joinUrl = `${window.location.origin}/room/${roomState.room_code}`;
      const ok = await copyText(joinUrl);
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "880px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Room Code Keycap Banner */}
      <div className="glass-panel" style={{ padding: "28px", textAlign: "center" }}>
        
        {/* Squid Game Geometric Emblem */}
        <div style={{ display: "flex", justifyContent: "center", gap: "14px", marginBottom: "14px" }}>
          <span className="shape-circle">○</span>
          <span className="shape-triangle" />
          <span className="shape-square">□</span>
        </div>

        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "2.5px" }}>
          // PROTOCOL INFILTRATION KEY //
        </span>

        {/* 4-Letter Keycap Boxes */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "14px",
          marginTop: "12px",
          marginBottom: "20px"
        }}>
          {roomState.room_code.split("").map((char, i) => (
            <div
              key={i}
              className="font-display"
              style={{
                width: "58px",
                height: "72px",
                background: "linear-gradient(180deg, rgba(0, 240, 255, 0.12) 0%, rgba(10, 15, 26, 0.9) 100%)",
                border: "2px solid var(--cyan-tron)",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.2rem",
                fontWeight: 800,
                color: "var(--cyan-tron)",
                boxShadow: "0 0 25px var(--cyan-glow), inset 0 0 10px rgba(0, 240, 255, 0.2)"
              }}
            >
              {char}
            </div>
          ))}
        </div>

        {/* Share Action Buttons */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px" }}>
          <button
            onClick={handleCopyLink}
            className="cyber-btn cyber-btn-outline"
            style={{ padding: "12px 22px", fontSize: "0.85rem" }}
          >
            {copied ? <Check size={16} color="var(--emerald-safe)" /> : <Copy size={16} />}
            <span>{copied ? "INVITE LINK COPIED!" : "COPY INVITATION LINK"}</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setShowQr(!showQr);
            }}
            className="cyber-btn cyber-btn-outline"
            style={{ padding: "12px 22px", fontSize: "0.85rem" }}
          >
            <QrCode size={16} />
            <span>{showQr ? "HIDE SCANNER" : "DISPLAY QR CODE"}</span>
          </button>
        </div>

        {/* QR Code Modal Display */}
        {showQr && qrDataUrl && (
          <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{
              padding: "16px",
              background: "#030508",
              borderRadius: "18px",
              border: "2px solid var(--cyan-tron)",
              boxShadow: "0 0 35px var(--cyan-glow)"
            }}>
              <img src={qrDataUrl} alt="Scan QR code to join" style={{ width: "200px", height: "200px", borderRadius: "10px" }} />
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "10px", letterSpacing: "0.5px" }}>
              Scan from any smartphone or tablet to synchronize instantly
            </span>
          </div>
        )}
      </div>

      {/* Operatives Roster Grid */}
      <div className="glass-panel" style={{ padding: "26px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Radio size={18} color="var(--cyan-tron)" className="animate-pulse" />
            <h3 className="font-display" style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "1px" }}>
              SYNCHRONIZED OPERATIVES
            </h3>
          </div>
          <span className="font-mono" style={{ fontSize: "0.85rem", color: "var(--cyan-tron)", background: "rgba(0,240,255,0.08)", padding: "4px 10px", borderRadius: "6px", border: "1px solid rgba(0,240,255,0.2)" }}>
            {roomState.players.length} / 8 ACTIVE
          </span>
        </div>

        {/* Player Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "14px"
        }}>
          {roomState.players.map((player, idx) => {
            const avatar = getAvatar(player.avatar_id);
            const isMe = player.id === currentPlayerId;

            return (
              <div
                key={player.id}
                style={{
                  background: isMe ? "rgba(0, 240, 255, 0.08)" : "rgba(255, 255, 255, 0.02)",
                  border: isMe ? "1.5px solid var(--cyan-tron)" : "1px solid rgba(255, 255, 255, 0.07)",
                  borderRadius: "14px",
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: isMe ? "0 0 20px rgba(0, 240, 255, 0.15)" : "none"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: `1.5px solid ${avatar.color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.3rem"
                  }}>
                    {avatar.icon}
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontWeight: 800, fontSize: "0.95rem" }}>
                        {player.nickname}
                      </span>
                      {player.is_host && <Crown size={15} color="var(--amber-gold)" />}
                    </div>
                    <span style={{ fontSize: "0.75rem", color: isMe ? "var(--cyan-tron)" : "var(--text-muted)", fontFamily: "monospace" }}>
                      OP-{String(idx + 1).padStart(3, "0")} {isMe && "(YOU)"}
                    </span>
                  </div>
                </div>

                <div>
                  <span style={{
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    padding: "4px 10px",
                    borderRadius: "999px",
                    background: player.is_ready ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.04)",
                    color: player.is_ready ? "var(--emerald-safe)" : "var(--text-muted)",
                    border: `1px solid ${player.is_ready ? "rgba(16, 185, 129, 0.35)" : "rgba(255,255,255,0.08)"}`,
                    letterSpacing: "0.5px"
                  }}>
                    {player.is_ready ? "READY" : "WAITING"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Start / Ready Controls */}
        <div style={{ marginTop: "28px", display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
          {!isHost && me && (
            <button
              onClick={() => {
                sound.playClick();
                onToggleReady(!me.is_ready);
              }}
              className={`cyber-btn ${me.is_ready ? "cyber-btn-outline" : "cyber-btn-cyan"}`}
              style={{ minWidth: "260px", padding: "16px 32px" }}
            >
              {me.is_ready ? (
                <>
                  <Check size={20} />
                  <span>READY (CLICK TO CANCEL)</span>
                </>
              ) : (
                <>
                  <Shield size={20} />
                  <span>TOGGLE READY STATUS</span>
                </>
              )}
            </button>
          )}

          {isHost && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", alignItems: "center" }}>
              <button
                onClick={() => {
                  sound.playClick();
                  onStartGame();
                }}
                disabled={!canStart}
                className="cyber-btn cyber-btn-cyan"
                style={{
                  width: "100%",
                  maxWidth: "380px",
                  padding: "18px 36px",
                  opacity: canStart ? 1 : 0.35,
                  cursor: canStart ? "pointer" : "not-allowed"
                }}
              >
                <Play size={22} />
                <span>INITIATE PROTOCOL (START)</span>
              </button>
              
              {!canStart && (
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Minimum 2 operatives required to initiate match.
                </span>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
