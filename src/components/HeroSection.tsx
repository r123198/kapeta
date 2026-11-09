export default function HeroSection() {
  return (
    <section className="py-14 md:py-18 flex flex-col items-center justify-center text-center px-grid-margin relative overflow-hidden bg-surface border-b border-border-subtle">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#c4c7c7 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="z-10 flex flex-col items-center max-w-2xl w-full">
        <h1 className="font-hanken text-[44px] md:text-display-lg font-extrabold text-primary uppercase tracking-tighter mb-3 leading-none">
          ROOT
        </h1>
        <p className="font-sans text-body-lg text-secondary max-w-lg mx-auto">
          Your personal curated collection of specialty coffee spaces and independent roasters.
        </p>
      </div>
    </section>
  )
}
