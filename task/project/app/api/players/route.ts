import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('wins', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { username } = body

  if (!username || username.trim() === '') {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 })
  }

  const { data: existingPlayer } = await supabase
    .from('players')
    .select('*')
    .eq('username', username.trim())
    .maybeSingle()

  if (existingPlayer) {
    return NextResponse.json(existingPlayer)
  }

  const { data, error } = await supabase
    .from('players')
    .insert([{ username: username.trim() }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
