import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '../Button/Button'
import styles from './PwaBadge.module.css'

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000

/**
 * Registra el service worker y muestra avisos:
 *  - cuando la app ya está lista para funcionar sin conexión,
 *  - cuando hay una nueva versión disponible (con botón para actualizar).
 */
export function PwaBadge() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return
      window.setInterval(() => void registration.update(), UPDATE_CHECK_INTERVAL_MS)
    },
  })

  if (!offlineReady && !needRefresh) return null

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <output className={styles.toast}>
      <span className={styles.message}>
        {needRefresh
          ? 'Hay una nueva versión disponible.'
          : 'La app ya está lista para usarse sin conexión.'}
      </span>
      <span className={styles.actions}>
        {needRefresh && <Button onClick={() => void updateServiceWorker(true)}>Actualizar</Button>}
        <Button variant="ghost" onClick={close}>
          Cerrar
        </Button>
      </span>
    </output>
  )
}
