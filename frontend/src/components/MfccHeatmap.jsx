export function MfccHeatmap({ mfcc }) {
  if (!mfcc || mfcc.length === 0) return null

  // mfcc is (time_frames, n_mfcc) = (101, 13) from the backend
  const nTime = mfcc.length
  const nCoeff = mfcc[0].length

  let min = Infinity
  let max = -Infinity
  for (const row of mfcc) {
    for (const v of row) {
      if (v < min) min = v
      if (v > max) max = v
    }
  }
  const span = max - min || 1

  // viridis-like interpolated palette (low → high)
  const palette = [
    [68, 1, 84], [71, 44, 122], [59, 81, 139], [44, 113, 142],
    [33, 144, 141], [39, 173, 129], [92, 200, 99], [170, 220, 50], [253, 231, 37],
  ]
  const colorAt = (t) => {
    const p = Math.max(0, Math.min(0.99999, t)) * (palette.length - 1)
    const i = Math.floor(p)
    const f = p - i
    const a = palette[i]
    const b = palette[i + 1]
    return `rgb(${Math.round(a[0] + (b[0] - a[0]) * f)},${Math.round(a[1] + (b[1] - a[1]) * f)},${Math.round(a[2] + (b[2] - a[2]) * f)})`
  }

  const cellW = Math.max(3, Math.min(5, Math.floor(500 / nTime)))
  const cellH = 16
  const padL = 36
  const padT = 10
  const padB = 26
  const W = padL + nTime * cellW
  const H = padT + nCoeff * cellH + padB

  const cells = []
  for (let y = 0; y < nCoeff; y++) {
    for (let x = 0; x < nTime; x++) {
      const t = (mfcc[x][y] - min) / span
      cells.push(
        <rect key={`${x}:${y}`} x={padL + x * cellW} y={padT + y * cellH} width={cellW} height={cellH} fill={colorAt(t)} />,
      )
    }
  }

  // Each frame = 10 ms at hop_length 160 / sr 16000
  const xTicks = []
  for (let t = 0; t < nTime; t += 25) {
    xTicks.push(
      <text key={`x${t}`} x={padL + t * cellW} y={padT + nCoeff * cellH + 16} textAnchor="middle" className="mfcc-axis-text">
        {Math.round(t * 10)}
      </text>,
    )
  }

  const yTicks = []
  for (let c = 0; c < nCoeff; c += 2) {
    yTicks.push(
      <text key={`y${c}`} x={padL - 6} y={padT + c * cellH + cellH / 2 + 1} textAnchor="end" dominantBaseline="middle" className="mfcc-axis-text">
        {c + 1}
      </text>,
    )
  }

  const gradientStops = palette.map((c) => `rgb(${c[0]},${c[1]},${c[2]})`).join(', ')

  return (
    <div>
      <div className="overflow-x-auto">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="mx-auto block max-w-full" role="img" aria-label="MFCC heatmap">
          {cells}
          {xTicks}
          {yTicks}
        </svg>
      </div>
      <div className="text-muted-foreground mt-1 flex justify-between text-[11px]">
        <span>Time (ms)</span>
        <span>MFCC coefficient</span>
      </div>
      <div className="mt-3 flex items-center gap-2 px-1">
        <span className="text-muted-foreground text-[11px] tabular-nums">{min.toFixed(1)}</span>
        <div className="h-2 flex-1 rounded" style={{ background: `linear-gradient(to right, ${gradientStops})` }} />
        <span className="text-muted-foreground text-[11px] tabular-nums">{max.toFixed(1)}</span>
      </div>
    </div>
  )
}