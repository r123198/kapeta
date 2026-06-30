'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Logged in with ${email} (simulated)`)
  }

  return (
    <div className="bg-surface-alt min-h-screen text-on-surface flex flex-col font-sans">
      <Navbar />

      <div className="flex flex-1 w-full max-w-[1440px] mx-auto">
        <main className="flex-1 flex flex-col items-center justify-center p-grid-margin w-full">
          <div className="w-full max-w-md bg-canvas-white archival-border p-8 md:p-12">
            <div className="mb-10 text-center">
              <h1 className="font-hanken text-[32px] md:text-headline-lg font-bold text-primary mb-2">
                Sign In
              </h1>
              <p className="font-sans text-body-sm text-secondary">
                Access your curated directory.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-mono text-label-caps text-on-surface mb-2 uppercase tracking-wider" htmlFor="email">
                  Email Address
                </label>
                <input 
                  className="archival-input" 
                  id="email" 
                  name="email" 
                  placeholder="name@domain.com" 
                  required 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block font-mono text-label-caps text-on-surface uppercase tracking-wider" htmlFor="password">
                    Password
                  </label>
                  <a className="font-sans text-body-sm text-secondary hover:text-primary transition-colors text-[12px]" href="#">
                    Forgot?
                  </a>
                </div>
                <input 
                  className="archival-input" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="pt-4">
                <button className="archival-btn-primary mb-4" type="submit">
                  Sign In
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
                
                <div className="text-center font-sans text-body-sm text-secondary">
                  Don't have an account?{' '}
                  <Link className="text-primary hover:underline font-medium" href="/signup">
                    Register here
                  </Link>.
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
