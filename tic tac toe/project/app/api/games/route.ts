import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  const body = await request.json()
  const { playerId } = body

  if (!playerId) {
    return NextResponse.json({ error: 'Player ID is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('games')
    .insert([{
      player1_id: playerId,
      status: 'open',
      board_state: '["","","","","","","","",""]',
      current_turn: playerId
    }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
