/// <reference path="../node_modules/nakama-runtime/index.d.ts" />

const LEADERBOARD_ID = "global_leaderboard";

type Player = {
  userId: string;
  username: string;
};

type PlayerStats = {
  wins: number;
  losses: number;
  winStreak: number;
  bestStreak: number;
};

type GameState = {
  board: (string | null)[];
  players: Player[];
  turn: number;
  winner: string | null;
  joinedCount: number;
  turnStartTime: number;
  turnTimeLimit: number;
};

function generateUsername() {
    const adjectives = ["Fast", "Cool", "Smart", "Brave", "Lucky"];
    const animals = ["Tiger", "Eagle", "Shark", "Lion", "Wolf"];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const number = Math.floor(Math.random() * 1000);
    return `${adj}${animal}${number}`;
}

function matchInit(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, params: {[key: string]: any}) {
    logger.info("🔥 matchInit triggered");
    logger.info("Params: " + JSON.stringify(params));
    
    const state: GameState = {
        board: Array(9).fill(null),
        players: [],
        turn: 0,
        winner: null,
        joinedCount: 0,
        turnStartTime: 0,
        turnTimeLimit: 30
    };

    logger.info("🧠 Initial state: " + JSON.stringify(state));
    
    return {
        state: state,
        tickRate: 1,
        label: "tic-tac-toe"
    };
}

function matchJoinAttempt(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: GameState, presence: nkruntime.Presence, metadata: {[key: string]: any}): {state: GameState, accept: boolean, rejectMessage?: string} | null {
    logger.info("👤 matchJoinAttempt: " + presence.userId);
    
    // Always accept if less than 2 players
    if (state.players.length >= 2) {
        logger.info("❌ Match full. Rejecting: " + presence.userId);
        return { state, accept: false, rejectMessage: "Match full" };
    }
    
    logger.info("✅ Accepting player: " + presence.userId);
    return { state, accept: true };
}

function matchJoin(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: GameState, presences: nkruntime.Presence[]): { state: GameState } | null {
    logger.info("👥 matchJoin triggered - " + presences.length + " presence(s)");

    presences.forEach(p => {
        logger.info("Processing presence: " + p.userId + " (" + p.username + ")");
        
        // Check if player already exists
        let player = state.players.find(pl => pl.userId === p.userId);
        
        if (!player) {
            // NEW PLAYER - add them
            logger.info("➕ Adding NEW player: " + p.userId);
            state.players.push({
                userId: p.userId,
                username: p.username
            });
            state.joinedCount += 1;
        } else {
            logger.info("ℹ️ Player already in state: " + p.userId);
        }
    });

    logger.info("👥 Total players: " + state.players.length);
    logger.info("👥 Players: " + JSON.stringify(state.players));
    logger.info("👥 Joined count: " + state.joinedCount);

    // Broadcast when BOTH joined
    if (state.joinedCount === 2) {
        logger.info("🚀 Both players joined → starting game & broadcasting");
        state.turnStartTime = Math.floor(Date.now() / 1000);
        dispatcher.broadcastMessage(1, nk.stringToBinary(JSON.stringify(state)));
    } else {
        logger.info("⏳ Waiting for more players... (" + state.joinedCount + "/2)");
    }

    return { state };
}

function matchLeave(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: GameState, presences: nkruntime.Presence[]): { state: GameState } | null {
    logger.info("🚪 matchLeave triggered");
    
    presences.forEach((p) => {
        logger.info("➖ Removing player: " + p.userId);
        state.players = state.players.filter(pl => pl.userId !== p.userId);
        state.joinedCount = Math.max(0, state.joinedCount - 1);
    });
    
    logger.info("👥 Remaining players: " + JSON.stringify(state.players));
    logger.info("👥 Remaining count: " + state.joinedCount);
    
    return { state };
}

function checkWinner(board: (string | null)[]) {
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

function matchLoop(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: GameState, messages: nkruntime.MatchMessage[]): { state: GameState } | null {
    
    // Check for timeout
    if (state.joinedCount === 2 && !state.winner && state.turnStartTime > 0) {
        const currentTime = Math.floor(Date.now() / 1000);
        const elapsed = currentTime - state.turnStartTime;
        
        if (elapsed >= state.turnTimeLimit) {
            logger.info("⏰ TIME OUT! Player " + state.turn + " loses");
            
            const winnerSymbol = state.turn === 0 ? "O" : "X";
            const winnerIndex = state.turn === 0 ? 1 : 0;
            
            state.winner = winnerSymbol;
            state.board[0] = "TIMEOUT";
            
            logger.info("🏆 Winner (by timeout): " + state.players[winnerIndex].username);
            
            nk.leaderboardRecordWrite(
                LEADERBOARD_ID,
                state.players[winnerIndex].userId,
                state.players[winnerIndex].username,
                1,
                null,
                null
            );
            
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
                const loserIndex = winnerIndex === 0 ? 1 : 0;

                const winnerPlayer = state.players[winnerIndex];
                const loserPlayer = state.players[loserIndex];

                state.winner = winner;

                updatePlayerStats(nk, winnerPlayer.userId, winnerPlayer.username, true);
                updatePlayerStats(nk, loserPlayer.userId, loserPlayer.username, false);
                
                logger.info("🏆 Winner: " + winnerPlayer.username);

                nk.leaderboardRecordWrite(
                    LEADERBOARD_ID,
                    winnerPlayer.userId,
                    winnerPlayer.username,
                    1,
                    null,
                    null
                );
            } else if (!state.board.includes(null)) {
                state.winner = "DRAW";
                logger.info("🤝 Draw detected");
            } else {
                state.turn = 1 - state.turn;
                state.turnStartTime = Math.floor(Date.now() / 1000);
                logger.info("🔄 Next turn: " + state.turn);
            }

        } catch (err) {
            logger.error("❌ Error processing move: " + err);
        }
    });

    logger.info("📤 Broadcasting state");
    dispatcher.broadcastMessage(1, nk.stringToBinary(JSON.stringify(state)));

    return { state };
}

