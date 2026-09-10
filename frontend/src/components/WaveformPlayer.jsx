import { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { Pause, Play } from 'react-feather'

import { Button } from '@/components/ui/button'

function fmtTime(s) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

export function WaveformPlayer({ file }) {
  const containerRef = useRef(null)
  const wsRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    if (!containerRef.current || !file) return

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'var(--primary)',
      progressColor: 'var(--foreground)',
      cursorColor: 'var(--spoof)',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 72,
      normalize: true,
      backend: 'WebAudio',
    })

    ws.loadBlob(file)
    ws.on('ready', () => setDuration(ws.getDuration()))
    ws.on('audioprocess', () => setCurrentTime(ws.getCurrentTime()))
    ws.on('finish', () => setPlaying(false))
    wsRef.current = ws

    return () => ws.destroy()
  }, [file])

  const togglePlay = () => {
    if (!wsRef.current) return
    wsRef.current.playPause()
    setPlaying((p) => !p)
  }

  return (
    <div>
      <div ref={containerRef} className="waveform-container" />
      <div className="mt-3 flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={togglePlay} className="size-8" aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        </Button>
        <span className="text-muted-foreground font-mono text-xs tabular-nums">
          {fmtTime(currentTime)} / {fmtTime(duration)}
        </span>
      </div>
    </div>
  )
}