import { connectToDB } from "@/lib/mongodb";
import Game from "@/models/Game";
import Player from "@/models/Player";

export async function GET() {
  try {
    await connectToDB();
    const games = await Game.find({ status: "open", player2: { $exists: false } })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const playerIds = [...new Set(games.map((g) => String(g.player1)))];
    const players = await Player.find({ _id: { $in: playerIds } }).lean();
    const playerMap = new Map(players.map((p) => [String(p._id), p]));

    const data = games.map((g) => ({
      _id: String(g._id),
      status: g.status,
      player1: { _id: String(g.player1), username: playerMap.get(String(g.player1))?.username || "unknown" }
    }));

    return Response.json({ games: data }, { status: 200 });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}