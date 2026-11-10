import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { identityRandom } from '../test/random'
import { DIFFICULTY_CONFIG } from './difficulty'
import { useMemoryGame } from './useMemoryGame'

describe('useMemoryGame', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('empieza en idle sin tablero', () => {
    const { result } = renderHook(() => useMemoryGame({ random: identityRandom }))
    expect(result.current.state.phase).toBe('idle')
    expect(result.current.state.board).toEqual([])
  })

  it('descuenta un segundo por tick y pasa a adivinar al terminar la cuenta atrás', () => {
    const { result } = renderHook(() => useMemoryGame({ random: identityRandom }))

    act(() => result.current.setDifficulty('medium'))
    act(() => result.current.start())
    expect(result.current.state.phase).toBe('memorize')
    expect(result.current.state.timeLeft).toBe(DIFFICULTY_CONFIG.medium.seconds)

    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.state.timeLeft).toBe(DIFFICULTY_CONFIG.medium.seconds - 1)

    act(() => vi.advanceTimersByTime((DIFFICULTY_CONFIG.medium.seconds - 1) * 1000))
    expect(result.current.state.timeLeft).toBe(0)
    expect(result.current.state.phase).toBe('guess')

    // El intervalo se ha limpiado: no sigue descontando.
    act(() => vi.advanceTimersByTime(5000))
    expect(result.current.state.timeLeft).toBe(0)
  })

  it('tras ganar la ronda arranca otra automáticamente pasado el retardo', () => {
    const { result } = renderHook(() =>
      useMemoryGame({ random: identityRandom, roundDelayMs: 500 }),
    )

    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(DIFFICULTY_CONFIG.low.seconds * 1000))
    expect(result.current.state.phase).toBe('guess')

    // Con identityRandom el tablero está ordenado y el objetivo es el 1 (posición 0).
    const target = result.current.state.targets[0] as number
    act(() => result.current.pick(target - 1))
    expect(result.current.state.phase).toBe('roundWon')
    expect(result.current.state.score).toBe(DIFFICULTY_CONFIG.low.points)

    act(() => vi.advanceTimersByTime(499))
    expect(result.current.state.phase).toBe('roundWon')

    act(() => vi.advanceTimersByTime(1))
    expect(result.current.state.phase).toBe('memorize')
    expect(result.current.state.round).toBe(2)
    expect(result.current.state.score).toBe(DIFFICULTY_CONFIG.low.points)
    expect(result.current.state.revealed).toEqual({})
  })

  it('un fallo termina la partida y reset vuelve a idle', () => {
    const { result } = renderHook(() => useMemoryGame({ random: identityRandom }))

    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(DIFFICULTY_CONFIG.low.seconds * 1000))

    const target = result.current.state.targets[0] as number
    const wrongPosition = target === 1 ? 1 : 0
    act(() => result.current.pick(wrongPosition))
    expect(result.current.state.phase).toBe('over')

    act(() => result.current.reset())
    expect(result.current.state.phase).toBe('idle')
  })

  it('respeta el reto de 3 números al crear la ronda', () => {
    const { result } = renderHook(() => useMemoryGame({ random: identityRandom }))
    act(() => result.current.setTargetsPerRound(3))
    act(() => result.current.start())
    expect(result.current.state.targets).toHaveLength(3)
  })
})
