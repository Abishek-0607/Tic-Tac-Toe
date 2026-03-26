// src/nakama/match.js

import { getClient, getSession, getSocket } from "./socket";

// ✅ no global matchId here anymore
let currentPresences = [];

export const setPresences = (presences) => {
  currentPresences = presences;
};

export const createMatch = async () => {
  const socket = getSocket();
  if (!socket) {
    console.error("❌ Socket not initialized");
    return null;
  }
  const response = await socket.rpc("create_match_rpc");

  const data = JSON.parse(response.payload);

  console.log("🎯 Authoritative Match:", data.matchId);

  return data.matchId; // return only
};

export const sendMove = async(socket, matchId, index) => {
  if (!socket || !matchId) {
    console.error("❌ Missing socket or matchId");
    return;
  }
  console.log("📤 Sending move:", index);
  socket.sendMatchState(
      matchId,
      1,
      new TextEncoder().encode(JSON.stringify({ index })),
      currentPresences,
      true
  );
};

export const listenToMatch = (socket, callback) => {
   console.log("👂 Attaching match listener");
  if (!socket) {
    console.error("❌ Socket not available");
    return;
  }
  
  socket.onmatchdata = (msg) => {
    console.log("📩 Raw match data:", msg);

    const decoded = new TextDecoder().decode(msg.data);
    const parsed = JSON.parse(decoded);

    console.log("✅ Parsed state:", parsed);

    // ✅ Only update if board exists
    if (parsed.board) {
      callback(parsed);
    } else {
      console.warn("⚠️ Invalid state received:", parsed);
    }
  };
};
