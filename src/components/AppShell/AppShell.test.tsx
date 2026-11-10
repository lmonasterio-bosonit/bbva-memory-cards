import { act, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../test/render'
import { AppShell } from './AppShell'

function setOnline(value: boolean) {
  Object.defineProperty(navigator, 'onLine', { value, configurable: true })
}

describe('AppShell', () => {
  afterEach(() => setOnline(true))

  it('muestra cabecera con enlace al inicio, contenido y pie', () => {
    renderWithProviders(
      <AppShell>
        <p>Contenido</p>
      </AppShell>,
    )
    expect(screen.getByRole('link', { name: /Memory Cards/ })).toHaveAttribute('href', '/')
    expect(screen.getByRole('main')).toHaveTextContent('Contenido')
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.queryByText('Sin conexión')).not.toBeInTheDocument()
  })

  it('indica cuando no hay conexión', () => {
    setOnline(false)
    renderWithProviders(
      <AppShell>
        <p>Contenido</p>
      </AppShell>,
    )
    expect(screen.getByText('Sin conexión')).toBeInTheDocument()

    act(() => {
      setOnline(true)
      window.dispatchEvent(new Event('online'))
    })
    expect(screen.queryByText('Sin conexión')).not.toBeInTheDocument()
  })
})
