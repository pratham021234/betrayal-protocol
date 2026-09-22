"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { sound } from "@/lib/audio";

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(sound.isEnabled());
  }, []);

  const handleToggle = () => {
    const nextState = sound.toggleMute();
    setEnabled(nextState);
    if (nextState) {
      sound.playClick();
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono transition-all border border-white/10 hover:border-white/20 bg-slate-900/60 text-slate-300 hover:text-white"
      title={enabled ? "Mute sound effects" : "Enable sound effects"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 12px",
        borderRadius: "9999px",
        fontSize: "0.75rem",
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(15,23,42,0.6)",
        color: enabled ? "#00F0FF" : "#94A3B8",
        cursor: "pointer",
        backdropFilter: "blur(8px)"
      }}
    >
      {enabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
      <span>{enabled ? "SFX ON" : "MUTED"}</span>
    </button>
  );
}
