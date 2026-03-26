import { useEffect, useState } from "react";
import { initClient } from "./nakama/socket";
import Game from "./pages/Game";
import Login from "./pages/Login";

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    initClient();
  }, []);

  if (!session) {
    return <Login onLogin={setSession} />;
  }

  return <Game />;
}

export default App;
