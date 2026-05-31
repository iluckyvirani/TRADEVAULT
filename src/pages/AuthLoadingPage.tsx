import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLoadingSpinner from '@/components/auth/AuthLoadingSpinner'

export default function AuthLoadingPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const id = setTimeout(() => {
      navigate('/dashboard', { replace: true })
    }, 1500)
    return () => clearTimeout(id)
  }, [navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <AuthLoadingSpinner />
    </div>
  )
}
