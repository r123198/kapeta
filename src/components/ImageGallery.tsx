'use client'

import { useState } from 'react'

interface ImageGalleryProps {
  images: string[]
  altPrefix: string
}

export default function ImageGallery({ images, altPrefix }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length)
  }

  if (images.length === 0) return null

  return (
    <div className="w-full bg-canvas-white border border-border-subtle shadow-sm relative h-64 sm:h-80 md:h-96 overflow-hidden group/gallery">
      <img 
        className="w-full h-full object-cover transition-all duration-500 ease-in-out" 
        src={images[activeIndex]} 
        alt={`${altPrefix} - View ${activeIndex + 1}`} 
        onError={(e) => {
          e.currentTarget.src = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />

      {/* Slider Controls */}
      {images.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-canvas-white/80 hover:bg-canvas-white text-primary p-2 rounded-full border border-border-subtle shadow-sm transition-all opacity-0 group-hover/gallery:opacity-100 z-10 flex items-center justify-center"
            aria-label="Previous image"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-canvas-white/80 hover:bg-canvas-white text-primary p-2 rounded-full border border-border-subtle shadow-sm transition-all opacity-0 group-hover/gallery:opacity-100 z-10 flex items-center justify-center"
            aria-label="Next image"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>

          {/* Dots Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/45 backdrop-blur-sm px-3 py-1 rounded-full">
            {images.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === activeIndex ? 'bg-canvas-white w-4' : 'bg-canvas-white/50'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
