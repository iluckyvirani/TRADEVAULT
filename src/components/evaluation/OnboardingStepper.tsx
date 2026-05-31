import { useNavigate } from 'react-router-dom'
import { Check, Flag } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function OnboardingStepper() {
  const navigate = useNavigate()

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <h2 className="text-center text-xl font-bold text-gray-900">
        Start your evaluation
      </h2>
      <p className="mt-1 text-center text-sm text-gray-500">Click the flag to begin.</p>

      <div className="mx-auto mt-8 flex max-w-lg items-center justify-between">
        <Step done label="Registered" />
        <Connector />
        <Step done label="Email Verified" />
        <Connector />
        <button
          type="button"
          onClick={() => navigate('/evaluation')}
          className="group flex flex-col items-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-200 bg-white transition-colors group-hover:border-[#002D5B]">
            <Flag className="h-4 w-4 text-[#002D5B]" />
          </div>
          <span className="text-xs font-medium text-gray-700">Start Evaluation</span>
        </button>
      </div>

      <p className="mt-6 text-center text-xs text-gray-400">
        Simulated Environment · Clear rules · Certificates issued on pass
      </p>
    </div>
  )
}

function Step({ done, label }: { done?: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full',
          done ? 'bg-teal-500 text-white' : 'border-2 border-gray-200 bg-white',
        )}
      >
        {done && <Check className="h-5 w-5" />}
      </div>
      <span className="text-xs font-medium text-gray-600">{label}</span>
    </div>
  )
}

function Connector() {
  return <div className="mx-2 h-px flex-1 bg-gray-200" />
}
