'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { LevelType } from '@/lib/cards'

export interface GameRoom {
  id: string
  join_code: string
  host_id: string
  team_a_name: string
  team_b_name: string
  active_team: 'A' | 'B'
  current_card: {
    id: string
    level: LevelType
    imageFile: string
    drawnAt: string
  } | null
  used_cards: Record<LevelType, string[]>
  game_phase: 'lobby' | 'playing' | 'ended'
  created_at: string
}

export interface Player {
  id: string
  room_id: string
  player_name: string
  player_id: string
  team: 'A' | 'B' | null
  is_host: boolean
  created_at: string
}

export function useGame(roomId: string | null) {
  const supabaseRef = useRef(createClient())
  const [room, setRoom] = useState<GameRoom | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch room data
  useEffect(() => {
    if (!roomId) {
      setLoading(false)
      return
    }

    const fetchRoom = async () => {
      try {
        const { data, error } = await supabaseRef.current
          .from('game_rooms')
          .select()
          .eq('id', roomId)
          .single()

        if (error) throw error
        setRoom(data)
        setError(null)
      } catch (err) {
        console.log('[v0] Fetch room error:', err)
        setError('Failed to load game')
      } finally {
        setLoading(false)
      }
    }

    fetchRoom()

    // Subscribe to changes
    const subscription = supabaseRef.current
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_rooms',
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          setRoom(payload.new as GameRoom)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [roomId])

  // Fetch players
  useEffect(() => {
    if (!roomId) return

    const fetchPlayers = async () => {
      try {
        const { data, error } = await supabaseRef.current
          .from('players')
          .select()
          .eq('room_id', roomId)

        if (error) throw error
        setPlayers(data || [])
      } catch (err) {
        console.log('[v0] Fetch players error:', err)
      }
    }

    fetchPlayers()

    const subscription = supabaseRef.current
      .channel(`players:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPlayers((prev) => [...prev, payload.new as Player])
          } else if (payload.eventType === 'DELETE') {
            setPlayers((prev) =>
              prev.filter((p) => p.id !== (payload.old as Player).id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [roomId])

  const drawCard = useCallback(
    async (level: LevelType) => {
      if (!roomId) return
      try {
        const res = await fetch('/api/draw-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, level }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error)
        }
        return data.card
      } catch (err) {
        console.log('[v0] Draw card error:', err)
        setError('Failed to draw card')
      }
    },
    [roomId]
  )

  const updateGameRoom = useCallback(
    async (action: string, payload?: Record<string, unknown>) => {
      if (!roomId) return
      try {
        const res = await fetch('/api/rooms/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, action, payload }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error)
          return false
        }
        return true
      } catch (err) {
        console.log('[v0] Update game error:', err)
        setError('Failed to update game')
        return false
      }
    },
    [roomId]
  )

  return {
    room,
    players,
    loading,
    error,
    drawCard,
    updateGameRoom,
    getRemainingCards: (level: LevelType) => {
      if (!room) return 0
      return 20 - (room.used_cards[level]?.length || 0)
    },
  }
}
