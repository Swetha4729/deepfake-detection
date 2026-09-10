import { Shield } from 'react-feather'

import { ThemeToggle } from '@/components/ThemeToggle'

export function Header() {
  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg shadow-sm">
            <Shield className="size-5" />
          </div>
          <div>
            <h1 className="text-base leading-tight font-bold tracking-tight">VoiceGuard</h1>
            <p className="text-muted-foreground hidden text-xs sm:block">Deepfake Audio Detector</p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}