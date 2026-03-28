import { getClient, getSession } from "./socket";

export const fetchLeaderboard = async () => {
  const client = getClient();
  const session = getSession();

  if (!client || !session) {
    console.error("❌ Missing client/session");
    return [];
  }

  try {
    const res= await client.rpc(session, "get_leaderboard_with_stats", "");

    const result =
      typeof res.payload === "string"
        ? JSON.parse(res.payload)
        : res.payload;
    console.log("🏆 Leaderboard:", result);

    return result;
  } catch (err) {
    console.error("❌ Leaderboard fetch failed:", err);
    return [];
  }
};
