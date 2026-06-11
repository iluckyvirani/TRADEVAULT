const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js'

let scriptPromise: Promise<boolean> | null = null

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if (window.Razorpay) return Promise.resolve(true)

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = RAZORPAY_SCRIPT
      script.async = true
      script.onload = () => resolve(Boolean(window.Razorpay))
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  return scriptPromise
}

export interface OpenRazorpayCheckoutInput {
  keyId: string
  orderId: string
  amount: number
  currency: string
  name?: string
  description?: string
  email?: string
  contact?: string
  onSuccess: (response: {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
  }) => void
  onDismiss?: () => void
}

export async function openRazorpayCheckout(input: OpenRazorpayCheckoutInput) {
  const loaded = await loadRazorpayScript()
  if (!loaded || !window.Razorpay) {
    throw new Error('Unable to load Razorpay checkout')
  }

  const rzp = new window.Razorpay({
    key: input.keyId,
    amount: Math.round(input.amount * 100),
    currency: input.currency,
    name: input.name ?? 'tradeox',
    description: input.description,
    order_id: input.orderId,
    prefill: {
      email: input.email,
      contact: input.contact,
    },
    theme: { color: '#002D5B' },
    handler: input.onSuccess,
    modal: {
      ondismiss: input.onDismiss,
    },
  })

  rzp.open()
}
