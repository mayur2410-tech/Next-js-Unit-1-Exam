import { connectToDB } from "@/lib/mongodb";
import Player from "@/models/Player";
import Game from "@/models/Game";

export async function POST(req) {
  try {
    const body = await req.json();
    const username = body?.username?.trim();
    if (!username) return Response.json({ error: "username is required" }, { status: 400 });

    await connectToDB();
    let player = await Player.findOne({ username });
    if (!player) player = await Player.create({ username });

    const game = await Game.create({
      player1: player._id,
      status: "open",
      createdAt: new Date()
    });

    return Response.json(
      { _id: String(game._id), status: game.status, player1: String(game.player1) },
      { status: 201 }
    );
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
