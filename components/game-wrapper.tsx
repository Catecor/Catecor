'use client'

import { useEffect, useState } from 'react'
import { HomeScreen } from './home-screen'
import { Lobby } from './lobby'
import { GameBoard } from './game-board'
import { useGame } from '@/hooks/use-game'

export function GameWrapper() {
  const [view, setView] = useState<'home' | 'lobby' | 'game'>('home')
  const [roomId, setRoomId] = useState<string | null>(null)
  const [playerName, setPlayerName] = useState('')
  const { room, loading } = useGame(roomId)

  // Auto-transition to game when room phase changes
  useEffect(() => {
    if (room && room.game_phase === 'playing') {
      setView('game')
    }
  }, [room])

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
