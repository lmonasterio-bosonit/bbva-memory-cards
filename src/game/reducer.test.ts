import { describe, expect, it } from 'vitest'
import { createBoard, type RoundSetup } from './board'
import { DIFFICULTY_CONFIG } from './difficulty'
import {
  currentTarget,
  gameReducer,
  initialGameState,
  isPlaying,
  type GameAction,
  type GameState,
} from './reducer'
import { identityRandom } from '../test/random'

/** Tablero ordenado: la casilla i contiene el número i + 1. */
const board = createBoard(identityRandom)

function round(targets: number[]): RoundSetup {
  return { board, targets }
}

function run(actions: GameAction[], from: GameState = initialGameState): GameState {
  return actions.reduce(gameReducer, from)
}

/** Deja el juego en fase de adivinar con los objetivos indicados. */
function inGuessPhase(targets: number[], from: GameState = initialGameState): GameState {
  const started = gameReducer(from, { type: 'start', round: round(targets) })
  const ticks = Array.from({ length: started.timeLeft }, (): GameAction => ({ type: 'tick' }))
  return run(ticks, started)
}

describe('gameReducer', () => {
  describe('configuración', () => {
    it('cambia la dificultad mientras no se está jugando', () => {
      const state = gameReducer(initialGameState, { type: 'setDifficulty', difficulty: 'high' })
      expect(state.difficulty).toBe('high')
    })

    it('ignora cambios de configuración durante la partida', () => {
      const playing = gameReducer(initialGameState, { type: 'start', round: round([1]) })
      expect(gameReducer(playing, { type: 'setDifficulty', difficulty: 'high' })).toBe(playing)
      expect(gameReducer(playing, { type: 'setTargetsPerRound', count: 3 })).toBe(playing)
    })

    it('permite cambiar el reto de 3 números fuera de la partida', () => {
      const state = gameReducer(initialGameState, { type: 'setTargetsPerRound', count: 3 })
      expect(state.targetsPerRound).toBe(3)
    })
  })

  describe('start', () => {
    it('empieza una partida en fase de memorización con el tiempo de la dificultad', () => {
      const state = run([
        { type: 'setDifficulty', difficulty: 'medium' },
        { type: 'start', round: round([4]) },
      ])
      expect(state.phase).toBe('memorize')
      expect(state.timeLeft).toBe(DIFFICULTY_CONFIG.medium.seconds)
      expect(state.board).toBe(board)
      expect(state.targets).toEqual([4])
      expect(state.score).toBe(0)
      expect(state.round).toBe(1)
      expect(state.gameId).toBe(1)
      expect(isPlaying(state)).toBe(true)
    })

    it('reinicia la puntuación al empezar tras una derrota y suma un nuevo gameId', () => {
      const lost = gameReducer(inGuessPhase([1]), { type: 'pick', position: 5 })
      expect(lost.phase).toBe('over')
      const again = gameReducer(lost, { type: 'start', round: round([2]) })
      expect(again.score).toBe(0)
      expect(again.round).toBe(1)
      expect(again.gameId).toBe(lost.gameId + 1)
      expect(again.revealed).toEqual({})
    })
  })

  describe('tick', () => {
    it('descuenta segundos y pasa a adivinar al llegar a 0', () => {
      const started = run([
        { type: 'setDifficulty', difficulty: 'high' },
        { type: 'start', round: round([1]) },
      ])
      const one = gameReducer(started, { type: 'tick' })
      expect(one.timeLeft).toBe(1)
      expect(one.phase).toBe('memorize')
      const zero = gameReducer(one, { type: 'tick' })
      expect(zero.timeLeft).toBe(0)
      expect(zero.phase).toBe('guess')
      expect(currentTarget(zero)).toBe(1)
    })

    it('no hace nada fuera de la fase de memorización', () => {
      expect(gameReducer(initialGameState, { type: 'tick' })).toBe(initialGameState)
    })
  })

  describe('pick', () => {
    it('ignora pulsaciones fuera de la fase de adivinar', () => {
      const memorizing = gameReducer(initialGameState, { type: 'start', round: round([1]) })
      expect(gameReducer(memorizing, { type: 'pick', position: 0 })).toBe(memorizing)
      expect(gameReducer(initialGameState, { type: 'pick', position: 0 })).toBe(initialGameState)
    })

    it('acierto: marca en verde, suma puntos y gana la ronda', () => {
      const state = gameReducer(inGuessPhase([7]), { type: 'pick', position: 6 })
      expect(state.revealed[6]).toBe('correct')
      expect(state.score).toBe(DIFFICULTY_CONFIG.low.points)
      expect(state.phase).toBe('roundWon')
    })

    it('fallo: marca en rojo, señala dónde estaba y termina la partida', () => {
      const state = gameReducer(inGuessPhase([7]), { type: 'pick', position: 0 })
      expect(state.revealed[0]).toBe('wrong')
      expect(state.revealed[6]).toBe('missed')
      expect(state.phase).toBe('over')
      expect(state.score).toBe(0)
      expect(isPlaying(state)).toBe(false)
    })

    it('la siguiente ronda conserva la puntuación y suma la ronda', () => {
      const won = gameReducer(inGuessPhase([7]), { type: 'pick', position: 6 })
      const next = gameReducer(won, { type: 'start', round: round([2]) })
      expect(next.phase).toBe('memorize')
      expect(next.score).toBe(DIFFICULTY_CONFIG.low.points)
      expect(next.round).toBe(2)
      expect(next.gameId).toBe(won.gameId)
      expect(next.revealed).toEqual({})
    })

    it('ignora pulsar una casilla ya resuelta', () => {
      const guessing = inGuessPhase([1, 2, 3])
      const afterFirst = gameReducer(guessing, { type: 'pick', position: 0 })
      expect(afterFirst.phase).toBe('guess')
      expect(gameReducer(afterFirst, { type: 'pick', position: 0 })).toBe(afterFirst)
    })

    it('ignora posiciones fuera del tablero', () => {
      const guessing = inGuessPhase([1])
      expect(gameReducer(guessing, { type: 'pick', position: 99 })).toBe(guessing)
    })

    it('reto de 3 números: pide los tres en orden y suma puntos por cada acierto', () => {
      const guessing = inGuessPhase([3, 5, 9])
      expect(currentTarget(guessing)).toBe(3)

      const first = gameReducer(guessing, { type: 'pick', position: 2 })
      expect(first.phase).toBe('guess')
      expect(currentTarget(first)).toBe(5)
      expect(first.score).toBe(10)

      const second = gameReducer(first, { type: 'pick', position: 4 })
      expect(currentTarget(second)).toBe(9)
      expect(second.score).toBe(20)

      const third = gameReducer(second, { type: 'pick', position: 8 })
      expect(third.phase).toBe('roundWon')
      expect(third.score).toBe(30)
      expect(third.revealed).toEqual({ 2: 'correct', 4: 'correct', 8: 'correct' })
    })

    it('reto de 3 números: un fallo en el segundo número termina la partida', () => {
      const first = gameReducer(inGuessPhase([3, 5, 9]), { type: 'pick', position: 2 })
      const lost = gameReducer(first, { type: 'pick', position: 0 })
      expect(lost.phase).toBe('over')
      expect(lost.revealed).toEqual({ 2: 'correct', 0: 'wrong', 4: 'missed' })
    })
  })

  describe('reset', () => {
    it('vuelve al estado inicial conservando la configuración', () => {
      const configured = run([
        { type: 'setDifficulty', difficulty: 'high' },
        { type: 'setTargetsPerRound', count: 3 },
        { type: 'start', round: round([1, 2, 3]) },
      ])
      const state = gameReducer(configured, { type: 'reset' })
      expect(state.phase).toBe('idle')
      expect(state.difficulty).toBe('high')
      expect(state.targetsPerRound).toBe(3)
      expect(state.board).toEqual([])
      expect(state.score).toBe(0)
    })
  })

  it('currentTarget es null fuera de la fase de adivinar', () => {
    expect(currentTarget(initialGameState)).toBeNull()
  })
})
