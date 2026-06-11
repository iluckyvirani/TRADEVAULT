import { Router } from 'express'
import { z } from 'zod'
import {
  getCandles,
  getOptionChain,
  getQuote,
  listInstruments,
  listQuotes,
  searchInstruments,
} from '../services/marketService.js'

export const marketRouter = Router()

marketRouter.get('/instruments', async (req, res, next) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q : undefined
    const filter = typeof req.query.filter === 'string' ? req.query.filter : undefined
    const instruments = q
      ? await searchInstruments(q, filter)
      : await listInstruments(filter)
    res.json({ instruments })
  } catch (e) {
    next(e)
  }
})

marketRouter.get('/instruments/search', async (req, res, next) => {
  try {
    const q = z.string().parse(req.query.q ?? '')
    const filter = typeof req.query.filter === 'string' ? req.query.filter : undefined
    const instruments = await searchInstruments(q, filter)
    res.json({ instruments })
  } catch (e) {
    next(e)
  }
})

marketRouter.get('/quotes', async (_req, res, next) => {
  try {
    const quotes = await listQuotes()
    res.json({ quotes })
  } catch (e) {
    next(e)
  }
})

marketRouter.get('/quotes/:symbol', async (req, res, next) => {
  try {
    const quote = await getQuote(req.params.symbol)
    res.json({ quote })
  } catch (e) {
    next(e)
  }
})

marketRouter.get('/candles/:symbol', async (req, res, next) => {
  try {
    const interval = typeof req.query.interval === 'string' ? req.query.interval : '1d'
    const from = typeof req.query.from === 'string' ? req.query.from : undefined
    const to = typeof req.query.to === 'string' ? req.query.to : undefined
    const limit = req.query.limit ? Number(req.query.limit) : undefined
    const data = await getCandles(req.params.symbol, { interval, from, to, limit })
    res.json(data)
  } catch (e) {
    next(e)
  }
})

marketRouter.get('/options/:underlying', async (req, res, next) => {
  try {
    const filter = typeof req.query.filter === 'string' ? req.query.filter : undefined
    const chain = await getOptionChain(req.params.underlying, filter)
    res.json(chain)
  } catch (e) {
    next(e)
  }
})
