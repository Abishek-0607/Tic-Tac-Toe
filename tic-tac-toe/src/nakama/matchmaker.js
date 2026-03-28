import { getSocket } from "./socket";

let ticket = null;
let presenceTimeout = null;

export const startMatchmaking = async (onMatchFound) => {
  const socket = getSocket();

  if (!socket) {
    console.error("❌ Socket not ready");
    return;
  }

  console.log("🔍 Starting matchmaking...");

  const res = await socket.addMatchmaker("*", 2, 2);
  ticket = res.ticket;

  socket.onmatchmakermatched = async (matched) => {
    console.log("🎯 Match found:", matched);

    // Determine if we're the host (first user in the list)
    const isHost = matched.self.presence.user_id === matched.users[0].presence.user_id;
    const myUserId = matched.self.presence.user_id;
    
    console.log(`👤 Role: ${isHost ? 'HOST' : 'CLIENT'}`);
    console.log(`🆔 My user ID: ${myUserId}`);

    // Small delay for non-host to let host create the match first
    if (!isHost) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const match = await socket.joinMatch(matched.match_id);

    console.log("✅ Joined match:", match);
    console.log("👥 Players in match:", match.presences?.length || 0);

    if (!match || !match.match_id) {
      console.error("❌ Invalid match join");
      return;
    }

    // If already 2 players, start immediately
    if (match.presences && match.presences.length >= 2) {
      console.log("🎮 Both players ready!");
      onMatchFound(match.match_id);
      return;
    }

    // Otherwise wait for the other player
    console.log("⏳ Waiting for opponent...");
    
    const originalHandler = socket.onmatchpresence;
    
    socket.onmatchpresence = (presences) => {
      console.log("📥 Presence update:", presences);
      
      if (presences.joins && presences.joins.length > 0) {
        // Check if the joining user is NOT ourselves
        const opponentJoined = presences.joins.some(join => join.user_id !== myUserId);
        
        if (opponentJoined) {
          console.log("👥 Opponent actually joined!");
          
          if (presenceTimeout) {
            clearTimeout(presenceTimeout);
            presenceTimeout = null;
          }
          
          socket.onmatchpresence = originalHandler || (() => {});
          onMatchFound(match.match_id);
        } else {
          console.log("ℹ️ That was just me joining, still waiting...");
        }
      }
    };

    // Timeout fallback
    presenceTimeout = setTimeout(() => {
      console.log("⏱️ Opponent didn't join - restarting matchmaking");
      socket.onmatchpresence = originalHandler || (() => {});
      socket.leaveMatch(match.match_id);
      startMatchmaking(onMatchFound);
    }, 8000);
  };
};

export const cancelMatchmaking = async () => {
  const socket = getSocket();

  if (presenceTimeout) {
    clearTimeout(presenceTimeout);
    presenceTimeout = null;
  }

  if (ticket && socket) {
    await socket.removeMatchmaker(ticket);
    console.log("❌ Matchmaking cancelled");
  }
};
