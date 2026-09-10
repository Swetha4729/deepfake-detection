import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

function SegTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  return (
    <div className="bg-popover text-popover-foreground rounded-lg border px-3 py-2 text-xs shadow-md">
      <div className="text-muted-foreground mb-1">Segment {label}</div>
      <div className={`font-semibold ${val >= 0.7 ? 'text-spoof' : 'text-genuine'}`}>
        Spoof prob: {(val * 100).toFixed(1)}%
      </div>
    </div>
  )
}

export function SegmentChart({ probabilities }) {
  const data = probabilities.map((p, i) => ({ seg: i + 1, prob: p }))

  return (
    <div>
      <div className="text-muted-foreground mb-2 flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="bg-chart-2 size-2.5 rounded-full" />
          Genuine (below 70%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="bg-spoof size-2.5 rounded-full" />
          Spoof (70%+)
        </span>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }} barCategoryGap="20%">
            <XAxis
              dataKey="seg"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 1]}
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<SegTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
            <ReferenceLine y={0.7} stroke="var(--spoof)" strokeDasharray="4 3" opacity={0.5} />
            <Bar dataKey="prob" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.prob >= 0.7 ? 'var(--spoof)' : 'var(--chart-2)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}