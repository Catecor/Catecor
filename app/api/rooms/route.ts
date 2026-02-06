import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function generateJoinCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function POST(request: NextRequest) {
  try {
    const { hostName, playerId } = await request.json()

    if (!hostName || !playerId) {
      return NextResponse.json(
        { error: 'Missing hostName or playerId' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    const joinCode = generateJoinCode()

    // Create game room
    const { data: room, error: roomError } = await supabase
      .from('game_rooms')
      .insert({
        join_code: joinCode,
        host_id: playerId,
        team_a_name: 'Team A',
        team_b_name: 'Team B',
        active_team: 'A',
        used_cards: { '1': [], '2': [], '3': [], chance: [] },
        game_phase: 'lobby',
      })
      .select()
      .single()

    if (roomError || !room) {
      console.log('[v0] Room creation error:', roomError?.message, roomError?.details)
      return NextResponse.json(
        { error: 'Failed to create room: ' + roomError?.message },
        { status: 500 }
      )
    }

    // Add host as first player
    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .insert({
        room_id: room.id,
        player_name: hostName,
        player_id: playerId,
        team: 'A',
        is_host: true,
      })
      .select()

    if (playerError) {
      console.log('[v0] Player creation error:', playerError.message, playerError.details)
      return NextResponse.json(
        { error: 'Failed to add host as player: ' + playerError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      roomId: room.id,
      joinCode: room.join_code,
    })
  } catch (err) {
    console.log('[v0] Rooms API catch error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
