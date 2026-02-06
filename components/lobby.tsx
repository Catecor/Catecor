'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useGame } from '@/hooks/use-game'

export function Lobby({
  roomId,
  onStartGame,
}: {
  roomId: string
  onStartGame: () => void
}) {
  const { room, players, updateGameRoom } = useGame(roomId)
  const [editingTeam, setEditingTeam] = useState<'A' | 'B' | null>(null)
  const [editValue, setEditValue] = useState('')

  const isHost = room?.host_id === localStorage.getItem('card_party_player_id')
  const teamAPlayers = players.filter((p) => p.team === 'A')
  const teamBPlayers = players.filter((p) => p.team === 'B')
  const minPlayers = 2

  const handleUpdateTeamName = async (team: 'A' | 'B') => {
    if (editValue.trim()) {
      await updateGameRoom('update_team_name', {
        team,
        name: editValue.trim(),
      })
      setEditingTeam(null)
      setEditValue('')
    }
  }

  const handleStartGame = async () => {
    await updateGameRoom('start_game')
    onStartGame()
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">Card Party Lobby</h1>
          <p className="text-slate-400">Join Code: <span className="font-mono text-lg text-blue-400">{room.join_code}</span></p>
        </div>

        {/* Teams */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Team A */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            {editingTeam === 'A' ? (
              <div className="flex gap-2 mb-4">
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="Team name"
                  className="bg-slate-700 border-slate-600 text-white flex-1"
                  autoFocus
                />
                <Button
                  onClick={() => handleUpdateTeamName('A')}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  Save
                </Button>
                <Button
                  onClick={() => setEditingTeam(null)}
                  variant="outline"
                  className="border-slate-600"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-blue-400">
                  {room.team_a_name}
                </h2>
                {isHost && (
                  <Button
                    onClick={() => {
                      setEditingTeam('A')
                      setEditValue(room.team_a_name)
                    }}
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    size="sm"
                  >
                    Edit
                  </Button>
                )}
              </div>
            )}

            <div className="space-y-3">
              {teamAPlayers.length === 0 ? (
                <p className="text-slate-500 text-center py-4">Waiting for players...</p>
              ) : (
                teamAPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="bg-slate-700 rounded p-3 flex items-center gap-3"
                  >
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span className="text-slate-200 flex-1">{player.player_name}</span>
                    {player.is_host && (
                      <span className="text-xs bg-blue-600 px-2 py-1 rounded text-white">
                        Host
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 text-sm text-slate-400">
              {teamAPlayers.length} / 2 players
            </div>
          </Card>

          {/* Team B */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            {editingTeam === 'B' ? (
              <div className="flex gap-2 mb-4">
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="Team name"
                  className="bg-slate-700 border-slate-600 text-white flex-1"
                  autoFocus
                />
                <Button
                  onClick={() => handleUpdateTeamName('B')}
                  className="bg-purple-600 hover:bg-purple-700"
                  size="sm"
                >
                  Save
                </Button>
                <Button
                  onClick={() => setEditingTeam(null)}
                  variant="outline"
                  className="border-slate-600"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-purple-400">
                  {room.team_b_name}
                </h2>
                {isHost && (
                  <Button
                    onClick={() => {
                      setEditingTeam('B')
                      setEditValue(room.team_b_name)
                    }}
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    size="sm"
                  >
                    Edit
                  </Button>
                )}
              </div>
            )}

            <div className="space-y-3">
              {teamBPlayers.length === 0 ? (
                <p className="text-slate-500 text-center py-4">Waiting for players...</p>
              ) : (
                teamBPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="bg-slate-700 rounded p-3 flex items-center gap-3"
                  >
                    <div className="w-2 h-2 bg-purple-400 rounded-full" />
                    <span className="text-slate-200 flex-1">{player.player_name}</span>
                    {player.is_host && (
                      <span className="text-xs bg-purple-600 px-2 py-1 rounded text-white">
                        Host
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 text-sm text-slate-400">
              {teamBPlayers.length} / 2 players
            </div>
          </Card>
        </div>

        {/* Status & Controls */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Game Ready?</h3>
              <p className="text-slate-400">
                {players.length >= minPlayers
                  ? `✓ All set! You have ${players.length} players`
                  : `Need ${minPlayers - players.length} more player${minPlayers - players.length !== 1 ? 's' : ''}`}
              </p>
            </div>

            {isHost && (
              <Button
                onClick={handleStartGame}
                disabled={players.length < minPlayers}
                className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 px-8 h-12 text-lg"
              >
                Start Game
              </Button>
            )}

            {!isHost && (
              <div className="text-slate-400 text-sm">
                Waiting for host to start...
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
