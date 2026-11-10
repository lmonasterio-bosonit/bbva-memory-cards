import { BOARD_SIZE, type Cell } from '../../game/board'

/** Tablero vacío (sin números) para mostrar antes de empezar la partida. */
export function placeholderCells(): Cell[] {
  return Array.from({ length: BOARD_SIZE }, (_, position) => ({ position, value: 0 }))
}
