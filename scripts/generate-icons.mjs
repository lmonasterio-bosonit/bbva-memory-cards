/**
 * Genera los iconos PNG de la PWA (public/pwa-*.png, maskable y apple-touch-icon)
 * sin dependencias externas: dibuja el logo (rejilla 3x3) y codifica el PNG con zlib.
 *
 *   node scripts/generate-icons.mjs
 */
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const BLUE = [29, 78, 216]
const WHITE = [255, 255, 255]
const AMBER = [251, 191, 36]

const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(bytes) {
  let crc = 0xffffffff
  for (const b of bytes) crc = crcTable[(crc ^ b) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(typeAndData))
  return Buffer.concat([length, typeAndData, crc])
}

function encodePng(size, pixelAt) {
  const raw = Buffer.alloc((size * 3 + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0 // filtro "None"
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixelAt(x, y)
      const i = y * (size * 3 + 1) + 1 + x * 3
      raw[i] = r
      raw[i + 1] = g
      raw[i + 2] = b
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // color type RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function insideRoundedRect(x, y, left, top, width, height, radius) {
  const right = left + width
  const bottom = top + height
  if (x < left || x >= right || y < top || y >= bottom) return false
  const cx = x < left + radius ? left + radius : x >= right - radius ? right - radius : x
  const cy = y < top + radius ? top + radius : y >= bottom - radius ? bottom - radius : y
  return (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2
}

/**
 * @param size tamaño del PNG
 * @param padding proporción de margen alrededor de la rejilla (0.19 normal, 0.3 maskable)
 * @param rounded si el fondo tiene esquinas redondeadas (false para maskable)
 */
function drawIcon(size, padding, rounded) {
  const cellRatio = 11 / 64
  const gapRatio = 3.5 / 64
  const gridSize = size * (1 - 2 * padding)
  const scale = gridSize / (3 * cellRatio + 2 * gapRatio)
  const cell = cellRatio * scale
  const gap = gapRatio * scale
  const start = size * padding

  return (x, y) => {
    if (rounded && !insideRoundedRect(x, y, 0, 0, size, size, size * 0.22)) return [15, 23, 42]
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const left = start + col * (cell + gap)
        const top = start + row * (cell + gap)
        if (insideRoundedRect(x, y, left, top, cell, cell, cell * 0.22)) {
          return row === 1 && col === 1 ? AMBER : WHITE
        }
      }
    }
    return BLUE
  }
}

const outputs = [
  ['pwa-192x192.png', 192, 0.19, true],
  ['pwa-512x512.png', 512, 0.19, true],
  ['apple-touch-icon.png', 180, 0.19, false],
  ['maskable-icon-512x512.png', 512, 0.3, false],
]

for (const [name, size, padding, rounded] of outputs) {
  const file = resolve('public', name)
  writeFileSync(file, encodePng(size, drawIcon(size, padding, rounded)))
  console.log(`✔ ${name} (${size}x${size})`)
}
