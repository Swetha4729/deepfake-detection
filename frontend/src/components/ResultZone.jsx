import { Activity, AlertTriangle, CheckCircle, RefreshCw } from 'react-feather'

import { SegmentChart } from '@/components/SegmentChart'
import { MfccHeatmap } from '@/components/MfccHeatmap'
import { WaveformPlayer } from '@/components/WaveformPlayer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useCountUp } from '@/lib/useCountUp'

function StatChip({ label, value, hint, cls = '' }) {
  return (
    <div className="bg-muted/50 flex flex-col justify-between rounded-lg border p-3">
      <div className={`text-lg font-semibold tabular-nums ${cls}`}>{value}</div>
      <div className="mt-1 flex items-center justify-between gap-1">
        <div className="text-muted-foreground text-[11px]">{label}</div>
        {hint && <div className="text-muted-foreground/70 text-[10px]">{hint}</div>}
      </div>
    </div>
  )
}

export function ResultZone({ result, file, onReset }) {
  const isSpoof = result.verdict === 'spoof'
  const flagged = result.segment_probabilities.filter((p) => p >= 0.7).length
  const confidence = useCountUp(result.confidence, { duration: 700 })

  const stats = [
    {
      label: 'Spoof Probability',
      value: `${(result.spoof_probability * 100).toFixed(1)}%`,
      cls: isSpoof ? 'text-spoof' : 'text-genuine',
      hint: 'model score',
    },
    { label: 'Segments', value: result.segment_count, hint: '1s windows' },
    { label: 'Flagged Segments', value: flagged, cls: flagged > 0 ? 'text-spoof' : '', hint: '≥ 70%' },
  ]

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="text-lg">Analysis Result</CardTitle>
          <p className="text-muted-foreground text-sm">Forensic report for verified clip</p>
        </div>
        <Badge variant={isSpoof ? 'spoof' : 'genuine'} className="mt-0.5">
          {isSpoof ? <AlertTriangle className="size-3" /> : <CheckCircle className="size-3" />}
          {isSpoof ? 'Synthetic' : 'Genuine'}
        </Badge>
      </CardHeader>
      <CardContent>
        <div
          className={`animate-fade-in flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
            isSpoof ? 'border-spoof/25 bg-spoof/5' : 'border-genuine/25 bg-genuine/5'
          }`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex size-11 shrink-0 items-center justify-center rounded-full ${
                isSpoof ? 'bg-spoof/15 text-spoof' : 'bg-genuine/15 text-genuine'
              }`}
            >
              {isSpoof ? <AlertTriangle className="size-5" /> : <CheckCircle className="size-5" />}
            </div>
            <div className="min-w-0">
              <div className="text-base leading-tight font-semibold">{isSpoof ? 'Likely Synthetic' : 'Likely Genuine'}</div>
              <div className="text-muted-foreground truncate text-xs">{result.filename}</div>
            </div>
          </div>
          <div className="shrink-0 text-left sm:text-right">
            <div className="text-2xl leading-tight font-semibold tabular-nums">{confidence}%</div>
            <div className="text-muted-foreground text-xs">Confidence</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <StatChip key={s.label} label={s.label} value={s.value} cls={s.cls} hint={s.hint} />
          ))}
        </div>

        {file && (
          <>
            <Separator className="my-5" />
            <div className="mb-3 flex items-center gap-2">
              <Activity className="text-primary size-4" />
              <p className="text-sm font-medium">Waveform</p>
            </div>
            <WaveformPlayer file={file} />
          </>
        )}

        {result.segment_probabilities.length > 0 && (
          <>
            <Separator className="my-5" />
            <div className="mb-3 flex items-center gap-2">
              <Activity className="text-spoof size-4" />
              <p className="text-sm font-medium">Per-Segment Spoof Probability</p>
            </div>
            <SegmentChart probabilities={result.segment_probabilities} />
          </>
        )}

        {result.mfcc?.length > 0 && (
          <>
            <Separator className="my-5" />
            <div className="mb-3 flex items-center gap-2">
              <Activity className="text-primary size-4" />
              <p className="text-sm font-medium">MFCC Heatmap</p>
            </div>
            <MfccHeatmap mfcc={result.mfcc} />
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