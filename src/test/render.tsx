import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { PlayerProvider } from '../player/PlayerContext'

interface Options extends Omit<RenderOptions, 'wrapper'> {
  /** Ruta inicial del router en memoria. */
  route?: string
  /** Jugador registrado (null = sin registrar). */
  player?: string | null
}

/** Renderiza con router en memoria y contexto de jugador, como en la app real. */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/', player = null, ...options }: Options = {},
) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[route]}>
      <PlayerProvider initialName={player}>{children}</PlayerProvider>
    </MemoryRouter>
  )
  return render(ui, { wrapper: Wrapper, ...options })
}
