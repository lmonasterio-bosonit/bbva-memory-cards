import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const registerState = {
  offlineReady: false,
  needRefresh: false,
  setOfflineReady: vi.fn(),
  setNeedRefresh: vi.fn(),
  updateServiceWorker: vi.fn(() => Promise.resolve()),
}

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    offlineReady: [registerState.offlineReady, registerState.setOfflineReady],
    needRefresh: [registerState.needRefresh, registerState.setNeedRefresh],
    updateServiceWorker: registerState.updateServiceWorker,
  }),
}))

import { PwaBadge } from './PwaBadge'

describe('PwaBadge', () => {
  beforeEach(() => {
    registerState.offlineReady = false
    registerState.needRefresh = false
    vi.clearAllMocks()
  })

  it('no muestra nada si no hay novedades', () => {
    const { container } = render(<PwaBadge />)
    expect(container).toBeEmptyDOMElement()
  })

  it('avisa cuando la app está lista para funcionar sin conexión', async () => {
    registerState.offlineReady = true
    render(<PwaBadge />)
    expect(screen.getByRole('status')).toHaveTextContent(/sin conexión/)
    expect(screen.queryByRole('button', { name: 'Actualizar' })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(registerState.setOfflineReady).toHaveBeenCalledWith(false)
    expect(registerState.setNeedRefresh).toHaveBeenCalledWith(false)
  })

  it('ofrece actualizar cuando hay una versión nueva', async () => {
    registerState.needRefresh = true
    render(<PwaBadge />)
    expect(screen.getByRole('status')).toHaveTextContent(/nueva versión/)
    await userEvent.click(screen.getByRole('button', { name: 'Actualizar' }))
    expect(registerState.updateServiceWorker).toHaveBeenCalledWith(true)
  })
})
