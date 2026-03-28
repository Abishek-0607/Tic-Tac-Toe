# 🎮 Tic Tac Toe Multiplayer (Nakama + React)

A real-time multiplayer Tic Tac Toe game built using **Nakama (backend)** and **React (frontend)** with matchmaking, room-based gameplay, and leaderboard tracking.

---

## 🚀 Features

- Real-time multiplayer gameplay
- Matchmaking system
- Room-based join/create flow
- Leaderboard with player stats
- Session management with auto-refresh
- Persistent player statistics

---

## 🏗️ Architecture

### 🔹 Frontend
- React (Vite)
- Nakama JS Client
- WebSocket-based real-time communication

### 🔹 Backend
- Nakama Server (Authoritative Matches)
- TypeScript runtime (match handler)
- Storage for player stats
- Leaderboard system

---

## 🧠 Design Decisions

### 1. Authoritative Match System
- Game logic handled on server (`match.ts`)
- Prevents cheating and ensures consistency

### 2. Matchmaking vs Room System
- Initially used matchmaking
- Switched to room-based approach for stability and debugging

### 3. State Management
- Server is the source of truth
- Client only listens and renders

### 4. Player Stats
- Stored in Nakama Storage
- Synced with leaderboard

---

## ⚙️ Setup & Installation

### 🔹 Prerequisites
- Docker & Docker Compose
- Node.js (v18+)
- Nakama

---

### 🔹 Start Backend (Nakama)

```bash
docker-compose up --build
