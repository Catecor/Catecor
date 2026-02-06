import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { pickRandomCard, getCardsForLevel, type LevelType } from '@/lib/cards'

export async function POST(request: NextRequest) {
  try {
    const { roomId, level } = await request.json()

    if (!roomId || !level) {
      return NextResponse.json(
        { error: 'Missing roomId or level' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Get current game room state
    const { data: room, error: roomError } = await supabase
      .from('game_rooms')
      .select('used_cards')
      .eq('id', roomId)
      .single()

    if (roomError || !room) {
      console.log('[v0] Room fetch error:', roomError)
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    // Get used cards for this level
    const usedCards = room.used_cards[level as LevelType] || []

    // Pick random card from available cards
    const card = pickRandomCard(level as LevelType, usedCards)

    if (!card) {
      return NextResponse.json(
        { error: 'No cards available in this level' },
        { status: 400 }
      )
    }

    // Add card to used cards and update database
    const updatedUsedCards = {
      ...room.used_cards,
      [level]: [...usedCards, card.id],
    }

    const { error: updateError } = await supabase
      .from('game_rooms')
      .update({
        current_card: {
          id: card.id,
          level: card.level,
          imageFile: card.imageFile,
          drawnAt: new Date().toISOString(),
        },
        used_cards: updatedUsedCards,
      })
      .eq('id', roomId)

    if (updateError) {
      console.log('[v0] Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update room' },
        { status: 500 }
      )
    }

    const totalCards = getCardsForLevel(level as LevelType).length
    
    return NextResponse.json({
      card: {
        id: card.id,
        level: card.level,
        imageFile: card.imageFile,
      },
      remainingCards: totalCards - updatedUsedCards[level].length,
    })
  } catch (err) {
    console.log('[v0] Draw card error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
