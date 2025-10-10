import { connectToDB } from "@/lib/mongodb";
import Game from "@/models/Game";
import Move from "@/models/Move";
import Player from "@/models/Player";
import { boardFromMoves } from "@/lib/game";

export async function generateMetadata({ params }) {
  return {
    title: `Replay ${params.gameId} | Tic Tac Toe`,
    description: "Game replay view (SSG/ISR possible)."
  };
}

export default async function ReplayPage({ params }) {
  const { gameId } = params;
  await connectToDB();
  const game = await Game.findById(gameId).lean();
  if (!game) {
    return <p>Game not found.</p>;
  }
  const [p1, p2] = await Promise.all([
    Player.findById(game.player1).lean(),
    game.player2 ? Player.findById(game.player2).lean() : null
  ]);
  const moves = await Move.find({ gameId }).sort({ timestamp: 1 }).lean();
  const board = boardFromMoves(moves, game.player1, game.player2);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Replay</h1>
      <div className="text-sm">
        <div className="font-mono">Game: {String(game._id)}</div>
        <div>
          X: {p1?.username} | O: {p2?.username || "(n/a)"}
        </div>
        <div>Status: {game.status}</div>
      </div>

      <div className="game-board">
        {board.map((val, idx) => (
          <div
            key={idx}
            className="game-cell"
            style={{ cursor: 'default' }}
          >
            {val}
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-semibold mb-2">Move list</h3>
        <ol className="list-decimal list-inside text-sm space-y-1">
          {moves.map((m, i) => (
            <li key={m._id}>
              {i % 2 === 0 ? "X" : "O"} → position {m.position} ({new Date(m.timestamp).toLocaleString()})
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}