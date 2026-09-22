const OPERATIVE_PREFIXES = [
  "Neon", "Ghost", "Circuit", "Hex", "Null", "Cipher", "Synapse", 
  "Glitch", "Shadow", "Vortex", "Zero", "Apex", "Binary", "Quantum"
];

const OPERATIVE_SUFFIXES = [
  "Wraith", "Viper", "Blade", "Vector", "Knight", "Fox", "Echo", 
  "Rogue", "Specter", "Warden", "Phantom", "Pulse", "Core", "Hacker"
];

export function generateRandomNickname(): string {
  const p = OPERATIVE_PREFIXES[Math.floor(Math.random() * OPERATIVE_PREFIXES.length)];
  const s = OPERATIVE_SUFFIXES[Math.floor(Math.random() * OPERATIVE_SUFFIXES.length)];
  const num = Math.floor(Math.random() * 90) + 10;
  return `${p}${s}_${num}`;
}

export const AVATARS = [
  { id: "cyber_1", name: "Wraith", color: "#00F0FF", icon: "👤" },
  { id: "cyber_2", name: "Viper", color: "#FF0055", icon: "🐍" },
  { id: "cyber_3", name: "Glitch", color: "#9D00FF", icon: "⚡" },
  { id: "cyber_4", name: "Cipher", color: "#00FF66", icon: "👁️" },
  { id: "cyber_5", name: "Solar", color: "#FFB800", icon: "☀️" },
  { id: "cyber_6", name: "Null", color: "#E0E6ED", icon: "💀" },
];

export function getAvatar(avatarId: string) {
  return AVATARS.find(a => a.id === avatarId) || AVATARS[0];
}

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl) return envUrl;
    // Default to local backend if running in dev
    const hostname = window.location.hostname;
    return `http://${hostname}:8000`;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
}

export function getWsBaseUrl(roomCode: string, token: string): string {
  const apiBase = getApiBaseUrl();
  const wsProtocol = apiBase.startsWith("https") ? "wss:" : "ws:";
  const cleanHost = apiBase.replace(/^https?:\/\//, "");
  return `${wsProtocol}//${cleanHost}/ws/${roomCode.toUpperCase()}?token=${token}`;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.error("Failed to copy clipboard text", err);
  }
  return false;
}
