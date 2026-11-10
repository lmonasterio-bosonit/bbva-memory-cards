import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DifficultySelector } from './DifficultySelector'

describe('DifficultySelector', () => {
  it('muestra las tres dificultades con su tiempo y puntos', () => {
    render(<DifficultySelector value="low" onChange={() => {}} />)
    expect(screen.getByRole('group', { name: 'Dificultad' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Baja.*10 s.*10 pts/ })).toBeChecked()
    expect(screen.getByRole('radio', { name: /Media.*5 s.*20 pts/ })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: /Alta.*2 s.*30 pts/ })).not.toBeChecked()
  })

  it('notifica la dificultad elegida', async () => {
    const onChange = vi.fn()
    render(<DifficultySelector value="low" onChange={onChange} />)
    await userEvent.click(screen.getByRole('radio', { name: /Alta/ }))
    expect(onChange).toHaveBeenCalledWith('high')
  })

  it('bloquea los cambios cuando está deshabilitado', async () => {
    const onChange = vi.fn()
    render(<DifficultySelector value="low" onChange={onChange} disabled />)
    const radio = screen.getByRole('radio', { name: /Alta/ })
    expect(radio).toBeDisabled()
    await userEvent.click(radio)
    expect(onChange).not.toHaveBeenCalled()
  })
})
