import { useState } from "react";
import { createMatch, joinInMatch } from "../nakama/match";

const Lobby = ({ username, onMatchFound }) => {
  const [roomInput, setRoomInput] = useState("");
  const [loading, setLoading] = useState("");
  // CREATE MATCH
  const handleCreate = async () => {
    try {
      setLoading(true);

      const data = await createMatch();

      console.log("🎯 Created:", data);

      onMatchFound(data);
    } catch (err) {
      console.error("❌ Create failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // JOIN MATCH
  const handleJoin = async () => {
    try {
      setLoading(true);

      await joinInMatch(roomInput);

      onMatchFound(roomInput);
    } catch (err) {
      console.error("❌ Join failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center 
      bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6 text-white drop-shadow-lg">
          🎮 Tic Tac Toe
        </h1>

        <div className="inline-block px-6 py-2 rounded-full 
                bg-gradient-to-r from-purple-600 to-blue-500 
                text-white font-semibold 
                shadow-lg border border-white/20 
                transition-all duration-300
                hover:scale-105 hover:shadow-purple-500/50">
          👤 {username}
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg border border-white/20 
        rounded-2xl shadow-xl p-6 w-full max-w-md">

        {/* CREATE */}
        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 py-2 rounded-lg font-semibold mb-4"
        >
          {loading ? "Creating..." : "➕ Create Match"}
        </button>

        {/* DIVIDER */}
        <div className="border-t border-white/20 my-4"></div>

        {/* JOIN */}
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomInput}
          onChange={(e) => setRoomInput(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/20 
          text-white placeholder-gray-400 mb-3"
        />

        <button
          onClick={handleJoin}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 py-2 rounded-lg font-semibold"
        >
          {loading ? "Joining..." : "🔗 Join Match"}
        </button>
      </div>
    </div>
  );
};

export default Lobby;
