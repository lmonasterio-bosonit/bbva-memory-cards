export const DIFFICULTIES = ['low', 'medium', 'high'] as const

export type Difficulty = (typeof DIFFICULTIES)[number]

export interface DifficultyConfig {
  /** Texto visible para el jugador. */
  label: string
  /** Segundos que los números permanecen visibles. */
  seconds: number
  /** Puntos que se suman por cada acierto. */
  points: number
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  low: { label: 'Baja', seconds: 10, points: 10 },
  medium: { label: 'Media', seconds: 5, points: 20 },
  high: { label: 'Alta', seconds: 2, points: 30 },
}

export const DEFAULT_DIFFICULTY: Difficulty = 'low'

export function isDifficulty(value: unknown): value is Difficulty {
  return typeof value === 'string' && (DIFFICULTIES as readonly string[]).includes(value)
}
