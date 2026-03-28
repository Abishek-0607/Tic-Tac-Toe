const Leaderboard = ({ leaderboard = [], myUserId }) => {
  if (!leaderboard.length) return null;

  return (
    <div className="w-full max-w-md mx-auto mt-6">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 text-white shadow-lg">

        <h2 className="text-xl font-bold mb-4 text-center">
          🏆 Leaderboard
        </h2>

        {leaderboard.map((player, index) => (
          <div
            key={index}
            className={`flex justify-between items-center py-2 border-b border-white/10 ${
              player.ownerId === myUserId
                ? "text-yellow-300 font-bold"
                : ""
            }`}
          >
            <span className="font-semibold">
              #{index + 1} {player.username || "Unknown"}
            </span>

            <span className="text-green-300 font-bold">
              {player.score} wins
            </span>
          </div>
        ))}

      </div>
    </div>
  );
};

export default Leaderboard;
