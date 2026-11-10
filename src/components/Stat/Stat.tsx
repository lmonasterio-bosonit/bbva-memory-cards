import type { ReactNode } from 'react'
import styles from './Stat.module.css'

export interface StatProps {
  label: string
  value: ReactNode
  /** Resalta el valor (por ejemplo, un nuevo récord). */
  highlight?: boolean
}

/** Pequeña tarjeta "etiqueta + valor" para el marcador. */
export function Stat({ label, value, highlight = false }: StatProps) {
  return (
    <div className={[styles.stat, highlight ? styles.highlight : ''].join(' ').trim()}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{value}</dd>
    </div>
  )
}
