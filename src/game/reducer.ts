import type { Cell, RoundSetup } from './board'
import { DEFAULT_DIFFICULTY, DIFFICULTY_CONFIG, type Difficulty } from './difficulty'

/**
 * Fases de una partida:
 *  - idle:      aún no se ha empezado (o se ha reiniciado).
 *  - memorize:  los números están visibles y corre la cuenta atrás.
 *  - guess:     los números están ocultos y el jugador busca el número pedido.
 *  - roundWon:  se han acertado todos los números de la ronda; empieza otra enseguida.
 *  - over:      el jugador ha fallado; la partida ha terminado.
 */
export type Phase = 'idle' | 'memorize' | 'guess' | 'roundWon' | 'over'

export type CellStatus = 'correct' | 'wrong' | 'missed'

export type TargetsPerRound = 1 | 3

export interface GameState {
  phase: Phase
  difficulty: Difficulty
  targetsPerRound: TargetsPerRound
  board: Cell[]
  targets: number[]
  targetIndex: number
  /** Estado visual de las casillas ya resueltas, indexado por posición. */
  revealed: Partial<Record<number, CellStatus>>
  score: number
  /** Ronda actual dentro de la partida (1..n). */
  round: number
  /** Identificador incremental de partida; cambia cada vez que se empieza desde cero. */
  gameId: number
  /** Segundos restantes de la fase de memorización. */
  timeLeft: number
}

export type GameAction =
  | { type: 'setDifficulty'; difficulty: Difficulty }
  | { type: 'setTargetsPerRound'; count: TargetsPerRound }
  | { type: 'start'; round: RoundSetup }
  | { type: 'tick' }
  | { type: 'pick'; position: number }
  | { type: 'reset' }

export const initialGameState: GameState = {
  phase: 'idle',
  difficulty: DEFAULT_DIFFICULTY,
  targetsPerRound: 1,
  board: [],
  targets: [],
  targetIndex: 0,
  revealed: {},
  score: 0,
  round: 0,
  gameId: 0,
  timeLeft: 0,
}

/** El número que el jugador debe encontrar ahora mismo (o `null` si no toca adivinar). */
export function currentTarget(state: GameState): number | null {
  return state.phase === 'guess' ? (state.targets[state.targetIndex] ?? null) : null
}

export function isPlaying(state: GameState): boolean {
  return state.phase === 'memorize' || state.phase === 'guess' || state.phase === 'roundWon'
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'setDifficulty':
      if (isPlaying(state)) return state
      return { ...state, difficulty: action.difficulty }

    case 'setTargetsPerRound':
      if (isPlaying(state)) return state
      return { ...state, targetsPerRound: action.count }

    case 'start': {
      const continuing = state.phase === 'roundWon'
      return {
        ...state,
        phase: 'memorize',
        board: action.round.board,
        targets: action.round.targets,
        targetIndex: 0,
        revealed: {},
        score: continuing ? state.score : 0,
        round: continuing ? state.round + 1 : 1,
        gameId: continuing ? state.gameId : state.gameId + 1,
        timeLeft: DIFFICULTY_CONFIG[state.difficulty].seconds,
      }
    }

    case 'tick': {
      if (state.phase !== 'memorize') return state
      const timeLeft = Math.max(0, state.timeLeft - 1)
      return { ...state, timeLeft, phase: timeLeft === 0 ? 'guess' : 'memorize' }
    }

    case 'pick': {
      if (state.phase !== 'guess') return state
      const cell = state.board[action.position]
      if (!cell || state.revealed[action.position]) return state

      const target = state.targets[state.targetIndex]
      if (cell.value !== target) {
        const missed = state.board.find((c) => c.value === target)
        return {
          ...state,
          phase: 'over',
          revealed: {
            ...state.revealed,
            [action.position]: 'wrong',
            ...(missed ? { [missed.position]: 'missed' as const } : {}),
          },
        }
      }

      const targetIndex = state.targetIndex + 1
      const roundDone = targetIndex >= state.targets.length
      return {
        ...state,
        phase: roundDone ? 'roundWon' : 'guess',
        targetIndex,
        revealed: { ...state.revealed, [action.position]: 'correct' },
        score: state.score + DIFFICULTY_CONFIG[state.difficulty].points,
      }
    }

    case 'reset':
      return {
        ...initialGameState,
        difficulty: state.difficulty,
        targetsPerRound: state.targetsPerRound,
        gameId: state.gameId,
      }

    default:
      return state
  }
}
