import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  const body = await request.json()
  const { playerId } = body

  if (!playerId) {
    return NextResponse.json({ error: 'Player ID is required' }, { status: 400 })
  }

  const { data: game, error: fetchError } = await supabase
    .from('games')
    .select('*')
    .eq('id', params.gameId)
    .maybeSingle()

  if (fetchError || !game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 })
  }

  if (game.status !== 'open') {
    return NextResponse.json({ error: 'Game is not available to join' }, { status: 400 })
  }

  if (game.player1_id === playerId) {
    return NextResponse.json({ error: 'Cannot join your own game' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('games')
    .update({
      player2_id: playerId,
      status: 'active'
    })
    .eq('id', params.gameId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
