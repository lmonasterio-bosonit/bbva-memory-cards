import { describe, expect, it } from 'vitest'
import { identityRandom, seededRandom } from '../test/random'
import { BOARD_SIZE, createBoard, createRound, pickTargets, shuffle } from './board'

describe('shuffle', () => {
  it('devuelve una permutación sin mutar el original', () => {
    const original = [1, 2, 3, 4, 5]
    const result = shuffle(original, seededRandom(42))
    expect(original).toEqual([1, 2, 3, 4, 5])
    expect(result).toHaveLength(5)
    expect([...result].sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('con random = 0 conserva el orden original', () => {
    expect(shuffle([1, 2, 3], identityRandom)).toEqual([1, 2, 3])
  })

  it('es determinista para la misma semilla', () => {
    expect(shuffle([1, 2, 3, 4, 5, 6], seededRandom(7))).toEqual(
      shuffle([1, 2, 3, 4, 5, 6], seededRandom(7)),
    )
  })
})

describe('createBoard', () => {
  it('crea 9 casillas con los números 1..9 sin repetir', () => {
    const board = createBoard(seededRandom(3))
    expect(board).toHaveLength(BOARD_SIZE)
    expect(board.map((cell) => cell.position)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
    expect(board.map((cell) => cell.value).sort((a, b) => a - b)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9,
    ])
  })

  it('baraja las posiciones (dos semillas distintas dan tableros distintos)', () => {
    const a = createBoard(seededRandom(1)).map((cell) => cell.value)
    const b = createBoard(seededRandom(2)).map((cell) => cell.value)
    expect(a).not.toEqual(b)
  })
})

describe('pickTargets', () => {
  const board = createBoard(identityRandom)

  it('elige tantos números distintos como se piden', () => {
    const targets = pickTargets(board, 3, seededRandom(5))
    expect(targets).toHaveLength(3)
    expect(new Set(targets).size).toBe(3)
    targets.forEach((target) => expect(target).toBeGreaterThanOrEqual(1))
    targets.forEach((target) => expect(target).toBeLessThanOrEqual(9))
  })

  it('acota el número de objetivos entre 1 y el tamaño del tablero', () => {
    expect(pickTargets(board, 0, identityRandom)).toHaveLength(1)
    expect(pickTargets(board, 50, identityRandom)).toHaveLength(BOARD_SIZE)
  })
})

describe('createRound', () => {
  it('devuelve tablero y objetivos coherentes', () => {
    const round = createRound(3, seededRandom(9))
    const values = round.board.map((cell) => cell.value)
    expect(round.targets).toHaveLength(3)
    round.targets.forEach((target) => expect(values).toContain(target))
  })
})
