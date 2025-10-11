import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      player1:player1_id(id, username, wins, losses, draws),
      player2:player2_id(id, username, wins, losses, draws),
      winner:winner_id(id, username)
    `)
    .eq('id', params.gameId)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}
