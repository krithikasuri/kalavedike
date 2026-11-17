import { act, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useNow } from './useNow'

afterEach(() => vi.useRealTimers())

it('refreshes time on the interval and window focus, then cleans up', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-12-06T14:29:50Z'))
  const { result, unmount } = renderHook(useNow)
  expect(result.current.toISOString()).toBe('2026-12-06T14:29:50.000Z')
  act(() => vi.advanceTimersByTime(30_000))
  expect(result.current.toISOString()).toBe('2026-12-06T14:30:20.000Z')
  vi.setSystemTime(new Date('2026-12-07T04:30:00Z'))
  act(() => window.dispatchEvent(new Event('focus')))
  expect(result.current.toISOString()).toBe('2026-12-07T04:30:00.000Z')
  unmount()
  expect(vi.getTimerCount()).toBe(0)
})
