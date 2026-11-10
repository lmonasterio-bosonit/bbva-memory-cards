import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { PLAYER_STORAGE_KEY } from '../lib/storageKeys'
import { PlayerProvider } from './PlayerContext'
import { usePlayer } from './usePlayer'

const wrapper = ({ children }: { children: ReactNode }) => (
  <PlayerProvider>{children}</PlayerProvider>
)

describe('PlayerContext', () => {
  it('empieza sin jugador y persiste el nombre en localStorage', () => {
    const { result } = renderHook(() => usePlayer(), { wrapper })
    expect(result.current.name).toBeNull()

    act(() => result.current.setName('Ana'))
    expect(result.current.name).toBe('Ana')
    expect(window.localStorage.getItem(PLAYER_STORAGE_KEY)).toBe(JSON.stringify('Ana'))

    act(() => result.current.clearName())
    expect(result.current.name).toBeNull()
    expect(window.localStorage.getItem(PLAYER_STORAGE_KEY)).toBeNull()
  })

  it('recupera el jugador guardado al montar', () => {
    window.localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify('Luis'))
    const { result } = renderHook(() => usePlayer(), { wrapper })
    expect(result.current.name).toBe('Luis')
  })

  it('usePlayer falla fuera del proveedor', () => {
    expect(() => renderHook(() => usePlayer())).toThrow(/PlayerProvider/)
  })
})
