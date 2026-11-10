import { useCallback, useEffect, useReducer } from 'react'
import { createRound, type RandomFn } from './board'
import type { Difficulty } from './difficulty'
import { gameReducer, initialGameState, type GameState, type TargetsPerRound } from './reducer'

export interface UseMemoryGameOptions {
  /** Fuente de aleatoriedad (inyectable en tests). */
  random?: RandomFn
  /** Milisegundos que se muestra el acierto en verde antes de la siguiente ronda. */
  roundDelayMs?: number
}

export interface MemoryGame {
  state: GameState
  start: () => void
  pick: (position: number) => void
  setDifficulty: (difficulty: Difficulty) => void
  setTargetsPerRound: (count: TargetsPerRound) => void
  reset: () => void
}

export const DEFAULT_ROUND_DELAY_MS = 700

/**
 * Orquesta la máquina de estados del juego (`gameReducer`) con los temporizadores:
 * cuenta atrás de la fase de memorización y pausa entre rondas.
 */
export function useMemoryGame({
  random = Math.random,
  roundDelayMs = DEFAULT_ROUND_DELAY_MS,
}: UseMemoryGameOptions = {}): MemoryGame {
  const [state, dispatch] = useReducer(gameReducer, initialGameState)
  const { phase, targetsPerRound } = state

  const start = useCallback(() => {
    dispatch({ type: 'start', round: createRound(targetsPerRound, random) })
  }, [random, targetsPerRound])

  const pick = useCallback((position: number) => dispatch({ type: 'pick', position }), [])
  const reset = useCallback(() => dispatch({ type: 'reset' }), [])
  const setDifficulty = useCallback(
    (difficulty: Difficulty) => dispatch({ type: 'setDifficulty', difficulty }),
    [],
  )
  const setTargetsPerRound = useCallback(
    (count: TargetsPerRound) => dispatch({ type: 'setTargetsPerRound', count }),
    [],
  )

  // Cuenta atrás mientras los números están visibles.
  useEffect(() => {
    if (phase !== 'memorize') return
    const id = window.setInterval(() => dispatch({ type: 'tick' }), 1000)
    return () => window.clearInterval(id)
  }, [phase])

  // Tras acertar toda la ronda, mostramos el verde un instante y empezamos la siguiente.
  useEffect(() => {
    if (phase !== 'roundWon') return
    const id = window.setTimeout(start, roundDelayMs)
    return () => window.clearTimeout(id)
  }, [phase, start, roundDelayMs])

  return { state, start, pick, setDifficulty, setTargetsPerRound, reset }
}
