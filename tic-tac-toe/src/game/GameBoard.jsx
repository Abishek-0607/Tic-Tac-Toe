import { useGame } from "./useGame";

const GameBoard = () => {
  const { board, makeMove, matchId } = useGame();

  if (!matchId) {
    return <div>Loading match...</div>;
  }

  return (
    <div>
      <h2>Match ID: {matchId}</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 50px)" }}>
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => makeMove(index)}
            style={{ height: "50px", fontSize: "20px" }}
          >
            {cell}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
