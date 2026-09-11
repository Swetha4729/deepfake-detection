import { BarChart2, Shield, UploadCloud, X } from 'react-feather'

import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
  { id: 'workspace', label: 'Workspace', icon: UploadCloud },
]

export function Sidebar({ activeTab, onNavigate, onClose = null, mobile = false }) {
  return (
    <aside
      className={cn(
        'bg-card flex w-60 shrink-0 flex-col border-r',
        mobile ? 'h-full' : 'sticky top-0 hidden h-screen lg:flex',
      )}
    >
      {/* Brand */}
      <div className="flex h-16 items-center justify-between gap-3 border-b px-4">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 text-primary relative flex size-8 items-center justify-center rounded-lg ring-1 ring-primary/20">
            <Shield className="size-4" />
          </div>
          <div>
            <div className="text-sm leading-tight font-semibold tracking-tight">VoiceGuard</div>
            <div className="text-muted-foreground text-[11px]">Deepfake Audio Detector</div>
          </div>
        </div>
        {mobile && onClose && (
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer rounded-md p-1.5 transition-colors"
            aria-label="Close sidebar"
            onClick={onClose}
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <div className="text-muted-foreground px-2 pb-2 text-[11px] font-semibold tracking-wider uppercase">
          Navigation
        </div>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group relative flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              <span
                className={cn(
                  'bg-primary absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full transition-all duration-200',
                  active ? 'opacity-100' : 'opacity-0',
                )}
              />
              <Icon className="size-4" />
              {label}
            </button>
          )
        })}
      </nav>

      {/* Status footer */}
      <div className="border-t px-4 py-3">
        <p className="text-muted-foreground text-[10px]">
          VoiceGuard 
        </p>
      </div>
    </aside>
  )
}