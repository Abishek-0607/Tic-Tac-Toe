import { getClient } from "./socket";
import { initClient } from "./socket";
export const loginOrRegister = async (email, password) => {
  let client = getClient();

  // Initialize if existing client null
  if (!client) {
    console.log("⚠️ Client not initialized. Initializing now...");
    initClient();
    client = getClient();
  }

  try {
    // Try login
    const session = await client.authenticateEmail(email, password);
    console.log("Logged in:", session);
    localStorage.setItem("session", JSON.stringify(session));
    return session;
  } catch (err) {
    console.log("⚠️ User not found, creating...");

    // Register + login
    const session = await client.authenticateEmail(
      email,
      password,
      true // create user if not exists
    );

    console.log("✅ Registered & logged in:", session);
    // SAVE SESSION
    localStorage.setItem("session", JSON.stringify(session));
    return session;
  }
};
