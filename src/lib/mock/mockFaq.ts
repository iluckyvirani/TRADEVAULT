export interface FaqItem {
  id: string
  question: string
  answer: string
}

export interface FaqCategory {
  id: string
  title: string
  items: FaqItem[]
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting started',
    items: [
      {
        id: 'what-is-tradeox',
        question: 'What is tradeox?',
        answer:
          'tradeox is a simulated trading evaluation platform for Indian intraday traders. You complete qualifier and validator stages under clear risk rules in a demo environment — no live capital is used during evaluation.',
      },
      {
        id: 'free-trial',
        question: 'Can I try the platform before paying?',
        answer:
          'Yes. Start a free trial from the dashboard to explore the trading room, stats, and rule tracking with no payment required. Free trial accounts are for practice only and are not eligible for funded-style reward accounts.',
      },
      {
        id: 'signup-steps',
        question: 'How do I create an account?',
        answer:
          'Sign up with email, complete your profile, verify email, then choose an evaluation plan or free trial. You can enter a referral code during profile setup if a friend shared one with you.',
      },
    ],
  },
  {
    id: 'evaluation',
    title: 'Evaluation programs',
    items: [
      {
        id: 'one-vs-two-step',
        question: 'What is the difference between 1-Step and 2-Step?',
        answer:
          '1-Step is a single qualifier stage (Qualifier → Rewards). 2-Step adds a validator stage (Qualifier → Validator → Rewards) with separate profit targets. Both programs use documented daily loss and max loss limits shown on the checkout page.',
      },
      {
        id: 'account-sizes',
        question: 'Which account sizes are available?',
        answer:
          'Evaluation plans range from ₹2L to ₹25L simulated balance. The one-time fee covers platform access for that evaluation — it is not a deposit into a live trading account.',
      },
      {
        id: 'pass-fail',
        question: 'How do I pass or fail an evaluation?',
        answer:
          'You pass by meeting the profit target while staying within maximum daily loss and maximum overall loss limits, plus any minimum trading day requirements. Breaching loss limits or rule violations can end the evaluation stage.',
      },
    ],
  },
  {
    id: 'trading',
    title: 'Trading & platform',
    items: [
      {
        id: 'platform',
        question: 'Which platform do I trade on?',
        answer:
          'Evaluations use the TradingView Web Terminal integrated in the tradeox trading room. You can place market, limit, and stop orders with optional take-profit and stop-loss levels.',
      },
      {
        id: 'instruments',
        question: 'What instruments can I trade?',
        answer:
          'The simulated environment supports NIFTY & BANKNIFTY options, index futures, NSE equities, and MCX commodities. All P&L is tracked in INR.',
      },
      {
        id: 'square-off',
        question: 'Is there an auto square-off time?',
        answer:
          'Yes. Open positions are subject to intraday square-off rules aligned with Indian market hours (typically 3:15 PM IST for equity and index products). Details appear in your account rules and trading room.',
      },
    ],
  },
  {
    id: 'billing',
    title: 'Payments & billing',
    items: [
      {
        id: 'evaluation-fee',
        question: 'What does the evaluation fee include?',
        answer:
          'The fee is a one-time charge for evaluation access: trading room, stats, rule tracking, and dashboard tools for your chosen program and account size. View receipts and payment history under Billing.',
      },
      {
        id: 'refunds',
        question: 'Are evaluation fees refundable?',
        answer:
          'Fees are generally non-refundable except for verified payment errors. Full terms are shown at checkout. Contact support if you believe a charge was made in error.',
      },
    ],
  },
  {
    id: 'referrals',
    title: 'Refer & Earn',
    items: [
      {
        id: 'referral-how',
        question: 'How does the referral program work?',
        answer:
          'Share your personal referral code or signup link from Profile → Refer & Earn. When a friend signs up with your code and completes an evaluation purchase, you earn ₹500 per successful referral (simulated in this demo).',
      },
      {
        id: 'referral-pending',
        question: 'Why is my referral still pending?',
        answer:
          'A referral stays pending until your friend completes evaluation payment. Once payment is confirmed, the referral moves to successful and the reward is tracked in your lifetime earnings.',
      },
    ],
  },
  {
    id: 'account',
    title: 'Profile & verification',
    items: [
      {
        id: 'verified-trader',
        question: 'What is Verified Trader status?',
        answer:
          'Verified Trader unlocks when you are eligible for contractual and identity steps after meeting profit targets within loss limits. Keep your profile accurate; you will be notified when verification opens.',
      },
      {
        id: 'kill-switch',
        question: 'What is the Daily Kill Switch?',
        answer:
          'An optional trading lock in Profile → Preferences that blocks new trades for the rest of the current trading day. You can activate it once per day for self-imposed risk control.',
      },
      {
        id: 'support',
        question: 'How do I contact support?',
        answer:
          'Use the Contact page to send feedback or reach the team by email, phone, or WhatsApp. For billing disputes or account issues, include your registered email and account ID.',
      },
    ],
  },
]
