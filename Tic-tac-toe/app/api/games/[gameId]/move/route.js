import { connectToDB } from "@/lib/mongodb";
import Game from "@/models/Game";
import Player from "@/models/Player";
import Move from "@/models/Move";
import { boardFromMoves, getWinner, isDraw } from "@/lib/game";

export async function POST(req, { params }) {
  try {
    const { gameId } = params;
    const { username, position } = await req.json();

    if (!username || typeof position !== "number")
      return Response.json({ error: "username and numeric position are required" }, { status: 400 });

    if (position < 0 || position > 8)
      return Response.json({ error: "position must be between 0 and 8" }, { status: 400 });

    await connectToDB();
    const game = await Game.findById(gameId);
    if (!game) return Response.json({ error: "Game not found" }, { status: 404 });
    if (game.status !== "active") return Response.json({ error: "Game is not active" }, { status: 400 });

    const player = await Player.findOne({ username });
    if (!player) return Response.json({ error: "Player not found" }, { status: 404 });

    const isInGame =
      String(player._id) === String(game.player1) || String(player._id) === String(game.player2);
    if (!isInGame) return Response.json({ error: "Player not part of this game" }, { status: 403 });

    const moves = await Move.find({ gameId }).sort({ timestamp: 1 }).lean();

    // Determine turn: player1 => X plays on even count, player2 => O on odd
    const expectedPlayerId = moves.length % 2 === 0 ? String(game.player1) : String(game.player2);
    if (String(player._id) !== expectedPlayerId) {
      return Response.json({ error: "Not your turn" }, { status: 400 });
    }

    // Check if cell already taken
    const board = boardFromMoves(moves, game.player1, game.player2);
    if (board[position] !== null) {
      return Response.json({ error: "Cell already occupied" }, { status: 400 });
    }

    // Record move
    const newMove = await Move.create({
      gameId: game._id,
      playerId: player._id,
      position,
      timestamp: new Date()
    });

    // Recompute state after move
    const allMoves = [...moves, JSON.parse(JSON.stringify(newMove))];
    const newBoard = boardFromMoves(allMoves, game.player1, game.player2);
    const winnerSymbol = getWinner(newBoard);

    if (winnerSymbol || isDraw(newBoard)) {
      game.status = "finished";
      game.endedAt = new Date();

      if (winnerSymbol) {
        const winnerId = winnerSymbol === "X" ? game.player1 : game.player2;
        const loserId = winnerSymbol === "X" ? game.player2 : game.player1;
        game.winner = winnerId;

        await Promise.all([
          game.save(),
          // Update stats
          // Use $inc for atomicity
          Player.updateOne({ _id: winnerId }, { $inc: { wins: 1 } }),
          Player.updateOne({ _id: loserId }, { $inc: { losses: 1 } })
        ]);
      } else {
        await Promise.all([
          game.save(),
          Player.updateOne({ _id: game.player1 }, { $inc: { draws: 1 } }),
          Player.updateOne({ _id: game.player2 }, { $inc: { draws: 1 } })
        ]);
      }
    }

    return Response.json(
      { ok: true, moveId: String(newMove._id) },
      { status: 201 }
    );
  } catch (e) {
    if (e.code === 11000) {
      return Response.json({ error: "Cell already taken (duplicate)" }, { status: 400 });
    }
    return Response.json({ error: e.message }, { status: 500 });
  }
}