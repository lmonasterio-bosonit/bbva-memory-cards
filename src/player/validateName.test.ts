import { describe, expect, it } from 'vitest'
import { NAME_MAX_LENGTH, validateName } from './validateName'

describe('validateName', () => {
  it('acepta nombres válidos y recorta espacios', () => {
    expect(validateName('  Ana   María ')).toEqual({ ok: true, name: 'Ana María' })
    expect(validateName("O'Neil-2")).toEqual({ ok: true, name: "O'Neil-2" })
  })

  it('rechaza nombres vacíos', () => {
    expect(validateName('   ')).toMatchObject({
      ok: false,
      error: expect.stringContaining('nombre'),
    })
  })

  it('rechaza nombres demasiado cortos o largos', () => {
    expect(validateName('A')).toMatchObject({ ok: false })
    expect(validateName('x'.repeat(NAME_MAX_LENGTH + 1))).toMatchObject({ ok: false })
    expect(validateName('x'.repeat(NAME_MAX_LENGTH))).toMatchObject({ ok: true })
  })

  it('rechaza caracteres no permitidos', () => {
    expect(validateName('<script>')).toMatchObject({ ok: false })
    expect(validateName('ana@mail')).toMatchObject({ ok: false })
  })
})
