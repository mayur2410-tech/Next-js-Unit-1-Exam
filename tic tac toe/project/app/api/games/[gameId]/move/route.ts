import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function checkWinner(board: string[]): string | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]
    }
  }

  return null
}

function isBoardFull(board: string[]): boolean {
  return board.every(cell => cell !== '')
}

export async function POST(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  const body = await request.json()
  const { playerId, position } = body

  if (!playerId || position === undefined) {
    return NextResponse.json({ error: 'Player ID and position are required' }, { status: 400 })
  }

  const { data: game, error: fetchError } = await supabase
    .from('games')
    .select('*')
    .eq('id', params.gameId)
    .maybeSingle()

  if (fetchError || !game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 })
  }

  if (game.status !== 'active') {
    return NextResponse.json({ error: 'Game is not active' }, { status: 400 })
  }

  if (game.current_turn !== playerId) {
    return NextResponse.json({ error: 'Not your turn' }, { status: 400 })
  }

  const board = JSON.parse(game.board_state)

  if (board[position] !== '') {
    return NextResponse.json({ error: 'Position already occupied' }, { status: 400 })
  }

  const symbol = game.player1_id === playerId ? 'X' : 'O'
  board[position] = symbol

  await supabase
    .from('moves')
    .insert([{
      game_id: params.gameId,
      player_id: playerId,
      position,
      symbol
    }])

  const winner = checkWinner(board)
  const isDraw = !winner && isBoardFull(board)
  const isGameOver = winner || isDraw

  const nextTurn = playerId === game.player1_id ? game.player2_id : game.player1_id

  const updateData: any = {
    board_state: JSON.stringify(board),
    current_turn: isGameOver ? null : nextTurn
  }

  if (isGameOver) {
    updateData.status = 'finished'
    updateData.ended_at = new Date().toISOString()

    if (winner) {
      const winnerId = symbol === 'X' ? game.player1_id : game.player2_id
      updateData.winner_id = winnerId

      await supabase
        .from('players')
        .update({ wins: supabase.rpc('increment', { x: 1 }) } as any)
        .eq('id', winnerId)

      const loserId = winnerId === game.player1_id ? game.player2_id : game.player1_id
      await supabase
        .from('players')
        .update({ losses: supabase.rpc('increment', { x: 1 }) } as any)
        .eq('id', loserId)
    } else if (isDraw) {
      await supabase
        .from('players')
        .update({ draws: supabase.rpc('increment', { x: 1 }) } as any)
        .in('id', [game.player1_id, game.player2_id])
    }
  }

  const { data: updatedGame, error: updateError } = await supabase
    .from('games')
    .update(updateData)
    .eq('id', params.gameId)
    .select(`
      *,
      player1:player1_id(id, username, wins, losses, draws),
      player2:player2_id(id, username, wins, losses, draws),
      winner:winner_id(id, username)
    `)
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json(updatedGame)
}
