import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '../../components/Button/Button'
import { TextField } from '../../components/TextField/TextField'
import { DIFFICULTIES, DIFFICULTY_CONFIG } from '../../game/difficulty'
import { usePlayer } from '../../player/usePlayer'
import { NAME_MAX_LENGTH, NAME_MIN_LENGTH, validateName } from '../../player/validateName'
import styles from './HomePage.module.css'

/** Vista de inicio: registro del jugador y explicación del juego. */
export function HomePage() {
  const { name, setName } = usePlayer()
  const navigate = useNavigate()
  const [value, setValue] = useState(name ?? '')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = validateName(value)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setName(result.name)
    void navigate('/game')
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Memory Cards</h1>
        <p className={styles.subtitle}>
          Memoriza la posición de los números y encuéntralos antes de fallar.
        </p>
      </section>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <TextField
          label="Tu nombre"
          name="player"
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
            if (error) setError(null)
          }}
          error={error}
          hint={`Entre ${NAME_MIN_LENGTH} y ${NAME_MAX_LENGTH} caracteres.`}
          placeholder="¿Cómo te llamas?"
          autoComplete="nickname"
          enterKeyHint="go"
        />
        <Button type="submit" size="lg" fullWidth>
          Empezar a jugar
        </Button>
      </form>

      <section className={styles.howTo} aria-labelledby="how-to-title">
        <h2 id="how-to-title" className={styles.howToTitle}>
          Cómo se juega
        </h2>
        <ol className={styles.steps}>
          <li>Elige la dificultad y pulsa «Empezar».</li>
          <li>Aparecen 9 casillas con los números del 1 al 9. Memoriza dónde está cada uno.</li>
          <li>Cuando se oculten, pulsa la casilla donde está el número que te pedimos.</li>
          <li>
            Cada acierto suma puntos y empieza una ronda nueva. Si fallas, se acaba la partida.
          </li>
        </ol>
        <table className={styles.table}>
          <caption className="visually-hidden">Tiempo visible y puntos por dificultad</caption>
          <thead>
            <tr>
              <th scope="col">Dificultad</th>
              <th scope="col">Tiempo visible</th>
              <th scope="col">Puntos por acierto</th>
            </tr>
          </thead>
          <tbody>
            {DIFFICULTIES.map((difficulty) => {
              const config = DIFFICULTY_CONFIG[difficulty]
              return (
                <tr key={difficulty}>
                  <th scope="row">{config.label}</th>
                  <td>{config.seconds} s</td>
                  <td>{config.points}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </div>
  )
}
