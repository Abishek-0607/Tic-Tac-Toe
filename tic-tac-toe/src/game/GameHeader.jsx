const GameHeader = ({ players = [], turn = 0, winner, myUserId }) => {
  const player1 = players[0];
  const player2 = players[1];

  const isMyTurn = players[turn]?.userId === myUserId;

    return (
    <div className="w-full max-w-md mx-auto mb-6">
      
      {/* 🔥 Glass + Neon Card */}
      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-5 text-white overflow-hidden">

        {/* 🌈 Animated Glow Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-2xl opacity-30 animate-pulse"></div>

        {/* Content Wrapper */}
        <div className="relative z-10">

          {/* Title */}
          <h2 className="text-2xl font-bold mb-2 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400">
            Tic Tac Toe
          </h2>

          {/* ⚔️ Players */}
          <div className="flex justify-between items-center mt-4 text-sm sm:text-base">

            {/* Player 1 */}
            <div className="flex-1 text-left">
              <p className="font-semibold text-cyan-300">
                {player1?.username || "Waiting..."}
                {player1?.userId === myUserId || "(You)"}
              </p>
              <span className="text-xs opacity-70">(X)</span>
            </div>

            {/* VS */}
            <div className="px-2 text-lg font-bold opacity-70 animate-pulse">
              ⚡
            </div>

            {/* Player 2 */}
            <div className="flex-1 text-right">
              <p className="font-semibold text-pink-300">
                {player2?.username || "Waiting..."}
                {player1?.userId === myUserId || "(You)"}
              </p>
              <span className="text-xs opacity-70">(O)</span>
            </div>
          </div>

          {/* 🎯 Turn Indicator */}
          {!winner && (
            <div
              className={`mt-5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border ${
                isMyTurn
                  ? "bg-green-500/20 text-green-300 border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.6)]"
                  : "bg-yellow-500/20 text-yellow-300 border-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.6)]"
              }`}
            >
              {isMyTurn ? "🟢 Your Turn" : "⏳ Opponent Turn"}
            </div>
          )}

          {/* 🏆 Winner */}
          {winner && (
            <div className="mt-5 px-4 py-3 rounded-lg bg-purple-500/20 border border-purple-400 text-purple-200 font-semibold animate-pulse shadow-[0_0_12px_rgba(168,85,247,0.7)]">
              {winner === "DRAW"
                ? "🤝 It's a Draw!"
                : `🏆 Winner: ${
                    players.find(
                      (p, i) => (i === 0 ? "X" : "O") === winner
                    )?.username || winner
                  }`}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default GameHeader;
