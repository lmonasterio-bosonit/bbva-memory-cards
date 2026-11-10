import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import styles from './AppShell.module.css'

/** Cabecera, contenido y pie comunes a todas las vistas. */
export function AppShell({ children }: { children: ReactNode }) {
  const online = useOnlineStatus()

  return (
    <>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          <Logo />
          <span>Memory Cards</span>
        </Link>
        {!online && <output className={styles.offline}>Sin conexión</output>}
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <p>Prueba técnica · Memory Cards · funciona sin conexión</p>
      </footer>
    </>
  )
}

function Logo() {
  return (
    <svg className={styles.logo} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#1d4ed8" />
      <g fill="#fff">
        <rect x="12" y="12" width="11" height="11" rx="2.5" />
        <rect x="26.5" y="12" width="11" height="11" rx="2.5" />
        <rect x="41" y="12" width="11" height="11" rx="2.5" />
        <rect x="12" y="26.5" width="11" height="11" rx="2.5" />
        <rect x="26.5" y="26.5" width="11" height="11" rx="2.5" fill="#fbbf24" />
        <rect x="41" y="26.5" width="11" height="11" rx="2.5" />
        <rect x="12" y="41" width="11" height="11" rx="2.5" />
        <rect x="26.5" y="41" width="11" height="11" rx="2.5" />
        <rect x="41" y="41" width="11" height="11" rx="2.5" />
      </g>
    </svg>
  )
}
