import 'dotenv/config'

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback
  if (!value) throw new Error(`Missing env: ${name}`)
  return value
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  jwtSecret: required('JWT_SECRET', 'dev-only-change-me-before-production-use-64chars'),
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES ?? '15m',
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES ?? '7d',
  isDev: (process.env.NODE_ENV ?? 'development') !== 'production',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ?? '',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? '',
  allowMockPayments: process.env.ALLOW_MOCK_PAYMENTS === 'true',
  marketDataVendor: process.env.MARKET_DATA_VENDOR ?? 'mock',
  truedataUser: process.env.TRUEDATA_USER ?? '',
  truedataPassword: process.env.TRUEDATA_PASSWORD ?? '',
  truedataApiKey: process.env.TRUEDATA_API_KEY ?? '',
}
