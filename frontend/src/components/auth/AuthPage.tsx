'use client'

import { useState, forwardRef, type InputHTMLAttributes } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store'
import { authApi } from '@/lib/api'
import toast from 'react-hot-toast'

// ─── Schemas ──────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

// ─── Input Component ──────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, type = 'text', ...props }, ref) => {
    const [show, setShow] = useState(false)
    const isPassword = type === 'password'

    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-medium">{label}</label>
        <div className="relative">
          <input
            ref={ref}
            type={isPassword ? (show ? 'text' : 'password') : type}
            className={`w-full px-4 py-3 rounded-xl border ${
              error ? 'border-destructive' : 'border-border'
            } bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter()
  const { setAuth } = useAuthStore()

  // Login form
  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  const onLogin: SubmitHandler<LoginForm> = async (data) => {
    try {
      const res = await authApi.login({
        email: data.email!,
        password: data.password!,
      })
      setAuth(res.data.user, res.data.token)
      const userRole = res.data.user.role
      toast.success(`Welcome back, ${res.data.user.name}! 👋`)
      if (userRole === 'admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Login failed. Please try again.')
    }
  }

  const onRegister: SubmitHandler<RegisterForm> = async (data) => {
    try {
      const res = await authApi.register({
        name: data.name!,
        email: data.email!,
        password: data.password!,
      })
      setAuth(res.data.user, res.data.token)
      toast.success(`Welcome to Modern Bazaar, ${res.data.user.name}! 🎉`)
      router.push('/')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left visual panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-bazaar-dark items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative z-10 text-center px-12">
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="text-8xl mb-8"
          >
            🛍️
          </motion.div>
          <Link href="/" className="flex items-center gap-2 justify-center mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm font-display">M</span>
            </div>
            <span className="font-display text-2xl font-semibold text-white">Modern Bazaar</span>
          </Link>
          <p className="text-white/60 text-lg leading-relaxed">
            Your curated marketplace for premium products across five unique categories.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            {['🍳', '⌚', '🎧', '🧸', '🥗'].map((emoji, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.5 }}
                className="text-3xl"
              >
                {emoji}
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm font-display">M</span>
              </div>
              <span className="font-display text-xl font-semibold">Modern Bazaar</span>
            </Link>
          </div>

          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="font-display text-3xl font-semibold mb-1">Welcome back</h1>
                <p className="text-muted-foreground text-sm mb-8">
                  Sign in to your Modern Bazaar account.
                </p>

                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    error={loginForm.formState.errors.email?.message}
                    {...loginForm.register('email')}
                  />
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    error={loginForm.formState.errors.password?.message}
                    {...loginForm.register('password')}
                  />
                  <div className="flex justify-end">
                    <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <button
                    type="submit"
                    disabled={loginForm.formState.isSubmitting}
                    className="w-full py-3.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loginForm.formState.isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Sign In
                  </button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  Don't have an account?{' '}
                  <Link href="/auth/register" className="text-primary font-medium hover:underline">
                    Create one
                  </Link>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="font-display text-3xl font-semibold mb-1">Create account</h1>
                <p className="text-muted-foreground text-sm mb-8">
                  Join Modern Bazaar and start shopping.
                </p>

                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <Input
                    label="Full Name"
                    placeholder="John Doe"
                    error={registerForm.formState.errors.name?.message}
                    {...registerForm.register('name')}
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    error={registerForm.formState.errors.email?.message}
                    {...registerForm.register('email')}
                  />
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Min. 6 characters"
                    error={registerForm.formState.errors.password?.message}
                    {...registerForm.register('password')}
                  />
                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="Repeat password"
                    error={registerForm.formState.errors.confirmPassword?.message}
                    {...registerForm.register('confirmPassword')}
                  />
                  <button
                    type="submit"
                    disabled={registerForm.formState.isSubmitting}
                    className="w-full py-3.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {registerForm.formState.isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create Account
                  </button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-primary font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
