import type { Cell } from '../../game/board'
import type { CellStatus } from '../../game/reducer'
import styles from './Board.module.css'

export interface BoardProps {
  cells: Cell[]
  /** Estado de las casillas ya resueltas, por posición. */
  revealed: Partial<Record<number, CellStatus>>
  /** Muestra todos los números (fase de memorización). */
  showValues: boolean
  /** Si es `false`, no se puede pulsar ninguna casilla. */
  interactive: boolean
  onPick: (position: number) => void
}

const STATUS_LABEL: Record<CellStatus, string> = {
  correct: 'acierto',
  wrong: 'fallo',
  missed: 'aquí estaba',
}

/** Rejilla 3x3 con las casillas del juego. Cada casilla es un botón accesible. */
export function Board({ cells, revealed, showValues, interactive, onPick }: BoardProps) {
  return (
    <fieldset className={styles.board}>
      <legend className="visually-hidden">Tablero</legend>
      {cells.map((cell) => {
        const status = revealed[cell.position]
        const visible = showValues || status !== undefined
        const disabled = !interactive || status !== undefined
        const label = `Casilla ${cell.position + 1}${
          visible ? `, número ${cell.value}` : ''
        }${status ? `, ${STATUS_LABEL[status]}` : ''}`

        return (
          <button
            key={cell.position}
            type="button"
            className={styles.cell}
            data-position={cell.position}
            data-status={status ?? (visible ? 'visible' : 'hidden')}
            disabled={disabled}
            aria-label={label}
            onClick={() => onPick(cell.position)}
          >
            <span className={styles.value} aria-hidden="true">
              {visible ? cell.value : '?'}
            </span>
          </button>
        )
      })}
    </fieldset>
  )
}
