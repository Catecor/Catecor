const PLAYER_ID_KEY = 'card_party_player_id'

export function getOrCreatePlayerId(): string {
  if (typeof window === 'undefined') {
    return 'server'
  }

  let playerId = localStorage.getItem(PLAYER_ID_KEY)

  if (!playerId) {
    playerId = `player_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    localStorage.setItem(PLAYER_ID_KEY, playerId)
  }

  return playerId
}
