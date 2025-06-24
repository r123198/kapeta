'use client'

import { useState } from 'react'
import { Coffee, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface EmailFormProps {
  source?: string
  className?: string
  variant?: 'hero' | 'footer'
}

export default function EmailForm({ source = 'landing_page', className = '', variant = 'hero' }: EmailFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setStatus('error')
      setMessage('Please enter your email address')
      return
    }

    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), source }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message)
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Network error. Please check your connection and try again.')
    }
  }

  const isHero = variant === 'hero'

  if (status === 'success') {
    return (
      <div className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center ${className}`}>
        <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white mb-2">Welcome to kapeta!</h3>
        <p className="text-white/90">{message}</p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-4 text-white/80 hover:text-white underline text-sm"
        >
          Subscribe another email
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="relative">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Type your email..."
          className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-200 ${
            status === 'error' 
              ? 'border-red-300 focus:ring-red-200' 
              : 'border-white/20 focus:ring-white/20'
          } ${isHero ? 'text-lg' : 'text-base'}`}
          disabled={status === 'loading'}
        />
      </div>

      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-300 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
          isHero
            ? 'bg-accent text-white hover:bg-accent/90 text-lg'
            : 'bg-accent text-white hover:bg-accent/90 text-base'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Joining...
          </>
        ) : (
          <>
            Join kapeta! →
          </>
        )}
      </button>
    </form>
  )
} 