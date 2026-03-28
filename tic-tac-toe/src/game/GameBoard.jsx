import Leaderboard from "./Leaderboard";
import Timer from "./Timer";

const GameBoard = ({ board = [], onCellClick, disabled, myUserId, leaderboard, winner, gameState }) => {
  
  const isMyTurn = () => {
    if (!gameState?.players || gameState.winner) return false;
    const myPlayerIndex = gameState.players.findIndex(p => p.userId === myUserId);
    return myPlayerIndex === gameState.turn;
  };

  // Check if game ended by timeout - look for TIMEOUT marker in board
  const isTimeoutWin = board && board.includes("TIMEOUT");

  const isWinner = () => {
    console.log(winner, gameState?.players);
    if (!winner || winner === "DRAW" || !gameState?.players) return false;
    
    const myPlayerIndex = gameState.players.findIndex(p => p.userId === myUserId);
    
    if (isTimeoutWin) {
      const winnerSymbol = winner;
      const winnerPlayerIndex = winnerSymbol === "X" ? 0 : 1;
      console.log(winnerPlayerIndex, winnerSymbol, myPlayerIndex === winnerPlayerIndex);
      return myPlayerIndex === winnerPlayerIndex;
    }
    
    // Normal win condition
    const winnerSymbol = winner;
    const winnerPlayerIndex = winnerSymbol === "X" ? 0 : 1;
    
    console.log("My Index:", myPlayerIndex, "Winner Index:", winnerPlayerIndex, "Winner Symbol:", winnerSymbol);
    
    return myPlayerIndex === winnerPlayerIndex;
  };

  const isDraw = winner === "DRAW";
  const userWon = isWinner();
  const userLost = winner && !isDraw && !userWon;

  console.log("Winner:", winner, "User Won:", userWon, "User Lost:", userLost, "Is Draw:", isDraw, "Is Timeout:", isTimeoutWin);

  return (
    <div className="w-full flex flex-col items-center mt-6 relative">
      
      {/* Timer - Show only when game is active */}
      {!winner && gameState?.turnStartTime && gameState.turnStartTime > 0 && (
        <Timer 
          turnStartTime={gameState.turnStartTime}
          turnTimeLimit={gameState.turnTimeLimit || 30}
          isMyTurn={isMyTurn()}
        />
      )}

      {/* Debug Info - Remove this after testing */}
      {!winner && gameState && (
        <div className="text-white text-sm mb-2">
          Turn: {gameState.turn} | Time Limit: {gameState.turnTimeLimit || 'Not set'}
        </div>
      )}

      {/* Game Board */}
      <div className={`grid grid-cols-3 gap-3 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl ${winner ? 'opacity-30' : ''}`}>
        {board.map((cell, index) => {
          const isX = cell === "X";
          const isO = cell === "O";
          const isTimeout = cell === "TIMEOUT";

          return (
            <button
              key={index}
              disabled={disabled || cell !== null}
              onClick={() => onCellClick(index)}
              className={`
                w-20 h-20 sm:w-24 sm:h-24
                flex items-center justify-center
                text-2xl sm:text-3xl font-bold
                rounded-xl
                transition-all duration-200
                border border-white/20
                
                ${cell === null
                  ? "bg-white/5 hover:bg-white/20 hover:scale-105 cursor-pointer"
                  : "bg-white/10 cursor-not-allowed"
                }

                ${isX ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" : ""}
                ${isO ? "text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]" : ""}
              `}
            >
              {!isTimeout ? cell : ""}
            </button>
          );
        })}
      </div>

      {/* Full Page Winner/Loser Overlay */}
      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg animate-fadeIn">
          <div className="w-full max-w-2xl mx-4 bg-gradient-to-br from-purple-900/90 to-indigo-900/90 rounded-3xl border border-white/20 shadow-2xl p-8 animate-slideUp">
            
            {/* Result Header */}
            <div className="text-center mb-8">
              {userWon && (
                <>
                  <div className="text-7xl mb-4 animate-bounce">🏆</div>
                  <h1 className="text-5xl font-bold text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)] mb-2">
                    YOU WON!
                  </h1>
                  {isTimeoutWin ? (
                    <p className="text-2xl text-cyan-400 font-semibold">
                      ⏰ Opponent ran out of time!
                    </p>
                  ) : (
                    <p className="text-2xl text-cyan-400 font-semibold">
                      You played as <span className={winner === "X" ? "text-cyan-400" : "text-pink-400"}>{winner}</span>
                    </p>
                  )}
                </>
              )}

              {userLost && (
                <>
                  <div className="text-7xl mb-4">😔</div>
                  <h1 className="text-5xl font-bold text-red-400 drop-shadow-[0_0_20px_rgba(248,113,113,0.8)] mb-2">
                    YOU LOST
                  </h1>
                  {isTimeoutWin ? (
                    <p className="text-2xl text-white/70 font-semibold mb-4">
                      ⏰ You ran out of time!
                    </p>
                  ) : (
                    <>
                      <p className="text-2xl text-white/70 font-semibold mb-2">
                        Better luck next time!
                      </p>
                      <p className="text-xl text-pink-400">
                        Winner played as <span className={winner === "X" ? "text-cyan-400" : "text-pink-400"}>{winner}</span>
                      </p>
                    </>
                  )}
                </>
              )}

              {isDraw && (
                <>
                  <div className="text-7xl mb-4">🤝</div>
                  <h1 className="text-5xl font-bold text-blue-400 drop-shadow-[0_0_20px_rgba(96,165,250,0.8)] mb-2">
                    IT'S A DRAW!
                  </h1>
                  <p className="text-2xl text-white/70 font-semibold">
                    Well played both!
                  </p>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-8"></div>

            {/* Leaderboard */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-6 text-center drop-shadow-lg">
                🏆 Leaderboard
              </h2>
              <Leaderboard leaderboard={leaderboard} myUserId={myUserId} />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                🔄 Play Again
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                🚪 Exit to Lobby
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
