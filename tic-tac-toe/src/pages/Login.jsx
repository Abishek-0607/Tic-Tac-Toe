import { useState } from "react";
import {toast} from "react-hot-toast";
import { loginOrRegister } from "../nakama/auth";
import { connectSocket, saveSession } from "../nakama/socket";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      const session = await loginOrRegister(email, password);
      
      toast.success("Login successful!");
      onLogin(session);
    } catch (err) {
      toast.error("❌ Login failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-container">
      {/* Background Grid */}
      <div className="grid-bg"></div>

      <div className="login-card">
        <h1 className="title">🎮 Tic Tac Toe</h1>
        <p className="subtitle">Multiplayer Game</p>

        <input
          className="input"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="input"
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="login-btn"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Connecting..." : "Play Now"}
        </button>
      </div>

      {/* Styles */}
      <style>{`
        .login-container {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #1e293b, #0f172a);
        }

        /* Animated grid background */
        .grid-bg {
          position: absolute;
          width: 200%;
          height: 200%;
          background-image: 
            linear-gradient(#ffffff10 1px, transparent 1px),
            linear-gradient(90deg, #ffffff10 1px, transparent 1px);
          background-size: 40px 40px;
          animation: moveGrid 10s linear infinite;
        }

        @keyframes moveGrid {
          from { transform: translate(0, 0); }
          to { transform: translate(-40px, -40px); }
        }

        .login-card {
          position: relative;
          z-index: 2;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(15px);
          padding: 40px 30px;
          border-radius: 20px;
          width: 90%;
          max-width: 350px;
          text-align: center;
          box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        }

        .title {
          font-size: 28px;
          color: #fff;
          margin-bottom: 5px;
        }

        .subtitle {
          color: #cbd5f5;
          margin-bottom: 25px;
          font-size: 14px;
        }

        .input {
          width: 100%;
          padding: 12px;
          margin-bottom: 15px;
          border-radius: 10px;
          border: none;
          outline: none;
          background: rgba(255,255,255,0.1);
          color: #fff;
        }

        .input::placeholder {
          color: #cbd5f5;
        }

        .login-btn {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-weight: bold;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(34,197,94,0.4);
        }

        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Mobile responsiveness */
        @media (max-width: 480px) {
          .login-card {
            padding: 30px 20px;
          }

          .title {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}
