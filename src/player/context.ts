import { createContext } from 'react'

export interface PlayerContextValue {
  /** Nombre del jugador registrado o `null` si todavía no se ha registrado. */
  name: string | null
  setName: (name: string) => void
  clearName: () => void
}

export const PlayerContext = createContext<PlayerContextValue | null>(null)
