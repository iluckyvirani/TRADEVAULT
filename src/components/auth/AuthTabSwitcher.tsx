import { cn } from '@/lib/utils'

export type AuthTab = 'signin' | 'create'

interface Props {
  active: AuthTab
  onChange: (tab: AuthTab) => void
}

export default function AuthTabSwitcher({ active, onChange }: Props) {
  return (
    <div className="mb-6 flex rounded-full bg-gray-100 p-1">
      <button
        type="button"
        onClick={() => onChange('signin')}
        className={cn(
          'flex-1 rounded-full py-2 text-sm font-medium transition-all',
          active === 'signin'
            ? 'bg-white text-[#002D5B] shadow-sm'
            : 'text-gray-500 hover:text-gray-700',
        )}
      >
        Sign in
      </button>
      <button
        type="button"
        onClick={() => onChange('create')}
        className={cn(
          'flex-1 rounded-full py-2 text-sm font-medium transition-all',
          active === 'create'
            ? 'bg-white text-[#002D5B] shadow-sm'
            : 'text-gray-500 hover:text-gray-700',
        )}
      >
        Create Profile
      </button>
    </div>
  )
}
