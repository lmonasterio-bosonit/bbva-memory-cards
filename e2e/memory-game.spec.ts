import { expect, test, type Page } from '@playwright/test'

async function registerPlayer(page: Page, name = 'Ana') {
  await page.goto('/')
  await page.getByLabel('Tu nombre').fill(name)
  await page.getByRole('button', { name: 'Empezar a jugar' }).click()
  await expect(page).toHaveURL(/\/game$/)
}

/** Lee los números del tablero mientras están visibles (índice = posición). */
async function readBoard(page: Page): Promise<number[]> {
  const cells = page.locator('[data-position]')
  await expect(cells).toHaveCount(9)
  await expect(cells.first()).toHaveAttribute('data-status', 'visible')
  const texts = await cells.allTextContents()
  return texts.map(Number)
}

/** Espera a la pregunta "¿Dónde está el N?" y devuelve N. */
async function askedNumber(page: Page): Promise<number> {
  const question = page.getByText(/¿Dónde está el/)
  await expect(question).toBeVisible()
  return Number(await question.locator('strong').textContent())
}

test.describe('Inicio', () => {
  test('valida el nombre antes de empezar', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Empezar a jugar' }).click()
    await expect(page.getByRole('alert')).toContainText('Escribe tu nombre')
    await expect(page).toHaveURL(/\/$/)
  })

  test('redirige al inicio desde rutas inexistentes o sin jugador', async ({ page }) => {
    await page.goto('/no-existe/esta/ruta')
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByLabel('Tu nombre')).toBeVisible()

    await page.goto('/game')
    await expect(page).toHaveURL(/\/$/)
  })
})

test.describe('Juego', () => {
  test('partida completa: memorizar, acertar, nueva ronda y fallar', async ({ page }) => {
    await registerPlayer(page, 'Ana')

    await expect(page.getByText('Ana', { exact: true })).toBeVisible()
    // El input de radio está oculto visualmente; se pulsa su etiqueta, como haría un usuario.
    await page.getByText('Media', { exact: true }).click()
    await expect(page.getByRole('radio', { name: /Media/ })).toBeChecked()
    await page.getByRole('button', { name: 'Empezar' }).click()

    // Fase de memorización: 9 números distintos y cuenta atrás.
    const board = await readBoard(page)
    expect([...board].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    await expect(page.getByRole('timer')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Empezar' })).toBeDisabled()

    // Fase de adivinar: acierto → verde, puntos y nueva ronda.
    const target = await askedNumber(page)
    const position = board.indexOf(target)
    await page.locator(`[data-position="${position}"]`).click()
    await expect(page.locator(`[data-position="${position}"]`)).toHaveAttribute(
      'data-status',
      'correct',
    )
    await expect(page.getByText('Puntos').locator('xpath=following-sibling::dd')).toHaveText('20')
    await expect(page.getByText('Ronda').locator('xpath=following-sibling::dd')).toHaveText('2')

    // Segunda ronda: fallo → rojo con su número y fin de partida.
    const secondBoard = await readBoard(page)
    const secondTarget = await askedNumber(page)
    const wrongPosition = secondBoard.findIndex((value) => value !== secondTarget)
    await page.locator(`[data-position="${wrongPosition}"]`).click()
    const wrongCell = page.locator(`[data-position="${wrongPosition}"]`)
    await expect(wrongCell).toHaveAttribute('data-status', 'wrong')
    await expect(wrongCell).toHaveText(String(secondBoard[wrongPosition]))
    await expect(page.getByText('Fin de la partida')).toBeVisible()
    await expect(page.getByText('¡Nuevo récord!')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Jugar de nuevo' })).toBeEnabled()
  })

  test('recuerda al jugador tras recargar', async ({ page }) => {
    await registerPlayer(page, 'Luis')
    await page.reload()
    await expect(page).toHaveURL(/\/game$/)
    await expect(page.getByText('Luis', { exact: true })).toBeVisible()
  })
})

test.describe('PWA', () => {
  test('tiene manifest y registra el service worker', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', /manifest/)
    const registered = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready
      return Boolean(registration.active)
    })
    expect(registered).toBe(true)
  })

  test('funciona sin conexión tras la primera visita', async ({ page, context }) => {
    await registerPlayer(page, 'Ana')
    await page.evaluate(() => navigator.serviceWorker.ready)

    await context.setOffline(true)
    await page.reload()
    await expect(page.getByRole('button', { name: 'Empezar' })).toBeVisible()
    await expect(page.getByText('Sin conexión', { exact: true })).toBeVisible()

    // La navegación interna también funciona sin red.
    await page.getByRole('link', { name: 'Cambiar de jugador' }).click()
    await expect(page.getByLabel('Tu nombre')).toHaveValue('Ana')
    await context.setOffline(false)
  })
})
