'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export default function Home() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [openGames, setOpenGames] = useState<any[]>([])
  const [showGames, setShowGames] = useState(false)
  const [currentPlayer, setCurrentPlayer] = useState<any>(null)
  const router = useRouter()

  const handleCreatePlayer = async () => {
    if (!username.trim()) {
      alert('Please enter a username')
      return
    }

    setLoading(true)
    const res = await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim() })
    })

    const player = await res.json()
    setCurrentPlayer(player)
    setLoading(false)
  }

  const handleCreateGame = async () => {
    if (!currentPlayer) {
      alert('Please create a player first')
      return
    }

    setLoading(true)
    const res = await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: currentPlayer.id })
    })

    const game = await res.json()
    setLoading(false)
    router.push(`/game/${game.id}?playerId=${currentPlayer.id}`)
  }

  const handleShowOpenGames = async () => {
    setLoading(true)
    const res = await fetch('/api/games/open')
    const games = await res.json()
    setOpenGames(games)
    setShowGames(true)
    setLoading(false)
  }

  const handleJoinGame = async (gameId: string) => {
    if (!currentPlayer) {
      alert('Please create a player first')
      return
    }

    setLoading(true)
    const res = await fetch(`/api/games/${gameId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: currentPlayer.id })
    })

    if (res.ok) {
      router.push(`/game/${gameId}?playerId=${currentPlayer.id}`)
    } else {
      const error = await res.json()
      alert(error.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 border-b-4 border-gray-800 pb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 uppercase tracking-tight">
            Tic Tac Toe Multiplayer
          </h1>
          <p className="text-sm text-gray-600 font-mono">
            Assignment: Full-Stack Game Application
          </p>
        </div>

        <Card className="p-8 mb-6 shadow-sm border-2 border-gray-300">
          <h2 className="text-xl font-bold mb-4 text-gray-800 uppercase text-center border-b-2 border-gray-300 pb-3">
            Player Setup
          </h2>

          {!currentPlayer ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Enter Username:
                </label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your username"
                  className="border-2 border-gray-300 focus:border-gray-600"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreatePlayer()}
                />
              </div>
              <Button
                onClick={handleCreatePlayer}
                disabled={loading}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-6 uppercase tracking-wide"
              >
                {loading ? 'Creating...' : 'Create/Login Player'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border-2 border-green-600 p-4 text-center">
                <p className="text-sm font-semibold text-gray-700">Welcome, Player:</p>
                <p className="text-2xl font-bold text-gray-900">{currentPlayer.username}</p>
                <div className="mt-2 flex justify-center gap-4 text-xs text-gray-600">
                  <span>W: {currentPlayer.wins}</span>
                  <span>L: {currentPlayer.losses}</span>
                  <span>D: {currentPlayer.draws}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={handleCreateGame}
                  disabled={loading}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-6 uppercase"
                >
                  Create New Game
                </Button>
                <Button
                  onClick={handleShowOpenGames}
                  disabled={loading}
                  variant="outline"
                  className="border-2 border-gray-700 text-gray-900 font-semibold py-6 uppercase hover:bg-gray-100"
                >
                  Join Open Game
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t-2 border-gray-300">
                <Button
                  onClick={() => router.push('/leaderboard')}
                  variant="outline"
                  className="border-2 border-gray-400 text-gray-700 font-semibold uppercase"
                >
                  View Leaderboard
                </Button>
                <Button
                  onClick={() => router.push(`/history?playerId=${currentPlayer.id}`)}
                  variant="outline"
                  className="border-2 border-gray-400 text-gray-700 font-semibold uppercase"
                >
                  My Game History
                </Button>
              </div>
            </div>
          )}
        </Card>

        {showGames && (
          <Card className="p-6 shadow-sm border-2 border-gray-300">
            <h3 className="text-lg font-bold mb-4 text-gray-800 uppercase border-b-2 border-gray-300 pb-2">
              Open Games ({openGames.length})
            </h3>
            {openGames.length === 0 ? (
              <p className="text-center text-gray-600 py-8 font-mono text-sm">
                No open games available. Create one!
              </p>
            ) : (
              <div className="space-y-3">
                {openGames.map((game: any) => (
                  <div
                    key={game.id}
                    className="flex items-center justify-between p-4 bg-gray-100 border-2 border-gray-300 hover:border-gray-500 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {game.player1?.username || 'Unknown Player'}
                      </p>
                      <p className="text-xs text-gray-600 font-mono">
                        Game ID: {game.id.slice(0, 8)}...
                      </p>
                    </div>
                    <Button
                      onClick={() => handleJoinGame(game.id)}
                      disabled={loading}
                      size="sm"
                      className="bg-green-700 hover:bg-green-800 text-white font-semibold uppercase"
                    >
                      Join
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        <div className="mt-8 p-6 bg-white border-2 border-gray-300 shadow-sm">
          <h3 className="text-lg font-bold mb-3 text-gray-800 uppercase">Game Instructions:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>Create or login with your username</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>Create a new game or join an existing open game</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>Player 1 is X, Player 2 is O</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">4.</span>
              <span>Take turns clicking cells to place your symbol</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">5.</span>
              <span>First to get 3 in a row wins!</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
