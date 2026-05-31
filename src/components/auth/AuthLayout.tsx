import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'

interface Props {
  children: ReactNode
  title: string
  subtitle: string
  showLogo?: boolean
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  showLogo = true,
}: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F4F6] px-4 py-10">
      <div className="w-full max-w-[420px] rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        {showLogo && (
          <div className="mb-6 flex justify-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#002D5B]">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </Link>
          </div>
        )}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#002D5B]">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  )
}
