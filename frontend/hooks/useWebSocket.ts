"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getWsBaseUrl } from "@/lib/utils";

interface UseWebSocketOptions {
  roomCode: string;
  token: string;
  onMessage: (event: { type: string; data?: any }) => void;
  autoConnect?: boolean;
}

export function useWebSocket({
  roomCode,
  token,
  onMessage,
  autoConnect = true
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManuallyClosedRef = useRef(false);

  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    if (!roomCode || !token) return;
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    setIsConnecting(true);
    isManuallyClosedRef.current = false;

    const wsUrl = getWsBaseUrl(roomCode, token);
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setIsConnecting(false);

      // Start ping heartbeat
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "PING" }));
        }
      }, 10000);
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type === "PONG") return;
        onMessageRef.current(parsed);
      } catch (err) {
        console.error("Failed to parse WebSocket message", err);
      }
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      setIsConnecting(false);
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }

      // Reconnect if not closed by user
      if (!isManuallyClosedRef.current && event.code !== 1008) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 2000);
      }
    };

    ws.onerror = (err) => {
      console.warn("WebSocket error:", err);
      ws.close();
    };
  }, [roomCode, token]);

  const disconnect = useCallback(() => {
    isManuallyClosedRef.current = true;
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  const send = useCallback((type: string, data: any = {}) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, data }));
    } else {
      console.warn("Cannot send message: WebSocket is not connected.");
    }
  }, []);

  useEffect(() => {
    if (autoConnect && roomCode && token) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [autoConnect, roomCode, token, connect, disconnect]);

  return { isConnected, isConnecting, send, connect, disconnect };
}
