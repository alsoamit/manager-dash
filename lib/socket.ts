// lib/socket.ts
import { io, Socket } from "socket.io-client";

// point this to your API/socket server
const URL = process.env.NEXT_PUBLIC_API_URL;

if (!URL) {
  console.error(
    "[socket] NEXT_PUBLIC_API_URL is not set. Socket will not connect."
  );
}

const socket: Socket = io(URL || "http://localhost:8080", {
  transports: ["websocket"],
  autoConnect: false, // Don't auto-connect, we'll connect when needed
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

// Log connection events for debugging
socket.on("connect", () => {
  console.log("[socket] Connected", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("[socket] Disconnected", reason);
});

socket.on("connect_error", (error) => {
  console.error("[socket] Connection error", error);
});

export default socket;
