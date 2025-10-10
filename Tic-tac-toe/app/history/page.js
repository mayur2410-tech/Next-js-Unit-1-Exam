import { connectToDB } from "@/lib/mongodb";
import Player from "@/models/Player";
import Game from "@/models/Game";
import Move from "@/models/Move";
import { boardFromMoves, getWinner, isDraw } from "@/lib/game";

export const metadata = {
  title: "History | Tic Tac Toe Multiplayer",
  description: "Incrementally revalidated history by username."
};

// ISR every 60 seconds
export const revalidate = 60;

export default async function HistoryPage({ searchParams }) {
  const username = searchParams?.username?.trim?.() || "";
  let result = null;

  if (username) {
    await connectToDB();
    const player = await Player.findOne({ username }).lean();
    if (player) {
      const games = await Game.find({
        $or: [{ player1: player._id }, { player2: player._id }]
      })
        .sort({ createdAt: -1 })
        .lean();

      // enrich with basic summary
      result = [];
      for (const g of games) {
        const moves = await Move.find({ gameId: g._id }).sort({ timestamp: 1 }).lean();
        const board = boardFromMoves(moves, g.player1, g.player2);
        const winnerSymbol = getWinner(board);
        const status = g.status;
        result.push({
          _id: String(g._id),
          createdAt: g.createdAt,
          status,
          opponent:
            String(g.player1) === String(player._id) ? String(g.player2 || "") : String(g.player1 || ""),
          winnerSymbol,
          movesCount: moves.length,
          isDraw: isDraw(board)
        });
      }
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">History</h1>
      <form className="flex gap-2">
        <input
          name="username"
          placeholder="Enter username to view history"
          defaultValue={username}
          className="form-input flex-1"
        />
        <button className="btn btn-primary">Search</button>
      </form>

      {!username && (
        <p className="text-sm text-muted">
          Enter a username to view their games. This page uses ISR with revalidate=60.
        </p>
      )}

      {username && !result && (
        <p className="text-sm">No player found with username: {username}</p>
      )}

      {username && result && (
        <div className="space-y-3">
          <h2 className="font-semibold">Games for {username}</h2>
          <ul className="space-y-2">
            {result.map((g) => (
              <li key={g._id} className="border rounded p-3 flex items-center justify-between">
                <div className="text-sm">
                  <div className="font-mono">Game {g._id}</div>
                  <div>Created: {new Date(g.createdAt).toLocaleString()}</div>
                  <div>Status: {g.status}</div>
                  <div>
                    Result:{" "}
                    {g.status !== "finished"
                      ? "In progress"
                      : g.isDraw
                      ? "Draw"
                      : g.winnerSymbol
                      ? `${g.winnerSymbol} won`
                      : "Finished"}
                  </div>
                </div>
                <a
                  className="btn btn-secondary btn-sm"
                  href={`/history/${g._id}`}
                >
                  Replay
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}