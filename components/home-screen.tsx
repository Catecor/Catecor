'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { getOrCreatePlayerId } from '@/lib/player-id'

export function HomeScreen({
  onHostGame,
  onJoinGame,
}: {
  onHostGame: (name: string, roomId: string, joinCode: string) => void
  onJoinGame: (name: string, roomId: string, team: string) => void
}) {
  const [view, setView] = useState<'home' | 'host' | 'join'>('home')
  const [name, setName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const playerId = getOrCreatePlayerId()

  const handleHostGame = async () => {
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName: name.trim(), playerId }),
      })

      const data = await res.json()

      if (!res.ok) {
        console.log('[v0] Create room failed:', data)
        setError(data.error || 'Failed to create room')
        return
      }

      onHostGame(name.trim(), data.roomId, data.joinCode)
    } catch (err) {
      console.log('[v0] Host game error:', err)
      setError('Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinGame = async () => {
    if (!name.trim() || !joinCode.trim()) {
      setError('Please enter your name and join code')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          joinCode: joinCode.trim().toUpperCase(),
          playerName: name.trim(),
          playerId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to join room')
        return
      }

      onJoinGame(name.trim(), data.roomId, data.team)
    } catch (err) {
      console.log('[v0] Join game error:', err)
      setError('Failed to join room')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-700 bg-slate-900 shadow-2xl">
        <div className="p-8">
          {view === 'home' && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-2">
                  Card Party
                </h1>
                <p className="text-slate-400">
                  Team game for 4+ players
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => setView('host')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg"
                >
                  Host Game
                </Button>
                <Button
                  onClick={() => setView('join')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-lg"
                >
                  Join Game
                </Button>
              </div>
            </div>
          )}

          {view === 'host' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Host Game</h2>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Your Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  disabled={loading}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-700 rounded p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleHostGame}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? 'Creating...' : 'Create Room'}
                </Button>
                <Button
                  onClick={() => {
                    setView('home')
                    setError('')
                    setName('')
                  }}
                  variant="outline"
                  className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Back
                </Button>
              </div>
            </div>
          )}

          {view === 'join' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Join Game</h2>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Your Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  disabled={loading}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Join Code
                </label>
                <Input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ABC123"
                  disabled={loading}
                  className="bg-slate-800 border-slate-700 text-white uppercase text-center text-lg letter-spacing"
                />
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-700 rounded p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleJoinGame}
                  disabled={loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {loading ? 'Joining...' : 'Join Room'}
                </Button>
                <Button
                  onClick={() => {
                    setView('home')
                    setError('')
                    setName('')
                    setJoinCode('')
                  }}
                  variant="outline"
                  className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Back
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
