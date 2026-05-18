'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useRef, useEffect } from 'react'

const FLOATING_TAGS = ['Kitchen', 'Toys', 'Watches', 'Earbuds', 'Food']

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-background via-background to-orange-50/50 dark:to-orange-950/20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), 
                              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 lg:pt-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              New arrivals just dropped
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-semibold leading-[1.05] tracking-tight mb-6"
            >
              Shop the{' '}
              <span className="relative inline-block">
                <span className="text-primary">Modern</span>
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-primary rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                />
              </span>
              <br />
              Way
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-md"
            >
              Discover curated collections of premium products across five unique
              categories — crafted for those who demand the extraordinary.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
              >
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/products?featured=true"
                className="inline-flex items-center gap-2 px-8 py-4 border border-border rounded-full font-medium hover:bg-muted transition-all hover:scale-105 active:scale-95"
              >
                Explore Featured
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center gap-8 mt-12 pt-8 border-t border-border"
            >
              {[
                { value: '50K+', label: 'Happy Customers' },
                { value: '1200+', label: 'Products' },
                { value: '4.9★', label: 'Avg Rating' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="font-display text-2xl font-semibold text-primary">{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Video hero */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Gradient ring */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 blur-xl" />

              {/* Video card */}
              <div className="relative rounded-3xl overflow-hidden aspect-square shadow-2xl">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                >
                  {/* Apni video ka URL yahan dalo */}
                  <source src="/hero-video.mp4" type="video/mp4" />
                </video>

                {/* Light overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                {/* Bottom label */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-2xl px-6 py-3 inline-block">
                    <p className="font-display text-lg font-semibold">Trending Now</p>
                    <p className="text-sm text-muted-foreground">Shop latest arrivals</p>
                  </div>
                </div>
              </div>

              {/* Floating category tags */}
              {FLOATING_TAGS.map((tag, i) => {
                const positions = [
                  '-top-4 left-12',
                  '-right-4 top-1/4',
                  '-right-6 bottom-1/3',
                  '-bottom-4 right-16',
                  '-left-6 bottom-1/4',
                ]
                return (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className={`absolute ${positions[i]} bg-background/95 dark:bg-card backdrop-blur-sm border border-border rounded-full px-4 py-2 text-sm font-medium shadow-lg hover:shadow-xl transition-shadow cursor-pointer`}
                  >
                    {tag}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center pt-2"
        >
          <div className="w-1 h-2 rounded-full bg-muted-foreground/50" />
        </motion.div>
      </motion.div>
    </section>
  )
}
