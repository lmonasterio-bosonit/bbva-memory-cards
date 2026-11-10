import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Testing Library solo avanza los temporizadores falsos (en `asyncWrapper`, `waitFor`,
// `user-event`...) cuando detecta Jest. Con Vitest exponemos este shim para que
// `vi.useFakeTimers()` no bloquee las interacciones asíncronas.
Object.defineProperty(globalThis, 'jest', {
  value: { advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms) },
  configurable: true,
  writable: true,
})

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})
