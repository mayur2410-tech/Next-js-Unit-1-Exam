import { connectToDB } from "@/lib/mongodb";
import Game from "@/models/Game";
import Move from "@/models/Move";
import { boardFromMoves, getWinner, isDraw } from "@/lib/game";

export async function GET(_req, { params }) {
  try {
    const { playerId } = params;
    await connectToDB();
    const games = await Game.find({
      $or: [{ player1: playerId }, { player2: playerId }]
    })
      .sort({ createdAt: -1 })
      .lean();

    const out = [];
    for (const g of games) {
      const moves = await Move.find({ gameId: g._id }).sort({ timestamp: 1 }).lean();
      const board = boardFromMoves(moves, g.player1, g.player2);
      out.push({
        _id: String(g._id),
        createdAt: g.createdAt,
        status: g.status,
        winnerSymbol: getWinner(board),
        isDraw: isDraw(board),
        movesCount: moves.length
      });
    }
    return Response.json({ games: out }, { status: 200 });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}