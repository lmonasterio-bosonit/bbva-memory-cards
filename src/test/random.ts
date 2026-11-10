import type { RandomFn } from '../game/board'

/**
 * Generador pseudoaleatorio determinista (mulberry32) para tests reproducibles.
 */
export function seededRandom(seed = 1): RandomFn {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Devuelve siempre un valor justo por debajo de 1: en Fisher-Yates cada elemento se
 * "intercambia" consigo mismo, así que `shuffle` conserva el orden. Con él, el tablero
 * queda ordenado (la casilla N contiene el número N) y los objetivos son 1, 2, 3...
 */
export const identityRandom: RandomFn = () => 1 - Number.EPSILON
