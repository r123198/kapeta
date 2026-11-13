export default function HeroSection() {
  return (
    <section className="py-10 md:py-14 px-6 md:px-12 bg-surface border-b border-border-subtle">
      <div className="max-w-7xl mx-auto">
        <span className="font-mono text-label-caps uppercase text-secondary block mb-2">
          Personal Archive
        </span>
        <h1 className="font-hanken text-headline-lg md:text-display-lg font-extrabold text-primary tracking-tight">
          Saved Directory
        </h1>
        <p className="font-sans text-body-lg text-secondary max-w-xl mt-2">
          Your curated collection of specialty coffee spaces, workspace notes, and independent roasters.
        </p>
      </div>
    </section>
  )
}
