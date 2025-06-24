export default function TestimonialsSection() {
  const testimonials = [
    {
      quote: "kapeta! helps me find coffee shops that are perfect for remote work in Iligan, based on factors like wifi speed, noise level, and coffee quality",
      publication: "Local News Iligan"
    },
    {
      quote: "The ratings of kapeta!'s cafes are constantly updated in real-time based on user input from the local coffee community",
      publication: "Mindanao Daily"
    },
    {
      quote: "kapeta! is a local aggregator for coffee destinations, ranking wifi, coffee beans, and work environment",
      publication: "TechNews PH"
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            What the Community Says
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Join thousands of coffee lovers and remote workers who trust kapeta! to find their perfect workspace
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="text-4xl text-primary mb-4">"</div>
                  <p className="text-foreground leading-relaxed mb-6">
                    {testimonial.quote}
                  </p>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm font-medium text-muted">
                    — {testimonial.publication}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 