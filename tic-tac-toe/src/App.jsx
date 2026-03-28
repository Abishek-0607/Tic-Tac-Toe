import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Game from "./pages/Game";
import { useState, useEffect } from "react";
import { initClient, restoreSession, connectSocket, getSession } from "./nakama/socket";
import Lobby from "./pages/Lobby";
// import Matchmaking from "./pages/MatchMaking";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [matchId, setMatchId] = useState(null);

  // Initialize client and restore session on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize Nakama client
        initClient();

        // Try to restore session
        const restoredSession = restoreSession();

        if (restoredSession) {
          console.log("Session restored, reconnecting socket...");
          
          // Reconnect socket
          await connectSocket(restoredSession);
          
          setIsLoggedIn(true);
        } else {
          console.log("No valid session found");
        }
      } catch (err) {
        console.error("Initialization failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  const handleLogin = async (session) => {
    try {
      console.log("🎮 Login successful, connecting socket...");
      
      // Connect socket with the new session
      await connectSocket(session);
      
      setIsLoggedIn(true);
      
    } catch (error) {
      console.error("❌ Post-login setup failed:", error);
    }
  };

  // Show loading screen while initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <div className="text-white text-2xl animate-pulse">Loading...</div>
      </div>
    );
  }

  // Show login if not logged in
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div>
      {/* Global Toaster */}
      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
            borderRadius: "10px",
          },
        }}
      />

      {!matchId ? (
        <Lobby
            username={getSession()?.username || "Player"}
            onMatchFound={(id) => setMatchId(id)}
          />
        ) : (
          <Game matchId={matchId} />
        )
      }
    </div>
  );
}

export default App;
