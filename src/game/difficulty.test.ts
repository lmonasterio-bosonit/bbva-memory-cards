import { describe, expect, it } from 'vitest'
import { DIFFICULTIES, DIFFICULTY_CONFIG, isDifficulty } from './difficulty'

describe('difficulty', () => {
  it('define los tiempos y puntos del enunciado', () => {
    expect(DIFFICULTY_CONFIG.low).toMatchObject({ seconds: 10, points: 10 })
    expect(DIFFICULTY_CONFIG.medium).toMatchObject({ seconds: 5, points: 20 })
    expect(DIFFICULTY_CONFIG.high).toMatchObject({ seconds: 2, points: 30 })
  })

  it('isDifficulty reconoce solo los valores válidos', () => {
    DIFFICULTIES.forEach((difficulty) => expect(isDifficulty(difficulty)).toBe(true))
    expect(isDifficulty('extreme')).toBe(false)
    expect(isDifficulty(1)).toBe(false)
  })
})
