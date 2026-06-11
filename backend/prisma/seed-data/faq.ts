export const SEED_FAQ = [
  {
    id: 'getting-started',
    title: 'Getting started',
    sortOrder: 0,
    items: [
      {
        id: 'what-is-tradeox',
        question: 'What is tradeox?',
        answer:
          'tradeox is a simulated trading evaluation platform for Indian intraday traders. You complete qualifier and validator stages under clear risk rules in a demo environment — no live capital is used during evaluation.',
        sortOrder: 0,
      },
      {
        id: 'free-trial',
        question: 'Can I try the platform before paying?',
        answer:
          'Yes. Start a free trial from the dashboard to explore the trading room, stats, and rule tracking with no payment required. Free trial accounts are for practice only and are not eligible for funded-style reward accounts.',
        sortOrder: 1,
      },
      {
        id: 'signup-steps',
        question: 'How do I create an account?',
        answer:
          'Sign up with email, complete your profile, verify email, then choose an evaluation plan or free trial. You can enter a referral code during profile setup if a friend shared one with you.',
        sortOrder: 2,
      },
    ],
  },
  {
    id: 'evaluation',
    title: 'Evaluation programs',
    sortOrder: 1,
    items: [
      {
        id: 'one-vs-two-step',
        question: 'What is the difference between 1-Step and 2-Step?',
        answer:
          '1-Step is a single qualifier stage (Qualifier → Rewards). 2-Step adds a validator stage (Qualifier → Validator → Rewards) with separate profit targets. Both programs use documented daily loss and max loss limits shown on the checkout page.',
        sortOrder: 0,
      },
      {
        id: 'account-sizes',
        question: 'Which account sizes are available?',
        answer:
          'Evaluation plans range from ₹2L to ₹25L simulated balance. The one-time fee covers platform access for that evaluation — it is not a deposit into a live trading account.',
        sortOrder: 1,
      },
      {
        id: 'pass-fail',
        question: 'How do I pass or fail an evaluation?',
        answer:
          'You pass by meeting the profit target while staying within maximum daily loss and maximum overall loss limits, plus required trading days and minimum profitable trading days. Breaching loss limits can end the evaluation stage.',
        sortOrder: 2,
      },
    ],
  },
  {
    id: 'trading',
    title: 'Trading & platform',
    sortOrder: 2,
    items: [
      {
        id: 'platform',
        question: 'Which platform do I trade on?',
        answer:
          'Evaluations use the TradingView Web Terminal integrated in the tradeox trading room. You can place market, limit, and stop orders with optional take-profit and stop-loss levels.',
        sortOrder: 0,
      },
      {
        id: 'instruments',
        question: 'What instruments can I trade?',
        answer:
          'The simulated environment supports NIFTY & BANKNIFTY options, index futures, NSE equities, and MCX commodities. All P&L is tracked in INR.',
        sortOrder: 1,
      },
      {
        id: 'square-off',
        question: 'Is there an auto square-off time?',
        answer:
          'Yes. Open positions are subject to intraday square-off rules aligned with Indian market hours (typically 3:15 PM IST for equity and index products).',
        sortOrder: 2,
      },
    ],
  },
  {
    id: 'billing',
    title: 'Payments & billing',
    sortOrder: 3,
    items: [
      {
        id: 'evaluation-fee',
        question: 'What does the evaluation fee include?',
        answer:
          'The fee is a one-time charge for evaluation access: trading room, stats, rule tracking, and dashboard tools for your chosen program and account size.',
        sortOrder: 0,
      },
      {
        id: 'refunds',
        question: 'Are evaluation fees refundable?',
        answer:
          'Fees are generally non-refundable except for verified payment errors. Full terms are shown at checkout.',
        sortOrder: 1,
      },
    ],
  },
  {
    id: 'referrals',
    title: 'Refer & Earn',
    sortOrder: 4,
    items: [
      {
        id: 'referral-how',
        question: 'How does the referral program work?',
        answer:
          'Share your personal referral code from Profile → Refer & Earn. When a friend completes an evaluation purchase with your code, you earn ₹500 per successful referral.',
        sortOrder: 0,
      },
      {
        id: 'referral-pending',
        question: 'Why is my referral still pending?',
        answer:
          'A referral stays pending until your friend completes evaluation payment. Once payment is confirmed, the referral moves to successful.',
        sortOrder: 1,
      },
    ],
  },
  {
    id: 'account',
    title: 'Profile & verification',
    sortOrder: 5,
    items: [
      {
        id: 'verified-trader',
        question: 'What is Verified Trader status?',
        answer:
          'Verified Trader unlocks when you are eligible for contractual and identity steps after meeting profit targets within loss limits.',
        sortOrder: 0,
      },
      {
        id: 'kill-switch',
        question: 'What is the Daily Kill Switch?',
        answer:
          'An optional trading lock in Profile → Preferences that blocks new trades for the rest of the current trading day.',
        sortOrder: 1,
      },
      {
        id: 'support',
        question: 'How do I contact support?',
        answer:
          'Use the Contact page to send feedback or reach the team by email, phone, or WhatsApp.',
        sortOrder: 2,
      },
    ],
  },
] as const
