'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Instagram, Twitter, Facebook, Youtube, Mail, MapPin, Phone } from 'lucide-react'

const FOOTER_LINKS = {
  Shop: [
    { label: 'Kitchen Appliances', href: '/products?category=kitchen' },
    { label: 'Food Products', href: '/recipes' },
    { label: 'Kids Toys', href: 'https://www.toynix.pk/?srsltid=AfmBOoqJgCU5fCcoOrSKpc698gmM3YML-8YdIw43Owtw2zS8jWe-myPg', external: true },
    { label: 'Watches', href: '/products?category=watches' },
    { label: 'Earbuds', href: '/products?category=earbuds' },
  ],

  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Services', href: 'https://www.linkedin.com/in/ahsan-ullah-b61a09349?utm_source=share_via&utm_content=profile&utm_medium=member_android', external: true },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Partners', href: '/partners' },
  ],
}

const SOCIAL_LINKS = [
  { Icon: Instagram, href: '#', label: 'Instagram' },
  { Icon: Twitter, href: '#', label: 'Twitter' },
  { Icon: Facebook, href: '#', label: 'Facebook' },
  { Icon: Youtube, href: '#', label: 'YouTube' },
]

export default function Footer() {
  return (
    <footer className="bg-bazaar-dark dark:bg-black text-white">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl font-semibold mb-1">
                Stay in the loop
              </h3>
              <p className="text-white/60 text-sm">
                Get exclusive deals and early access to new arrivals.
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-72 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary text-sm"
              />
              <button className="px-6 py-3 bg-primary rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm font-display">R</span>
              </div>
              <span className="font-display text-xl font-semibold">Raman</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xs">
              Curated commerce for the modern lifestyle. Premium products, exceptional
              experience, delivered to your door.
            </p>
            {/* Contact */}
            <div className="space-y-2 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <span>lahore awt phase 2</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <a href="tel:03126962786" className="hover:text-white transition-colors">03126962786</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <a href="mailto:ahsanullah55663322@gmail.com" className="hover:text-white transition-colors">ahsanullah55663322@gmail.com</a>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-medium text-sm mb-4 text-white/90 tracking-wider uppercase">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link: any) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors"
                      {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} Raman. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="text-white/40 hover:text-white transition-colors"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase().replace(/ /g, '-')}`}
                className="text-xs text-white/40 hover:text-white transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
