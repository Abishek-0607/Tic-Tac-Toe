import { Client, Session } from "@heroiclabs/nakama-js";

let client = null;
let socket = null;
let session = null;

// Initialize client ONCE
export const initClient = () => {
  if (!client) {
    client = new Client("defaultkey", "localhost", "7350", false);
    console.log("✅ Client initialized");
  }
  return client;
};

// Save session to localStorage
export const saveSession = (sessionData) => {
  // Store the raw session data (token, refresh_token, etc.)
  const sessionToStore = {
    token: sessionData.token,
    refresh_token: sessionData.refresh_token,
    created_at: sessionData.created_at,
    expires_at: sessionData.expires_at,
    refresh_expires_at: sessionData.refresh_expires_at,
    user_id: sessionData.user_id,
    username: sessionData.username,
  };
  
  localStorage.setItem("nakamaSession", JSON.stringify(sessionToStore));
  console.log("💾 Session saved");
};

// Clear session from localStorage
export const clearSession = () => {
  localStorage.removeItem("nakamaSession");
  session = null;
  socket = null;
  console.log("🗑️ Session cleared");
};

// Restore session from localStorage
export const restoreSession = () => {
  const stored = localStorage.getItem("nakamaSession");
  
  if (!stored) {
    console.log("⚠️ No stored session found");
    return null;
  }

  try {
    const parsed = JSON.parse(stored);
    const restoredSession = Session.restore(
      parsed.token,
      parsed.refresh_token
    );

    // Check if expired
    const currentTime = Date.now() / 1000;
    if (restoredSession.isexpired(currentTime)) {
      console.warn("⚠️ Session expired");
      clearSession();
      return null;
    }

    console.log("✅ Session restored for:", restoredSession.user_id);
    session = restoredSession;
    return restoredSession;
  } catch (err) {
    console.error("❌ Failed to restore session:", err);
    clearSession();
    return null;
  }
};

// Get current session (sync)
export const getSession = () => {
  if (session) return session;
  
  // Try to restore from localStorage
  return restoreSession();
};

// Connect socket with session
export const connectSocket = async (userSession) => {
  if (!client) {
    initClient();
  }

  session = userSession;

  if (socket && socket.isConnected) {
    console.log("✅ Socket already connected");
    return socket;
  }

  try {
    socket = client.createSocket();
    await socket.connect(session, true);
    console.log("✅ Socket connected for:", session.user_id);
    return socket;
  } catch (err) {
    console.error("❌ Socket connection failed:", err);
    throw err;
  }
};

// Get socket (creates if needed)
export const getSocket = () => {
  if (!socket) {
    console.error("❌ Socket not initialized. Call connectSocket first.");
    return null;
  }
  return socket;
};

// Get client
export const getClient = () => {
  if (!client) {
    initClient();
  }
  return client;
};

// Get user ID
export const getUserId = () => {
  const currentSession = getSession();
  return currentSession?.user_id || null;
};

// Get username
export const getUsername = () => {
  const currentSession = getSession();
  return currentSession?.username || "Player";
};

// Disconnect and cleanup
export const disconnect = async () => {
  if (socket) {
    try {
      await socket.disconnect();
      console.log("🔌 Socket disconnected");
    } catch (err) {
      console.error("❌ Disconnect error:", err);
    }
  }
  
  clearSession();
};
