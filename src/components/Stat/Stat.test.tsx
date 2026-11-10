import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Stat } from './Stat'

describe('Stat', () => {
  it('muestra etiqueta y valor como término/definición', () => {
    render(
      <dl>
        <Stat label="Puntos" value={30} />
      </dl>,
    )
    expect(screen.getByRole('term')).toHaveTextContent('Puntos')
    expect(screen.getByRole('definition')).toHaveTextContent('30')
  })

  it('resalta el valor cuando se indica', () => {
    render(
      <dl>
        <Stat label="Récord" value={30} highlight />
      </dl>,
    )
    const stat = screen.getByRole('term').parentElement as HTMLElement
    expect(stat.className).toMatch(/highlight/)
  })
})
