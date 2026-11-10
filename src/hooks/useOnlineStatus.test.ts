import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useOnlineStatus } from './useOnlineStatus'

function setOnline(value: boolean) {
  Object.defineProperty(navigator, 'onLine', { value, configurable: true })
}

describe('useOnlineStatus', () => {
  afterEach(() => setOnline(true))

  it('refleja navigator.onLine y reacciona a los eventos online/offline', () => {
    setOnline(true)
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(true)

    act(() => {
      setOnline(false)
      window.dispatchEvent(new Event('offline'))
    })
    expect(result.current).toBe(false)

    act(() => {
      setOnline(true)
      window.dispatchEvent(new Event('online'))
    })
    expect(result.current).toBe(true)
  })
})