function matchTerminate(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: GameState, graceSeconds: number): { state: GameState } | null {
    logger.info("🛑 matchTerminate called. Grace: " + graceSeconds);
    return { state };
}

function matchSignal(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: GameState, data: string): { state: GameState, data?: string } | null {
    logger.info("📡 matchSignal received: " + data);
    return { state, data };
}

function createMatchRpc(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
    const matchId = nk.matchCreate("match", {});
    logger.info("🔥 RPC created match: " + matchId);
    return JSON.stringify({ matchId });
}

function afterAuthenticate(
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  session: nkruntime.Session 
): nkruntime.Session {

  const userId = ctx.userId;

  const account = nk.accountGetId(userId);

  if (!account.user.username || account.user.username.length < 3) {
    const newUsername = generateUsername();

    nk.accountUpdateId(userId, null, null, newUsername, null, null, null);

    logger.info("👤 Username generated: " + newUsername);
  }

  return session;
}

function createLeaderboard (nk: nkruntime.Nakama, logger: nkruntime.Logger) {
  try {
    nk.leaderboardCreate(
      LEADERBOARD_ID,
      false, // authoritative
      nkruntime.SortOrder.DESCENDING, // high score = more wins
      nkruntime.Operator.BEST,
      null,
      {}
    );

    logger.info("🏆 Leaderboard created");
  } catch (err) {
    logger.info("⚠️ Leaderboard already exists");
  }
};

function updatePlayerStats(
  nk: nkruntime.Nakama,
  userId: string,
  username: string,
  isWinner: boolean
) {
  const storageKey = {
    collection: "player_stats",
    key: "stats",
    userId: userId
  };

  let stats: PlayerStats = {
    wins: 0,
    losses: 0,
    winStreak: 0,
    bestStreak: 0
  };

  const records = nk.storageRead([storageKey]);

  if (records.length > 0) {
    // ✅ FIX: value is already an object, don't parse it
    stats = records[0].value as PlayerStats;
  }

  if (isWinner) {
    stats.wins += 1;
    stats.winStreak += 1;
    stats.bestStreak = Math.max(stats.bestStreak, stats.winStreak);

    nk.leaderboardRecordWrite(
      LEADERBOARD_ID,
      userId,
      username,
      stats.wins,
      null,
      null
    );

  } else {
    stats.losses += 1;
    stats.winStreak = 0;
  }

  // ✅ FIX: Write the object directly, don't stringify
  nk.storageWrite([{
    collection: "player_stats",
    key: "stats",
    userId: userId,
    value: stats as { [key: string]: any }
  }]);
}

function getLeaderboardWithStats(
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string
): string {

  const records = nk.leaderboardRecordsList(
    "global_leaderboard",
    null,
    10, // top 10 players
    null,
    null
  );

  const result = records.records.map((record, index) => {

    const userId = record.ownerId;

    // fetch stats from storage
    const storage = nk.storageRead([{
      collection: "player_stats",
      key: "stats",
      userId: userId
    }]);

    let stats: PlayerStats = {
      wins: 0,
      losses: 0,
      winStreak: 0,
      bestStreak: 0
    };

    if (storage.length > 0) {
      // ✅ FIX: value is already an object, don't parse it
      stats = storage[0].value as PlayerStats;
    }

    return {
      rank: index + 1,
      userId: userId,
      username: record.username,
      wins: stats.wins,
      losses: stats.losses,
      winStreak: stats.winStreak,
      bestStreak: stats.bestStreak
    };
  });

  return JSON.stringify(result);
}

function matchmakerMatched(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, matches: nkruntime.MatchmakerResult[]): string | null {
  logger.info("🔥 Matchmaker matched!");

  if (matches.length === 0) return null;

  logger.info("👥 Matched players count: " + matches.length);

  matches.forEach((m, i) => {
    logger.info(`Player ${i}: ${m.presence.userId}`);
  });

  const matchId = nk.matchCreate("match", {});
  logger.info("🎮 Created match: " + matchId);

  return matchId;
}

function InitModule(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, initializer: nkruntime.Initializer) {
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
    initializer.registerRpc("get_leaderboard_with_stats", getLeaderboardWithStats);

    createLeaderboard(nk, logger);
}

(globalThis as any).InitModule = InitModule;
