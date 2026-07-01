'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface AuthModalProps {
  isOpen: boolean
  initialTab: 'login' | 'register'
  onClose: () => void
  onSuccess: (user: any) => void
}

export default function AuthModal({ isOpen, initialTab, onClose, onSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>(initialTab)
  
  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Status states
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      if (tab === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          setErrorMsg(error.message)
        } else if (data.user) {
          setName('')
          setEmail('')
          setPassword('')
          onSuccess(data.user)
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              role: 'user', // Default role for average joe
            },
          },
        })

        if (error) {
          setErrorMsg(error.message)
        } else if (data.user) {
          alert('Account successfully registered! Please log in.')
          setTab('login')
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#00000033] backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-canvas-white border border-primary w-full max-w-md p-8 flex flex-col shadow-lg relative animate-fade-in-up">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-secondary hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Tab Headers */}
        <div className="flex gap-4 border-b border-border-subtle pb-3 mb-6 select-none">
          <button 
            onClick={() => { setTab('login'); setErrorMsg(''); }}
            className={`font-mono text-label-caps pb-1 border-b-2 transition-all ${
              tab === 'login' ? 'border-primary text-primary font-bold' : 'border-transparent text-secondary'
            }`}
          >
            Sign In
          </button>
          <button 
            onClick={() => { setTab('register'); setErrorMsg(''); }}
            className={`font-mono text-label-caps pb-1 border-b-2 transition-all ${
              tab === 'register' ? 'border-primary text-primary font-bold' : 'border-transparent text-secondary'
            }`}
          >
            Register
          </button>
        </div>

        {/* Header Text */}
        <div className="mb-6">
          <h3 className="font-hanken text-title-md font-bold text-primary">
            {tab === 'login' ? 'Authentication Required' : 'Create an Account'}
          </h3>
          <p className="font-sans text-body-sm text-secondary mt-1">
            {tab === 'login' 
              ? 'Please sign in to save your favorite coffee workspaces.' 
              : 'Join ROOT as an Average Joe and start bookmarking spaces!'}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-error-container border border-error text-error p-3 mb-4 font-mono text-[11px] uppercase">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="block font-mono text-label-caps text-[10px] text-secondary uppercase mb-1.5" htmlFor="modal-name">
                Full Name
              </label>
              <input 
                className="archival-input" 
                id="modal-name" 
                placeholder="John Doe" 
                required 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          
          <div>
            <label className="block font-mono text-label-caps text-[10px] text-secondary uppercase mb-1.5" htmlFor="modal-email">
              Email Address
            </label>
            <input 
              className="archival-input" 
              id="modal-email" 
              placeholder="name@domain.com" 
              required 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-mono text-label-caps text-[10px] text-secondary uppercase mb-1.5" htmlFor="modal-password">
              Password
            </label>
            <input 
              className="archival-input" 
              id="modal-password" 
              placeholder="••••••••" 
              required 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              disabled={loading}
              className="archival-btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Processing...' : tab === 'login' ? 'Sign In' : 'Register Account'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
