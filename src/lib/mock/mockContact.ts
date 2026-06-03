export type FeedbackCategory = 'general' | 'bug' | 'feature' | 'billing' | 'other'
export type FeedbackStatus = 'open' | 'in_review' | 'resolved'

export interface FeedbackSubmission {
  id: string
  category: FeedbackCategory
  message: string
  status: FeedbackStatus
  createdAt: string
}

export const CONTACT_INFO = {
  phone: '+91 73058 46669',
  whatsapp: '+91 75500 10504',
  email: 'support@tradeox.com',
} as const

export const FEEDBACK_CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'bug', label: 'Bug report' },
  { value: 'feature', label: 'Feature idea' },
  { value: 'billing', label: 'Billing' },
  { value: 'other', label: 'Other' },
]

/** In-memory mock history — starts empty */
export const mockFeedbackHistory: FeedbackSubmission[] = []
