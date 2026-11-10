export const VIBRATION = {
  correct: 40,
  gameOver: [200, 80, 200, 80, 400],
} as const

/** Vibra en dispositivos compatibles. Devuelve `false` si la API no está disponible. */
export function vibrate(pattern: number | readonly number[]): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return false
  try {
    return navigator.vibrate(typeof pattern === 'number' ? pattern : [...pattern])
  } catch {
    return false
  }
}
