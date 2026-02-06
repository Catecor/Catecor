import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { joinCode, playerName, playerId } = await request.json()

    console.log('[v0] Join request received:', { joinCode, playerName, playerId })

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
      console.log('[v0] Room not found:', roomError)
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    console.log('[v0] Room found:', room.id)

    // Check if player already exists in this room
    const { data: existingPlayer } = await supabase
      .from('players')
      .select()
      .eq('room_id', room.id)
      .eq('player_id', playerId)
      .maybeSingle()

    if (existingPlayer) {
      console.log('[v0] Player already exists, returning existing data:', existingPlayer)
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

    console.log('[v0] Current players in room:', allPlayers?.length || 0)

    // Count players in each team
    const teamACounts = allPlayers?.filter((p) => p.team === 'A').length || 0
    const teamBCounts = allPlayers?.filter((p) => p.team === 'B').length || 0
    
    // Assign to team with fewer players
    const assignedTeam = teamACounts <= teamBCounts ? 'A' : 'B'

    console.log('[v0] Assigning player to team:', assignedTeam, 'Team A:', teamACounts, 'Team B:', teamBCounts)

    // Add player
    const { data: newPlayer, error: playerError } = await supabase
      .from('players')
      .insert({
        room_id: room.id,
        player_name: playerName,
        player_id: playerId,
        team: assignedTeam,
        is_host: false,
      })
      .select()

    if (playerError) {
      console.log('[v0] Failed to add player:', playerError)
      return NextResponse.json(
        { error: 'Failed to join room' },
        { status: 500 }
      )
    }

    console.log('[v0] Player successfully added to database:', newPlayer)

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
