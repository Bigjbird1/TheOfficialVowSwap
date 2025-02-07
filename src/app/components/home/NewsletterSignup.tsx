"use client"

import { useState } from "react"

export const NewsletterSignup = () => {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setStatus("error")
      setMessage("Please enter your email address")
      return
    }

    setStatus("loading")
    setMessage("")

    try {
      // TODO: Implement newsletter signup API integration
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated API call
      setStatus("success")
      setMessage("Thank you for subscribing!")
      setEmail("")
    } catch (error) {
      setStatus("error")
      setMessage("Something went wrong. Please try again.")
    }
  }

  return (
    <section 
      className="bg-rose-500 py-12" 
      aria-labelledby="newsletter-heading"
    >
      <div className="max-w-7xl mx-auto px-8 text-center">
        <h2 
          id="newsletter-heading" 
          className="text-2xl font-semibold text-white mb-4"
        >
          Stay Updated on the Latest Decor Trends
        </h2>
        <p className="text-white mb-6">
          Sign up for our newsletter to get exclusive deals and wedding decor inspiration.
        </p>
        <form 
          className="flex flex-col sm:flex-row justify-center max-w-md mx-auto gap-2"
          onSubmit={handleSubmit}
          aria-describedby={message ? "newsletter-message" : undefined}
        >
          <div className="flex-1">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              disabled={status === "loading"}
              aria-invalid={status === "error"}
              required
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-6 py-2 bg-white text-rose-500 rounded-full hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={status === "loading" ? "Subscribing..." : "Subscribe to newsletter"}
          >
            {status === "loading" ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
        {message && (
          <div
            id="newsletter-message"
            className={`mt-4 text-sm ${
              status === "error" ? "text-red-200" : "text-white"
            }`}
            role="status"
            aria-live="polite"
          >
            {message}
          </div>
        )}
      </div>
    </section>
  )
}

export default NewsletterSignup
