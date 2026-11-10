export const NAME_MIN_LENGTH = 2
export const NAME_MAX_LENGTH = 20

const ALLOWED_CHARACTERS = /^[\p{L}\p{N} _.'-]+$/u

export type NameValidation = { ok: true; name: string } | { ok: false; error: string }

/** Valida y normaliza (recorta espacios) el nombre del jugador. */
export function validateName(raw: string): NameValidation {
  const name = raw.trim().replace(/\s+/g, ' ')
  if (name.length === 0) return { ok: false, error: 'Escribe tu nombre para empezar.' }
  if (name.length < NAME_MIN_LENGTH) {
    return { ok: false, error: `El nombre debe tener al menos ${NAME_MIN_LENGTH} caracteres.` }
  }
  if (name.length > NAME_MAX_LENGTH) {
    return { ok: false, error: `El nombre no puede superar los ${NAME_MAX_LENGTH} caracteres.` }
  }
  if (!ALLOWED_CHARACTERS.test(name)) {
    return { ok: false, error: 'Usa solo letras, números, espacios, guiones o puntos.' }
  }
  return { ok: true, name }
}
