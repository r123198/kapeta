'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Registered ${name} (${email}) (simulated)`)
  }

  return (
    <div className="bg-canvas-white text-primary min-h-screen font-sans flex flex-col antialiased selection:bg-primary-container selection:text-canvas-white">
      <Navbar />

      {/* Main Canvas */}
      <main className="flex-grow flex items-center justify-center p-grid-margin pt-24 pb-20 relative z-0">
        <div className="w-full max-w-md bg-canvas-white border border-border-subtle p-8 flex flex-col gap-stack-lg shadow-[0_0_0_1px_rgba(229,229,229,1)]">
          {/* Title Area */}
          <div className="flex flex-col gap-stack-sm text-center border-b border-border-subtle pb-6">
            <h1 className="font-hanken text-[32px] md:text-headline-lg font-bold text-primary tracking-tight">
              Create Account
            </h1>
            <p className="font-sans text-body-sm text-secondary">
              Join the curated directory.
            </p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-4">
            <div className="flex flex-col gap-1.5 group">
              <label className="font-mono text-label-caps text-secondary uppercase tracking-widest group-focus-within:text-primary transition-colors" htmlFor="name">
                Full Name
              </label>
              <input 
                className="w-full bg-canvas-white border border-border-subtle px-4 py-3 font-sans text-body-sm text-primary placeholder:text-secondary focus:outline-none focus:border-primary-container focus:ring-0 transition-colors rounded-none appearance-none" 
                id="name" 
                name="name" 
                placeholder="John Doe" 
                required 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col gap-1.5 group">
              <label className="font-mono text-label-caps text-secondary uppercase tracking-widest group-focus-within:text-primary transition-colors" htmlFor="email">
                Email Address
              </label>
              <input 
                className="w-full bg-canvas-white border border-border-subtle px-4 py-3 font-sans text-body-sm text-primary placeholder:text-secondary focus:outline-none focus:border-primary-container focus:ring-0 transition-colors rounded-none appearance-none" 
                id="email" 
                name="email" 
                placeholder="hello@example.com" 
                required 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col gap-1.5 group">
              <label className="font-mono text-label-caps text-secondary uppercase tracking-widest group-focus-within:text-primary transition-colors" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input 
                  className="w-full bg-canvas-white border border-border-subtle px-4 py-3 font-sans text-body-sm text-primary placeholder:text-secondary focus:outline-none focus:border-primary-container focus:ring-0 transition-colors rounded-none appearance-none pr-10" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  aria-label="Toggle password visibility" 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>
            
            <div className="flex items-start gap-3 mt-2">
              <input 
                className="mt-1 w-4 h-4 bg-canvas-white border border-border-subtle checked:bg-primary-container checked:border-primary-container focus:ring-0 rounded-none cursor-pointer" 
                id="terms" 
                name="terms" 
                required 
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <label className="font-sans text-body-sm text-secondary cursor-pointer select-none" htmlFor="terms">
                I agree to the <a className="text-primary underline hover:text-secondary transition-colors" href="#">Terms of Service</a> and <a className="text-primary underline hover:text-secondary transition-colors" href="#">Privacy Policy</a>.
              </label>
            </div>
            
            <button 
              className="mt-4 w-full bg-primary text-canvas-white font-mono text-label-caps uppercase tracking-widest py-3.5 hover:bg-tertiary-container transition-colors duration-200 border border-primary" 
              type="submit"
            >
              Create Account
            </button>
          </form>
          
          {/* Divider */}
          <div className="flex items-center gap-4 py-2 mt-2">
            <div className="flex-grow h-px bg-border-subtle"></div>
            <span className="font-mono text-[9px] text-secondary uppercase tracking-widest">Or continue with</span>
            <div className="flex-grow h-px bg-border-subtle"></div>
          </div>
          
          {/* Social Logins */}
          <div className="flex gap-4">
            <button 
              className="flex-1 bg-canvas-white border border-border-subtle text-primary font-mono text-label-caps uppercase tracking-widest py-3 hover:bg-surface-alt hover:border-primary transition-all duration-200 flex items-center justify-center gap-2" 
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              Google
            </button>
            <button 
              className="flex-grow flex-1 bg-canvas-white border border-border-subtle text-primary font-mono text-label-caps uppercase tracking-widest py-3 hover:bg-surface-alt hover:border-primary transition-all duration-200 flex items-center justify-center gap-2" 
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">apps</span>
              Apple
            </button>
          </div>

          <div className="text-center font-sans text-body-sm text-secondary mt-2">
            Already have an account?{' '}
            <Link className="text-primary hover:underline font-medium" href="/login">
              Login here
            </Link>.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
