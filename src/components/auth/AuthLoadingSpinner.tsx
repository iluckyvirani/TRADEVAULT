import { TrendingUp } from 'lucide-react'

export default function AuthLoadingSpinner() {
  return (
    <div className="relative flex h-12 w-12 items-center justify-center">
      <div className="absolute inset-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#002D5B]" />
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#002D5B]">
        <TrendingUp className="h-3.5 w-3.5 text-white" />
      </div>
    </div>
  )
}
