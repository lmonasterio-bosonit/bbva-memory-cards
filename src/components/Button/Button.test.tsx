import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('es de tipo button por defecto y propaga el click', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Pulsar</Button>)
    const button = screen.getByRole('button', { name: 'Pulsar' })
    expect(button).toHaveAttribute('type', 'button')
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('admite type submit, variantes y ancho completo', () => {
    render(
      <Button type="submit" variant="ghost" size="lg" fullWidth className="extra">
        Enviar
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Enviar' })
    expect(button).toHaveAttribute('type', 'submit')
    expect(button.className).toMatch(/ghost/)
    expect(button.className).toMatch(/lg/)
    expect(button.className).toMatch(/fullWidth/)
    expect(button.className).toMatch(/extra/)
  })

  it('no dispara el click cuando está deshabilitado', async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Nada
      </Button>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })
})
