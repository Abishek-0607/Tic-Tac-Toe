import { getClient, saveSession, connectSocket } from "./socket";

export const loginOrRegister = async (email, password) => {
  const client = getClient();

  try {
    // Try login first
    console.log("🔐 Attempting login...");
    const session = await client.authenticateEmail(email, password, false);
    
    console.log("✅ Login successful:", session);
    
    // Save session
    saveSession(session);
    
    // Connect socket
    await connectSocket(session);
    
    return session;
  } catch (loginError) {
    // If login fails, try registration
    console.log("📝 Login failed, attempting registration...");
    
    try {
      const session = await client.authenticateEmail(email, password, true);
      
      console.log("✅ Registration successful:", session);
      
      // Save session
      saveSession(session);
      
      // Connect socket
      await connectSocket(session);
      
      return session;
    } catch (registerError) {
      console.error("❌ Registration failed:", registerError);
      throw registerError;
    }
  }
};
