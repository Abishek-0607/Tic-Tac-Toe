import { getClient } from "./socket";

export const loginOrRegister = async (email, password) => {
  const client = getClient();

  try {
    // ✅ Try login
    const session = await client.authenticateEmail(email, password);
    console.log("✅ Logged in:", session);
    return session;
  } catch (err) {
    console.log("⚠️ User not found, creating...");

    // ✅ Register + login
    const session = await client.authenticateEmail(
      email,
      password,
      true // create user if not exists
    );

    console.log("✅ Registered & logged in:", session);
    return session;
  }
};
