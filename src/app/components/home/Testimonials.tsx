"use client"

import Image from "next/image"

interface Testimonial {
  id: string // Added unique identifier
  name: string
  image: string
  quote: string
  role?: string // Optional role for additional context
}

const testimonials: Testimonial[] = [
  {
    id: "emily-james",
    name: "Emily & James",
    image: "/placeholder.svg?height=200&width=200",
    quote: "Our wedding decor was a dream come true thanks to the unique items we found here!",
    role: "Recent Newlyweds"
  },
  {
    id: "sarah-michael",
    name: "Sarah & Michael",
    image: "/placeholder.svg?height=200&width=200",
    quote: "A vast selection and seamless experience made our planning stress-free.",
    role: "Married June 2024"
  },
  {
    id: "anna-robert",
    name: "Anna & Robert",
    image: "/placeholder.svg?height=200&width=200",
    quote: "The quality and variety of decor options truly elevated our wedding day.",
    role: "Married August 2024"
  },
]

export const Testimonials = () => {
  return (
    <section className="bg-white py-16" aria-labelledby="testimonials-heading">
      <div className="max-w-7xl mx-auto px-8">
        <h2 
          id="testimonials-heading" 
          className="text-2xl font-semibold text-center mb-8"
        >
          What Couples Are Saying
        </h2>
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
          role="region"
          aria-label="Customer testimonials"
        >
          {testimonials.map((testimonial) => (
            <article 
              key={testimonial.id}
              className="p-6 border rounded-xl shadow-sm hover:shadow-lg transition"
              aria-labelledby={`testimonial-${testimonial.id}`}
            >
              <div className="relative w-16 h-16 mx-auto mb-4">
                <Image
                  src={testimonial.image}
                  alt={`${testimonial.name}'s profile picture`}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <blockquote>
                <p className="text-gray-600 italic mb-4 text-center">"{testimonial.quote}"</p>
              </blockquote>
              <footer className="text-center">
                <h3 
                  id={`testimonial-${testimonial.id}`}
                  className="font-semibold"
                >
                  {testimonial.name}
                </h3>
                {testimonial.role && (
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                )}
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
