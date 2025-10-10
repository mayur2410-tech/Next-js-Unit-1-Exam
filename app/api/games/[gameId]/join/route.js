import { connectToDB } from "@/lib/mongodb";
import Game from "@/models/Game";
import Player from "@/models/Player";

export async function POST(req, { params }) {
  try {
    const { gameId } = params;
    const { username } = await req.json();
    if (!username) return Response.json({ error: "username is required" }, { status: 400 });

    await connectToDB();
    const game = await Game.findById(gameId);
    if (!game) return Response.json({ error: "Game not found" }, { status: 404 });
    if (game.status !== "open") return Response.json({ error: "Game is not open" }, { status: 400 });

    let player = await Player.findOne({ username });
    if (!player) player = await Player.create({ username });

    if (String(player._id) === String(game.player1)) {
      return Response.json({ error: "Host cannot join as player 2" }, { status: 400 });
    }

    game.player2 = player._id;
    game.status = "active";
    await game.save();

    return Response.json(
      { _id: String(game._id), status: game.status, player1: String(game.player1), player2: String(game.player2) },
      { status: 200 }
    );
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}