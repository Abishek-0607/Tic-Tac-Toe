/// <reference path="../node_modules/nakama-runtime/index.d.ts" />
function matchInit(ctx, logger, nk, params) {
    logger.info("🔥 matchInit triggered");
    const state = {
        board: Array(9).fill(null),
        players: [],
        turn: 0,
        winner: null
    };
    logger.info("🧠 Initial state: " + JSON.stringify(state));
    return {
        state: state,
        tickRate: 1,
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
    presences.forEach((p) => {
        logger.info("➕ Adding player: " + p.userId);
        if (!state.players.includes(p.userId)) {
            state.players.push(p.userId);
        }
    });
    logger.info("👥 Current players: " + JSON.stringify(state.players));
    dispatcher.broadcastMessage(1, nk.stringToBinary(JSON.stringify(state)));
    logger.info("📤 Initial state broadcasted");
    return { state };
}
function matchLeave(ctx, logger, nk, dispatcher, tick, state, presences) {
    logger.info("🚪 matchLeave triggered");
    presences.forEach((p) => {
        logger.info("➖ Removing player: " + p.userId);
        state.players = state.players.filter(id => id !== p.userId);
    });
    logger.info("👥 Remaining players: " + JSON.stringify(state.players));
    return { state };
}
// ✅ WIN CHECK
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
    logger.info("🔁 matchLoop tick: " + tick);
    logger.info("📩 Messages received: " + messages.length);
    if (messages.length === 0) {
        return { state };
    }
    messages.forEach((msg) => {
        try {
            const raw = nk.binaryToString(msg.data);
            logger.info("📥 Raw message: " + raw);
            const data = JSON.parse(raw);
            const index = data.index;
            logger.info("🎯 Move index: " + index);
            logger.info("👤 Sender: " + msg.sender.userId);
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
            const playerIndex = state.players.indexOf(msg.sender.userId);
            logger.info("👤 Player index: " + playerIndex);
            logger.info("🔄 Current turn: " + state.turn);
            if (playerIndex === -1) {
                logger.info("❌ Unknown player");
                return;
            }
            if (playerIndex !== state.turn) {
                logger.info("⛔ Not player's turn");
                return;
            }
            const symbol = playerIndex === 0 ? "X" : "O";
            logger.info("✏️ Assigning symbol: " + symbol);
            state.board[index] = symbol;
            logger.info("🧩 Board after move: " + JSON.stringify(state.board));
            const winner = checkWinner(state.board);
            if (winner) {
                state.winner = winner;
                logger.info("🏆 Winner: " + winner);
            }
            else if (!state.board.includes(null)) {
                state.winner = "DRAW";
                logger.info("🤝 Draw detected");
            }
            else {
                state.turn = 1 - state.turn;
                logger.info("🔄 Next turn: " + state.turn);
            }
        }
        catch (err) {
            logger.error("❌ Error processing move: " + err);
        }
    });
    dispatcher.broadcastMessage(1, nk.stringToBinary(JSON.stringify(state)));
    logger.info("📤 Broadcasting state: " + JSON.stringify(state));
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
}
globalThis.InitModule = InitModule;
