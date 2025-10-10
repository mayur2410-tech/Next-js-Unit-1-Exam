import { connectToDB } from "@/lib/mongodb";
import Game from "@/models/Game";
import Move from "@/models/Move";
import Player from "@/models/Player";
import { boardFromMoves, getWinner, isDraw } from "@/lib/game";

export async function GET(_req, { params }) {
  try {
    const { gameId } = params;
    await connectToDB();
    const game = await Game.findById(gameId).lean();
    if (!game) return Response.json({ error: "Game not found" }, { status: 404 });

    const [player1, player2, moves] = await Promise.all([
      Player.findById(game.player1).lean(),
      game.player2 ? Player.findById(game.player2).lean() : null,
      Move.find({ gameId }).sort({ timestamp: 1 }).lean()
    ]);

    const board = boardFromMoves(moves, game.player1, game.player2);
    const winnerSymbol = getWinner(board);

    return Response.json(
      {
        game: {
          _id: String(game._id),
          status: game.status,
          player1: player1 ? { _id: String(player1._id), username: player1.username } : null,
          player2: player2 ? { _id: String(player2._id), username: player2.username } : null,
          createdAt: game.createdAt,
          endedAt: game.endedAt || null
        },
        moves: moves.map((m) => ({ _id: String(m._id), position: m.position, timestamp: m.timestamp, playerId: String(m.playerId) })),
        board,
        winnerSymbol,
        isDraw: isDraw(board)
      },
      { status: 200 }
    );
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}