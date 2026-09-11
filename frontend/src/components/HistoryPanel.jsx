import { Clock, List, Trash2 } from 'react-feather'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function HistoryPanel({ history, activeId, onSelect, onClear }) {
  return (
    <Card className="h-fit lg:sticky lg:top-20">
      <CardHeader>
        <CardTitle>Session History</CardTitle>
        <CardAction>
          {history.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8" onClick={onClear} aria-label="Clear history">
                  <Trash2 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear session history</TooltipContent>
            </Tooltip>
          )}
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pb-2 pt-0">
        <div className="max-h-[430px] overflow-y-auto px-3">
          {history.length === 0 ? (
            <div className="py-14 text-center">
              <div className="bg-muted text-muted-foreground mx-auto flex size-12 items-center justify-center rounded-full">
                <List className="size-5" />
              </div>
              <p className="text-muted-foreground mt-3 text-sm">Files analyzed this session will appear here</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {history.map((item) => {
                const isSpoof = item.verdict === 'spoof'
                return (
                  <button
                    key={item.id}
                    className={`w-full cursor-pointer rounded-lg border px-3 py-2.5 text-left transition-colors duration-200 hover:bg-accent ${
                      activeId === item.id ? 'border-primary/60 bg-accent' : 'border-transparent hover:border-border'
                    }`}
                    onClick={() => onSelect(item.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium" title={item.filename}>
                        {item.filename}
                      </span>
                      <Badge variant={isSpoof ? 'spoof' : 'genuine'}>{isSpoof ? 'Synthetic' : 'Genuine'}</Badge>
                    </div>
                    <div className="bg-muted mt-2 h-1.5 overflow-hidden rounded-full">
                      <div
                        className={`h-full rounded-full ${isSpoof ? 'bg-spoof' : 'bg-genuine'}`}
                        style={{ width: `${item.confidence}%` }}
                      />
                    </div>
                    <div className="text-muted-foreground mt-1.5 flex items-center justify-between text-[11px]">
                      <span>{item.confidence}% confidence</span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {item.time}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}