'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useGame } from '@/hooks/use-game'
import type { LevelType } from '@/lib/cards'
import { LEVEL_LABELS } from '@/lib/cards'

const LEVELS: Array<{ id: LevelType; label: string }> = [
  { id: '1', label: 'Level 1' },
  { id: '2', label: 'Level 2' },
  { id: '3', label: 'Level 3' },
  { id: 'chance', label: 'CHANCE' },
]

export function GameBoard({ roomId }: { roomId: string }) {
  const { room, players, drawCard, getRemainingCards, updateGameRoom } = useGame(roomId)
  const [selectedCard, setSelectedCard] = useState<{
    imageFile: string
    level: LevelType
  } | null>(null)
  const [drawing, setDrawing] = useState(false)

  const teamAPlayers = players.filter((p) => p.team === 'A')
  const teamBPlayers = players.filter((p) => p.team === 'B')

  const handleDrawCard = async (level: LevelType) => {
    setDrawing(true)
    try {
      const card = await drawCard(level)
      if (card) {
        setSelectedCard({
          imageFile: card.imageFile,
          level: card.level,
        })
      }
    } finally {
      setDrawing(false)
    }
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
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">Card Party</h1>
          <p className="text-slate-400">Join Code: {room.join_code}</p>
        </div>

        {/* Teams */}
        <div className="grid grid-cols-2 gap-6">
          {/* Team A */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-bold text-blue-400 mb-4">
              {room.team_a_name}
            </h2>
            <div className="space-y-2">
              {teamAPlayers.map((player) => (
                <div
                  key={player.id}
                  className="text-slate-300 flex items-center gap-2"
                >
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  {player.player_name}
                  {player.is_host && (
                    <span className="text-xs bg-blue-600 px-2 py-1 rounded text-white ml-auto">
                      Host
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Team B */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-bold text-purple-400 mb-4">
              {room.team_b_name}
            </h2>
            <div className="space-y-2">
              {teamBPlayers.map((player) => (
                <div
                  key={player.id}
                  className="text-slate-300 flex items-center gap-2"
                >
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                  {player.player_name}
                  {player.is_host && (
                    <span className="text-xs bg-purple-600 px-2 py-1 rounded text-white ml-auto">
                      Host
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Card Levels */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {LEVELS.map((level) => {
            const remaining = getRemainingCards(level.id)
            const isExhausted = remaining === 0
            return (
              <Card
                key={level.id}
                className="bg-slate-800 border-slate-700 p-6 text-center space-y-4 hover:border-slate-600 transition-colors"
              >
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {level.label}
                  </h3>
                  <p className="text-2xl font-bold text-slate-300">
                    {remaining}
                  </p>
                  <p className="text-xs text-slate-500">cards left</p>
                </div>

                <Button
                  onClick={() => handleDrawCard(level.id)}
                  disabled={isExhausted || drawing}
                  className={`w-full ${
                    level.id === 'chance'
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-slate-600 hover:bg-slate-500'
                  } text-white disabled:opacity-50`}
                >
                  {drawing ? 'Drawing...' : 'Draw'}
                </Button>

                {isExhausted && (
                  <p className="text-xs text-red-400">No cards left</p>
                )}
              </Card>
            )
          })}
        </div>

        {/* Current Card Preview */}
        {room.current_card && (
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Last Card</h3>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-32 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={`/${room.current_card.imageFile}`}
                  alt={`Card ${room.current_card.id}`}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    const img = e.target as HTMLImageElement
                    img.src = '/placeholder.svg'
                  }}
                />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Card ID: {room.current_card.id}</p>
                <p className="text-slate-400 text-sm">Level: {LEVEL_LABELS[room.current_card.level]}</p>
                <p className="text-slate-500 text-xs mt-2">
                  {new Date(room.current_card.drawnAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Game Controls */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => updateGameRoom('new_game')}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            New Game
          </Button>
          <Button
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
          >
            Leave Game
          </Button>
        </div>
      </div>

      {/* Image Preview Modal */}
      <Dialog open={!!selectedCard} onOpenChange={() => setSelectedCard(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {LEVEL_LABELS[selectedCard?.level || '1']}
            </DialogTitle>
          </DialogHeader>
          {selectedCard && (
            <div className="relative w-full aspect-square bg-slate-800 rounded-lg overflow-hidden">
              <Image
                src={`/${selectedCard.imageFile}`}
                alt="Card preview"
                fill
                className="object-contain"
                priority
                onError={(e) => {
                  const img = e.target as HTMLImageElement
                  img.src = '/placeholder.svg'
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
