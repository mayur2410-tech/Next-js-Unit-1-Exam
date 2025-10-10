'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function HistoryPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const playerId = searchParams.get('playerId')

  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [playerName, setPlayerName] = useState('')

  useEffect(() => {
    if (!playerId) {
      setLoading(false)
      return
    }

    const fetchHistory = async () => {
      const res = await fetch(`/api/history/${playerId}`)
      if (res.ok) {
        const data = await res.json()
        setGames(data)

        if (data.length > 0) {
          const game = data[0]
          if (game.player1.id === playerId) {
            setPlayerName(game.player1.username)
          } else if (game.player2?.id === playerId) {
            setPlayerName(game.player2.username)
          }
        }
      }
      setLoading(false)
    }

    fetchHistory()
  }, [playerId])

  if (!playerId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 border-2 border-gray-300">
          <p className="text-gray-700 mb-4 font-semibold">No player ID provided</p>
          <Button onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-700 font-mono">Loading history...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 border-b-4 border-gray-800 pb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 uppercase tracking-tight">
            Game History
          </h1>
          {playerName && (
            <p className="text-lg text-gray-700 font-semibold mt-2">
              Player: {playerName}
            </p>
          )}
          <p className="text-sm text-gray-600 font-mono">
            Incremental Static Regeneration (ISR)
          </p>
        </div>

        <Card className="p-6 mb-6 border-2 border-gray-300">
          {games.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 font-mono mb-6">
                No games played yet. Start playing to build your history!
              </p>
              <Button onClick={() => router.push('/')} className="uppercase">
                Play Now
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {games.map((game: any) => {
                const opponent = game.player1.id === playerId ? game.player2 : game.player1
                const isWinner = game.winner_id === playerId
                const isDraw = !game.winner_id

                return (
                  <div
                    key={game.id}
                    className={`p-4 border-2 ${
                      isWinner ? 'border-green-600 bg-green-50' :
                      isDraw ? 'border-gray-400 bg-gray-50' :
                      'border-red-500 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-700 uppercase">
                          {isWinner ? '🏆 Victory' : isDraw ? '🤝 Draw' : '❌ Defeat'}
                        </p>
                        <p className="text-xs text-gray-600 font-mono mt-1">
                          vs {opponent?.username || 'Unknown'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">
                          {new Date(game.ended_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">
                          {new Date(game.ended_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1 max-w-xs mt-3">
                      {JSON.parse(game.board_state).map((cell: string, index: number) => (
                        <div
                          key={index}
                          className={`aspect-square border-2 border-gray-700 flex items-center justify-center text-lg font-bold
                            ${cell === 'X' ? 'text-blue-700' : cell === 'O' ? 'text-red-700' : 'text-gray-300'}
                          `}
                        >
                          {cell || '-'}
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-gray-500 font-mono mt-3">
                      Game ID: {game.id.slice(0, 16)}...
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        <div className="flex gap-4">
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="flex-1 border-2 border-gray-600 font-semibold uppercase"
          >
            Back to Home
          </Button>
          <Button
            onClick={() => router.push('/leaderboard')}
            variant="outline"
            className="flex-1 border-2 border-gray-600 font-semibold uppercase"
          >
            View Leaderboard
          </Button>
        </div>

        <div className="mt-6 p-4 bg-white border-2 border-gray-300 text-center">
          <p className="text-xs text-gray-600 font-mono">
            This page uses Incremental Static Regeneration (ISR)
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Data is periodically revalidated for optimal performance
          </p>
        </div>
      </div>
    </div>
  )
}
