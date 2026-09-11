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
import { Award, BarChart2, CheckCircle, Clock, Eye, Folder, TrendingUp, XCircle } from 'react-feather'

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
    <div className="group bg-muted/50 relative flex items-center gap-3 overflow-hidden rounded-lg border p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
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

export function Dashboard({ history, onClearHistory, onSelectHistory }) {
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
      .map((h) => {
        const index = [...history].reverse().indexOf(h)
        const name = h.filename.replace(/\.[^/.]+$/, '')
        return {
          short: `#${history.length - index}`,
          name: `${name} (#${history.length - index})`,
          confidence: h.confidence,
          verdict: h.verdict,
        }
      })
  }, [history])

  const hasData = stats.total > 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Detection Summary</CardTitle>
            <CardDescription>Statistics from your analysis session</CardDescription>
          </div>
          <CardAction>
            <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
              <BarChart2 className="size-4" />
            </div>
          </CardAction>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {statCards.map(({ key, label, icon, tint, suffix }) => (
            <StatCard key={key} label={label} value={stats[key]} suffix={suffix} icon={icon} tint={tint} />
          ))}
        </div>

        <Separator className="my-4" />

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">
              <BarChart2 className="size-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="log">
              <Clock className="size-4" />
              Session Log
              {hasData && (
                <span className="bg-muted-foreground/20 text-muted-foreground ml-1 rounded-full px-1.5 text-[10px] font-semibold">
                  {stats.total}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="animate-fade-in">
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
          </TabsContent>

          <TabsContent value="log" className="animate-fade-in">
            {hasData ? (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-muted-foreground text-xs">
                    {stats.total} record{stats.total === 1 ? '' : 's'} · last {stats.spoof > 0 ? `${stats.rate}% synthetic` : 'all genuine'}
                  </div>
                  {onClearHistory && (
                    <Button variant="ghost" size="sm" onClick={onClearHistory}>
                      <XCircle className="size-4" />
                      Clear log
                    </Button>
                  )}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[40%]">File</TableHead>
                      <TableHead>Verdict</TableHead>
                      <TableHead className="w-[28%]">Confidence</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((item) => {
                      const isSpoof = item.verdict === 'spoof'
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="max-w-[240px] truncate font-medium" title={item.filename}>
                            {item.filename}
                          </TableCell>
                          <TableCell>
                            <Badge variant={isSpoof ? 'spoof' : 'genuine'}>
                              {isSpoof ? <XCircle className="size-3" /> : <CheckCircle className="size-3" />}
                              {isSpoof ? 'Synthetic' : 'Genuine'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="bg-muted h-1.5 w-16 overflow-hidden rounded-full">
                                <div
                                  className={`h-full rounded-full ${isSpoof ? 'bg-spoof' : 'bg-genuine'}`}
                                  style={{ width: `${item.confidence}%` }}
                                />
                              </div>
                              <span className="text-muted-foreground text-xs tabular-nums">{item.confidence}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">{item.time}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1.5 px-2 text-xs"
                              onClick={() => onSelectHistory?.(item.id)}
                            >
                              <Eye className="size-3.5" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center">
                <div className="bg-muted flex size-12 items-center justify-center rounded-full">
                  <Clock className="size-5" />
                </div>
                <p className="text-sm">No analyses in this session yet</p>
                <p className="text-xs">Upload the first clip to start populating the log</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}