import { getClient, getSession } from "./socket";

export const fetchLeaderboard = async () => {
  const client = getClient();
  const session = getSession();

  if (!client || !session) {
    console.error("❌ Missing client/session");
    return [];
  }

  try {
    const result = await client.listLeaderboardRecords(
      session,
      "global_leaderboard",
      null,
      10 // top 10 players
    );

    console.log("🏆 Leaderboard:", result.records);

    return result.records;
  } catch (err) {
    console.error("❌ Leaderboard fetch failed:", err);
    return [];
  }
};
