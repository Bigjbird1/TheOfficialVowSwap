"use client";

import { Container } from "./ui/Container";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Facebook, Instagram, Twitter } from "lucide-react";
import Link from "next/link";

const footerLinks = [
  {
    title: "About",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "FAQs", href: "/faqs" },
    ],
  },
  {
    title: "Sellers",
    links: [
      { label: "Seller Info", href: "/seller-info" },
      { label: "Start Selling", href: "/sign-up-sell" },
      { label: "Seller Guidelines", href: "/seller-guidelines" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: Facebook,
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: Instagram,
  },
  {
    label: "Twitter",
    href: "https://twitter.com",
    icon: Twitter,
  },
];

const paymentMethods = [
  "/images/payment/visa.svg",
  "/images/payment/mastercard.svg",
  "/images/payment/amex.svg",
  "/images/payment/paypal.svg",
];

export function Footer() {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter signup
  };

  return (
    <footer className="bg-white border-t mt-auto">
      <Container>
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-600 hover:text-[#E35B96] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Stay Updated
              </h3>
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  aria-label="Email for newsletter"
                  required
                />
                <Button type="submit" fullWidth>
                  Subscribe
                </Button>
              </form>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#E35B96] transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>

              <div className="flex items-center space-x-4">
                {paymentMethods.map((method, index) => (
                  <img
                    key={index}
                    src={method}
                    alt="Payment method"
                    className="h-8"
                  />
                ))}
              </div>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
              <p>© {new Date().getFullYear()} VowSwap. All rights reserved.</p>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
