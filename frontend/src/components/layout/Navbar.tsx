'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  User,
  Heart,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useCartStore, useAuthStore, useUIStore } from '@/store'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/layout/Logo'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop' },
  { href: '/products?category=kitchen', label: 'Kitchen' },
  { href: '/products?category=watches', label: 'Watches' },
  { href: '/products?category=earbuds', label: 'Earbuds' },
  { href: '/recipes', label: 'Food' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const { itemCount, toggleCart } = useCartStore()
  const { isAuthenticated, user } = useAuthStore()
  const { mobileMenuOpen, toggleMobileMenu, toggleSearch } = useUIStore()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <motion.header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-background/95 backdrop-blur-md shadow-sm border-b border-border'
            : 'bg-transparent'
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="group">
              <Logo />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'text-sm font-medium transition-colors relative group',
                    pathname === href
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {label}
                  <span
                    className={cn(
                      'absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-200',
                      pathname === href ? 'w-full' : 'w-0 group-hover:w-full'
                    )}
                  />
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={toggleSearch}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Theme toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Wishlist */}
              <button
                className="hidden sm:flex p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
              </button>

              {/* Auth */}
              {isAuthenticated ? (
                <Link
                  href="/account"
                  className="hidden sm:flex p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <User className="w-5 h-5" />
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="hidden sm:block text-sm font-medium px-4 py-2 rounded-full border border-border hover:bg-muted transition-colors"
                >
                  Sign In
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={toggleCart}
                className="relative p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium"
                  >
                    {itemCount > 99 ? '99+' : itemCount}
                  </motion.span>
                )}
              </button>

              {/* Mobile menu */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="Menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={toggleMobileMenu}
            />
            <motion.nav
              className="absolute top-0 right-0 bottom-0 w-72 bg-background shadow-2xl pt-20 px-6 py-8"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="flex flex-col gap-4">
                {NAV_LINKS.map(({ href, label }, i) => (
                  <motion.div
                    key={href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={href}
                      onClick={toggleMobileMenu}
                      className={cn(
                        'block text-lg font-medium py-2 border-b border-border',
                        pathname === href ? 'text-primary' : 'text-foreground'
                      )}
                    >
                      {label}
                    </Link>
                  </motion.div>
                ))}
                <div className="pt-4 flex flex-col gap-3">
                  {isAuthenticated ? (
                    <Link
                      href="/account"
                      onClick={toggleMobileMenu}
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <User className="w-4 h-4" />
                      My Account
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        onClick={toggleMobileMenu}
                        className="btn-primary text-center py-2 rounded-lg bg-primary text-white font-medium"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/auth/register"
                        onClick={toggleMobileMenu}
                        className="text-center py-2 rounded-lg border border-border font-medium text-sm"
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
