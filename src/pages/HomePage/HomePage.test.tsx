import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Route, Routes } from 'react-router'
import { PLAYER_STORAGE_KEY } from '../../lib/storageKeys'
import { renderWithProviders } from '../../test/render'
import { HomePage } from './HomePage'

function renderHome(player: string | null = null) {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/game" element={<h1>Vista de juego</h1>} />
    </Routes>,
    { route: '/', player },
  )
}

describe('HomePage', () => {
  it('muestra el campo de nombre, el botón y la explicación del juego', () => {
    renderHome()
    expect(screen.getByRole('heading', { level: 1, name: 'Memory Cards' })).toBeInTheDocument()
    expect(screen.getByLabelText('Tu nombre')).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Empezar a jugar' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Cómo se juega' })).toBeInTheDocument()
    expect(screen.getByRole('table')).toHaveTextContent('Baja')
  })

  it('valida el nombre antes de empezar y no navega si es inválido', async () => {
    renderHome()
    await userEvent.click(screen.getByRole('button', { name: 'Empezar a jugar' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Escribe tu nombre')
    expect(screen.getByLabelText('Tu nombre')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByText('Vista de juego')).not.toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Tu nombre'), 'A')
    // Al escribir se limpia el error anterior.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Empezar a jugar' }))
    expect(screen.getByRole('alert')).toHaveTextContent('al menos 2 caracteres')
  })

  it('registra el jugador y navega al juego con un nombre válido', async () => {
    renderHome()
    await userEvent.type(screen.getByLabelText('Tu nombre'), '  Ana  ')
    await userEvent.keyboard('{Enter}')
    expect(await screen.findByText('Vista de juego')).toBeInTheDocument()
    expect(window.localStorage.getItem(PLAYER_STORAGE_KEY)).toBe(JSON.stringify('Ana'))
  })

  it('rellena el nombre del jugador ya registrado', () => {
    renderHome('Luis')
    expect(screen.getByLabelText('Tu nombre')).toHaveValue('Luis')
  })
})
