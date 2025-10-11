'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function GamePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const gameId = params.gameId as string
  const playerId = searchParams.get('playerId')

  const [game, setGame] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [making, setMaking] = useState(false)
  const [error, setError] = useState('')

  const fetchGame = async () => {
    const res = await fetch(`/api/games/${gameId}`)
    if (res.ok) {
      const data = await res.json()
      setGame(data)
      setLoading(false)
    } else {
      setError('Game not found')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGame()
    const interval = setInterval(fetchGame, 2000)
    return () => clearInterval(interval)
  }, [gameId])

  const handleMove = async (position: number) => {
    if (!playerId || making) return

    setMaking(true)
    const res = await fetch(`/api/games/${gameId}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, position })
    })

    if (res.ok) {
      const data = await res.json()
      setGame(data)
    } else {
      const err = await res.json()
      alert(err.error)
    }
    setMaking(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-700 font-mono">Loading game...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 border-2 border-red-500">
          <p className="text-red-700 font-semibold">{error}</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            Back to Home
          </Button>
        </Card>
      </div>
    )
  }

  const board = JSON.parse(game.board_state)
  const isMyTurn = game.current_turn === playerId
  const mySymbol = game.player1_id === playerId ? 'X' : 'O'
  const isPlayer = game.player1_id === playerId || game.player2_id === playerId

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 border-b-4 border-gray-800 pb-4">
          <h1 className="text-3xl font-bold text-gray-900 uppercase">
            Game Board
          </h1>
          <p className="text-xs text-gray-600 font-mono mt-1">
            Game ID: {gameId.slice(0, 12)}...
          </p>
        </div>

        <Card className="p-6 mb-6 border-2 border-gray-300">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={`p-4 border-2 ${game.player1_id === game.current_turn ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}`}>
              <p className="text-xs text-gray-600 font-semibold uppercase">Player 1 (X)</p>
              <p className="text-lg font-bold text-gray-900">
                {game.player1?.username || 'Waiting...'}
              </p>
              {game.player1 && (
                <p className="text-xs text-gray-600 mt-1">
                  W:{game.player1.wins} L:{game.player1.losses} D:{game.player1.draws}
                </p>
              )}
            </div>

            <div className={`p-4 border-2 ${game.player2_id === game.current_turn ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}`}>
              <p className="text-xs text-gray-600 font-semibold uppercase">Player 2 (O)</p>
              <p className="text-lg font-bold text-gray-900">
                {game.player2?.username || 'Waiting...'}
              </p>
              {game.player2 && (
                <p className="text-xs text-gray-600 mt-1">
                  W:{game.player2.wins} L:{game.player2.losses} D:{game.player2.draws}
                </p>
              )}
            </div>
          </div>

          <div className="mb-6 p-4 border-2 border-gray-400 bg-gray-100 text-center">
            {game.status === 'open' && (
              <p className="font-semibold text-gray-800">
                Waiting for Player 2 to join...
              </p>
            )}
            {game.status === 'active' && (
              <>
                {isMyTurn ? (
                  <p className="font-bold text-green-700 text-lg">
                    YOUR TURN ({mySymbol})
                  </p>
                ) : (
                  <p className="font-semibold text-gray-700">
                    Waiting for opponent...
                  </p>
                )}
              </>
            )}
            {game.status === 'finished' && (
              <>
                {game.winner_id ? (
                  <p className="font-bold text-xl text-gray-900">
                    Winner: {game.winner?.username} 🏆
                  </p>
                ) : (
                  <p className="font-bold text-xl text-gray-700">
                    Game Draw!
                  </p>
                )}
              </>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            {board.map((cell: string, index: number) => (
              <button
                key={index}
                onClick={() => handleMove(index)}
                disabled={!isPlayer || !isMyTurn || game.status !== 'active' || cell !== '' || making}
                className={`
                  aspect-square border-4 border-gray-800 text-5xl font-bold
                  flex items-center justify-center
                  ${cell === '' && isMyTurn && game.status === 'active' && isPlayer ? 'hover:bg-gray-200 cursor-pointer' : ''}
                  ${cell === 'X' ? 'text-blue-700' : ''}
                  ${cell === 'O' ? 'text-red-700' : ''}
                  ${!isPlayer || !isMyTurn || game.status !== 'active' || cell !== '' ? 'cursor-not-allowed bg-gray-50' : 'bg-white'}
                `}
              >
                {cell}
              </button>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="flex-1 border-2 border-gray-600 font-semibold uppercase"
            >
              Back to Home
            </Button>
            {game.status === 'finished' && (
              <Button
                onClick={() => router.push(`/history?playerId=${playerId}`)}
                variant="outline"
                className="flex-1 border-2 border-gray-600 font-semibold uppercase"
              >
                View History
              </Button>
            )}
          </div>
        </Card>

        <div className="p-4 bg-white border-2 border-gray-300 text-xs text-gray-600 font-mono text-center">
          Status: {game.status.toUpperCase()} | Auto-refresh: ON
        </div>
      </div>
    </div>
  )
}
