import { Menu } from 'react-feather'

import { ProfileMenu } from '@/components/ProfileMenu'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function Header({ title, subtitle, user, onLogout, onMenuClick }) {
  return (
    <header className="bg-background/80 sticky top-0 z-30 border-b backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
            onClick={onMenuClick}
          >
            <Menu className="size-5" />
          </Button>
          <div className="flex min-w-0 items-center gap-2 lg:gap-2.5">
            <span className="text-muted-foreground/70 hidden items-center gap-1 text-[11px] font-medium tracking-wider uppercase lg:flex">
              VoiceGuard
              <span className="mx-1 text-border">/</span>
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold tracking-tight">{title}</h1>
              <p className="text-muted-foreground hidden truncate text-xs sm:block">{subtitle}</p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ThemeToggle />
              </div>
            </TooltipTrigger>
            <TooltipContent>Toggle theme</TooltipContent>
          </Tooltip>
          <ProfileMenu user={user} onLogout={onLogout} />
        </div>
      </div>
    </header>
  )
}