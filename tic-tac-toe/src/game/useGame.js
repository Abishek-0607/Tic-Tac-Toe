import { useEffect, useState } from "react";
import { 
  initClient, 
  connectSocket, 
  getSocket, 
  getClient 
} from "../nakama/socket";

export const useGame = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [matchId, setMatchId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setup = async () => {
      try {
        initClient();
        const client = getClient();

        // ✅ AUTH (use email/device as you implemented)
        const session = await client.authenticateDevice(
          crypto.randomUUID(),
          true
        );

        await connectSocket(session);
        const socket = getSocket();

        if (!socket) {
          console.error("❌ Socket missing");
          return;
        }

        // ✅ STEP 1: Check stored matchId
        let storedMatchId = localStorage.getItem("matchId");

        // ✅ STEP 2: Validate matchId
        if (storedMatchId) {
          try {
            console.log("🔄 Trying to join existing match:", storedMatchId);
            await socket.joinMatch(storedMatchId);
          } catch (err) {
            console.warn("⚠️ Old match invalid, creating new...");
            storedMatchId = null;
            localStorage.removeItem("matchId");
          }
        }

        // ✅ STEP 3: Create new match if needed
        if (!storedMatchId) {
          const match = await socket.createMatch("match");
          storedMatchId = match.match_id;

          console.log("🎯 New match created:", storedMatchId);

          await socket.joinMatch(storedMatchId);

          localStorage.setItem("matchId", storedMatchId);
        }

        setMatchId(storedMatchId);

        // ✅ STEP 4: Listen
        socket.onmatchdata = (msg) => {
          try {
            const decoded = new TextDecoder().decode(msg.data);
            const state = JSON.parse(decoded);

            console.log("🔥 Match update:", state);

            if (state.board) {
              setBoard([...state.board]);
            }

          } catch (err) {
            console.error("❌ Parse error:", err);
          }
        };

        setLoading(false);

      } catch (err) {
        console.error("❌ Setup failed:", err);
      }
    };

    setup();
  }, []);

  // ✅ SEND MOVE
  const makeMove = async (index) => {
    const socket = getSocket();

    if (!socket || !matchId) {
      console.log("⏳ Match not ready");
      return;
    }

    try {
      await socket.sendMatchState(
        matchId,
        1,
        new TextEncoder().encode(JSON.stringify({ index })),
        [],
        true
      );

    } catch (err) {
      console.error("❌ Send failed:", err);
    }
  };

  return {
    board,
    makeMove,
    matchId,
    loading
  };
};
