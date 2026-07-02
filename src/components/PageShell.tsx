import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface PageShellProps {
  children: React.ReactNode
  className?: string
}

export default function PageShell({ children, className = 'bg-surface' }: PageShellProps) {
  return (
    <div className={`${className} min-h-screen text-on-surface flex flex-col font-sans`}>
      <Navbar />
      {children}
      <Footer />
    </div>
  )
}
