/// <reference path="../node_modules/nakama-runtime/index.d.ts" />
const LEADERBOARD_ID = "global_leaderboard";
function generateUsername() {
    const adjectives = ["Fast", "Cool", "Smart", "Brave", "Lucky"];
    const animals = ["Tiger", "Eagle", "Shark", "Lion", "Wolf"];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const number = Math.floor(Math.random() * 1000);
    return `${adj}${animal}${number}`;
}
function matchInit(ctx, logger, nk, params) {
    logger.info("🔥 matchInit triggered");
    const state = {
        board: Array(9).fill(null),
        players: [],
        turn: 0,
        winner: null,
        joinedCount: 0,
        turnStartTime: 0, // ← NEW
        turnTimeLimit: 30 // ← NEW: 30 seconds per turn
    };
    logger.info("🧠 Initial state: " + JSON.stringify(state));
    return {
        state: state,
        tickRate: 1, // ← Keep at 1 for per-second checks
        label: "tic-tac-toe"
    };
}
function matchJoinAttempt(ctx, logger, nk, dispatcher, tick, state, presence, metadata) {
    logger.info("👤 matchJoinAttempt: " + presence.userId);
    if (state.players.length >= 2) {
        logger.info("❌ Match full. Rejecting: " + presence.userId);
        return { state, accept: false, rejectMessage: "Match full" };
    }
    logger.info("✅ Accepting player: " + presence.userId);
    return { state, accept: true };
}
function matchJoin(ctx, logger, nk, dispatcher, tick, state, presences) {
    logger.info("👥 matchJoin triggered");
    presences.forEach(p => {
        let player = state.players.find(pl => pl.userId === p.userId);
        if (!player) {
            state.players.push({
                userId: p.userId,
                username: p.username
            });
            state.joinedCount += 1;
            logger.info("✅ New player added: " + p.username);
        }
        else if (!player.username) {
            player.username = p.username;
        }
    });
    logger.info("👥 Players: " + JSON.stringify(state.players));
    logger.info("👥 Joined count: " + state.joinedCount);
    if (state.joinedCount === 2) {
        logger.info("🚀 Both players joined → starting timer");
        state.turnStartTime = Math.floor(Date.now() / 1000); // ← NEW: Start timer
        dispatcher.broadcastMessage(1, nk.stringToBinary(JSON.stringify(state)));
    }
    return { state };
}
function matchLeave(ctx, logger, nk, dispatcher, tick, state, presences) {
    logger.info("🚪 matchLeave triggered");
    presences.forEach((p) => {
        logger.info("➖ Removing player: " + p.userId);
        state.players = state.players.filter(pl => pl.userId !== p.userId);
    });
    logger.info("👥 Remaining players: " + JSON.stringify(state.players));
    return { state };
}
// WIN CHECK
function checkWinner(board) {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    for (let [a, b, c] of lines) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}
function matchLoop(ctx, logger, nk, dispatcher, tick, state, messages) {
    // ← NEW: Check for timeout EVERY TICK (every second)
    if (state.joinedCount === 2 && !state.winner && state.turnStartTime > 0) {
        const currentTime = Math.floor(Date.now() / 1000);
        const elapsed = currentTime - state.turnStartTime;
        if (elapsed >= state.turnTimeLimit) {
            logger.info("⏰ TIME OUT! Player " + state.turn + " loses their turn");
            // Auto-forfeit: opponent wins
            const loserSymbol = state.turn === 0 ? "X" : "O";
            const winnerSymbol = state.turn === 0 ? "O" : "X";
            const winnerIndex = state.turn === 0 ? 1 : 0;
            state.winner = winnerSymbol;
            state.board[0] = "TIMEOUT"; // ← Mark as timeout win
            logger.info("🏆 Winner (by timeout): " + state.players[winnerIndex].username);
            // Update leaderboard
            nk.leaderboardRecordWrite(LEADERBOARD_ID, state.players[winnerIndex].userId, state.players[winnerIndex].username, 1, null, null);
            dispatcher.broadcastMessage(1, nk.stringToBinary(JSON.stringify(state)));
            return { state };
        }
    }
    if (messages.length === 0) {
        return { state };
    }
    messages.forEach((msg) => {
        try {
            const raw = nk.binaryToString(msg.data);
            logger.info("📥 Raw message: " + raw);
            const data = JSON.parse(raw);
            const index = data.index;
            if (state.winner) {
                logger.info("⛔ Game already finished");
                return;
            }
            if (index < 0 || index > 8) {
                logger.info("❌ Invalid index");
                return;
            }
            if (state.board[index] !== null) {
                logger.info("❌ Cell already filled");
                return;
            }
            const playerIndex = state.players.findIndex(pl => pl.userId === msg.sender.userId);
            if (playerIndex === -1) {
                logger.info("❌ Unknown player");
                return;
            }
            if (playerIndex !== state.turn) {
                logger.info("⛔ Not player's turn");
                return;
            }
            const symbol = playerIndex === 0 ? "X" : "O";
            state.board[index] = symbol;
            const winner = checkWinner(state.board);
            if (winner) {
                const winnerIndex = winner === "X" ? 0 : 1;
                const winnerPlayer = state.players[winnerIndex];
                state.winner = winner;
                logger.info("🏆 Winner: " + winnerPlayer.username);
                nk.leaderboardRecordWrite(LEADERBOARD_ID, winnerPlayer.userId, winnerPlayer.username, 1, null, null);
            }
            else if (!state.board.includes(null)) {
                state.winner = "DRAW";
                logger.info("🤝 Draw detected");
            }
            else {
                state.turn = 1 - state.turn;
                state.turnStartTime = Math.floor(Date.now() / 1000); // ← NEW: Reset timer for next turn
                logger.info("🔄 Next turn: " + state.turn + " | Timer reset");
            }
        }
        catch (err) {
            logger.error("❌ Error processing move: " + err);
        }
    });
    logger.info("📤 Broadcasting state");
    dispatcher.broadcastMessage(1, nk.stringToBinary(JSON.stringify(state)));
    return { state };
}
function matchTerminate(ctx, logger, nk, dispatcher, tick, state, graceSeconds) {
    logger.info("🛑 matchTerminate called. Grace: " + graceSeconds);
    return { state };
}
function matchSignal(ctx, logger, nk, dispatcher, tick, state, data) {
    logger.info("📡 matchSignal received: " + data);
    return { state, data };
}
function createMatchRpc(ctx, logger, nk) {
    const matchId = nk.matchCreate("match", {});
    logger.info("🔥 RPC created match: " + matchId);
    return JSON.stringify({ matchId });
}
function afterAuthenticate(ctx, logger, nk, data) {
    const userId = data.user_id;
    const account = nk.accountGetId(userId);
    // if username is empty or auto-generated → replace it
    if (!account.user.username || account.user.username.length < 3) {
        const newUsername = generateUsername();
        nk.accountUpdateId(userId, null, null, newUsername, null, null, null);
        logger.info("👤 Username generated: " + newUsername);
    }
    return data;
}
;
function createLeaderboard(nk, logger) {
    try {
        nk.leaderboardCreate(LEADERBOARD_ID, false, // authoritative
        "descending" /* nkruntime.SortOrder.DESCENDING */, // high score = more wins
        "best" /* nkruntime.Operator.BEST */, null, {});
        logger.info("🏆 Leaderboard created");
    }
    catch (err) {
        logger.info("⚠️ Leaderboard already exists");
    }
}
;
function matchmakerMatched(ctx, logger, nk, matchedUsers) {
    logger.info("🔥 Matchmaker matched!");
    const matchId = nk.matchCreate("match", {});
    logger.info("Created match: " + matchId);
    return matchId;
}
function InitModule(ctx, logger, nk, initializer) {
    logger.info("🔥 Match module loaded!");
    initializer.registerMatch("match", {
        matchInit: matchInit,
        matchJoinAttempt: matchJoinAttempt,
        matchJoin: matchJoin,
        matchLeave: matchLeave,
        matchLoop: matchLoop,
        matchTerminate: matchTerminate,
        matchSignal: matchSignal
    });
    initializer.registerRpc("create_match_rpc", createMatchRpc);
    initializer.registerAfterAuthenticateDevice(afterAuthenticate);
    initializer.registerAfterAuthenticateEmail(afterAuthenticate);
    initializer.registerMatchmakerMatched(matchmakerMatched);
    createLeaderboard(nk, logger);
}
globalThis.InitModule = InitModule;
