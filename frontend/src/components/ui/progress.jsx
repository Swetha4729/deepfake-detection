import { cn } from '@/lib/utils'

function Progress({ className, ...props }) {
  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="100"
      className={cn('bg-primary/10 relative h-1.5 w-full overflow-hidden rounded-full', className)}
      {...props}
    >
      <div className="progress-indeterminate bg-primary absolute top-0 h-full rounded-full" />
    </div>
  )
}

export { Progress }