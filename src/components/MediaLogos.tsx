import { MEDIA_LOGOS } from '@/lib/constants'

export default function MediaLogos() {

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-muted text-sm mb-8">As featured in:</p>
          
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {MEDIA_LOGOS.map((logo, index) => (
              <div
                key={index}
                className="flex items-center justify-center w-24 h-12 bg-gray-100 rounded-lg text-gray-400 font-medium text-sm hover:text-accent transition-colors duration-200"
              >
                {logo.placeholder}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 