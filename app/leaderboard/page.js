import { connectToDB } from "@/lib/mongodb";
import Player from "@/models/Player";

export const metadata = {
  title: "Leaderboard | Tic Tac Toe Multiplayer",
  description: "Server-side rendered live leaderboard."
};

export const dynamic = "force-dynamic"; // SSR

function calcRate(p) {
  const total = p.wins + p.losses + p.draws;
  return total ? (p.wins / total) * 100 : 0;
}

export default async function LeaderboardPage() {
  await connectToDB();
  const players = await Player.find({}).lean();
  players.sort((a, b) => b.wins - a.wins);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Leaderboard</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-3 py-2 text-left border">Username</th>
              <th className="px-3 py-2 text-right border">Wins</th>
              <th className="px-3 py-2 text-right border">Losses</th>
              <th className="px-3 py-2 text-right border">Draws</th>
              <th className="px-3 py-2 text-right border">Win Rate</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="px-3 py-2">{p.username}</td>
                <td className="px-3 py-2 text-right">{p.wins}</td>
                <td className="px-3 py-2 text-right">{p.losses}</td>
                <td className="px-3 py-2 text-right">{p.draws}</td>
                <td className="px-3 py-2 text-right">{calcRate(p).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">Rendering strategy: SSR (no-store).</p>
    </div>
  );
}