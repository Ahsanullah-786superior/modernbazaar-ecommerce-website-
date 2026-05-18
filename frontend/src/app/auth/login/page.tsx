// src/app/auth/login/page.tsx
import AuthPage from '@/components/auth/AuthPage'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Sign In' }

export default function LoginPage() {
  return <AuthPage mode="login" />
}
