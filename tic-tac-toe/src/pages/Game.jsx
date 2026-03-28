import GameBoard from "../game/GameBoard";
import GameHeader from "../game/GameHeader";
import useGame from "../game/useGame";

const Game = (matchId) => {
  const { gameState, makeMove, myUserId, leaderboard } = useGame(matchId);
  
  if (!gameState || gameState.players?.length < 2) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center 
        bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white">

        <h2 className="text-xl mb-4">
          ⏳ Waiting for opponent...
        </h2>

        <p className="text-sm opacity-70">Room ID:</p>
        <p className="font-mono bg-black/30 px-3 py-2 rounded mt-2">
          {matchId.matchId}
        </p>
      </div>
    );
  }
  console.log(gameState, matchId);
  const board = gameState?.board;
  const players = gameState?.players;
  const turn = gameState?.turn;
  const winner = gameState?.winner;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black px-4">
      <GameHeader
        players={players}
        turn={turn}
        winner={winner}
        myUserId={myUserId}
      />

      <GameBoard
        board={board}
        onCellClick={makeMove}
        disabled={!!winner}
        myUserId={myUserId}
        leaderboard={leaderboard}
        winner={winner}
        gameState={gameState}
      />
    </div>
  );
}

export default Game;
