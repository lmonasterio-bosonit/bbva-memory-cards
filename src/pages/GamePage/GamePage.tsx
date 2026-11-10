import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Board } from '../../components/Board/Board'
import { placeholderCells } from '../../components/Board/placeholderCells'
import { Button } from '../../components/Button/Button'
import { Countdown } from '../../components/Countdown/Countdown'
import { DifficultySelector } from '../../components/DifficultySelector/DifficultySelector'
import { Stat } from '../../components/Stat/Stat'
import { Toggle } from '../../components/Toggle/Toggle'
import type { RandomFn } from '../../game/board'
import { DIFFICULTY_CONFIG } from '../../game/difficulty'
import { currentTarget, isPlaying } from '../../game/reducer'
import { useMemoryGame } from '../../game/useMemoryGame'
import { useBestScore } from '../../hooks/useBestScore'
import { VIBRATION, vibrate } from '../../lib/vibrate'
import { usePlayer } from '../../player/usePlayer'
import styles from './GamePage.module.css'

export interface GamePageProps {
  /** Fuente de aleatoriedad (inyectable en tests). */
  random?: RandomFn
  /** Pausa entre rondas en ms (inyectable en tests). */
  roundDelayMs?: number
}

/** Vista del juego: marcador, configuración, estado de la ronda y tablero. */
export function GamePage({ random, roundDelayMs }: GamePageProps) {
  const { name } = usePlayer()
  const player = name ?? 'Jugador'

  const game = useMemoryGame({ random, roundDelayMs })
  const { state } = game
  const { best, submit } = useBestScore(player, state.difficulty)
  const [isRecord, setIsRecord] = useState(false)

  const config = DIFFICULTY_CONFIG[state.difficulty]
  const playing = isPlaying(state)
  const target = currentTarget(state)

  // Vibración breve en cada acierto.
  useEffect(() => {
    if (state.score > 0) vibrate(VIBRATION.correct)
  }, [state.score])

  // Al terminar la partida: vibración larga y registro del récord (una sola vez por partida).
  const handledGame = useRef(0)
  useEffect(() => {
    if (state.phase !== 'over' || handledGame.current === state.gameId) return
    handledGame.current = state.gameId
    vibrate(VIBRATION.gameOver)
    setIsRecord(submit(state.score))
  }, [state.phase, state.gameId, state.score, submit])

  // En móvil el tablero queda por debajo de los controles: al empezar lo traemos a la vista.
  const statusRef = useRef<HTMLElement>(null)
  const handleStart = () => {
    setIsRecord(false)
    game.start()
    const status = statusRef.current
    if (status && typeof status.scrollIntoView === 'function') {
      status.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className={styles.page}>
      <dl className={styles.stats}>
        <Stat label="Jugador" value={player} />
        <Stat label="Puntos" value={state.score} />
        <Stat label={`Récord · ${config.label}`} value={best} highlight={isRecord} />
        <Stat label="Ronda" value={state.round} />
      </dl>

      <section className={styles.controls} aria-label="Configuración de la partida">
        <DifficultySelector
          value={state.difficulty}
          onChange={game.setDifficulty}
          disabled={playing}
        />
        <Toggle
          label="Reto: 3 números"
          description="Encuentra tres números seguidos en cada ronda."
          checked={state.targetsPerRound === 3}
          onChange={(checked) => game.setTargetsPerRound(checked ? 3 : 1)}
          disabled={playing}
        />
        <Button size="lg" fullWidth onClick={handleStart} disabled={playing}>
          {state.phase === 'over' ? 'Jugar de nuevo' : 'Empezar'}
        </Button>
      </section>

      <section ref={statusRef} className={styles.status} aria-live="polite" aria-atomic="true">
        {state.phase === 'idle' && (
          <p className={styles.hint}>
            Pulsa «Empezar». Los números se verán durante {config.seconds} segundos; memoriza dónde
            está cada uno.
          </p>
        )}
        {state.phase === 'memorize' && (
          <div className={styles.memorize}>
            <Countdown seconds={state.timeLeft} total={config.seconds} />
            <p className={styles.message}>Memoriza las posiciones…</p>
          </div>
        )}
        {state.phase === 'guess' && target !== null && (
          <div>
            <p className={styles.question}>
              ¿Dónde está el <strong className={styles.target}>{target}</strong>?
            </p>
            {state.targets.length > 1 && (
              <p className={styles.hint}>
                Número {state.targetIndex + 1} de {state.targets.length}
              </p>
            )}
          </div>
        )}
        {state.phase === 'roundWon' && <p className={styles.message}>¡Ronda superada!</p>}
        {state.phase === 'over' && (
          <div className={styles.gameOver}>
            <p className={styles.message}>Fin de la partida</p>
            <p className={styles.hint}>
              Has conseguido <strong>{state.score}</strong> puntos en {state.round}{' '}
              {state.round === 1 ? 'ronda' : 'rondas'}.
              {isRecord && <strong className={styles.record}> ¡Nuevo récord!</strong>}
            </p>
          </div>
        )}
      </section>

      <Board
        cells={state.phase === 'idle' ? placeholderCells() : state.board}
        revealed={state.revealed}
        showValues={state.phase === 'memorize'}
        interactive={state.phase === 'guess'}
        onPick={game.pick}
      />

      <p className={styles.footerLink}>
        <Link to="/">Cambiar de jugador</Link>
      </p>
    </div>
  )
}
