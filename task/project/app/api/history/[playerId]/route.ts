import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { playerId: string } }
) {
  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      player1:player1_id(id, username),
      player2:player2_id(id, username),
      winner:winner_id(id, username)
    `)
    .or(`player1_id.eq.${params.playerId},player2_id.eq.${params.playerId}`)
    .eq('status', 'finished')
    .order('ended_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
