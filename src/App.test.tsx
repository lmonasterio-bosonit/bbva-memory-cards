import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router'
import { App } from './App'
import { PLAYER_STORAGE_KEY } from './lib/storageKeys'

function renderApp(route: string, player?: string | null) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App initialPlayer={player} />
    </MemoryRouter>,
  )
}

describe('App (rutas)', () => {
  it('muestra la vista de inicio en la ruta raíz', () => {
    renderApp('/', null)
    expect(screen.getByLabelText('Tu nombre')).toBeInTheDocument()
  })

  it('redirige al inicio cualquier ruta inexistente', () => {
    renderApp('/esta-ruta-no-existe', null)
    expect(screen.getByLabelText('Tu nombre')).toBeInTheDocument()
  })

  it('redirige al inicio si se entra al juego sin jugador registrado', () => {
    renderApp('/game', null)
    expect(screen.getByLabelText('Tu nombre')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Empezar' })).not.toBeInTheDocument()
  })

  it('muestra el juego si hay jugador registrado', () => {
    renderApp('/game', 'Ana')
    expect(screen.getByRole('button', { name: 'Empezar' })).toBeInTheDocument()
    expect(screen.getByText('Jugador', { selector: 'dt' }).nextElementSibling).toHaveTextContent(
      'Ana',
    )
  })

  it('recupera el jugador de localStorage cuando no se indica uno', () => {
    window.localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify('Luis'))
    renderApp('/game')
    expect(screen.getByRole('button', { name: 'Empezar' })).toBeInTheDocument()
  })
})
