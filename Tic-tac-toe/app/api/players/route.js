import { connectToDB } from "@/lib/mongodb";
import Player from "@/models/Player";

export async function GET() {
  try {
    await connectToDB();
    const players = await Player.find({}).lean();
    const data = players.map((p) => {
      const total = p.wins + p.losses + p.draws;
      const winRate = total ? p.wins / total : 0;
      return {
        _id: String(p._id),
        username: p.username,
        wins: p.wins,
        losses: p.losses,
        draws: p.draws,
        winRate
      };
    });
    data.sort((a, b) => b.wins - a.wins);
    return Response.json({ players: data }, { status: 200 });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const username = body?.username?.trim();
    if (!username) return Response.json({ error: "username is required" }, { status: 400 });

    await connectToDB();
    let player = await Player.findOne({ username });
    if (!player) {
      player = await Player.create({ username });
    }
    return Response.json(
      { _id: String(player._id), username: player.username, wins: player.wins, losses: player.losses, draws: player.draws },
      { status: 201 }
    );
  } catch (e) {
    if (e.code === 11000) {
      const existing = await Player.findOne({ username: e.keyValue?.username });
      return Response.json(
        { _id: String(existing._id), username: existing.username, wins: existing.wins, losses: existing.losses, draws: existing.draws },
        { status: 200 }
      );
    }
    return Response.json({ error: e.message }, { status: 500 });
  }
}