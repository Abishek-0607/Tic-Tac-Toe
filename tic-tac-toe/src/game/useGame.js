import { useEffect, useState, useRef } from "react";
import { getSocket, getUserId } from "../nakama/socket";
import { listenToMatch, sendMove, setPresences } from "../nakama/match";
import { fetchLeaderboard } from "../nakama/leaderboard";

const useGame = (matchId) => {
  const [gameState, setGameState] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const myUserId = getUserId();
  const setupDone = useRef(false);
  
  // Extract string if object is passed
  const actualMatchId = typeof matchId === 'object' ? matchId?.matchId : matchId;

  useEffect(() => {
    // Reset setupDone when matchId changes
    setupDone.current = false;
  }, [actualMatchId]);

  useEffect(() => {
    if (!actualMatchId || setupDone.current) {
      console.log("⏩ Skipping setup");
      return;
    }

    const socket = getSocket();
    if (!socket) {
      console.error("❌ Socket missing");
      return;
    }

    console.log("🔧 Setting up game for match:", actualMatchId);
    setupDone.current = true;

    listenToMatch(socket, (state) => {
      console.log("🔥 State Updated:", state);
      setGameState(state);
      
      if (state.players) {
        console.log("👥 Players in game:", state.players);
      }
    });

    socket.onmatchpresence = (presences) => {
      console.log("👥 Presence update:", presences);
      
      if (presences.joins && presences.joins.length > 0) {
        console.log("➕ Players joined:", presences.joins.length);
        setPresences(presences.joins);
      }
      
      if (presences.leaves && presences.leaves.length > 0) {
        console.log("➖ Players left:", presences.leaves.length);
      }
    };

    return () => {
      console.log("🧹 Cleaning up listeners only");
      socket.onmatchdata = () => {};
      socket.onmatchpresence = () => {};
    };
  }, [actualMatchId]);

  useEffect(() => {
    if (gameState?.winner) {
      console.log("🏆 Game ended → fetching leaderboard");
      fetchLeaderboard().then((data) => {
        setLeaderboard(data);
      });
    }
  }, [gameState?.winner]);

  const makeMove = async (index) => {
    const socket = getSocket();

    if (!socket || !actualMatchId) {
      console.log("⏳ Match not ready");
      return;
    }

    if (!gameState) {
      console.log("⏳ Game state not loaded");
      return;
    }

    sendMove(socket, actualMatchId, index);
  };

  return {
    gameState,
    makeMove,
    matchId: actualMatchId,
    myUserId,
    leaderboard
  };
};

export default useGame;
