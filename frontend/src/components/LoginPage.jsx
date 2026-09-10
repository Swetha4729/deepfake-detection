import { useState } from 'react'
import { Eye, EyeOff, Lock, LogIn, Mail, Shield } from 'react-feather'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function deriveName(email) {
  const local = String(email || '').split('@')[0].replace(/[._-]+/g, ' ').trim()
  if (!local) return 'User'
  return local
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setError('')
    setLoading(true)
    // Client-side authentication — there is no auth backend in this build.
    setTimeout(() => {
      onLogin({ name: deriveName(email), email })
    }, 600)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="animate-fade-up w-full max-w-sm py-8">
        <CardContent className="flex flex-col px-7">
          <div className="mb-1 flex flex-col items-center text-center">
            <div className="bg-primary text-primary-foreground mb-3 flex size-11 items-center justify-center rounded-xl shadow-sm">
              <Shield className="size-5" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">VoiceGuard</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">Sign in to the deepfake audio analyzer</p>
          </div>

          <form onSubmit={submit} className="mt-6 flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pr-9 pl-9"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                />
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-destructive animate-fade-in text-xs" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" className="mt-1 w-full" disabled={loading}>
              {loading ? <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <LogIn className="size-4" />}
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <p className="text-muted-foreground mt-6 text-center text-xs">
            VoiceGuard · Deepfake Audio Detector
          </p>
        </CardContent>
      </Card>
    </div>
  )
}