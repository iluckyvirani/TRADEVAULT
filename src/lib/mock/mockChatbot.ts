export const CHATBOT_TOPICS = [
  'What is tradeox?',
  'What is the Qualifier?',
  'Explain drawdown rules',
  'How do payouts work?',
  'What are prohibited practices?',
  'When is KYC required?',
] as const

export const MAX_CHAT_WORDS = 80
export const MAX_CHAT_CHARS = 500

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

const REPLIES: Record<string, string> = {
  'what is tradeox':
    'tradeox is a simulated trading evaluation platform. Traders complete qualifier and validator stages under clear risk rules. Passing evaluations can lead to a Rewards Account with payout eligibility—without using live capital during the evaluation phase.',
  'what is the qualifier':
    'The Qualifier is the first evaluation stage. You trade in a simulated environment with profit targets, daily max loss, and max loss limits. Meeting objectives advances you to the next stage (Validator or Rewards path depending on your program).',
  'explain drawdown rules':
    'Drawdown rules include Daily Max Loss (resets each trading day) and Max Loss (tracked from your account high-water mark). Your equity must stay above the loss lines shown in Account Stats. Breaching a limit typically ends the evaluation for that account.',
  'how do payouts work':
    'Payouts apply once you have an active Rewards Account. Eligible profit shares are processed according to your program terms, KYC status, and compliance review. Payout history and invoices appear in the Rewards section after activation.',
  'what are prohibited practices':
    'Prohibited practices include latency arbitrage, tick scalping, hedging across accounts, copy trading that violates rules, and any manipulation of the simulated feed. Reviews may void progress if prohibited behavior is detected.',
  'when is kyc required':
    'KYC is required before funded-style rewards and contractual steps. You will be prompted when eligible after meeting profit targets while respecting loss limits. Keep profile details accurate in the Verified Trader section.',
}

export function getMockChatReply(input: string): string {
  const key = input.trim().toLowerCase()
  if (REPLIES[key]) return REPLIES[key]

  for (const [topic, reply] of Object.entries(REPLIES)) {
    if (key.includes(topic) || topic.includes(key)) return reply
  }

  if (/payout|withdraw|profit share/i.test(input)) return REPLIES['how do payouts work']
  if (/drawdown|daily loss|max loss/i.test(input)) return REPLIES['explain drawdown rules']
  if (/kyc|identity|verify/i.test(input)) return REPLIES['when is kyc required']
  if (/qualifier|validator|stage/i.test(input)) return REPLIES['what is the qualifier']
  if (/prohibited|hedg|arbitrage/i.test(input)) return REPLIES['what are prohibited practices']

  return (
    'I can help with tradeox rules, account stages (Qualifier, Validator, Rewards), drawdown limits, payouts, KYC, and prohibited practices. Try one of the suggested topics or ask a specific question.'
  )
}

export function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}
