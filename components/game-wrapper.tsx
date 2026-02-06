'use client'

import { useEffect, useState } from 'react'
import { HomeScreen } from './home-screen'
import { Lobby } from './lobby'
import { GameBoard } from './game-board'
import { useGame } from '@/hooks/use-game'
import { getOrCreatePlayerId } from '@/lib/player-id'

export function GameWrapper() {
  const [view, setView] = useState<'home' | 'lobby' | 'game'>('home')
  const [roomId, setRoomId] = useState<string | null>(null)
  const [playerName, setPlayerName] = useState('')
  const { room, players, loading } = useGame(roomId)

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedRoomId = localStorage.getItem('card_party_room_id')
    const savedPlayerName = localStorage.getItem('card_party_player_name')
    
    if (savedRoomId && savedPlayerName) {
      setRoomId(savedRoomId)
      setPlayerName(savedPlayerName)
      setView('lobby') // Start in lobby, will auto-transition if game is playing
    }
  }, [])

  // Save session to localStorage
  useEffect(() => {
    if (roomId && playerName) {
      localStorage.setItem('card_party_room_id', roomId)
      localStorage.setItem('card_party_player_name', playerName)
    }
  }, [roomId, playerName])

  // Auto-transition to game when room phase changes
  useEffect(() => {
    if (room && room.game_phase === 'playing') {
      setView('game')
    }
  }, [room])

  // Re-register player on reconnect
  useEffect(() => {
    if (!roomId || !room || !playerName) return
    
    const playerId = getOrCreatePlayerId()
    const currentPlayer = players.find((p) => p.player_id === playerId)
    
    // If we're in the room but not in the players list, re-register
    if (!currentPlayer && view !== 'home') {
      const reRegister = async () => {
        try {
          const res = await fetch('/api/rooms/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              joinCode: room.join_code,
              playerName,
              playerId,
            }),
          })
          
          if (!res.ok) {
            console.log('[v0] Failed to re-register player')
          }
        } catch (err) {
          console.log('[v0] Re-registration error:', err)
        }
      }
      reRegister()
    }
  }, [roomId, room, players, playerName, view])

  const handleHostGame = (name: string, id: string, joinCode: string) => {
    setPlayerName(name)
    setRoomId(id)
    setView('lobby')
  }

  const handleJoinGame = (name: string, id: string, team: string) => {
    setPlayerName(name)
    setRoomId(id)
    setView('lobby')
  }

  const handleStartGame = () => {
    setView('game')
  }

  return (
    <>
      {view === 'home' && (
        <HomeScreen onHostGame={handleHostGame} onJoinGame={handleJoinGame} />
      )}

      {view === 'lobby' && roomId && (
        <Lobby roomId={roomId} onStartGame={handleStartGame} />
      )}

      {view === 'game' && roomId && (
        <GameBoard roomId={roomId} />
      )}
    </>
  )
}
