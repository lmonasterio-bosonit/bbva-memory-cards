import { DIFFICULTIES, DIFFICULTY_CONFIG, type Difficulty } from '../../game/difficulty'
import styles from './DifficultySelector.module.css'

export interface DifficultySelectorProps {
  value: Difficulty
  onChange: (difficulty: Difficulty) => void
  disabled?: boolean
}

/** Grupo de botones de radio para elegir la dificultad (tiempo visible y puntos por acierto). */
export function DifficultySelector({ value, onChange, disabled = false }: DifficultySelectorProps) {
  return (
    <fieldset className={styles.fieldset} disabled={disabled}>
      <legend className={styles.legend}>Dificultad</legend>
      <div className={styles.options}>
        {DIFFICULTIES.map((difficulty) => {
          const config = DIFFICULTY_CONFIG[difficulty]
          const checked = difficulty === value
          return (
            <label
              key={difficulty}
              className={[styles.option, checked ? styles.checked : ''].join(' ').trim()}
            >
              <input
                type="radio"
                name="difficulty"
                value={difficulty}
                checked={checked}
                onChange={() => onChange(difficulty)}
                className="visually-hidden"
              />
              <span className={styles.name}>{config.label}</span>
              <span className={styles.meta}>
                {config.seconds} s · {config.points} pts
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
