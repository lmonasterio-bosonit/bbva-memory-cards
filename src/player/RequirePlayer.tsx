import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { usePlayer } from './usePlayer'

/** Protege rutas que necesitan un jugador registrado; si no lo hay, vuelve al inicio. */
export function RequirePlayer({ children }: { children: ReactNode }) {
  const { name } = usePlayer()
  if (!name) return <Navigate to="/" replace />
  return children
}
