import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Route, Routes } from 'react-router'
import { DIFFICULTY_CONFIG } from '../../game/difficulty'
import { saveBestScore } from '../../lib/scores'
import { identityRandom } from '../../test/random'
import { renderWithProviders } from '../../test/render'
import { GamePage } from './GamePage'

/**
 * Con `identityRandom` el tablero queda ordenado (la casilla N contiene el número N)
 * y el objetivo de cada ronda es el 1, lo que hace las partidas deterministas.
 */
function renderGame(player = 'Ana') {
  return renderWithProviders(
    <Routes>
      <Route path="/game" element={<GamePage random={identityRandom} roundDelayMs={100} />} />
      <Route path="/" element={<h1>Inicio</h1>} />
    </Routes>,
    { route: '/game', player },
  )
}

const user = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

/** Valor de una estadística del marcador a partir de su etiqueta. */
function stat(label: RegExp | string) {
  const term = screen.getByText(label, { selector: 'dt' })
  return term.nextElementSibling as HTMLElement
}

async function startAndWait(seconds: number) {
  await user().click(screen.getByRole('button', { name: 'Empezar' }))
  act(() => vi.advanceTimersByTime(seconds * 1000))
}

describe('GamePage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    Object.defineProperty(navigator, 'vibrate', { value: vi.fn(() => true), configurable: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('muestra el nombre, los puntos, la dificultad y el botón de empezar', () => {
    renderGame('Ana')
    expect(stat('Jugador')).toHaveTextContent('Ana')
    expect(stat('Puntos')).toHaveTextContent('0')
    expect(screen.getByRole('group', { name: 'Dificultad' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Baja/ })).toBeChecked()
    expect(screen.getByRole('button', { name: 'Empezar' })).toBeEnabled()
    expect(screen.getByRole('switch', { name: /3 números/ })).not.toBeChecked()
    expect(screen.getByRole('link', { name: 'Cambiar de jugador' })).toHaveAttribute('href', '/')
  })

  it('al empezar muestra 9 números distintos durante el tiempo de la dificultad y una cuenta atrás', async () => {
    renderGame()
    await user().click(screen.getByRole('radio', { name: /Media/ }))
    await user().click(screen.getByRole('button', { name: 'Empezar' }))

    const board = within(screen.getByRole('group', { name: 'Tablero' }))
    const values = board.getAllByRole('button').map((button) => button.textContent)
    expect(new Set(values).size).toBe(9)
    expect([...values].sort()).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9'])

    expect(screen.getByRole('timer')).toHaveTextContent(String(DIFFICULTY_CONFIG.medium.seconds))
    expect(screen.getByRole('button', { name: /Empezar|En juego/ })).toBeDisabled()
    expect(screen.getByRole('radio', { name: /Alta/ })).toBeDisabled()

    act(() => vi.advanceTimersByTime(1000))
    expect(screen.getByRole('timer')).toHaveTextContent(
      String(DIFFICULTY_CONFIG.medium.seconds - 1),
    )

    act(() => vi.advanceTimersByTime((DIFFICULTY_CONFIG.medium.seconds - 1) * 1000))
    expect(screen.queryByRole('timer')).not.toBeInTheDocument()
    expect(screen.getByText(/¿Dónde está el/)).toHaveTextContent('1')
    board.getAllByRole('button').forEach((button) => expect(button).toHaveTextContent('?'))
  })

  it('un acierto pinta la casilla en verde, suma puntos y arranca una nueva ronda', async () => {
    renderGame()
    await startAndWait(DIFFICULTY_CONFIG.low.seconds)

    await user().click(screen.getByRole('button', { name: 'Casilla 1' }))
    expect(screen.getByRole('button', { name: /Casilla 1.*acierto/ })).toHaveAttribute(
      'data-status',
      'correct',
    )
    expect(stat('Puntos')).toHaveTextContent(String(DIFFICULTY_CONFIG.low.points))
    expect(screen.getByText('¡Ronda superada!')).toBeInTheDocument()
    expect(navigator.vibrate).toHaveBeenCalled()

    act(() => vi.advanceTimersByTime(100))
    expect(stat('Ronda')).toHaveTextContent('2')
    expect(screen.getByRole('timer')).toBeInTheDocument()
    expect(stat('Puntos')).toHaveTextContent(String(DIFFICULTY_CONFIG.low.points))
  })

  it('un fallo pinta la casilla en rojo con su número, termina la partida y guarda el récord', async () => {
    renderGame('Ana')
    await startAndWait(DIFFICULTY_CONFIG.low.seconds)

    await user().click(screen.getByRole('button', { name: 'Casilla 1' }))
    act(() => vi.advanceTimersByTime(100))
    act(() => vi.advanceTimersByTime(DIFFICULTY_CONFIG.low.seconds * 1000))

    await user().click(screen.getByRole('button', { name: 'Casilla 5' }))
    const wrong = screen.getByRole('button', { name: /Casilla 5.*fallo/ })
    expect(wrong).toHaveAttribute('data-status', 'wrong')
    expect(wrong).toHaveTextContent('5')
    expect(screen.getByRole('button', { name: /Casilla 1.*aquí estaba/ })).toBeInTheDocument()

    expect(screen.getByText('Fin de la partida')).toBeInTheDocument()
    expect(screen.getByText('¡Nuevo récord!')).toBeInTheDocument()
    expect(stat(/Récord/)).toHaveTextContent(String(DIFFICULTY_CONFIG.low.points))
    expect(navigator.vibrate).toHaveBeenLastCalledWith([200, 80, 200, 80, 400])

    // Las casillas quedan bloqueadas y el botón permite volver a jugar.
    expect(screen.getByRole('button', { name: 'Casilla 2' })).toBeDisabled()
    const again = screen.getByRole('button', { name: 'Jugar de nuevo' })
    expect(again).toBeEnabled()
    await user().click(again)
    expect(stat('Puntos')).toHaveTextContent('0')
    expect(stat('Ronda')).toHaveTextContent('1')
    expect(screen.queryByText('¡Nuevo récord!')).not.toBeInTheDocument()
  })

  it('no anuncia récord si no se supera el anterior', async () => {
    saveBestScore('Ana', 'low', 100)
    renderGame('Ana')
    expect(stat(/Récord/)).toHaveTextContent('100')
    await startAndWait(DIFFICULTY_CONFIG.low.seconds)
    await user().click(screen.getByRole('button', { name: 'Casilla 9' }))
    expect(screen.getByText('Fin de la partida')).toBeInTheDocument()
    expect(screen.queryByText('¡Nuevo récord!')).not.toBeInTheDocument()
    expect(stat(/Récord/)).toHaveTextContent('100')
  })

  it('con el reto de 3 números pide tres números seguidos en la misma ronda', async () => {
    renderGame()
    await user().click(screen.getByRole('switch', { name: /3 números/ }))
    await startAndWait(DIFFICULTY_CONFIG.low.seconds)

    expect(screen.getByText(/Número 1 de 3/)).toBeInTheDocument()
    expect(screen.getByText(/¿Dónde está el/)).toHaveTextContent('1')
    await user().click(screen.getByRole('button', { name: 'Casilla 1' }))

    expect(screen.getByText(/Número 2 de 3/)).toBeInTheDocument()
    expect(screen.getByText(/¿Dónde está el/)).toHaveTextContent('2')
    await user().click(screen.getByRole('button', { name: 'Casilla 2' }))

    expect(screen.getByText(/Número 3 de 3/)).toBeInTheDocument()
    await user().click(screen.getByRole('button', { name: 'Casilla 3' }))
    expect(screen.getByText('¡Ronda superada!')).toBeInTheDocument()
    expect(stat('Puntos')).toHaveTextContent(String(DIFFICULTY_CONFIG.low.points * 3))
  })
})
