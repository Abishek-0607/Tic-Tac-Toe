import { useState } from "react";
import { startMatchmaking, cancelMatchmaking } from "../nakama/matchmaker";

export default function Matchmaking({ onMatchFound, username }) {
  const [searching, setSearching] = useState(false);

    const handleSearch = async () => {
        setSearching(true);

        await startMatchmaking((matchId) => {
            setSearching(false);
            onMatchFound(matchId);
        });
    }

    const handleCancel = async () => {
        setSearching(false);
        await cancelMatchmaking();
    };

    return (
    <div className="matchmaking-container">
        
        {/* Animated Grid Background */}
        <div className="grid-bg"></div>

        {/* Main Card */}
        <div className="card">
        
        {/* Title */}
        <h1 className="title">🎮 Tic Tac Toe</h1>

        {/* User */}
        <p className="user">
            Logged in as <span>{username}</span>
        </p>

        {!searching ? (
            <>
            <h2 className="heading">Find an Opponent</h2>

            <button className="btn green" onClick={handleSearch}>
                🔍 Find Match
            </button>
            </>
        ) : (
            <>
            <h2 className="heading">Searching for players...</h2>

            {/* Animated Loader */}
            <div className="loader">
                <div></div>
                <div></div>
                <div></div>
            </div>

            <button className="btn red" onClick={handleCancel}>
                ❌ Cancel
            </button>
            </>
        )}
        </div>

        {/* Styles */}
        <style>{`
        .matchmaking-container {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #1e293b, #0f172a);
            overflow: hidden;
            position: relative;
            padding: 16px;
        }

        /* Animated grid */
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

        .card {
            position: relative;
            z-index: 2;
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(15px);
            padding: 35px 25px;
            border-radius: 20px;
            width: 100%;
            max-width: 360px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }

        .title {
            font-size: 28px;
            font-weight: bold;
            color: #fff;
            margin-bottom: 5px;
        }

        .user {
            font-size: 13px;
            color: #cbd5f5;
            margin-bottom: 20px;
        }

        .user span {
            color: #22c55e;
            font-weight: 600;
        }

        .heading {
            font-size: 16px;
            margin-bottom: 20px;
            color: #e2e8f0;
        }

        .btn {
            width: 100%;
            padding: 12px;
            border-radius: 10px;
            border: none;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .btn.green {
            background: linear-gradient(135deg, #22c55e, #16a34a);
            color: white;
        }

        .btn.green:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(34,197,94,0.4);
        }

        .btn.red {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
        }

        .btn.red:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(239,68,68,0.4);
        }

        /* Loader animation (3 dots like thinking players) */
        .loader {
            display: flex;
            justify-content: center;
            gap: 8px;
            margin-bottom: 20px;
        }

        .loader div {
            width: 10px;
            height: 10px;
            background: #22c55e;
            border-radius: 50%;
            animation: bounce 1.2s infinite ease-in-out;
        }

        .loader div:nth-child(2) {
            animation-delay: 0.2s;
        }

        .loader div:nth-child(3) {
            animation-delay: 0.4s;
        }

        @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }

        /* Mobile */
        @media (max-width: 480px) {
            .card {
            padding: 25px 18px;
            }

            .title {
            font-size: 24px;
            }
        }
        `}</style>
    </div>
    );
}
