import styles from './Countdown.module.css'

export interface CountdownProps {
  /** Segundos restantes. */
  seconds: number
  /** Segundos totales, para dibujar el progreso. */
  total: number
}

const RADIUS = 28
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** Anillo de cuenta atrás con los segundos restantes. */
export function Countdown({ seconds, total }: CountdownProps) {
  const progress = total > 0 ? Math.max(0, Math.min(1, seconds / total)) : 0
  const offset = CIRCUMFERENCE * (1 - progress)
  const urgent = seconds <= 2

  return (
    <div
      className={[styles.countdown, urgent ? styles.urgent : ''].join(' ').trim()}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Quedan ${seconds} segundos`}
    >
      <svg className={styles.ring} viewBox="0 0 64 64" aria-hidden="true">
        <circle className={styles.track} cx="32" cy="32" r={RADIUS} />
        <circle
          className={styles.progress}
          cx="32"
          cy="32"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <span className={styles.seconds} aria-hidden="true">
        {seconds}
      </span>
    </div>
  )
}
