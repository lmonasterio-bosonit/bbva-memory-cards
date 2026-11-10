import { useContext } from 'react'
import { PlayerContext, type PlayerContextValue } from './context'

export function usePlayer(): PlayerContextValue {
  const context = useContext(PlayerContext)
  if (!context) throw new Error('usePlayer debe usarse dentro de <PlayerProvider>')
  return context
}
