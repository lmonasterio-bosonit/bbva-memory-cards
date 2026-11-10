import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Toggle } from './Toggle'

describe('Toggle', () => {
  it('se expone como switch con su descripción', () => {
    render(<Toggle label="Reto" description="Tres números" checked={false} onChange={() => {}} />)
    const toggle = screen.getByRole('switch', { name: 'Reto' })
    expect(toggle).not.toBeChecked()
    expect(toggle).toHaveAccessibleDescription('Tres números')
  })

  it('notifica el nuevo valor al pulsar', async () => {
    const onChange = vi.fn()
    render(<Toggle label="Reto" checked={false} onChange={onChange} />)
    await userEvent.click(screen.getByRole('switch', { name: 'Reto' }))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('no cambia si está deshabilitado', async () => {
    const onChange = vi.fn()
    render(<Toggle label="Reto" checked onChange={onChange} disabled />)
    const toggle = screen.getByRole('switch', { name: 'Reto' })
    expect(toggle).toBeChecked()
    await userEvent.click(toggle)
    expect(onChange).not.toHaveBeenCalled()
  })
})
