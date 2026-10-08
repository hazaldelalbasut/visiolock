export function drawingPathToText(drawingPath) {
  return drawingPath.map(point => `${point.row},${point.col}`).join('|')
}

export async function computeSha256(text) {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export function hashToPassword(hashHex, length = 16) {
  const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz'
  const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*'
  const allCharacters = lowercaseLetters + uppercaseLetters + numbers + symbols

  let password = ''
  for (let i = 0; i < length; i++) {
    const hexPair = hashHex.substr((i * 2) % hashHex.length, 2)
    const numericValue = parseInt(hexPair, 16)
    password += allCharacters[numericValue % allCharacters.length]
  }

  password = uppercaseLetters[parseInt(hashHex.substr(0, 2), 16) % uppercaseLetters.length] +
          numbers[parseInt(hashHex.substr(2, 2), 16) % numbers.length] +
          symbols[parseInt(hashHex.substr(4, 2), 16) % symbols.length] +
          password.substr(3)

  return password
}

export async function generatePasswordFromDrawing(serviceName, drawingPath, matrixSize) {
  const drawingText = drawingPathToText(drawingPath)
  const seedText = `${serviceName.toLowerCase()}:${drawingText}:${matrixSize}`
  const hash = await computeSha256(seedText)
  return hashToPassword(hash, 16)
}
