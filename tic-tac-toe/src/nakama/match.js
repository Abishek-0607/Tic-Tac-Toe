import { getSocket } from "./socket";

let currentPresences = [];
let matchDataHandler = null; // Store handler to prevent duplicates

export const setPresences = (presences) => {
  currentPresences = presences;
  console.log("👥 Presences updated:", presences);
};

export const createMatch = async () => {
  const socket = getSocket();
  if (!socket) {
    console.error("❌ Socket not initialized");
    return null;
  }
  
  try {
    const response = await socket.rpc("create_match_rpc");
    const data = JSON.parse(response.payload);

    console.log("🎯 Match created:", data.matchId);
    
    const matchData = await socket.joinMatch(data.matchId);
    console.log("✅ Match joined:", matchData);
    
    return data.matchId; // Return just the matchId
  } catch (err) {
    console.error("❌ Match creation failed:", err);
    return null;
  }
};

export const joinInMatch = async (matchId) => {
  try {
    const socket = getSocket();
    const data = await socket.joinMatch(matchId);
    console.log("✅ Match Joined:", data);
    
    // Update presences when joining
    if (data.presences) {
      setPresences(data.presences);
    }
    
    return data;
  } catch (err) {
    console.error("❌ Join failed:", err);
    throw err;
  }
};

export const sendMove = async (socket, matchId, index) => {
  if (!socket || !matchId) {
    console.error("❌ Missing socket or matchId");
    return;
  }
  
  console.log("📤 Sending move:", index);
  
  socket.sendMatchState(
    matchId,
    1, // opcode
    new TextEncoder().encode(JSON.stringify({ index }))
    // Don't send presences - server handles broadcast
  );
};

export const listenToMatch = (socket, callback) => {
  console.log("👂 Setting up match listener");
  
  if (!socket) {
    console.error("❌ Socket not available");
    return;
  }

  // Prevent duplicate listeners
  if (matchDataHandler) {
    console.log("⚠️ Replacing existing match listener");
  }

  matchDataHandler = (msg) => {
    console.log("📩 Raw match data received:", msg);

    try {
      const decoded = new TextDecoder().decode(msg.data);
      const parsed = JSON.parse(decoded);

      console.log("✅ Parsed state:", parsed);
      callback(parsed);
    } catch (err) {
      console.error("❌ Failed to parse match data:", err);
    }
  };

  socket.onmatchdata = matchDataHandler;
  console.log("✅ Match listener attached");
};

// Cleanup function
export const cleanupMatchListener = (socket) => {
  if (socket) {
    socket.onmatchdata = () => {};
    matchDataHandler = null;
    console.log("🧹 Match listener cleaned up");
  }
};
