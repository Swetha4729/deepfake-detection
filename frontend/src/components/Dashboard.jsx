import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Award, BarChart2, CheckCircle, Folder, TrendingUp, XCircle } from 'react-feather'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCountUp } from '@/lib/useCountUp'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div className="bg-popover text-popover-foreground rounded-lg border px-3 py-2 text-xs shadow-md">
      <div className="text-muted-foreground mb-1">{label}</div>
      <div className="font-semibold">{typeof p.value === 'number' ? `${p.value}%` : p.value}</div>
    </div>
  )
}

const statCards = [
  { key: 'total', label: 'Files Analyzed', icon: Folder, tint: 'text-primary bg-primary/10', suffix: '' },
  { key: 'genuine', label: 'Genuine', icon: CheckCircle, tint: 'text-chart-2 bg-chart-2/10', suffix: '' },
  { key: 'spoof', label: 'Spoof', icon: XCircle, tint: 'text-destructive bg-destructive/10', suffix: '' },
  { key: 'rate', label: 'Spoof Rate', icon: TrendingUp, tint: 'text-amber-500 bg-amber-500/10', suffix: '%' },
  { key: 'avgConf', label: 'Avg Confidence', icon: Award, tint: 'text-primary bg-primary/10', suffix: '%' },
]

function StatCard({ label, value, suffix = '', icon: Icon, tint }) {
  const animated = useCountUp(value, { duration: 700 })

  return (
    <div className="group bg-muted/50 flex items-center gap-3 rounded-lg border p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
      <div
        className={`flex size-9 shrink-0 items-center justify-center rounded-md transition-transform duration-200 group-hover:scale-105 ${tint}`}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <div className="truncate text-2xl leading-tight font-semibold tabular-nums">
          {animated}
          {suffix}
        </div>
        <div className="text-muted-foreground truncate text-xs">{label}</div>
      </div>
    </div>
  )
}

export function Dashboard({ history }) {
  const stats = useMemo(() => {
    const total = history.length
    const spoof = history.filter((h) => h.verdict === 'spoof').length
    const genuine = total - spoof
    return {
      total,
      spoof,
      genuine,
      rate: total ? Math.round((spoof / total) * 100) : 0,
      avgConf: total ? Math.round(history.reduce((acc, h) => acc + h.confidence, 0) / total) : 0,
    }
  }, [history])

  const pieData = [
    { name: 'Genuine', value: stats.genuine, fill: 'var(--chart-2)' },
    { name: 'Spoof', value: stats.spoof, fill: 'var(--spoof)' },
  ]

  const trend = useMemo(() => {
    return [...history]
      .slice(0, 10)
      .reverse()
      .map((h, i) => {
        const idx = history.length - i
        const name = h.filename.replace(/\.[^/.]+$/, '')
        return {
          short: `#${idx}`,
          name: `${name} (#${idx})`,
          confidence: h.confidence,
          verdict: h.verdict,
        }
      })
  }, [history])

  const hasData = stats.total > 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Detection Summary</CardTitle>
            <CardDescription>Statistics from your analysis session</CardDescription>
          </div>
          <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
            <BarChart2 className="size-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {statCards.map(({ key, label, icon, tint, suffix }) => (
            <StatCard key={key} label={label} value={stats[key]} suffix={suffix} icon={icon} tint={tint} />
          ))}
        </div>

        <Separator className="my-4" />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="animate-fade-in rounded-lg border p-4">
            <div className="mb-1 text-sm font-medium">Verdict Distribution</div>
            <div className="text-muted-foreground mb-3 text-xs">Genuine vs. synthetic clips detected</div>
            <div className="relative h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={80}
                    paddingAngle={4}
                    strokeWidth={0}
                  >
                    {pieData.map((d, i) => (
                      <Cell key={i} fill={d.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {hasData ? (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl font-semibold tabular-nums">{stats.total}</div>
                  <div className="text-muted-foreground text-xs">clips</div>
                </div>
              ) : (
                <div className="text-muted-foreground absolute inset-0 flex items-center justify-center text-xs">
                  No data yet
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center justify-center gap-5 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ background: 'var(--chart-2)' }} />
                Genuine {stats.genuine}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ background: 'var(--spoof)' }} />
                Spoof {stats.spoof}
              </span>
            </div>
          </div>

          <div className="animate-fade-in rounded-lg border p-4">
            <div className="mb-1 text-sm font-medium">Recent Confidence</div>
            <div className="text-muted-foreground mb-3 text-xs">Last {Math.min(10, trend.length) || 0} predictions (rolling)</div>
            {hasData ? (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trend} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                    <XAxis dataKey="short" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                    <YAxis
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                      tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
                    <ReferenceLine y={50} stroke="var(--border)" strokeDasharray="4 3" />
                    <Bar dataKey="confidence" radius={[4, 4, 0, 0]}>
                      {trend.map((d, i) => (
                        <Cell key={i} fill={d.verdict === 'spoof' ? 'var(--spoof)' : 'var(--chart-2)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-muted-foreground flex h-52 items-center justify-center text-xs">No data yet</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}