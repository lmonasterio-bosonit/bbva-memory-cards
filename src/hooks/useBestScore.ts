import { useCallback, useReducer } from 'react'
import type { Difficulty } from '../game/difficulty'
import { getBestScore, saveBestScore } from '../lib/scores'

/** Récord del jugador para una dificultad, persistido en localStorage. */
export function useBestScore(player: string, difficulty: Difficulty) {
  // Leer localStorage es barato e idempotente; `version` fuerza un re-render tras guardar.
  const [, bumpVersion] = useReducer((version: number) => version + 1, 0)
  const best = getBestScore(player, difficulty)

  const submit = useCallback(
    (score: number): boolean => {
      const isRecord = saveBestScore(player, difficulty, score)
      if (isRecord) bumpVersion()
      return isRecord
    },
    [player, difficulty],
  )

  return { best, submit }
}
