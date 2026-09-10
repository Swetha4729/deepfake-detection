import { AlertTriangle, CheckCircle, RefreshCw } from 'react-feather'

import { SegmentChart } from '@/components/SegmentChart'
import { MfccHeatmap } from '@/components/MfccHeatmap'
import { WaveformPlayer } from '@/components/WaveformPlayer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCountUp } from '@/lib/useCountUp'

function StatChip({ label, value, cls = '' }) {
  return (
    <div className="bg-muted/50 animate-fade-up rounded-lg border p-3 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
      <div className={`text-lg font-bold tabular-nums ${cls}`}>{value}</div>
      <div className="text-muted-foreground mt-1 text-[11px]">{label}</div>
    </div>
  )
}

export function ResultZone({ result, file, onReset }) {
  const isSpoof = result.verdict === 'spoof'
  const flagged = result.segment_probabilities.filter((p) => p >= 0.7).length
  const confidence = useCountUp(result.confidence, { duration: 1000 })

  const stats = [
    {
      label: 'Spoof Probability',
      value: `${(result.spoof_probability * 100).toFixed(1)}%`,
      cls: isSpoof ? 'text-spoof' : 'text-genuine',
    },
    { label: 'Segments', value: result.segment_count, cls: '' },
    { label: 'Flagged Segments', value: flagged, cls: '' },
  ]

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg">Analysis Result</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`animate-pop-in rounded-lg border p-4 ${
            isSpoof ? 'border-spoof/30 bg-spoof/5' : 'border-genuine/30 bg-genuine/5'
          }`}
        >
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                  isSpoof ? 'bg-spoof/15 text-spoof' : 'bg-genuine/15 text-genuine'
                }`}
              >
                {isSpoof ? <AlertTriangle className="size-5" /> : <CheckCircle className="size-5" />}
              </div>
              <div className="min-w-0">
                <div className="text-lg leading-tight font-bold">{isSpoof ? 'Likely Synthetic' : 'Likely Genuine'}</div>
                <div className="text-muted-foreground truncate text-xs">{result.filename}</div>
              </div>
            </div>
            <div className="shrink-0 text-left sm:text-right">
              <div className="text-2xl leading-tight font-extrabold tabular-nums">{confidence}%</div>
              <div className="text-muted-foreground text-xs">Confidence</div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {stats.map((s, i) => (
            <StatChip key={s.label} label={s.label} value={s.value} cls={s.cls} />
          ))}
        </div>

        {file && (
          <>
            <Separator className="my-5" />
            <p className="animate-fade-up mb-3 text-sm font-medium">Waveform</p>
            <div className="animate-fade-up" style={{ animationDelay: '60ms' }}>
              <WaveformPlayer file={file} />
            </div>
          </>
        )}

        {result.segment_probabilities.length > 0 && (
          <>
            <Separator className="my-5" />
            <p className="animate-fade-up mb-3 text-sm font-medium" style={{ animationDelay: '120ms' }}>
              Per-Segment Spoof Probability
            </p>
            <div className="animate-fade-up" style={{ animationDelay: '180ms' }}>
              <SegmentChart probabilities={result.segment_probabilities} />
            </div>
          </>
        )}

        {result.mfcc?.length > 0 && (
          <>
            <Separator className="my-5" />
            <p className="animate-fade-up mb-3 text-sm font-medium" style={{ animationDelay: '200ms' }}>
              MFCC Heatmap
            </p>
            <div className="animate-fade-up" style={{ animationDelay: '260ms' }}>
              <MfccHeatmap mfcc={result.mfcc} />
            </div>
          </>
        )}

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onReset}>
            <RefreshCw className="size-4" />
            Analyze Another File
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}