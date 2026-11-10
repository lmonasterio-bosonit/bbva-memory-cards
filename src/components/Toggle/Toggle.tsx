import { useId } from 'react'
import styles from './Toggle.module.css'

export interface ToggleProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

/** Interruptor accesible (checkbox con `role="switch"`). */
export function Toggle({ label, description, checked, onChange, disabled = false }: ToggleProps) {
  const id = useId()
  const descriptionId = `${id}-description`

  return (
    <div className={[styles.toggle, disabled ? styles.disabled : ''].join(' ').trim()}>
      <input
        id={id}
        type="checkbox"
        role="switch"
        className="visually-hidden"
        checked={checked}
        aria-checked={checked}
        disabled={disabled}
        aria-describedby={description ? descriptionId : undefined}
        onChange={(event) => onChange(event.target.checked)}
      />
      <label htmlFor={id} className={styles.control}>
        <span className={styles.track} aria-hidden="true">
          <span className={styles.thumb} />
        </span>
        <span className={styles.label}>{label}</span>
      </label>
      {description && (
        <span id={descriptionId} className={styles.description}>
          {description}
        </span>
      )}
    </div>
  )
}
