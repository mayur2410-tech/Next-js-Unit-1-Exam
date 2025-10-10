import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export const metadata = {
  title: 'Leaderboard | Tic Tac Toe',
  description: 'View the global player rankings and statistics',
}

async function getPlayers() {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('wins', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching players:', error)
    return []
  }

  return data
}

export default async function LeaderboardPage() {
  const players = await getPlayers()

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 border-b-4 border-gray-800 pb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 uppercase tracking-tight">
            Global Leaderboard
          </h1>
          <p className="text-sm text-gray-600 font-mono">
            Server-Side Rendered (SSR)
          </p>
        </div>

        <Card className="p-6 mb-6 border-2 border-gray-300">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-800">
                  <th className="text-left py-3 px-4 font-bold text-gray-800 uppercase text-sm">
                    Rank
                  </th>
                  <th className="text-left py-3 px-4 font-bold text-gray-800 uppercase text-sm">
                    Player
                  </th>
                  <th className="text-center py-3 px-4 font-bold text-gray-800 uppercase text-sm">
                    Wins
                  </th>
                  <th className="text-center py-3 px-4 font-bold text-gray-800 uppercase text-sm">
                    Losses
                  </th>
                  <th className="text-center py-3 px-4 font-bold text-gray-800 uppercase text-sm">
                    Draws
                  </th>
                  <th className="text-center py-3 px-4 font-bold text-gray-800 uppercase text-sm">
                    Total
                  </th>
                  <th className="text-center py-3 px-4 font-bold text-gray-800 uppercase text-sm">
                    Win Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {players.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-600 font-mono">
                      No players yet. Be the first!
                    </td>
                  </tr>
                ) : (
                  players.map((player, index) => {
                    const total = player.wins + player.losses + player.draws
                    const winRate = total > 0 ? ((player.wins / total) * 100).toFixed(1) : '0.0'

                    return (
                      <tr
                        key={player.id}
                        className={`border-b border-gray-300 ${
                          index < 3 ? 'bg-yellow-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <span className={`font-bold ${
                            index === 0 ? 'text-yellow-600 text-lg' :
                            index === 1 ? 'text-gray-500 text-lg' :
                            index === 2 ? 'text-orange-600 text-lg' :
                            'text-gray-700'
                          }`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-900">
                          {player.username}
                        </td>
                        <td className="py-3 px-4 text-center text-green-700 font-bold">
                          {player.wins}
                        </td>
                        <td className="py-3 px-4 text-center text-red-700 font-bold">
                          {player.losses}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600 font-bold">
                          {player.draws}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-800 font-semibold">
                          {total}
                        </td>
                        <td className="py-3 px-4 text-center text-blue-700 font-bold">
                          {winRate}%
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex gap-4">
          <Link href="/" className="flex-1">
            <Button
              variant="outline"
              className="w-full border-2 border-gray-600 font-semibold uppercase"
            >
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="mt-6 p-4 bg-white border-2 border-gray-300 text-center">
          <p className="text-xs text-gray-600 font-mono">
            This page uses Server-Side Rendering (SSR)
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Data is fetched on every request for real-time accuracy
          </p>
        </div>
      </div>
    </div>
  )
}
