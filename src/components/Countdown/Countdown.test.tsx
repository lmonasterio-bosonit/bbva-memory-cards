import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Countdown } from './Countdown'

describe('Countdown', () => {
  it('anuncia los segundos restantes como temporizador', () => {
    render(<Countdown seconds={7} total={10} />)
    const timer = screen.getByRole('timer', { name: 'Quedan 7 segundos' })
    expect(timer).toHaveTextContent('7')
    expect(timer).toHaveAttribute('aria-live', 'polite')
  })

  it('dibuja el progreso proporcional al tiempo restante', () => {
    const { container, rerender } = render(<Countdown seconds={10} total={10} />)
    const progress = () => container.querySelectorAll('circle')[1] as SVGCircleElement
    expect(Number(progress().getAttribute('stroke-dashoffset'))).toBeCloseTo(0)

    rerender(<Countdown seconds={0} total={10} />)
    const circumference = Number(progress().getAttribute('stroke-dasharray'))
    expect(Number(progress().getAttribute('stroke-dashoffset'))).toBeCloseTo(circumference)
  })

  it('marca como urgente los últimos segundos', () => {
    render(<Countdown seconds={2} total={10} />)
    expect(screen.getByRole('timer').className).toMatch(/urgent/)
  })
})
