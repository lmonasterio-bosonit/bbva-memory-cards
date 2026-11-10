import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { saveBestScore } from '../lib/scores'
import { useBestScore } from './useBestScore'

describe('useBestScore', () => {
  it('expone el récord guardado y lo actualiza al superarlo', () => {
    saveBestScore('Ana', 'low', 20)
    const { result } = renderHook(() => useBestScore('Ana', 'low'))
    expect(result.current.best).toBe(20)

    let isRecord = false
    act(() => {
      isRecord = result.current.submit(10)
    })
    expect(isRecord).toBe(false)
    expect(result.current.best).toBe(20)

    act(() => {
      isRecord = result.current.submit(50)
    })
    expect(isRecord).toBe(true)
    expect(result.current.best).toBe(50)
  })

  it('cambia de récord al cambiar la dificultad', () => {
    saveBestScore('Ana', 'high', 90)
    const { result, rerender } = renderHook(({ difficulty }) => useBestScore('Ana', difficulty), {
      initialProps: { difficulty: 'low' as 'low' | 'high' },
    })
    expect(result.current.best).toBe(0)
    rerender({ difficulty: 'high' })
    expect(result.current.best).toBe(90)
  })
})
