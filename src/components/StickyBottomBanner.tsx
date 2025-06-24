'use client'

import { useState } from 'react'
import { X, Globe } from 'lucide-react'

export default function StickyBottomBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-accent/95 backdrop-blur-sm border-t border-accent/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3 text-white">
            <Globe className="w-5 h-5" />
            <span className="text-sm sm:text-base">
              Join a community of coffee lovers and remote workers in Iligan City
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <a
              href="#join"
              className="bg-white text-accent px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition-colors text-sm sm:text-base"
            >
              Join kapeta! →
            </a>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 