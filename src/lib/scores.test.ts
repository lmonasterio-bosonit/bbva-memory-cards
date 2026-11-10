import { describe, expect, it } from 'vitest'
import { getBestScore, saveBestScore } from './scores'

describe('scores', () => {
  it('sin partidas el récord es 0', () => {
    expect(getBestScore('Ana', 'low')).toBe(0)
  })

  it('guarda solo cuando se supera el récord', () => {
    expect(saveBestScore('Ana', 'low', 30)).toBe(true)
    expect(saveBestScore('Ana', 'low', 20)).toBe(false)
    expect(saveBestScore('Ana', 'low', 30)).toBe(false)
    expect(saveBestScore('Ana', 'low', 40)).toBe(true)
    expect(getBestScore('Ana', 'low')).toBe(40)
  })

  it('separa los récords por dificultad y por jugador', () => {
    saveBestScore('Ana', 'low', 10)
    saveBestScore('Ana', 'high', 90)
    saveBestScore('Luis', 'low', 50)
    expect(getBestScore('Ana', 'low')).toBe(10)
    expect(getBestScore('Ana', 'high')).toBe(90)
    expect(getBestScore('Luis', 'low')).toBe(50)
    expect(getBestScore('Luis', 'high')).toBe(0)
  })

  it('ignora mayúsculas y espacios en el nombre', () => {
    saveBestScore('  Ana ', 'medium', 20)
    expect(getBestScore('ana', 'medium')).toBe(20)
  })
})
