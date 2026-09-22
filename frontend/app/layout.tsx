import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Betrayal Protocol | Real-Time Multiplayer Social Dilemma",
  description: "A high-stakes 10-round multiplayer psychological game of trust, greed, and sudden betrayal. Join with a room code on any phone or laptop. No login required.",
  keywords: ["multiplayer", "game", "dilemma", "cyberpunk", "betrayal", "strategy", "real-time"]
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#080A0F"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
