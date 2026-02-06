import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { roomId, action, payload } = await request.json()

    if (!roomId || !action) {
      return NextResponse.json(
        { error: 'Missing roomId or action' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    switch (action) {
      case 'start_game': {
        const { error } = await supabase
          .from('game_rooms')
          .update({ game_phase: 'playing' })
          .eq('id', roomId)

        if (error) {
          return NextResponse.json(
            { error: 'Failed to start game' },
            { status: 500 }
          )
        }
        return NextResponse.json({ success: true })
      }

      case 'switch_team': {
        const { error } = await supabase
          .from('game_rooms')
          .update({
            active_team: payload.team === 'A' ? 'B' : 'A',
          })
          .eq('id', roomId)

        if (error) {
          return NextResponse.json(
            { error: 'Failed to switch team' },
            { status: 500 }
          )
        }
        return NextResponse.json({ success: true })
      }

      case 'update_team_name': {
        const { team, name } = payload
        const updateData =
          team === 'A'
            ? { team_a_name: name }
            : { team_b_name: name }

        const { error } = await supabase
          .from('game_rooms')
          .update(updateData)
          .eq('id', roomId)

        if (error) {
          return NextResponse.json(
            { error: 'Failed to update team name' },
            { status: 500 }
          )
        }
        return NextResponse.json({ success: true })
      }

      case 'new_game': {
        console.log('[v0] Starting new game for room:', roomId)
        const { error } = await supabase
          .from('game_rooms')
          .update({
            used_cards: { '1': [], '2': [], '3': [], chance: [] },
            current_card: null,
            active_team: 'A',
            game_phase: 'playing',
          })
          .eq('id', roomId)

        if (error) {
          console.log('[v0] New game error:', error)
          return NextResponse.json(
            { error: 'Failed to start new game' },
            { status: 500 }
          )
        }
        console.log('[v0] New game started successfully - all decks reset')
        return NextResponse.json({ success: true })
      }

      case 'leave_game': {
        const { playerId } = payload || {}
        
        if (!playerId) {
          return NextResponse.json(
            { error: 'Missing playerId' },
            { status: 400 }
          )
        }

        // Remove player from the room
        const { error } = await supabase
          .from('players')
          .delete()
          .eq('room_id', roomId)
          .eq('player_id', playerId)

        if (error) {
          return NextResponse.json(
            { error: 'Failed to leave game' },
            { status: 500 }
          )
        }
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (err) {
    console.log('[v0] Action API error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
