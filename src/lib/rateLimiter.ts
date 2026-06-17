type RateLimitRecord = {
  timestamps: number[]
}

const rateLimits = new Map<string, RateLimitRecord>()

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const record = rateLimits.get(key)

  if (!record) {
    rateLimits.set(key, { timestamps: [now] })
    return true
  }

  // filter out old timestamps
  record.timestamps = record.timestamps.filter(ts => now - ts < windowMs)

  if (record.timestamps.length >= limit) {
    return false
  }

  record.timestamps.push(now)
  return true
}
