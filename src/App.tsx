import { Navigate, Route, Routes } from 'react-router'
import { AppShell } from './components/AppShell/AppShell'
import { GamePage } from './pages/GamePage/GamePage'
import { HomePage } from './pages/HomePage/HomePage'
import { PlayerProvider } from './player/PlayerContext'
import { RequirePlayer } from './player/RequirePlayer'

export interface AppProps {
  /** Jugador inicial (útil en tests); por defecto se recupera de localStorage. */
  initialPlayer?: string | null
}

/**
 * Rutas de la aplicación:
 *  - "/"      registro del jugador
 *  - "/game"  juego (requiere jugador registrado)
 *  - "*"      cualquier otra ruta redirige al inicio
 */
export function App({ initialPlayer }: AppProps) {
  return (
    <PlayerProvider initialName={initialPlayer}>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/game"
            element={
              <RequirePlayer>
                <GamePage />
              </RequirePlayer>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </PlayerProvider>
  )
}
