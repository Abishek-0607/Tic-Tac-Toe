import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Game from "./pages/Game";
import { useState, useEffect } from "react";
import Lobby from "./pages/Lobby";
import { getSession, initClient } from "./nakama/socket";
import { restoreSession, connectSocket } from "./nakama/socket";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!getSession());
  const [matchId, setMatchId] = useState(null);
  console.log(matchId);
  useEffect(() => {
    initClient();
    const existingSession = restoreSession();

    if (existingSession) {
      console.log("♻️ Restoring session...", existingSession);

      connectSocket(existingSession);
    }
  }, []);

  if(!isLoggedIn)
  {
    return(<Login onLogin={()=> setIsLoggedIn(true)} />)
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
