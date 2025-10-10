# Tic Tac Toe Multiplayer (Next.js + MongoDB)

Full-stack Tic Tac Toe app implementing SSG, SSR, ISR, and CSR with Next.js App Router, MongoDB Atlas (Mongoose), and Tailwind CSS.

## Setup

1. Copy `.env.example` to `.env.local` and set `MONGODB_URI`.
2. Install deps:

```bash
npm install
```

3. Run dev server:

```bash
npm run dev
```

Open http://localhost:3000

Routes:
- `/` (SSG) Home: create/join game
- `/leaderboard` (SSR)
- `/history` (ISR, `?username=YOUR_NAME`)
- `/game/[gameId]` (CSR gameplay)
- `/history/[gameId]` Replay
