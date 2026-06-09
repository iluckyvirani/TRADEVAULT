export { mockUser } from './mockUser'
export type { } from './mockUser'

export type { Order, OrderSide, OrderType, OrderStatus, OrderTimeInForce } from './mockOrders'

export { mockQuotes } from './mockQuotes'
export type { Quote } from './mockQuotes'

export { mockCandles } from './mockCandles'
export type { Candle } from './mockCandles'

export {
  mockInstruments,
  FILTER_CHIPS,
  getInstrumentById,
  getInstrumentBySymbol,
  getChartSymbol,
} from './mockInstruments'
export type {
  Instrument,
  InstrumentCategory,
  InstrumentFilter,
  InstrumentBadge,
} from './mockInstruments'

export {
  mockTradingPrograms,
  mockEvaluationPlanTiers,
  getPlanById,
} from './mockAssessmentPlans'
export type {
  TradingProgram,
  EvaluationPlanTier,
  ProgramType,
} from './mockAssessmentPlans'

export { buildMockEquityCurve } from './mockEquityCurve'
export type { EquityPoint } from './mockEquityCurve'

export type { BillingRecord, BillingStatus } from './mockBilling'

export {
  CONTACT_INFO,
  FEEDBACK_CATEGORIES,
  mockFeedbackHistory,
} from './mockContact'
export type {
  FeedbackCategory,
  FeedbackStatus,
  FeedbackSubmission,
} from './mockContact'

export {
  AFFILIATE_COMMISSION_RATE,
  REFERRAL_REWARD_AMOUNT,
  DEMO_PARTNER_CODE,
  MIN_PAYOUT_AMOUNT,
  buildAffiliateCode,
  calcCommission,
} from './mockAffiliate'
export type {
  AffiliatePayout,
  AffiliateReferral,
  ReferralStatus,
} from './mockAffiliate'
