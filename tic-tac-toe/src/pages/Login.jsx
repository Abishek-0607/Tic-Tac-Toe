import { useState } from "react";
import { loginOrRegister } from "../nakama/auth";
import { connectSocket } from "../nakama/socket";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const session = await loginOrRegister(email, password);

    await connectSocket(session);

    onLogin(session);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Login</h2>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />

      <input
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />

      <button onClick={handleLogin}>Login / Register</button>
    </div>
  );
}
