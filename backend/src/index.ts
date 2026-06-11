import http from 'http'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { config } from './config.js'
import { authRouter } from './routes/auth.js'
import { plansRouter } from './routes/plans.js'
import { faqRouter } from './routes/faq.js'
import { accountsRouter } from './routes/accounts.js'
import { checkoutRouter, checkoutWebhookHandler } from './routes/checkout.js'
import { billingRouter } from './routes/billing.js'
import { marketRouter } from './routes/market.js'
import { errorHandler } from './middleware/errorHandler.js'
import { prisma } from './lib/prisma.js'
import { attachQuoteWebSocket } from './ws/quoteStream.js'

const app = express()

app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  }),
)

// Razorpay webhook needs raw body for signature verification
app.post(
  '/api/checkout/webhook',
  express.raw({ type: 'application/json' }),
  checkoutWebhookHandler,
)

app.use(express.json())
app.use(cookieParser())

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'tradeox-api',
    env: config.nodeEnv,
    payments: config.razorpayKeyId ? 'razorpay' : 'mock',
    marketData: config.marketDataVendor,
  })
})

app.use('/api/market', marketRouter)
app.use('/api/auth', authRouter)
app.use('/api/plans', plansRouter)
app.use('/api/faq', faqRouter)
app.use('/api/accounts', accountsRouter)
app.use('/api/checkout', checkoutRouter)
app.use('/api/billing', billingRouter)

app.use(errorHandler)

async function main() {
  await prisma.$connect()
  const server = http.createServer(app)
  attachQuoteWebSocket(server)
  server.listen(config.port, () => {
    console.log(`tradeox API listening on http://localhost:${config.port}`)
    console.log(`CORS origin: ${config.corsOrigin}`)
    console.log(
      `Payments: ${config.razorpayKeyId ? 'Razorpay live' : 'mock (set RAZORPAY_KEY_ID for real payments)'}`,
    )
    console.log(
      `Market data: ${config.marketDataVendor === 'truedata' ? 'TrueData (configure TRUEDATA_*)' : 'simulated (DB + WebSocket)'}`,
    )
    console.log(`WebSocket quotes: ws://localhost:${config.port}/api/ws/quotes`)
  })
}

main().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
