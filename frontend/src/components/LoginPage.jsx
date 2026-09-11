import { useState } from 'react'
import { Activity, CheckCircle, Eye, EyeOff, Layers, Lock, LogIn, Mail, Shield, Star, XCircle } from 'react-feather'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

function deriveName(email) {
  const local = String(email || '').split('@')[0].replace(/[._-]+/g, ' ').trim()
  if (!local) return 'User'
  return local
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

const FEATURES = [
  { icon: Activity, text: 'Real-time per-second spoof probability scoring' },
  { icon: Layers, text: 'Segment-level forensic waveform analysis' },
  { icon: Star, text: 'Session analytics and full detection history' },
]

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
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Brand panel */}
      <div className="relative flex flex-col justify-between overflow-hidden border-b bg-gradient-to-br from-primary via-primary/90 to-chart-4 px-6 py-10 text-white lg:w-[46%] lg:border-r lg:border-b-0 lg:px-14 lg:py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.35) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />
        <div className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-white/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="bg-white/15 flex size-11 items-center justify-center rounded-xl ring-1 ring-white/30 backdrop-blur">
              <Shield className="size-6" />
            </div>
            <div>
              <div className="text-lg leading-tight font-bold tracking-tight">VoiceGuard</div>
              <div className="text-white/70 text-xs">Deepfake Audio Detection Platform</div>
            </div>
          </div>
        </div>

        <div className="relative my-10">
          <h1 className="text-3xl leading-tight font-bold tracking-tight lg:text-4xl">
            Trust every voice.
            <br />
            <span className="text-white/80">Verify every recording.</span>
          </h1>
          <p className="text-white/75 mt-4 max-w-md text-sm leading-relaxed">
            Enterprise-grade synthetic audio forensics. Upload a clip and let the model expose
            machine-generated speech with segment-level confidence.
          </p>

          <ul className="mt-8 space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm">
                <span className="bg-white/15 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md ring-1 ring-white/20">
                  <Icon className="size-3.5" />
                </span>
                <span className="text-white/85">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="size-4 text-emerald-300" />
            <span className="text-white/70">Model v2 · Wav2Vec</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="size-4 text-red-300" />
            <span className="text-white/70">Rejects synthetic voice</span>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <Card className="animate-fade-up w-full max-w-sm py-8">
          <CardContent className="flex flex-col px-7">
            <div className="mb-1 flex flex-col items-center text-center">
              <div className="bg-primary/10 text-primary mb-4 flex size-11 items-center justify-center rounded-xl ring-1 ring-primary/20">
                <Shield className="size-5" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
              <p className="text-muted-foreground mt-1 text-sm">Sign in to continue to your workspace</p>
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button type="button" className="text-primary hover:text-primary/80 cursor-pointer text-xs font-medium">
                    Forgot password?
                  </button>
                </div>
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
                {loading ? 'Authenticating…' : 'Sign In'}
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="flex items-center justify-center gap-2">
              <Lock className="text-muted-foreground size-3.5" />
              <p className="text-muted-foreground text-xs">
                VoiceGuard · Data stays on your infrastructure
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}