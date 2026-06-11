const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function randomSegment(len: number) {
  return Array.from({ length: len }, () =>
    CHARS[Math.floor(Math.random() * CHARS.length)],
  ).join('')
}

export function generateAccountId(prefix = 'FTL') {
  return `${prefix}-${randomSegment(4)}-${randomSegment(4)}-${randomSegment(4)}-${randomSegment(4)}-${randomSegment(1)}`
}
