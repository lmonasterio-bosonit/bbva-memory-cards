import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TextField } from './TextField'

describe('TextField', () => {
  it('asocia la etiqueta y la ayuda al input', () => {
    render(<TextField label="Nombre" hint="Máx. 20" value="" onChange={() => {}} />)
    const input = screen.getByLabelText('Nombre')
    expect(input).toHaveAccessibleDescription('Máx. 20')
    expect(input).not.toHaveAttribute('aria-invalid')
  })

  it('muestra el error como alerta y marca el campo como inválido', () => {
    render(<TextField label="Nombre" error="Obligatorio" value="" onChange={() => {}} />)
    const input = screen.getByLabelText('Nombre')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Obligatorio')
    expect(input).toHaveAccessibleDescription('Obligatorio')
  })

  it('propaga la escritura', async () => {
    const onChange = vi.fn()
    render(<TextField label="Nombre" value="" onChange={onChange} />)
    await userEvent.type(screen.getByLabelText('Nombre'), 'A')
    expect(onChange).toHaveBeenCalled()
  })
})
