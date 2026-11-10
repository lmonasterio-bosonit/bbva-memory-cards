import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createBoard } from '../../game/board'
import { identityRandom } from '../../test/random'
import { Board } from './Board'
import { placeholderCells } from './placeholderCells'

const cells = createBoard(identityRandom)

describe('Board', () => {
  it('muestra los números cuando showValues es true y no permite pulsar', () => {
    render(<Board cells={cells} revealed={{}} showValues interactive={false} onPick={() => {}} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(9)
    expect(screen.getByRole('button', { name: 'Casilla 1, número 1' })).toBeDisabled()
    expect(buttons[0]).toHaveTextContent('1')
    expect(buttons[0]).toHaveAttribute('data-status', 'visible')
  })

  it('oculta los números y permite elegir una casilla en modo interactivo', async () => {
    const onPick = vi.fn()
    render(<Board cells={cells} revealed={{}} showValues={false} interactive onPick={onPick} />)
    const cell = screen.getByRole('button', { name: 'Casilla 5' })
    expect(cell).toBeEnabled()
    expect(cell).toHaveTextContent('?')
    expect(cell).toHaveAttribute('data-status', 'hidden')
    await userEvent.click(cell)
    expect(onPick).toHaveBeenCalledWith(4)
  })

  it('pinta los aciertos, fallos y la casilla que se buscaba, mostrando su número', () => {
    render(
      <Board
        cells={cells}
        revealed={{ 0: 'correct', 3: 'wrong', 6: 'missed' }}
        showValues={false}
        interactive
        onPick={() => {}}
      />,
    )
    const correct = screen.getByRole('button', { name: 'Casilla 1, número 1, acierto' })
    const wrong = screen.getByRole('button', { name: 'Casilla 4, número 4, fallo' })
    const missed = screen.getByRole('button', { name: 'Casilla 7, número 7, aquí estaba' })
    expect(correct).toHaveAttribute('data-status', 'correct')
    expect(wrong).toHaveAttribute('data-status', 'wrong')
    expect(missed).toHaveAttribute('data-status', 'missed')
    expect(correct).toBeDisabled()
    expect(wrong).toHaveTextContent('4')
    expect(screen.getByRole('button', { name: 'Casilla 2' })).toBeEnabled()
  })

  it('placeholderCells crea 9 casillas vacías', () => {
    const placeholder = placeholderCells()
    expect(placeholder).toHaveLength(9)
    expect(placeholder.every((cell) => cell.value === 0)).toBe(true)
  })
})
