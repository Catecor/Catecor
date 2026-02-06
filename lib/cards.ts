export interface Card {
  id: string
  level: '1' | '2' | '3' | 'chance'
  imageFile: string
}

// Card data structure - maps card IDs to their image files
// Images should be extracted from the zip files to public/level-1, public/level-2, public/level-3, public/chance

export const LEVELS = ['1', '2', '3', 'chance'] as const
export type LevelType = (typeof LEVELS)[number]

export const LEVEL_LABELS: Record<LevelType, string> = {
  '1': 'Level 1',
  '2': 'Level 2',
  '3': 'Level 3',
  chance: 'CHANCE',
}

// Card definitions for each level
// These are placeholder IDs - they'll be used to track which cards have been drawn
export const CARDS: Record<LevelType, Card[]> = {
  '1': Array.from({ length: 20 }, (_, i) => ({
    id: `level1-${i + 1}`,
    level: '1',
    imageFile: `level-1/card-${String(i + 1).padStart(2, '0')}.png`,
  })),
  '2': Array.from({ length: 20 }, (_, i) => ({
    id: `level2-${i + 1}`,
    level: '2',
    imageFile: `level-2/card-${String(i + 1).padStart(2, '0')}.png`,
  })),
  '3': Array.from({ length: 20 }, (_, i) => ({
    id: `level3-${i + 1}`,
    level: '3',
    imageFile: `level-3/card-${String(i + 1).padStart(2, '0')}.png`,
  })),
  chance: Array.from({ length: 20 }, (_, i) => ({
    id: `chance-${i + 1}`,
    level: 'chance',
    imageFile: `chance/card-${String(i + 1).padStart(2, '0')}.png`,
  })),
}

/**
 * Get all available cards for a level
 */
export function getCardsForLevel(level: LevelType): Card[] {
  return CARDS[level] || []
}

/**
 * Get a random card from available pool
 * Cards are randomized at draw time from remaining cards
 */
export function pickRandomCard(
  level: LevelType,
  usedCardIds: string[]
): Card | null {
  const allCards = getCardsForLevel(level)
  const availableCards = allCards.filter(
    (card) => !usedCardIds.includes(card.id)
  )

  if (availableCards.length === 0) {
    return null
  }

  const randomIndex = Math.floor(Math.random() * availableCards.length)
  return availableCards[randomIndex]
}

/**
 * Get remaining card count for a level
 */
export function getRemainingCardCount(
  level: LevelType,
  usedCardIds: string[]
): number {
  return getCardsForLevel(level).length - usedCardIds.length
}
