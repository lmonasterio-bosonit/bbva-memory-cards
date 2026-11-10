import { afterEach, describe, expect, it, vi } from 'vitest'
import { VIBRATION, vibrate } from './vibrate'

describe('vibrate', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('llama a navigator.vibrate con el patrón cuando está disponible', () => {
    const spy = vi.fn(() => true)
    Object.defineProperty(navigator, 'vibrate', { value: spy, configurable: true })
    expect(vibrate(VIBRATION.gameOver)).toBe(true)
    expect(spy).toHaveBeenCalledWith([...VIBRATION.gameOver])
    expect(vibrate(40)).toBe(true)
    expect(spy).toHaveBeenLastCalledWith(40)
  })

  it('devuelve false si la API no existe', () => {
    Object.defineProperty(navigator, 'vibrate', { value: undefined, configurable: true })
    expect(vibrate(100)).toBe(false)
  })

  it('devuelve false si la API lanza', () => {
    Object.defineProperty(navigator, 'vibrate', {
      value: () => {
        throw new Error('not allowed')
      },
      configurable: true,
    })
    expect(vibrate(100)).toBe(false)
  })
})
