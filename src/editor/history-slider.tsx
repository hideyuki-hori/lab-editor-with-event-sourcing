import { useEffect, useRef, useState } from 'react'

const SCRUB_DEBOUNCE_MS = 100

type Props = {
  current: number
  head: number
  onBeginScrub: () => void
  onScrub: (version: number) => void
  onEndScrub: () => void
}

export function HistorySlider({ current, head, onBeginScrub, onScrub, onEndScrub }: Props) {
  const [local, setLocal] = useState(current)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLocal(current)
  }, [current])

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  if (head === 0) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number.parseInt(e.target.value, 10)
    setLocal(v)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onScrub(v)
      timerRef.current = null
    }, SCRUB_DEBOUNCE_MS)
  }

  return (
    <div className='flex items-center gap-2 text-xs'>
      <span className='text-gray-500'>history</span>
      <input
        type='range'
        min={0}
        max={head}
        value={local}
        onChange={handleChange}
        onMouseDown={onBeginScrub}
        onTouchStart={onBeginScrub}
        onMouseUp={onEndScrub}
        onTouchEnd={onEndScrub}
        className='flex-1'
      />
      <span className='w-12 text-right text-gray-500'>
        {local}/{head}
      </span>
    </div>
  )
}
