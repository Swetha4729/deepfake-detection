import { AlertTriangle, Activity, Cpu, RotateCcw, Headphones } from 'react-feather'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

export function AnalyzingState({ filename, attempt = 1 }) {
  const retrying = attempt > 1
  return (
    <Card className="animate-fade-in">
      <CardContent className="space-y-4 px-5 py-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
          <div className="hidden space-y-2 sm:block">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
        <Skeleton className="h-16 w-full rounded-lg" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
        <Skeleton className="h-28 w-full rounded-lg" />

        <div className="flex flex-col items-center gap-3 pt-1 text-center">
          <Badge
            variant="outline"
            className="text-primary animate-pulse gap-2 border-primary/30 bg-primary/5 px-3 py-1"
          >
        
            
          </Badge>
          <div className="flex items-center gap-2 text-sm">
            <div className="text-primary inline-flex size-5 items-center justify-center">
              <Activity className="size-4 animate-pulse" />
            </div>
            <span>
              Analyzing <span className="font-medium">&ldquo;{filename}&rdquo;</span>
            </span>
          </div>
          <Progress className="max-w-xs" />
          <p className="text-muted-foreground text-xs">
            {retrying
              ? `Backend is waking up — retrying (attempt ${attempt}/4)…`
              : 'The first second of audio is analyzed by the model — this may take a few seconds'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function ErrorState({ message, onReset }) {
  return (
    <Card className="animate-fade-up">
      <CardContent className="flex flex-col items-center px-5 py-14 text-center">
        <div className="bg-destructive/10 text-destructive mb-5 flex size-12 items-center justify-center rounded-full ring-8 ring-destructive/5">
          <AlertTriangle className="size-6" />
        </div>
        <h2 className="text-lg font-semibold">Analysis Failed</h2>
        <p className="text-muted-foreground mt-1 max-w-md text-sm">{message}</p>
        <Button variant="outline" className="mt-6" onClick={onReset}>
          <RotateCcw className="size-4" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  )
}