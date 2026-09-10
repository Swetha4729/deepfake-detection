import { useEffect, useState } from 'react'

export function useCountUp(target, { duration = 700 } = {}) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let raf
    const start = performance.now()

    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3) // ease-out cubic
      setValue(target * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return Math.round(value)
}