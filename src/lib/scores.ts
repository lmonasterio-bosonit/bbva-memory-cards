import type { Difficulty } from '../game/difficulty'
import { readStorage, writeStorage } from './storage'
import { SCORES_STORAGE_KEY } from './storageKeys'

type ScoreTable = Record<string, Partial<Record<Difficulty, number>>>

function normalize(player: string): string {
  return player.trim().toLocaleLowerCase()
}

export function getBestScore(player: string, difficulty: Difficulty): number {
  const table = readStorage<ScoreTable>(SCORES_STORAGE_KEY, {})
  return table[normalize(player)]?.[difficulty] ?? 0
}

/**
 * Guarda la puntuación si supera el récord anterior.
 * @returns `true` si es un nuevo récord.
 */
export function saveBestScore(player: string, difficulty: Difficulty, score: number): boolean {
  const table = readStorage<ScoreTable>(SCORES_STORAGE_KEY, {})
  const key = normalize(player)
  const previous = table[key]?.[difficulty] ?? 0
  if (score <= previous) return false
  writeStorage(SCORES_STORAGE_KEY, { ...table, [key]: { ...table[key], [difficulty]: score } })
  return true
}
