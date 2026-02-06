import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { joinCode, playerName, playerId } = await request.json()

    if (!joinCode || !playerName || !playerId) {
      return NextResponse.json(
        { error: 'Missing joinCode, playerName, or playerId' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Find room by join code
    const { data: room, error: roomError } = await supabase
      .from('game_rooms')
      .select('id, active_team')
      .eq('join_code', joinCode.toUpperCase())
      .single()

    if (roomError || !room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    // Check if player already exists in this room
    const { data: existingPlayer } = await supabase
      .from('players')
      .select()
      .eq('room_id', room.id)
      .eq('player_id', playerId)
      .maybeSingle()

    if (existingPlayer) {
      // Player is reconnecting - just return their existing data
      return NextResponse.json({
        roomId: room.id,
        team: existingPlayer.team,
      })
    }

    // Get all players to determine team assignment
    const { data: allPlayers } = await supabase
      .from('players')
      .select('team')
      .eq('room_id', room.id)

    // Count players in each team
    const teamACounts = allPlayers?.filter((p) => p.team === 'A').length || 0
    const teamBCounts = allPlayers?.filter((p) => p.team === 'B').length || 0
    
    // Assign to team with fewer players
    const assignedTeam = teamACounts <= teamBCounts ? 'A' : 'B'

    // Add player
    const { error: playerError } = await supabase
      .from('players')
      .insert({
        room_id: room.id,
        player_name: playerName,
        player_id: playerId,
        team: assignedTeam,
        is_host: false,
      })

    if (playerError) {
      console.log('[v0] Join error:', playerError.message)
      return NextResponse.json(
        { error: 'Failed to join room' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      roomId: room.id,
      team: assignedTeam,
    })
  } catch (err) {
    console.log('[v0] Join API error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
