import sharp from 'sharp'
import { mkdirSync } from 'fs'

mkdirSync('public', { recursive: true })

const svg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#263A6B"/>
  <text x="256" y="256" font-family="Georgia, serif" font-size="300" font-weight="600" fill="#EEF0F3" text-anchor="middle" dominant-baseline="central">K</text>
</svg>`

const sizes = [
  [192, 'public/icon-192.png'],
  [512, 'public/icon-512.png'],
  [180, 'public/apple-touch-icon.png'],
]

for (const [size, out] of sizes) {
  await sharp(Buffer.from(svg(size))).resize(size, size).png().toFile(out)
  console.log('made', out)
}