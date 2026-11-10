import { afterEach, describe, expect, it, vi } from 'vitest'
import { readStorage, removeStorage, writeStorage } from './storage'

describe('storage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('escribe y lee valores serializados en JSON', () => {
    writeStorage('k', { a: 1 })
    expect(readStorage('k', null)).toEqual({ a: 1 })
    removeStorage('k')
    expect(readStorage('k', 'fallback')).toBe('fallback')
  })

  it('devuelve el valor por defecto si el contenido no es JSON válido', () => {
    window.localStorage.setItem('k', '{broken')
    expect(readStorage('k', 42)).toBe(42)
  })

  it('no lanza si localStorage falla', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    expect(() => writeStorage('k', 1)).not.toThrow()
    expect(() => removeStorage('k')).not.toThrow()
    expect(readStorage('k', 'fallback')).toBe('fallback')
  })
})
