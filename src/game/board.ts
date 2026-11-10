export const BOARD_SIZE = 9

/** Fuente de aleatoriedad inyectable (misma firma que `Math.random`) para poder testear. */
export type RandomFn = () => number

export interface Cell {
  /** Posición en el tablero (0..8). */
  position: number
  /** Número oculto en la casilla (1..9). */
  value: number
}

export interface RoundSetup {
  board: Cell[]
  /** Números que hay que encontrar en esta ronda, en orden. */
  targets: number[]
}

/** Fisher-Yates. Devuelve una copia barajada; no muta el original. */
export function shuffle<T>(items: readonly T[], random: RandomFn = Math.random): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const a = result[i] as T
    result[i] = result[j] as T
    result[j] = a
  }
  return result
}

/** Tablero con los números 1..9 sin repetir en posiciones aleatorias. */
export function createBoard(random: RandomFn = Math.random): Cell[] {
  const values = Array.from({ length: BOARD_SIZE }, (_, i) => i + 1)
  return shuffle(values, random).map((value, position) => ({ position, value }))
}

/** Elige `count` números distintos del tablero que el jugador tendrá que localizar. */
export function pickTargets(
  board: Cell[],
  count: number,
  random: RandomFn = Math.random,
): number[] {
  const safeCount = Math.max(1, Math.min(count, board.length))
  return shuffle(
    board.map((cell) => cell.value),
    random,
  ).slice(0, safeCount)
}

export function createRound(targetsPerRound: number, random: RandomFn = Math.random): RoundSetup {
  const board = createBoard(random)
  return { board, targets: pickTargets(board, targetsPerRound, random) }
}
