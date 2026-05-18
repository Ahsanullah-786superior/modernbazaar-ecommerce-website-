import AuthPage from '@/components/auth/AuthPage'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Create Account' }

export default function RegisterPage() {
  return <AuthPage mode="register" />
}
