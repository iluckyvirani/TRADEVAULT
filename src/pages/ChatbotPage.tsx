import { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  Send,
  Shield,
  Sparkles,
  Trash2,
} from 'lucide-react'
import {
  CHATBOT_TOPICS,
  MAX_CHAT_CHARS,
  MAX_CHAT_WORDS,
  countWords,
  getMockChatReply,
  type ChatMessage,
} from '@/lib/mock/mockChatbot'
import { cn } from '@/lib/utils'

const COVERAGE = [
  {
    icon: CheckCircle2,
    title: 'Account stages',
    description:
      'Qualifier, Validator, and Rewards Account guidance for simulated evaluations.',
  },
  {
    icon: Shield,
    title: 'Rules and reviews',
    description: 'Drawdown, prohibited practices, KYC, and compliance checkpoints.',
  },
  {
    icon: AlertTriangle,
    title: 'Product scope',
    description:
      'tradeox uses a simulated trading environment and does not execute real trades for users.',
  },
] as const

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const wordCount = countWords(input)
  const charCount = input.length
  const overLimit = wordCount > MAX_CHAT_WORDS || charCount > MAX_CHAT_CHARS
  const canSend = input.trim().length > 0 && !overLimit && !typing

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || countWords(trimmed) > MAX_CHAT_WORDS || trimmed.length > MAX_CHAT_CHARS) {
      return
    }

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTyping(true)

    await new Promise((r) => setTimeout(r, 600))

    const assistantMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: getMockChatReply(trimmed),
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, assistantMsg])
    setTyping(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSend) return
    void sendMessage(input)
  }

  function clearChat() {
    setMessages([])
    setInput('')
    setTyping(false)
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-7">
      <p className="text-xs text-muted-foreground">Home / Chatbot</p>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="flex min-h-[560px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#002D5B]">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">tradeox Assistant</p>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Online
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearChat}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Clear chat"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto p-4">
            {messages.length === 0 && !typing ? (
              <div className="flex h-full min-h-[360px] flex-col items-center justify-center px-4 text-center">
                <Sparkles className="h-6 w-6 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-semibold text-foreground">Ask tradeox</h2>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Rules, payouts, KYC, account stages, and review guidance.
                </p>
                <div className="mt-8 grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
                  {CHATBOT_TOPICS.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => void sendMessage(topic)}
                      className="rounded-lg border border-border bg-card px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <ul className="space-y-4">
                {messages.map((msg) => (
                  <li
                    key={msg.id}
                    className={cn(
                      'flex',
                      msg.role === 'user' ? 'justify-end' : 'justify-start',
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                        msg.role === 'user'
                          ? 'bg-[#002D5B] text-white'
                          : 'border border-border bg-muted text-foreground',
                      )}
                    >
                      {msg.content}
                    </div>
                  </li>
                ))}
                {typing && (
                  <li className="flex justify-start">
                    <div className="rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
                      Typing…
                    </div>
                  </li>
                )}
              </ul>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-border p-4"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_CHAT_CHARS))}
                placeholder="Ask about rules, payouts, KYC, or account stages"
                className="min-w-0 flex-1 rounded-full border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#002D5B]"
              />
              <button
                type="submit"
                disabled={!canSend}
                className={cn(
                  'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors',
                  canSend
                    ? 'bg-[#2563eb] text-white hover:bg-[#1d4ed8]'
                    : 'cursor-not-allowed bg-muted text-muted-foreground',
                )}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p
              className={cn(
                'mt-2 text-right text-xs',
                overLimit ? 'text-red-500' : 'text-muted-foreground',
              )}
            >
              {wordCount}/{MAX_CHAT_WORDS} words · {charCount}/{MAX_CHAT_CHARS}
            </p>
          </form>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Common topics</h3>
            </div>
            <ul className="mt-3 space-y-2">
              {CHATBOT_TOPICS.map((topic) => (
                <li key={topic}>
                  <button
                    type="button"
                    onClick={() => void sendMessage(topic)}
                    className="text-left text-sm text-[#002D5B] hover:underline dark:text-[#8bb4e8]"
                  >
                    {topic}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="font-semibold text-foreground">Coverage</h3>
            <ul className="mt-4 space-y-4">
              {COVERAGE.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex gap-3">
                  <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
