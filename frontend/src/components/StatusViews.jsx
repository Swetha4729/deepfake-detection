import { AlertTriangle, RotateCcw } from 'react-feather'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

export function AnalyzingState({ filename }) {
  return (
    <Card className="animate-fade-in">
      <CardContent className="space-y-4 px-5 py-6">
        {/* Verdict banner skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-56" />
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
          <div className="flex items-center gap-2 text-sm">
            <span className="bg-primary/10 text-primary relative flex size-5 items-center justify-center rounded-full">
              <span className="bg-primary absolute inline-flex size-full animate-ping rounded-full opacity-30" />
              <span className="bg-primary relative inline-flex size-2.5 rounded-full" />
            </span>
            <span>
              Analyzing <span className="font-medium">&ldquo;{filename}&rdquo;</span>
            </span>
          </div>
          <Progress className="max-w-xs" />
          <p className="text-muted-foreground text-xs">
            The first second of audio is analyzed by the model — this may take a few seconds
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
        <div className="bg-destructive/10 text-destructive animate-pop-in mb-5 flex size-14 items-center justify-center rounded-full">
          <AlertTriangle className="size-7" />
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