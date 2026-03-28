import { getSocket } from "./socket";

let ticket = null;
let presenceTimeout = null;

export const startMatchmaking = async (onMatchFound) => {
  const socket = await getSocket();

  if (!socket) {
    console.error("❌ Socket not connected");
    return;
  }

  console.log("🔍 Starting matchmaking...");

  const res = await socket.addMatchmaker("*", 2, 2);
  ticket = res.ticket;

  socket.onmatchmakermatched = async (matched) => {
    console.log("🎯 Match found:", matched);

    const myUserId = matched.self.presence.user_id;

    let match;
    try {
      match = await socket.joinMatch(matched.match_id);
    } catch (err) {
      console.error("❌ Join failed:", err);
      return;
    }

    console.log("✅ Joined match:", match);

    if (!match || !match.match_id) return;

    if (match.presences?.length >= 2) {
      console.log("🎮 Both players ready!");
      onMatchFound(match.match_id);
      return;
    }

    console.log("⏳ Waiting for opponent...");

    const originalHandler = socket.onmatchpresence;

    socket.onmatchpresence = (presences) => {
      console.log("📥 Presence update:", presences);

       if (originalHandler) {
        originalHandler.call(socket, presences);
      }

      if (presences.joins?.length > 0) {
        const opponentJoined = presences.joins.some(
          (join) => join.user_id !== myUserId
        );

        if (opponentJoined) {
          console.log("👥 Opponent joined!");

          clearTimeout(presenceTimeout);
          presenceTimeout = null;

          socket.onmatchpresence = originalHandler || null;

          onMatchFound(match.match_id);
        }
      }
    };

    presenceTimeout = setTimeout(async () => {
      console.log("⏱️ Restarting matchmaking...");

      socket.onmatchpresence = originalHandler || null;

      await socket.leaveMatch(match.match_id);

      await cancelMatchmaking(); // ✅ FIX
      startMatchmaking(onMatchFound);
    }, 10000);
  };
};

export const cancelMatchmaking = async () => {
  const socket = await getSocket();

  if (presenceTimeout) {
    clearTimeout(presenceTimeout);
    presenceTimeout = null;
  }

  if (ticket && socket) {
    try {
      await socket.removeMatchmaker(ticket);
    } catch (err) {
      console.warn("⚠️ Ticket already removed");
    }
  }
  ticket = null;
};
