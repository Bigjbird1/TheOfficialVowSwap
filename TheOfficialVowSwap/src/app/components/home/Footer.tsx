export const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/terms", label: "Terms" },
    { href: "/privacy", label: "Privacy" }
  ]

  const features = [
    { label: "Secure Payments", icon: "🔒" },
    { label: "Buyer Protection", icon: "🛡️" },
    { label: "24/7 Support", icon: "💬" }
  ]

  return (
    <footer className="border-t" role="contentinfo">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Features Section */}
          <div className="flex flex-wrap items-center gap-4 mb-4 md:mb-0">
            {features.map((feature, index) => (
              <div 
                key={feature.label}
                className="flex items-center gap-2"
              >
                <span 
                  className="text-gray-600" 
                  role="img" 
                  aria-label={feature.label}
                >
                  {feature.icon}
                </span>
                <span className="text-sm text-gray-600">
                  {feature.label}
                </span>
                {index < features.length - 1 && (
                  <span className="text-gray-600" aria-hidden="true">•</span>
                )}
              </div>
            ))}
          </div>

          {/* Navigation Links */}
          <nav aria-label="Footer Navigation">
            <ul className="flex items-center gap-4">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <a 
                    href={link.href}
                    className="text-gray-600 hover:text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 rounded-md px-2 py-1"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Copyright Notice */}
        <div className="mt-4 text-center text-gray-500 text-sm">
          <p>
            &copy; {currentYear}{" "}
            <a 
              href="/"
              className="hover:text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 rounded-md px-2 py-1"
            >
              VowSwap
            </a>
            . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
