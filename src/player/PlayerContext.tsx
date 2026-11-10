import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { PLAYER_STORAGE_KEY } from '../lib/storageKeys'
import { readStorage, removeStorage, writeStorage } from '../lib/storage'
import { PlayerContext } from './context'

interface PlayerProviderProps {
  children: ReactNode
  /** Permite fijar el jugador inicial (útil en tests). Si se omite, se lee de localStorage. */
  initialName?: string | null
}

/** Mantiene el jugador registrado y lo persiste en localStorage. */
export function PlayerProvider({ children, initialName }: PlayerProviderProps) {
  const [name, setNameState] = useState<string | null>(() =>
    initialName !== undefined ? initialName : readStorage<string | null>(PLAYER_STORAGE_KEY, null),
  )

  const setName = useCallback((next: string) => {
    setNameState(next)
    writeStorage(PLAYER_STORAGE_KEY, next)
  }, [])

  const clearName = useCallback(() => {
    setNameState(null)
    removeStorage(PLAYER_STORAGE_KEY)
  }, [])

  const value = useMemo(() => ({ name, setName, clearName }), [name, setName, clearName])
  return <PlayerContext value={value}>{children}</PlayerContext>
}
